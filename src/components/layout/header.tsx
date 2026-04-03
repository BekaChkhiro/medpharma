'use client';

import { useState, useEffect } from 'react';

import Image from 'next/image';

import { useTranslations } from 'next-intl';

import { Container } from '@/components/ui';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from './language-switcher';
import { MiniCart } from './mini-cart';
import { MobileMenu, HamburgerButton } from './mobile-menu';
import { SearchBar } from './search-bar';

// Search Overlay component for mobile
function SearchOverlay({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const t = useTranslations('nav');

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

  // Prevent body scroll when open
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

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-fadeIn lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Search Panel */}
      <div
        className={cn(
          'fixed top-0 left-0 right-0 z-50 lg:hidden',
          'bg-white/95 backdrop-blur-xl shadow-lg',
          'animate-slideInTop'
        )}
        role="dialog"
        aria-modal="true"
        aria-label={t('search')}
      >
        <div className="flex items-center gap-2 p-4">
          {/* Search Input */}
          <div className="flex-1">
            <SearchBar variant="compact" onResultClick={onClose} />
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className={cn(
              'p-2 rounded-full shrink-0',
              'text-slate-500 hover:text-slate-700 hover:bg-slate-100',
              'transition-colors focus:outline-none focus-ring'
            )}
            aria-label="Close search"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}

const navLinks = [
  { href: '/', labelKey: 'home' },
  { href: '/products', labelKey: 'products' },
  { href: '/about', labelKey: 'about' },
  { href: '/branches', labelKey: 'branches' },
  { href: '/contact', labelKey: 'contact' },
] as const;

export function Header() {
  const t = useTranslations();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-[#FDFBF7]/95 backdrop-blur-xl supports-[backdrop-filter]:bg-[#FDFBF7]/80">
      {/* Top Bar */}
      <div className="hidden sm:block bg-slate-900 text-slate-300">
        <Container>
          <div className="flex items-center justify-between py-1.5 text-xs">
            {/* Left - Contact & Hours */}
            <div className="flex items-center gap-5">
              <a
                href="tel:+995322000000"
                className="flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span>+995 32 200 00 00</span>
              </a>
              <div className="flex items-center gap-1.5 text-slate-400">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{t('header.workingHours')}</span>
              </div>
            </div>

            {/* Right - Free Delivery Notice */}
            <div className="flex items-center gap-1.5 text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                />
              </svg>
              <span>{t('header.freeDelivery', { amount: 100 })}</span>
            </div>
          </div>
        </Container>
      </div>

      {/* Main Header */}
      <div className="border-b border-slate-200">
        <Container>
          <div className="flex items-center justify-between gap-4 py-4">
            {/* Left - Logo & Mobile Menu */}
            <div className="flex items-center gap-2">
              <HamburgerButton
                isOpen={mobileMenuOpen}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              />
              <Link
                href="/"
                className="flex items-center gap-2.5 text-xl font-bold text-slate-900 hover:opacity-80 transition-opacity"
              >
                <Image
                  src="/images/medpharma-logo.png"
                  alt="MedPharma Plus"
                  width={44}
                  height={44}
                  className="w-11 h-11"
                  priority
                />
                <span className="hidden sm:inline">მედფარმა პლუსი</span>
              </Link>
            </div>

            {/* Center - Search Bar (Desktop) */}
            <div className="hidden lg:flex flex-1 mx-8">
              <SearchBar className="w-full" />
            </div>

            {/* Right - Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search Button (Mobile) */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-full text-slate-700 hover:bg-slate-100 transition-colors lg:hidden focus:outline-none focus-ring"
                aria-label={t('nav.search')}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>

              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Mini Cart */}
              <MiniCart />
            </div>
          </div>
        </Container>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden lg:block border-b border-slate-100 bg-[#FDFBF7]/80 backdrop-blur-md">
        <Container>
          <ul className="flex items-center gap-0.5">
            {navLinks.map((link) => {
              const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      'inline-flex items-center px-4 py-3 text-sm font-medium',
                      'transition-colors',
                      isActive
                        ? 'text-red-600 border-b-2 border-red-600 hover:text-red-700'
                        : 'text-slate-500 hover:text-slate-900'
                    )}
                  >
                    {t(`nav.${link.labelKey}`)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </Container>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Search Overlay (Mobile) */}
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
