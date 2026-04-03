'use client';

import { useState, useEffect } from 'react';

import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button, Input, Label, Modal, ModalHeader, ModalTitle, ModalFooter, Checkbox } from '@/components/ui';

import type { Banner, BannerFormData } from './banners-content';

interface BannerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BannerFormData) => Promise<void>;
  banner: Banner | null;
}

export function BannerFormModal({
  isOpen,
  onClose,
  onSubmit,
  banner,
}: BannerFormModalProps) {
  const t = useTranslations('admin.banners');
  const tCommon = useTranslations('common');

  const [formData, setFormData] = useState<BannerFormData>({
    titleKa: '',
    titleEn: '',
    subtitleKa: '',
    subtitleEn: '',
    image: '',
    imageMobile: '',
    link: '',
    buttonTextKa: '',
    buttonTextEn: '',
    isActive: true,
    startsAt: '',
    endsAt: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (banner) {
      setFormData({
        titleKa: banner.titleKa || '',
        titleEn: banner.titleEn || '',
        subtitleKa: banner.subtitleKa || '',
        subtitleEn: banner.subtitleEn || '',
        image: banner.image,
        imageMobile: banner.imageMobile || '',
        link: banner.link || '',
        buttonTextKa: banner.buttonTextKa || '',
        buttonTextEn: banner.buttonTextEn || '',
        isActive: banner.isActive,
        startsAt: banner.startsAt ? banner.startsAt.slice(0, 16) : '',
        endsAt: banner.endsAt ? banner.endsAt.slice(0, 16) : '',
      });
    } else {
      setFormData({
        titleKa: '', titleEn: '', subtitleKa: '', subtitleEn: '',
        image: '', imageMobile: '', link: '',
        buttonTextKa: '', buttonTextEn: '',
        isActive: true, startsAt: '', endsAt: '',
      });
    }
    setError(null);
  }, [banner, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setSaving(false);
    }
  };

  const update = (field: keyof BannerFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        <ModalTitle>{banner ? t('editBanner') : t('addBanner')}</ModalTitle>
      </ModalHeader>
      <form onSubmit={handleSubmit}>
        <div>
          <div className="space-y-4">
            {error && (
              <div className="rounded-xl border border-red-600/20 bg-red-600/5 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Image URL */}
            <div>
              <Label>{t('image')} *</Label>
              <Input
                value={formData.image}
                onChange={(e) => update('image', e.target.value)}
                placeholder="https://..."
                required
              />
            </div>

            <div>
              <Label>{t('imageMobile')}</Label>
              <Input
                value={formData.imageMobile}
                onChange={(e) => update('imageMobile', e.target.value)}
                placeholder="https://..."
              />
            </div>

            {/* Title */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{t('titleField')} (KA)</Label>
                <Input
                  value={formData.titleKa}
                  onChange={(e) => update('titleKa', e.target.value)}
                />
              </div>
              <div>
                <Label>{t('titleField')} (EN)</Label>
                <Input
                  value={formData.titleEn}
                  onChange={(e) => update('titleEn', e.target.value)}
                />
              </div>
            </div>

            {/* Subtitle */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{t('subtitleField')} (KA)</Label>
                <Input
                  value={formData.subtitleKa}
                  onChange={(e) => update('subtitleKa', e.target.value)}
                />
              </div>
              <div>
                <Label>{t('subtitleField')} (EN)</Label>
                <Input
                  value={formData.subtitleEn}
                  onChange={(e) => update('subtitleEn', e.target.value)}
                />
              </div>
            </div>

            {/* Link */}
            <div>
              <Label>{t('link')}</Label>
              <Input
                value={formData.link}
                onChange={(e) => update('link', e.target.value)}
                placeholder="/products/..."
              />
            </div>

            {/* Button Text */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{t('buttonText')} (KA)</Label>
                <Input
                  value={formData.buttonTextKa}
                  onChange={(e) => update('buttonTextKa', e.target.value)}
                />
              </div>
              <div>
                <Label>{t('buttonText')} (EN)</Label>
                <Input
                  value={formData.buttonTextEn}
                  onChange={(e) => update('buttonTextEn', e.target.value)}
                />
              </div>
            </div>

            {/* Schedule */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{t('startsAt')}</Label>
                <Input
                  type="datetime-local"
                  value={formData.startsAt}
                  onChange={(e) => update('startsAt', e.target.value)}
                />
              </div>
              <div>
                <Label>{t('endsAt')}</Label>
                <Input
                  type="datetime-local"
                  value={formData.endsAt}
                  onChange={(e) => update('endsAt', e.target.value)}
                />
              </div>
            </div>

            {/* Active */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onChange={(checked) => update('isActive', checked)}
              />
              <Label htmlFor="isActive">{t('isActive')}</Label>
            </div>
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" type="button" onClick={onClose}>
            {tCommon('cancel')}
          </Button>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {tCommon('save')}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
