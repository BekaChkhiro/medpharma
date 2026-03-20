'use client';

import { useState, useEffect } from 'react';

import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button, Input } from '@/components/ui';
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalFooter,
  ModalCloseButton,
} from '@/components/ui/modal';

import { type DeliveryZone, type DeliveryZoneFormData } from './delivery-zones-content';

interface DeliveryZoneFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DeliveryZoneFormData) => Promise<void>;
  zone: DeliveryZone | null;
}

export function DeliveryZoneFormModal({
  isOpen,
  onClose,
  onSubmit,
  zone,
}: DeliveryZoneFormModalProps) {
  const t = useTranslations('admin.deliveryZones');
  const tCommon = useTranslations('common');

  const [formData, setFormData] = useState<DeliveryZoneFormData>({
    nameKa: '',
    nameEn: '',
    fee: 0,
    minOrder: null,
    freeAbove: null,
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form data when zone changes
  useEffect(() => {
    if (zone) {
      setFormData({
        nameKa: zone.nameKa,
        nameEn: zone.nameEn,
        fee: zone.fee,
        minOrder: zone.minOrder,
        freeAbove: zone.freeAbove,
        isActive: zone.isActive,
      });
    } else {
      setFormData({
        nameKa: '',
        nameEn: '',
        fee: 0,
        minOrder: null,
        freeAbove: null,
        isActive: true,
      });
    }
    setError(null);
  }, [zone, isOpen]);

  const handleChange = (field: keyof DeliveryZoneFormData, value: string | number | boolean | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNumberChange = (field: 'fee' | 'minOrder' | 'freeAbove', value: string) => {
    if (field === 'fee') {
      // Fee is required, default to 0 if empty
      const numValue = value === '' ? 0 : parseFloat(value);
      handleChange(field, isNaN(numValue) ? 0 : numValue);
    } else {
      // minOrder and freeAbove are optional
      if (value === '') {
        handleChange(field, null);
      } else {
        const numValue = parseFloat(value);
        handleChange(field, isNaN(numValue) ? null : numValue);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.nameKa.trim() || !formData.nameEn.trim()) {
        throw new Error(t('form.nameRequired'));
      }

      if (formData.fee < 0) {
        throw new Error(t('form.feeNonNegative'));
      }

      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('messages.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} className="max-w-lg">
      <ModalCloseButton onClose={onClose} />
      <form onSubmit={handleSubmit}>
        <ModalHeader>
          <ModalTitle>
            {zone ? t('editZone') : t('createZone')}
          </ModalTitle>
        </ModalHeader>

        <div className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Names Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[var(--foreground)]">
              {t('form.zoneInfo')}
            </h3>

            {/* English Name */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                {t('form.nameEn')} <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.nameEn}
                onChange={(e) => handleChange('nameEn', e.target.value)}
                required
                placeholder="e.g., Tbilisi"
              />
            </div>

            {/* Georgian Name */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                {t('form.nameKa')} <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.nameKa}
                onChange={(e) => handleChange('nameKa', e.target.value)}
                required
                placeholder="მაგ., თბილისი"
              />
            </div>
          </div>

          {/* Pricing Section */}
          <div className="space-y-4 border-t border-[var(--border)] pt-6">
            <h3 className="text-sm font-medium text-[var(--foreground)]">
              {t('form.pricingInfo')}
            </h3>

            {/* Delivery Fee */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                {t('form.fee')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.fee}
                  onChange={(e) => handleNumberChange('fee', e.target.value)}
                  required
                  className="pr-10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted-foreground)]">
                  ₾
                </span>
              </div>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                {t('form.feeHint')}
              </p>
            </div>

            {/* Minimum Order */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                {t('form.minOrder')}
              </label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.minOrder ?? ''}
                  onChange={(e) => handleNumberChange('minOrder', e.target.value)}
                  className="pr-10"
                  placeholder={t('form.optional')}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted-foreground)]">
                  ₾
                </span>
              </div>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                {t('form.minOrderHint')}
              </p>
            </div>

            {/* Free Delivery Above */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                {t('form.freeAbove')}
              </label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.freeAbove ?? ''}
                  onChange={(e) => handleNumberChange('freeAbove', e.target.value)}
                  className="pr-10"
                  placeholder={t('form.optional')}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted-foreground)]">
                  ₾
                </span>
              </div>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                {t('form.freeAboveHint')}
              </p>
            </div>
          </div>

          {/* Status Section */}
          <div className="border-t border-[var(--border)] pt-6">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleChange('isActive', e.target.checked)}
                className="h-4 w-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-2 focus:ring-[var(--ring)]"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-[var(--foreground)]">
                {t('form.isActive')}
              </label>
            </div>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {t('form.isActiveHint')}
            </p>
          </div>
        </div>

        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            {tCommon('cancel')}
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {zone ? t('updateZone') : t('createZone')}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
