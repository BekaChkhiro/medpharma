/**
 * NextAuth.js Configuration (Edge-compatible)
 * This file contains configuration that can run on Edge runtime
 * Used by middleware for authentication checks
 */

import type { NextRequest } from 'next/server';

import type { Session, User } from 'next-auth';
import type { JWT } from 'next-auth/jwt';

// Type for the auth callback parameter
interface AuthorizedParams {
  auth: Session | null;
  request: NextRequest;
}

// Type for JWT callback parameter
interface JWTCallbackParams {
  token: JWT;
  user?: User;
}

// Type for session callback parameter
interface SessionCallbackParams {
  session: Session;
  token: JWT;
}

/**
 * Auth configuration without database adapters
 * Safe to use in Edge runtime (middleware)
 */
export const authConfig = {
  // Use JWT-based sessions for edge compatibility
  session: {
    strategy: 'jwt' as const,
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // Update session every hour
  },

  // Configure pages
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },

  // Callbacks that don't need database access
  callbacks: {
    // Add custom fields to JWT token
    async jwt({ token, user }: JWTCallbackParams) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },

    // Add custom fields to session
    async session({ session, token }: SessionCallbackParams) {
      if (token && session.user) {
        session.user.id = token.id as string;
        // Cast to AdminRoleType union type
        session.user.role = token.role as 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER';
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },

    // Control access - used by middleware
    async authorized({ auth, request }: AuthorizedParams) {
      const isAuthenticated = !!auth?.user;
      const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
      const isLoginPage = request.nextUrl.pathname === '/admin/login';
      const isApiAuthRoute = request.nextUrl.pathname.startsWith('/api/auth');

      // Allow API auth routes
      if (isApiAuthRoute) {
        return true;
      }

      // Redirect authenticated users away from login page
      if (isLoginPage && isAuthenticated) {
        return Response.redirect(new URL('/admin', request.nextUrl.origin));
      }

      // Protect admin routes
      if (isAdminRoute && !isLoginPage && !isAuthenticated) {
        return Response.redirect(
          new URL('/admin/login', request.nextUrl.origin)
        );
      }

      return true;
    },
  },

  // Providers will be added in auth.ts (not edge-compatible)
  providers: [],

  // Trust host for production deployments
  trustHost: true,
};
