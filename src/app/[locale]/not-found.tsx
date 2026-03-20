/**
 * Not Found Page
 * Displayed when a page is not found within a locale
 */

import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';

export default function NotFound() {
  const t = useTranslations('errors');

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
          <div className="text-center">
            <h1 className="text-9xl font-bold text-gray-200">404</h1>
            <h2 className="mt-4 text-2xl font-semibold text-gray-900">
              {t('notFound')}
            </h2>
            <p className="mt-2 text-gray-600">{t('general')}</p>
            <Link
              href="/"
              className="mt-8 inline-block rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
            >
              {/* Go Home */}
              ← Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
