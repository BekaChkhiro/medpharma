import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { Container } from '@/components/ui';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'privacy' });

  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const sections = [
    {
      title: locale === 'ka' ? 'შესავალი' : 'Introduction',
      content: locale === 'ka'
        ? 'შპს მედფარმა პლუსი ("კომპანია", "ჩვენ") პატივს სცემს თქვენს კონფიდენციალურობას და იღებს ვალდებულებას დაიცვას თქვენი პერსონალური მონაცემები. ეს კონფიდენციალურობის პოლიტიკა განმარტავს, თუ როგორ ვაგროვებთ, ვიყენებთ და ვიცავთ თქვენს ინფორმაციას.'
        : 'MedPharma Plus LLC ("Company", "we") respects your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, use, and protect your information.',
    },
    {
      title: locale === 'ka' ? 'რა ინფორმაციას ვაგროვებთ' : 'What Information We Collect',
      content: locale === 'ka'
        ? 'ჩვენ ვაგროვებთ შემდეგ ინფორმაციას: პირადი ინფორმაცია (სახელი, გვარი, ელ-ფოსტა, ტელეფონის ნომერი, მიწოდების მისამართი); შეკვეთის ინფორმაცია; გადახდის ინფორმაცია; ვებ-გვერდის გამოყენების მონაცემები.'
        : 'We collect the following information: Personal information (name, email, phone number, delivery address); Order information; Payment information; Website usage data.',
    },
    {
      title: locale === 'ka' ? 'როგორ ვიყენებთ ინფორმაციას' : 'How We Use Information',
      content: locale === 'ka'
        ? 'თქვენი ინფორმაცია გამოიყენება: შეკვეთების დამუშავებისა და მიწოდებისთვის; მომხმარებელთა მომსახურებისთვის; პროდუქციისა და სერვისების გაუმჯობესებისთვის; მარკეტინგული კომუნიკაციისთვის (თქვენი თანხმობით); სამართლებრივი ვალდებულებების შესასრულებლად.'
        : 'Your information is used for: Processing and delivering orders; Customer service; Improving products and services; Marketing communications (with your consent); Fulfilling legal obligations.',
    },
    {
      title: locale === 'ka' ? 'ინფორმაციის გაზიარება' : 'Information Sharing',
      content: locale === 'ka'
        ? 'ჩვენ არ ვყიდით თქვენს პერსონალურ მონაცემებს მესამე პირებზე. ინფორმაციის გაზიარება ხდება მხოლოდ: მიწოდების სერვისის პროვაიდერებთან; გადახდის პროცესორებთან; კანონმდებლობით გათვალისწინებულ შემთხვევებში.'
        : 'We do not sell your personal data to third parties. Information is shared only with: Delivery service providers; Payment processors; When required by law.',
    },
    {
      title: locale === 'ka' ? 'მონაცემთა უსაფრთხოება' : 'Data Security',
      content: locale === 'ka'
        ? 'ჩვენ ვიყენებთ ტექნიკურ და ორგანიზაციულ ზომებს თქვენი პერსონალური მონაცემების დასაცავად, მათ შორის: SSL დაშიფვრა; უსაფრთხო სერვერები; წვდომის კონტროლი.'
        : 'We use technical and organizational measures to protect your personal data, including: SSL encryption; Secure servers; Access controls.',
    },
    {
      title: locale === 'ka' ? 'თქვენი უფლებები' : 'Your Rights',
      content: locale === 'ka'
        ? 'თქვენ გაქვთ უფლება: მოითხოვოთ წვდომა თქვენს პერსონალურ მონაცემებზე; მოითხოვოთ მონაცემების გასწორება ან წაშლა; გააუქმოთ თანხმობა მარკეტინგულ კომუნიკაციაზე; შეიტანოთ საჩივარი პერსონალურ მონაცემთა დაცვის ინსპექტორთან.'
        : 'You have the right to: Request access to your personal data; Request correction or deletion of data; Withdraw consent for marketing communications; File a complaint with the Personal Data Protection Inspector.',
    },
    {
      title: locale === 'ka' ? 'ქუქი-ფაილები' : 'Cookies',
      content: locale === 'ka'
        ? 'ჩვენი ვებ-გვერდი იყენებს ქუქი-ფაილებს ვებ-გვერდის ფუნქციონირებისა და გამოცდილების გაუმჯობესებისთვის. თქვენ შეგიძლიათ მართოთ ქუქი-ფაილების პარამეტრები თქვენს ბრაუზერში.'
        : 'Our website uses cookies to improve website functionality and experience. You can manage cookie settings in your browser.',
    },
    {
      title: locale === 'ka' ? 'პოლიტიკის ცვლილებები' : 'Policy Changes',
      content: locale === 'ka'
        ? 'ჩვენ შეიძლება განვაახლოთ ეს კონფიდენციალურობის პოლიტიკა დროდადრო. ცვლილებების შესახებ შეტყობინება განთავსდება ჩვენს ვებ-გვერდზე.'
        : 'We may update this privacy policy from time to time. Notice of changes will be posted on our website.',
    },
    {
      title: locale === 'ka' ? 'კონტაქტი' : 'Contact',
      content: locale === 'ka'
        ? 'კონფიდენციალურობასთან დაკავშირებული კითხვებისთვის დაგვიკავშირდით: ელ-ფოსტა: info@medpharma.ge, ტელეფონი: +995 32 200 00 00'
        : 'For privacy-related questions, contact us: Email: info@medpharma.ge, Phone: +995 32 200 00 00',
    },
  ];

  return (
    <div className="py-12">
      <Container>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {locale === 'ka' ? 'კონფიდენციალურობის პოლიტიკა' : 'Privacy Policy'}
            </h1>
            <p className="text-gray-600">
              {locale === 'ka'
                ? 'ბოლო განახლება: 2024 წლის იანვარი'
                : 'Last updated: January 2024'}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-12">
            <div className="prose prose-gray max-w-none">
              {sections.map((section, index) => (
                <div key={index} className="mb-8 last:mb-0">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    {index + 1}. {section.title}
                  </h2>
                  <p className="text-gray-600 leading-relaxed">{section.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
