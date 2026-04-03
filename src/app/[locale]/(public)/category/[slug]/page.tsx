import { Suspense } from 'react';

import { type Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { ProductsCatalog, Breadcrumb, CategoryJsonLd, BreadcrumbJsonLd } from '@/components/products';
import { Container, Skeleton } from '@/components/ui';
import { type DosageForm } from '@/generated/prisma';
import { Link } from '@/i18n/navigation';
import { type Locale } from '@/lib/constants';
import { serialize } from '@/lib/utils';
import { getCategory, getCategoryBreadcrumb, getRootCategories } from '@/services/categories';
import { getProducts, type ProductListOptions, type SortOption } from '@/services/products';

interface CategoryPageProps {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  const categoryName = locale === 'ka' ? category.nameKa : category.nameEn;
  const categoryDesc = locale === 'ka' ? category.descKa : category.descEn;
  const siteName = locale === 'ka' ? 'მედფარმა პლუსი' : 'MedPharma Plus';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://medpharmaplus.ge';

  // Use category-specific meta fields if available, fallback to auto-generated
  // Note: metaTitle/metaDesc fields may be present on the category object from DB
  const categoryRecord = category as unknown as Record<string, string | null | undefined>;
  const metaTitle = locale === 'ka'
    ? categoryRecord.metaTitleKa
    : categoryRecord.metaTitleEn;
  const metaDesc = locale === 'ka'
    ? categoryRecord.metaDescKa
    : categoryRecord.metaDescEn;

  const title = metaTitle || `${categoryName} | ${siteName}`;
  const description = metaDesc || categoryDesc || `${categoryName} - ${siteName}`;

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/category/${slug}`,
      languages: {
        'ka': `${baseUrl}/ka/category/${slug}`,
        'en': `${baseUrl}/en/category/${slug}`,
      },
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${baseUrl}/${locale}/category/${slug}`,
      siteName,
      locale: locale === 'ka' ? 'ka_GE' : 'en_US',
      images: category.image
        ? [
            {
              url: category.image,
              width: 1200,
              height: 630,
              alt: categoryName,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: category.image ? [category.image] : undefined,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { locale, slug } = await params;
  const sp = await searchParams;

  // Enable static rendering
  setRequestLocale(locale);

  // Fetch category
  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

  // Parse search params (same as products page, but category is fixed)
  const search = typeof sp.q === 'string' ? sp.q : undefined;
  const minPrice = typeof sp.minPrice === 'string' ? parseFloat(sp.minPrice) : undefined;
  const maxPrice = typeof sp.maxPrice === 'string' ? parseFloat(sp.maxPrice) : undefined;
  const brands = typeof sp.brands === 'string' ? sp.brands.split(',').filter(Boolean) : undefined;
  const dosageForms = typeof sp.dosageForms === 'string'
    ? (sp.dosageForms.split(',').filter(Boolean) as DosageForm[])
    : undefined;
  const inStockOnly = sp.inStock === 'true';
  const sort = (typeof sp.sort === 'string' ? sp.sort : 'popularity') as SortOption;
  const page = typeof sp.page === 'string' ? parseInt(sp.page, 10) : 1;

  // Build options for product query with category pre-set
  const options: ProductListOptions = {
    search,
    category: slug, // Fixed to this category
    includeChildCategories: true,
    minPrice: minPrice && !isNaN(minPrice) ? minPrice : undefined,
    maxPrice: maxPrice && !isNaN(maxPrice) ? maxPrice : undefined,
    brand: brands,
    dosageForm: dosageForms,
    stockStatus: inStockOnly ? 'in_stock' : 'all',
    sort,
    page: page > 0 ? page : 1,
    limit: 20,
    locale: locale as Locale,
    isActive: true,
  };

  // Fetch data in parallel
  const [rawProductsData, categories, breadcrumbData] = await Promise.all([
    getProducts(options),
    getRootCategories(),
    getCategoryBreadcrumb(slug),
  ]);

  // Serialize Decimal objects for client component
  const productsData = serialize(rawProductsData);

  const t = await getTranslations({ locale, namespace: 'category' });
  const tNav = await getTranslations({ locale, namespace: 'nav' });

  // Get localized category name
  const categoryName = locale === 'ka' ? category.nameKa : category.nameEn;
  const categoryDesc = locale === 'ka' ? category.descKa : category.descEn;

  // Build breadcrumb items for UI
  const breadcrumbItems = [
    { label: tNav('products'), href: '/products' },
    ...breadcrumbData.map((item, index) => ({
      label: locale === 'ka' ? item.nameKa : item.nameEn,
      href: index < breadcrumbData.length - 1 ? `/category/${item.slug}` : undefined,
    })),
  ];

  // Build breadcrumb items for JSON-LD schema
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://medpharmaplus.ge';
  const breadcrumbJsonLdItems = [
    {
      name: locale === 'ka' ? 'მთავარი' : 'Home',
      url: `${baseUrl}/${locale}`,
    },
    {
      name: locale === 'ka' ? 'პროდუქცია' : 'Products',
      url: `${baseUrl}/${locale}/products`,
    },
    ...breadcrumbData.map((item) => ({
      name: locale === 'ka' ? item.nameKa : item.nameEn,
      url: `${baseUrl}/${locale}/category/${item.slug}`,
    })),
  ];

  return (
    <>
      {/* SEO Structured Data */}
      <CategoryJsonLd
        category={category}
        locale={locale as 'ka' | 'en'}
        productCount={productsData.pagination.total}
        baseUrl={baseUrl}
      />
      <BreadcrumbJsonLd items={breadcrumbJsonLdItems} />

      <main className="py-8">
        <Container>
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} className="mb-6" />

        {/* Category Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{categoryName}</h1>
          {categoryDesc && (
            <p className="mt-2 text-gray-600">{categoryDesc}</p>
          )}
          {category.children && category.children.length > 0 && (
            <div className="mt-4">
              <h2 className="text-sm font-medium text-gray-500 mb-2">
                {t('subcategories')}
              </h2>
              <div className="flex flex-wrap gap-2">
                {category.children.map((child) => (
                  <Link
                    key={child.id}
                    href={`/category/${child.slug}`}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-[#df2b1b] hover:text-white transition-colors"
                  >
                    {locale === 'ka' ? child.nameKa : child.nameEn}
                    {child._count?.products !== undefined && (
                      <span className="ml-1.5 text-xs opacity-75">
                        ({child._count.products})
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Products Catalog (with category pre-selected) */}
        <Suspense fallback={<ProductsCatalogSkeleton />}>
          <ProductsCatalog
            initialData={productsData}
            categories={categories}
            initialCategory={slug}
          />
        </Suspense>
      </Container>
    </main>
    </>
  );
}

// Loading skeleton for the products catalog
function ProductsCatalogSkeleton() {
  return (
    <div className="flex gap-6">
      {/* Sidebar skeleton */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="space-y-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </aside>
      {/* Main content skeleton */}
      <div className="flex-1 space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="flex justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-40" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
              <Skeleton className="aspect-square w-full" />
              <div className="p-3">
                <Skeleton className="mb-2 h-3 w-1/3" />
                <Skeleton className="mb-1 h-4 w-full" />
                <Skeleton className="mb-3 h-4 w-2/3" />
                <Skeleton className="mb-2 h-6 w-1/2" />
                <Skeleton className="h-9 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
