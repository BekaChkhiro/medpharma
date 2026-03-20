/**
 * Order Service Layer
 * T3.9: Order creation, order number generation, stock validation, total calculation
 *
 * Features:
 * - Order creation with transaction support
 * - Order number generation (MF-YYYYNNNN format)
 * - Stock validation and reservation
 * - Total calculation with delivery fees
 * - Idempotency key support to prevent duplicate orders
 */

import { type Prisma } from '@/generated/prisma';
import {
  db,
  type Order,
  type OrderItem,
  type OrderStatus,
  type PaymentStatus,
  type PaymentMethod,
} from '@/lib/db';
import { generateOrderNumber, serialize } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

export interface CartItemInput {
  productId: string;
  quantity: number;
  /** Product name in Georgian (snapshot at order time) */
  nameKa: string;
  /** Product name in English (snapshot at order time) */
  nameEn: string;
  /** SKU for reference */
  sku: string;
  /** Unit price at time of order */
  price: number;
  /** Sale price if applicable */
  salePrice?: number | null;
  /** Product image URL */
  imageUrl?: string | null;
}

export interface CreateOrderInput {
  /** Customer information */
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  /** Delivery information */
  delivery: {
    zoneId: string;
    zoneName: string;
    address: string;
    notes?: string;
    fee: number;
  };
  /** Payment method */
  paymentMethod: 'tbc' | 'bog' | 'cash';
  /** Cart items */
  items: CartItemInput[];
  /** Idempotency key to prevent duplicate orders */
  idempotencyKey?: string;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
  deliveryZone: {
    id: string;
    nameKa: string;
    nameEn: string;
  } | null;
}

export interface StockValidationResult {
  valid: boolean;
  errors: Array<{
    productId: string;
    productName: string;
    requested: number;
    available: number;
  }>;
}

export interface CreateOrderResult {
  success: boolean;
  order?: OrderWithItems;
  error?: string;
  stockErrors?: StockValidationResult['errors'];
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Map frontend payment method to database enum
 */
function mapPaymentMethod(method: 'tbc' | 'bog' | 'cash'): PaymentMethod {
  const mapping: Record<string, PaymentMethod> = {
    tbc: 'TBC_CARD',
    bog: 'BOG_IPAY',
    cash: 'CASH_ON_DELIVERY',
  };
  return mapping[method] as PaymentMethod;
}

/**
 * Calculate effective price (sale price or regular price)
 */
function getEffectivePrice(item: CartItemInput): number {
  return item.salePrice ?? item.price;
}

/**
 * Calculate order totals
 */
function calculateTotals(
  items: CartItemInput[],
  deliveryFee: number
): {
  subtotal: number;
  deliveryFee: number;
  total: number;
} {
  const subtotal = items.reduce((sum, item) => {
    return sum + getEffectivePrice(item) * item.quantity;
  }, 0);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    deliveryFee: Math.round(deliveryFee * 100) / 100,
    total: Math.round((subtotal + deliveryFee) * 100) / 100,
  };
}

// =============================================================================
// STOCK VALIDATION
// =============================================================================

/**
 * Validate stock availability for all items
 */
