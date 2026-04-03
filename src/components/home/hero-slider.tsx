'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ChevronRight, Shield, Truck, Award } from 'lucide-react';

import { ButtonLink } from '@/components/ui';

export function HeroSlider() {
  const t = useTranslations();

  const trustBadges = [
    { icon: Award, label: t('home.trustBadges.isoCertified') },
    { icon: Truck, label: t('home.trustBadges.fastDelivery') },
    { icon: Shield, label: t('home.trustBadges.securePayment') },
  ];

  return (
    <section className="hero-section relative w-full h-[380px] sm:h-[440px] lg:h-[520px] xl:h-[560px] overflow-hidden">
      <Image
        src="/medpharma.jpg"
        alt="MedPharma Plus"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/80 via-neutral-900/55 to-neutral-900/20" />

      <div className="relative z-10 h-full flex items-center">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl lg:max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full text-white/90 text-xs sm:text-sm font-medium mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {t('home.hero.subtitle')}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 leading-tight">
              {t('home.hero.title')}
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-white/75 mb-8 max-w-lg leading-relaxed">
              {t('home.hero.slogan')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 mb-10">
              <ButtonLink
                href="/products"
                variant="primary"
                size="lg"
              >
                {t('home.hero.shopNow')}
              </ButtonLink>
              <ButtonLink
                href="/about"
                variant="secondary"
                size="lg"
                rightIcon={<ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                className="group"
              >
                {t('home.hero.learnMore')}
              </ButtonLink>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-5 sm:gap-6">
              {trustBadges.map((badge, index) => {
                const Icon = badge.icon;
                return (
                  <div key={index} className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-white/80">{badge.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
