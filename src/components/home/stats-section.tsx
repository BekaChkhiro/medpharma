'use client';

import { useTranslations } from 'next-intl';
import { Calendar, Globe, Package, Users } from 'lucide-react';

import { Container } from '@/components/ui';

const stats = [
  { icon: Calendar, valueKey: 'home.stats.years', labelKey: 'home.stats.yearsLabel' },
  { icon: Globe, valueKey: 'home.stats.partners', labelKey: 'home.stats.partnersLabel' },
  { icon: Package, valueKey: 'home.stats.products', labelKey: 'home.stats.productsLabel' },
  { icon: Users, valueKey: 'home.stats.clients', labelKey: 'home.stats.clientsLabel' },
];

export function StatsSection() {
  const t = useTranslations();

  return (
    <section className="py-14 lg:py-20 bg-slate-900">
      <Container>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center">
                <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">
                  {t(stat.valueKey)}
                </div>
                <div className="text-sm text-white/60 font-medium">
                  {t(stat.labelKey)}
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
