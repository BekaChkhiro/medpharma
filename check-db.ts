import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from './src/generated/prisma';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const count = await prisma.product.count();
  console.log('Product count:', count);
  if (count > 0) {
    const products = await prisma.product.findMany({ take: 3, select: { slug: true, nameEn: true } });
    console.log('Products:', JSON.stringify(products, null, 2));
  }
}
main().then(() => prisma.$disconnect()).catch(console.error);
