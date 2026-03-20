/**
 * Prisma Client Singleton
 * Prevents multiple instances during hot reload in development
 *
 * For Prisma 7.x, the database URL is configured in prisma.config.ts
 */

import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

import { PrismaClient } from '@/generated/prisma';

// Create PostgreSQL connection pool
const connectionString = process.env.DATABASE_URL;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

function createPrismaClient() {
  // If using standard PostgreSQL connection
  if (connectionString && !connectionString.startsWith('prisma+')) {
    const pool = globalForPrisma.pool ?? new Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.pool = pool;
    }

    return new PrismaClient({
      adapter,
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'error', 'warn']
          : ['error'],
    });
  }

  // If using Prisma Postgres (prisma+ URL) or no adapter needed
  return new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}

// Re-export Prisma types for convenience
export type { PrismaClient };
export {
  AdminRole,
  DosageForm,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
} from '@/generated/prisma';

// Re-export model types
export type {
  AdminUser,
  Category,
  Product,
  ProductImage,
  DeliveryZone,
  Order,
  OrderItem,
  Banner,
  Page,
  SiteSetting,
} from '@/generated/prisma';
