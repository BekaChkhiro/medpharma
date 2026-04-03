'use client';

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

        router.push(callbackUrl);
        router.refresh();
      } catch {
        setError('An unexpected error occurred. Please try again.');
      }
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F0E8] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#df2b1b] text-white font-bold text-xl shadow-lg">
            MP
          </div>
          <h1 className="text-2xl font-bold text-slate-900">MedPharma Plus</h1>
          <p className="mt-1 text-slate-500">Admin Panel</p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-slate-200 bg-[#FDFBF7] p-8 shadow-lg">
          <h2 className="mb-6 text-xl font-bold text-slate-900">{t('title')}</h2>

          {error && (
            <Alert variant="destructive" className="mb-4">
              {error}
            </Alert>
          )}

          {searchParams.get('error') && !error && (
            <Alert variant="destructive" className="mb-4">
              {searchParams.get('error') === 'CredentialsSignin'
                ? t('invalidCredentials')
                : 'Authentication error. Please try again.'}
            </Alert>
          )}

          <form action={handleSubmit} className="space-y-5">
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

            <Button
              type="submit"
              variant="primary"
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

        <p className="mt-6 text-center text-sm text-slate-400">
          © {new Date().getFullYear()} MedPharma Plus. All rights reserved.
        </p>
      </div>
    </div>
  );
}
