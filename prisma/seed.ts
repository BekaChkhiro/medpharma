/**
 * Prisma Seed Script
 * Populates the database with sample data for development and testing
 *
 * Run with: pnpm db:seed
 */

import 'dotenv/config';
import { hash } from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient, AdminRole, DosageForm } from '../src/generated/prisma';

// Create database connection for seed script
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Helper to create slugs
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Default placeholder image for all products
const PLACEHOLDER_IMAGE = '/images/placeholder-product.svg';

async function main() {
  console.log('🌱 Starting seed...\n');

  // Temporarily disable triggers to avoid Prisma 7.x adapter issues
  console.log('⏸️  Disabling search vector triggers...');
  await prisma.$executeRaw`ALTER TABLE "categories" DISABLE TRIGGER categories_search_vector_trigger`;
  await prisma.$executeRaw`ALTER TABLE "products" DISABLE TRIGGER products_search_vector_trigger`;
  await prisma.$executeRaw`ALTER TABLE "pages" DISABLE TRIGGER pages_search_vector_trigger`;

  // Clear existing data (in reverse order of dependencies)
  console.log('🗑️  Clearing existing data...');
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.deliveryZone.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.page.deleteMany();
  await prisma.siteSetting.deleteMany();
  await prisma.adminUser.deleteMany();

  // ============================================================================
  // 1. ADMIN USERS
  // ============================================================================
  console.log('\n👤 Creating admin users...');

  const hashedPassword = await hash('admin123', 12);

  const superAdmin = await prisma.adminUser.create({
    data: {
      email: 'admin@medpharma.ge',
      password: hashedPassword,
      name: 'Super Admin',
      role: AdminRole.SUPER_ADMIN,
      isActive: true,
    },
  });

  const adminUser = await prisma.adminUser.create({
    data: {
      email: 'manager@medpharma.ge',
      password: hashedPassword,
      name: 'Store Manager',
      role: AdminRole.MANAGER,
      isActive: true,
    },
  });

  console.log(`   ✅ Created ${superAdmin.name} (${superAdmin.email})`);
  console.log(`   ✅ Created ${adminUser.name} (${adminUser.email})`);

  // ============================================================================
  // 2. CATEGORIES (Hierarchical)
  // ============================================================================
  console.log('\n📁 Creating categories...');

  // Parent categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        slug: 'vitamins-supplements',
        nameKa: 'ვიტამინები და დანამატები',
        nameEn: 'Vitamins & Supplements',
        descKa: 'ვიტამინები, მინერალები და საკვები დანამატები ჯანმრთელი ცხოვრებისთვის',
        descEn: 'Vitamins, minerals and dietary supplements for healthy living',
        sortOrder: 1,
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        slug: 'pain-relief',
        nameKa: 'ტკივილგამაყუჩებელი',
        nameEn: 'Pain Relief',
        descKa: 'ტკივილგამაყუჩებელი და ანთების საწინააღმდეგო პრეპარატები',
        descEn: 'Pain relievers and anti-inflammatory medications',
        sortOrder: 2,
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        slug: 'cold-flu',
        nameKa: 'გაციება და გრიპი',
        nameEn: 'Cold & Flu',
        descKa: 'გაციებისა და გრიპის სიმპტომების შემამსუბუქებელი პრეპარატები',
        descEn: 'Medications to relieve cold and flu symptoms',
        sortOrder: 3,
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        slug: 'digestive-health',
        nameKa: 'საჭმლის მომნელებელი სისტემა',
        nameEn: 'Digestive Health',
        descKa: 'საჭმლის მომნელებელი სისტემის ჯანმრთელობისთვის',
        descEn: 'Products for digestive system health',
        sortOrder: 4,
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        slug: 'skin-care',
        nameKa: 'კანის მოვლა',
        nameEn: 'Skin Care',
        descKa: 'კანის მოვლის პროდუქტები და კრემები',
        descEn: 'Skin care products and creams',
        sortOrder: 5,
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        slug: 'first-aid',
        nameKa: 'პირველადი დახმარება',
        nameEn: 'First Aid',
        descKa: 'პირველადი სამედიცინო დახმარების საშუალებები',
        descEn: 'First aid supplies and equipment',
        sortOrder: 6,
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        slug: 'baby-care',
        nameKa: 'ბავშვთა მოვლა',
        nameEn: 'Baby Care',
        descKa: 'ბავშვების ჯანმრთელობისა და მოვლის პროდუქტები',
        descEn: 'Baby health and care products',
        sortOrder: 7,
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        slug: 'medical-devices',
        nameKa: 'სამედიცინო აპარატურა',
        nameEn: 'Medical Devices',
        descKa: 'სამედიცინო აპარატურა და მოწყობილობები სახლისთვის',
        descEn: 'Medical devices and equipment for home use',
        sortOrder: 8,
        isActive: true,
      },
    }),
  ]);

  // Child categories for Vitamins
  const vitaminSubCategories = await Promise.all([
    prisma.category.create({
      data: {
        slug: 'multivitamins',
        nameKa: 'მულტივიტამინები',
        nameEn: 'Multivitamins',
        parentId: categories[0].id,
        sortOrder: 1,
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        slug: 'vitamin-c',
        nameKa: 'ვიტამინი C',
        nameEn: 'Vitamin C',
        parentId: categories[0].id,
        sortOrder: 2,
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        slug: 'vitamin-d',
        nameKa: 'ვიტამინი D',
        nameEn: 'Vitamin D',
        parentId: categories[0].id,
        sortOrder: 3,
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        slug: 'omega-3',
        nameKa: 'ომეგა 3',
        nameEn: 'Omega 3',
        parentId: categories[0].id,
        sortOrder: 4,
        isActive: true,
      },
    }),
  ]);

  // Child categories for Pain Relief
  const painSubCategories = await Promise.all([
    prisma.category.create({
      data: {
        slug: 'headache',
        nameKa: 'თავის ტკივილი',
        nameEn: 'Headache',
        parentId: categories[1].id,
        sortOrder: 1,
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        slug: 'muscle-pain',
        nameKa: 'კუნთის ტკივილი',
        nameEn: 'Muscle Pain',
        parentId: categories[1].id,
        sortOrder: 2,
        isActive: true,
      },
    }),
  ]);

  console.log(`   ✅ Created ${categories.length} parent categories`);
  console.log(`   ✅ Created ${vitaminSubCategories.length + painSubCategories.length} child categories`);

  // ============================================================================
  // 3. PRODUCTS
  // ============================================================================
  console.log('\n💊 Creating products...');

  const products = await Promise.all([
    // Vitamins
    prisma.product.create({
      data: {
        sku: 'VIT-001',
        slug: 'vitamin-c-1000mg-tablets',
        nameKa: 'ვიტამინი C 1000მგ ტაბლეტები',
        nameEn: 'Vitamin C 1000mg Tablets',
        descKa: 'მაღალი ხარისხის ვიტამინი C იმუნური სისტემის გასაძლიერებლად. 60 ტაბლეტი შეფუთვაში.',
        descEn: 'High-quality Vitamin C to boost your immune system. 60 tablets per pack.',
        shortDescKa: 'იმუნური სისტემის მხარდაჭერა',
        shortDescEn: 'Immune system support',
        price: 24.99,
        salePrice: 19.99,
        stock: 150,
        brand: 'VitaPlus',
        manufacturer: 'VitaPlus Pharmaceuticals',
        dosageForm: DosageForm.TABLET,
        dosage: '1000mg',
        activeIngredient: 'Ascorbic Acid',
        isFeatured: true,
        isActive: true,
        categoryId: vitaminSubCategories[1].id,
        images: {
          create: [
            { url: PLACEHOLDER_IMAGE, isPrimary: true, sortOrder: 0 },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        sku: 'VIT-002',
        slug: 'vitamin-d3-5000iu-softgels',
        nameKa: 'ვიტამინი D3 5000IU კაფსულები',
        nameEn: 'Vitamin D3 5000IU Softgels',
        descKa: 'ვიტამინი D3 ძვლებისა და იმუნური სისტემის ჯანმრთელობისთვის. 120 კაფსულა.',
        descEn: 'Vitamin D3 for bone and immune health. 120 softgels per bottle.',
        shortDescKa: 'ძვლების ჯანმრთელობა',
        shortDescEn: 'Bone health support',
        price: 29.99,
        stock: 80,
        brand: 'NatureMade',
        manufacturer: 'NatureMade Labs',
        dosageForm: DosageForm.CAPSULE,
        dosage: '5000IU',
        activeIngredient: 'Cholecalciferol',
        isFeatured: true,
        isActive: true,
        categoryId: vitaminSubCategories[2].id,
        images: {
          create: [
            { url: PLACEHOLDER_IMAGE, isPrimary: true, sortOrder: 0 },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        sku: 'VIT-003',
        slug: 'omega-3-fish-oil-1000mg',
        nameKa: 'ომეგა 3 თევზის ზეთი 1000მგ',
        nameEn: 'Omega 3 Fish Oil 1000mg',
        descKa: 'სუფთა თევზის ზეთი EPA და DHA-ით. გულისა და ტვინის ჯანმრთელობისთვის.',
        descEn: 'Pure fish oil with EPA and DHA. For heart and brain health.',
        shortDescKa: 'გულის ჯანმრთელობა',
        shortDescEn: 'Heart health',
        price: 34.99,
        salePrice: 29.99,
        stock: 100,
        brand: 'Nordic Naturals',
        manufacturer: 'Nordic Naturals Inc',
        dosageForm: DosageForm.CAPSULE,
        dosage: '1000mg',
        activeIngredient: 'Omega-3 Fatty Acids',
        isFeatured: true,
        isActive: true,
        categoryId: vitaminSubCategories[3].id,
        images: {
          create: [
            { url: PLACEHOLDER_IMAGE, isPrimary: true, sortOrder: 0 },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        sku: 'VIT-004',
        slug: 'multivitamin-complete-formula',
        nameKa: 'მულტივიტამინი სრული ფორმულა',
        nameEn: 'Multivitamin Complete Formula',
        descKa: 'ყოველდღიური მულტივიტამინი ყველა საჭირო ვიტამინითა და მინერალით.',
        descEn: 'Daily multivitamin with all essential vitamins and minerals.',
        shortDescKa: 'ყოველდღიური მხარდაჭერა',
        shortDescEn: 'Daily support',
        price: 39.99,
        stock: 200,
        brand: 'Centrum',
        manufacturer: 'Pfizer Consumer Healthcare',
        dosageForm: DosageForm.TABLET,
        dosage: '1 tablet daily',
        isFeatured: false,
        isActive: true,
        categoryId: vitaminSubCategories[0].id,
        images: {
          create: [
            { url: PLACEHOLDER_IMAGE, isPrimary: true, sortOrder: 0 },
          ],
        },
      },
    }),

    // Pain Relief
    prisma.product.create({
      data: {
        sku: 'PAIN-001',
        slug: 'ibuprofen-400mg-tablets',
        nameKa: 'იბუპროფენი 400მგ ტაბლეტები',
        nameEn: 'Ibuprofen 400mg Tablets',
        descKa: 'ტკივილგამაყუჩებელი და ანთების საწინააღმდეგო. 30 ტაბლეტი.',
        descEn: 'Pain relief and anti-inflammatory. 30 tablets.',
        shortDescKa: 'ტკივილის შემსუბუქება',
        shortDescEn: 'Pain relief',
        price: 8.99,
        stock: 300,
        brand: 'Advil',
        manufacturer: 'Pfizer',
        dosageForm: DosageForm.TABLET,
        dosage: '400mg',
        activeIngredient: 'Ibuprofen',
        isFeatured: false,
        isActive: true,
        categoryId: painSubCategories[0].id,
        images: {
          create: [
            { url: PLACEHOLDER_IMAGE, isPrimary: true, sortOrder: 0 },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        sku: 'PAIN-002',
        slug: 'paracetamol-500mg-tablets',
        nameKa: 'პარაცეტამოლი 500მგ ტაბლეტები',
        nameEn: 'Paracetamol 500mg Tablets',
        descKa: 'ცხელების დამწევი და ტკივილგამაყუჩებელი. 20 ტაბლეტი.',
        descEn: 'Fever reducer and pain reliever. 20 tablets.',
        shortDescKa: 'ცხელებისა და ტკივილის შემსუბუქება',
        shortDescEn: 'Fever and pain relief',
        price: 5.99,
        stock: 500,
        brand: 'Tylenol',
        manufacturer: 'Johnson & Johnson',
        dosageForm: DosageForm.TABLET,
        dosage: '500mg',
        activeIngredient: 'Paracetamol',
        isFeatured: false,
        isActive: true,
        categoryId: painSubCategories[0].id,
        images: {
          create: [
            { url: PLACEHOLDER_IMAGE, isPrimary: true, sortOrder: 0 },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        sku: 'PAIN-003',
        slug: 'muscle-relief-gel-100g',
        nameKa: 'კუნთის დამამშვიდებელი გელი 100გ',
        nameEn: 'Muscle Relief Gel 100g',
        descKa: 'გამაგრილებელი გელი კუნთის ტკივილისა და დაჭიმულობისთვის.',
        descEn: 'Cooling gel for muscle pain and tension.',
        shortDescKa: 'კუნთის ტკივილის შემსუბუქება',
        shortDescEn: 'Muscle pain relief',
        price: 15.99,
        salePrice: 12.99,
        stock: 120,
        brand: 'Voltaren',
        manufacturer: 'Novartis',
        dosageForm: DosageForm.GEL,
        dosage: '100g',
        activeIngredient: 'Diclofenac',
        isFeatured: true,
        isActive: true,
        categoryId: painSubCategories[1].id,
        images: {
          create: [
            { url: PLACEHOLDER_IMAGE, isPrimary: true, sortOrder: 0 },
          ],
        },
      },
    }),

    // Cold & Flu
    prisma.product.create({
      data: {
        sku: 'COLD-001',
        slug: 'cold-flu-relief-syrup-200ml',
        nameKa: 'გაციების და გრიპის სიროფი 200მლ',
        nameEn: 'Cold & Flu Relief Syrup 200ml',
        descKa: 'კომპლექსური სიროფი გაციების ყველა სიმპტომის შესამსუბუქებლად.',
        descEn: 'Complete syrup for all cold symptoms relief.',
        shortDescKa: 'გაციების სიმპტომების შემსუბუქება',
        shortDescEn: 'Cold symptom relief',
        price: 18.99,
        stock: 80,
        brand: 'Theraflu',
        manufacturer: 'GSK',
        dosageForm: DosageForm.SYRUP,
        dosage: '200ml',
        isFeatured: false,
        isActive: true,
        categoryId: categories[2].id,
        images: {
          create: [
            { url: PLACEHOLDER_IMAGE, isPrimary: true, sortOrder: 0 },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        sku: 'COLD-002',
        slug: 'nasal-spray-decongestant-15ml',
        nameKa: 'ცხვირის სპრეი 15მლ',
        nameEn: 'Nasal Spray Decongestant 15ml',
        descKa: 'ცხვირის გატენილობის სწრაფი შემსუბუქება.',
        descEn: 'Fast relief for nasal congestion.',
        shortDescKa: 'ცხვირის გატენილობის შემსუბუქება',
        shortDescEn: 'Nasal congestion relief',
        price: 12.99,
        stock: 150,
        brand: 'Afrin',
        manufacturer: 'Bayer',
        dosageForm: DosageForm.SPRAY,
        dosage: '15ml',
        activeIngredient: 'Oxymetazoline',
        isFeatured: false,
        isActive: true,
        categoryId: categories[2].id,
        images: {
          create: [
            { url: PLACEHOLDER_IMAGE, isPrimary: true, sortOrder: 0 },
          ],
        },
      },
    }),

    // Digestive Health
    prisma.product.create({
      data: {
        sku: 'DIG-001',
        slug: 'probiotic-capsules-30ct',
        nameKa: 'პრობიოტიკი კაფსულები 30ც',
        nameEn: 'Probiotic Capsules 30ct',
        descKa: '10 მილიარდი CFU პრობიოტიკი ნაწლავის ჯანმრთელობისთვის.',
        descEn: '10 billion CFU probiotic for gut health.',
        shortDescKa: 'ნაწლავის ჯანმრთელობა',
        shortDescEn: 'Gut health',
        price: 28.99,
        stock: 90,
        brand: 'Culturelle',
        manufacturer: 'i-Health Inc',
        dosageForm: DosageForm.CAPSULE,
        dosage: '10B CFU',
        isFeatured: true,
        isActive: true,
        categoryId: categories[3].id,
        images: {
          create: [
            { url: PLACEHOLDER_IMAGE, isPrimary: true, sortOrder: 0 },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        sku: 'DIG-002',
        slug: 'antacid-tablets-mint-100ct',
        nameKa: 'ანტაციდი პიტნის ტაბლეტები 100ც',
        nameEn: 'Antacid Tablets Mint 100ct',
        descKa: 'სწრაფი შემსუბუქება გულძმარვისა და მჟავიანობისგან.',
        descEn: 'Fast relief from heartburn and acidity.',
        shortDescKa: 'გულძმარვის შემსუბუქება',
        shortDescEn: 'Heartburn relief',
        price: 9.99,
        stock: 200,
        brand: 'Tums',
        manufacturer: 'GSK',
        dosageForm: DosageForm.TABLET,
        dosage: 'Chewable',
        activeIngredient: 'Calcium Carbonate',
        isFeatured: false,
        isActive: true,
        categoryId: categories[3].id,
        images: {
          create: [
            { url: PLACEHOLDER_IMAGE, isPrimary: true, sortOrder: 0 },
          ],
        },
      },
    }),

    // Skin Care
    prisma.product.create({
      data: {
        sku: 'SKIN-001',
        slug: 'moisturizing-cream-100ml',
        nameKa: 'დამატენიანებელი კრემი 100მლ',
        nameEn: 'Moisturizing Cream 100ml',
        descKa: 'ინტენსიური დამატენიანებელი კრემი მშრალი კანისთვის.',
        descEn: 'Intensive moisturizing cream for dry skin.',
        shortDescKa: 'კანის დატენიანება',
        shortDescEn: 'Skin hydration',
        price: 22.99,
        salePrice: 18.99,
        stock: 75,
        brand: 'CeraVe',
        manufacturer: "L'Oreal",
        dosageForm: DosageForm.CREAM,
        dosage: '100ml',
        isFeatured: true,
        isActive: true,
        categoryId: categories[4].id,
        images: {
          create: [
            { url: PLACEHOLDER_IMAGE, isPrimary: true, sortOrder: 0 },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        sku: 'SKIN-002',
        slug: 'antibacterial-ointment-30g',
        nameKa: 'ანტიბაქტერიული მალამო 30გ',
        nameEn: 'Antibacterial Ointment 30g',
        descKa: 'ანტიბაქტერიული მალამო მცირე ჭრილობებისა და დამწვრობისთვის.',
        descEn: 'Antibacterial ointment for minor cuts and burns.',
        shortDescKa: 'ჭრილობების მოვლა',
        shortDescEn: 'Wound care',
        price: 11.99,
        stock: 140,
        brand: 'Neosporin',
        manufacturer: 'Johnson & Johnson',
        dosageForm: DosageForm.OINTMENT,
        dosage: '30g',
        activeIngredient: 'Neomycin, Bacitracin',
        isFeatured: false,
        isActive: true,
        categoryId: categories[4].id,
        images: {
          create: [
            { url: PLACEHOLDER_IMAGE, isPrimary: true, sortOrder: 0 },
          ],
        },
      },
    }),

    // First Aid
    prisma.product.create({
      data: {
        sku: 'FA-001',
        slug: 'first-aid-kit-50pc',
        nameKa: 'პირველადი დახმარების ნაკრები 50ც',
        nameEn: 'First Aid Kit 50pc',
        descKa: 'სრული პირველადი დახმარების ნაკრები სახლისა და მოგზაურობისთვის.',
        descEn: 'Complete first aid kit for home and travel.',
        shortDescKa: 'პირველადი დახმარება',
        shortDescEn: 'First aid essentials',
        price: 35.99,
        stock: 50,
        brand: 'Johnson & Johnson',
        manufacturer: 'Johnson & Johnson',
        dosageForm: DosageForm.OTHER,
        isFeatured: true,
        isActive: true,
        categoryId: categories[5].id,
        images: {
          create: [
            { url: PLACEHOLDER_IMAGE, isPrimary: true, sortOrder: 0 },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        sku: 'FA-002',
        slug: 'adhesive-bandages-100ct',
        nameKa: 'ლეიკოპლასტირი 100ც',
        nameEn: 'Adhesive Bandages 100ct',
        descKa: 'წყალგაუმტარი ლეიკოპლასტირები სხვადასხვა ზომით.',
        descEn: 'Waterproof bandages in assorted sizes.',
        shortDescKa: 'ჭრილობის დაცვა',
        shortDescEn: 'Wound protection',
        price: 7.99,
        stock: 250,
        brand: 'Band-Aid',
        manufacturer: 'Johnson & Johnson',
        dosageForm: DosageForm.OTHER,
        isFeatured: false,
        isActive: true,
        categoryId: categories[5].id,
        images: {
          create: [
            { url: PLACEHOLDER_IMAGE, isPrimary: true, sortOrder: 0 },
          ],
        },
      },
    }),

    // Baby Care
    prisma.product.create({
      data: {
        sku: 'BABY-001',
        slug: 'baby-vitamin-d-drops-30ml',
        nameKa: 'ბავშვის ვიტამინი D წვეთები 30მლ',
        nameEn: 'Baby Vitamin D Drops 30ml',
        descKa: 'ვიტამინი D ჩვილებისა და პატარა ბავშვებისთვის.',
        descEn: 'Vitamin D for infants and young children.',
        shortDescKa: 'ბავშვის ჯანმრთელობა',
        shortDescEn: 'Baby health',
        price: 19.99,
        stock: 60,
        brand: "Nature's Way",
        manufacturer: "Nature's Way",
        dosageForm: DosageForm.DROPS,
        dosage: '30ml',
        activeIngredient: 'Vitamin D3',
        isFeatured: true,
        isActive: true,
        categoryId: categories[6].id,
        images: {
          create: [
            { url: PLACEHOLDER_IMAGE, isPrimary: true, sortOrder: 0 },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        sku: 'BABY-002',
        slug: 'baby-fever-syrup-100ml',
        nameKa: 'ბავშვის ცხელების სიროფი 100მლ',
        nameEn: 'Baby Fever Syrup 100ml',
        descKa: 'უსაფრთხო ცხელების დამწევი ბავშვებისთვის 3 თვიდან.',
        descEn: 'Safe fever reducer for babies from 3 months.',
        shortDescKa: 'ბავშვის ცხელების შემსუბუქება',
        shortDescEn: 'Baby fever relief',
        price: 14.99,
        stock: 90,
        brand: "Infants' Tylenol",
        manufacturer: 'Johnson & Johnson',
        dosageForm: DosageForm.SYRUP,
        dosage: '100ml',
        activeIngredient: 'Paracetamol',
        isFeatured: false,
        isActive: true,
        categoryId: categories[6].id,
        images: {
          create: [
            { url: PLACEHOLDER_IMAGE, isPrimary: true, sortOrder: 0 },
          ],
        },
      },
    }),

    // Medical Devices
    prisma.product.create({
      data: {
        sku: 'MED-001',
        slug: 'digital-thermometer',
        nameKa: 'ციფრული თერმომეტრი',
        nameEn: 'Digital Thermometer',
        descKa: 'სწრაფი და ზუსტი ციფრული თერმომეტრი ოჯახისთვის.',
        descEn: 'Fast and accurate digital thermometer for the family.',
        shortDescKa: 'ტემპერატურის გაზომვა',
        shortDescEn: 'Temperature measurement',
        price: 15.99,
        stock: 100,
        brand: 'Braun',
        manufacturer: 'Braun GmbH',
        dosageForm: DosageForm.OTHER,
        isFeatured: true,
        isActive: true,
        categoryId: categories[7].id,
        images: {
          create: [
            { url: PLACEHOLDER_IMAGE, isPrimary: true, sortOrder: 0 },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        sku: 'MED-002',
        slug: 'blood-pressure-monitor',
        nameKa: 'წნევის აპარატი',
        nameEn: 'Blood Pressure Monitor',
        descKa: 'ავტომატური წნევის გამზომი აპარატი სახლის გამოყენებისთვის.',
        descEn: 'Automatic blood pressure monitor for home use.',
        shortDescKa: 'წნევის მონიტორინგი',
        shortDescEn: 'Blood pressure monitoring',
        price: 59.99,
        salePrice: 49.99,
        stock: 40,
        brand: 'Omron',
        manufacturer: 'Omron Healthcare',
        dosageForm: DosageForm.OTHER,
        isFeatured: true,
        isActive: true,
        categoryId: categories[7].id,
        images: {
          create: [
            { url: PLACEHOLDER_IMAGE, isPrimary: true, sortOrder: 0 },
          ],
        },
      },
    }),

    // Prescription required product
    prisma.product.create({
      data: {
        sku: 'RX-001',
        slug: 'antibiotic-amoxicillin-500mg',
        nameKa: 'ანტიბიოტიკი ამოქსიცილინი 500მგ',
        nameEn: 'Antibiotic Amoxicillin 500mg',
        descKa: 'ფართო სპექტრის ანტიბიოტიკი ბაქტერიული ინფექციების სამკურნალოდ.',
        descEn: 'Broad-spectrum antibiotic for bacterial infections.',
        shortDescKa: 'რეცეპტით',
        shortDescEn: 'Prescription required',
        price: 15.99,
        stock: 200,
        brand: 'Amoxil',
        manufacturer: 'GSK',
        dosageForm: DosageForm.CAPSULE,
        dosage: '500mg',
        activeIngredient: 'Amoxicillin',
        requiresPrescription: true,
        isFeatured: false,
        isActive: true,
        categoryId: categories[1].id,
        images: {
          create: [
            { url: PLACEHOLDER_IMAGE, isPrimary: true, sortOrder: 0 },
          ],
        },
      },
    }),
  ]);

  console.log(`   ✅ Created ${products.length} products`);

  // ============================================================================
  // 4. DELIVERY ZONES
  // ============================================================================
  console.log('\n🚚 Creating delivery zones...');

  const deliveryZones = await Promise.all([
    prisma.deliveryZone.create({
      data: {
        nameKa: 'თბილისი',
        nameEn: 'Tbilisi',
        fee: 5.00,
        minOrder: 20.00,
        freeAbove: 100.00,
        sortOrder: 1,
        isActive: true,
      },
    }),
    prisma.deliveryZone.create({
      data: {
        nameKa: 'ბათუმი',
        nameEn: 'Batumi',
        fee: 10.00,
        minOrder: 30.00,
        freeAbove: 150.00,
        sortOrder: 2,
        isActive: true,
      },
    }),
    prisma.deliveryZone.create({
      data: {
        nameKa: 'ქუთაისი',
        nameEn: 'Kutaisi',
        fee: 8.00,
        minOrder: 25.00,
        freeAbove: 120.00,
        sortOrder: 3,
        isActive: true,
      },
    }),
    prisma.deliveryZone.create({
      data: {
        nameKa: 'რუსთავი',
        nameEn: 'Rustavi',
        fee: 6.00,
        minOrder: 20.00,
        freeAbove: 100.00,
        sortOrder: 4,
        isActive: true,
      },
    }),
    prisma.deliveryZone.create({
      data: {
        nameKa: 'გორი',
        nameEn: 'Gori',
        fee: 8.00,
        minOrder: 25.00,
        freeAbove: 120.00,
        sortOrder: 5,
        isActive: true,
      },
    }),
    prisma.deliveryZone.create({
      data: {
        nameKa: 'ზუგდიდი',
        nameEn: 'Zugdidi',
        fee: 12.00,
        minOrder: 35.00,
        freeAbove: 150.00,
        sortOrder: 6,
        isActive: true,
      },
    }),
    prisma.deliveryZone.create({
      data: {
        nameKa: 'ფოთი',
        nameEn: 'Poti',
        fee: 10.00,
        minOrder: 30.00,
        freeAbove: 140.00,
        sortOrder: 7,
        isActive: true,
      },
    }),
    prisma.deliveryZone.create({
      data: {
        nameKa: 'თელავი',
        nameEn: 'Telavi',
        fee: 10.00,
        minOrder: 30.00,
        freeAbove: 130.00,
        sortOrder: 8,
        isActive: true,
      },
    }),
    prisma.deliveryZone.create({
      data: {
        nameKa: 'სხვა რეგიონები',
        nameEn: 'Other Regions',
        fee: 15.00,
        minOrder: 50.00,
        freeAbove: 200.00,
        sortOrder: 99,
        isActive: true,
      },
    }),
  ]);

  console.log(`   ✅ Created ${deliveryZones.length} delivery zones`);

  // ============================================================================
  // 5. BANNERS
  // ============================================================================
  console.log('\n🖼️  Creating banners...');

  const banners = await Promise.all([
    prisma.banner.create({
      data: {
        titleKa: 'კეთილი იყოს თქვენი მობრძანება მედფარმა პლუსში',
        titleEn: 'Welcome to MedPharma Plus',
        subtitleKa: 'თქვენი სანდო ონლაინ აფთიაქი 30 წლიანი გამოცდილებით',
        subtitleEn: 'Your trusted online pharmacy with 30 years of experience',
        image: '/images/banners/hero-1.jpg',
        imageMobile: '/images/banners/hero-1-mobile.jpg',
        link: '/products',
        buttonTextKa: 'იყიდე ახლავე',
        buttonTextEn: 'Shop Now',
        sortOrder: 1,
        isActive: true,
      },
    }),
    prisma.banner.create({
      data: {
        titleKa: 'ვიტამინებზე 20% ფასდაკლება',
        titleEn: '20% Off Vitamins',
        subtitleKa: 'განაახლე იმუნიტეტი ჩვენი პრემიუმ ვიტამინებით',
        subtitleEn: 'Boost your immunity with our premium vitamins',
        image: '/images/banners/hero-2.jpg',
        imageMobile: '/images/banners/hero-2-mobile.jpg',
        link: '/categories/vitamins-supplements',
        buttonTextKa: 'ნახე ფასდაკლებები',
        buttonTextEn: 'View Deals',
        sortOrder: 2,
        isActive: true,
      },
    }),
    prisma.banner.create({
      data: {
        titleKa: 'უფასო მიტანა 100₾-ზე მეტ შეკვეთაზე',
        titleEn: 'Free Delivery on Orders Over 100₾',
        subtitleKa: 'თბილისში სწრაფი და უსაფრთხო მიტანა',
        subtitleEn: 'Fast and safe delivery in Tbilisi',
        image: '/images/banners/hero-3.jpg',
        imageMobile: '/images/banners/hero-3-mobile.jpg',
        link: '/delivery',
        buttonTextKa: 'გაიგე მეტი',
        buttonTextEn: 'Learn More',
        sortOrder: 3,
        isActive: true,
      },
    }),
  ]);

  console.log(`   ✅ Created ${banners.length} banners`);

  // ============================================================================
  // 6. STATIC PAGES
  // ============================================================================
  console.log('\n📄 Creating static pages...');

  const pages = await Promise.all([
    prisma.page.create({
      data: {
        slug: 'about',
        titleKa: 'ჩვენს შესახებ',
        titleEn: 'About Us',
        contentKa: `
# მედფარმა პლუსი

მედფარმა პლუსი არის საქართველოს ერთ-ერთი წამყვანი ფარმაცევტული კომპანია 30 წლიანი გამოცდილებით.

## ჩვენი მისია

ჩვენ ვზრუნავთ თქვენს ჯანმრთელობაზე და გთავაზობთ მხოლოდ ხარისხიან პროდუქტებს ხელმისაწვდომ ფასად.

## რატომ ჩვენ?

- 30 წლიანი გამოცდილება
- სერტიფიცირებული პროდუქტები
- პროფესიონალური კონსულტაცია
- სწრაფი მიტანა
        `,
        contentEn: `
# MedPharma Plus

MedPharma Plus is one of Georgia's leading pharmaceutical companies with 30 years of experience.

## Our Mission

We care about your health and offer only quality products at affordable prices.

## Why Choose Us?

- 30 years of experience
- Certified products
- Professional consultation
- Fast delivery
        `,
        isActive: true,
      },
    }),
    prisma.page.create({
      data: {
        slug: 'faq',
        titleKa: 'ხშირად დასმული კითხვები',
        titleEn: 'FAQ',
        contentKa: `
# ხშირად დასმული კითხვები

## როგორ შევუკვეთო?

უბრალოდ აირჩიეთ პროდუქტი, დაამატეთ კალათაში და გაიარეთ შეკვეთის პროცესი.

## როგორ მიმდინარეობს მიტანა?

მიტანა ხდება 1-3 სამუშაო დღეში, თბილისში კი იმავე დღეს.

## შემიძლია შეკვეთის გაუქმება?

დიახ, შეკვეთის გაუქმება შესაძლებელია მიტანამდე.
        `,
        contentEn: `
# Frequently Asked Questions

## How do I place an order?

Simply select a product, add it to your cart, and proceed to checkout.

## How does delivery work?

Delivery takes 1-3 business days, same-day delivery available in Tbilisi.

## Can I cancel my order?

Yes, orders can be cancelled before delivery.
        `,
        isActive: true,
      },
    }),
    prisma.page.create({
      data: {
        slug: 'terms',
        titleKa: 'წესები და პირობები',
        titleEn: 'Terms & Conditions',
        contentKa: `
# წესები და პირობები

ეს გვერდი შეიცავს მედფარმა პლუსის ვებგვერდით სარგებლობის წესებსა და პირობებს.

## ზოგადი პირობები

ვებგვერდით სარგებლობით თქვენ ეთანხმებით ამ პირობებს.

## შეკვეთა და გადახდა

ყველა ფასი მოცემულია ლარებში და მოიცავს დღგ-ს.
        `,
        contentEn: `
# Terms & Conditions

This page contains the terms and conditions for using the MedPharma Plus website.

## General Terms

By using this website, you agree to these terms.

## Orders and Payment

All prices are in Georgian Lari and include VAT.
        `,
        isActive: true,
      },
    }),
    prisma.page.create({
      data: {
        slug: 'privacy',
        titleKa: 'კონფიდენციალურობის პოლიტიკა',
        titleEn: 'Privacy Policy',
        contentKa: `
# კონფიდენციალურობის პოლიტიკა

მედფარმა პლუსი იცავს თქვენს პირად მონაცემებს.

## მონაცემთა შეგროვება

ჩვენ ვაგროვებთ მხოლოდ შეკვეთის შესასრულებლად აუცილებელ მონაცემებს.

## მონაცემთა დაცვა

თქვენი მონაცემები დაცულია თანამედროვე ენკრიფციის მეთოდებით.
        `,
        contentEn: `
# Privacy Policy

MedPharma Plus protects your personal data.

## Data Collection

We only collect data necessary to fulfill your orders.

## Data Protection

Your data is protected using modern encryption methods.
        `,
        isActive: true,
      },
    }),
  ]);

  console.log(`   ✅ Created ${pages.length} static pages`);

  // ============================================================================
  // 7. SITE SETTINGS
  // ============================================================================
  console.log('\n⚙️  Creating site settings...');

  const settings = await Promise.all([
    prisma.siteSetting.create({ data: { key: 'site_name_ka', value: 'მედფარმა პლუსი' } }),
    prisma.siteSetting.create({ data: { key: 'site_name_en', value: 'MedPharma Plus' } }),
    prisma.siteSetting.create({ data: { key: 'site_description_ka', value: 'თქვენი სანდო ონლაინ აფთიაქი' } }),
    prisma.siteSetting.create({ data: { key: 'site_description_en', value: 'Your trusted online pharmacy' } }),
    prisma.siteSetting.create({ data: { key: 'contact_phone', value: '+995 32 2 00 00 00' } }),
    prisma.siteSetting.create({ data: { key: 'contact_email', value: 'info@medpharma.ge' } }),
    prisma.siteSetting.create({ data: { key: 'contact_address_ka', value: 'თბილისი, რუსთაველის გამზ. 1' } }),
    prisma.siteSetting.create({ data: { key: 'contact_address_en', value: 'Tbilisi, Rustaveli Ave. 1' } }),
    prisma.siteSetting.create({ data: { key: 'social_facebook', value: 'https://facebook.com/medpharmaplus' } }),
    prisma.siteSetting.create({ data: { key: 'social_instagram', value: 'https://instagram.com/medpharmaplus' } }),
    prisma.siteSetting.create({ data: { key: 'working_hours_ka', value: 'ორშ-პარ: 09:00 - 21:00, შაბ-კვ: 10:00 - 18:00' } }),
    prisma.siteSetting.create({ data: { key: 'working_hours_en', value: 'Mon-Fri: 09:00 - 21:00, Sat-Sun: 10:00 - 18:00' } }),
  ]);

  console.log(`   ✅ Created ${settings.length} site settings`);

  // Re-enable triggers and update search vectors
  console.log('\n▶️  Re-enabling triggers and updating search vectors...');
  await prisma.$executeRaw`ALTER TABLE "categories" ENABLE TRIGGER categories_search_vector_trigger`;
  await prisma.$executeRaw`ALTER TABLE "products" ENABLE TRIGGER products_search_vector_trigger`;
  await prisma.$executeRaw`ALTER TABLE "pages" ENABLE TRIGGER pages_search_vector_trigger`;

  // Update search vectors for all records
  await prisma.$executeRaw`
    UPDATE "categories" SET "search_vector" =
      setweight(to_tsvector('simple', COALESCE("nameKa", '')), 'A') ||
      setweight(to_tsvector('simple', COALESCE("nameEn", '')), 'A') ||
      setweight(to_tsvector('simple', COALESCE("descKa", '')), 'B') ||
      setweight(to_tsvector('simple', COALESCE("descEn", '')), 'B')
  `;
  await prisma.$executeRaw`
    UPDATE "products" SET "search_vector" =
      setweight(to_tsvector('simple', COALESCE("nameKa", '')), 'A') ||
      setweight(to_tsvector('simple', COALESCE("nameEn", '')), 'A') ||
      setweight(to_tsvector('simple', COALESCE("sku", '')), 'A') ||
      setweight(to_tsvector('simple', COALESCE("brand", '')), 'B') ||
      setweight(to_tsvector('simple', COALESCE("manufacturer", '')), 'B') ||
      setweight(to_tsvector('simple', COALESCE("activeIngredient", '')), 'B') ||
      setweight(to_tsvector('simple', COALESCE("shortDescKa", '')), 'C') ||
      setweight(to_tsvector('simple', COALESCE("shortDescEn", '')), 'C') ||
      setweight(to_tsvector('simple', COALESCE("barcode", '')), 'D')
  `;
  await prisma.$executeRaw`
    UPDATE "pages" SET "search_vector" =
      setweight(to_tsvector('simple', COALESCE("titleKa", '')), 'A') ||
      setweight(to_tsvector('simple', COALESCE("titleEn", '')), 'A') ||
      setweight(to_tsvector('simple', COALESCE("contentKa", '')), 'B') ||
      setweight(to_tsvector('simple', COALESCE("contentEn", '')), 'B')
  `;
  console.log('   ✅ Search vectors updated');

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log('\n' + '═'.repeat(60));
  console.log('🎉 Seed completed successfully!\n');
  console.log('Summary:');
  console.log(`   👤 Admin users: 2`);
  console.log(`   📁 Categories: ${categories.length + vitaminSubCategories.length + painSubCategories.length}`);
  console.log(`   💊 Products: ${products.length}`);
  console.log(`   🚚 Delivery zones: ${deliveryZones.length}`);
  console.log(`   🖼️  Banners: ${banners.length}`);
  console.log(`   📄 Static pages: ${pages.length}`);
  console.log(`   ⚙️  Site settings: ${settings.length}`);
  console.log('\n' + '═'.repeat(60));
  console.log('\n📝 Admin login credentials:');
  console.log('   Email: admin@medpharma.ge');
  console.log('   Password: admin123\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
