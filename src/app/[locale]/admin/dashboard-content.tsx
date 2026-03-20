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
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Link } from '@/i18n/navigation';

interface AdminDashboardContentProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
}

export function AdminDashboardContent({ user }: AdminDashboardContentProps) {
  const t = useTranslations('admin');
  const userName = user.name || user.email || 'Admin';
  const firstName = userName.split(' ')[0];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          {t('dashboard.welcome')}, {firstName}!
        </h1>
        <p className="mt-1 text-[var(--muted-foreground)]">
          Here&apos;s what&apos;s happening with your store today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('dashboard.totalOrders')}
          value="—"
          icon={<ShoppingCart className="h-5 w-5" />}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard
          title={t('dashboard.revenue')}
          value="—"
          icon={<DollarSign className="h-5 w-5" />}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
        />
        <StatCard
          title={t('nav.products')}
          value="—"
          icon={<Package className="h-5 w-5" />}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
        <StatCard
          title={t('dashboard.newOrders')}
          value="—"
          icon={<Clock className="h-5 w-5" />}
          iconBgColor="bg-amber-100"
          iconColor="text-amber-600"
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <QuickActionButton
              href="/admin/products/new"
              icon={<Plus className="h-5 w-5" />}
              label="Add Product"
            />
            <QuickActionButton
              href="/admin/orders"
              icon={<ClipboardList className="h-5 w-5" />}
              label={t('nav.orders')}
            />
            <QuickActionButton
              href="/admin/categories"
              icon={<FolderTree className="h-5 w-5" />}
              label={t('nav.categories')}
            />
            <QuickActionButton
              href="/admin/settings"
              icon={<Settings className="h-5 w-5" />}
              label={t('nav.settings')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity & Top Products Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.recentOrders')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-32 items-center justify-center text-[var(--muted-foreground)]">
              No recent orders
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.topProducts')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-32 items-center justify-center text-[var(--muted-foreground)]">
              No data available
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  iconBgColor,
  iconColor,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className={`rounded-full p-3 ${iconBgColor} ${iconColor}`}>
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--muted-foreground)]">
              {title}
            </p>
            <p className="text-2xl font-bold text-[var(--foreground)]">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionButton({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--secondary)]"
    >
      <span className="text-[var(--muted-foreground)]">{icon}</span>
      {label}
    </Link>
  );
}
