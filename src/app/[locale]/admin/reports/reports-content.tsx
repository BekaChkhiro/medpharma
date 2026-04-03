'use client';

import { useState, useEffect, useCallback } from 'react';

import {
  Loader2,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  BarChart3,
  Download,
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

import { Button, Input, Badge } from '@/components/ui';

interface ReportData {
  totalOrders: number;
  revenue: number;
  avgOrderValue: number;
  ordersByStatus: { status: string; count: number; total: number }[];
  topProducts: { nameEn: string; nameKa: string; sku: string; quantity: number; revenue: number }[];
  revenueByCategory: { categoryNameEn: string; categoryNameKa: string; revenue: number; quantity: number }[];
}

export function ReportsContent() {
  const t = useTranslations('admin.reports');
  const tOrders = useTranslations('admin.orders');
  const locale = useLocale();

  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [activePreset, setActivePreset] = useState<string>('thisMonth');

  const setPreset = (preset: string) => {
    const now = new Date();
    let from = '';
    let to = now.toISOString().split('T')[0];

    switch (preset) {
      case 'today':
        from = to;
        break;
      case 'thisWeek': {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        from = weekStart.toISOString().split('T')[0];
        break;
      }
      case 'thisMonth': {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        from = monthStart.toISOString().split('T')[0];
        break;
      }
      case 'thisYear': {
        from = `${now.getFullYear()}-01-01`;
        break;
      }
      case 'custom':
        return;
    }

    setDateFrom(from);
    setDateTo(to);
    setActivePreset(preset);
  };

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);

      const response = await fetch(`/api/admin/reports?${params}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);
      setReport(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => {
    // Set initial date range to this month
    if (!dateFrom && !dateTo) {
      setPreset('thisMonth');
    }
  }, []);

  useEffect(() => {
    if (dateFrom || dateTo) {
      fetchReport();
    }
  }, [fetchReport, dateFrom, dateTo]);

  const formatCurrency = (amount: number) => `${amount.toFixed(2)} ₾`;

  const statusKey = (s: string) => {
    const map: Record<string, string> = {
      PENDING: 'pending', CONFIRMED: 'confirmed', PROCESSING: 'processing',
      SHIPPED: 'shipped', DELIVERED: 'delivered', CANCELLED: 'cancelled', REFUNDED: 'refunded',
    };
    return map[s] || s;
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, 'secondary' | 'warning' | 'success' | 'error'> = {
      PENDING: 'warning', CONFIRMED: 'secondary', PROCESSING: 'secondary',
      SHIPPED: 'secondary', DELIVERED: 'success', CANCELLED: 'error', REFUNDED: 'error',
    };
    return map[status] || 'secondary';
  };

  const getName = (nameKa: string, nameEn: string) =>
    locale === 'ka' ? nameKa : nameEn;

  const handleExportCsv = () => {
    if (!report) return;

    const rows = [
      ['Metric', 'Value'],
      ['Total Orders', report.totalOrders.toString()],
      ['Revenue', report.revenue.toFixed(2)],
      ['Avg Order Value', report.avgOrderValue.toFixed(2)],
      [''],
      ['Top Products'],
      ['SKU', 'Name', 'Quantity', 'Revenue'],
      ...report.topProducts.map((p) => [p.sku, p.nameEn, p.quantity.toString(), p.revenue.toFixed(2)]),
    ];

    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${dateFrom}-${dateTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('title')}</h1>
          <p className="mt-1 text-slate-500">{t('subtitle')}</p>
        </div>
        <Button variant="outline" onClick={handleExportCsv} disabled={!report}>
          <Download className="mr-2 h-4 w-4" />
          {t('exportCsv')}
        </Button>
      </div>

      {/* Date Range Presets */}
      <div className="flex flex-wrap items-center gap-2">
        {['today', 'thisWeek', 'thisMonth', 'thisYear'].map((preset) => (
          <Button
            key={preset}
            variant={activePreset === preset ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPreset(preset)}
          >
            {t(preset)}
          </Button>
        ))}
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setActivePreset('custom');
            }}
            className="w-40"
          />
          <span className="text-slate-500">—</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setActivePreset('custom');
            }}
            className="w-40"
          />
        </div>
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

      {/* Report Data */}
      {!loading && !error && report && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-[#FDFBF7] p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">{t('revenue')}</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatCurrency(report.revenue)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-[#FDFBF7] p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
                  <ShoppingCart className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">{t('orders')}</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {report.totalOrders}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-[#FDFBF7] p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">{t('avgOrderValue')}</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatCurrency(report.avgOrderValue)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Orders by Status */}
            <div className="rounded-xl border border-slate-200 bg-[#FDFBF7] p-6">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">
                {t('orders')}
              </h3>
              <div className="space-y-3">
                {report.ordersByStatus.map((item) => (
                  <div key={item.status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusBadge(item.status)}>
                        {tOrders(`statuses.${statusKey(item.status)}`)}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <span className="font-medium">{item.count}</span>
                      <span className="ml-2 text-sm text-slate-500">
                        ({formatCurrency(item.total)})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue by Category */}
            <div className="rounded-xl border border-slate-200 bg-[#FDFBF7] p-6">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">
                <BarChart3 className="mr-2 inline h-5 w-5" />
                {t('revenueByCategory')}
              </h3>
              {report.revenueByCategory.length === 0 ? (
                <p className="text-sm text-slate-500">No data</p>
              ) : (
                <div className="space-y-3">
                  {report.revenueByCategory.map((cat, i) => {
                    const maxRevenue = report.revenueByCategory[0]?.revenue || 1;
                    const pct = (cat.revenue / maxRevenue) * 100;
                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">
                            {getName(cat.categoryNameKa, cat.categoryNameEn)}
                          </span>
                          <span>{formatCurrency(cat.revenue)}</span>
                        </div>
                        <div className="mt-1 h-2 rounded-full bg-slate-100">
                          <div
                            className="h-2 rounded-full bg-[#df2b1b]"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Top Products */}
          <div className="rounded-xl border border-slate-200 bg-[#FDFBF7] p-6">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">
              {t('topProducts')}
            </h3>
            {report.topProducts.length === 0 ? (
              <p className="text-sm text-slate-500">No data</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-200">
                    <tr>
                      <th className="pb-2 text-left font-medium text-slate-500">#</th>
                      <th className="pb-2 text-left font-medium text-slate-500">SKU</th>
                      <th className="pb-2 text-left font-medium text-slate-500">Product</th>
                      <th className="pb-2 text-right font-medium text-slate-500">Qty</th>
                      <th className="pb-2 text-right font-medium text-slate-500">{t('revenue')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {report.topProducts.map((product, i) => (
                      <tr key={i}>
                        <td className="py-2 text-slate-500">{i + 1}</td>
                        <td className="py-2 font-mono text-xs">{product.sku}</td>
                        <td className="py-2">{getName(product.nameKa, product.nameEn)}</td>
                        <td className="py-2 text-right">{product.quantity}</td>
                        <td className="py-2 text-right font-medium">{formatCurrency(product.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
