'use client';

import { useTranslations } from 'next-intl';
import { Droplets, Microscope, Sparkles, Stethoscope } from 'lucide-react';

import { Container } from '@/components/ui';
import { cn } from '@/lib/utils';

const services = [
  {
    icon: Droplets,
    titleKey: 'home.services.diabetic.title',
    descKey: 'home.services.diabetic.description',
    bgColor: 'bg-emerald-50',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    borderColor: 'border-emerald-100',
  },
  {
    icon: Microscope,
    titleKey: 'home.services.rare.title',
    descKey: 'home.services.rare.description',
    bgColor: 'bg-violet-50',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    borderColor: 'border-violet-100',
  },
  {
    icon: Sparkles,
    titleKey: 'home.services.aesthetic.title',
    descKey: 'home.services.aesthetic.description',
    bgColor: 'bg-rose-50',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    borderColor: 'border-rose-100',
  },
  {
    icon: Stethoscope,
    titleKey: 'home.services.devices.title',
    descKey: 'home.services.devices.description',
    bgColor: 'bg-sky-50',
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-600',
    borderColor: 'border-sky-100',
  },
];

export function ServicesSection() {
  const t = useTranslations();

  return (
    <section className="py-16 lg:py-24">
      <Container>
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-sm font-medium mb-4">
            {t('home.services.subtitle')}
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">
            {t('home.services.title')}
          </h2>
        </div>

        {/* Services Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className={cn(
                  'group p-6 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1',
                  service.bgColor,
                  service.borderColor,
                  'hover:bg-white'
                )}
              >
                <div
                  className={cn(
                    'w-14 h-14 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform',
                    service.iconBg,
                    service.iconColor
                  )}
                >
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">
                  {t(service.titleKey)}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {t(service.descKey)}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
