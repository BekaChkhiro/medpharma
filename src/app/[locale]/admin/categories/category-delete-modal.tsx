'use client';

import { AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui';
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  ModalCloseButton,
} from '@/components/ui/modal';
import { type CategoryWithChildren } from '@/types/category';

interface CategoryDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  category: CategoryWithChildren | null;
}

export function CategoryDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  category,
}: CategoryDeleteModalProps) {
  const t = useTranslations('admin.categories');
  const tCommon = useTranslations('common');

  if (!category) return null;

  const productCount = category._count?.products || 0;

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
        {/* Category Info */}
        <div className="rounded-xl border border-slate-200 bg-slate-100 p-3">
          <div className="text-sm font-medium text-slate-900">
            {category.nameEn}
          </div>
          <div className="text-xs text-slate-500">
            {category.nameKa}
          </div>
        </div>

        {/* Warning */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm text-amber-800">
            {t('delete.warning')}
          </p>
        </div>

        {/* Product Count Warning */}
        {productCount > 0 && (
          <div className="rounded-xl border border-red-600/20 bg-red-600/5 p-3">
            <p className="text-sm text-red-600">
              {t('delete.hasProducts', { count: productCount })}
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
        >
          {t('delete.confirm')}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
