'use client';

import { useState, useEffect } from 'react';

import { cn } from '@/lib/utils';

import { AdminSidebar } from './sidebar';
import { AdminTopBar } from './topbar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const SIDEBAR_COLLAPSED_KEY = 'admin-sidebar-collapsed';

// Initialize collapsed state from localStorage
function getInitialCollapsedState(): boolean {
  if (typeof window === 'undefined') return false;
  const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
  return saved !== null ? JSON.parse(saved) : false;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(getInitialCollapsedState);

  // Save collapsed state to localStorage
  const handleToggleCollapse = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, JSON.stringify(newState));
  };

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isSidebarOpen]);

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--secondary)]">
      {/* Sidebar */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onClose={() => setIsSidebarOpen(false)}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* Main Content Area */}
      <div
        className={cn(
          'flex min-h-screen flex-col transition-all duration-300',
          isSidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64'
        )}
      >
        {/* Top Bar */}
        <AdminTopBar
          onMenuClick={() => setIsSidebarOpen(true)}
          isSidebarCollapsed={isSidebarCollapsed}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-[var(--border)] bg-[var(--background)] px-4 py-3 text-center text-sm text-[var(--muted-foreground)]">
          © {new Date().getFullYear()} MedPharma Plus. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
