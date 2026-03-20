'use client';

import { useState, useEffect } from 'react';

import { Plus, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui';
import { type CategoryWithChildren, type CategoryFormData } from '@/types/category';

import { CategoryDeleteModal } from './category-delete-modal';
import { CategoryFormModal } from './category-form-modal';
import { CategoryTree } from './category-tree';

export function CategoriesContent() {
  const t = useTranslations('admin.categories');
  const tCommon = useTranslations('common');

  const [categories, setCategories] = useState<CategoryWithChildren[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryWithChildren | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<CategoryWithChildren | null>(null);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin/categories');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('messages.loadError'));
      }

      setCategories(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('messages.loadError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle create category
  const handleCreate = () => {
    setEditingCategory(null);
    setShowFormModal(true);
  };

  // Handle edit category
  const handleEdit = (category: CategoryWithChildren) => {
    setEditingCategory(category);
    setShowFormModal(true);
  };

  // Handle delete category
  const handleDelete = (category: CategoryWithChildren) => {
    setDeletingCategory(category);
    setShowDeleteModal(true);
  };

  // Handle form submit
  const handleFormSubmit = async (data: CategoryFormData) => {
    try {
      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || t('messages.error'));
      }

      // Refresh categories
      await fetchCategories();
      setShowFormModal(false);
      setEditingCategory(null);

      // Show success message (you can add toast notification here)
      alert(editingCategory ? t('messages.updated') : t('messages.created'));
    } catch (err) {
      throw err; // Let modal handle the error
    }
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;

    try {
      const response = await fetch(`/api/admin/categories/${deletingCategory.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || t('messages.deleteError'));
      }

      // Refresh categories
      await fetchCategories();
      setShowDeleteModal(false);
      setDeletingCategory(null);

      // Show success message
      alert(t('messages.deleted'));
    } catch (err) {
      alert(err instanceof Error ? err.message : t('messages.deleteError'));
    }
  };

  // Handle reorder
  const handleReorder = async (items: Array<{ id: string; parentId: string | null; sortOrder: number }>) => {
    try {
      const response = await fetch('/api/admin/categories/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || t('messages.reorderError'));
      }

      // Refresh categories
      await fetchCategories();
    } catch (err) {
      alert(err instanceof Error ? err.message : t('messages.reorderError'));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">{t('title')}</h1>
          <p className="mt-1 text-[var(--muted-foreground)]">
            Manage your product categories hierarchy
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t('addCategory')}
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && categories.length === 0 && (
        <div className="rounded-lg border border-dashed border-[var(--border)] p-12 text-center">
          <div className="mx-auto max-w-md">
            <h3 className="text-lg font-medium text-[var(--foreground)]">
              {t('noCategories')}
            </h3>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Get started by creating your first category
            </p>
            <Button onClick={handleCreate} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              {t('createCategory')}
            </Button>
          </div>
        </div>
      )}

      {/* Categories Tree */}
      {!loading && !error && categories.length > 0 && (
        <CategoryTree
          categories={categories}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onReorder={handleReorder}
        />
      )}

      {/* Form Modal */}
      <CategoryFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setEditingCategory(null);
        }}
        onSubmit={handleFormSubmit}
        category={editingCategory}
        allCategories={categories}
      />

      {/* Delete Modal */}
      <CategoryDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingCategory(null);
        }}
        onConfirm={handleDeleteConfirm}
        category={deletingCategory}
      />
    </div>
  );
}
