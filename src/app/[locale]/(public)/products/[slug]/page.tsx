/**
 * Product Detail Page
 *
 * Server component that fetches product data and renders the detail view.
 * Features:
 * - Image gallery with zoom on hover
 * - Price/sale display with discount calculation
 * - Stock status indicator
 * - Full description with tabs
 * - Manufacturer/brand/dosage information
 * - Quantity selector
 * - Add to cart button
 * - Related products section
 * - Breadcrumb navigation
 * - SEO metadata
 */

import { notFound } from 'next/navigation';

import { type Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { ProductDetailContent, ProductJsonLd, BreadcrumbJsonLd } from '@/components/products';
import { locales, type Locale } from '@/i18n/config';
import { serialize } from '@/lib/utils';
import { getProduct, getRelatedProducts, incrementViewCount } from '@/services/products';

type Props = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

/**
 * Generate static params for common products (optional optimization)
 */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  const name = locale === 'ka' ? product.nameKa : product.nameEn;
  const description = locale === 'ka'
    ? (product.metaDescKa || product.shortDescKa || product.descKa)
    : (product.metaDescEn || product.shortDescEn || product.descEn);
  const metaTitle = locale === 'ka' ? product.metaTitleKa : product.metaTitleEn;
  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://medpharmaplus.ge';
  const siteName = locale === 'ka' ? 'მედფარმა პლუსი' : 'MedPharma Plus';

  const title = metaTitle || name;
  const descriptionText = description?.slice(0, 160) || undefined;
  const price = product.salePrice ? Number(product.salePrice) : Number(product.price);

  return {
    title,
    description: descriptionText,
    alternates: {
      canonical: `${baseUrl}/${locale}/products/${slug}`,
      languages: {
        'ka': `${baseUrl}/ka/products/${slug}`,
        'en': `${baseUrl}/en/products/${slug}`,
      },
    },
    openGraph: {
      title,
      description: descriptionText,
      type: 'website', // 'product' type is not officially supported
      url: `${baseUrl}/${locale}/products/${slug}`,
      siteName,
      locale: locale === 'ka' ? 'ka_GE' : 'en_US',
      images: primaryImage
        ? [
            {
              url: primaryImage.url,
              width: 800,
              height: 800,
              alt: primaryImage.alt || name,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: descriptionText,
      images: primaryImage ? [primaryImage.url] : undefined,
    },
    other: {
      // Product-specific Open Graph meta tags
      'product:price:amount': price.toFixed(2),
      'product:price:currency': 'GEL',
      'product:availability': product.stock > 0 ? 'in stock' : 'out of stock',
      'product:condition': 'new',
      ...(product.brand && { 'product:brand': product.brand }),
      ...(product.sku && { 'product:retailer_item_id': product.sku }),
      ...(product.barcode && { 'product:gtin': product.barcode }),
      ...(product.category && {
        'product:category':
          locale === 'ka' ? product.category.nameKa : product.category.nameEn,
      }),
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

export default async function ProductDetailPage({ params }: Props) {
  const { locale, slug } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  // Fetch product data
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  // Fetch related products
  const relatedProducts = await getRelatedProducts(product.id, {
    limit: 8,
    locale: locale as Locale,
  });

  // Increment view count (fire and forget - don't await)
  incrementViewCount(product.id).catch(console.error);

  // Build breadcrumb items for JSON-LD
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://medpharmaplus.ge';
  const productName = locale === 'ka' ? product.nameKa : product.nameEn;
  const breadcrumbItems: Array<{ name: string; url: string }> = [
    {
      name: locale === 'ka' ? 'მთავარი' : 'Home',
      url: `${baseUrl}/${locale}`,
    },
    {
      name: locale === 'ka' ? 'პროდუქცია' : 'Products',
      url: `${baseUrl}/${locale}/products`,
    },
  ];

  // Add parent category if exists
  if (product.category?.parent) {
    const parentName = locale === 'ka'
      ? product.category.parent.nameKa
      : product.category.parent.nameEn;
    breadcrumbItems.push({
      name: parentName,
      url: `${baseUrl}/${locale}/category/${product.category.parent.slug}`,
    });
  }

  // Add category if exists
  if (product.category) {
    const categoryName = locale === 'ka'
      ? product.category.nameKa
      : product.category.nameEn;
    breadcrumbItems.push({
      name: categoryName,
      url: `${baseUrl}/${locale}/category/${product.category.slug}`,
    });
  }

  // Add product as final breadcrumb
  breadcrumbItems.push({
    name: productName,
    url: `${baseUrl}/${locale}/products/${product.slug}`,
  });

  // Compute price valid until date based on product's last update (30 days from updatedAt)
  // This avoids using Date.now() which ESLint flags as impure
  const priceValidUntil = product.salePrice
    ? new Date(new Date(product.updatedAt).getTime() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]
    : undefined;

  // Serialize data to convert Decimal objects to plain numbers
  const serializedProduct = serialize(product);
  const serializedRelatedProducts = serialize(relatedProducts);

  return (
    <>
      <ProductJsonLd
        product={serializedProduct}
        locale={locale as 'ka' | 'en'}
        priceValidUntil={priceValidUntil}
      />
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <ProductDetailContent
        product={serializedProduct}
        relatedProducts={serializedRelatedProducts}
      />
    </>
  );
}
