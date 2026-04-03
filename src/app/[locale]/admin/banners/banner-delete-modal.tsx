'use client';

import { useTranslations } from 'next-intl';

import { Button, Modal, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui';

import type { Banner } from './banners-content';

interface BannerDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  banner: Banner | null;
}

export function BannerDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  banner,
}: BannerDeleteModalProps) {
  const t = useTranslations('admin.banners');
  const tCommon = useTranslations('common');

  if (!banner) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        <ModalTitle>{t('deleteBanner')}</ModalTitle>
      </ModalHeader>
      <div>
        <p className="text-slate-500">
          {t('deleteConfirmation')}
        </p>
        {banner.titleEn && (
          <p className="mt-2 font-medium text-slate-900">
            {banner.titleEn}
          </p>
        )}
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
