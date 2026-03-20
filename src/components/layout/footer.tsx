'use client';

import { useTranslations } from 'next-intl';

import { Container } from '@/components/ui';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

const companyLinks = [
  { href: '/about', labelKey: 'about' },
  { href: '/branches', labelKey: 'branches' },
  { href: '/careers', labelKey: 'careers' },
  { href: '/contact', labelKey: 'contact' },
] as const;

const supportLinks = [
  { href: '/faq', labelKey: 'faq' },
  { href: '/shipping', labelKey: 'shipping' },
  { href: '/returns', labelKey: 'returns' },
  { href: '/order/tracking', labelKey: 'trackOrder' },
] as const;

const legalLinks = [
  { href: '/privacy', labelKey: 'privacyPolicy' },
  { href: '/terms', labelKey: 'termsOfService' },
] as const;

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
        <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 011.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772 4.915 4.915 0 01-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 011.153-1.772A4.897 4.897 0 015.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 1.802c-2.67 0-2.986.01-4.04.058-.976.045-1.505.207-1.858.344-.466.182-.8.398-1.15.748-.35.35-.566.684-.748 1.15-.137.353-.3.882-.344 1.857-.048 1.055-.058 1.37-.058 4.041 0 2.67.01 2.986.058 4.04.045.976.207 1.505.344 1.858.182.466.399.8.748 1.15.35.35.684.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058 2.67 0 2.987-.01 4.04-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.684.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041 0-2.67-.01-2.986-.058-4.04-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.055-.048-1.37-.058-4.041-.058zm0 3.063a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 8.468a3.333 3.333 0 100-6.666 3.333 3.333 0 000 6.666zm5.338-9.87a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4z" />
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

export function Footer() {
  const t = useTranslations('footer');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300">
      {/* Main Footer */}
      <div className="py-12 lg:py-16">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Brand Section */}
            <div className="col-span-2 md:col-span-4 lg:col-span-1">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-xl font-bold text-white hover:opacity-80 transition-opacity"
              >
                {/* Medpharma Plus Logo - Scale with "M" and Cross */}
                <svg
                  className="w-10 h-10 text-red-500"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Cross/Plus shape background */}
                  <path
                    d="M35 5 H65 V35 H95 V65 H65 V95 H35 V65 H5 V35 H35 Z"
                    fill="currentColor"
                  />
                  {/* Scale balance */}
                  <g stroke="white" strokeWidth="3" fill="none">
                    {/* Center pole */}
                    <line x1="50" y1="25" x2="50" y2="45" />
                    {/* M circle at top */}
                    <circle cx="50" cy="22" r="8" fill="currentColor" stroke="white" strokeWidth="2" />
                    <text x="50" y="26" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="Arial">M</text>
                    {/* Balance beam */}
                    <line x1="25" y1="45" x2="75" y2="45" />
                    {/* Left scale strings */}
                    <line x1="25" y1="45" x2="20" y2="60" />
                    <line x1="25" y1="45" x2="30" y2="60" />
                    {/* Right scale strings */}
                    <line x1="75" y1="45" x2="70" y2="60" />
                    <line x1="75" y1="45" x2="80" y2="60" />
                    {/* Left scale pan (triangle) */}
                    <path d="M15 60 L35 60 L25 75 Z" fill="white" stroke="white" />
                    {/* Right scale pan (triangle) */}
                    <path d="M65 60 L85 60 L75 75 Z" fill="white" stroke="white" />
                  </g>
                </svg>
                <span>მედფარმა პლუსი</span>
              </Link>
              <p className="mt-4 text-sm text-slate-400 max-w-xs">
                {t('experience')}
              </p>

              {/* Social Links */}
              <div className="mt-6">
                <p className="text-sm font-medium text-white mb-3">{t('followUs')}</p>
                <div className="flex items-center gap-3">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        'inline-flex items-center justify-center w-10 h-10 rounded-full',
                        'bg-slate-800 text-slate-400',
                        'hover:bg-red-600 hover:text-white transition-colors'
                      )}
                      aria-label={social.name}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {t('company')}
              </h3>
              <ul className="space-y-3">
                {companyLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {t(link.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {t('support')}
              </h3>
              <ul className="space-y-3">
                {supportLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {t(link.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {t('legal')}
              </h3>
              <ul className="space-y-3">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {t(link.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact & Working Hours */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {t('contact')}
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>თბილისი, საქართველო</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <a href="tel:+995322000000" className="hover:text-white transition-colors">
                    +995 32 200 00 00
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <a href="mailto:info@medpharma.ge" className="hover:text-white transition-colors">
                    info@medpharma.ge
                  </a>
                </li>
              </ul>

              {/* Working Hours */}
              <div className="mt-4 pt-4 border-t border-slate-700">
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-2">
                  {t('workingHours.title')}
                </h4>
                <ul className="space-y-1 text-xs text-slate-400">
                  <li>{t('workingHours.pharmacy')}</li>
                  <li>{t('workingHours.sunday')}</li>
                </ul>
              </div>

              {/* Delivery Info */}
              <div className="mt-3 pt-3 border-t border-slate-700">
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-2">
                  {t('delivery.title')}
                </h4>
                <ul className="space-y-1 text-xs text-slate-400">
                  <li>{t('delivery.info')}</li>
                  <li>{t('delivery.offHours')}</li>
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <Container>
          <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              © {currentYear} მედფარმა პლუსი. {t('allRightsReserved')}.
            </p>
            <div className="flex items-center gap-4">
              {/* Payment Methods */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Payment:</span>
                <div className="flex items-center gap-1">
                  {/* Visa */}
                  <div className="w-10 h-6 bg-white rounded flex items-center justify-center">
                    <svg className="w-8 h-4" viewBox="0 0 48 16" fill="none">
                      <path
                        d="M17.7 1.3l-3.5 13.4H10L13.5 1.3h4.2zm14.1 8.6l2.2-6 1.3 6h-3.5zm4.7 4.8h3.9L36.9 1.3h-3.4c-.8 0-1.4.4-1.7 1.1l-6 12.3h4.2l.8-2.3h5.1l.6 2.3zM29 10c0-3.3-4.6-3.5-4.6-5 0-.5.4-.9 1.4-1 .5 0 1.8-.1 3.3.6l.6-2.7c-.8-.3-1.9-.6-3.2-.6-3.4 0-5.8 1.8-5.8 4.4 0 1.9 1.7 3 3 3.6 1.4.7 1.8 1.1 1.8 1.7 0 .9-1.1 1.3-2.1 1.4-1.7 0-2.7-.5-3.5-.9l-.6 2.8c.8.4 2.3.7 3.8.7 3.6 0 6-1.8 6-4.5l-.1.5zM8 1.3L2.6 14.7h4.3L7.5 12h5l.6 2.7h4L13.2 1.3H8z"
                        fill="#1A1F71"
                      />
                    </svg>
                  </div>
                  {/* Mastercard */}
                  <div className="w-10 h-6 bg-white rounded flex items-center justify-center">
                    <svg className="w-6 h-4" viewBox="0 0 24 16" fill="none">
                      <circle cx="8" cy="8" r="8" fill="#EB001B" />
                      <circle cx="16" cy="8" r="8" fill="#F79E1B" />
                      <path
                        d="M12 2.4c1.7 1.4 2.8 3.4 2.8 5.6s-1.1 4.2-2.8 5.6c-1.7-1.4-2.8-3.4-2.8-5.6s1.1-4.2 2.8-5.6z"
                        fill="#FF5F00"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
}
