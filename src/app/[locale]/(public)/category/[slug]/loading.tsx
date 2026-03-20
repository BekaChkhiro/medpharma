import { Container, Skeleton } from '@/components/ui';

export default function CategoryLoading() {
  return (
    <main className="py-8">
      <Container>
        {/* Breadcrumb skeleton */}
        <div className="mb-6 flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Category Header skeleton */}
        <div className="mb-8">
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-full max-w-2xl" />
          <div className="mt-4">
            <Skeleton className="h-4 w-24 mb-2" />
            <div className="flex flex-wrap gap-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-24 rounded-full" />
              ))}
            </div>
          </div>
        </div>

        {/* Catalog skeleton */}
        <div className="flex gap-6">
          {/* Desktop Sidebar skeleton */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="space-y-4">
              <Skeleton className="h-6 w-20" />
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
              <Skeleton className="h-6 w-16 mt-6" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </aside>

          {/* Main content skeleton */}
          <div className="flex-1">
            {/* Search bar skeleton */}
            <Skeleton className="h-10 w-full mb-4" />

            {/* Controls skeleton */}
            <div className="flex items-center justify-between mb-6">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-10 w-40" />
            </div>

            {/* Product grid skeleton */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
