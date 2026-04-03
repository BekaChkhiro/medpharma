'use client';

import { useState, useEffect, useCallback } from 'react';

import {
  Plus,
  Loader2,
  Pencil,
  Trash2,
  FileText,
  Check,
  X,
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

import { Button, Badge } from '@/components/ui';

import { PageFormModal } from './page-form-modal';
import { PageDeleteModal } from './page-delete-modal';

export interface PageItem {
  id: string;
  slug: string;
  titleKa: string;
  titleEn: string;
  contentKa: string;
  contentEn: string;
  metaTitleKa: string | null;
  metaTitleEn: string | null;
  metaDescKa: string | null;
  metaDescEn: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PageFormData {
  slug: string;
  titleKa: string;
  titleEn: string;
  contentKa: string;
  contentEn: string;
  metaTitleKa: string;
  metaTitleEn: string;
  metaDescKa: string;
  metaDescEn: string;
  isActive: boolean;
}

export function PagesContent() {
  const t = useTranslations('admin.pages');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingPage, setEditingPage] = useState<PageItem | null>(null);
  const [deletingPage, setDeletingPage] = useState<PageItem | null>(null);

  const fetchPages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin/pages');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setPages(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const handleCreate = () => {
    setEditingPage(null);
    setShowFormModal(true);
  };

  const handleEdit = (page: PageItem) => {
    setEditingPage(page);
    setShowFormModal(true);
  };

  const handleDelete = (page: PageItem) => {
    setDeletingPage(page);
    setShowDeleteModal(true);
  };

  const handleFormSubmit = async (data: PageFormData) => {
    const url = editingPage
      ? `/api/admin/pages/${editingPage.id}`
      : '/api/admin/pages';
    const method = editingPage ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error);

    await fetchPages();
    setShowFormModal(false);
    setEditingPage(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPage) return;
    try {
      const response = await fetch(`/api/admin/pages/${deletingPage.id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      await fetchPages();
      setShowDeleteModal(false);
      setDeletingPage(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error');
    }
  };

  const handleToggleActive = async (page: PageItem) => {
    try {
      const response = await fetch(`/api/admin/pages/${page.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...page, isActive: !page.isActive }),
      });
      if (!response.ok) throw new Error('Failed');
      await fetchPages();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error');
    }
  };

  const getTitle = (page: PageItem) =>
    locale === 'ka' ? page.titleKa : page.titleEn;

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString(locale === 'ka' ? 'ka-GE' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

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
          {t('addPage')}
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
      {!loading && !error && pages.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-slate-500" />
          <h3 className="mt-4 text-lg font-medium text-slate-900">{t('noPages')}</h3>
          <Button onClick={handleCreate} className="mt-4">
            <Plus className="mr-2 h-4 w-4" />
            {t('addPage')}
          </Button>
        </div>
      )}

      {/* Table */}
      {!loading && !error && pages.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-[#FDFBF7]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    {t('titleField')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    {t('slug')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    {t('isActive')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    {t('lastUpdated')}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                    {tCommon('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {pages.map((page) => (
                  <tr key={page.id} className="hover:bg-slate-100/50">
                    <td className="whitespace-nowrap px-4 py-4">
                      <div className="font-medium text-slate-900">{getTitle(page)}</div>
                      <div className="text-xs text-slate-500">
                        {locale === 'ka' ? page.titleEn : page.titleKa}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <code className="rounded bg-slate-100 px-2 py-1 text-xs">
                        /{page.slug}
                      </code>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <button onClick={() => handleToggleActive(page)}>
                        {page.isActive ? (
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
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-500">
                      {formatDate(page.updatedAt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(page)} title={tCommon('edit')}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(page)}
                          title={tCommon('delete')}
                          className="text-red-600 hover:bg-red-600/5 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form Modal */}
      <PageFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setEditingPage(null);
        }}
        onSubmit={handleFormSubmit}
        page={editingPage}
      />

      {/* Delete Modal */}
      <PageDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingPage(null);
        }}
        onConfirm={handleDeleteConfirm}
        page={deletingPage}
      />
    </div>
  );
}
