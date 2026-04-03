'use client';

import { useState, useEffect } from 'react';

import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button, Input, Label, Textarea, Modal, ModalHeader, ModalTitle, ModalFooter, Checkbox } from '@/components/ui';

import type { PageItem, PageFormData } from './pages-content';

interface PageFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PageFormData) => Promise<void>;
  page: PageItem | null;
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
}

export function PageFormModal({
  isOpen,
  onClose,
  onSubmit,
  page,
}: PageFormModalProps) {
  const t = useTranslations('admin.pages');
  const tCommon = useTranslations('common');

  const [formData, setFormData] = useState<PageFormData>({
    slug: '',
    titleKa: '',
    titleEn: '',
    contentKa: '',
    contentEn: '',
    metaTitleKa: '',
    metaTitleEn: '',
    metaDescKa: '',
    metaDescEn: '',
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (page) {
      setFormData({
        slug: page.slug,
        titleKa: page.titleKa,
        titleEn: page.titleEn,
        contentKa: page.contentKa,
        contentEn: page.contentEn,
        metaTitleKa: page.metaTitleKa || '',
        metaTitleEn: page.metaTitleEn || '',
        metaDescKa: page.metaDescKa || '',
        metaDescEn: page.metaDescEn || '',
        isActive: page.isActive,
      });
    } else {
      setFormData({
        slug: '', titleKa: '', titleEn: '',
        contentKa: '', contentEn: '',
        metaTitleKa: '', metaTitleEn: '',
        metaDescKa: '', metaDescEn: '',
        isActive: true,
      });
    }
    setError(null);
  }, [page, isOpen]);

  const handleTitleEnChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      titleEn: value,
      slug: page ? prev.slug : slugify(value),
    }));
  };

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

  const update = (field: keyof PageFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        <ModalTitle>{page ? t('editPage') : t('addPage')}</ModalTitle>
      </ModalHeader>
      <form onSubmit={handleSubmit}>
        <div>
          <div className="space-y-4">
            {error && (
              <div className="rounded-xl border border-red-600/20 bg-red-600/5 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Slug */}
            <div>
              <Label>{t('slug')} *</Label>
              <Input
                value={formData.slug}
                onChange={(e) => update('slug', e.target.value)}
                required
              />
            </div>

            {/* Titles */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{t('titleField')} (KA) *</Label>
                <Input
                  value={formData.titleKa}
                  onChange={(e) => update('titleKa', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>{t('titleField')} (EN) *</Label>
                <Input
                  value={formData.titleEn}
                  onChange={(e) => handleTitleEnChange(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Content */}
            <div>
              <Label>{t('content')} (KA) *</Label>
              <Textarea
                value={formData.contentKa}
                onChange={(e) => update('contentKa', e.target.value)}
                rows={6}
                required
              />
            </div>
            <div>
              <Label>{t('content')} (EN) *</Label>
              <Textarea
                value={formData.contentEn}
                onChange={(e) => update('contentEn', e.target.value)}
                rows={6}
                required
              />
            </div>

            {/* Meta */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{t('metaTitle')} (KA)</Label>
                <Input
                  value={formData.metaTitleKa}
                  onChange={(e) => update('metaTitleKa', e.target.value)}
                />
              </div>
              <div>
                <Label>{t('metaTitle')} (EN)</Label>
                <Input
                  value={formData.metaTitleEn}
                  onChange={(e) => update('metaTitleEn', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{t('metaDesc')} (KA)</Label>
                <Textarea
                  value={formData.metaDescKa}
                  onChange={(e) => update('metaDescKa', e.target.value)}
                  rows={2}
                />
              </div>
              <div>
                <Label>{t('metaDesc')} (EN)</Label>
                <Textarea
                  value={formData.metaDescEn}
                  onChange={(e) => update('metaDescEn', e.target.value)}
                  rows={2}
                />
              </div>
            </div>

            {/* Active */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="pageIsActive"
                checked={formData.isActive}
                onChange={(checked) => update('isActive', checked)}
              />
              <Label htmlFor="pageIsActive">{t('isActive')}</Label>
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
