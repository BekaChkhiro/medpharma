import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format price with currency symbol
 * Uses a deterministic format to avoid hydration mismatches
 */
export function formatPrice(
  price: number,
  options: {
    currency?: 'GEL' | 'USD' | 'EUR';
    locale?: 'ka-GE' | 'en-US';
  } = {}
): string {
  const { currency = 'GEL', locale = 'ka-GE' } = options;

  // Format number with 2 decimal places
  const formattedNumber = price.toFixed(2);

  // Use deterministic format based on locale to avoid hydration mismatch
  if (locale === 'ka-GE') {
    // Georgian format: "12.99 ₾"
    const currencySymbol = currency === 'GEL' ? '₾' : currency;
    return `${formattedNumber} ${currencySymbol}`;
  }

  // English format: "GEL 12.99" or "$12.99"
  const currencySymbols: Record<string, string> = {
    GEL: 'GEL',
    USD: '$',
    EUR: '€',
  };
  const symbol = currencySymbols[currency] || currency;

  if (currency === 'GEL') {
    return `${symbol} ${formattedNumber}`;
  }
  return `${symbol}${formattedNumber}`;
}

/**
 * Generate URL-safe slug from text
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate unique slug with timestamp if needed
 */
export function generateSlug(text: string, addTimestamp = false): string {
  const slug = slugify(text);
  if (addTimestamp) {
    return `${slug}-${Date.now()}`;
  }
  return slug;
}

/**
 * Truncate text to specified length
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '...';
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Generate order number in MF-YYYYNNNN format
 */
export function generateOrderNumber(sequence: number): string {
  const year = new Date().getFullYear();
  const paddedSequence = sequence.toString().padStart(4, '0');
  return `MF-${year}${paddedSequence}`;
}

/**
 * Check if value is defined (not null or undefined)
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Serialize data for passing from Server Components to Client Components
 * Converts Prisma Decimal objects and Date objects to plain values
 */
export function serialize<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_, value) => {
      // Convert Decimal to number
      if (value !== null && typeof value === 'object' && 'toNumber' in value) {
        return Number(value);
      }
      return value;
    })
  );
}
