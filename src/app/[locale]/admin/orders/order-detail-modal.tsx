'use client';

import { useTranslations } from 'next-intl';

import { Modal, ModalHeader, ModalTitle, ModalFooter, Badge, Button } from '@/components/ui';

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
  items: OrderItem[];
  deliveryZone?: { nameKa: string; nameEn: string } | null;
}

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  locale: string;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
  paymentMethodKey: (s: string) => string;
  statusKey: (s: string) => string;
  paymentStatusKey: (s: string) => string;
  getStatusBadge: (s: string) => 'secondary' | 'warning' | 'success' | 'error';
  getPaymentBadge: (s: string) => 'secondary' | 'warning' | 'success' | 'error';
}

export function OrderDetailModal({
  isOpen,
  onClose,
  order,
  locale,
  formatCurrency,
  formatDate,
  paymentMethodKey,
  statusKey,
  paymentStatusKey,
  getStatusBadge,
  getPaymentBadge,
}: OrderDetailModalProps) {
  const t = useTranslations('admin.orders');
  const tCommon = useTranslations('common');
  const tCart = useTranslations('cart');

  const getProductName = (item: OrderItem) =>
    locale === 'ka' ? item.productNameKa : item.productNameEn;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        <ModalTitle>{t('detail.orderDetail')} #{order.orderNumber}</ModalTitle>
      </ModalHeader>
      <div>
        <div className="space-y-6">
          {/* Status Row */}
          <div className="flex flex-wrap gap-3">
            <Badge variant={getStatusBadge(order.status)}>
              {t(`statuses.${statusKey(order.status)}`)}
            </Badge>
            <Badge variant={getPaymentBadge(order.paymentStatus)}>
              {t(`paymentStatuses.${paymentStatusKey(order.paymentStatus)}`)}
            </Badge>
            <Badge variant="secondary">
              {t(`paymentMethods.${paymentMethodKey(order.paymentMethod)}`)}
            </Badge>
          </div>

          {/* Customer Info */}
          <div>
            <h4 className="mb-2 text-sm font-semibold text-slate-900">
              {t('detail.customerInfo')}
            </h4>
            <div className="rounded-xl border border-slate-200 p-3 text-sm">
              <p><span className="text-slate-500">{t('customer')}:</span> {order.customerName}</p>
              <p><span className="text-slate-500">{tCommon('details')}:</span> {order.customerEmail}</p>
              <p><span className="text-slate-500">{t('date')}:</span> {formatDate(order.createdAt)}</p>
            </div>
          </div>

          {/* Delivery Info */}
          <div>
            <h4 className="mb-2 text-sm font-semibold text-slate-900">
              {t('detail.deliveryInfo')}
            </h4>
            <div className="rounded-xl border border-slate-200 p-3 text-sm">
              <p>{order.deliveryCity}, {order.deliveryAddress}</p>
              {order.deliveryZone && (
                <p className="text-slate-500">
                  {locale === 'ka' ? order.deliveryZone.nameKa : order.deliveryZone.nameEn}
                </p>
              )}
              {order.deliveryNotes && (
                <p className="mt-1 text-slate-500">{order.deliveryNotes}</p>
              )}
            </div>
          </div>

          {/* Courier Info */}
          {(order.courierName || order.trackingCode) && (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-slate-900">
                {t('detail.courierInfo')}
              </h4>
              <div className="rounded-xl border border-slate-200 p-3 text-sm">
                {order.courierName && (
                  <p><span className="text-slate-500">{t('detail.courierName')}:</span> {order.courierName}</p>
                )}
                {order.courierPhone && (
                  <p><span className="text-slate-500">{t('detail.courierPhone')}:</span> {order.courierPhone}</p>
                )}
                {order.trackingCode && (
                  <p><span className="text-slate-500">{t('detail.trackingCode')}:</span> {order.trackingCode}</p>
                )}
              </div>
            </div>
          )}

          {/* Order Items */}
          <div>
            <h4 className="mb-2 text-sm font-semibold text-slate-900">
              {t('detail.orderItems')}
            </h4>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                      {t('items')}
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-slate-500">
                      #
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">
                      {t('total')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-3 py-2">
                        <div className="font-medium">{getProductName(item)}</div>
                        <div className="text-xs text-slate-500">
                          SKU: {item.productSku} &middot; {formatCurrency(item.unitPrice)}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center">{item.quantity}</td>
                      <td className="px-3 py-2 text-right font-medium">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="rounded-xl border border-slate-200 p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">{tCart('subtotal')}</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{tCart('delivery')}</span>
              <span>{formatCurrency(order.deliveryFee)}</span>
            </div>
            <div className="mt-1 flex justify-between border-t border-slate-200 pt-1 font-semibold">
              <span>{t('total')}</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
      <ModalFooter>
        <Button variant="outline" onClick={onClose}>{tCommon('close')}</Button>
      </ModalFooter>
    </Modal>
  );
}
