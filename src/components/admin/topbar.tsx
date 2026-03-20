'use client';

import { useState, useRef, useEffect } from 'react';

import {
  Menu,
  Bell,
  User,
  LogOut,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import { IconButton, Avatar, Spinner } from '@/components/ui';
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

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close user menu on escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false);
      }
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
        'sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--background)] px-4 transition-all duration-300',
        // Adjust left margin based on sidebar state
        isSidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64'
      )}
    >
      {/* Left side */}
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <IconButton
          variant="ghost"
          size="sm"
          onClick={onMenuClick}
          className="lg:hidden"
          aria-label={t('openSidebar')}
        >
          <Menu className="h-5 w-5" />
        </IconButton>

        {/* Page title or breadcrumb could go here */}
        <h1 className="text-lg font-semibold text-[var(--foreground)] hidden sm:block">
          {t('dashboard.title')}
        </h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <IconButton
          variant="ghost"
          size="sm"
          aria-label={t('notifications')}
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {/* Notification badge - uncomment when needed */}
          {/* <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--destructive)] text-[10px] font-medium text-white">
            3
          </span> */}
        </IconButton>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className={cn(
              'flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors',
              'hover:bg-[var(--secondary)]',
              isUserMenuOpen && 'bg-[var(--secondary)]'
            )}
            aria-expanded={isUserMenuOpen}
            aria-haspopup="true"
          >
            {status === 'loading' ? (
              <Spinner size="sm" />
            ) : (
              <>
                <Avatar size="sm" fallback={userInitials} />
                <div className="hidden flex-col items-start text-left md:flex">
                  <span className="text-sm font-medium text-[var(--foreground)]">
                    {session?.user?.name || t('user')}
                  </span>
                  {roleBadge && (
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {roleBadge}
                    </span>
                  )}
                </div>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 text-[var(--muted-foreground)] transition-transform hidden md:block',
                    isUserMenuOpen && 'rotate-180'
                  )}
                />
              </>
            )}
          </button>

          {/* Dropdown Menu */}
          {isUserMenuOpen && (
            <div
              className={cn(
                'absolute right-0 top-full mt-2 w-56 rounded-lg border border-[var(--border)] bg-[var(--background)] py-1 shadow-lg',
                'animate-in fade-in-0 zoom-in-95'
              )}
              role="menu"
            >
              {/* User info (mobile) */}
              <div className="border-b border-[var(--border)] px-4 py-3 md:hidden">
                <p className="text-sm font-medium text-[var(--foreground)]">
                  {session?.user?.name || t('user')}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {session?.user?.email}
                </p>
                {roleBadge && (
                  <span className="mt-1 inline-block rounded bg-[var(--secondary)] px-1.5 py-0.5 text-xs font-medium text-[var(--foreground)]">
                    {roleBadge}
                  </span>
                )}
              </div>

              {/* Menu items */}
              <div className="py-1">
                <Link
                  href="/admin/profile"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--secondary)]"
                  role="menuitem"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  {t('profile')}
                </Link>
                <Link
                  href="/admin/settings"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--secondary)]"
                  role="menuitem"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  {t('nav.settings')}
                </Link>
              </div>

              <div className="border-t border-[var(--border)] py-1">
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-[var(--destructive)] hover:bg-[var(--secondary)]"
                  role="menuitem"
                >
                  <LogOut className="h-4 w-4" />
                  {t('signOut')}
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
    case 'SUPER_ADMIN':
      return 'Super Admin';
    case 'ADMIN':
      return 'Admin';
    case 'MANAGER':
      return 'Manager';
    default:
      return role;
  }
}
