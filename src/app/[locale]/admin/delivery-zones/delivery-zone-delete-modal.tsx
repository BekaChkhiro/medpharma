'use client';

import { AlertTriangle } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

import { Button } from '@/components/ui';
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  ModalCloseButton,
} from '@/components/ui/modal';

import { type DeliveryZone } from './delivery-zones-content';

interface DeliveryZoneDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  zone: DeliveryZone | null;
}

export function DeliveryZoneDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  zone,
}: DeliveryZoneDeleteModalProps) {
  const t = useTranslations('admin.deliveryZones');
  const locale = useLocale();

  if (!zone) return null;

  const orderCount = zone._count?.orders || 0;
  const zoneName = locale === 'ka' ? zone.nameKa : zone.nameEn;

  return (
    <Modal open={isOpen} onClose={onClose}>
      <ModalCloseButton onClose={onClose} />
      <ModalHeader>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600/10">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex-1">
            <ModalTitle>{t('delete.title')}</ModalTitle>
            <ModalDescription className="mt-2">
              {t('delete.message')}
            </ModalDescription>
          </div>
        </div>
      </ModalHeader>

      <div className="space-y-3">
        {/* Zone Info */}
        <div className="rounded-xl border border-slate-200 bg-slate-100 p-3">
          <div className="text-sm font-medium text-slate-900">
            {zoneName}
          </div>
          <div className="text-xs text-slate-500">
            {locale === 'ka' ? zone.nameEn : zone.nameKa}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {t('delete.fee')}: {zone.fee.toFixed(2)} ₾
          </div>
        </div>

        {/* Warning */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm text-amber-800">
            {t('delete.warning')}
          </p>
        </div>

        {/* Order Count Warning */}
        {orderCount > 0 && (
          <div className="rounded-xl border border-red-600/20 bg-red-600/5 p-3">
            <p className="text-sm text-red-600">
              {t('delete.hasOrders', { count: orderCount })}
            </p>
          </div>
        )}
      </div>

      <ModalFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          {t('delete.cancel')}
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={onConfirm}
          disabled={orderCount > 0}
        >
          {t('delete.confirm')}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
