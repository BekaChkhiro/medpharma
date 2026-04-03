/**
 * Home Page
 * MedPharma Plus - Online Pharmacy
 */

export const dynamic = 'force-dynamic';

import { setRequestLocale } from 'next-intl/server';

import { Container } from '@/components/ui';
import { getSaleProducts, getNewProducts } from '@/services/products';

import { HeroSlider } from '@/components/home/hero-slider';
import { ProductCarousel } from '@/components/home/product-carousel';
import { ProductGrid } from '@/components/home/product-grid';
import { AboutSection } from '@/components/home/about-section';
import { ContactSection } from '@/components/home/contact-section';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Fetch data in parallel
  const [saleProducts, newProducts] = await Promise.all([
    getSaleProducts({ limit: 12 }),
    getNewProducts({ limit: 8, daysAgo: 60 }),
  ]);

  return (
    <>
      {/* Hero Slider - Only Images with Arrows */}
      <HeroSlider />

      {/* Sale Products Carousel */}
      {saleProducts.length > 0 && (
        <section className="py-12 lg:py-16">
          <Container>
            <ProductCarousel
              products={saleProducts}
              titleKey="home.sale.title"
              subtitleKey="home.sale.subtitle"
              viewAllHref="/products?onSale=true"
              variant="sale"
            />
          </Container>
        </section>
      )}

      {/* New Products Grid */}
      {newProducts.length > 0 && (
        <section className="py-12 lg:py-16">
          <Container>
            <ProductGrid
              products={newProducts}
              titleKey="home.new.title"
              subtitleKey="home.new.subtitle"
              viewAllHref="/products?sort=date_desc"
            />
          </Container>
        </section>
      )}

      {/* About Section */}
      <AboutSection />

      {/* Contact Section */}
      <ContactSection />
    </>
  );
}
