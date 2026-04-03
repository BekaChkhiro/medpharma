'use client';

import { useState, useEffect, useCallback } from 'react';

import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ImageUpload, type ProductImage } from '@/components/ui/image-upload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

type Product = {
  id?: string;
  sku: string;
  slug?: string;
  nameKa: string;
  nameEn: string;
  descKa?: string;
  descEn?: string;
  shortDescKa?: string;
  shortDescEn?: string;
  price: number;
  salePrice?: number | null;
  costPrice?: number | null;
  stock: number;
  lowStockThreshold?: number;
  brand?: string;
  manufacturer?: string;
  dosageForm?: string;
  dosage?: string;
  activeIngredient?: string;
  requiresPrescription: boolean;
  isFeatured: boolean;
  isActive: boolean;
  weight?: number | null;
  barcode?: string;
  categoryId?: string;
  metaTitleKa?: string;
  metaTitleEn?: string;
  metaDescKa?: string;
  metaDescEn?: string;
  apexId?: string;
  images?: ProductImage[];
};

type Category = {
  id: string;
  nameKa: string;
  nameEn: string;
  slug: string;
};

type Props = {
  isOpen: boolean;
  onClose: (refresh?: boolean) => void;
  product: Product | null;
};

const DOSAGE_FORMS = [
  'TABLET',
  'CAPSULE',
  'SYRUP',
  'INJECTION',
  'CREAM',
  'OINTMENT',
  'GEL',
  'DROPS',
  'SPRAY',
  'POWDER',
  'SUPPOSITORY',
  'PATCH',
  'SOLUTION',
  'SUSPENSION',
  'OTHER',
];

