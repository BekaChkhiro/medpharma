'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { ChevronDown } from 'lucide-react';

import { Container } from '@/components/ui';
import { cn } from '@/lib/utils';

interface FAQItem {
  question: { ka: string; en: string };
  answer: { ka: string; en: string };
}

const faqData: FAQItem[] = [
  {
    question: {
      ka: 'როგორ შევუკვეთო პროდუქცია?',
      en: 'How do I place an order?',
    },
    answer: {
      ka: 'პროდუქციის შეკვეთა შესაძლებელია ჩვენს ვებ-გვერდზე. აირჩიეთ სასურველი პროდუქტი, დაამატეთ კალათაში და გააფორმეთ შეკვეთა. ასევე შეგიძლიათ დაგვიკავშირდეთ ტელეფონით.',
      en: 'You can place an order on our website. Select the desired product, add it to your cart, and complete the checkout. You can also contact us by phone.',
    },
  },
  {
    question: {
      ka: 'რა დროში მოხდება მიწოდება?',
      en: 'What are the delivery times?',
    },
    answer: {
      ka: 'სამუშაო საათებში (ორშაბათი-პარასკევი 09:00-20:00, შაბათი 10:00-18:00) მიწოდება ხდება შეკვეთიდან 2 საათში. არასამუშაო საათებში განთავსებული შეკვეთები მიეწოდება მომდევნო სამუშაო დღეს.',
      en: 'During business hours (Monday-Friday 09:00-20:00, Saturday 10:00-18:00), delivery is within 2 hours of order. Orders placed outside business hours will be delivered the next business day.',
    },
  },
  {
    question: {
      ka: 'რამდენია მიწოდების საფასური?',
      en: 'What is the delivery fee?',
    },
    answer: {
      ka: 'მიწოდების საფასური დამოკიდებულია თქვენს მდებარეობაზე და შეკვეთის თანხაზე. გარკვეული თანხის ზემოთ შეკვეთისას მიწოდება უფასოა.',
      en: 'The delivery fee depends on your location and order amount. Orders above a certain amount qualify for free delivery.',
    },
  },
  {
    question: {
      ka: 'შესაძლებელია პროდუქტის დაბრუნება?',
      en: 'Can I return a product?',
    },
    answer: {
      ka: 'დიახ, პროდუქტის დაბრუნება შესაძლებელია მიღებიდან 14 დღის განმავლობაში, თუ პროდუქტი არ არის გახსნილი და არ არის დაზიანებული. მედიკამენტების დაბრუნება შეზღუდულია კანონმდებლობის შესაბამისად.',
      en: 'Yes, products can be returned within 14 days of receipt if the product is unopened and undamaged. Return of medications is restricted according to legislation.',
    },
  },
  {
    question: {
      ka: 'სჭირდება რეცეპტი მედიკამენტის შესაძენად?',
      en: 'Do I need a prescription to buy medication?',
    },
    answer: {
      ka: 'ზოგიერთი მედიკამენტი მოითხოვს ექიმის რეცეპტს. პროდუქტის გვერდზე მითითებულია საჭიროებს თუ არა რეცეპტს. რეცეპტით გასაცემი მედიკამენტისთვის საჭიროა რეცეპტის წარდგენა.',
      en: 'Some medications require a doctor\'s prescription. The product page indicates whether a prescription is required. For prescription medications, you will need to present the prescription.',
    },
  },
  {
    question: {
      ka: 'როგორ შევამოწმო ჩემი შეკვეთის სტატუსი?',
      en: 'How can I check my order status?',
    },
    answer: {
      ka: 'შეკვეთის სტატუსის შესამოწმებლად გამოიყენეთ შეკვეთის თრექინგის გვერდი. შეიყვანეთ შეკვეთის ნომერი და ელ-ფოსტა რომელიც მიუთითეთ შეკვეთისას.',
      en: 'To check your order status, use the order tracking page. Enter your order number and the email address you provided when placing the order.',
    },
  },
  {
    question: {
      ka: 'რა გადახდის მეთოდები არის ხელმისაწვდომი?',
      en: 'What payment methods are available?',
    },
    answer: {
      ka: 'მიღებულია საბანკო ბარათები (Visa, Mastercard), ნაღდი ანგარიშსწორება მიწოდებისას და ონლაინ გადახდა.',
      en: 'We accept bank cards (Visa, Mastercard), cash on delivery, and online payments.',
    },
  },
  {
    question: {
      ka: 'როგორ დავუკავშირდე მომხმარებელთა მხარდაჭერას?',
      en: 'How can I contact customer support?',
    },
    answer: {
      ka: 'შეგიძლიათ დაგვიკავშირდეთ ტელეფონით: +995 32 200 00 00, ელ-ფოსტით: info@medpharma.ge, ან კონტაქტის ფორმის მეშვეობით ჩვენს ვებ-გვერდზე.',
      en: 'You can contact us by phone: +995 32 200 00 00, email: info@medpharma.ge, or through the contact form on our website.',
    },
  },
];

function FAQAccordion({ item, locale }: { item: FAQItem; locale: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        className="w-full py-5 flex items-center justify-between text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium text-gray-900 pr-4">
          {locale === 'ka' ? item.question.ka : item.question.en}
        </span>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-gray-500 flex-shrink-0 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      {isOpen && (
        <div className="pb-5 text-gray-600">
          {locale === 'ka' ? item.answer.ka : item.answer.en}
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  const locale = useLocale();

  return (
    <div className="py-12">
      <Container>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {locale === 'ka' ? 'ხშირად დასმული კითხვები' : 'Frequently Asked Questions'}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {locale === 'ka'
              ? 'იპოვეთ პასუხები ყველაზე ხშირად დასმულ კითხვებზე'
              : 'Find answers to the most commonly asked questions'}
          </p>
        </div>

        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          {faqData.map((item, index) => (
            <FAQAccordion key={index} item={item} locale={locale} />
          ))}
        </div>

        {/* Contact CTA */}
        <div className="max-w-3xl mx-auto mt-12 text-center rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {locale === 'ka' ? 'ვერ იპოვეთ პასუხი?' : "Didn't find your answer?"}
          </h2>
          <p className="text-gray-600 mb-4">
            {locale === 'ka'
              ? 'დაგვიკავშირდით და ჩვენი გუნდი დაგეხმარებათ'
              : 'Contact us and our team will help you'}
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
      </Container>
    </div>
  );
}
