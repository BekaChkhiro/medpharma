/**
 * next-intl Request Configuration
 * Server-side configuration for i18n in Server Components
 */

import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';

import { locales, defaultLocale } from './config';

export default getRequestConfig(async ({ requestLocale }) => {
  // Typically corresponds to the `[locale]` segment
  const requested = await requestLocale;
  const locale = hasLocale(locales, requested) ? requested : defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
