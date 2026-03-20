'use client';

import { usePathname } from 'next/navigation';

import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FolderTree,
  Users,
  FileText,
  Image,
  Settings,
  Truck,
  BarChart3,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { IconButton } from '@/components/ui';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

interface AdminSidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

export function AdminSidebar({
  isOpen,
  isCollapsed,
  onClose,
  onToggleCollapse,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const t = useTranslations('admin');

  const navSections: NavSection[] = [
    {
      items: [
        { href: '/admin', label: t('nav.dashboard'), icon: LayoutDashboard },
      ],
    },
    {
      title: t('nav.catalog'),
      items: [
        { href: '/admin/categories', label: t('nav.categories'), icon: FolderTree },
        { href: '/admin/products', label: t('nav.products'), icon: Package },
      ],
    },
    {
      title: t('nav.sales'),
      items: [
        { href: '/admin/orders', label: t('nav.orders'), icon: ShoppingCart },
        { href: '/admin/customers', label: t('nav.customers'), icon: Users },
        { href: '/admin/delivery-zones', label: t('nav.deliveryZones'), icon: Truck },
      ],
    },
    {
      title: t('nav.content'),
      items: [
        { href: '/admin/banners', label: t('nav.banners'), icon: Image },
        { href: '/admin/pages', label: t('nav.pages'), icon: FileText },
      ],
    },
    {
      title: t('nav.analytics'),
      items: [
        { href: '/admin/reports', label: t('nav.reports'), icon: BarChart3 },
      ],
    },
    {
      items: [
        { href: '/admin/settings', label: t('nav.settings'), icon: Settings },
      ],
    },
  ];

  const isActive = (href: string) => {
    // Exact match for dashboard
    if (href === '/admin') {
      return pathname.endsWith('/admin') || pathname.endsWith('/admin/');
    }
    // Prefix match for other routes
    return pathname.includes(href);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-[var(--background)] border-r border-[var(--border)] transition-all duration-300 ease-in-out',
          // Mobile: slide in/out
          isOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop: always visible, collapsible width
          'lg:translate-x-0',
          isCollapsed ? 'lg:w-[72px]' : 'lg:w-64',
          // Mobile width
          'w-64'
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-[var(--border)] px-4">
          {!isCollapsed && (
            <Link href="/admin" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)] text-white font-bold text-sm">
                MP
              </div>
              <span className="font-semibold text-[var(--foreground)]">
                {t('title')}
              </span>
            </Link>
          )}
          {isCollapsed && (
            <Link href="/admin" className="mx-auto">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)] text-white font-bold text-sm">
                MP
              </div>
            </Link>
          )}

          {/* Mobile close button */}
          <IconButton
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden"
            aria-label={t('closeSidebar')}
          >
            <X className="h-5 w-5" />
          </IconButton>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          {navSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-4">
              {section.title && !isCollapsed && (
                <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                  {section.title}
                </h3>
              )}
              {section.title && isCollapsed && (
                <div className="mb-2 border-t border-[var(--border)]" />
              )}
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                          active
                            ? 'bg-[var(--primary)] text-white'
                            : 'text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]',
                          isCollapsed && 'justify-center px-2'
                        )}
                        title={isCollapsed ? item.label : undefined}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        {!isCollapsed && <span>{item.label}</span>}
                        {!isCollapsed && item.badge !== undefined && (
                          <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--destructive)] px-1.5 text-xs font-medium text-white">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Collapse Toggle (Desktop only) */}
        <div className="hidden border-t border-[var(--border)] p-3 lg:block">
          <button
            onClick={onToggleCollapse}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--muted-foreground)] transition-colors hover:bg-[var(--secondary)] hover:text-[var(--foreground)]',
              isCollapsed && 'justify-center px-2'
            )}
            aria-label={isCollapsed ? t('expandSidebar') : t('collapseSidebar')}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <>
                <ChevronLeft className="h-5 w-5" />
                <span>{t('collapse')}</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
