'use client';

import { useTranslations } from 'next-intl';
import { Award, Truck, Users, HeartHandshake } from 'lucide-react';

import { Container } from '@/components/ui';
import { cn } from '@/lib/utils';

const reasons = [
  {
    icon: Award,
    titleKey: 'home.whyUs.quality.title',
    descKey: 'home.whyUs.quality.description',
    accent: 'text-amber-600',
    bg: 'bg-amber-50',
    iconBg: 'bg-amber-100',
  },
  {
    icon: Truck,
    titleKey: 'home.whyUs.delivery.title',
    descKey: 'home.whyUs.delivery.description',
    accent: 'text-emerald-600',
    bg: 'bg-emerald-50',
    iconBg: 'bg-emerald-100',
  },
  {
    icon: Users,
    titleKey: 'home.whyUs.support.title',
    descKey: 'home.whyUs.support.description',
    accent: 'text-sky-600',
    bg: 'bg-sky-50',
    iconBg: 'bg-sky-100',
  },
  {
    icon: HeartHandshake,
    titleKey: 'home.whyUs.experience.title',
    descKey: 'home.whyUs.experience.description',
    accent: 'text-violet-600',
    bg: 'bg-violet-50',
    iconBg: 'bg-violet-100',
  },
];

export function WhyUsSection() {
  const t = useTranslations();

  return (
    <section className="py-16 lg:py-24 bg-slate-50">
      <Container>
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">
            {t('home.whyUs.title')}
          </h2>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <div
                key={index}
                className="group bg-[#FDFBF7] rounded-2xl p-6 border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div
                  className={cn(
                    'w-14 h-14 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform',
                    reason.iconBg,
                    reason.accent
                  )}
                >
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">
                  {t(reason.titleKey)}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {t(reason.descKey)}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
