'use client';

/**
 * Admin Login Page
 * Handles admin authentication with email/password
 */

import { useState, useTransition } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import { Button, Input, Label, Alert, Spinner } from '@/components/ui';

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin';
  const t = useTranslations('admin.login');

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    startTransition(async () => {
      try {
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError(t('invalidCredentials'));
          return;
        }

        // Redirect to callback URL or admin dashboard
        router.push(callbackUrl);
        router.refresh();
      } catch {
        setError('An unexpected error occurred. Please try again.');
      }
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--secondary)] px-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary)] text-white font-bold text-lg">
            MP
          </div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">MedPharma Plus</h1>
          <p className="mt-1 text-[var(--muted-foreground)]">Admin Panel</p>
        </div>

        {/* Login Card */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-8 shadow-lg">
          <h2 className="mb-6 text-xl font-semibold text-[var(--foreground)]">{t('title')}</h2>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              {error}
            </Alert>
          )}

          {/* URL Error (from NextAuth) */}
          {searchParams.get('error') && !error && (
            <Alert variant="destructive" className="mb-4">
              {searchParams.get('error') === 'CredentialsSignin'
                ? t('invalidCredentials')
                : 'Authentication error. Please try again.'}
            </Alert>
          )}

          {/* Login Form */}
          <form action={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={isPending}
                placeholder="admin@medpharma.ge"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                disabled={isPending}
                placeholder="••••••••"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isPending}
              className="w-full"
              size="lg"
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner size="sm" />
                  ...
                </span>
              ) : (
                t('submit')
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
          © {new Date().getFullYear()} MedPharma Plus. All rights reserved.
        </p>
      </div>
    </div>
  );
}
