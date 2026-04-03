'use client';

import { useTranslations } from 'next-intl';
import { ShoppingBag, ArrowRight } from 'lucide-react';

import { Container, ButtonLink } from '@/components/ui';

export function CtaSection() {
  const t = useTranslations();

  return (
    <section className="py-16 lg:py-20">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#df2b1b] to-[#a81f14] px-6 py-14 sm:px-12 sm:py-16 lg:px-16 text-center">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 rounded-full bg-white/5" />

          <div className="relative">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3">
              {t('home.cta.title')}
            </h2>
            <p className="text-white/80 text-base sm:text-lg mb-8 max-w-lg mx-auto">
              {t('home.cta.subtitle')}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <ButtonLink
                href="/products"
                variant="secondary"
                size="lg"
                leftIcon={<ShoppingBag className="w-5 h-5" />}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="text-[#df2b1b]"
              >
                {t('home.cta.button')}
              </ButtonLink>
              <ButtonLink
                href="/contact"
                size="lg"
                className="bg-white/15 backdrop-blur-sm text-white border-white/20 hover:bg-white/25 hover:border-white/30"
              >
                {t('nav.contact')}
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
