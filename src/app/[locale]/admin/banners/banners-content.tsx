'use client';

import { useState, useEffect, useCallback } from 'react';

import {
  Plus,
  Loader2,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Check,
  X,
  GripVertical,
  Calendar,
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

import { Button, Badge } from '@/components/ui';

import { BannerFormModal } from './banner-form-modal';
import { BannerDeleteModal } from './banner-delete-modal';

export interface Banner {
  id: string;
  titleKa: string | null;
  titleEn: string | null;
  subtitleKa: string | null;
  subtitleEn: string | null;
  image: string;
  imageMobile: string | null;
  link: string | null;
  buttonTextKa: string | null;
  buttonTextEn: string | null;
  sortOrder: number;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BannerFormData {
  titleKa: string;
  titleEn: string;
  subtitleKa: string;
  subtitleEn: string;
  image: string;
  imageMobile: string;
  link: string;
  buttonTextKa: string;
  buttonTextEn: string;
  isActive: boolean;
  startsAt: string;
  endsAt: string;
}

export function BannersContent() {
  const t = useTranslations('admin.banners');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [deletingBanner, setDeletingBanner] = useState<Banner | null>(null);

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin/banners');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setBanners(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleCreate = () => {
    setEditingBanner(null);
    setShowFormModal(true);
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setShowFormModal(true);
  };

  const handleDelete = (banner: Banner) => {
    setDeletingBanner(banner);
    setShowDeleteModal(true);
  };

  const handleFormSubmit = async (data: BannerFormData) => {
    const url = editingBanner
      ? `/api/admin/banners/${editingBanner.id}`
      : '/api/admin/banners';
    const method = editingBanner ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error);

    await fetchBanners();
    setShowFormModal(false);
    setEditingBanner(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingBanner) return;
    try {
      const response = await fetch(`/api/admin/banners/${deletingBanner.id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      await fetchBanners();
      setShowDeleteModal(false);
      setDeletingBanner(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error');
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    try {
      const response = await fetch(`/api/admin/banners/${banner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...banner,
          isActive: !banner.isActive,
        }),
      });
      if (!response.ok) throw new Error('Failed');
      await fetchBanners();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error');
    }
  };

  const getTitle = (banner: Banner) =>
    locale === 'ka' ? banner.titleKa : banner.titleEn;

  const getBannerStatus = (banner: Banner) => {
    if (!banner.isActive) return 'inactive';
    const now = new Date();
    if (banner.startsAt && new Date(banner.startsAt) > now) return 'scheduled';
    if (banner.endsAt && new Date(banner.endsAt) < now) return 'expired';
    return 'active';
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, 'success' | 'warning' | 'error' | 'secondary'> = {
      active: 'success',
      scheduled: 'warning',
      expired: 'error',
      inactive: 'secondary',
    };
    return map[status] || 'secondary';
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      active: t('active'),
      scheduled: t('scheduled'),
      expired: t('expired'),
      inactive: t('inactive'),
    };
    return map[status] || status;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('title')}</h1>
          <p className="mt-1 text-slate-500">{t('subtitle')}</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t('addBanner')}
        </Button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#df2b1b]" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-600/20 bg-red-600/5 p-4 text-red-600">{error}</div>
      )}

      {/* Empty */}
      {!loading && !error && banners.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 p-12 text-center">
          <ImageIcon className="mx-auto h-12 w-12 text-slate-500" />
          <h3 className="mt-4 text-lg font-medium text-slate-900">{t('noBanners')}</h3>
          <Button onClick={handleCreate} className="mt-4">
            <Plus className="mr-2 h-4 w-4" />
            {t('addBanner')}
          </Button>
        </div>
      )}

      {/* Banners Grid */}
      {!loading && !error && banners.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {banners.map((banner) => {
            const status = getBannerStatus(banner);
            return (
              <div
                key={banner.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-[#FDFBF7]"
              >
                {/* Image Preview */}
                <div className="relative aspect-[16/7] bg-slate-100">
                  <img
                    src={banner.image}
                    alt={getTitle(banner) || 'Banner'}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-banner.svg';
                    }}
                  />
                  <div className="absolute right-2 top-2">
                    <Badge variant={getStatusBadge(status)}>
                      {getStatusLabel(status)}
                    </Badge>
                  </div>
                  <div className="absolute left-2 top-2">
                    <GripVertical className="h-5 w-5 text-white drop-shadow-md" />
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-medium text-slate-900">
                    {getTitle(banner) || '(No title)'}
                  </h3>
                  {banner.link && (
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {banner.link}
                    </p>
                  )}
                  {(banner.startsAt || banner.endsAt) && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                      <Calendar className="h-3 w-3" />
                      {banner.startsAt && new Date(banner.startsAt).toLocaleDateString()}
                      {banner.startsAt && banner.endsAt && ' — '}
                      {banner.endsAt && new Date(banner.endsAt).toLocaleDateString()}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(banner)}
                      className="inline-flex items-center"
                    >
                      {banner.isActive ? (
                        <Badge variant="success" className="cursor-pointer">
                          <Check className="mr-1 h-3 w-3" />
                          {t('isActive')}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="cursor-pointer">
                          <X className="mr-1 h-3 w-3" />
                          {t('isActive')}
                        </Badge>
                      )}
                    </button>
                    <div className="ml-auto flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(banner)} title={tCommon('edit')}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(banner)}
                        title={tCommon('delete')}
                        className="text-red-600 hover:bg-red-600/5 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      <BannerFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setEditingBanner(null);
        }}
        onSubmit={handleFormSubmit}
        banner={editingBanner}
      />

      {/* Delete Modal */}
      <BannerDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingBanner(null);
        }}
        onConfirm={handleDeleteConfirm}
        banner={deletingBanner}
      />
    </div>
  );
}
