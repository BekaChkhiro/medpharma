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
import { type CategoryWithChildren, type CategoryFormData } from '@/types/category';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  category: CategoryWithChildren | null;
  allCategories: CategoryWithChildren[];
}

// Helper to generate slug from English name
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Helper to flatten category tree for parent selection
function flattenCategories(
  categories: CategoryWithChildren[],
  excludeId?: string,
  depth = 0
): Array<{ id: string; name: string; depth: number }> {
  const result: Array<{ id: string; name: string; depth: number }> = [];

  for (const category of categories) {
    if (category.id !== excludeId) {
      result.push({
        id: category.id,
        name: category.nameEn,
        depth,
      });

      if (category.children && category.children.length > 0) {
        result.push(...flattenCategories(category.children, excludeId, depth + 1));
      }
    }
  }

  return result;
}

export function CategoryFormModal({
  isOpen,
  onClose,
  onSubmit,
  category,
  allCategories,
}: CategoryFormModalProps) {
  const t = useTranslations('admin.categories');
  const tCommon = useTranslations('common');

  const [formData, setFormData] = useState<CategoryFormData>({
    slug: '',
    nameKa: '',
    nameEn: '',
    descKa: '',
    descEn: '',
    parentId: null,
    image: '',
    isActive: true,
    metaTitleKa: '',
    metaTitleEn: '',
    metaDescKa: '',
    metaDescEn: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // Initialize form data when category changes
  useEffect(() => {
    if (category) {
      setFormData({
        slug: category.slug,
        nameKa: category.nameKa,
        nameEn: category.nameEn,
        descKa: category.descKa || '',
        descEn: category.descEn || '',
        parentId: category.parentId,
        image: category.image || '',
        isActive: category.isActive,
        metaTitleKa: category.metaTitleKa || '',
        metaTitleEn: category.metaTitleEn || '',
        metaDescKa: category.metaDescKa || '',
        metaDescEn: category.metaDescEn || '',
      });
      setSlugManuallyEdited(true);
    } else {
      setFormData({
        slug: '',
        nameKa: '',
        nameEn: '',
        descKa: '',
        descEn: '',
        parentId: null,
        image: '',
        isActive: true,
        metaTitleKa: '',
        metaTitleEn: '',
        metaDescKa: '',
        metaDescEn: '',
      });
      setSlugManuallyEdited(false);
    }
    setError(null);
  }, [category, isOpen]);

  const handleChange = (field: keyof CategoryFormData, value: string | boolean | null) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Auto-generate slug from English name if not manually edited
      if (field === 'nameEn' && typeof value === 'string' && !slugManuallyEdited) {
        updated.slug = generateSlug(value);
      }

      return updated;
    });
  };

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true);
    setFormData((prev) => ({ ...prev, slug: generateSlug(value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('messages.error'));
    } finally {
      setLoading(false);
    }
  };

  const flatCategories = flattenCategories(allCategories, category?.id);

  return (
    <Modal open={isOpen} onClose={onClose} className="max-w-2xl">
      <ModalCloseButton onClose={onClose} />
      <form onSubmit={handleSubmit}>
        <ModalHeader>
          <ModalTitle>
            {category ? t('editCategory') : t('createCategory')}
          </ModalTitle>
        </ModalHeader>

        <div className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Basic Info Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[var(--foreground)]">
              {t('form.basicInfo')}
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
                placeholder="e.g., Vitamins & Supplements"
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
                placeholder="მაგ., ვიტამინები და დანამატები"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                {t('form.slug')} <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                required
                placeholder="vitamins-supplements"
              />
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                {t('form.slugHint')}
              </p>
            </div>

            {/* Parent Category */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                {t('form.parent')}
              </label>
              <select
                value={formData.parentId || ''}
                onChange={(e) => handleChange('parentId', e.target.value || null)}
                className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              >
                <option value="">{t('form.selectParent')}</option>
                {flatCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {'  '.repeat(cat.depth)}
                    {cat.depth > 0 && '└─ '}
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* English Description */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                {t('form.descEn')}
              </label>
              <textarea
                value={formData.descEn}
                onChange={(e) => handleChange('descEn', e.target.value)}
                rows={3}
                className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                placeholder="Category description in English"
              />
            </div>

            {/* Georgian Description */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                {t('form.descKa')}
              </label>
              <textarea
                value={formData.descKa}
                onChange={(e) => handleChange('descKa', e.target.value)}
                rows={3}
                className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                placeholder="კატეგორიის აღწერა ქართულად"
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                {t('form.image')}
              </label>
              <Input
                value={formData.image}
                onChange={(e) => handleChange('image', e.target.value)}
                type="url"
                placeholder={t('form.imagePlaceholder')}
              />
            </div>

            {/* Active Status */}
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
          </div>

          {/* SEO Section */}
          <div className="space-y-4 border-t border-[var(--border)] pt-6">
            <h3 className="text-sm font-medium text-[var(--foreground)]">
              {t('form.seoInfo')}
            </h3>

            {/* Meta Title English */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                {t('form.metaTitleEn')}
              </label>
              <Input
                value={formData.metaTitleEn}
                onChange={(e) => handleChange('metaTitleEn', e.target.value)}
                placeholder="SEO title in English"
              />
            </div>

            {/* Meta Title Georgian */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                {t('form.metaTitleKa')}
              </label>
              <Input
                value={formData.metaTitleKa}
                onChange={(e) => handleChange('metaTitleKa', e.target.value)}
                placeholder="SEO სათაური ქართულად"
              />
            </div>

            {/* Meta Description English */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                {t('form.metaDescEn')}
              </label>
              <textarea
                value={formData.metaDescEn}
                onChange={(e) => handleChange('metaDescEn', e.target.value)}
                rows={2}
                className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                placeholder="SEO description in English"
              />
            </div>

            {/* Meta Description Georgian */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                {t('form.metaDescKa')}
              </label>
              <textarea
                value={formData.metaDescKa}
                onChange={(e) => handleChange('metaDescKa', e.target.value)}
                rows={2}
                className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                placeholder="SEO აღწერა ქართულად"
              />
            </div>
          </div>
        </div>

        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            {tCommon('cancel')}
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {category ? t('updateCategory') : t('createCategory')}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
