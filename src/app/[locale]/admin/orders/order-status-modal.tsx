'use client';

import { useState } from 'react';

import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button, Input, Select, Modal, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  courierName: string | null;
  courierPhone: string | null;
  trackingCode: string | null;
}

interface OrderStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onUpdated: () => void;
}

const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
];

const PAYMENT_STATUSES = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];

const STATUS_KEY_MAP: Record<string, string> = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
};

const PAYMENT_STATUS_KEY_MAP: Record<string, string> = {
  PENDING: 'paymentPending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'paymentRefunded',
};

export function OrderStatusModal({
  isOpen,
  onClose,
  order,
  onUpdated,
}: OrderStatusModalProps) {
  const t = useTranslations('admin.orders');
  const tCommon = useTranslations('common');

  const [status, setStatus] = useState(order.status);
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus);
  const [courierName, setCourierName] = useState(order.courierName || '');
  const [courierPhone, setCourierPhone] = useState(order.courierPhone || '');
  const [trackingCode, setTrackingCode] = useState(order.trackingCode || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          paymentStatus,
          courierName: courierName || null,
          courierPhone: courierPhone || null,
          trackingCode: trackingCode || null,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        <ModalTitle>
          {t('detail.updateStatus')} - #{order.orderNumber}
        </ModalTitle>
      </ModalHeader>
      <form onSubmit={handleSubmit}>
        <div>
          <div className="space-y-4">
            {error && (
              <div className="rounded-xl border border-red-600/20 bg-red-600/5 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium">{t('status')}</label>
              <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {t(`statuses.${STATUS_KEY_MAP[s] || s}`)}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">{t('paymentStatus')}</label>
              <Select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
              >
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {t(`paymentStatuses.${PAYMENT_STATUS_KEY_MAP[s] || s}`)}
                  </option>
                ))}
              </Select>
            </div>

            {(status === 'SHIPPED' || status === 'DELIVERED') && (
              <>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    {t('detail.courierName')}
                  </label>
                  <Input
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    {t('detail.courierPhone')}
                  </label>
                  <Input
                    value={courierPhone}
                    onChange={(e) => setCourierPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    {t('detail.trackingCode')}
                  </label>
                  <Input
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" type="button" onClick={onClose}>
            {tCommon('cancel')}
          </Button>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('detail.updateStatus')}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
