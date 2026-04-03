import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { MapPin, Phone, Clock, Mail } from 'lucide-react';

import { Container } from '@/components/ui';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'branches' });

  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

export default async function BranchesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="py-12">
      <Container>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {locale === 'ka' ? 'აფთიაქი' : 'Pharmacy'}
          </h1>
          <p className="text-lg text-gray-600">
            {locale === 'ka'
              ? 'ჩვენი აფთიაქის მისამართი და სამუშაო საათები'
              : 'Our pharmacy address and working hours'}
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-[#FDFBF7] rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Map placeholder */}
            <div className="h-64 bg-gray-200 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MapPin className="w-12 h-12 mx-auto mb-2" />
                <p>{locale === 'ka' ? 'რუკა' : 'Map'}</p>
              </div>
            </div>

            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {locale === 'ka' ? 'მედფარმა პლუსი - აფთიაქი' : 'MedPharma Plus - Pharmacy'}
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {locale === 'ka' ? 'მისამართი' : 'Address'}
                    </p>
                    <p className="text-gray-600">
                      {locale === 'ka' ? 'თბილისი, საქართველო' : 'Tbilisi, Georgia'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {locale === 'ka' ? 'ტელეფონი' : 'Phone'}
                    </p>
                    <a href="tel:+995322000000" className="text-primary hover:underline">
                      +995 32 200 00 00
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {locale === 'ka' ? 'ელ-ფოსტა' : 'Email'}
                    </p>
                    <a href="mailto:info@medpharma.ge" className="text-primary hover:underline">
                      info@medpharma.ge
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {locale === 'ka' ? 'სამუშაო საათები' : 'Working Hours'}
                    </p>
                    <div className="text-gray-600 space-y-1">
                      <p>{locale === 'ka' ? 'ორშაბათი - პარასკევი: 09:00 - 20:00' : 'Monday - Friday: 09:00 - 20:00'}</p>
                      <p>{locale === 'ka' ? 'შაბათი: 10:00 - 18:00' : 'Saturday: 10:00 - 18:00'}</p>
                      <p>{locale === 'ka' ? 'კვირა: დასვენება' : 'Sunday: Closed'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {locale === 'ka' ? 'მიწოდების სერვისი' : 'Delivery Service'}
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    {locale === 'ka'
                      ? 'შეკვეთიდან 2 საათში სამუშაო საათებში'
                      : 'Within 2 hours during business hours'}
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    {locale === 'ka'
                      ? 'არასამუშაო საათებში შეკვეთილი მიეწოდებათ მომდევნო სამუშაო დღეს'
                      : 'Orders placed outside business hours will be delivered the next business day'}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
