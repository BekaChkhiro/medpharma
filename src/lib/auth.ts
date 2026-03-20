/**
 * NextAuth.js Configuration
 * Admin-only authentication with credentials provider (email/password)
 * Uses bcrypt for password hashing and session-based auth
 */

import { compare } from 'bcryptjs';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import { authConfig } from '@/lib/auth.config';
import { db, AdminRole } from '@/lib/db';

// Define the shape of credentials for login
interface LoginCredentials {
  email: string;
  password: string;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,

  // Authentication providers (requires Node.js runtime)
  providers: [
    Credentials({
      id: 'credentials',
      name: 'Admin Login',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'admin@example.com',
        },
        password: {
          label: 'Password',
          type: 'password',
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        const { email, password } = credentials as LoginCredentials;

        // Find admin user by email
        const user = await db.adminUser.findUnique({
          where: { email: email.toLowerCase().trim() },
        });

        // Check if user exists
        if (!user) {
          throw new Error('Invalid email or password');
        }

        // Check if user is active
        if (!user.isActive) {
          throw new Error('Account is deactivated. Contact administrator.');
        }

        // Verify password
        const isValidPassword = await compare(password, user.password);
        if (!isValidPassword) {
          throw new Error('Invalid email or password');
        }

        // Return user object for session
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],

  // Events for logging/analytics
  events: {
    async signIn({ user }) {
      console.log(`[Auth] Admin signed in: ${user.email}`);
    },
    async signOut(message) {
      // Token may or may not be available depending on session strategy
      if ('token' in message) {
        console.log(`[Auth] Admin signed out: ${message.token?.email}`);
      } else {
        console.log('[Auth] Admin signed out');
      }
    },
  },

  // Debug mode in development
  debug: process.env.NODE_ENV === 'development',
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get the current session on the server
 */
export async function getSession() {
  return await auth();
}

/**
 * Check if the current user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session?.user;
}

/**
 * Get the current admin user from session
 */
export async function getCurrentUser(): Promise<{
  id: string;
  email: string;
  name: string;
  role: AdminRole;
} | null> {
  const session = await getSession();
  if (!session?.user) return null;

  return {
    id: session.user.id,
    email: session.user.email!,
    name: session.user.name!,
    role: session.user.role as AdminRole,
  };
}

/**
 * Check if the current user has a specific role
 */
export async function hasRole(
  allowedRoles: AdminRole | AdminRole[]
): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return roles.includes(user.role);
}

/**
 * Check if the current user is a super admin
 */
export async function isSuperAdmin(): Promise<boolean> {
  return hasRole(AdminRole.SUPER_ADMIN);
}

/**
 * Check if the current user is at least an admin (SUPER_ADMIN or ADMIN)
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]);
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth(): Promise<{
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

/**
 * Require specific role - throws if not authorized
 */
export async function requireRole(
  allowedRoles: AdminRole | AdminRole[]
): Promise<{
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}> {
  const user = await requireAuth();
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  if (!roles.includes(user.role)) {
    throw new Error('Forbidden: Insufficient permissions');
  }

  return user;
}
