/**
 * Email Service Layer
 * T3.11: Set up email service with Nodemailer/Resend
 *
 * Features:
 * - Support for SMTP (Nodemailer) and Resend providers
 * - Order confirmation email template
 * - Bilingual support (Georgian + English)
 * - HTML email templates with inline styles
 */

import nodemailer, { type Transporter } from 'nodemailer';
import { Resend } from 'resend';

import { formatPrice } from '@/lib/utils';

import type { OrderWithItems } from './orders';

// =============================================================================
// CONFIGURATION
// =============================================================================

type EmailProvider = 'smtp' | 'resend';

interface EmailConfig {
  provider: EmailProvider;
  smtp?: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
    from: string;
  };
  resend?: {
    apiKey: string;
    from: string;
  };
}

function getEmailConfig(): EmailConfig {
  const provider = (process.env.EMAIL_PROVIDER || 'smtp') as EmailProvider;

  return {
    provider,
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER || '',
      password: process.env.SMTP_PASSWORD || '',
      from: process.env.SMTP_FROM || 'MedPharma Plus <noreply@medpharma.ge>',
    },
    resend: {
      apiKey: process.env.RESEND_API_KEY || '',
      from: process.env.RESEND_FROM || 'MedPharma Plus <noreply@medpharma.ge>',
    },
  };
}

// =============================================================================
// EMAIL PROVIDERS
// =============================================================================

let nodemailerTransporter: Transporter | null = null;
let resendClient: Resend | null = null;

/**
 * Get or create Nodemailer transporter
 */
function getNodemailerTransporter(): Transporter {
  if (!nodemailerTransporter) {
    const config = getEmailConfig();
    nodemailerTransporter = nodemailer.createTransport({
      host: config.smtp?.host,
      port: config.smtp?.port,
      secure: config.smtp?.secure,
      auth: {
        user: config.smtp?.user,
        pass: config.smtp?.password,
      },
    });
  }
  return nodemailerTransporter;
}

/**
 * Get or create Resend client
 */
function getResendClient(): Resend {
  if (!resendClient) {
    const config = getEmailConfig();
    resendClient = new Resend(config.resend?.apiKey);
  }
  return resendClient;
}

// =============================================================================
// TYPES
// =============================================================================

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export type Locale = 'ka' | 'en';

// =============================================================================
// EMAIL SENDING
// =============================================================================

/**
 * Send email using configured provider
 */
