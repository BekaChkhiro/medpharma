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
    if (href === '/admin') {
      return pathname.endsWith('/admin') || pathname.endsWith('/admin/');
    }
    return pathname.includes(href);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-[#FDFBF7] border-r border-slate-200 transition-all duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0',
          isCollapsed ? 'lg:w-[72px]' : 'lg:w-64',
          'w-64'
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100">
          {!isCollapsed && (
            <Link href="/admin" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#df2b1b] text-white font-bold text-sm shadow-sm">
                MP
              </div>
              <span className="text-base font-bold text-slate-900 tracking-tight">
                {t('title')}
              </span>
            </Link>
          )}
          {isCollapsed && (
            <Link href="/admin" className="mx-auto">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#df2b1b] text-white font-bold text-sm shadow-sm">
                MP
              </div>
            </Link>
          )}

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
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-5">
              {section.title && !isCollapsed && (
                <h3 className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  {section.title}
                </h3>
              )}
              {section.title && isCollapsed && (
                <div className="mx-2 mb-2 border-t border-slate-200" />
              )}
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                          active
                            ? 'bg-[#df2b1b]/10 text-[#df2b1b] font-semibold'
                            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
                          isCollapsed && 'justify-center px-2'
                        )}
                        title={isCollapsed ? item.label : undefined}
                      >
                        <Icon className={cn(
                          'h-[18px] w-[18px] flex-shrink-0 transition-colors duration-200',
                          active ? 'text-[#df2b1b]' : 'text-slate-400 group-hover:text-slate-700'
                        )} />
                        {!isCollapsed && <span>{item.label}</span>}
                        {!isCollapsed && item.badge !== undefined && (
                          <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[#df2b1b] px-1.5 text-[10px] font-semibold text-white">
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

        {/* Collapse Toggle */}
        <div className="hidden px-3 pb-4 lg:block">
          <div className="border-t border-slate-200 pt-3">
            <button
              onClick={onToggleCollapse}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900',
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
        </div>
      </aside>
    </>
  );
}
