/**
 * Home Page
 * MedPharma Plus - Online Pharmacy
 */

export const dynamic = 'force-dynamic';

import { setRequestLocale } from 'next-intl/server';

import { HeroSlider } from '@/components/home/hero-slider';
import { ServicesSection } from '@/components/home/services-section';
import { StatsSection } from '@/components/home/stats-section';
import { AboutSection } from '@/components/home/about-section';
import { WhyUsSection } from '@/components/home/why-us-section';
import { CtaSection } from '@/components/home/cta-section';
import { ContactSection } from '@/components/home/contact-section';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      {/* Hero - Main Banner */}
      <HeroSlider />

      {/* Services - Specialization Areas */}
      <ServicesSection />

      {/* Stats - Numbers */}
      <StatsSection />

      {/* About - Company Info */}
      <AboutSection />

      {/* Why Us - Advantages */}
      <WhyUsSection />

      {/* CTA - Call to Action */}
      <CtaSection />

      {/* Contact - Form & Info */}
      <ContactSection />
    </>
  );
}
