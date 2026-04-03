'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, ChevronRight, ArrowRight } from 'lucide-react';

import { Container, Button } from '@/components/ui';
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
      iconBg: 'bg-[#df2b1b]',
    },
    {
      icon: Phone,
      titleKa: 'ტელეფონი',
      titleEn: 'Phone',
      valueKa: '+995 32 200 00 00',
      valueEn: '+995 32 200 00 00',
      href: 'tel:+995322000000',
      iconBg: 'bg-emerald-600',
    },
    {
      icon: Mail,
      titleKa: 'ელ-ფოსტა',
      titleEn: 'Email',
      valueKa: 'info@medpharma.ge',
      valueEn: 'info@medpharma.ge',
      href: 'mailto:info@medpharma.ge',
      iconBg: 'bg-amber-500',
    },
    {
      icon: Clock,
      titleKa: 'სამუშაო საათები',
      titleEn: 'Working Hours',
      valueKa: 'ორშ-პარ: 09:00-20:00',
      valueEn: 'Mon-Fri: 09:00-20:00',
      subValueKa: 'შაბ: 10:00-18:00',
      subValueEn: 'Sat: 10:00-18:00',
      iconBg: 'bg-slate-700',
    },
  ];

  const socialLinks = [
    {
      name: 'Facebook',
      href: 'https://facebook.com/medpharmaplus',
      color: 'hover:bg-[#1877F2]',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
        </svg>
      ),
    },
    {
      name: 'Instagram',
      href: 'https://instagram.com/medpharmaplus',
      color: 'hover:bg-[#E4405F]',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 011.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772 4.915 4.915 0 01-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 011.153-1.772A4.897 4.897 0 015.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 100 10 5 5 0 000-10zm0 8.333a3.333 3.333 0 110-6.666 3.333 3.333 0 010 6.666zm5.338-8.667a1.2 1.2 0 100-2.4 1.2 1.2 0 000 2.4z" />
        </svg>
      ),
    },
    {
      name: 'YouTube',
      href: 'https://youtube.com/medpharmaplus',
      color: 'hover:bg-[#FF0000]',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-16 lg:py-24">
      <Container>
        {/* Section Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#df2b1b]/10 text-[#df2b1b] rounded-full text-sm font-semibold mb-5">
            <Phone className="w-4 h-4" />
            {locale === 'ka' ? 'დაგვიკავშირდით' : 'Get in Touch'}
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-3">
            {locale === 'ka' ? 'კონტაქტი' : 'Contact Us'}
          </h2>
          <p className="text-slate-500 max-w-lg mx-auto">
            {locale === 'ka'
              ? 'გაქვთ შეკითხვები? დაგვიკავშირდით და ჩვენი გუნდი დაგეხმარებათ'
              : 'Have questions? Contact us and our team will help you'}
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Left: Contact Info */}
          <div className="lg:col-span-2 space-y-4">
            {contactInfo.map((item, index) => {
              const Icon = item.icon;
              const content = (
                <div
                  key={index}
                  className="group flex items-start gap-4 p-4 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all duration-300"
                >
                  <div className={cn('w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center', item.iconBg)}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">
                      {locale === 'ka' ? item.titleKa : item.titleEn}
                    </p>
                    <p className="text-slate-900 font-semibold text-sm">
                      {locale === 'ka' ? item.valueKa : item.valueEn}
                    </p>
                    {item.subValueKa && (
                      <p className="text-slate-500 text-xs mt-0.5">
                        {locale === 'ka' ? item.subValueKa : item.subValueEn}
                      </p>
                    )}
                  </div>
                </div>
              );

              if (item.href) {
                return (
                  <a key={index} href={item.href} className="block">
                    {content}
                  </a>
                );
              }
              return <div key={index}>{content}</div>;
            })}

            {/* Social Links */}
            <div className="pt-2">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-3 px-1">
                {locale === 'ka' ? 'გამოგვყევით' : 'Follow Us'}
              </p>
              <div className="flex items-center gap-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:text-white transition-all duration-200',
                      social.color
                    )}
                    aria-label={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                {locale === 'ka' ? 'მოგვწერეთ' : 'Send us a message'}
              </h3>
              <p className="text-sm text-slate-400 mb-6">
                {locale === 'ka' ? 'შეავსეთ ფორმა და მალე დაგიკავშირდებით' : 'Fill the form and we\'ll get back to you shortly'}
              </p>

              {submitted ? (
                <div className="text-center py-10">
                  <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-1">
                    {locale === 'ka' ? 'წარმატებით გაიგზავნა!' : 'Message Sent!'}
                  </h4>
                  <p className="text-slate-500 text-sm mb-6">
                    {locale === 'ka'
                      ? 'მადლობა. მალე დაგიკავშირდებით.'
                      : 'Thank you. We will get back to you soon.'}
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="inline-flex items-center gap-1.5 text-[#df2b1b] font-semibold text-sm hover:underline transition-colors"
                  >
                    {locale === 'ka' ? 'ახალი შეტყობინება' : 'Send another message'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-name" className="block text-sm font-medium text-slate-700 mb-1.5">
                        {locale === 'ka' ? 'სახელი' : 'Name'} <span className="text-[#df2b1b]">*</span>
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-[#FDFBF7] text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:border-[#df2b1b]/40 focus:outline-none focus:ring-2 focus:ring-[#df2b1b]/10 transition-all"
                        placeholder={locale === 'ka' ? 'თქვენი სახელი' : 'Your name'}
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-phone" className="block text-sm font-medium text-slate-700 mb-1.5">
                        {locale === 'ka' ? 'ტელეფონი' : 'Phone'}
                      </label>
                      <input
                        id="contact-phone"
                        type="tel"
                        className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-[#FDFBF7] text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:border-[#df2b1b]/40 focus:outline-none focus:ring-2 focus:ring-[#df2b1b]/10 transition-all"
                        placeholder="+995 5XX XXX XXX"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                      {locale === 'ka' ? 'ელ-ფოსტა' : 'Email'} <span className="text-[#df2b1b]">*</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-[#FDFBF7] text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:border-[#df2b1b]/40 focus:outline-none focus:ring-2 focus:ring-[#df2b1b]/10 transition-all"
                      placeholder={locale === 'ka' ? 'თქვენი ელ-ფოსტა' : 'Your email'}
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-subject" className="block text-sm font-medium text-slate-700 mb-1.5">
                      {locale === 'ka' ? 'თემა' : 'Subject'}
                    </label>
                    <input
                      id="contact-subject"
                      type="text"
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-[#FDFBF7] text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:border-[#df2b1b]/40 focus:outline-none focus:ring-2 focus:ring-[#df2b1b]/10 transition-all"
                      placeholder={locale === 'ka' ? 'შეტყობინების თემა' : 'Message subject'}
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="block text-sm font-medium text-slate-700 mb-1.5">
                      {locale === 'ka' ? 'შეტყობინება' : 'Message'} <span className="text-[#df2b1b]">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      rows={4}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-[#FDFBF7] text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:border-[#df2b1b]/40 focus:outline-none focus:ring-2 focus:ring-[#df2b1b]/10 resize-none transition-all"
                      placeholder={locale === 'ka' ? 'თქვენი შეტყობინება...' : 'Your message...'}
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isSubmitting}
                    leftIcon={!isSubmitting ? <Send className="w-4 h-4" /> : undefined}
                    className="w-full"
                  >
                    {isSubmitting
                      ? (locale === 'ka' ? 'იგზავნება...' : 'Sending...')
                      : (locale === 'ka' ? 'გაგზავნა' : 'Send Message')}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
