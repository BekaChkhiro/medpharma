/**
 * Next.js Middleware
 * Handles:
 * 1. Internationalization (i18n) routing with next-intl
 * 2. Authentication checks for admin routes with NextAuth
 */

import { type NextRequest, NextResponse } from 'next/server';

import NextAuth from 'next-auth';
import createIntlMiddleware from 'next-intl/middleware';

import { routing } from '@/i18n/routing';
import { authConfig } from '@/lib/auth.config';

// Create the next-intl middleware
const intlMiddleware = createIntlMiddleware(routing);

// Create auth instance with edge-compatible config (no Prisma)
const { auth } = NextAuth(authConfig);

// Paths that require authentication
const protectedPaths = ['/admin'];

// Paths that should skip i18n (API routes, static files, auth)
const skipI18nPaths = ['/api', '/_next', '/favicon.ico', '/images', '/fonts'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip i18n for API routes and static assets
  if (skipI18nPaths.some((path) => pathname.startsWith(path))) {
    // For admin API routes, check authentication
    if (pathname.startsWith('/api/admin')) {
      const session = await auth();
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
    return NextResponse.next();
  }

  // Check if this is an admin route (with or without locale prefix)
  const isAdminRoute =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/ka/admin') ||
    pathname.startsWith('/en/admin');

  // For admin routes, check authentication first
  if (isAdminRoute) {
    const session = await auth();

    // Extract the actual admin path without locale
    const adminPath = pathname.replace(/^\/(ka|en)/, '');

    // Allow access to admin login page without authentication
    if (adminPath === '/admin/login' || adminPath === '/admin/login/') {
      return intlMiddleware(request);
    }

    // Redirect to login if not authenticated
    if (!session) {
      const locale = pathname.startsWith('/en/') ? 'en' : 'ka';
      const loginUrl = new URL(`/${locale}/admin/login`, request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Apply i18n middleware for all other routes
  return intlMiddleware(request);
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    // Match all paths except static files and API routes that don't need i18n
    '/((?!_next|api/auth|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
};

// Use Node.js runtime for middleware (fixes jose compatibility issues)
export const runtime = 'nodejs';
