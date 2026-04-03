import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { RotateCcw, AlertTriangle, CheckCircle, XCircle, Phone } from 'lucide-react';

import { Container } from '@/components/ui';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'returns' });

  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

export default async function ReturnsPage({
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
            {locale === 'ka' ? 'დაბრუნების პოლიტიკა' : 'Return Policy'}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {locale === 'ka'
              ? 'ინფორმაცია პროდუქციის დაბრუნების წესებისა და პირობების შესახებ'
              : 'Information about product return rules and conditions'}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* General Policy */}
          <div className="bg-[#FDFBF7] rounded-2xl border border-gray-100 shadow-sm p-8 mb-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <RotateCcw className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {locale === 'ka' ? 'ზოგადი პირობები' : 'General Conditions'}
                </h2>
                <p className="text-gray-600">
                  {locale === 'ka'
                    ? 'პროდუქციის დაბრუნება შესაძლებელია მიღებიდან 14 დღის განმავლობაში.'
                    : 'Products can be returned within 14 days of receipt.'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">
                {locale === 'ka' ? 'დაბრუნების პირობები:' : 'Return Conditions:'}
              </h3>
              <ul className="space-y-3">
                {[
                  locale === 'ka'
                    ? 'პროდუქტი უნდა იყოს ორიგინალ შეფუთვაში'
                    : 'Product must be in original packaging',
                  locale === 'ka'
                    ? 'პროდუქტი არ უნდა იყოს გახსნილი ან გამოყენებული'
                    : 'Product must not be opened or used',
                  locale === 'ka'
                    ? 'თან უნდა ახლდეს შეკვეთის დამადასტურებელი დოკუმენტი'
                    : 'Must be accompanied by order confirmation document',
                  locale === 'ka'
                    ? 'პროდუქტი არ უნდა იყოს დაზიანებული'
                    : 'Product must not be damaged',
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Medication Returns Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 mb-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-amber-600 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  {locale === 'ka'
                    ? 'მედიკამენტების დაბრუნება'
                    : 'Medication Returns'}
                </h2>
                <p className="text-gray-700 mb-4">
                  {locale === 'ka'
                    ? 'საქართველოს კანონმდებლობის შესაბამისად, მედიკამენტების დაბრუნება შეზღუდულია. მედიკამენტი შეიძლება დაბრუნდეს მხოლოდ შემდეგ შემთხვევებში:'
                    : 'According to Georgian legislation, medication returns are restricted. Medications can only be returned in the following cases:'}
                </p>
                <ul className="space-y-2">
                  {[
                    locale === 'ka'
                      ? 'თუ პროდუქტი დაზიანებულია ან დეფექტურია'
                      : 'If the product is damaged or defective',
                    locale === 'ka'
                      ? 'თუ მოწოდებული პროდუქტი არ შეესაბამება შეკვეთას'
                      : 'If the delivered product does not match the order',
                    locale === 'ka'
                      ? 'თუ ვადა გასულია მიწოდების მომენტში'
                      : 'If the product is expired at the time of delivery',
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-2 text-gray-700">
                      <div className="w-1.5 h-1.5 bg-amber-600 rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Non-Returnable Items */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <XCircle className="w-6 h-6 text-red-600" />
              {locale === 'ka'
                ? 'პროდუქცია რომელიც არ ექვემდებარება დაბრუნებას'
                : 'Non-Returnable Products'}
            </h2>
            <ul className="space-y-2">
              {[
                locale === 'ka' ? 'გახსნილი მედიკამენტები' : 'Opened medications',
                locale === 'ka'
                  ? 'პერსონალური ჰიგიენის საშუალებები (გახსნილი)'
                  : 'Personal hygiene products (opened)',
                locale === 'ka'
                  ? 'სამედიცინო მოწყობილობები (გამოყენების შემდეგ)'
                  : 'Medical devices (after use)',
                locale === 'ka'
                  ? 'საკვები დანამატები (გახსნილი შეფუთვა)'
                  : 'Supplements (opened packaging)',
              ].map((item, index) => (
                <li key={index} className="flex items-center gap-2 text-gray-700">
                  <XCircle className="w-4 h-4 text-red-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Refund Process */}
          <div className="rounded-2xl p-8 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {locale === 'ka' ? 'თანხის დაბრუნების პროცესი' : 'Refund Process'}
            </h2>
            <div className="space-y-4 text-gray-600">
              <p>
                {locale === 'ka'
                  ? 'დაბრუნების მოთხოვნის დამტკიცების შემდეგ, თანხა დაგიბრუნდებათ 5-7 სამუშაო დღის განმავლობაში იმავე გადახდის მეთოდით, რომლითაც განხორციელდა შეკვეთა.'
                  : 'After the return request is approved, the refund will be processed within 5-7 business days using the same payment method used for the order.'}
              </p>
              <p>
                {locale === 'ka'
                  ? 'ნაღდი ანგარიშსწორებით გადახდილი თანხა დაგიბრუნდებათ საბანკო გადარიცხვით.'
                  : 'Cash payments will be refunded via bank transfer.'}
              </p>
            </div>
          </div>

          {/* Contact for Returns */}
          <div className="bg-primary/5 rounded-2xl p-8 text-center">
            <Phone className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {locale === 'ka' ? 'დაბრუნების მოთხოვნა' : 'Request a Return'}
            </h2>
            <p className="text-gray-600 mb-4">
              {locale === 'ka'
                ? 'დაბრუნების მოთხოვნისთვის დაგვიკავშირდით'
                : 'Contact us to request a return'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+995322000000"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                +995 32 200 00 00
              </a>
              <a
                href="mailto:info@medpharma.ge"
                className="inline-flex items-center justify-center px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                info@medpharma.ge
              </a>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
