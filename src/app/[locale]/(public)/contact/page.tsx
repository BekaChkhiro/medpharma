'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';

import { Container, Button, Input, Label } from '@/components/ui';

export default function ContactPage() {
  const locale = useLocale();
  const t = useTranslations('contact');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div className="py-12">
      <Container>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {locale === 'ka' ? 'კონტაქტი' : 'Contact Us'}
          </h1>
          <p className="text-lg text-gray-600">
            {locale === 'ka'
              ? 'დაგვიკავშირდით ნებისმიერ კითხვასთან დაკავშირებით'
              : 'Get in touch with us for any questions'}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {locale === 'ka' ? 'საკონტაქტო ინფორმაცია' : 'Contact Information'}
            </h2>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">
                    {locale === 'ka' ? 'მისამართი' : 'Address'}
                  </p>
                  <p className="text-gray-600">
                    {locale === 'ka' ? 'თბილისი, საქართველო' : 'Tbilisi, Georgia'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">
                    {locale === 'ka' ? 'ტელეფონი' : 'Phone'}
                  </p>
                  <a href="tel:+995322000000" className="text-primary hover:underline">
                    +995 32 200 00 00
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">
                    {locale === 'ka' ? 'ელ-ფოსტა' : 'Email'}
                  </p>
                  <a href="mailto:info@medpharma.ge" className="text-primary hover:underline">
                    info@medpharma.ge
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">
                    {locale === 'ka' ? 'სამუშაო საათები' : 'Working Hours'}
                  </p>
                  <div className="text-gray-600 space-y-1">
                    <p><span className="font-medium">{locale === 'ka' ? 'ოფისი:' : 'Office:'}</span> {locale === 'ka' ? 'ორშ-პარ 09:00-18:00' : 'Mon-Fri 09:00-18:00'}</p>
                    <p><span className="font-medium">{locale === 'ka' ? 'აფთიაქი:' : 'Pharmacy:'}</span> {locale === 'ka' ? 'ორშ-პარ 09:00-20:00' : 'Mon-Fri 09:00-20:00'}</p>
                    <p>{locale === 'ka' ? 'შაბათი: 10:00-18:00' : 'Saturday: 10:00-18:00'}</p>
                    <p>{locale === 'ka' ? 'კვირა: დასვენება' : 'Sunday: Closed'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {locale === 'ka' ? 'მოგვწერეთ' : 'Send us a message'}
            </h2>

            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {locale === 'ka' ? 'გაიგზავნა!' : 'Message Sent!'}
                </h3>
                <p className="text-gray-600">
                  {locale === 'ka'
                    ? 'მადლობა მოგვწერეთ. მალე დაგიკავშირდებით.'
                    : 'Thank you for contacting us. We will get back to you soon.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{locale === 'ka' ? 'სახელი' : 'Name'} *</Label>
                    <Input id="name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{locale === 'ka' ? 'ტელეფონი' : 'Phone'}</Label>
                    <Input id="phone" type="tel" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{locale === 'ka' ? 'ელ-ფოსტა' : 'Email'} *</Label>
                  <Input id="email" type="email" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">{locale === 'ka' ? 'თემა' : 'Subject'}</Label>
                  <Input id="subject" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">{locale === 'ka' ? 'შეტყობინება' : 'Message'} *</Label>
                  <textarea
                    id="message"
                    rows={5}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting
                    ? (locale === 'ka' ? 'იგზავნება...' : 'Sending...')
                    : (locale === 'ka' ? 'გაგზავნა' : 'Send Message')}
                </Button>
              </form>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
