'use client';

import { useState, useRef, useEffect } from 'react';

import { useLocale } from 'next-intl';

import { locales, localeNames, localeFlags } from '@/i18n/config';
import { usePathname, useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLocaleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm font-medium',
          'hover:bg-secondary transition-colors',
          'focus:outline-none focus-ring'
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="text-base">{localeFlags[locale as keyof typeof localeFlags]}</span>
        <span className="hidden sm:inline">{localeNames[locale as keyof typeof localeNames]}</span>
        <svg
          className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute top-full right-0 mt-1 py-1 min-w-[140px]',
            'bg-card border border-border rounded-md shadow-lg',
            'z-50 animate-fadeIn'
          )}
          role="listbox"
        >
          {locales.map((loc) => (
            <button
              key={loc}
              type="button"
              role="option"
              aria-selected={locale === loc}
              onClick={() => handleLocaleChange(loc)}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 text-sm',
                'hover:bg-secondary transition-colors',
                locale === loc && 'bg-secondary font-medium'
              )}
            >
              <span className="text-base">{localeFlags[loc as keyof typeof localeFlags]}</span>
              <span>{localeNames[loc as keyof typeof localeNames]}</span>
              {locale === loc && (
                <svg className="w-4 h-4 ml-auto text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
