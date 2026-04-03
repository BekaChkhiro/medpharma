'use client';

import { useState } from 'react';

import {
  ShoppingCart,
  Heart,
  Share2,
  Check,
  AlertTriangle,
  Package,
  Pill,
  Building2,
  FileText,
  Info,
  Truck,
  Shield,
  RotateCcw,
  Star,
  Copy,
  ChevronDown,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import {
  Badge,
  Button,
  QuantitySelector,
  Container,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui';
import { useAddToCart } from '@/hooks/use-cart';
import { Link } from '@/i18n/navigation';
import { formatPrice, cn } from '@/lib/utils';
import { type ProductDetail, type ProductWithImages } from '@/services/products';

import { ProductBreadcrumb } from './breadcrumb';
import { ImageGallery } from './image-gallery';
import { ProductCarousel } from './product-carousel';


interface ProductDetailContentProps {
  product: ProductDetail;
  relatedProducts: ProductWithImages[];
}

export function ProductDetailContent({
  product,
  relatedProducts,
}: ProductDetailContentProps) {
  const t = useTranslations();
  const locale = useLocale() as 'ka' | 'en';
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const addToCart = useAddToCart();

  // Get primary image for cart
  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];

  // Localized content
  const name = locale === 'ka' ? product.nameKa : product.nameEn;
  const description = locale === 'ka' ? product.descKa : product.descEn;
  const shortDescription = locale === 'ka' ? product.shortDescKa : product.shortDescEn;

  // Price calculations
  const price = Number(product.price);
  const salePrice = product.salePrice ? Number(product.salePrice) : null;
  const hasDiscount = salePrice !== null && salePrice < price;
  const discountPercent = hasDiscount
    ? Math.round(((price - salePrice!) / price) * 100)
    : 0;
  const displayPrice = hasDiscount ? salePrice! : price;

  // Stock status
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= (product.lowStockThreshold || 10);

  // Handle add to cart
  const handleAddToCart = () => {
    setIsAddingToCart(true);
    setCartMessage(null);

    const result = addToCart(
      {
        id: product.id,
        nameKa: product.nameKa,
        nameEn: product.nameEn,
        price: Number(product.price),
        salePrice: product.salePrice ? Number(product.salePrice) : null,
        imageUrl: primaryImage?.url || null,
        stock: product.stock,
        sku: product.sku,
      },
      { quantity, openCartAfter: true }
    );

    if (result.success) {
      setCartMessage({ type: 'success', text: t('cart.itemAdded') });
      setQuantity(1);
    } else {
      const errorKey = result.message === 'outOfStock' ? 'common.outOfStock' : 'cart.stockExceeded';
      setCartMessage({ type: 'error', text: t(errorKey) });
    }

    setIsAddingToCart(false);
    setTimeout(() => setCartMessage(null), 3000);
  };

  // Handle buy now
  const handleBuyNow = () => {
    const result = addToCart(
      {
        id: product.id,
        nameKa: product.nameKa,
        nameEn: product.nameEn,
        price: Number(product.price),
        salePrice: product.salePrice ? Number(product.salePrice) : null,
        imageUrl: primaryImage?.url || null,
        stock: product.stock,
        sku: product.sku,
      },
      { quantity }
    );

    if (result.success) {
      window.location.href = `/${locale}/cart`;
    }
  };

  // Handle share
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: name, url });
      } catch {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // Format dosage form
  const dosageFormKey = product.dosageForm?.toLowerCase() as string;
  const dosageFormLabel = dosageFormKey
    ? t.has(`dosageForms.${dosageFormKey}`)
      ? t(`dosageForms.${dosageFormKey}`)
      : product.dosageForm
    : null;

  return (
    <div className="min-h-screen">
      <Container size="xl" className="py-4 sm:py-6">
        {/* Breadcrumb */}
        <ProductBreadcrumb
          category={product.category}
          productName={name}
          className="mb-4 sm:mb-6"
        />

        {/* Main Product Section */}
        <div className="overflow-hidden rounded-xl bg-white shadow-sm sm:rounded-2xl">
          <div className="grid grid-cols-1 gap-0 md:grid-cols-2 lg:grid-cols-[55%,45%]">
            {/* Left Column - Images */}
            <div className="relative border-b border-gray-100 bg-gradient-to-br from-gray-50/50 to-white p-4 sm:p-6 md:border-b-0 md:border-r md:p-6 lg:p-8">
              {/* Floating badges */}
              <div className="absolute left-4 top-4 z-10 flex flex-col gap-2 sm:left-6 sm:top-6">
                {hasDiscount && (
                  <Badge variant="destructive" className="px-3 py-1 text-sm font-bold shadow-lg">
                    -{discountPercent}%
                  </Badge>
                )}
                {product.isFeatured && (
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-sm font-semibold text-white shadow-lg">
                    <Star className="mr-1 h-3 w-3 fill-current" />
                    {locale === 'ka' ? 'რეკომენდირებული' : 'Featured'}
                  </Badge>
                )}
              </div>

              <div className="md:sticky md:top-24">
                <ImageGallery
                  images={product.images}
                  productName={name}
                />
              </div>
            </div>

            {/* Right Column - Product Info */}
            <div className="p-5 sm:p-6 lg:p-8">
              {/* Header */}
              <div className="mb-4">
                {product.requiresPrescription && (
                  <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    <FileText className="h-3.5 w-3.5" />
                    {t('product.prescription.required')}
                  </div>
                )}
                <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                  {name}
                </h1>
                <div className="mt-2 flex items-center gap-3">
                  {product.brand && (
                    <Link
                      href={`/products?brand=${encodeURIComponent(product.brand)}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {product.brand}
                    </Link>
                  )}
                  {product.brand && product.sku && <span className="text-gray-300">|</span>}
                  {product.sku && (
                    <span className="text-sm text-gray-400">SKU: {product.sku}</span>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="mb-5 flex items-end gap-3">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(displayPrice, { locale: locale === 'ka' ? 'ka-GE' : 'en-US' })}
                </span>
                {hasDiscount && (
                  <span className="mb-1 text-lg text-gray-400 line-through">
                    {formatPrice(price, { locale: locale === 'ka' ? 'ka-GE' : 'en-US' })}
                  </span>
                )}
                <div className={cn(
                  'mb-1 ml-auto flex items-center gap-1.5 text-sm font-medium',
                  isOutOfStock ? 'text-red-600' : isLowStock ? 'text-amber-600' : 'text-green-600'
                )}>
                  {isOutOfStock ? (
                    <><AlertTriangle className="h-4 w-4" />{t('product.stock.outOfStock')}</>
                  ) : isLowStock ? (
                    <><Package className="h-4 w-4" />{t('product.stock.lowStock', { count: product.stock })}</>
                  ) : (
                    <><Check className="h-4 w-4" />{t('product.stock.inStock')}</>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="mb-5 h-px bg-gray-100" />

              {/* Product Attributes - Table style */}
              <div className="mb-5 space-y-2 text-sm">
                {product.manufacturer && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('product.manufacturer')}</span>
                    <span className="font-medium text-gray-900">{product.manufacturer}</span>
                  </div>
                )}
                {dosageFormLabel && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('product.dosageForm')}</span>
                    <span className="font-medium text-gray-900">{dosageFormLabel}</span>
                  </div>
                )}
                {product.dosage && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">{locale === 'ka' ? 'დოზირება' : 'Dosage'}</span>
                    <span className="font-medium text-gray-900">{product.dosage}</span>
                  </div>
                )}
                {product.activeIngredient && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('product.ingredients')}</span>
                    <span className="font-medium text-gray-900">{product.activeIngredient}</span>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="mb-5 h-px bg-gray-100" />

              {/* Quantity */}
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{t('product.quantity')}</span>
                <div className="flex items-center gap-3">
                  <QuantitySelector
                    value={quantity}
                    onChange={setQuantity}
                    min={1}
                    max={Math.min(product.stock, 99)}
                    disabled={isOutOfStock}
                  />
                  <div className="flex gap-1">
                    <button
                      onClick={() => setIsWishlisted(!isWishlisted)}
                      className={cn(
                        'flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-gray-200 transition-colors hover:bg-gray-50',
                        isWishlisted && 'border-red-200 bg-red-50 text-red-500'
                      )}
                    >
                      <Heart className={cn('h-4 w-4', isWishlisted && 'fill-current')} />
                    </button>
                    <button
                      onClick={handleShare}
                      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-gray-200 transition-colors hover:bg-gray-50"
                    >
                      {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Share2 className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Cart message */}
              {cartMessage && (
                <div className={cn(
                  'mb-4 flex items-center gap-2 rounded-lg p-3 text-sm font-medium',
                  cartMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                )}>
                  {cartMessage.type === 'success' ? <Check className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                  {cartMessage.text}
                </div>
              )}

              {/* Buttons */}
              <div className="mb-5 flex gap-3">
                <Button
                  size="lg"
                  className="h-12 flex-1 cursor-pointer rounded-full text-base font-semibold"
                  disabled={isOutOfStock || isAddingToCart}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {isAddingToCart ? t('common.loading') : t('product.addToCart')}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 flex-1 cursor-pointer rounded-full text-base font-semibold"
                  disabled={isOutOfStock}
                  onClick={handleBuyNow}
                >
                  {t('product.buyNow')}
                </Button>
              </div>

              {/* Trust badges */}
              <div className="flex justify-center gap-6 border-t border-gray-100 pt-4 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-gray-400" />
                  <span>{locale === 'ka' ? 'უფასო მიწოდება' : 'Free Delivery'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-gray-400" />
                  <span>{locale === 'ka' ? 'გარანტია' : 'Warranty'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <RotateCcw className="h-4 w-4 text-gray-400" />
                  <span>{locale === 'ka' ? 'დაბრუნება' : 'Returns'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Info Tabs */}
        {description && (
          <div className="mt-6 sm:mt-8">
            <Tabs defaultValue="description">
              <TabsList className="inline-flex gap-1 rounded-full bg-gray-100 p-1">
                <TabsTrigger
                  value="description"
                  className="cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium text-gray-600 transition-all hover:text-gray-900 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
                >
                  {t('product.description')}
                </TabsTrigger>
                <TabsTrigger
                  value="usage"
                  className="cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium text-gray-600 transition-all hover:text-gray-900 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
                >
                  {t('product.usage')}
                </TabsTrigger>
                <TabsTrigger
                  value="storage"
                  className="cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium text-gray-600 transition-all hover:text-gray-900 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
                >
                  {t('product.storage')}
                </TabsTrigger>
              </TabsList>

              <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
                <TabsContent value="description" className="m-0">
                  <div
                    className="prose prose-sm prose-gray max-w-none"
                    dangerouslySetInnerHTML={{ __html: description }}
                  />
                </TabsContent>

                <TabsContent value="usage" className="m-0">
                  <p className="text-sm leading-relaxed text-gray-600">
                    {locale === 'ka'
                      ? 'გამოყენების ინსტრუქცია მოწოდებულია მწარმოებლის მიერ. გთხოვთ, სწორი დოზირებისა და გამოყენებისთვის მიმართოთ ექიმს ან ფარმაცევტს.'
                      : 'Usage instructions will be provided by the manufacturer. Please consult your doctor or pharmacist for proper dosage and usage.'}
                  </p>
                </TabsContent>

                <TabsContent value="storage" className="m-0">
                  <p className="text-sm leading-relaxed text-gray-600">
                    {locale === 'ka'
                      ? 'შეინახეთ ოთახის ტემპერატურაზე (15-25°C), მშრალ ადგილას, მზის პირდაპირი სხივებისგან დაცულ ადგილას. შეინახეთ ბავშვებისთვის მიუწვდომელ ადგილას.'
                      : 'Store at room temperature (15-25°C), in a dry place, away from direct sunlight. Keep out of reach of children.'}
                  </p>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        )}

        {/* Product Disclaimer */}
        <div className="mt-6 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 sm:mt-8 sm:p-5">
          <div className="flex gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100">
              <Info className="h-4 w-4 text-amber-600" />
            </div>
            <div className="space-y-2 text-sm text-amber-800">
              <p className="font-semibold">{t('product.disclaimers.medication.readInstructions')}</p>
              <ul className="list-inside list-disc space-y-1 text-amber-700">
                <li>{t('product.disclaimers.medication.consultDoctor')}</li>
                <li>{t('product.disclaimers.medication.doseWarning')}</li>
                <li>{t('product.disclaimers.medication.keepAway')}</li>
                <li>{t('product.disclaimers.medication.storageConditions')}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Related Products Carousel */}
        {relatedProducts.length > 0 && (
          <div className="mt-10 sm:mt-14">
            <ProductCarousel
              products={relatedProducts}
              title={t('product.relatedProducts')}
            />
          </div>
        )}
      </Container>

      {/* Mobile sticky add to cart bar */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white p-3 shadow-lg sm:hidden">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="text-xs text-gray-500">{locale === 'ka' ? 'ფასი' : 'Price'}</div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-primary">
                {formatPrice(displayPrice, { locale: locale === 'ka' ? 'ka-GE' : 'en-US' })}
              </span>
              {hasDiscount && (
                <span className="text-xs text-gray-400 line-through">
                  {formatPrice(price, { locale: locale === 'ka' ? 'ka-GE' : 'en-US' })}
                </span>
              )}
            </div>
          </div>
          <Button
            size="lg"
            className="h-11 flex-1 cursor-pointer rounded-full font-semibold"
            disabled={isOutOfStock || isAddingToCart}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {t('product.addToCart')}
          </Button>
        </div>
      </div>

      {/* Spacer for mobile sticky bar */}
      <div className="h-20 sm:hidden" />
    </div>
  );
}
