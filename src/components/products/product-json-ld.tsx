/**
 * Product JSON-LD Structured Data
 *
 * Generates structured data for SEO following schema.org Product and BreadcrumbList schemas.
 * Used by search engines to understand product information.
 */

import { type ProductDetail } from '@/services/products';

interface ProductJsonLdProps {
  product: ProductDetail;
  locale: 'ka' | 'en';
  baseUrl?: string;
  /** ISO date string for when sale price expires (computed server-side) */
  priceValidUntil?: string;
}

export function ProductJsonLd({
  product,
  locale,
  baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://medpharmaplus.ge',
  priceValidUntil,
}: ProductJsonLdProps) {
  const name = locale === 'ka' ? product.nameKa : product.nameEn;
  const description = locale === 'ka'
    ? (product.descKa || product.shortDescKa)
    : (product.descEn || product.shortDescEn);

  // Get all product images for the schema
  const allImages = product.images
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((img) => img.url);

  const price = product.salePrice ? Number(product.salePrice) : Number(product.price);
  const inStock = product.stock > 0;

  // Build category name from hierarchy
  const categoryName = product.category
    ? locale === 'ka'
      ? product.category.nameKa
      : product.category.nameEn
    : undefined;

  // Build the structured data object with enhanced fields
  const productData: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description: description?.slice(0, 5000) || undefined,
    image: allImages.length > 0 ? allImages : undefined,
    sku: product.sku,
    // GTIN (barcode) - important for Google Shopping
    gtin13: product.barcode || undefined,
    mpn: product.sku, // Manufacturer Part Number
    brand: product.brand
      ? {
          '@type': 'Brand',
          name: product.brand,
        }
      : undefined,
    manufacturer: product.manufacturer
      ? {
          '@type': 'Organization',
          name: product.manufacturer,
        }
      : undefined,
    // Category information
    category: categoryName,
    // Additional product attributes for pharmaceuticals
    ...(product.dosageForm && {
      additionalProperty: [
        {
          '@type': 'PropertyValue',
          name: 'Dosage Form',
          value: product.dosageForm,
        },
        ...(product.dosage
          ? [
              {
                '@type': 'PropertyValue',
                name: 'Dosage',
                value: product.dosage,
              },
            ]
          : []),
        ...(product.activeIngredient
          ? [
              {
                '@type': 'PropertyValue',
                name: 'Active Ingredient',
                value: product.activeIngredient,
              },
            ]
          : []),
        ...(product.requiresPrescription
          ? [
              {
                '@type': 'PropertyValue',
                name: 'Prescription Required',
                value: 'Yes',
              },
            ]
          : []),
      ],
    }),
    // Weight if available
    ...(product.weight && {
      weight: {
        '@type': 'QuantitativeValue',
        value: Number(product.weight),
        unitCode: 'GRM', // Grams
      },
    }),
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/${locale}/products/${product.slug}`,
      priceCurrency: 'GEL',
      price: price.toFixed(2),
      // Show price validity if on sale and provided
      ...(product.salePrice && priceValidUntil && {
        priceValidUntil,
      }),
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'MedPharma Plus',
        url: baseUrl,
      },
      // Shipping details
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'GE', // Georgia
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 1,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 3,
            unitCode: 'DAY',
          },
        },
      },
      // Return policy
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'GE',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 14,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
    },
  };

  // Remove undefined values for cleaner JSON
  const cleanProductData = JSON.parse(JSON.stringify(productData));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(cleanProductData) }}
    />
  );
}

interface BreadcrumbJsonLdProps {
  items: Array<{
    name: string;
    url: string;
  }>;
}

/**
 * BreadcrumbList JSON-LD Structured Data
 *
 * Generates breadcrumb structured data for search engine rich results.
 * Shows breadcrumb trail in Google search results.
 */
export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  if (items.length === 0) return null;

  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
    />
  );
}

interface CategoryJsonLdProps {
  category: {
    slug: string;
    nameKa: string;
    nameEn: string;
    descKa?: string | null;
    descEn?: string | null;
    image?: string | null;
  };
  locale: 'ka' | 'en';
  productCount?: number;
  baseUrl?: string;
}

/**
 * Category JSON-LD Structured Data
 *
 * Generates CollectionPage structured data for category pages.
 * Helps search engines understand the category hierarchy and content.
 */
export function CategoryJsonLd({
  category,
  locale,
  productCount,
  baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://medpharmaplus.ge',
}: CategoryJsonLdProps) {
  const name = locale === 'ka' ? category.nameKa : category.nameEn;
  const description = locale === 'ka' ? category.descKa : category.descEn;
  const siteName = locale === 'ka' ? 'მედფარმა პლუსი' : 'MedPharma Plus';

  const categoryData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description: description || `${name} - ${siteName}`,
    url: `${baseUrl}/${locale}/category/${category.slug}`,
    ...(category.image && { image: category.image }),
    isPartOf: {
      '@type': 'WebSite',
      name: siteName,
      url: baseUrl,
    },
    ...(productCount !== undefined && {
      numberOfItems: productCount,
    }),
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: locale === 'ka' ? 'მთავარი' : 'Home',
          item: `${baseUrl}/${locale}`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: locale === 'ka' ? 'პროდუქცია' : 'Products',
          item: `${baseUrl}/${locale}/products`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name,
          item: `${baseUrl}/${locale}/category/${category.slug}`,
        },
      ],
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: [], // Products will be listed here by search engines from page content
      numberOfItems: productCount || 0,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryData) }}
    />
  );
}

interface OrganizationJsonLdProps {
  locale: 'ka' | 'en';
  baseUrl?: string;
}

/**
 * Organization JSON-LD Structured Data
 *
 * Provides information about the business for search engines.
 * Should be included on the homepage or in the layout.
 */
export function OrganizationJsonLd({
  locale,
  baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://medpharmaplus.ge',
}: OrganizationJsonLdProps) {
  const siteName = locale === 'ka' ? 'მედფარმა პლუსი' : 'MedPharma Plus';
  const description =
    locale === 'ka'
      ? 'ონლაინ აფთიაქი საქართველოში - მედიკამენტები, ვიტამინები და ჯანმრთელობის პროდუქტები'
      : 'Online pharmacy in Georgia - Medicines, vitamins and health products';

  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Pharmacy',
    name: siteName,
    alternateName: 'MedPharma Plus',
    description,
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    image: `${baseUrl}/og-image.jpg`,
    telephone: '+995 XXX XXX XXX', // Replace with actual phone
    email: 'info@medpharmaplus.ge',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Tbilisi', // Replace with actual address
      addressLocality: 'Tbilisi',
      addressRegion: 'Tbilisi',
      postalCode: '0100',
      addressCountry: 'GE',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 41.7151, // Replace with actual coordinates
      longitude: 44.8271,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '21:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday', 'Sunday'],
        opens: '10:00',
        closes: '20:00',
      },
    ],
    priceRange: '$$',
    paymentAccepted: ['Cash', 'Credit Card', 'Debit Card'],
    currenciesAccepted: 'GEL',
    sameAs: [
      'https://www.facebook.com/medpharmaplus', // Replace with actual social links
      'https://www.instagram.com/medpharmaplus',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
    />
  );
}

interface WebSiteJsonLdProps {
  locale: 'ka' | 'en';
  baseUrl?: string;
}

/**
 * WebSite JSON-LD Structured Data with SearchAction
 *
 * Enables sitelinks search box in Google search results.
 */
export function WebSiteJsonLd({
  locale,
  baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://medpharmaplus.ge',
}: WebSiteJsonLdProps) {
  const siteName = locale === 'ka' ? 'მედფარმა პლუსი' : 'MedPharma Plus';

  const websiteData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    alternateName: 'MedPharma Plus',
    url: baseUrl,
    inLanguage: locale === 'ka' ? 'ka-GE' : 'en-US',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/${locale}/products?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
    />
  );
}
