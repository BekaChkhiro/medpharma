/**
 * next-intl Routing Configuration
 * Defines routing behavior for internationalized pages
 */

import { defineRouting } from 'next-intl/routing';

import { locales, defaultLocale } from './config';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches (Georgian is default)
  defaultLocale,

  // Don't add prefix for default locale (ka)
  // So /products instead of /ka/products
  localePrefix: 'as-needed',
});
