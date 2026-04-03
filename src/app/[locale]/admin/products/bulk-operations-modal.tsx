'use client';

import { useState } from 'react';

import { DollarSign, ToggleLeft, Percent, Hash, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  ModalCloseButton,
} from '@/components/ui/modal';
import { Select } from '@/components/ui/select';

type OperationType = 'price' | 'status';
type PriceOperation = 'percentage' | 'fixed' | 'set';
type StatusOperation = 'activate' | 'deactivate' | 'toggleFeatured';

interface BulkOperationsModalProps {
  isOpen: boolean;
  onClose: (refresh?: boolean) => void;
  selectedIds: string[];
  selectedProducts: Array<{ id: string; nameEn: string; price: number }>;
}

export function BulkOperationsModal({
  isOpen,
  onClose,
  selectedIds,
  selectedProducts,
}: BulkOperationsModalProps) {
  const t = useTranslations('admin.products.bulk');
  const [operationType, setOperationType] = useState<OperationType>('price');
  const [priceOperation, setPriceOperation] = useState<PriceOperation>('percentage');
  const [statusOperation, setStatusOperation] = useState<StatusOperation>('activate');
  const [priceValue, setPriceValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setIsProcessing(true);

    try {
      const payload: Record<string, unknown> = {
        productIds: selectedIds,
        operationType,
      };

      if (operationType === 'price') {
        const value = parseFloat(priceValue);
        if (isNaN(value)) {
          setError(t('errors.invalidNumber'));
          setIsProcessing(false);
          return;
        }
        payload.priceOperation = priceOperation;
        payload.priceValue = value;
      } else {
        payload.statusOperation = statusOperation;
      }

      const response = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to perform bulk operation');
      }

      setResult({
        success: data.data.updated,
        failed: data.data.failed || 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setOperationType('price');
    setPriceOperation('percentage');
    setStatusOperation('activate');
    setPriceValue('');
    setError(null);
    setResult(null);
    onClose(result !== null);
  };

  // Calculate price preview
  const getPricePreview = () => {
    if (!priceValue || isNaN(parseFloat(priceValue))) return null;
    const value = parseFloat(priceValue);

    return selectedProducts.slice(0, 3).map((product) => {
      let newPrice = product.price;

      if (priceOperation === 'percentage') {
        newPrice = product.price * (1 + value / 100);
      } else if (priceOperation === 'fixed') {
        newPrice = product.price + value;
      } else {
        newPrice = value;
      }

      return {
        name: product.nameEn,
        oldPrice: product.price,
        newPrice: Math.max(0, newPrice),
      };
    });
  };

  const pricePreview = getPricePreview();

  if (result) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} size="md">
        <ModalCloseButton onClose={handleClose} />
        <ModalHeader>
          <ModalTitle>{t('success.title')}</ModalTitle>
        </ModalHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <div className="text-center">
            <p className="text-lg font-medium text-slate-900">
              {t('success.updated', { count: result.success })}
            </p>
            {result.failed > 0 && (
              <p className="mt-1 text-sm text-red-600">
                {t('success.failed', { count: result.failed })}
              </p>
            )}
          </div>
        </div>
        <ModalFooter>
          <Button onClick={handleClose}>{t('success.done')}</Button>
        </ModalFooter>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalCloseButton onClose={handleClose} />
      <ModalHeader>
        <ModalTitle>{t('title')}</ModalTitle>
        <ModalDescription>
          {t('description', { count: selectedIds.length })}
        </ModalDescription>
      </ModalHeader>

      <div className="space-y-6 py-4">
        {/* Operation Type Tabs */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setOperationType('price')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl border-2 p-4 transition-colors ${
              operationType === 'price'
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-slate-200 hover:border-slate-200'
            }`}
          >
            <DollarSign className="h-5 w-5" />
            <span className="font-medium">{t('tabs.price')}</span>
          </button>
          <button
            type="button"
            onClick={() => setOperationType('status')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl border-2 p-4 transition-colors ${
              operationType === 'status'
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-slate-200 hover:border-slate-200'
            }`}
          >
            <ToggleLeft className="h-5 w-5" />
            <span className="font-medium">{t('tabs.status')}</span>
          </button>
        </div>

        {/* Price Operations */}
        {operationType === 'price' && (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-900">
                {t('price.operationType')}
              </label>
              <Select
                value={priceOperation}
                onChange={(e) => setPriceOperation(e.target.value as PriceOperation)}
              >
                <option value="percentage">{t('price.percentage')}</option>
                <option value="fixed">{t('price.fixed')}</option>
                <option value="set">{t('price.set')}</option>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-900">
                {priceOperation === 'percentage'
                  ? t('price.percentageValue')
                  : priceOperation === 'fixed'
                  ? t('price.fixedValue')
                  : t('price.setValue')}
              </label>
              <div className="relative">
                {priceOperation === 'percentage' ? (
                  <Percent className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                ) : (
                  <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                )}
                <Input
                  type="number"
                  step="0.01"
                  value={priceValue}
                  onChange={(e) => setPriceValue(e.target.value)}
                  className="pl-10"
                  placeholder={
                    priceOperation === 'percentage'
                      ? t('price.percentagePlaceholder')
                      : t('price.valuePlaceholder')
                  }
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {priceOperation === 'percentage' && t('price.percentageHint')}
                {priceOperation === 'fixed' && t('price.fixedHint')}
                {priceOperation === 'set' && t('price.setHint')}
              </p>
            </div>

            {/* Price Preview */}
            {pricePreview && pricePreview.length > 0 && (
              <div className="rounded-xl border bg-slate-100 p-4">
                <p className="mb-2 text-sm font-medium text-slate-900">
                  {t('price.preview')}
                </p>
                <div className="space-y-2">
                  {pricePreview.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="truncate text-slate-500">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 line-through">
                          ₾{item.oldPrice.toFixed(2)}
                        </span>
                        <span className="font-medium text-green-600">
                          ₾{item.newPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {selectedProducts.length > 3 && (
                    <p className="text-xs text-slate-500">
                      {t('price.andMore', { count: selectedProducts.length - 3 })}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Status Operations */}
        {operationType === 'status' && (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-900">
                {t('status.operationType')}
              </label>
              <div className="space-y-2">
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border p-3 hover:bg-slate-100">
                  <input
                    type="radio"
                    name="statusOperation"
                    value="activate"
                    checked={statusOperation === 'activate'}
                    onChange={(e) => setStatusOperation(e.target.value as StatusOperation)}
                    className="h-4 w-4 text-primary"
                  />
                  <div>
                    <p className="font-medium text-slate-900">{t('status.activate')}</p>
                    <p className="text-sm text-slate-500">{t('status.activateDesc')}</p>
                  </div>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border p-3 hover:bg-slate-100">
                  <input
                    type="radio"
                    name="statusOperation"
                    value="deactivate"
                    checked={statusOperation === 'deactivate'}
                    onChange={(e) => setStatusOperation(e.target.value as StatusOperation)}
                    className="h-4 w-4 text-primary"
                  />
                  <div>
                    <p className="font-medium text-slate-900">{t('status.deactivate')}</p>
                    <p className="text-sm text-slate-500">{t('status.deactivateDesc')}</p>
                  </div>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border p-3 hover:bg-slate-100">
                  <input
                    type="radio"
                    name="statusOperation"
                    value="toggleFeatured"
                    checked={statusOperation === 'toggleFeatured'}
                    onChange={(e) => setStatusOperation(e.target.value as StatusOperation)}
                    className="h-4 w-4 text-primary"
                  />
                  <div>
                    <p className="font-medium text-slate-900">{t('status.toggleFeatured')}</p>
                    <p className="text-sm text-slate-500">{t('status.toggleFeaturedDesc')}</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-600/5 p-3 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      <ModalFooter>
        <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
          {t('cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isProcessing || (operationType === 'price' && !priceValue)}
        >
          {isProcessing ? t('processing') : t('apply')}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
