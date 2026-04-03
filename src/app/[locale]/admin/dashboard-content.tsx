'use client';

import {
  ShoppingCart,
  DollarSign,
  Package,
  Clock,
  Plus,
  ClipboardList,
  FolderTree,
  Settings,
  ArrowRight,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

interface AdminDashboardContentProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
}

const statCards = [
  {
    titleKey: 'dashboard.totalOrders',
    value: '—',
    icon: ShoppingCart,
    iconBg: 'bg-[#df2b1b]/10',
    iconColor: 'text-[#df2b1b]',
  },
  {
    titleKey: 'dashboard.revenue',
    value: '—',
    icon: DollarSign,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
  {
    titleKey: 'nav.products',
    value: '—',
    icon: Package,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  {
    titleKey: 'dashboard.newOrders',
    value: '—',
    icon: Clock,
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-600',
  },
];

const quickActions = [
  { href: '/admin/products/new', icon: Plus, labelKey: null, label: 'Add Product', color: 'text-[#df2b1b]', bg: 'bg-[#df2b1b]/5 hover:bg-[#df2b1b]/10' },
  { href: '/admin/orders', icon: ClipboardList, labelKey: 'nav.orders', label: '', color: 'text-amber-600', bg: 'bg-amber-50 hover:bg-amber-100' },
  { href: '/admin/categories', icon: FolderTree, labelKey: 'nav.categories', label: '', color: 'text-emerald-600', bg: 'bg-emerald-50 hover:bg-emerald-100' },
  { href: '/admin/settings', icon: Settings, labelKey: 'nav.settings', label: '', color: 'text-slate-600', bg: 'bg-slate-100 hover:bg-slate-200' },
];

export function AdminDashboardContent({ user }: AdminDashboardContentProps) {
  const t = useTranslations('admin');
  const userName = user.name || user.email || 'Admin';
  const firstName = userName.split(' ')[0];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {t('dashboard.welcome')}, {firstName}!
        </h1>
        <p className="mt-1 text-slate-500">
          Here&apos;s what&apos;s happening with your store today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="rounded-2xl border border-slate-200 bg-[#FDFBF7] p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className={cn('rounded-xl p-3', stat.iconBg)}>
                  <Icon className={cn('h-5 w-5', stat.iconColor)} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {t(stat.titleKey)}
                  </p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl border border-slate-200 bg-[#FDFBF7] p-6">
        <h2 className="text-base font-bold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                href={action.href}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-200',
                  action.bg,
                  action.color
                )}
              >
                <Icon className="h-5 w-5" />
                {action.labelKey ? t(action.labelKey) : action.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-[#FDFBF7] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">{t('dashboard.recentOrders')}</h2>
            <Link
              href="/admin/orders"
              className="text-sm font-medium text-[#df2b1b] hover:underline inline-flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="flex h-28 items-center justify-center text-slate-400 text-sm">
            No recent orders
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-[#FDFBF7] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">{t('dashboard.topProducts')}</h2>
            <Link
              href="/admin/products"
              className="text-sm font-medium text-[#df2b1b] hover:underline inline-flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="flex h-28 items-center justify-center text-slate-400 text-sm">
            No data available
          </div>
        </div>
      </div>
    </div>
  );
}
