'use client';

import { useState, useEffect } from 'react';

import Image from 'next/image';

import { useTranslations } from 'next-intl';

import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

import { LanguageSwitcher } from './language-switcher';
import { SearchBar } from './search-bar';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const navLinks = [
  { href: '/', labelKey: 'home' },
  { href: '/products', labelKey: 'products' },
  { href: '/about', labelKey: 'about' },
  { href: '/branches', labelKey: 'branches' },
  { href: '/contact', labelKey: 'contact' },
] as const;

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const t = useTranslations('nav');
  const pathname = usePathname();

  // Close menu on route change
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fadeIn lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Menu Panel */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 w-full max-w-sm z-50 lg:hidden',
          'bg-[#FDFBF7]/90 backdrop-blur-xl',
          'flex flex-col shadow-xl',
          'animate-slideInLeft'
        )}
        role="dialog"
        aria-modal="true"
        aria-label={t('menu')}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Image
              src="/images/medpharma-logo.png"
              alt="MedPharma Plus"
              width={36}
              height={36}
              className="w-9 h-9"
            />
            <span className="text-lg font-semibold text-slate-900">მედფარმა პლუსი</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={cn(
              'p-2 rounded-full',
              'text-slate-500 hover:text-slate-700 hover:bg-slate-100',
              'transition-colors focus:outline-none focus-ring'
            )}
            aria-label="Close menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-slate-200">
          <SearchBar variant="compact" />
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-2 py-4">
          <ul className="space-y-1">
            {navLinks.map((link) => {
              const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium',
                      'transition-colors',
                      isActive
                        ? 'bg-red-50 text-red-600'
                        : 'text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-slate-200 space-y-4">
          {/* Language Switcher */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Language</span>
            <LanguageSwitcher />
          </div>

          {/* Contact Info */}
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            <a href="tel:+995322000000" className="hover:text-slate-900 transition-colors">
              +995 32 200 00 00
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

// Hamburger button component
interface HamburgerButtonProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

export function HamburgerButton({ isOpen, onClick, className }: HamburgerButtonProps) {
  const t = useTranslations('nav');

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'p-2 rounded-lg lg:hidden',
        'text-slate-700 hover:bg-slate-100',
        'transition-colors focus:outline-none focus-ring',
        className
      )}
      aria-expanded={isOpen}
      aria-label={isOpen ? 'Close menu' : t('menu')}
    >
      <div className="w-6 h-5 relative flex flex-col justify-between">
        <span
          className={cn(
            'block w-full h-0.5 bg-current transition-transform duration-200',
            isOpen && 'translate-y-2 rotate-45'
          )}
        />
        <span
          className={cn(
            'block w-full h-0.5 bg-current transition-opacity duration-200',
            isOpen && 'opacity-0'
          )}
        />
        <span
          className={cn(
            'block w-full h-0.5 bg-current transition-transform duration-200',
            isOpen && '-translate-y-2 -rotate-45'
          )}
        />
      </div>
    </button>
  );
}
