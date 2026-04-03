import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Building2, Award, Users, Clock, Shield, Truck } from 'lucide-react';

import { Container } from '@/components/ui';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about' });

  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about' });

  const values = [
    {
      icon: Shield,
      title: locale === 'ka' ? 'ხარისხი' : 'Quality',
      description: locale === 'ka'
        ? 'საერთაშორისო სტანდარტების შესაბამისი პროდუქცია'
        : 'Products meeting international standards',
    },
    {
      icon: Users,
      title: locale === 'ka' ? 'პროფესიონალიზმი' : 'Professionalism',
      description: locale === 'ka'
        ? 'გამოცდილი ფარმაცევტების გუნდი'
        : 'Team of experienced pharmacists',
    },
    {
      icon: Truck,
      title: locale === 'ka' ? 'სწრაფი მიწოდება' : 'Fast Delivery',
      description: locale === 'ka'
        ? 'შეკვეთიდან 2 საათში მიწოდება'
        : 'Delivery within 2 hours of order',
    },
    {
      icon: Award,
      title: locale === 'ka' ? 'სერტიფიცირება' : 'Certification',
      description: locale === 'ka'
        ? 'ხარისხის საერთაშორისო სერტიფიკატები'
        : 'International quality certifications',
    },
  ];

  const exclusiveBrands = [
    'Becton Dickinson',
    'VITAFLO™',
    'Mevalia',
    'Swedish Nutra',
    'Novaproduct',
    'Embecta',
    'Mayali Hane',
  ];

  return (
    <div className="py-12">
      <Container>
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {locale === 'ka' ? 'შპს მედფარმა პლუსი' : 'MedPharma Plus LLC'}
          </h1>
          <p className="text-xl text-primary font-medium mb-6">
            {locale === 'ka'
              ? 'პერსონალიზებული ფარმაცევტული ზრუნვა'
              : 'Personalized Pharmaceutical Care'}
          </p>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {locale === 'ka'
              ? 'ინოვაცია, ხარისხი, ზრუნვა — ნდობის ახალი სტანდარტი მედიცინაში. სანდო პარტნიორი თქვენი ჯანმრთელობისა და სილამაზის სამსახურში.'
              : 'Innovation, Quality, Care — A New Standard of Trust in Medicine. Your trusted partner for health and beauty.'}
          </p>
        </div>

        {/* About Content */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {locale === 'ka' ? 'ჩვენს შესახებ' : 'About Us'}
            </h2>
            <div className="prose prose-gray">
              <p>
                {locale === 'ka'
                  ? 'მედფარმა პლუსი არის ფარმაცევტული კომპანია, რომელიც სპეციალიზირებულია დიაბეტისა და იშვიათი დაავადებების სამკურნალო საშუალებებსა და კვებაზე, ესთეტიკასა და სილამაზეზე, მედიკამენტების ახალ ფორმულებსა და სამკურნალწამლო ფორმებზე.'
                  : 'MedPharma Plus is a pharmaceutical company specializing in diabetes and rare disease treatments and nutrition, aesthetics and beauty, new medication formulas and pharmaceutical forms.'}
              </p>
              <p>
                {locale === 'ka'
                  ? 'ჩვენ ვთავაზობთ ჰიგიენისა და კოსმეტიკის საშუალებებს, ევროპული ხარისხის საკვებ დანამატებსა და სამედიცინო მოწყობილობებს, ქირურგიულ და სახარჯ მასალებს.'
                  : 'We offer hygiene and cosmetic products, European quality supplements and medical devices, surgical and consumable materials.'}
              </p>
              <p>
                {locale === 'ka'
                  ? 'ჩვენი გუნდი ფლობს ხარისხის საერთაშორისო სტანდარტების არაერთ სერტიფიკატს და მუდმივად ნერგავს ახალ სტანდარტებს პაციენტებისა და მომხმარებლების მაქსიმალური კმაყოფილებისთვის.'
                  : 'Our team holds multiple international quality standard certifications and continuously implements new standards for maximum patient and customer satisfaction.'}
              </p>
            </div>
          </div>

          <div className="rounded-2xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              {locale === 'ka' ? 'ექსკლუზიური ბრენდები' : 'Exclusive Brands'}
            </h3>
            <div className="flex flex-wrap gap-3">
              {exclusiveBrands.map((brand) => (
                <span
                  key={brand}
                  className="px-4 py-2 bg-[#FDFBF7] rounded-full text-sm font-medium text-gray-700 border border-gray-200"
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            {locale === 'ka' ? 'ჩვენი ღირებულებები' : 'Our Values'}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-[#FDFBF7] rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-sm text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Specializations */}
        <div className="bg-primary/5 rounded-2xl p-8 md:p-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {locale === 'ka' ? 'ჩვენი სპეციალიზაცია' : 'Our Specializations'}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              locale === 'ka' ? 'დიაბეტისა და იშვიათი დაავადებების მკურნალობა' : 'Diabetes and Rare Disease Treatment',
              locale === 'ka' ? 'დიაბეტური და სპეციალური კვება' : 'Diabetic and Special Nutrition',
              locale === 'ka' ? 'ესთეტიკა და სილამაზე' : 'Aesthetics and Beauty',
              locale === 'ka' ? 'სამედიცინო მოწყობილობები' : 'Medical Devices',
              locale === 'ka' ? 'ევროპული საკვები დანამატები' : 'European Supplements',
              locale === 'ka' ? 'ქირურგიული მასალები' : 'Surgical Materials',
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 bg-[#FDFBF7] rounded-lg p-4">
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
