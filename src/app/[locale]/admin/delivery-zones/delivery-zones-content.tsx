'use client';

import { useState, useEffect, useCallback } from 'react';

import {
  Plus,
  Loader2,
  Pencil,
  Trash2,
  MapPin,
  Check,
  X,
  GripVertical,
  Search,
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

import { Button, Input, Badge } from '@/components/ui';

import { DeliveryZoneDeleteModal } from './delivery-zone-delete-modal';
import { DeliveryZoneFormModal } from './delivery-zone-form-modal';

// Types
export interface DeliveryZone {
  id: string;
  nameKa: string;
  nameEn: string;
  fee: number;
  minOrder: number | null;
  freeAbove: number | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    orders: number;
  };
}

export interface DeliveryZoneFormData {
  nameKa: string;
  nameEn: string;
  fee: number;
  minOrder: number | null;
  freeAbove: number | null;
  isActive: boolean;
}

export function DeliveryZonesContent() {
  const t = useTranslations('admin.deliveryZones');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [filteredZones, setFilteredZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [deletingZone, setDeletingZone] = useState<DeliveryZone | null>(null);

  // Fetch delivery zones
  const fetchZones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin/delivery-zones');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('messages.loadError'));
      }

      setZones(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('messages.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  // Filter zones based on search and status
  useEffect(() => {
    let filtered = [...zones];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (zone) =>
          zone.nameKa.toLowerCase().includes(query) ||
          zone.nameEn.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((zone) =>
        statusFilter === 'active' ? zone.isActive : !zone.isActive
      );
    }

    setFilteredZones(filtered);
  }, [zones, searchQuery, statusFilter]);

  // Handle create
  const handleCreate = () => {
    setEditingZone(null);
    setShowFormModal(true);
  };

  // Handle edit
  const handleEdit = (zone: DeliveryZone) => {
    setEditingZone(zone);
    setShowFormModal(true);
  };

  // Handle delete
  const handleDelete = (zone: DeliveryZone) => {
    setDeletingZone(zone);
    setShowDeleteModal(true);
  };

  // Handle form submit
  const handleFormSubmit = async (data: DeliveryZoneFormData) => {
    try {
      const url = editingZone
        ? `/api/admin/delivery-zones/${editingZone.id}`
        : '/api/admin/delivery-zones';
      const method = editingZone ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || t('messages.error'));
      }

      // Refresh zones
      await fetchZones();
      setShowFormModal(false);
      setEditingZone(null);
    } catch (err) {
      throw err; // Let modal handle the error
    }
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    if (!deletingZone) return;

    try {
      const response = await fetch(`/api/admin/delivery-zones/${deletingZone.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || t('messages.deleteError'));
      }

      // Refresh zones
      await fetchZones();
      setShowDeleteModal(false);
      setDeletingZone(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : t('messages.deleteError'));
    }
  };

  // Toggle active status
  const handleToggleActive = async (zone: DeliveryZone) => {
    try {
      const response = await fetch(`/api/admin/delivery-zones/${zone.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...zone,
          isActive: !zone.isActive,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || t('messages.error'));
      }

      // Refresh zones
      await fetchZones();
    } catch (err) {
      alert(err instanceof Error ? err.message : t('messages.error'));
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} ₾`;
  };

  // Get zone name based on locale
  const getZoneName = (zone: DeliveryZone) => {
    return locale === 'ka' ? zone.nameKa : zone.nameEn;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">{t('title')}</h1>
          <p className="mt-1 text-[var(--muted-foreground)]">
            {t('description')}
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t('addZone')}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('all')}
          >
            {tCommon('all')}
          </Button>
          <Button
            variant={statusFilter === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('active')}
          >
            {t('active')}
          </Button>
          <Button
            variant={statusFilter === 'inactive' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('inactive')}
          >
            {t('inactive')}
          </Button>
        </div>
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
      {!loading && !error && zones.length === 0 && (
        <div className="rounded-lg border border-dashed border-[var(--border)] p-12 text-center">
          <div className="mx-auto max-w-md">
            <MapPin className="mx-auto h-12 w-12 text-[var(--muted-foreground)]" />
            <h3 className="mt-4 text-lg font-medium text-[var(--foreground)]">
              {t('noZones')}
            </h3>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              {t('noZonesDescription')}
            </p>
            <Button onClick={handleCreate} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              {t('createZone')}
            </Button>
          </div>
        </div>
      )}

      {/* No Results State */}
      {!loading && !error && zones.length > 0 && filteredZones.length === 0 && (
        <div className="rounded-lg border border-dashed border-[var(--border)] p-12 text-center">
          <p className="text-[var(--muted-foreground)]">{t('noResults')}</p>
        </div>
      )}

      {/* Zones Table */}
      {!loading && !error && filteredZones.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[var(--border)] bg-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                    <GripVertical className="h-4 w-4" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                    {t('table.name')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                    {t('table.fee')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                    {t('table.minOrder')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                    {t('table.freeAbove')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                    {t('table.orders')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                    {t('table.status')}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                    {tCommon('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredZones.map((zone) => (
                  <tr key={zone.id} className="hover:bg-[var(--muted)]/50">
                    <td className="whitespace-nowrap px-4 py-4">
                      <GripVertical className="h-4 w-4 cursor-grab text-[var(--muted-foreground)]" />
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <div>
                        <div className="font-medium text-[var(--foreground)]">
                          {getZoneName(zone)}
                        </div>
                        <div className="text-xs text-[var(--muted-foreground)]">
                          {locale === 'ka' ? zone.nameEn : zone.nameKa}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 font-medium text-[var(--foreground)]">
                      {formatCurrency(zone.fee)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-[var(--muted-foreground)]">
                      {zone.minOrder ? formatCurrency(zone.minOrder) : '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-[var(--muted-foreground)]">
                      {zone.freeAbove ? formatCurrency(zone.freeAbove) : '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-[var(--muted-foreground)]">
                      {zone._count?.orders || 0}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <button
                        onClick={() => handleToggleActive(zone)}
                        className="inline-flex items-center"
                      >
                        {zone.isActive ? (
                          <Badge variant="success" className="cursor-pointer">
                            <Check className="mr-1 h-3 w-3" />
                            {t('active')}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="cursor-pointer">
                            <X className="mr-1 h-3 w-3" />
                            {t('inactive')}
                          </Badge>
                        )}
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(zone)}
                          title={tCommon('edit')}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(zone)}
                          title={tCommon('delete')}
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
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
      <DeliveryZoneFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setEditingZone(null);
        }}
        onSubmit={handleFormSubmit}
        zone={editingZone}
      />

      {/* Delete Modal */}
      <DeliveryZoneDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingZone(null);
        }}
        onConfirm={handleDeleteConfirm}
        zone={deletingZone}
      />
    </div>
  );
}
