'use client';

import { useTranslations } from 'next-intl';

import { Button, Modal, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui';

import type { PageItem } from './pages-content';

interface PageDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  page: PageItem | null;
}

export function PageDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  page,
}: PageDeleteModalProps) {
  const t = useTranslations('admin.pages');
  const tCommon = useTranslations('common');

  if (!page) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        <ModalTitle>{t('deletePage')}</ModalTitle>
      </ModalHeader>
      <div>
        <p className="text-slate-500">
          {t('deleteConfirmation')}
        </p>
        <p className="mt-2 font-medium text-slate-900">
          {page.titleEn} ({page.slug})
        </p>
      </div>
      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          {tCommon('cancel')}
        </Button>
        <Button variant="destructive" onClick={onConfirm}>
          {tCommon('delete')}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
