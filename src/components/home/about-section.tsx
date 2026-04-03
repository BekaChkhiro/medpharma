'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Award, Users, Truck, Shield, ChevronRight } from 'lucide-react';

import { Container, ButtonLink } from '@/components/ui';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: Award,
    titleKa: 'საერთაშორისო სტანდარტები',
    titleEn: 'International Standards',
    descKa: 'ISO სერტიფიცირებული ხარისხი და ევროპული სტანდარტები',
    descEn: 'ISO certified quality and European standards',
    bgColor: 'bg-amber-50',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  {
    icon: Truck,
    titleKa: 'სწრაფი მიწოდება',
    titleEn: 'Fast Delivery',
    descKa: 'შეკვეთიდან 2 საათში თბილისის მასშტაბით',
    descEn: 'Within 2 hours across Tbilisi',
    bgColor: 'bg-emerald-50',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
  {
    icon: Users,
    titleKa: 'პროფესიონალი გუნდი',
    titleEn: 'Professional Team',
    descKa: 'გამოცდილი ფარმაცევტები თქვენს სამსახურში',
    descEn: 'Experienced pharmacists at your service',
    bgColor: 'bg-sky-50',
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-600',
  },
  {
    icon: Shield,
    titleKa: '30+ წლის გამოცდილება',
    titleEn: '30+ Years Experience',
    descKa: 'ნდობის ახალი სტანდარტი მედიცინაში',
    descEn: 'A new standard of trust in medicine',
    bgColor: 'bg-violet-50',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
  },
];

export function AboutSection() {
  const locale = useLocale() as 'ka' | 'en';
  const t = useTranslations();

  return (
    <section className="py-16 lg:py-24">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div>
            {/* Badge */}
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-sm font-medium mb-5">
              {t('nav.about')}
            </span>

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-3">
              {locale === 'ka' ? 'შპს მედფარმა პლუსი' : 'MedPharma Plus LLC'}
            </h2>

            {/* Subtitle */}
            <p className="text-lg text-slate-500 font-medium mb-5">
              {t('home.hero.subtitle')}
            </p>

            {/* Description */}
            <p className="text-slate-600 leading-relaxed mb-4">
              {locale === 'ka'
                ? 'მედფარმა პლუსი არის ფარმაცევტული კომპანია, რომელიც 30 წელზე მეტია მუშაობს საქართველოში. ჩვენ სპეციალიზირებული ვართ დიაბეტურ კვებაზე, იშვიათი დაავადებების მკურნალობაზე, ესთეტიკურ პროდუქციასა და სამედიცინო მოწყობილობებზე.'
                : 'MedPharma Plus is a pharmaceutical company that has been operating in Georgia for more than 30 years. We specialize in diabetic nutrition, rare disease treatment, aesthetic products, and medical devices.'}
            </p>

            <p className="text-slate-600 leading-relaxed mb-6">
              {locale === 'ka'
                ? 'ჩვენ ვთანამშრომლობთ მსოფლიოს წამყვან ბრენდებთან, როგორიცაა Becton Dickinson, VITAFLO™, Mevalia, Swedish Nutra და სხვები. ჩვენი მიზანია პერსონალიზებული ფარმაცევტული ზრუნვის მიწოდება ყველა პაციენტისთვის.'
                : 'We partner with world-leading brands such as Becton Dickinson, VITAFLO™, Mevalia, Swedish Nutra, and others. Our goal is to provide personalized pharmaceutical care for every patient.'}
            </p>

            {/* CTA */}
            <ButtonLink
              href="/about"
              variant="primary"
              size="lg"
              rightIcon={<ChevronRight className="w-5 h-5" />}
            >
              {t('home.hero.learnMore')}
            </ButtonLink>
          </div>

          {/* Features Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className={cn(
                    'group p-5 rounded-2xl border border-slate-100 hover:shadow-lg transition-all duration-300',
                    feature.bgColor,
                    'hover:bg-white'
                  )}
                >
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform', feature.iconBg, feature.iconColor)}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1.5">
                    {locale === 'ka' ? feature.titleKa : feature.titleEn}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {locale === 'ka' ? feature.descKa : feature.descEn}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Brands */}
        <div className="mt-16 pt-12 border-t border-slate-100">
          <p className="text-center text-sm text-slate-500 mb-6">
            {t('home.brands.subtitle')}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-3 lg:gap-4">
            {['Becton Dickinson', 'VITAFLO™', 'Mevalia', 'Swedish Nutra', 'Embecta', 'Novaproduct'].map((brand) => (
              <div
                key={brand}
                className="px-4 py-2.5 bg-slate-100 rounded-lg text-slate-700 font-medium text-sm hover:bg-slate-200 transition-colors cursor-default"
              >
                {brand}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
