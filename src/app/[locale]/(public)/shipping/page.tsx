import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Truck, Clock, MapPin, CreditCard, Package, CheckCircle } from 'lucide-react';

import { Container } from '@/components/ui';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'shipping' });

  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

export default async function ShippingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const deliveryFeatures = [
    {
      icon: Clock,
      title: locale === 'ka' ? 'სწრაფი მიწოდება' : 'Fast Delivery',
      description: locale === 'ka'
        ? 'შეკვეთიდან 2 საათში სამუშაო საათებში'
        : 'Within 2 hours during business hours',
    },
    {
      icon: MapPin,
      title: locale === 'ka' ? 'მოხერხებული ლოკაციები' : 'Convenient Locations',
      description: locale === 'ka'
        ? 'მიწოდება თბილისის მასშტაბით'
        : 'Delivery throughout Tbilisi',
    },
    {
      icon: Package,
      title: locale === 'ka' ? 'უსაფრთხო შეფუთვა' : 'Safe Packaging',
      description: locale === 'ka'
        ? 'პროდუქცია მიიწოდება სათანადო პირობებში'
        : 'Products delivered in proper conditions',
    },
    {
      icon: CreditCard,
      title: locale === 'ka' ? 'მოქნილი გადახდა' : 'Flexible Payment',
      description: locale === 'ka'
        ? 'ონლაინ გადახდა ან ნაღდი ანგარიშსწორება'
        : 'Online payment or cash on delivery',
    },
  ];

  return (
    <div className="py-12">
      <Container>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {locale === 'ka' ? 'მიწოდება' : 'Shipping & Delivery'}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {locale === 'ka'
              ? 'ინფორმაცია მიწოდების პირობებისა და ვადების შესახებ'
              : 'Information about delivery terms and times'}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {deliveryFeatures.map((feature, index) => (
            <div
              key={index}
              className="bg-[#FDFBF7] rounded-xl p-6 border border-gray-100 shadow-sm text-center"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Delivery Info */}
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl p-8 md:p-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              {locale === 'ka' ? 'მიწოდების პირობები' : 'Delivery Terms'}
            </h2>

            <div className="space-y-8">
              {/* Working Hours Delivery */}
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Truck className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {locale === 'ka' ? 'სამუშაო საათებში' : 'During Business Hours'}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    {locale === 'ka'
                      ? 'ორშაბათი - პარასკევი: 09:00 - 20:00'
                      : 'Monday - Friday: 09:00 - 20:00'}
                  </p>
                  <p className="text-gray-600 mb-2">
                    {locale === 'ka' ? 'შაბათი: 10:00 - 18:00' : 'Saturday: 10:00 - 18:00'}
                  </p>
                  <p className="text-primary font-medium">
                    {locale === 'ka'
                      ? '→ მიწოდება შეკვეთიდან 2 საათში'
                      : '→ Delivery within 2 hours of order'}
                  </p>
                </div>
              </div>

              {/* Off Hours */}
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {locale === 'ka' ? 'არასამუშაო საათები' : 'Outside Business Hours'}
                  </h3>
                  <p className="text-gray-600">
                    {locale === 'ka'
                      ? 'არასამუშაო საათებში განთავსებული შეკვეთები მიეწოდება მომდევნო სამუშაო დღეს. კვირა არის დასვენების დღე.'
                      : 'Orders placed outside business hours will be delivered the next business day. Sunday is a day off.'}
                  </p>
                </div>
              </div>

              {/* Delivery Areas */}
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {locale === 'ka' ? 'მიწოდების ზონები' : 'Delivery Zones'}
                  </h3>
                  <p className="text-gray-600">
                    {locale === 'ka'
                      ? 'მიწოდება ხორციელდება თბილისის მასშტაბით. მიწოდების საფასური დამოკიდებულია ზონაზე და შეკვეთის თანხაზე.'
                      : 'Delivery is available throughout Tbilisi. The delivery fee depends on the zone and order amount.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mt-12 bg-[#FDFBF7] rounded-2xl border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {locale === 'ka' ? 'გადახდის მეთოდები' : 'Payment Methods'}
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {
                  title: locale === 'ka' ? 'საბანკო ბარათი' : 'Bank Card',
                  description: 'Visa, Mastercard',
                },
                {
                  title: locale === 'ka' ? 'ნაღდი ანგარიშსწორება' : 'Cash on Delivery',
                  description: locale === 'ka' ? 'მიწოდებისას' : 'Pay when you receive',
                },
              ].map((method, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">{method.title}</p>
                    <p className="text-sm text-gray-600">{method.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
