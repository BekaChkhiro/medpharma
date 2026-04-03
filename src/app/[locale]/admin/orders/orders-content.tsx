'use client';

import { useState, useEffect, useCallback } from 'react';

import {
  Loader2,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  Package,
  X,
  Truck,
  Filter,
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

import { Button, Input, Badge, Select } from '@/components/ui';

import { OrderDetailModal } from './order-detail-modal';
import { OrderStatusModal } from './order-status-modal';

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  total: number;
  productNameKa: string;
  productNameEn: string;
  productSku: string;
  productImage: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryCity: string;
  deliveryAddress: string;
  deliveryNotes: string | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
  courierName: string | null;
  courierPhone: string | null;
  trackingCode: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  deliveryZone?: { nameKa: string; nameEn: string } | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function OrdersContent() {
  const t = useTranslations('admin.orders');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Modals
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const fetchOrders = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      if (searchQuery) params.set('search', searchQuery);
      if (statusFilter) params.set('status', statusFilter);
      if (paymentFilter) params.set('paymentStatus', paymentFilter);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);

      const response = await fetch(`/api/admin/orders?${params}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setOrders(data.data || []);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, paymentFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleChangeStatus = (order: Order) => {
    setSelectedOrder(order);
    setShowStatusModal(true);
  };

  const handleStatusUpdated = () => {
    fetchOrders(pagination.page);
    setShowStatusModal(false);
    setSelectedOrder(null);
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, 'secondary' | 'warning' | 'success' | 'error'> = {
      PENDING: 'warning',
      CONFIRMED: 'secondary',
      PROCESSING: 'secondary',
      SHIPPED: 'secondary',
      DELIVERED: 'success',
      CANCELLED: 'error',
      REFUNDED: 'error',
    };
    return map[status] || 'secondary';
  };

  const getPaymentBadge = (status: string) => {
    const map: Record<string, 'secondary' | 'warning' | 'success' | 'error'> = {
      PENDING: 'warning',
      PAID: 'success',
      FAILED: 'error',
      REFUNDED: 'error',
    };
    return map[status] || 'secondary';
  };

  const statusKey = (s: string) => {
    const map: Record<string, string> = {
      PENDING: 'pending',
      CONFIRMED: 'confirmed',
      PROCESSING: 'processing',
      SHIPPED: 'shipped',
      DELIVERED: 'delivered',
      CANCELLED: 'cancelled',
      REFUNDED: 'refunded',
    };
    return map[s] || s;
  };

  const paymentStatusKey = (s: string) => {
    const map: Record<string, string> = {
      PENDING: 'paymentPending',
      PAID: 'paid',
      FAILED: 'failed',
      REFUNDED: 'paymentRefunded',
    };
    return map[s] || s;
  };

  const paymentMethodKey = (s: string) => {
    const map: Record<string, string> = {
      TBC_CARD: 'tbcCard',
      BOG_IPAY: 'bogIpay',
      CASH_ON_DELIVERY: 'cashOnDelivery',
    };
    return map[s] || s;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(locale === 'ka' ? 'ka-GE' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => `${amount.toFixed(2)} ₾`;

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setPaymentFilter('');
    setDateFrom('');
    setDateTo('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t('title')}</h1>
        <p className="mt-1 text-slate-500">{t('subtitle')}</p>
      </div>

      {/* Search & Filters Toggle */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant={showFilters ? 'default' : 'outline'}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="mr-2 h-4 w-4" />
          {t('filters.filterByStatus')}
        </Button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="rounded-xl border border-slate-200 bg-[#FDFBF7] p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-900">
                {t('filters.filterByStatus')}
              </label>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">{tCommon('all')}</option>
                <option value="PENDING">{t('statuses.pending')}</option>
                <option value="CONFIRMED">{t('statuses.confirmed')}</option>
                <option value="PROCESSING">{t('statuses.processing')}</option>
                <option value="SHIPPED">{t('statuses.shipped')}</option>
                <option value="DELIVERED">{t('statuses.delivered')}</option>
                <option value="CANCELLED">{t('statuses.cancelled')}</option>
                <option value="REFUNDED">{t('statuses.refunded')}</option>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-900">
                {t('filters.filterByPayment')}
              </label>
              <Select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
              >
                <option value="">{tCommon('all')}</option>
                <option value="PENDING">{t('paymentStatuses.paymentPending')}</option>
                <option value="PAID">{t('paymentStatuses.paid')}</option>
                <option value="FAILED">{t('paymentStatuses.failed')}</option>
                <option value="REFUNDED">{t('paymentStatuses.paymentRefunded')}</option>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-900">
                {t('filters.dateFrom')}
              </label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-900">
                {t('filters.dateTo')}
              </label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="mr-1 h-3 w-3" />
              {t('filters.clearFilters')}
            </Button>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#df2b1b]" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-600/20 bg-red-600/5 p-4 text-red-600">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && orders.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 p-12 text-center">
          <Package className="mx-auto h-12 w-12 text-slate-500" />
          <h3 className="mt-4 text-lg font-medium text-slate-900">
            {t('noOrders')}
          </h3>
        </div>
      )}

      {/* Orders Table */}
      {!loading && !error && orders.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-[#FDFBF7]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    {t('orderNumber')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    {t('customer')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    {t('date')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    {t('status')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    {t('paymentStatus')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    {t('total')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    {t('items')}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-100/50">
                    <td className="whitespace-nowrap px-4 py-4">
                      <span className="font-mono text-sm font-medium text-slate-900">
                        {order.orderNumber}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <div>
                        <div className="font-medium text-slate-900">
                          {order.customerName}
                        </div>
                        <div className="text-xs text-slate-500">
                          {order.customerPhone}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <Badge variant={getStatusBadge(order.status)}>
                        {t(`statuses.${statusKey(order.status)}`)}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <Badge variant={getPaymentBadge(order.paymentStatus)}>
                        {t(`paymentStatuses.${paymentStatusKey(order.paymentStatus)}`)}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-900">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-slate-500">
                      {order.items.length}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetail(order)}
                          title={t('actionButtons.viewDetails')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleChangeStatus(order)}
                          title={t('actionButtons.changeStatus')}
                        >
                          <Truck className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
              <div className="text-sm text-slate-500">
                {(pagination.page - 1) * pagination.limit + 1}-
                {Math.min(pagination.page * pagination.limit, pagination.total)}{' '}
                / {pagination.total}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchOrders(pagination.page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchOrders(pagination.page + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          locale={locale}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          paymentMethodKey={paymentMethodKey}
          statusKey={statusKey}
          paymentStatusKey={paymentStatusKey}
          getStatusBadge={getStatusBadge}
          getPaymentBadge={getPaymentBadge}
        />
      )}

      {/* Status Modal */}
      {selectedOrder && (
        <OrderStatusModal
          isOpen={showStatusModal}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          onUpdated={handleStatusUpdated}
        />
      )}
    </div>
  );
}
