/**
 * Product Detail Loading Skeleton
 */

import { Container, Skeleton } from '@/components/ui';

export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <Container size="xl" className="py-4 sm:py-6">
        {/* Breadcrumb Skeleton */}
        <div className="mb-4 flex items-center gap-2 sm:mb-6">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Main Product Card */}
        <div className="overflow-hidden rounded-xl bg-white shadow-sm sm:rounded-2xl">
          <div className="grid grid-cols-1 gap-0 md:grid-cols-2 lg:grid-cols-[55%,45%]">
            {/* Left Column - Image */}
            <div className="border-b border-gray-100 p-4 sm:p-6 md:border-b-0 md:border-r lg:p-8">
              <Skeleton className="aspect-square w-full rounded-xl" />
              {/* Thumbnails */}
              <div className="mt-4 flex gap-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-16 rounded-lg sm:h-20 sm:w-20" />
                ))}
              </div>
            </div>

            {/* Right Column - Product Info */}
            <div className="p-5 sm:p-6 lg:p-8">
              {/* Badge */}
              <Skeleton className="mb-3 h-6 w-32 rounded-full" />

              {/* Title */}
              <Skeleton className="mb-2 h-7 w-4/5" />

              {/* Brand & SKU */}
              <div className="mb-4 flex items-center gap-3">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>

              {/* Price & Stock */}
              <div className="mb-5 flex items-end justify-between">
                <div className="flex items-end gap-3">
                  <Skeleton className="h-9 w-28" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-5 w-24" />
              </div>

              {/* Divider */}
              <div className="mb-5 h-px bg-gray-100" />

              {/* Attributes */}
              <div className="mb-5 space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="mb-5 h-px bg-gray-100" />

              {/* Quantity */}
              <div className="mb-4 flex items-center justify-between">
                <Skeleton className="h-5 w-20" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-28 rounded-lg" />
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <Skeleton className="h-9 w-9 rounded-full" />
                </div>
              </div>

              {/* Buttons */}
              <div className="mb-5 flex gap-3">
                <Skeleton className="h-12 flex-1 rounded-full" />
                <Skeleton className="h-12 flex-1 rounded-full" />
              </div>

              {/* Trust badges */}
              <div className="flex justify-center gap-6 border-t border-gray-100 pt-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="mt-6 sm:mt-8">
          {/* Tab buttons */}
          <div className="inline-flex gap-1 rounded-full bg-gray-100 p-1">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-32 rounded-full" />
            <Skeleton className="h-8 w-36 rounded-full" />
          </div>

          {/* Tab content */}
          <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </div>
        </div>

        {/* Disclaimer Skeleton */}
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4 sm:mt-8">
          <div className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
            </div>
          </div>
        </div>

        {/* Related Products Skeleton */}
        <div className="mt-10 sm:mt-14">
          <div className="mb-6 flex items-center justify-between">
            <Skeleton className="h-7 w-48" />
            <div className="hidden gap-2 sm:flex">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
          <div className="flex gap-4 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-[160px] flex-shrink-0 sm:w-[220px] lg:w-[260px]">
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                  <Skeleton className="aspect-square w-full" />
                  <div className="p-3">
                    <Skeleton className="mb-2 h-3 w-1/3" />
                    <Skeleton className="mb-1 h-4 w-full" />
                    <Skeleton className="mb-3 h-4 w-2/3" />
                    <Skeleton className="mb-2 h-6 w-1/2" />
                    <Skeleton className="h-9 w-full rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