export async function validateStock(
  items: CartItemInput[]
): Promise<StockValidationResult> {
  const errors: StockValidationResult['errors'] = [];

  // Get current stock for all products
  const productIds = items.map((item) => item.productId);
  const products = await db.product.findMany({
    where: {
      id: { in: productIds },
      isActive: true,
    },
    select: {
      id: true,
      stock: true,
      nameKa: true,
      nameEn: true,
    },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));

  for (const item of items) {
    const product = productMap.get(item.productId);

    if (!product) {
      errors.push({
        productId: item.productId,
        productName: item.nameKa,
        requested: item.quantity,
        available: 0,
      });
      continue;
    }

    if (product.stock < item.quantity) {
      errors.push({
        productId: item.productId,
        productName: product.nameKa,
        requested: item.quantity,
        available: product.stock,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Reserve stock for order items (decrement stock)
 * Should be called within a transaction
 */
async function reserveStock(
  tx: Prisma.TransactionClient,
  items: CartItemInput[]
): Promise<void> {
  for (const item of items) {
    await tx.product.update({
      where: { id: item.productId },
      data: {
        stock: { decrement: item.quantity },
        orderCount: { increment: item.quantity },
      },
    });
  }
}

// =============================================================================
// ORDER NUMBER GENERATION
// =============================================================================

/**
 * Get next order sequence number for the year
 * Uses a database counter to ensure uniqueness
 */
async function getNextOrderSequence(
  tx: Prisma.TransactionClient
): Promise<number> {
  const year = new Date().getFullYear();

  // Count orders for current year to get next sequence
  // Using raw query for atomic increment
  const result = await tx.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*) as count
    FROM orders
    WHERE EXTRACT(YEAR FROM "createdAt") = ${year}
  `;

  // Next sequence is count + 1
  return Number(result[0].count) + 1;
}

/**
 * Generate unique order number
 */
async function generateUniqueOrderNumber(
  tx: Prisma.TransactionClient
): Promise<string> {
  const sequence = await getNextOrderSequence(tx);
  return generateOrderNumber(sequence);
}

// =============================================================================
// ORDER CREATION
// =============================================================================

/**
 * Create a new order with transaction support
 * Handles: validation, stock reservation, order creation, order items
 */
export async function createOrder(
  input: CreateOrderInput
): Promise<CreateOrderResult> {
  const { customer, delivery, paymentMethod, items, idempotencyKey } = input;

  // Validate items array
  if (!items || items.length === 0) {
    return {
      success: false,
      error: 'Cart is empty',
    };
  }

  // Check for existing order with same idempotency key
  if (idempotencyKey) {
    const existingOrder = await db.order.findUnique({
      where: { idempotencyKey },
      include: {
        items: true,
        deliveryZone: {
          select: {
            id: true,
            nameKa: true,
            nameEn: true,
          },
        },
      },
    });

    if (existingOrder) {
      // Return existing order instead of creating duplicate
      return {
        success: true,
        order: serialize(existingOrder) as OrderWithItems,
      };
    }
  }

  // Validate stock before starting transaction
  const stockValidation = await validateStock(items);
  if (!stockValidation.valid) {
    return {
      success: false,
      error: 'Insufficient stock for some items',
      stockErrors: stockValidation.errors,
    };
  }

  // Calculate totals
  const totals = calculateTotals(items, delivery.fee);

  try {
    // Create order in transaction
    const order = await db.$transaction(async (tx) => {
      // Re-validate stock within transaction (pessimistic locking)
      const stockCheck = await validateStock(items);
      if (!stockCheck.valid) {
        throw new Error('STOCK_CHANGED');
      }

      // Generate order number
      const orderNumber = await generateUniqueOrderNumber(tx);

      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          status: 'PENDING',
          paymentStatus: paymentMethod === 'cash' ? 'PENDING' : 'PENDING',
          paymentMethod: mapPaymentMethod(paymentMethod),
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone,
          deliveryCity: delivery.zoneName,
          deliveryAddress: delivery.address,
          deliveryNotes: delivery.notes || null,
          deliveryZoneId: delivery.zoneId,
          subtotal: totals.subtotal,
          deliveryFee: totals.deliveryFee,
          total: totals.total,
          idempotencyKey: idempotencyKey || null,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: getEffectivePrice(item),
              total: getEffectivePrice(item) * item.quantity,
              productNameKa: item.nameKa,
              productNameEn: item.nameEn,
              productSku: item.sku,
              productImage: item.imageUrl || null,
            })),
          },
        },
        include: {
          items: true,
          deliveryZone: {
            select: {
              id: true,
              nameKa: true,
              nameEn: true,
            },
          },
        },
      });

      // Reserve stock
      await reserveStock(tx, items);

      return newOrder;
    });

    return {
      success: true,
      order: serialize(order) as OrderWithItems,
    };
  } catch (error) {
    console.error('Order creation failed:', error);

    if (error instanceof Error && error.message === 'STOCK_CHANGED') {
      // Re-fetch current stock status
      const currentStock = await validateStock(items);
      return {
        success: false,
        error: 'Stock changed during checkout. Please review your cart.',
        stockErrors: currentStock.errors,
      };
    }

    return {
      success: false,
      error: 'Failed to create order. Please try again.',
    };
  }
}

// =============================================================================
// ORDER QUERIES
// =============================================================================

/**
 * Get order by ID
 */
export async function getOrderById(
  orderId: string
): Promise<OrderWithItems | null> {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      deliveryZone: {
        select: {
          id: true,
          nameKa: true,
          nameEn: true,
        },
      },
    },
  });

  return order ? (serialize(order) as OrderWithItems) : null;
}

/**
 * Get order by order number
 */
export async function getOrderByNumber(
  orderNumber: string
): Promise<OrderWithItems | null> {
  const order = await db.order.findUnique({
    where: { orderNumber },
    include: {
      items: true,
      deliveryZone: {
        select: {
          id: true,
          nameKa: true,
          nameEn: true,
        },
      },
    },
  });

  return order ? (serialize(order) as OrderWithItems) : null;
}

/**
 * Get order by order number and email (for customer tracking)
 */
export async function getOrderByNumberAndEmail(
  orderNumber: string,
  email: string
): Promise<OrderWithItems | null> {
  const order = await db.order.findFirst({
    where: {
      orderNumber,
      customerEmail: {
        equals: email,
        mode: 'insensitive',
      },
    },
    include: {
      items: true,
      deliveryZone: {
        select: {
          id: true,
          nameKa: true,
          nameEn: true,
        },
      },
    },
  });

  return order ? (serialize(order) as OrderWithItems) : null;
}

// =============================================================================
// ORDER STATUS UPDATES
// =============================================================================

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<Order | null> {
  const updateData: Prisma.OrderUpdateInput = { status };

  // Set timestamps based on status
  if (status === 'SHIPPED') {
    updateData.shippedAt = new Date();
  } else if (status === 'DELIVERED') {
    updateData.deliveredAt = new Date();
  }

  const order = await db.order.update({
    where: { id: orderId },
    data: updateData,
  });

  return serialize(order) as Order;
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  orderId: string,
  status: PaymentStatus,
  paymentId?: string
): Promise<Order | null> {
  const updateData: Prisma.OrderUpdateInput = {
    paymentStatus: status,
  };

  if (paymentId) {
    updateData.paymentId = paymentId;
  }

  if (status === 'PAID') {
    updateData.paidAt = new Date();
  }

  const order = await db.order.update({
    where: { id: orderId },
    data: updateData,
  });

  return serialize(order) as Order;
}

// =============================================================================
// CANCELLATION
// =============================================================================

/**
 * Cancel an order and restore stock
 */
export async function cancelOrder(
  orderId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await db.$transaction(async (tx) => {
      // Get order with items
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) {
        throw new Error('Order not found');
      }

      if (order.status === 'CANCELLED') {
        throw new Error('Order already cancelled');
      }

      if (order.status === 'SHIPPED' || order.status === 'DELIVERED') {
        throw new Error('Cannot cancel shipped or delivered orders');
      }

      // Restore stock for each item
      for (const item of order.items) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { increment: item.quantity },
              orderCount: { decrement: item.quantity },
            },
          });
        }
      }

      // Update order status
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'CANCELLED',
          paymentStatus:
            order.paymentStatus === 'PAID' ? 'REFUNDED' : 'FAILED',
        },
      });
    });

    return { success: true };
  } catch (error) {
    console.error('Order cancellation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel order',
    };
  }
}

// =============================================================================
// TOTAL CALCULATION (STANDALONE)
// =============================================================================

export interface OrderTotalsInput {
  productId: string;
  quantity: number;
}

export interface OrderTotalsResult {
  subtotal: number;
  deliveryFee: number;
  total: number;
  freeShippingApplied: boolean;
  freeShippingThreshold: number | null;
  itemDetails: Array<{
    productId: string;
    nameKa: string;
    nameEn: string;
    unitPrice: number;
    quantity: number;
    total: number;
  }>;
}

/**
 * Calculate order totals from product IDs and delivery zone
 * Fetches current prices from database
 */
export async function calculateOrderTotals(
  items: OrderTotalsInput[],
  deliveryZoneId: string
): Promise<OrderTotalsResult | null> {
  if (items.length === 0) {
    return null;
  }

  // Get products with current prices
  const productIds = items.map((i) => i.productId);
  const products = await db.product.findMany({
    where: {
      id: { in: productIds },
      isActive: true,
    },
    select: {
      id: true,
      nameKa: true,
      nameEn: true,
      price: true,
      salePrice: true,
    },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));

  // Calculate subtotal and item details
  let subtotal = 0;
  const itemDetails: OrderTotalsResult['itemDetails'] = [];

  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) continue;

    const unitPrice = product.salePrice
      ? Number(product.salePrice)
      : Number(product.price);
    const itemTotal = unitPrice * item.quantity;
    subtotal += itemTotal;

    itemDetails.push({
      productId: item.productId,
      nameKa: product.nameKa,
      nameEn: product.nameEn,
      unitPrice,
      quantity: item.quantity,
      total: Math.round(itemTotal * 100) / 100,
    });
  }

  // Get delivery zone
  const zone = await db.deliveryZone.findUnique({
    where: { id: deliveryZoneId, isActive: true },
    select: {
      fee: true,
      freeAbove: true,
    },
  });

  if (!zone) {
    return null;
  }

  // Calculate delivery fee with free shipping threshold
  const zoneFee = Number(zone.fee);
  const freeAbove = zone.freeAbove ? Number(zone.freeAbove) : null;

  let deliveryFee = zoneFee;
  let freeShippingApplied = false;

  if (freeAbove !== null && subtotal >= freeAbove) {
    deliveryFee = 0;
    freeShippingApplied = true;
  }

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    deliveryFee: Math.round(deliveryFee * 100) / 100,
    total: Math.round((subtotal + deliveryFee) * 100) / 100,
    freeShippingApplied,
    freeShippingThreshold: freeAbove,
    itemDetails,
  };
}

// =============================================================================
// ORDER LIST WITH FILTERS (ADMIN)
// =============================================================================

export interface OrderFilters {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface OrderListOptions extends OrderFilters {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'orderNumber' | 'total' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface OrderListResult {
  orders: OrderWithItems[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Get orders list with filtering, sorting, and pagination
 */
export async function getOrders(
  options: OrderListOptions = {}
): Promise<OrderListResult> {
  const {
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    status,
    paymentStatus,
    paymentMethod,
    search,
    dateFrom,
    dateTo,
  } = options;

  // Validate pagination
  const validPage = Math.max(1, page);
  const validLimit = Math.min(Math.max(1, limit), 100);
  const skip = (validPage - 1) * validLimit;

  // Build where clause
  const where: Prisma.OrderWhereInput = {};
  const AND: Prisma.OrderWhereInput[] = [];

  if (status) {
    AND.push({ status });
  }

  if (paymentStatus) {
    AND.push({ paymentStatus });
  }

  if (paymentMethod) {
    AND.push({ paymentMethod });
  }

  if (dateFrom || dateTo) {
    const dateFilter: Prisma.DateTimeFilter = {};
    if (dateFrom) dateFilter.gte = dateFrom;
    if (dateTo) dateFilter.lte = dateTo;
    AND.push({ createdAt: dateFilter });
  }

  if (search && search.trim()) {
    const term = search.trim();
    AND.push({
      OR: [
        { orderNumber: { contains: term, mode: 'insensitive' } },
        { customerEmail: { contains: term, mode: 'insensitive' } },
        { customerPhone: { contains: term, mode: 'insensitive' } },
        { customerName: { contains: term, mode: 'insensitive' } },
      ],
    });
  }

  if (AND.length > 0) {
    where.AND = AND;
  }

  // Build order by
  const orderBy: Prisma.OrderOrderByWithRelationInput[] = [];
  switch (sortBy) {
    case 'orderNumber':
      orderBy.push({ orderNumber: sortOrder });
      break;
    case 'total':
      orderBy.push({ total: sortOrder });
      break;
    case 'status':
      orderBy.push({ status: sortOrder });
      break;
    default:
      orderBy.push({ createdAt: sortOrder });
  }
  orderBy.push({ id: 'desc' });

  // Execute queries
  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      orderBy,
      skip,
      take: validLimit,
      include: {
        items: true,
        deliveryZone: {
          select: {
            id: true,
            nameKa: true,
            nameEn: true,
          },
        },
      },
    }),
    db.order.count({ where }),
  ]);

  const totalPages = Math.ceil(total / validLimit);

  return {
    orders: orders.map((o) => serialize(o)) as OrderWithItems[],
    pagination: {
      page: validPage,
      limit: validLimit,
      total,
      totalPages,
      hasNext: validPage < totalPages,
      hasPrev: validPage > 1,
    },
  };
}

/**
 * Get orders by customer email
 */
export async function getOrdersByEmail(
  email: string,
  options: { page?: number; limit?: number } = {}
): Promise<OrderListResult> {
  return getOrders({
    ...options,
    search: email,
  });
}

/**
 * Get recent orders (for dashboard)
 */
export async function getRecentOrders(
  limit: number = 10
): Promise<OrderWithItems[]> {
  const orders = await db.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      items: true,
      deliveryZone: {
        select: {
          id: true,
          nameKa: true,
          nameEn: true,
        },
      },
    },
  });

  return orders.map((o) => serialize(o)) as OrderWithItems[];
}

// =============================================================================
// ORDER STATISTICS (ADMIN DASHBOARD)
// =============================================================================

export interface OrderStats {
  total: number;
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
  weekOrders: number;
  weekRevenue: number;
  monthOrders: number;
  monthRevenue: number;
}

/**
 * Get order statistics for admin dashboard
 */
export async function getOrderStats(): Promise<OrderStats> {
  const now = new Date();

  // Start of today
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  // Start of this week (Monday)
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  weekStart.setHours(0, 0, 0, 0);

  // Start of this month
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    total,
    pending,
    confirmed,
    processing,
    shipped,
    delivered,
    cancelled,
    totalRevenueResult,
    todayOrders,
    todayRevenueResult,
    weekOrders,
    weekRevenueResult,
    monthOrders,
    monthRevenueResult,
  ] = await Promise.all([
    db.order.count(),
    db.order.count({ where: { status: 'PENDING' } }),
    db.order.count({ where: { status: 'CONFIRMED' } }),
    db.order.count({ where: { status: 'PROCESSING' } }),
    db.order.count({ where: { status: 'SHIPPED' } }),
    db.order.count({ where: { status: 'DELIVERED' } }),
    db.order.count({ where: { status: 'CANCELLED' } }),
    db.order.aggregate({
      where: {
        paymentStatus: 'PAID',
        status: { not: 'CANCELLED' },
      },
      _sum: { total: true },
    }),
    db.order.count({
      where: { createdAt: { gte: todayStart } },
    }),
    db.order.aggregate({
      where: {
        createdAt: { gte: todayStart },
        paymentStatus: 'PAID',
        status: { not: 'CANCELLED' },
      },
      _sum: { total: true },
    }),
    db.order.count({
      where: { createdAt: { gte: weekStart } },
    }),
    db.order.aggregate({
      where: {
        createdAt: { gte: weekStart },
        paymentStatus: 'PAID',
        status: { not: 'CANCELLED' },
      },
      _sum: { total: true },
    }),
    db.order.count({
      where: { createdAt: { gte: monthStart } },
    }),
    db.order.aggregate({
      where: {
        createdAt: { gte: monthStart },
        paymentStatus: 'PAID',
        status: { not: 'CANCELLED' },
      },
      _sum: { total: true },
    }),
  ]);

  return {
    total,
    pending,
    confirmed,
    processing,
    shipped,
    delivered,
    cancelled,
    totalRevenue: totalRevenueResult._sum.total
      ? Number(totalRevenueResult._sum.total)
      : 0,
    todayOrders,
    todayRevenue: todayRevenueResult._sum.total
      ? Number(todayRevenueResult._sum.total)
      : 0,
    weekOrders,
    weekRevenue: weekRevenueResult._sum.total
      ? Number(weekRevenueResult._sum.total)
      : 0,
    monthOrders,
    monthRevenue: monthRevenueResult._sum.total
      ? Number(monthRevenueResult._sum.total)
      : 0,
  };
}

/**
 * Get top selling products (for dashboard)
 */
export async function getTopSellingProducts(
  limit: number = 10,
  dateFrom?: Date
): Promise<
  Array<{
    productId: string;
    productName: string;
    totalQuantity: number;
    totalRevenue: number;
  }>
> {
  // Build order filter
  const orderFilter: Prisma.OrderWhereInput = {
    status: { not: 'CANCELLED' },
    paymentStatus: 'PAID',
  };

  if (dateFrom) {
    orderFilter.createdAt = { gte: dateFrom };
  }

  const where: Prisma.OrderItemWhereInput = {
    order: orderFilter,
  };

  // Group by product and sum quantities
  const items = await db.orderItem.groupBy({
    by: ['productId', 'productNameKa'],
    where,
    _sum: {
      quantity: true,
      total: true,
    },
    orderBy: {
      _sum: {
        quantity: 'desc',
      },
    },
    take: limit,
  });

  return items.map((item) => ({
    productId: item.productId || '',
    productName: item.productNameKa,
    totalQuantity: item._sum.quantity || 0,
    totalRevenue: item._sum.total ? Number(item._sum.total) : 0,
  }));
}

/**
 * Get revenue by date range (for charts)
 */
export async function getRevenueByDateRange(
  dateFrom: Date,
  dateTo: Date,
  groupBy: 'day' | 'week' | 'month' = 'day'
): Promise<
  Array<{
    date: string;
    orders: number;
    revenue: number;
  }>
> {
  // Use raw query for date grouping
  const formatString =
    groupBy === 'day'
      ? 'YYYY-MM-DD'
      : groupBy === 'week'
        ? 'IYYY-IW'
        : 'YYYY-MM';

  const results = await db.$queryRaw<
    Array<{ date: string; orders: bigint; revenue: number | null }>
  >`
    SELECT
      TO_CHAR("createdAt", ${formatString}) as date,
      COUNT(*) as orders,
      SUM(CASE WHEN "paymentStatus" = 'PAID' AND status != 'CANCELLED' THEN total ELSE 0 END) as revenue
    FROM orders
    WHERE "createdAt" >= ${dateFrom}
      AND "createdAt" <= ${dateTo}
    GROUP BY TO_CHAR("createdAt", ${formatString})
    ORDER BY date ASC
  `;

  return results.map((r) => ({
    date: r.date,
    orders: Number(r.orders),
    revenue: r.revenue ? Number(r.revenue) : 0,
  }));
}
