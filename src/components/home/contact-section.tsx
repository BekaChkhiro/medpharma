'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, ChevronRight } from 'lucide-react';

import { Container } from '@/components/ui';
import { cn } from '@/lib/utils';

export function ContactSection() {
  const locale = useLocale();
  const t = useTranslations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setSubmitted(true);
  };

  const contactInfo = [
    {
      icon: MapPin,
      titleKa: 'მისამართი',
      titleEn: 'Address',
      valueKa: 'თბილისი, საქართველო',
      valueEn: 'Tbilisi, Georgia',
      bgColor: 'bg-red-50',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
    },
    {
      icon: Phone,
      titleKa: 'ტელეფონი',
      titleEn: 'Phone',
      valueKa: '+995 32 200 00 00',
      valueEn: '+995 32 200 00 00',
      href: 'tel:+995322000000',
      bgColor: 'bg-emerald-50',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
    {
      icon: Mail,
      titleKa: 'ელ-ფოსტა',
      titleEn: 'Email',
      valueKa: 'info@medpharma.ge',
      valueEn: 'info@medpharma.ge',
      href: 'mailto:info@medpharma.ge',
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      icon: Clock,
      titleKa: 'სამუშაო საათები',
      titleEn: 'Working Hours',
      valueKa: 'ორშ-პარ: 09:00-20:00',
      valueEn: 'Mon-Fri: 09:00-20:00',
      subValueKa: 'შაბ: 10:00-18:00',
      subValueEn: 'Sat: 10:00-18:00',
      bgColor: 'bg-amber-50',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
  ];

  const socialLinks = [
    {
      name: 'Facebook',
      href: 'https://facebook.com/medpharmaplus',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
        </svg>
      ),
    },
    {
      name: 'Instagram',
      href: 'https://instagram.com/medpharmaplus',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 011.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772 4.915 4.915 0 01-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 011.153-1.772A4.897 4.897 0 015.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 100 10 5 5 0 000-10zm0 8.333a3.333 3.333 0 110-6.666 3.333 3.333 0 010 6.666zm5.338-8.667a1.2 1.2 0 100-2.4 1.2 1.2 0 000 2.4z" />
        </svg>
      ),
    },
    {
      name: 'YouTube',
      href: 'https://youtube.com/medpharmaplus',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-slate-50">
      <Container>
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-medium mb-4">
            <Phone className="w-4 h-4" />
            {locale === 'ka' ? 'დაგვიკავშირდით' : 'Get in Touch'}
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-3">
            {locale === 'ka' ? 'კონტაქტი' : 'Contact Us'}
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            {locale === 'ka'
              ? 'გაქვთ შეკითხვები? დაგვიკავშირდით და ჩვენი გუნდი დაგეხმარებათ'
              : 'Have questions? Contact us and our team will help you'}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Contact Info */}
          <div className="space-y-6">
            {/* Contact Cards Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {contactInfo.map((item, index) => {
                const Icon = item.icon;
                const CardContent = (
                  <div
                    className={cn(
                      'group p-5 rounded-2xl border border-slate-100 hover:shadow-lg transition-all duration-300',
                      item.bgColor,
                      'hover:bg-white'
                    )}
                  >
                    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform', item.iconBg, item.iconColor)}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <p className="text-slate-500 text-sm mb-1">
                      {locale === 'ka' ? item.titleKa : item.titleEn}
                    </p>
                    <p className="text-slate-900 font-semibold">
                      {locale === 'ka' ? item.valueKa : item.valueEn}
                    </p>
                    {item.subValueKa && (
                      <p className="text-slate-600 text-sm mt-0.5">
                        {locale === 'ka' ? item.subValueKa : item.subValueEn}
                      </p>
                    )}
                  </div>
                );

                if (item.href) {
                  return (
                    <a key={index} href={item.href} className="block">
                      {CardContent}
                    </a>
                  );
                }
                return <div key={index}>{CardContent}</div>;
              })}
            </div>

            {/* Social Links */}
            <div className="p-5 rounded-2xl bg-white border border-slate-100">
              <p className="text-slate-900 font-semibold mb-4">
                {locale === 'ka' ? 'გამოგვყევით' : 'Follow Us'}
              </p>
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-red-600 hover:text-white transition-all duration-200"
                    aria-label={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-slate-100">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6">
              {locale === 'ka' ? 'მოგვწერეთ' : 'Send us a message'}
            </h3>

            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <h4 className="text-xl font-semibold text-slate-900 mb-2">
                  {locale === 'ka' ? 'წარმატებით გაიგზავნა!' : 'Message Sent!'}
                </h4>
                <p className="text-slate-600 mb-6">
                  {locale === 'ka'
                    ? 'მადლობა. მალე დაგიკავშირდებით.'
                    : 'Thank you. We will get back to you soon.'}
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="inline-flex items-center gap-2 text-red-600 font-semibold hover:text-red-700 transition-colors"
                >
                  {locale === 'ka' ? 'ახალი შეტყობინება' : 'Send another message'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className="block text-sm font-medium text-slate-700 mb-2">
                      {locale === 'ka' ? 'სახელი' : 'Name'} *
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                      placeholder={locale === 'ka' ? 'თქვენი სახელი' : 'Your name'}
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-phone" className="block text-sm font-medium text-slate-700 mb-2">
                      {locale === 'ka' ? 'ტელეფონი' : 'Phone'}
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                      placeholder="+995 5XX XXX XXX"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-email" className="block text-sm font-medium text-slate-700 mb-2">
                    {locale === 'ka' ? 'ელ-ფოსტა' : 'Email'} *
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                    placeholder={locale === 'ka' ? 'თქვენი ელ-ფოსტა' : 'Your email'}
                  />
                </div>

                <div>
                  <label htmlFor="contact-subject" className="block text-sm font-medium text-slate-700 mb-2">
                    {locale === 'ka' ? 'თემა' : 'Subject'}
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                    placeholder={locale === 'ka' ? 'შეტყობინების თემა' : 'Message subject'}
                  />
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-sm font-medium text-slate-700 mb-2">
                    {locale === 'ka' ? 'შეტყობინება' : 'Message'} *
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-none transition-all"
                    placeholder={locale === 'ka' ? 'თქვენი შეტყობინება...' : 'Your message...'}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group w-full h-14 rounded-xl font-semibold text-base bg-red-600 hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="text-white">{locale === 'ka' ? 'იგზავნება...' : 'Sending...'}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 text-white" />
                      <span className="text-white">{locale === 'ka' ? 'გაგზავნა' : 'Send Message'}</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
