/**
 * Full-Text Search Utilities for MedPharma Plus
 *
 * Uses PostgreSQL GIN indexes with tsvector for fast bilingual search
 * (Georgian + English) across products, categories, and pages.
 *
 * @module lib/search
 */

import { Prisma } from "@/generated/prisma";

/**
 * Normalizes a search query for PostgreSQL full-text search
 * Handles Georgian and English text, removes special characters
 *
 * @param query - Raw search query from user input
 * @returns Normalized query string for tsquery
 */
export function normalizeSearchQuery(query: string): string {
  // Remove special characters that could break tsquery
  // Keep Georgian unicode range (U+10A0 to U+10FF)
  const normalized = query
    .trim()
    .toLowerCase()
    // Remove PostgreSQL tsquery special characters
    .replace(/[&|!():*<>]/g, " ")
    // Collapse multiple spaces
    .replace(/\s+/g, " ")
    .trim();

  return normalized;
}

/**
 * Converts a search query to PostgreSQL tsquery format
 * Uses 'simple' configuration for language-agnostic search
 *
 * @param query - Normalized search query
 * @returns tsquery string with prefix matching
 */
export function toTsQuery(query: string): string {
  const normalized = normalizeSearchQuery(query);

  if (!normalized) {
    return "";
  }

  // Split into words and create prefix-match query
  // e.g., "aspirin 500" -> "aspirin:* & 500:*"
  const terms = normalized.split(" ").filter(Boolean);

  if (terms.length === 0) {
    return "";
  }

  // Use prefix matching (:*) for partial word matches
  return terms.map((term) => `${term}:*`).join(" & ");
}

/**
 * Creates a Prisma raw SQL fragment for product full-text search
 *
 * @param query - Search query string
 * @returns Prisma.Sql fragment for WHERE clause
 *
 * @example
 * const products = await prisma.$queryRaw`
 *   SELECT * FROM products
 *   WHERE ${productSearchCondition("aspirin")}
 *   ORDER BY ${productSearchRank("aspirin")} DESC
 * `;
 */
export function productSearchCondition(query: string): Prisma.Sql {
  const tsquery = toTsQuery(query);

  if (!tsquery) {
    return Prisma.sql`TRUE`;
  }

  return Prisma.sql`"search_vector" @@ to_tsquery('simple', ${tsquery})`;
}

/**
 * Creates a Prisma raw SQL fragment for ranking search results
 *
 * @param query - Search query string
 * @returns Prisma.Sql fragment for ORDER BY clause
 */
export function productSearchRank(query: string): Prisma.Sql {
  const tsquery = toTsQuery(query);

  if (!tsquery) {
    return Prisma.sql`1`;
  }

  return Prisma.sql`ts_rank("search_vector", to_tsquery('simple', ${tsquery}))`;
}

/**
 * Highlights matching terms in search results
 *
 * @param query - Search query string
 * @param column - Column name to highlight (e.g., 'nameKa', 'nameEn')
 * @returns Prisma.Sql fragment for SELECT clause
 */
export function searchHighlight(
  query: string,
  column: string
): Prisma.Sql {
  const tsquery = toTsQuery(query);

  if (!tsquery) {
    return Prisma.sql`${Prisma.raw(`"${column}"`)}`;
  }

  return Prisma.sql`ts_headline('simple', ${Prisma.raw(`"${column}"`)}, to_tsquery('simple', ${tsquery}), 'StartSel=<mark>, StopSel=</mark>, MaxWords=50, MinWords=25')`;
}

/**
 * Creates a trigram similarity search condition for fuzzy matching
 * Uses pg_trgm extension for typo-tolerant search
 *
 * @param query - Search query string
 * @param column - Column to search (e.g., 'orderNumber', 'customerName')
 * @param threshold - Similarity threshold (0-1, default 0.3)
 * @returns Prisma.Sql fragment for WHERE clause
 */
export function trigramSearch(
  query: string,
  column: string,
  threshold: number = 0.3
): Prisma.Sql {
  const normalized = normalizeSearchQuery(query);

  if (!normalized) {
    return Prisma.sql`TRUE`;
  }

  return Prisma.sql`similarity(${Prisma.raw(`"${column}"`)}, ${normalized}) > ${threshold}`;
}

/**
 * Interface for search options
 */
export interface SearchOptions {
  /** Search query string */
  query: string;
  /** Locale for language-specific results ('ka' or 'en') */
  locale?: "ka" | "en";
  /** Maximum number of results */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
  /** Minimum similarity for trigram search */
  similarityThreshold?: number;
}

/**
 * Interface for search result with ranking
 */
export interface SearchResult<T> {
  /** Search result item */
  item: T;
  /** Search relevance rank (higher is better) */
  rank: number;
  /** Highlighted text snippets */
  highlights?: {
    nameKa?: string;
    nameEn?: string;
  };
}

/**
 * Escapes special characters for LIKE queries
 *
 * @param value - String to escape
 * @returns Escaped string safe for LIKE
 */
export function escapeLike(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
}

/**
 * Creates a ILIKE pattern for prefix search
 *
 * @param query - Search query
 * @returns Pattern string for ILIKE
 */
export function prefixPattern(query: string): string {
  const normalized = normalizeSearchQuery(query);
  return `${escapeLike(normalized)}%`;
}

/**
 * Creates a ILIKE pattern for contains search
 *
 * @param query - Search query
 * @returns Pattern string for ILIKE
 */
export function containsPattern(query: string): string {
  const normalized = normalizeSearchQuery(query);
  return `%${escapeLike(normalized)}%`;
}