export async function sendEmail(
  options: SendEmailOptions
): Promise<SendEmailResult> {
  const config = getEmailConfig();

  try {
    if (config.provider === 'resend') {
      return await sendWithResend(options);
    } else {
      return await sendWithNodemailer(options);
    }
  } catch (error) {
    console.error('Email send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

/**
 * Send email using Nodemailer (SMTP)
 */
async function sendWithNodemailer(
  options: SendEmailOptions
): Promise<SendEmailResult> {
  const config = getEmailConfig();
  const transporter = getNodemailerTransporter();

  const result = await transporter.sendMail({
    from: config.smtp?.from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });

  return {
    success: true,
    messageId: result.messageId,
  };
}

/**
 * Send email using Resend
 */
async function sendWithResend(
  options: SendEmailOptions
): Promise<SendEmailResult> {
  const config = getEmailConfig();
  const resend = getResendClient();

  const result = await resend.emails.send({
    from: config.resend?.from || 'MedPharma Plus <noreply@medpharma.ge>',
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });

  if (result.error) {
    return {
      success: false,
      error: result.error.message,
    };
  }

  return {
    success: true,
    messageId: result.data?.id,
  };
}

// =============================================================================
// EMAIL TRANSLATIONS
// =============================================================================

const translations = {
  ka: {
    orderConfirmation: {
      subject: 'შეკვეთის დადასტურება - {orderNumber}',
      title: 'მადლობა შეკვეთისთვის!',
      greeting: 'გამარჯობა, {name}!',
      orderReceived: 'თქვენი შეკვეთა მიღებულია და მუშავდება.',
      orderNumber: 'შეკვეთის ნომერი',
      orderDate: 'შეკვეთის თარიღი',
      orderDetails: 'შეკვეთის დეტალები',
      product: 'პროდუქტი',
      quantity: 'რაოდენობა',
      price: 'ფასი',
      subtotal: 'შუალედური ჯამი',
      delivery: 'მიწოდება',
      total: 'სულ გადასახდელი',
      deliveryAddress: 'მიწოდების მისამართი',
      paymentMethod: 'გადახდის მეთოდი',
      paymentMethods: {
        TBC_CARD: 'TBC ბარათი',
        BOG_IPAY: 'BOG / iPay',
        CASH_ON_DELIVERY: 'ნაღდი გადახდა',
      },
      trackOrder: 'შეკვეთის თვალყურის დევნება',
      questions: 'კითხვების შემთხვევაში დაგვიკავშირდით:',
      phone: 'ტელეფონი',
      email: 'ელ-ფოსტა',
      thankYou: 'მადლობა, რომ არჩევანი გააკეთეთ',
      teamSignature: 'მედფარმა პლუსის გუნდი',
      footer: '© {year} მედფარმა პლუსი. ყველა უფლება დაცულია.',
    },
  },
  en: {
    orderConfirmation: {
      subject: 'Order Confirmation - {orderNumber}',
      title: 'Thank you for your order!',
      greeting: 'Hello, {name}!',
      orderReceived: 'Your order has been received and is being processed.',
      orderNumber: 'Order Number',
      orderDate: 'Order Date',
      orderDetails: 'Order Details',
      product: 'Product',
      quantity: 'Qty',
      price: 'Price',
      subtotal: 'Subtotal',
      delivery: 'Delivery',
      total: 'Total',
      deliveryAddress: 'Delivery Address',
      paymentMethod: 'Payment Method',
      paymentMethods: {
        TBC_CARD: 'TBC Card',
        BOG_IPAY: 'BOG / iPay',
        CASH_ON_DELIVERY: 'Cash on Delivery',
      },
      trackOrder: 'Track Your Order',
      questions: 'If you have any questions, contact us:',
      phone: 'Phone',
      email: 'Email',
      thankYou: 'Thank you for choosing',
      teamSignature: 'MedPharma Plus Team',
      footer: '© {year} MedPharma Plus. All rights reserved.',
    },
  },
};

function getTranslation(locale: Locale) {
  return translations[locale] || translations.ka;
}

// =============================================================================
// EMAIL TEMPLATES
// =============================================================================

/**
 * Generate order confirmation email HTML
 */
export function generateOrderConfirmationEmail(
  order: OrderWithItems,
  locale: Locale = 'ka'
): { subject: string; html: string; text: string } {
  const t = getTranslation(locale).orderConfirmation;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'MedPharma Plus';
  const year = new Date().getFullYear();

  const subject = t.subject.replace('{orderNumber}', order.orderNumber);

  const orderDate = new Date(order.createdAt).toLocaleDateString(
    locale === 'ka' ? 'ka-GE' : 'en-US',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
  );

  const paymentMethodText =
    t.paymentMethods[order.paymentMethod as keyof typeof t.paymentMethods] ||
    order.paymentMethod;

  // Generate product rows
  const productRows = order.items
    .map((item) => {
      const productName =
        locale === 'ka' ? item.productNameKa : item.productNameEn;
      const itemTotal = Number(item.unitPrice) * item.quantity;
      return `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          <div style="display: flex; align-items: center; gap: 12px;">
            ${
              item.productImage
                ? `<img src="${item.productImage}" alt="${productName}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;" />`
                : ''
            }
            <div>
              <div style="font-weight: 500; color: #111827;">${productName}</div>
              <div style="font-size: 12px; color: #6b7280;">SKU: ${item.productSku}</div>
            </div>
          </div>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #374151;">
          ${item.quantity}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #374151;">
          ${formatPrice(Number(item.unitPrice), { locale: locale === 'ka' ? 'ka-GE' : 'en-US' })}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 500; color: #111827;">
          ${formatPrice(itemTotal, { locale: locale === 'ka' ? 'ka-GE' : 'en-US' })}
        </td>
      </tr>
    `;
    })
    .join('');

  const html = `
<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 32px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                ${siteName}
              </h1>
            </td>
          </tr>

          <!-- Success Icon & Title -->
          <tr>
            <td style="padding: 32px 32px 16px; text-align: center;">
              <div style="width: 64px; height: 64px; margin: 0 auto 16px; background-color: #d1fae5; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
              </div>
              <h2 style="margin: 0 0 8px; color: #111827; font-size: 24px; font-weight: 700;">
                ${t.title}
              </h2>
              <p style="margin: 0; color: #6b7280; font-size: 16px;">
                ${t.greeting.replace('{name}', order.customerName)}
              </p>
              <p style="margin: 8px 0 0; color: #6b7280; font-size: 14px;">
                ${t.orderReceived}
              </p>
            </td>
          </tr>

          <!-- Order Info Box -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                <tr>
                  <td style="padding: 16px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px;">
                          <div style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">${t.orderNumber}</div>
                          <div style="color: #111827; font-size: 18px; font-weight: 700; margin-top: 4px;">${order.orderNumber}</div>
                        </td>
                        <td style="padding: 8px; text-align: right;">
                          <div style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">${t.orderDate}</div>
                          <div style="color: #111827; font-size: 14px; margin-top: 4px;">${orderDate}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Order Details -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <h3 style="margin: 0 0 16px; color: #111827; font-size: 16px; font-weight: 600;">
                ${t.orderDetails}
              </h3>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #f9fafb;">
                    <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">${t.product}</th>
                    <th style="padding: 12px; text-align: center; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">${t.quantity}</th>
                    <th style="padding: 12px; text-align: right; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">${t.price}</th>
                    <th style="padding: 12px; text-align: right; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">${t.total}</th>
                  </tr>
                </thead>
                <tbody>
                  ${productRows}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Order Summary -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">${t.subtotal}</td>
                  <td style="padding: 8px 0; text-align: right; color: #374151;">
                    ${formatPrice(Number(order.subtotal), { locale: locale === 'ka' ? 'ka-GE' : 'en-US' })}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">${t.delivery}</td>
                  <td style="padding: 8px 0; text-align: right; color: #374151;">
                    ${Number(order.deliveryFee) === 0 ? (locale === 'ka' ? 'უფასო' : 'Free') : formatPrice(Number(order.deliveryFee), { locale: locale === 'ka' ? 'ka-GE' : 'en-US' })}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 0 8px; border-top: 2px solid #e5e7eb; color: #111827; font-size: 18px; font-weight: 700;">${t.total}</td>
                  <td style="padding: 16px 0 8px; border-top: 2px solid #e5e7eb; text-align: right; color: #059669; font-size: 18px; font-weight: 700;">
                    ${formatPrice(Number(order.total), { locale: locale === 'ka' ? 'ka-GE' : 'en-US' })}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Delivery & Payment Info -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" style="padding: 16px; background-color: #f9fafb; border-radius: 8px; vertical-align: top;">
                    <div style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">${t.deliveryAddress}</div>
                    <div style="color: #111827; font-size: 14px;">
                      ${order.customerName}<br>
                      ${order.deliveryAddress}<br>
                      ${order.deliveryCity}
                      ${order.deliveryNotes ? `<br><em style="color: #6b7280;">${order.deliveryNotes}</em>` : ''}
                    </div>
                  </td>
                  <td width="16"></td>
                  <td width="50%" style="padding: 16px; background-color: #f9fafb; border-radius: 8px; vertical-align: top;">
                    <div style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">${t.paymentMethod}</div>
                    <div style="color: #111827; font-size: 14px; font-weight: 500;">
                      ${paymentMethodText}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Track Order Button -->
          <tr>
            <td style="padding: 0 32px 32px; text-align: center;">
              <a href="${siteUrl}/${locale}/order/track?orderNumber=${order.orderNumber}"
                 style="display: inline-block; padding: 14px 32px; background-color: #059669; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; border-radius: 8px;">
                ${t.trackOrder}
              </a>
            </td>
          </tr>

          <!-- Contact Info -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 12px; color: #6b7280; font-size: 14px; text-align: center;">
                ${t.questions}
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align: center; padding: 4px;">
                    <span style="color: #6b7280; font-size: 14px;">${t.phone}: </span>
                    <a href="tel:+995322000000" style="color: #059669; text-decoration: none; font-weight: 500;">+995 32 200 00 00</a>
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center; padding: 4px;">
                    <span style="color: #6b7280; font-size: 14px;">${t.email}: </span>
                    <a href="mailto:info@medpharma.ge" style="color: #059669; text-decoration: none; font-weight: 500;">info@medpharma.ge</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                ${t.thankYou} <strong>${siteName}</strong>!
              </p>
              <p style="margin: 0 0 16px; color: #9ca3af; font-size: 12px;">
                ${t.teamSignature}
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                ${t.footer.replace('{year}', year.toString())}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  // Generate plain text version
  const text = `
${t.title}

${t.greeting.replace('{name}', order.customerName)}

${t.orderReceived}

${t.orderNumber}: ${order.orderNumber}
${t.orderDate}: ${orderDate}

${t.orderDetails}:
${order.items
  .map((item) => {
    const productName = locale === 'ka' ? item.productNameKa : item.productNameEn;
    return `- ${productName} x${item.quantity} - ${formatPrice(Number(item.unitPrice) * item.quantity, { locale: locale === 'ka' ? 'ka-GE' : 'en-US' })}`;
  })
  .join('\n')}

${t.subtotal}: ${formatPrice(Number(order.subtotal), { locale: locale === 'ka' ? 'ka-GE' : 'en-US' })}
${t.delivery}: ${Number(order.deliveryFee) === 0 ? (locale === 'ka' ? 'უფასო' : 'Free') : formatPrice(Number(order.deliveryFee), { locale: locale === 'ka' ? 'ka-GE' : 'en-US' })}
${t.total}: ${formatPrice(Number(order.total), { locale: locale === 'ka' ? 'ka-GE' : 'en-US' })}

${t.deliveryAddress}:
${order.customerName}
${order.deliveryAddress}
${order.deliveryCity}
${order.deliveryNotes ? order.deliveryNotes : ''}

${t.paymentMethod}: ${paymentMethodText}

${t.trackOrder}: ${siteUrl}/${locale}/order/track?orderNumber=${order.orderNumber}

${t.questions}
${t.phone}: +995 32 200 00 00
${t.email}: info@medpharma.ge

${t.thankYou} ${siteName}!
${t.teamSignature}

${t.footer.replace('{year}', year.toString())}
`;

  return { subject, html, text };
}

// =============================================================================
// ORDER CONFIRMATION EMAIL
// =============================================================================

/**
 * Send order confirmation email to customer
 */
export async function sendOrderConfirmationEmail(
  order: OrderWithItems,
  locale: Locale = 'ka'
): Promise<SendEmailResult> {
  const { subject, html, text } = generateOrderConfirmationEmail(order, locale);

  return sendEmail({
    to: order.customerEmail,
    subject,
    html,
    text,
  });
}

// =============================================================================
// TEST EMAIL FUNCTIONALITY
// =============================================================================

/**
 * Test email configuration by sending a test email
 */
export async function sendTestEmail(to: string): Promise<SendEmailResult> {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'MedPharma Plus';

  return sendEmail({
    to,
    subject: `${siteName} - ტესტი / Test Email`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="color: #059669;">Email Configuration Test</h1>
        <p>This is a test email from ${siteName}.</p>
        <p>If you received this email, your email configuration is working correctly!</p>
        <hr style="border: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #6b7280;">
          Provider: ${process.env.EMAIL_PROVIDER || 'smtp'}<br>
          Sent at: ${new Date().toISOString()}
        </p>
      </div>
    `,
    text: `Email Configuration Test\n\nThis is a test email from ${siteName}.\nIf you received this email, your email configuration is working correctly!\n\nProvider: ${process.env.EMAIL_PROVIDER || 'smtp'}\nSent at: ${new Date().toISOString()}`,
  });
}

// =============================================================================
// VERIFY EMAIL CONFIGURATION
// =============================================================================

/**
 * Verify email configuration is valid
 */
export async function verifyEmailConfiguration(): Promise<{
  valid: boolean;
  provider: EmailProvider;
  error?: string;
}> {
  const config = getEmailConfig();

  try {
    if (config.provider === 'resend') {
      // Check if Resend API key is set
      if (!config.resend?.apiKey) {
        return {
          valid: false,
          provider: 'resend',
          error: 'RESEND_API_KEY is not configured',
        };
      }
      return { valid: true, provider: 'resend' };
    } else {
      // Check SMTP configuration
      if (!config.smtp?.host || !config.smtp?.user || !config.smtp?.password) {
        return {
          valid: false,
          provider: 'smtp',
          error: 'SMTP configuration is incomplete',
        };
      }

      // Verify SMTP connection
      const transporter = getNodemailerTransporter();
      await transporter.verify();
      return { valid: true, provider: 'smtp' };
    }
  } catch (error) {
    return {
      valid: false,
      provider: config.provider,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
