/**
 * Product Not Found Page
 */

import { PackageX, ArrowLeft, Search } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { Container, Button } from '@/components/ui';
import { Link } from '@/i18n/navigation';

export default async function ProductNotFound() {
  const t = await getTranslations();

  return (
    <Container size="sm" className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <div className="mb-6 rounded-full bg-gray-100 p-6">
        <PackageX className="h-12 w-12 text-gray-400" />
      </div>

      <h1 className="mb-2 text-2xl font-bold text-gray-900">
        {t('errors.notFound')}
      </h1>

      <p className="mb-8 max-w-md text-gray-600">
        The product you&apos;re looking for doesn&apos;t exist or has been removed.
        Please try searching for another product or browse our catalog.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/products">
          <Button>
            <Search className="mr-2 h-4 w-4" />
            Browse Products
          </Button>
        </Link>
        <Link href="/">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('nav.home')}
          </Button>
        </Link>
      </div>
    </Container>
  );
}
