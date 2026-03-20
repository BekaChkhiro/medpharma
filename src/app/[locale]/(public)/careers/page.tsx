import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Briefcase, Users, Heart, TrendingUp, Mail } from 'lucide-react';

import { Container, Button } from '@/components/ui';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'careers' });

  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

export default async function CareersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const benefits = [
    {
      icon: Users,
      title: locale === 'ka' ? 'პროფესიონალური გუნდი' : 'Professional Team',
      description: locale === 'ka'
        ? 'იმუშავე გამოცდილ პროფესიონალებთან ერთად'
        : 'Work alongside experienced professionals',
    },
    {
      icon: TrendingUp,
      title: locale === 'ka' ? 'კარიერული ზრდა' : 'Career Growth',
      description: locale === 'ka'
        ? 'განვითარებისა და წინსვლის შესაძლებლობა'
        : 'Opportunities for development and advancement',
    },
    {
      icon: Heart,
      title: locale === 'ka' ? 'მზრუნველი გარემო' : 'Caring Environment',
      description: locale === 'ka'
        ? 'კომფორტული და მხარდამჭერი სამუშაო გარემო'
        : 'Comfortable and supportive work environment',
    },
    {
      icon: Briefcase,
      title: locale === 'ka' ? 'კონკურენტული პირობები' : 'Competitive Terms',
      description: locale === 'ka'
        ? 'კონკურენტული ანაზღაურება და ბენეფიტები'
        : 'Competitive compensation and benefits',
    },
  ];

  return (
    <div className="py-12">
      <Container>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {locale === 'ka' ? 'ვაკანსიები' : 'Careers'}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {locale === 'ka'
              ? 'შემოგვიერთდით მედფარმა პლუსის გუნდს და გახდით ფარმაცევტული ინოვაციის ნაწილი'
              : 'Join the MedPharma Plus team and become part of pharmaceutical innovation'}
          </p>
        </div>

        {/* Benefits */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm text-center hover:shadow-md transition-shadow"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <benefit.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
              <p className="text-sm text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>

        {/* Current Openings */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            {locale === 'ka' ? 'აქტიური ვაკანსიები' : 'Current Openings'}
          </h2>

          <div className="bg-gray-50 rounded-2xl p-8 text-center">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {locale === 'ka'
                ? 'ამჟამად აქტიური ვაკანსია არ არის'
                : 'No current openings'}
            </h3>
            <p className="text-gray-600 mb-6">
              {locale === 'ka'
                ? 'თუ გსურთ ჩვენს გუნდში მუშაობა, გამოგვიგზავნეთ CV და მოტივაციის წერილი'
                : 'If you want to work with our team, send us your CV and cover letter'}
            </p>
            <a
              href="mailto:careers@medpharma.ge"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Mail className="w-5 h-5" />
              careers@medpharma.ge
            </a>
          </div>

          {/* Why Work With Us */}
          <div className="mt-12 bg-primary/5 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {locale === 'ka' ? 'რატომ მედფარმა პლუსი?' : 'Why MedPharma Plus?'}
            </h2>
            <div className="space-y-4 text-gray-600">
              <p>
                {locale === 'ka'
                  ? 'მედფარმა პლუსი არის ინოვაციური ფარმაცევტული კომპანია, რომელიც სპეციალიზირებულია პერსონალიზებულ ფარმაცევტულ ზრუნვაზე.'
                  : 'MedPharma Plus is an innovative pharmaceutical company specializing in personalized pharmaceutical care.'}
              </p>
              <p>
                {locale === 'ka'
                  ? 'ჩვენ ვფასებთ თანამშრომლების პროფესიონალურ განვითარებას და ვქმნით გარემოს, სადაც თითოეულ წევრს აქვს წვლილის შეტანისა და ზრდის შესაძლებლობა.'
                  : 'We value employee professional development and create an environment where each member has the opportunity to contribute and grow.'}
              </p>
              <p>
                {locale === 'ka'
                  ? 'ჩვენი მისიაა ჯანმრთელობისა და სილამაზის სფეროში მომხმარებლებისთვის საუკეთესო სერვისისა და პროდუქციის მიწოდება.'
                  : 'Our mission is to provide the best service and products in health and beauty to our customers.'}
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
