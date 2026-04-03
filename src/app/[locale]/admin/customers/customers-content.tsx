'use client';

import { useState, useEffect, useCallback } from 'react';

import {
  Loader2,
  Search,
  Users,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

import { Button, Input, Badge, Modal, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui';

interface Customer {
  email: string;
  name: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  lastOrder: string;
}

interface CustomerOrder {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
  items: { id: string; productNameKa: string; productNameEn: string; quantity: number; total: number }[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function CustomersContent() {
  const t = useTranslations('admin.customers');
  const tOrders = useTranslations('admin.orders');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState<Pagination>({
    page: 1, limit: 20, total: 0, totalPages: 0,
  });

  // Detail modal
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchCustomers = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({ page: page.toString(), limit: '20' });
      if (searchQuery) params.set('search', searchQuery);

      const response = await fetch(`/api/admin/customers?${params}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setCustomers(data.data || []);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleViewOrders = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDetailModal(true);
    setLoadingOrders(true);

    try {
      const response = await fetch(
        `/api/admin/customers/${encodeURIComponent(customer.email)}/orders`
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setCustomerOrders(data.data || []);
    } catch {
      setCustomerOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const formatCurrency = (amount: number) => `${amount.toFixed(2)} ₾`;

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString(locale === 'ka' ? 'ka-GE' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });

  const getStatusBadge = (status: string) => {
    const map: Record<string, 'secondary' | 'warning' | 'success' | 'error'> = {
      PENDING: 'warning', CONFIRMED: 'secondary', PROCESSING: 'secondary',
      SHIPPED: 'secondary', DELIVERED: 'success', CANCELLED: 'error', REFUNDED: 'error',
    };
    return map[status] || 'secondary';
  };

  const statusKey = (s: string) => {
    const map: Record<string, string> = {
      PENDING: 'pending', CONFIRMED: 'confirmed', PROCESSING: 'processing',
      SHIPPED: 'shipped', DELIVERED: 'delivered', CANCELLED: 'cancelled', REFUNDED: 'refunded',
    };
    return map[s] || s;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t('title')}</h1>
        <p className="mt-1 text-slate-500">{t('subtitle')}</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <Input
          placeholder={t('searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
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
      {!loading && !error && customers.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-slate-500" />
          <h3 className="mt-4 text-lg font-medium text-slate-900">{t('noCustomers')}</h3>
        </div>
      )}

      {/* Table */}
      {!loading && !error && customers.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-[#FDFBF7]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">{t('name')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">{t('email')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">{t('phone')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">{t('totalOrders')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">{t('totalSpent')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">{t('lastOrder')}</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">{tCommon('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {customers.map((customer) => (
                  <tr key={customer.email} className="hover:bg-slate-100/50">
                    <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-900">{customer.name}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-slate-500">{customer.email}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-slate-500">{customer.phone}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-slate-900">{customer.totalOrders}</td>
                    <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-900">{formatCurrency(customer.totalSpent)}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-slate-500">
                      {customer.lastOrder ? formatDate(customer.lastOrder) : '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewOrders(customer)}
                        title={t('viewOrders')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
              <div className="text-sm text-slate-500">
                {(pagination.page - 1) * pagination.limit + 1}-
                {Math.min(pagination.page * pagination.limit, pagination.total)} / {pagination.total}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={pagination.page <= 1} onClick={() => fetchCustomers(pagination.page - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" disabled={pagination.page >= pagination.totalPages} onClick={() => fetchCustomers(pagination.page + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Customer Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedCustomer(null);
          setCustomerOrders([]);
        }}
      >
        <ModalHeader>
          <ModalTitle>{t('customerDetail')}</ModalTitle>
        </ModalHeader>
        <div>
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 p-3 text-sm">
                <p><span className="font-medium">{t('name')}:</span> {selectedCustomer.name}</p>
                <p><span className="font-medium">{t('email')}:</span> {selectedCustomer.email}</p>
                <p><span className="font-medium">{t('phone')}:</span> {selectedCustomer.phone}</p>
                <p><span className="font-medium">{t('totalOrders')}:</span> {selectedCustomer.totalOrders}</p>
                <p><span className="font-medium">{t('totalSpent')}:</span> {formatCurrency(selectedCustomer.totalSpent)}</p>
              </div>

              <h4 className="text-sm font-semibold">{t('orderHistory')}</h4>

              {loadingOrders && (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-[#df2b1b]" />
                </div>
              )}

              {!loadingOrders && customerOrders.length === 0 && (
                <p className="text-sm text-slate-500">{tOrders('noOrders')}</p>
              )}

              {!loadingOrders && customerOrders.length > 0 && (
                <div className="space-y-2">
                  {customerOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-sm"
                    >
                      <div>
                        <span className="font-mono font-medium">{order.orderNumber}</span>
                        <span className="ml-2 text-slate-500">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusBadge(order.status)}>
                          {tOrders(`statuses.${statusKey(order.status)}`)}
                        </Badge>
                        <span className="font-medium">{formatCurrency(order.total)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => {
              setShowDetailModal(false);
              setSelectedCustomer(null);
            }}
          >
            {tCommon('close')}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
