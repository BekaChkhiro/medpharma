/**
 * Type-safe environment variable access
 *
 * This module provides typed access to environment variables with validation.
 * Missing required variables will throw an error at startup rather than
 * causing cryptic runtime errors later.
 */

// =============================================================================
// SERVER-SIDE ENVIRONMENT VARIABLES (not exposed to client)
// =============================================================================

/**
 * Get a required server-side environment variable
 * Throws an error if the variable is not set
 */
function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * Get an optional server-side environment variable
 * Returns undefined if not set
 */
function getOptionalEnv(key: string): string | undefined {
  return process.env[key] || undefined;
}

/**
 * Get a boolean environment variable
 */
function getBoolEnv(key: string, defaultValue: boolean = false): boolean {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Get a numeric environment variable
 */
function getNumericEnv(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

// =============================================================================
// EXPORTED ENVIRONMENT CONFIGURATION
// =============================================================================

/**
 * Server-side environment variables
 * These are only available on the server and should never be exposed to the client
 */
export const serverEnv = {
  // Database
  get databaseUrl() {
    return getRequiredEnv('DATABASE_URL');
  },

  // NextAuth
  get nextAuthSecret() {
    return getRequiredEnv('NEXTAUTH_SECRET');
  },
  get nextAuthUrl() {
    return getRequiredEnv('NEXTAUTH_URL');
  },

  // S3 Storage
  s3: {
    get endpoint() {
      return getOptionalEnv('S3_ENDPOINT');
    },
    get region() {
      return getOptionalEnv('S3_REGION') || 'us-east-1';
    },
    get bucket() {
      return getOptionalEnv('S3_BUCKET');
    },
    get accessKey() {
      return getOptionalEnv('S3_ACCESS_KEY');
    },
    get secretKey() {
      return getOptionalEnv('S3_SECRET_KEY');
    },
    get publicUrl() {
      return getOptionalEnv('S3_PUBLIC_URL');
    },
    get isConfigured() {
      return !!(
        this.endpoint &&
        this.bucket &&
        this.accessKey &&
        this.secretKey
      );
    },
  },

  // TBC Payment
  tbc: {
    get clientId() {
      return getOptionalEnv('TBC_CLIENT_ID');
    },
    get clientSecret() {
      return getOptionalEnv('TBC_CLIENT_SECRET');
    },
    get apiUrl() {
      return getOptionalEnv('TBC_API_URL') || 'https://api.tbcbank.ge/v1';
    },
    get redirectUrl() {
      return getOptionalEnv('TBC_REDIRECT_URL');
    },
    get successUrl() {
      return getOptionalEnv('TBC_SUCCESS_URL');
    },
    get failUrl() {
      return getOptionalEnv('TBC_FAIL_URL');
    },
    get isConfigured() {
      return !!(this.clientId && this.clientSecret);
    },
  },

  // BOG Payment
  bog: {
    get clientId() {
      return getOptionalEnv('BOG_CLIENT_ID');
    },
    get secretKey() {
      return getOptionalEnv('BOG_SECRET_KEY');
    },
    get apiUrl() {
      return getOptionalEnv('BOG_API_URL') || 'https://ipay.ge/opay/api/v1';
    },
    get redirectUrl() {
      return getOptionalEnv('BOG_REDIRECT_URL');
    },
    get successUrl() {
      return getOptionalEnv('BOG_SUCCESS_URL');
    },
    get failUrl() {
      return getOptionalEnv('BOG_FAIL_URL');
    },
    get isConfigured() {
      return !!(this.clientId && this.secretKey);
    },
  },

  // Email
  email: {
    get provider() {
      return (getOptionalEnv('EMAIL_PROVIDER') || 'smtp') as 'smtp' | 'resend';
    },
    smtp: {
      get host() {
        return getOptionalEnv('SMTP_HOST');
      },
      get port() {
        return getNumericEnv('SMTP_PORT', 587);
      },
      get secure() {
        return getBoolEnv('SMTP_SECURE', false);
      },
      get user() {
        return getOptionalEnv('SMTP_USER');
      },
      get password() {
        return getOptionalEnv('SMTP_PASSWORD');
      },
      get from() {
        return getOptionalEnv('SMTP_FROM');
      },
      get isConfigured() {
        return !!(this.host && this.user && this.password);
      },
    },
    resend: {
      get apiKey() {
        return getOptionalEnv('RESEND_API_KEY');
      },
      get from() {
        return getOptionalEnv('RESEND_FROM');
      },
      get isConfigured() {
        return !!this.apiKey;
      },
    },
    get isConfigured() {
      return (
        (this.provider === 'smtp' && this.smtp.isConfigured) ||
        (this.provider === 'resend' && this.resend.isConfigured)
      );
    },
  },

  // APEX ERP
  apex: {
    get apiUrl() {
      return getOptionalEnv('APEX_API_URL');
    },
    get apiKey() {
      return getOptionalEnv('APEX_API_KEY');
    },
    get webhookSecret() {
      return getOptionalEnv('APEX_WEBHOOK_SECRET');
    },
    get syncInterval() {
      return getNumericEnv('APEX_SYNC_INTERVAL', 30);
    },
    get isConfigured() {
      return !!(this.apiUrl && this.apiKey);
    },
  },

  // Security
  rateLimit: {
    get max() {
      return getNumericEnv('RATE_LIMIT_MAX', 100);
    },
    get enabled() {
      return getBoolEnv('RATE_LIMIT_ENABLED', true);
    },
  },

  // Development
  get debug() {
    return getBoolEnv('DEBUG', false);
  },
  get prismaLogQueries() {
    return getBoolEnv('PRISMA_LOG_QUERIES', false);
  },
  get isDevelopment() {
    return process.env.NODE_ENV === 'development';
  },
  get isProduction() {
    return process.env.NODE_ENV === 'production';
  },
  get isTest() {
    return process.env.NODE_ENV === 'test';
  },
};

// =============================================================================
// CLIENT-SIDE ENVIRONMENT VARIABLES (exposed via NEXT_PUBLIC_*)
// =============================================================================

/**
 * Client-side environment variables
 * These are bundled into the client JavaScript and are publicly visible
 * Only include non-sensitive configuration here
 */
export const clientEnv = {
  get siteUrl() {
    return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  },
  get siteName() {
    return process.env.NEXT_PUBLIC_SITE_NAME || 'MedPharma Plus';
  },
  get defaultLocale() {
    return (process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'ka') as 'ka' | 'en';
  },
  get gaMeasurementId() {
    return process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  },
  get fbPixelId() {
    return process.env.NEXT_PUBLIC_FB_PIXEL_ID;
  },
};

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Validate that all required environment variables are set
 * Call this at application startup to catch configuration errors early
 */
export function validateEnv(): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required variables
  if (!process.env.DATABASE_URL) {
    errors.push('DATABASE_URL is required');
  }
  if (!process.env.NEXTAUTH_SECRET) {
    errors.push('NEXTAUTH_SECRET is required');
  }
  if (!process.env.NEXTAUTH_URL) {
    errors.push('NEXTAUTH_URL is required');
  }

  // Production-specific checks
  if (process.env.NODE_ENV === 'production') {
    if (
      process.env.NEXTAUTH_SECRET === 'dev-secret-change-in-production-generate-new-one'
    ) {
      errors.push(
        'NEXTAUTH_SECRET must be changed from default value in production'
      );
    }
    if (!serverEnv.s3.isConfigured) {
      warnings.push('S3 storage is not configured - image uploads will fail');
    }
    if (!serverEnv.tbc.isConfigured && !serverEnv.bog.isConfigured) {
      warnings.push(
        'No payment provider configured - online payments will fail'
      );
    }
    if (!serverEnv.email.isConfigured) {
      warnings.push(
        'Email is not configured - order notifications will not be sent'
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Log environment validation results
 * Useful for debugging configuration issues
 */
export function logEnvValidation(): void {
  const { valid, errors, warnings } = validateEnv();

  if (!valid) {
    console.error('❌ Environment validation failed:');
    errors.forEach((error) => console.error(`   - ${error}`));
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'Environment validation failed. Check the errors above.'
      );
    }
  }

  if (warnings.length > 0) {
    console.warn('⚠️  Environment warnings:');
    warnings.forEach((warning) => console.warn(`   - ${warning}`));
  }

  if (valid && warnings.length === 0) {
    console.log('✅ Environment validation passed');
  }
}
