import { Suspense } from 'react';

import { type Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { ProductsCatalog } from '@/components/products';
import { Container, Skeleton } from '@/components/ui';
import { type DosageForm } from '@/generated/prisma';
import { type Locale } from '@/lib/constants';
import { serialize } from '@/lib/utils';
import { getRootCategories } from '@/services/categories';
import { getProducts, type ProductListOptions, type SortOption } from '@/services/products';

interface ProductsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  params,
}: ProductsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'products' });
  const tMeta = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: `${t('title')} | ${locale === 'ka' ? 'მედფარმა პლუსი' : 'MedPharma Plus'}`,
    description: tMeta('description'),
  };
}

export default async function ProductsPage({
  params,
  searchParams,
}: ProductsPageProps) {
  const { locale } = await params;
  const sp = await searchParams;

  // Enable static rendering
  setRequestLocale(locale);

  // Parse search params
  const search = typeof sp.q === 'string' ? sp.q : undefined;
  const category = typeof sp.category === 'string' ? sp.category : undefined;
  const minPrice = typeof sp.minPrice === 'string' ? parseFloat(sp.minPrice) : undefined;
  const maxPrice = typeof sp.maxPrice === 'string' ? parseFloat(sp.maxPrice) : undefined;
  const brands = typeof sp.brands === 'string' ? sp.brands.split(',').filter(Boolean) : undefined;
  const dosageForms = typeof sp.dosageForms === 'string'
    ? (sp.dosageForms.split(',').filter(Boolean) as DosageForm[])
    : undefined;
  const inStockOnly = sp.inStock === 'true';
  const sort = (typeof sp.sort === 'string' ? sp.sort : 'popularity') as SortOption;
  const page = typeof sp.page === 'string' ? parseInt(sp.page, 10) : 1;

  // Build options for product query
  const options: ProductListOptions = {
    search,
    category,
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
  const [rawProductsData, categories] = await Promise.all([
    getProducts(options),
    getRootCategories(),
  ]);

  // Serialize Decimal objects for client component
  const productsData = serialize(rawProductsData);

  const t = await getTranslations({ locale, namespace: 'products' });

  return (
    <main className="py-8">
      <Container>
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
        </div>

        {/* Products Catalog */}
        <Suspense fallback={<ProductsCatalogSkeleton />}>
          <ProductsCatalog
            initialData={productsData}
            categories={categories}
          />
        </Suspense>
      </Container>
    </main>
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
            <div key={i} className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-[#FDFBF7]">
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
