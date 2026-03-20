'use client';

import { useState } from 'react';

import { AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

type Product = {
  id: string;
  nameEn: string;
  nameKa: string;
  sku: string;
};

type Props = {
  isOpen: boolean;
  onClose: (refresh?: boolean) => void;
  product: Product | null;
};

export function ProductDeleteModal({ isOpen, onClose, product }: Props) {
  const t = useTranslations('admin.products.delete');
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!product) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        onClose(true);
      } else {
        alert(data.error || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  if (!product) return null;

  return (
    <Modal isOpen={isOpen} onClose={() => onClose()} size="md">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {t('title')}
            </h3>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-600">{t('message')}</p>
              <div className="mt-3 rounded-lg bg-gray-50 p-3">
                <p className="text-sm font-medium text-gray-900">
                  {product.nameEn}
                </p>
                <p className="text-sm text-gray-600">{product.nameKa}</p>
                <p className="mt-1 text-xs text-gray-500">SKU: {product.sku}</p>
              </div>
              <p className="text-sm font-medium text-red-600">{t('warning')}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onClose()}
            disabled={loading}
          >
            {t('cancel')}
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? t('deleting') : t('confirm')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
