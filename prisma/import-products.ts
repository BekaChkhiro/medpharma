/**
 * Product Import Script
 * Imports all products from PDF/DOCX catalog into the database
 *
 * Run with: npx tsx prisma/import-products.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from '../src/generated/prisma';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Helper to create slugs from Georgian text
function slugify(text: string): string {
  const map: Record<string, string> = {
    'ა': 'a', 'ბ': 'b', 'გ': 'g', 'დ': 'd', 'ე': 'e', 'ვ': 'v',
    'ზ': 'z', 'თ': 't', 'ი': 'i', 'კ': 'k', 'ლ': 'l', 'მ': 'm',
    'ნ': 'n', 'ო': 'o', 'პ': 'p', 'ჟ': 'zh', 'რ': 'r', 'ს': 's',
    'ტ': 't', 'უ': 'u', 'ფ': 'f', 'ქ': 'q', 'ღ': 'gh', 'ყ': 'y',
    'შ': 'sh', 'ჩ': 'ch', 'ც': 'ts', 'ძ': 'dz', 'წ': 'ts', 'ჭ': 'ch',
    'ხ': 'kh', 'ჯ': 'j', 'ჰ': 'h',
  };

  return text
    .split('')
    .map((char) => map[char] || char)
    .join('')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// ============================================================================
// CATEGORIES
// ============================================================================
const categories = [
  {
    slug: 'shaqris-shemtsveleli',
    nameKa: 'შაქრის შემცვლელები',
    nameEn: 'Sugar Substitutes',
    descKa: 'შაქრის შემცვლელები - სტევია, ფრუქტოზა, ერითრიტოლი და სხვა',
    descEn: 'Sugar substitutes - stevia, fructose, erythritol and more',
    sortOrder: 1,
  },
  {
    slug: 'cikoris-yava',
    nameKa: 'ციკორის ყავა',
    nameEn: 'Chicory Coffee',
    descKa: 'ციკორის ყავა - კოფეინის გარეშე, ჯანსაღი ალტერნატივა',
    descEn: 'Chicory coffee - caffeine-free, healthy alternative',
    sortOrder: 2,
  },
  {
    slug: 'batonchiki-sneqebi',
    nameKa: 'ბატონჩიკები და სნექები',
    nameEn: 'Bars & Snacks',
    descKa: 'უშაქრო ბატონჩიკები და ჯანსაღი სნექები',
    descEn: 'Sugar-free bars and healthy snacks',
    sortOrder: 3,
  },
  {
    slug: 'dabaltsilovani-mevalia',
    nameKa: 'დაბალცილოვანი პროდუქცია (Mevalia)',
    nameEn: 'Low Protein Products (Mevalia)',
    descKa: 'იტალიური დაბალცილოვანი პროდუქტები Mevalia-სგან',
    descEn: 'Italian low-protein products from Mevalia',
    sortOrder: 4,
  },
  {
    slug: 'dabaltsilovani-macmaster',
    nameKa: 'დაბალცილოვანი პროდუქცია (МакМастер)',
    nameEn: 'Low Protein Products (MacMaster)',
    descKa: 'დაბალცილოვანი პროდუქტები МакМастер-ისგან',
    descEn: 'Low-protein products from MacMaster',
    sortOrder: 5,
  },
];

// ============================================================================
// PRODUCTS DATA (extracted from PDF)
// ============================================================================
interface ProductData {
  num: number;
  nameKa: string;
  nameEn: string;
  brand: string;
  manufacturer: string;
  country: string;
  price: number;
  categorySlug: string;
  shortDescKa?: string;
  shortDescEn?: string;
}

const products: ProductData[] = [
  // === შაქრის შემცვლელები (Sugar Substitutes) ===
  {
    num: 1,
    nameKa: 'სტევიას ტაბლეტები N150',
    nameEn: 'Stevia Tablets N150',
    brand: 'Novasweet',
    manufacturer: 'novasweet',
    country: 'რუსეთი',
    price: 8.00,
    categorySlug: 'shaqris-shemtsveleli',
    shortDescKa: 'სტევიას ტაბლეტები 150 ცალი',
    shortDescEn: 'Stevia tablets 150 pcs',
  },
  {
    num: 2,
    nameKa: 'სტევიას ტაბლეტები N350',
    nameEn: 'Stevia Tablets N350',
    brand: 'Novasweet',
    manufacturer: 'novasweet',
    country: 'რუსეთი',
    price: 14.00,
    categorySlug: 'shaqris-shemtsveleli',
    shortDescKa: 'სტევიას ტაბლეტები 350 ცალი',
    shortDescEn: 'Stevia tablets 350 pcs',
  },
  {
    num: 3,
    nameKa: 'ნოვასვიტ შაქრის შემცვლელი ტაბლეტები №650',
    nameEn: 'Novasweet Sugar Substitute Tablets №650',
    brand: 'Novasweet',
    manufacturer: 'novasweet',
    country: 'რუსეთი',
    price: 6.00,
    categorySlug: 'shaqris-shemtsveleli',
    shortDescKa: 'შაქრის შემცვლელი ტაბლეტები 650 ცალი',
    shortDescEn: 'Sugar substitute tablets 650 pcs',
  },
  {
    num: 4,
    nameKa: 'ნოვასვიტ შაქრის შემცვლელი ტაბლეტები №1200',
    nameEn: 'Novasweet Sugar Substitute Tablets №1200',
    brand: 'Novasweet',
    manufacturer: 'novasweet',
    country: 'რუსეთი',
    price: 7.50,
    categorySlug: 'shaqris-shemtsveleli',
    shortDescKa: 'შაქრის შემცვლელი ტაბლეტები 1200 ცალი',
    shortDescEn: 'Sugar substitute tablets 1200 pcs',
  },
  {
    num: 5,
    nameKa: 'ფრუქტოზა 500გ ნოვასვიტ',
    nameEn: 'Fructose 500g Novasweet',
    brand: 'Novasweet',
    manufacturer: 'novasweet',
    country: 'რუსეთი',
    price: 10.00,
    categorySlug: 'shaqris-shemtsveleli',
    shortDescKa: 'ნატურალური ფრუქტოზა 500 გრამი',
    shortDescEn: 'Natural fructose 500g',
  },
  {
    num: 6,
    nameKa: 'ფრუქტოზა 1კგ ნოვასვიტი',
    nameEn: 'Fructose 1kg Novasweet',
    brand: 'Novasweet',
    manufacturer: 'novasweet',
    country: 'რუსეთი',
    price: 22.00,
    categorySlug: 'shaqris-shemtsveleli',
    shortDescKa: 'ნატურალური ფრუქტოზა 1 კილოგრამი',
    shortDescEn: 'Natural fructose 1kg',
  },
  {
    num: 7,
    nameKa: 'სტევია ნოვასვიტის 200გ',
    nameEn: 'Stevia Novasweet 200g',
    brand: 'Novasweet',
    manufacturer: 'novasweet',
    country: 'რუსეთი',
    price: 20.00,
    categorySlug: 'shaqris-shemtsveleli',
    shortDescKa: 'სტევია ფხვნილი 200 გრამი',
    shortDescEn: 'Stevia powder 200g',
  },
  {
    num: 8,
    nameKa: 'სტევია ბიონოვა 200გ',
    nameEn: 'Stevia Bionova 200g',
    brand: 'Bionova',
    manufacturer: 'Bionova',
    country: 'რუსეთი',
    price: 20.00,
    categorySlug: 'shaqris-shemtsveleli',
    shortDescKa: 'სტევია ბიონოვა 200 გრამი',
    shortDescEn: 'Stevia Bionova 200g',
  },
  {
    num: 9,
    nameKa: 'თხევადი სტევია 80გ',
    nameEn: 'Liquid Stevia 80g',
    brand: 'Bionova',
    manufacturer: 'Bionova',
    country: 'რუსეთი',
    price: 10.00,
    categorySlug: 'shaqris-shemtsveleli',
    shortDescKa: 'თხევადი სტევია 80 გრამი',
    shortDescEn: 'Liquid stevia 80g',
  },
  {
    num: 10,
    nameKa: 'თხევადი სტევია ინულინით 80გ',
    nameEn: 'Liquid Stevia with Inulin 80g',
    brand: 'Bionova',
    manufacturer: 'Bionova',
    country: 'რუსეთი',
    price: 10.00,
    categorySlug: 'shaqris-shemtsveleli',
    shortDescKa: 'თხევადი სტევია ინულინით 80 გრამი',
    shortDescEn: 'Liquid stevia with inulin 80g',
  },
  {
    num: 11,
    nameKa: 'ერითრიტოლი შაქრის შემცვლელი (ნესვის შაქარი) 200გ',
    nameEn: 'Erythritol Sugar Substitute (Melon Sugar) 200g',
    brand: 'Bionova',
    manufacturer: 'Bionova',
    country: 'რუსეთი',
    price: 9.00,
    categorySlug: 'shaqris-shemtsveleli',
    shortDescKa: 'ერითრიტოლი 200 გრამი',
    shortDescEn: 'Erythritol 200g',
  },
  {
    num: 12,
    nameKa: 'ქოქოსის შაქარი 200გ ბიონოვა',
    nameEn: 'Coconut Sugar 200g Bionova',
    brand: 'Bionova',
    manufacturer: 'Bionova',
    country: 'რუსეთი',
    price: 9.00,
    categorySlug: 'shaqris-shemtsveleli',
    shortDescKa: 'ქოქოსის შაქარი 200 გრამი',
    shortDescEn: 'Coconut sugar 200g',
  },
  {
    num: 13,
    nameKa: 'ქოქოსის შაქარი 500გ ბიონოვა',
    nameEn: 'Coconut Sugar 500g Bionova',
    brand: 'Bionova',
    manufacturer: 'Bionova',
    country: 'რუსეთი',
    price: 16.00,
    categorySlug: 'shaqris-shemtsveleli',
    shortDescKa: 'ქოქოსის შაქარი 500 გრამი',
    shortDescEn: 'Coconut sugar 500g',
  },

  // === ციკორის ყავა (Chicory Coffee) ===
  {
    num: 14,
    nameKa: 'ვარდკაჭაჭა ნატურალური ფხვნილი ხსნადი „ჩიკოროფი" (პაკეტი) 100გრ',
    nameEn: 'Chicoroff Natural Instant Chicory Powder (Pack) 100g',
    brand: 'Chikoroff',
    manufacturer: 'novasweet',
    country: 'რუსეთი',
    price: 7.00,
    categorySlug: 'cikoris-yava',
    shortDescKa: 'ნატურალური ციკორის ფხვნილი 100 გრამი',
    shortDescEn: 'Natural chicory powder 100g',
  },
  {
    num: 15,
    nameKa: 'ხსნადი ყავა ციკორი კაპუჩინო 100გ',
    nameEn: 'Instant Chicory Coffee Cappuccino 100g',
    brand: 'Chikoroff',
    manufacturer: 'novasweet',
    country: 'რუსეთი',
    price: 7.00,
    categorySlug: 'cikoris-yava',
    shortDescKa: 'ციკორი კაპუჩინოს არომატით 100 გრამი',
    shortDescEn: 'Chicory with cappuccino flavor 100g',
  },
  {
    num: 16,
    nameKa: 'ხსნადი ყავა ციკორი შოკოლადით 100გ',
    nameEn: 'Instant Chicory Coffee with Chocolate 100g',
    brand: 'Chikoroff',
    manufacturer: 'novasweet',
    country: 'რუსეთი',
    price: 7.00,
    categorySlug: 'cikoris-yava',
    shortDescKa: 'ციკორი შოკოლადის არომატით 100 გრამი',
    shortDescEn: 'Chicory with chocolate flavor 100g',
  },
  {
    num: 17,
    nameKa: 'ნოვაპროდუქტ ვარდკაჭაჭა აღმოსავლური 100გრ',
    nameEn: 'Novaproduct Chicory Oriental 100g',
    brand: 'Chikoroff',
    manufacturer: 'novasweet',
    country: 'რუსეთი',
    price: 7.00,
    categorySlug: 'cikoris-yava',
    shortDescKa: 'ციკორი აღმოსავლური არომატით 100 გრამი',
    shortDescEn: 'Chicory with oriental flavor 100g',
  },
  {
    num: 18,
    nameKa: 'ყავა ციკორი „ჟენშენით" 100გრ',
    nameEn: 'Chicory Coffee with Ginseng 100g',
    brand: 'Bionova',
    manufacturer: 'Bionova',
    country: 'რუსეთი',
    price: 7.00,
    categorySlug: 'cikoris-yava',
    shortDescKa: 'ციკორი ჟენშენის არომატით 100 გრამი',
    shortDescEn: 'Chicory with ginseng 100g',
  },
  {
    num: 19,
    nameKa: 'ყავა ციკორი „მოცვით" 100გრ',
    nameEn: 'Chicory Coffee with Blueberry 100g',
    brand: 'Bionova',
    manufacturer: 'Bionova',
    country: 'რუსეთი',
    price: 7.00,
    categorySlug: 'cikoris-yava',
    shortDescKa: 'ციკორი მოცვის არომატით 100 გრამი',
    shortDescEn: 'Chicory with blueberry 100g',
  },
  {
    num: 20,
    nameKa: 'ყავა ციკორის 100გრ',
    nameEn: 'Chicory Coffee Classic 100g',
    brand: 'Bionova',
    manufacturer: 'Bionova',
    country: 'რუსეთი',
    price: 7.00,
    categorySlug: 'cikoris-yava',
    shortDescKa: 'კლასიკური ციკორის ყავა 100 გრამი',
    shortDescEn: 'Classic chicory coffee 100g',
  },
  {
    num: 21,
    nameKa: 'ყავა ციკორის „ასკილით" 100გრ',
    nameEn: 'Chicory Coffee with Rosehip 100g',
    brand: 'Bionova',
    manufacturer: 'Bionova',
    country: 'რუსეთი',
    price: 7.00,
    categorySlug: 'cikoris-yava',
    shortDescKa: 'ციკორი ასკილის არომატით 100 გრამი',
    shortDescEn: 'Chicory with rosehip 100g',
  },
  {
    num: 22,
    nameKa: 'ყავა ციკორი „ჯინჯერით" 100გრ',
    nameEn: 'Chicory Coffee with Ginger 100g',
    brand: 'Bionova',
    manufacturer: 'Bionova',
    country: 'რუსეთი',
    price: 7.00,
    categorySlug: 'cikoris-yava',
    shortDescKa: 'ციკორი ჯინჯერის არომატით 100 გრამი',
    shortDescEn: 'Chicory with ginger 100g',
  },

  // === ბატონჩიკები და სნექები (Bars & Snacks) ===
  {
    num: 23,
    nameKa: 'ბატონჩიკი ქოქოსით და შოკოლადით უშაქრო 40გ',
    nameEn: 'Coconut & Chocolate Bar Sugar-Free 40g',
    brand: 'Bionova',
    manufacturer: 'Bionova',
    country: 'რუსეთი',
    price: 2.00,
    categorySlug: 'batonchiki-sneqebi',
    shortDescKa: 'უშაქრო ბატონჩიკი ქოქოსით და შოკოლადით 40გ',
    shortDescEn: 'Sugar-free bar with coconut and chocolate 40g',
  },
  {
    num: 24,
    nameKa: 'ბატონჩიკი მოცვით 35გ',
    nameEn: 'Blueberry Bar 35g',
    brand: 'OL Lite',
    manufacturer: 'ol lite',
    country: 'რუსეთი',
    price: 2.00,
    categorySlug: 'batonchiki-sneqebi',
    shortDescKa: 'ბატონჩიკი მოცვით 35 გრამი',
    shortDescEn: 'Blueberry bar 35g',
  },
  {
    num: 25,
    nameKa: 'ბატონჩიკი ქოქოსით და ნუშით 35გ',
    nameEn: 'Coconut & Almond Bar 35g',
    brand: 'OL Lite',
    manufacturer: 'ol lite',
    country: 'რუსეთი',
    price: 2.00,
    categorySlug: 'batonchiki-sneqebi',
    shortDescKa: 'ბატონჩიკი ქოქოსით და ნუშით 35 გრამი',
    shortDescEn: 'Coconut and almond bar 35g',
  },
  {
    num: 26,
    nameKa: 'ბატონჩიკი შოკოლადით და ბანანით 35გ',
    nameEn: 'Chocolate & Banana Bar 35g',
    brand: 'OL Lite',
    manufacturer: 'ol lite',
    country: 'რუსეთი',
    price: 2.00,
    categorySlug: 'batonchiki-sneqebi',
    shortDescKa: 'ბატონჩიკი შოკოლადით და ბანანით 35 გრამი',
    shortDescEn: 'Chocolate and banana bar 35g',
  },
  {
    num: 27,
    nameKa: 'ბატონჩიკი მოცხარით 35გ',
    nameEn: 'Currant Bar 35g',
    brand: 'OL Lite',
    manufacturer: 'ol lite',
    country: 'რუსეთი',
    price: 2.00,
    categorySlug: 'batonchiki-sneqebi',
    shortDescKa: 'ბატონჩიკი მოცხარით 35 გრამი',
    shortDescEn: 'Currant bar 35g',
  },
  {
    num: 28,
    nameKa: 'ბატონჩიკი ჟოლოთი 35გ',
    nameEn: 'Raspberry Bar 35g',
    brand: 'OL Lite',
    manufacturer: 'ol lite',
    country: 'რუსეთი',
    price: 2.00,
    categorySlug: 'batonchiki-sneqebi',
    shortDescKa: 'ბატონჩიკი ჟოლოთი 35 გრამი',
    shortDescEn: 'Raspberry bar 35g',
  },

  // === დაბალცილოვანი პროდუქცია Mevalia ===
  {
    num: 29,
    nameKa: 'ბრინჯი 400გ (დაბალი ცილის შემცველობით)',
    nameEn: 'Rice 400g (Low Protein)',
    brand: 'Mevalia',
    manufacturer: 'Mevalia',
    country: 'იტალია',
    price: 35.00,
    categorySlug: 'dabaltsilovani-mevalia',
    shortDescKa: 'დაბალცილოვანი ბრინჯი 400 გრამი',
    shortDescEn: 'Low protein rice 400g',
  },
  {
    num: 30,
    nameKa: 'მაკარონი 500გ (დაბალი ცილის შემცველობით)',
    nameEn: 'Pasta 500g (Low Protein)',
    brand: 'Mevalia',
    manufacturer: 'Mevalia',
    country: 'იტალია',
    price: 32.00,
    categorySlug: 'dabaltsilovani-mevalia',
    shortDescKa: 'დაბალცილოვანი მაკარონი 500 გრამი',
    shortDescEn: 'Low protein pasta 500g',
  },
  {
    num: 31,
    nameKa: 'მაკარონი სპირალი 500გ (დაბალი ცილის შემცველობით)',
    nameEn: 'Fusilli Pasta 500g (Low Protein)',
    brand: 'Mevalia',
    manufacturer: 'Mevalia',
    country: 'იტალია',
    price: 32.00,
    categorySlug: 'dabaltsilovani-mevalia',
    shortDescKa: 'დაბალცილოვანი მაკარონი სპირალი 500 გრამი',
    shortDescEn: 'Low protein fusilli pasta 500g',
  },
  {
    num: 32,
    nameKa: 'მაკარონი სპაგეტი 500გ (დაბალი ცილის შემცველობით)',
    nameEn: 'Spaghetti 500g (Low Protein)',
    brand: 'Mevalia',
    manufacturer: 'Mevalia',
    country: 'იტალია',
    price: 35.00,
    categorySlug: 'dabaltsilovani-mevalia',
    shortDescKa: 'დაბალცილოვანი სპაგეტი 500 გრამი',
    shortDescEn: 'Low protein spaghetti 500g',
  },
  {
    num: 33,
    nameKa: 'მაკარონი პენე 500გ (დაბალი ცილის შემცველობით)',
    nameEn: 'Penne Pasta 500g (Low Protein)',
    brand: 'Mevalia',
    manufacturer: 'Mevalia',
    country: 'იტალია',
    price: 32.00,
    categorySlug: 'dabaltsilovani-mevalia',
    shortDescKa: 'დაბალცილოვანი მაკარონი პენე 500 გრამი',
    shortDescEn: 'Low protein penne pasta 500g',
  },
  {
    num: 34,
    nameKa: 'ხილის ბარი 125გ (5x25გ) (დაბალი ცილის შემცველობით)',
    nameEn: 'Fruit Bar 125g (5x25g) (Low Protein)',
    brand: 'Mevalia',
    manufacturer: 'Mevalia',
    country: 'იტალია',
    price: 26.00,
    categorySlug: 'dabaltsilovani-mevalia',
    shortDescKa: 'დაბალცილოვანი ხილის ბარი 125 გრამი',
    shortDescEn: 'Low protein fruit bar 125g',
  },
  {
    num: 35,
    nameKa: 'FROLLINI ორცხობილა 200გ (დაბალი ცილის შემცველობით)',
    nameEn: 'Frollini Cookies 200g (Low Protein)',
    brand: 'Mevalia',
    manufacturer: 'Mevalia',
    country: 'იტალია',
    price: 26.00,
    categorySlug: 'dabaltsilovani-mevalia',
    shortDescKa: 'დაბალცილოვანი ორცხობილა FROLLINI 200 გრამი',
    shortDescEn: 'Low protein Frollini cookies 200g',
  },
  {
    num: 36,
    nameKa: 'COOKIES ორცხობილა 200გ (დაბალი ცილის შემცველობით)',
    nameEn: 'Cookies 200g (Low Protein)',
    brand: 'Mevalia',
    manufacturer: 'Mevalia',
    country: 'იტალია',
    price: 26.00,
    categorySlug: 'dabaltsilovani-mevalia',
    shortDescKa: 'დაბალცილოვანი ორცხობილა COOKIES 200 გრამი',
    shortDescEn: 'Low protein cookies 200g',
  },
  {
    num: 37,
    nameKa: 'პურის ფქვილი 500გ + 10გ (დაბალი ცილის შემცველობით)',
    nameEn: 'Bread Flour 500g + 10g (Low Protein)',
    brand: 'Mevalia',
    manufacturer: 'Mevalia',
    country: 'იტალია',
    price: 25.00,
    categorySlug: 'dabaltsilovani-mevalia',
    shortDescKa: 'დაბალცილოვანი პურის ფქვილი 510 გრამი',
    shortDescEn: 'Low protein bread flour 510g',
  },
  {
    num: 38,
    nameKa: 'PRO ZERO რძე 250მლ (დაბალი ცილის შემცველობით)',
    nameEn: 'PRO ZERO Milk 250ml (Low Protein)',
    brand: 'Mevalia',
    manufacturer: 'Mevalia',
    country: 'იტალია',
    price: 14.00,
    categorySlug: 'dabaltsilovani-mevalia',
    shortDescKa: 'დაბალცილოვანი რძე PRO ZERO 250 მლ',
    shortDescEn: 'Low protein milk PRO ZERO 250ml',
  },
  {
    num: 39,
    nameKa: 'PRO ZERO რძე შოკოლადის 250მლ (დაბალი ცილის შემცველობით)',
    nameEn: 'PRO ZERO Chocolate Milk 250ml (Low Protein)',
    brand: 'Mevalia',
    manufacturer: 'Mevalia',
    country: 'იტალია',
    price: 14.00,
    categorySlug: 'dabaltsilovani-mevalia',
    shortDescKa: 'დაბალცილოვანი შოკოლადის რძე PRO ZERO 250 მლ',
    shortDescEn: 'Low protein chocolate milk PRO ZERO 250ml',
  },

  // === დაბალცილოვანი პროდუქცია МакМастер ===
  {
    num: 40,
    nameKa: 'ვერმიშელი 350გ (დაბალი ცილის შემცველობით)',
    nameEn: 'Vermicelli 350g (Low Protein)',
    brand: 'MacMaster',
    manufacturer: 'МакМастер',
    country: 'რუსეთი',
    price: 8.50,
    categorySlug: 'dabaltsilovani-macmaster',
    shortDescKa: 'დაბალცილოვანი ვერმიშელი 350 გრამი',
    shortDescEn: 'Low protein vermicelli 350g',
  },
  {
    num: 41,
    nameKa: 'მაკარონი სპირალი 300გ (დაბალი ცილის შემცველობით)',
    nameEn: 'Fusilli Pasta 300g (Low Protein)',
    brand: 'MacMaster',
    manufacturer: 'МакМастер',
    country: 'რუსეთი',
    price: 8.50,
    categorySlug: 'dabaltsilovani-macmaster',
    shortDescKa: 'დაბალცილოვანი მაკარონი სპირალი 300 გრამი',
    shortDescEn: 'Low protein fusilli pasta 300g',
  },
  {
    num: 42,
    nameKa: 'მაკარონი პენე 300გ (დაბალი ცილის შემცველობით)',
    nameEn: 'Penne Pasta 300g (Low Protein)',
    brand: 'MacMaster',
    manufacturer: 'МакМастер',
    country: 'რუსეთი',
    price: 8.50,
    categorySlug: 'dabaltsilovani-macmaster',
    shortDescKa: 'დაბალცილოვანი მაკარონი პენე 300 გრამი',
    shortDescEn: 'Low protein penne pasta 300g',
  },
  {
    num: 43,
    nameKa: 'მაკარონი ნიჟარა 300გ (დაბალი ცილის შემცველობით)',
    nameEn: 'Shell Pasta 300g (Low Protein)',
    brand: 'MacMaster',
    manufacturer: 'МакМастер',
    country: 'რუსეთი',
    price: 8.50,
    categorySlug: 'dabaltsilovani-macmaster',
    shortDescKa: 'დაბალცილოვანი მაკარონი ნიჟარა 300 გრამი',
    shortDescEn: 'Low protein shell pasta 300g',
  },
  {
    num: 44,
    nameKa: 'მაკარონი ნიჟარა ბოსტნეული 300გ (დაბალი ცილის შემცველობით)',
    nameEn: 'Vegetable Shell Pasta 300g (Low Protein)',
    brand: 'MacMaster',
    manufacturer: 'МакМастер',
    country: 'რუსეთი',
    price: 8.50,
    categorySlug: 'dabaltsilovani-macmaster',
    shortDescKa: 'დაბალცილოვანი მაკარონი ნიჟარა ბოსტნეული 300 გრამი',
    shortDescEn: 'Low protein vegetable shell pasta 300g',
  },
  {
    num: 45,
    nameKa: 'ორცხობილა ჰარმონია შოკოლადის წვეთებით 200გ (დაბალი ცილის შემცველობით)',
    nameEn: 'Harmony Cookies with Chocolate Drops 200g (Low Protein)',
    brand: 'MacMaster',
    manufacturer: 'МакМастер',
    country: 'რუსეთი',
    price: 12.00,
    categorySlug: 'dabaltsilovani-macmaster',
    shortDescKa: 'დაბალცილოვანი ორცხობილა შოკოლადის წვეთებით 200 გრამი',
    shortDescEn: 'Low protein cookies with chocolate drops 200g',
  },
  {
    num: 46,
    nameKa: 'ორცხობილა ჟოლოს ჯემით 150გ (დაბალი ცილის შემცველობით)',
    nameEn: 'Cookies with Raspberry Jam 150g (Low Protein)',
    brand: 'MacMaster',
    manufacturer: 'МакМастер',
    country: 'რუსეთი',
    price: 12.00,
    categorySlug: 'dabaltsilovani-macmaster',
    shortDescKa: 'დაბალცილოვანი ორცხობილა ჟოლოს ჯემით 150 გრამი',
    shortDescEn: 'Low protein cookies with raspberry jam 150g',
  },
  {
    num: 47,
    nameKa: 'Grissini Sticks 100გ (დაბალი ცილის შემცველობით)',
    nameEn: 'Grissini Sticks 100g (Low Protein)',
    brand: 'MacMaster',
    manufacturer: 'МакМастер',
    country: 'რუსეთი',
    price: 12.00,
    categorySlug: 'dabaltsilovani-macmaster',
    shortDescKa: 'დაბალცილოვანი გრისინი 100 გრამი',
    shortDescEn: 'Low protein grissini sticks 100g',
  },
  {
    num: 48,
    nameKa: 'Grissini McMaster Sticks 140გრ (დაბალი ცილის შემცველობით)',
    nameEn: 'Grissini McMaster Sticks 140g (Low Protein)',
    brand: 'MacMaster',
    manufacturer: 'МакМастер',
    country: 'რუსეთი',
    price: 12.00,
    categorySlug: 'dabaltsilovani-macmaster',
    shortDescKa: 'დაბალცილოვანი გრისინი მაკმასტერი 140 გრამი',
    shortDescEn: 'Low protein McMaster grissini sticks 140g',
  },
  {
    num: 49,
    nameKa: 'მაკმასტერის კრუტონები არაჟნითა და ხახვის არომატით 80გ (დაბალი ცილის შემცველობით)',
    nameEn: 'McMaster Croutons Sour Cream & Onion 80g (Low Protein)',
    brand: 'MacMaster',
    manufacturer: 'МакМастер',
    country: 'რუსეთი',
    price: 8.00,
    categorySlug: 'dabaltsilovani-macmaster',
    shortDescKa: 'დაბალცილოვანი კრუტონები არაჟნითა და ხახვით 80 გრამი',
    shortDescEn: 'Low protein croutons sour cream & onion 80g',
  },
  {
    num: 50,
    nameKa: 'მაკმასტერის კრუტონები პიცის არომატის 80გ (დაბალი ცილის შემცველობით)',
    nameEn: 'McMaster Croutons Pizza Flavor 80g (Low Protein)',
    brand: 'MacMaster',
    manufacturer: 'МакМастер',
    country: 'რუსეთი',
    price: 8.00,
    categorySlug: 'dabaltsilovani-macmaster',
    shortDescKa: 'დაბალცილოვანი კრუტონები პიცის არომატით 80 გრამი',
    shortDescEn: 'Low protein croutons pizza flavor 80g',
  },
  {
    num: 51,
    nameKa: 'სიმინდის ფქვილის ფაფა ვიტამინებით 150გ',
    nameEn: 'Corn Flour Porridge with Vitamins 150g',
    brand: 'MacMaster',
    manufacturer: 'МакМастер',
    country: 'რუსეთი',
    price: 11.50,
    categorySlug: 'dabaltsilovani-macmaster',
    shortDescKa: 'სიმინდის ფქვილის ფაფა ვიტამინებით 150 გრამი',
    shortDescEn: 'Corn flour porridge with vitamins 150g',
  },
  {
    num: 52,
    nameKa: 'დაბალცილებიანი ბურღულეული 150გ',
    nameEn: 'Low Protein Cereal 150g',
    brand: 'MacMaster',
    manufacturer: 'МакМастер',
    country: 'რუსეთი',
    price: 11.50,
    categorySlug: 'dabaltsilovani-macmaster',
    shortDescKa: 'დაბალცილოვანი ბურღულეული 150 გრამი',
    shortDescEn: 'Low protein cereal 150g',
  },
  {
    num: 53,
    nameKa: 'დაბალცილებიანი ხილის ფაფა 150გ',
    nameEn: 'Low Protein Fruit Porridge 150g',
    brand: 'MacMaster',
    manufacturer: 'МакМастер',
    country: 'რუსეთი',
    price: 11.50,
    categorySlug: 'dabaltsilovani-macmaster',
    shortDescKa: 'დაბალცილოვანი ხილის ფაფა 150 გრამი',
    shortDescEn: 'Low protein fruit porridge 150g',
  },
  {
    num: 54,
    nameKa: 'დაბალცილებიანი სიმინდის ფაფა 150გ',
    nameEn: 'Low Protein Corn Porridge 150g',
    brand: 'MacMaster',
    manufacturer: 'МакМастер',
    country: 'რუსეთი',
    price: 11.50,
    categorySlug: 'dabaltsilovani-macmaster',
    shortDescKa: 'დაბალცილოვანი სიმინდის ფაფა 150 გრამი',
    shortDescEn: 'Low protein corn porridge 150g',
  },
  {
    num: 55,
    nameKa: 'დაბალცილებიანი წიწიბურის ფაფა 150გ',
    nameEn: 'Low Protein Millet Porridge 150g',
    brand: 'MacMaster',
    manufacturer: 'МакМастер',
    country: 'რუსეთი',
    price: 11.50,
    categorySlug: 'dabaltsilovani-macmaster',
    shortDescKa: 'დაბალცილოვანი წიწიბურის ფაფა 150 გრამი',
    shortDescEn: 'Low protein millet porridge 150g',
  },
  {
    num: 56,
    nameKa: 'დაბალცილებიანი მანის ფაფა 150გ',
    nameEn: 'Low Protein Semolina Porridge 150g',
    brand: 'MacMaster',
    manufacturer: 'МакМастер',
    country: 'რუსეთი',
    price: 20.00,
    categorySlug: 'dabaltsilovani-macmaster',
    shortDescKa: 'დაბალცილოვანი მანის ფაფა 150 გრამი',
    shortDescEn: 'Low protein semolina porridge 150g',
  },
  {
    num: 57,
    nameKa: 'ფქვილი 700გ (დაბალი ცილის შემცველობით)',
    nameEn: 'Flour 700g (Low Protein)',
    brand: 'MacMaster',
    manufacturer: 'МакМастер',
    country: 'რუსეთი',
    price: 22.00,
    categorySlug: 'dabaltsilovani-macmaster',
    shortDescKa: 'დაბალცილოვანი ფქვილი 700 გრამი',
    shortDescEn: 'Low protein flour 700g',
  },
  {
    num: 58,
    nameKa: 'რძის დესერტი 150გ (დაბალი ცილის შემცველობით)',
    nameEn: 'Milk Dessert 150g (Low Protein)',
    brand: 'MacMaster',
    manufacturer: 'МакМастер',
    country: 'რუსეთი',
    price: 18.00,
    categorySlug: 'dabaltsilovani-macmaster',
    shortDescKa: 'დაბალცილოვანი რძის დესერტი 150 გრამი',
    shortDescEn: 'Low protein milk dessert 150g',
  },
  {
    num: 59,
    nameKa: 'ომლეტის ნაზავი 100გ (დაბალი ცილის შემცველობით)',
    nameEn: 'Omelette Mix 100g (Low Protein)',
    brand: 'MacMaster',
    manufacturer: 'МакМастер',
    country: 'რუსეთი',
    price: 18.00,
    categorySlug: 'dabaltsilovani-macmaster',
    shortDescKa: 'დაბალცილოვანი ომლეტის ნაზავი 100 გრამი',
    shortDescEn: 'Low protein omelette mix 100g',
  },
  {
    num: 60,
    nameKa: 'კვერცხის შემცვლელი ნარევი 100გ (დაბალი ცილის შემცველობით)',
    nameEn: 'Egg Substitute Mix 100g (Low Protein)',
    brand: 'MacMaster',
    manufacturer: 'МакМастер',
    country: 'რუსეთი',
    price: 18.00,
    categorySlug: 'dabaltsilovani-macmaster',
    shortDescKa: 'დაბალცილოვანი კვერცხის შემცვლელი 100 გრამი',
    shortDescEn: 'Low protein egg substitute mix 100g',
  },
  {
    num: 61,
    nameKa: 'კატლეტის მიქსი 120გ (დაბალი ცილის შემცველობით)',
    nameEn: 'Cutlet Mix 120g (Low Protein)',
    brand: 'MacMaster',
    manufacturer: 'МакМастер',
    country: 'რუსეთი',
    price: 12.00,
    categorySlug: 'dabaltsilovani-macmaster',
    shortDescKa: 'დაბალცილოვანი კატლეტის მიქსი 120 გრამი',
    shortDescEn: 'Low protein cutlet mix 120g',
  },
];

// ============================================================================
// MAIN IMPORT FUNCTION
// ============================================================================
async function main() {
  console.log('🚀 Starting product import...\n');

  // Disable search vector triggers
  console.log('⏸️  Disabling search vector triggers...');
  try {
    await prisma.$executeRaw`ALTER TABLE "categories" DISABLE TRIGGER categories_search_vector_trigger`;
    await prisma.$executeRaw`ALTER TABLE "products" DISABLE TRIGGER products_search_vector_trigger`;
  } catch (e) {
    console.log('   (triggers may not exist yet, continuing...)');
  }

  // 1. Clear existing products, images, and categories
  console.log('🗑️  Clearing existing products and categories...');
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // 2. Create categories
  console.log('\n📁 Creating categories...');
  const categoryMap: Record<string, string> = {};

  for (const cat of categories) {
    const created = await prisma.category.create({
      data: {
        slug: cat.slug,
        nameKa: cat.nameKa,
        nameEn: cat.nameEn,
        descKa: cat.descKa,
        descEn: cat.descEn,
        sortOrder: cat.sortOrder,
        isActive: true,
      },
    });
    categoryMap[cat.slug] = created.id;
    console.log(`   ✅ ${cat.nameKa} (${cat.nameEn})`);
  }

  // 3. Import products
  console.log('\n📦 Importing products...');
  let imported = 0;

  for (const product of products) {
    const slug = slugify(product.nameKa) + '-' + product.num;
    const sku = `PROD-${String(product.num).padStart(3, '0')}`;

    await prisma.product.create({
      data: {
        sku,
        slug,
        nameKa: product.nameKa,
        nameEn: product.nameEn,
        shortDescKa: product.shortDescKa || null,
        shortDescEn: product.shortDescEn || null,
        descKa: `მწარმოებელი ქვეყანა: ${product.country}\nმწარმოებელი: ${product.manufacturer}\n${product.nameKa}`,
        descEn: `Country of origin: ${product.country}\nManufacturer: ${product.manufacturer}\n${product.nameEn}`,
        price: product.price,
        stock: 100,
        brand: product.brand,
        manufacturer: product.manufacturer,
        isActive: true,
        isFeatured: product.num <= 10,
        categoryId: categoryMap[product.categorySlug],
        images: {
          create: [
            {
              url: `/images/products/${sku.toLowerCase()}.jpg`,
              alt: product.nameKa,
              sortOrder: 0,
              isPrimary: true,
            },
          ],
        },
      },
    });

    imported++;
    console.log(`   ✅ [${product.num}] ${product.nameKa} — ${product.price} ₾`);
  }

  // Re-enable triggers
  console.log('\n▶️  Re-enabling search vector triggers...');
  try {
    await prisma.$executeRaw`ALTER TABLE "categories" ENABLE TRIGGER categories_search_vector_trigger`;
    await prisma.$executeRaw`ALTER TABLE "products" ENABLE TRIGGER products_search_vector_trigger`;
  } catch (e) {
    console.log('   (triggers may not exist, continuing...)');
  }

  console.log(`\n✨ Import complete!`);
  console.log(`   📁 Categories: ${categories.length}`);
  console.log(`   📦 Products: ${imported}`);
  console.log(`\n📸 Note: Product images are expected at /public/images/products/prod-001.jpg ... prod-061.jpg`);
  console.log(`   You can extract images from the PDF/DOCX files and save them there.`);
}

main()
  .catch((e) => {
    console.error('❌ Import failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
