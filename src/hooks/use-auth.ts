'use client';

/**
 * Client-side Authentication Hook
 * Provides session state and auth utilities for React components
 */

import { useCallback } from 'react';

import { useRouter } from 'next/navigation';

import { useSession, signIn, signOut } from 'next-auth/react';

// Use string union type for client-side (edge-compatible)
type AdminRoleType = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER';

// Extended user type with role
interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: AdminRoleType;
}

/**
 * Custom hook for client-side authentication
 */
export function useAuth() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  // Cast user to our extended type
  const user = session?.user as AuthUser | undefined;

  /**
   * Sign in with email and password
   */
  const login = useCallback(
    async (email: string, password: string, callbackUrl = '/admin') => {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      router.push(callbackUrl);
      router.refresh();
    },
    [router]
  );

  /**
   * Sign out and redirect to login
   */
  const logout = useCallback(async () => {
    await signOut({ redirectTo: '/admin/login' });
  }, []);

  /**
   * Check if user has a specific role
   */
  const userRole = user?.role;
  const hasRole = useCallback(
    (allowedRoles: AdminRoleType | AdminRoleType[]): boolean => {
      if (!userRole) return false;
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      return roles.includes(userRole);
    },
    [userRole]
  );

  /**
   * Check if user is super admin
   */
  const isSuperAdmin = useCallback((): boolean => {
    return user?.role === 'SUPER_ADMIN';
  }, [user?.role]);

  /**
   * Check if user is at least admin (SUPER_ADMIN or ADMIN)
   */
  const isAdmin = useCallback((): boolean => {
    return user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';
  }, [user?.role]);

  return {
    user,
    session,
    status,
    isLoading,
    isAuthenticated,
    login,
    logout,
    hasRole,
    isSuperAdmin,
    isAdmin,
    update,
  };
}

/**
 * Hook that requires authentication
 * Redirects to login if not authenticated
 */
export function useRequireAuth() {
  const auth = useAuth();
  const router = useRouter();

  if (!auth.isLoading && !auth.isAuthenticated) {
    router.push('/admin/login');
  }

  return auth;
}