export function ProductFormModal({ isOpen, onClose, product }: Props) {
  const t = useTranslations('admin.products.form');
  const tImages = useTranslations('admin.products.images');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [formData, setFormData] = useState<Product>({
    sku: '',
    nameKa: '',
    nameEn: '',
    price: 0,
    stock: 0,
    requiresPrescription: false,
    isFeatured: false,
    isActive: true,
  });

  useEffect(() => {
    if (product) {
      setFormData(product);
      setImages(product.images || []);
    } else {
      setFormData({
        sku: '',
        nameKa: '',
        nameEn: '',
        price: 0,
        stock: 0,
        requiresPrescription: false,
        isFeatured: false,
        isActive: true,
      });
      setImages([]);
    }
  }, [product]);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      if (product?.id) {
        fetchImages(product.id);
      }
    }
  }, [isOpen, product?.id]);

  const fetchImages = async (productId: string) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}/images`);
      const data = await response.json();
      if (data.success) {
        setImages(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch images:', error);
    }
  };

  const handleUploadImages = useCallback(
    async (files: File[]): Promise<ProductImage[]> => {
      if (!product?.id) {
        throw new Error('Please save the product first before uploading images');
      }

      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));

      const response = await fetch(`/api/admin/products/${product.id}/images`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to upload images');
      }

      return data.data;
    },
    [product?.id]
  );

  const handleDeleteImage = useCallback(
    async (imageId: string): Promise<void> => {
      if (!product?.id) return;

      const response = await fetch(
        `/api/admin/products/${product.id}/images/${imageId}`,
        { method: 'DELETE' }
      );

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to delete image');
      }
    },
    [product?.id]
  );

  const handleSetPrimaryImage = useCallback(
    async (imageId: string): Promise<void> => {
      if (!product?.id) return;

      const response = await fetch(`/api/admin/products/${product.id}/images`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setPrimary: true, imageId }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to set primary image');
      }
    },
    [product?.id]
  );

  const handleReorderImages = useCallback(
    async (imageIds: string[]): Promise<void> => {
      if (!product?.id) return;

      const response = await fetch(`/api/admin/products/${product.id}/images`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reorder: true, imageIds }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to reorder images');
      }
    },
    [product?.id]
  );

  const handleUpdateAlt = useCallback(
    async (imageId: string, alt: string): Promise<void> => {
      if (!product?.id) return;

      const response = await fetch(
        `/api/admin/products/${product.id}/images/${imageId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ alt }),
        }
      );

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to update alt text');
      }
    },
    [product?.id]
  );

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      const data = await response.json();
      if (data.success) {
        // Flatten category tree for dropdown
        const flatCategories = flattenCategories(data.data);
        setCategories(flatCategories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const flattenCategories = (
    categories: any[],
    prefix = ''
  ): Category[] => {
    let result: Category[] = [];
    categories.forEach((cat) => {
      result.push({
        id: cat.id,
        nameKa: prefix + cat.nameKa,
        nameEn: prefix + cat.nameEn,
        slug: cat.slug,
      });
      if (cat.children && cat.children.length > 0) {
        result = result.concat(
          flattenCategories(cat.children, prefix + '  ')
        );
      }
    });
    return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = product
        ? `/api/admin/products/${product.id}`
        : '/api/admin/products';
      const method = product ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        onClose(true);
      } else {
        alert(data.error || 'Failed to save product');
      }
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof Product, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={() => onClose()} size="2xl">
      <div className="flex items-center justify-between border-b p-6">
        <h2 className="text-xl font-semibold">
          {product ? t('editProduct') : t('addProduct')}
        </h2>
        <button
          onClick={() => onClose()}
          className="text-slate-500 hover:text-slate-900"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="p-6">
          <TabsList className="mb-4">
            <TabsTrigger value="basic">{t('tabs.basic')}</TabsTrigger>
            <TabsTrigger value="images">{t('tabs.images')}</TabsTrigger>
            <TabsTrigger value="details">{t('tabs.details')}</TabsTrigger>
            <TabsTrigger value="inventory">{t('tabs.inventory')}</TabsTrigger>
            <TabsTrigger value="seo">{t('tabs.seo')}</TabsTrigger>
          </TabsList>

          {/* Basic Information */}
          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sku" required>
                  {t('fields.sku')}
                </Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => updateFormData('sku', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="slug">{t('fields.slug')}</Label>
                <Input
                  id="slug"
                  value={formData.slug || ''}
                  onChange={(e) => updateFormData('slug', e.target.value)}
                  placeholder="auto-generated-if-empty"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="nameKa" required>
                {t('fields.nameKa')}
              </Label>
              <Input
                id="nameKa"
                value={formData.nameKa}
                onChange={(e) => updateFormData('nameKa', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="nameEn" required>
                {t('fields.nameEn')}
              </Label>
              <Input
                id="nameEn"
                value={formData.nameEn}
                onChange={(e) => updateFormData('nameEn', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="shortDescKa">{t('fields.shortDescKa')}</Label>
              <Input
                id="shortDescKa"
                value={formData.shortDescKa || ''}
                onChange={(e) => updateFormData('shortDescKa', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="shortDescEn">{t('fields.shortDescEn')}</Label>
              <Input
                id="shortDescEn"
                value={formData.shortDescEn || ''}
                onChange={(e) => updateFormData('shortDescEn', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="descKa">{t('fields.descKa')}</Label>
              <Textarea
                id="descKa"
                value={formData.descKa || ''}
                onChange={(e) => updateFormData('descKa', e.target.value)}
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="descEn">{t('fields.descEn')}</Label>
              <Textarea
                id="descEn"
                value={formData.descEn || ''}
                onChange={(e) => updateFormData('descEn', e.target.value)}
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="categoryId">{t('fields.category')}</Label>
              <Select
                id="categoryId"
                value={formData.categoryId || ''}
                onChange={(e) => updateFormData('categoryId', e.target.value || null)}
              >
                <option value="">{t('fields.selectCategory')}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nameEn}
                  </option>
                ))}
              </Select>
            </div>
          </TabsContent>

          {/* Images */}
          <TabsContent value="images" className="space-y-4">
            {!product?.id ? (
              <div className="rounded-xl border border-dashed p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  {tImages('saveFirst')}
                </p>
              </div>
            ) : (
              <ImageUpload
                images={images}
                onImagesChange={setImages}
                onUpload={handleUploadImages}
                onDelete={handleDeleteImage}
                onSetPrimary={handleSetPrimaryImage}
                onReorder={handleReorderImages}
                onUpdateAlt={handleUpdateAlt}
                maxImages={10}
                labels={{
                  dropzone: tImages('dropzone'),
                  dropzoneHint: tImages('dropzoneHint'),
                  browse: tImages('browse'),
                  uploading: tImages('uploading'),
                  setPrimary: tImages('setPrimary'),
                  primary: tImages('primary'),
                  delete: tImages('delete'),
                  altText: tImages('altText'),
                  maxImagesReached: tImages('maxImagesReached'),
                }}
              />
            )}
          </TabsContent>

          {/* Product Details */}
          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="brand">{t('fields.brand')}</Label>
                <Input
                  id="brand"
                  value={formData.brand || ''}
                  onChange={(e) => updateFormData('brand', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="manufacturer">{t('fields.manufacturer')}</Label>
                <Input
                  id="manufacturer"
                  value={formData.manufacturer || ''}
                  onChange={(e) => updateFormData('manufacturer', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dosageForm">{t('fields.dosageForm')}</Label>
                <Select
                  id="dosageForm"
                  value={formData.dosageForm || ''}
                  onChange={(e) => updateFormData('dosageForm', e.target.value || null)}
                >
                  <option value="">{t('fields.selectDosageForm')}</option>
                  {DOSAGE_FORMS.map((form) => (
                    <option key={form} value={form}>
                      {form}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="dosage">{t('fields.dosage')}</Label>
                <Input
                  id="dosage"
                  value={formData.dosage || ''}
                  onChange={(e) => updateFormData('dosage', e.target.value)}
                  placeholder="e.g., 500mg, 10ml"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="activeIngredient">{t('fields.activeIngredient')}</Label>
              <Input
                id="activeIngredient"
                value={formData.activeIngredient || ''}
                onChange={(e) => updateFormData('activeIngredient', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weight">{t('fields.weight')}</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.001"
                  value={formData.weight || ''}
                  onChange={(e) => updateFormData('weight', parseFloat(e.target.value) || null)}
                  placeholder="kg"
                />
              </div>
              <div>
                <Label htmlFor="barcode">{t('fields.barcode')}</Label>
                <Input
                  id="barcode"
                  value={formData.barcode || ''}
                  onChange={(e) => updateFormData('barcode', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="apexId">{t('fields.apexId')}</Label>
              <Input
                id="apexId"
                value={formData.apexId || ''}
                onChange={(e) => updateFormData('apexId', e.target.value)}
                placeholder="APEX ERP ID"
              />
            </div>
          </TabsContent>

          {/* Inventory & Pricing */}
          <TabsContent value="inventory" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price" required>
                  {t('fields.price')}
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => updateFormData('price', parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="salePrice">{t('fields.salePrice')}</Label>
                <Input
                  id="salePrice"
                  type="number"
                  step="0.01"
                  value={formData.salePrice || ''}
                  onChange={(e) => updateFormData('salePrice', parseFloat(e.target.value) || null)}
                />
              </div>
              <div>
                <Label htmlFor="costPrice">{t('fields.costPrice')}</Label>
                <Input
                  id="costPrice"
                  type="number"
                  step="0.01"
                  value={formData.costPrice || ''}
                  onChange={(e) => updateFormData('costPrice', parseFloat(e.target.value) || null)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stock" required>
                  {t('fields.stock')}
                </Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => updateFormData('stock', parseInt(e.target.value) || 0)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lowStockThreshold">
                  {t('fields.lowStockThreshold')}
                </Label>
                <Input
                  id="lowStockThreshold"
                  type="number"
                  value={formData.lowStockThreshold || 10}
                  onChange={(e) =>
                    updateFormData('lowStockThreshold', parseInt(e.target.value) || 10)
                  }
                />
              </div>
            </div>

            <div className="space-y-2 border-t pt-4">
              <Label>{t('fields.flags')}</Label>
              <div className="space-y-2">
                <Checkbox
                  id="requiresPrescription"
                  checked={formData.requiresPrescription}
                  onChange={(checked) =>
                    updateFormData('requiresPrescription', checked)
                  }
                  label={t('fields.requiresPrescription')}
                />
                <Checkbox
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={(checked) => updateFormData('isFeatured', checked)}
                  label={t('fields.isFeatured')}
                />
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(checked) => updateFormData('isActive', checked)}
                  label={t('fields.isActive')}
                />
              </div>
            </div>
          </TabsContent>

          {/* SEO */}
          <TabsContent value="seo" className="space-y-4">
            <div>
              <Label htmlFor="metaTitleKa">{t('fields.metaTitleKa')}</Label>
              <Input
                id="metaTitleKa"
                value={formData.metaTitleKa || ''}
                onChange={(e) => updateFormData('metaTitleKa', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="metaTitleEn">{t('fields.metaTitleEn')}</Label>
              <Input
                id="metaTitleEn"
                value={formData.metaTitleEn || ''}
                onChange={(e) => updateFormData('metaTitleEn', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="metaDescKa">{t('fields.metaDescKa')}</Label>
              <Textarea
                id="metaDescKa"
                value={formData.metaDescKa || ''}
                onChange={(e) => updateFormData('metaDescKa', e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="metaDescEn">{t('fields.metaDescEn')}</Label>
              <Textarea
                id="metaDescEn"
                value={formData.metaDescEn || ''}
                onChange={(e) => updateFormData('metaDescEn', e.target.value)}
                rows={3}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 border-t p-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => onClose()}
            disabled={loading}
          >
            {t('cancel')}
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? t('saving') : t('save')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
