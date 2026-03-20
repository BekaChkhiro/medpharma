/**
 * Prisma client re-export
 * Provides a consistent import path for the database client
 */

import { db } from './db';

// Re-export db as prisma for convenience
export const prisma = db;
