'use client';

import { useState, useRef, useEffect } from 'react';

import {
  Menu,
  Bell,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Search,
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import { Spinner } from '@/components/ui';
import { Link } from '@/i18n/navigation';
import { cn, getInitials } from '@/lib/utils';

interface AdminTopBarProps {
  onMenuClick: () => void;
  isSidebarCollapsed: boolean;
}

export function AdminTopBar({ onMenuClick, isSidebarCollapsed }: AdminTopBarProps) {
  const { data: session, status } = useSession();
  const t = useTranslations('admin');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsUserMenuOpen(false);
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/admin/login' });
  };

  const userInitials = session?.user?.name ? getInitials(session.user.name) : 'U';
  const roleBadge = session?.user?.role ? getRoleBadge(session.user.role) : null;

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-16 items-center justify-between bg-[#FDFBF7] border-b border-slate-200 px-4 md:px-6 transition-all duration-300'
      )}
    >
      {/* Left */}
      <div className="flex items-center gap-3 flex-1">
        {/* Mobile menu */}
        <button
          onClick={onMenuClick}
          className="lg:hidden w-9 h-9 rounded-xl border border-slate-200 bg-[#FDFBF7] flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:border-slate-300 transition-all"
          aria-label={t('openSidebar')}
        >
          <Menu className="h-[18px] w-[18px]" />
        </button>

        {/* Search */}
        <div className="hidden sm:flex items-center flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-[#FDFBF7] text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#df2b1b]/40 focus:ring-2 focus:ring-[#df2b1b]/10 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Search mobile */}
        <button
          className="sm:hidden w-9 h-9 rounded-xl border border-slate-200 bg-[#FDFBF7] flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:border-slate-300 transition-all"
          aria-label="Search"
        >
          <Search className="h-[18px] w-[18px]" />
        </button>

        {/* Notifications */}
        <button
          className="relative w-9 h-9 rounded-xl border border-slate-200 bg-[#FDFBF7] flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:border-slate-300 transition-all"
          aria-label={t('notifications')}
        >
          <Bell className="h-[18px] w-[18px]" />
          {/* Badge - uncomment when needed */}
          {/* <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#df2b1b] text-[9px] font-bold text-white">3</span> */}
        </button>

        {/* Divider */}
        <div className="hidden md:block w-px h-8 bg-slate-200 mx-1" />

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className={cn(
              'flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-all border border-transparent',
              'hover:bg-slate-100 hover:border-slate-200',
              isUserMenuOpen && 'bg-slate-100 border-slate-200'
            )}
            aria-expanded={isUserMenuOpen}
            aria-haspopup="true"
          >
            {status === 'loading' ? (
              <Spinner size="sm" />
            ) : (
              <>
                <div className="w-8 h-8 rounded-xl bg-[#df2b1b] flex items-center justify-center text-white text-xs font-bold">
                  {userInitials}
                </div>
                <div className="hidden flex-col items-start text-left md:flex">
                  <span className="text-sm font-semibold text-slate-900 leading-tight">
                    {session?.user?.name || t('user')}
                  </span>
                  {roleBadge && (
                    <span className="text-[11px] text-slate-400 leading-tight">
                      {roleBadge}
                    </span>
                  )}
                </div>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 text-slate-400 transition-transform hidden md:block',
                    isUserMenuOpen && 'rotate-180'
                  )}
                />
              </>
            )}
          </button>

          {/* Dropdown */}
          {isUserMenuOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-60 rounded-2xl border border-slate-200 bg-[#FDFBF7] py-2 shadow-xl"
              role="menu"
            >
              {/* User info header */}
              <div className="px-4 py-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#df2b1b] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {userInitials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {session?.user?.name || t('user')}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {session?.user?.email}
                    </p>
                  </div>
                </div>
                {roleBadge && (
                  <div className="mt-2.5">
                    <span className="inline-flex items-center rounded-lg bg-[#df2b1b]/10 px-2.5 py-1 text-[11px] font-semibold text-[#df2b1b]">
                      {roleBadge}
                    </span>
                  </div>
                )}
              </div>

              {/* Menu items */}
              <div className="py-1.5 px-2">
                <Link
                  href="/admin/profile"
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                  role="menuitem"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="font-medium">{t('profile')}</p>
                    <p className="text-xs text-slate-400">View profile</p>
                  </div>
                </Link>
                <Link
                  href="/admin/settings"
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                  role="menuitem"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Settings className="h-4 w-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="font-medium">{t('nav.settings')}</p>
                    <p className="text-xs text-slate-400">Preferences</p>
                  </div>
                </Link>
              </div>

              {/* Sign out */}
              <div className="border-t border-slate-100 pt-1.5 px-2 pb-0.5">
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  role="menuitem"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                    <LogOut className="h-4 w-4 text-red-500" />
                  </div>
                  <div>
                    <p className="font-medium">{t('signOut')}</p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function getRoleBadge(role: string): string {
  switch (role) {
    case 'SUPER_ADMIN': return 'Super Admin';
    case 'ADMIN': return 'Admin';
    case 'MANAGER': return 'Manager';
    default: return role;
  }
}
