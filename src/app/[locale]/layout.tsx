/**
 * Locale Layout
 * Provides internationalization context to all pages within the [locale] segment
 */

import { Geist, Geist_Mono } from 'next/font/google';
import { notFound } from 'next/navigation';

import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';

import { locales, type Locale } from '@/i18n/config';
import { ScrollToTop } from '@/components/scroll-to-top';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * Generate static params for all supported locales
 * This enables static generation for each locale
 */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

/**
 * Generate metadata based on locale
 */
export async function generateMetadata({ params }: Props) {
  const { locale } = await params;

  const metadata: Record<Locale, { title: string; description: string }> = {
    ka: {
      title: 'მედფარმა პლუსი - ონლაინ აფთიაქი',
      description:
        'მედფარმა პლუსი - თქვენი სანდო ონლაინ აფთიაქი. შეიძინეთ მედიკამენტები სწრაფი მიწოდებით.',
    },
    en: {
      title: 'MedPharma Plus - Online Pharmacy',
      description:
        'MedPharma Plus - Your trusted online pharmacy. Order medications with fast delivery.',
    },
  };

  const safeLocale = hasLocale(locales, locale) ? locale : 'ka';

  return {
    title: {
      default: metadata[safeLocale].title,
      template: `%s | ${safeLocale === 'ka' ? 'მედფარმა პლუსი' : 'MedPharma Plus'}`,
    },
    description: metadata[safeLocale].description,
    keywords:
      safeLocale === 'ka'
        ? 'აფთიაქი, მედიკამენტები, ონლაინ აფთიაქი, წამლები, ჯანმრთელობა'
        : 'pharmacy, medications, online pharmacy, drugs, health',
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Validate that the incoming `locale` parameter is valid
  if (!hasLocale(locales, locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Fetch messages for the current locale
  const messages = await getMessages();

  return (
    <html lang={locale} className="light" style={{ colorScheme: 'light' }} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[#FDFBF7] text-slate-800 font-sans antialiased`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ScrollToTop />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
