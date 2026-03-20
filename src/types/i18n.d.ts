/**
 * Type definitions for next-intl
 * Enables type-safe translations throughout the application
 */

import type ka from '../../messages/ka.json';

type Messages = typeof ka;

declare global {
  // Use type safe message keys with `auto-complete`
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface IntlMessages extends Messages {}
}
