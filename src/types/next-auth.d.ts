/**
 * NextAuth.js Type Declarations
 * Augments the default types to include custom user properties
 */

import 'next-auth';
import 'next-auth/jwt';

// Use string union for edge compatibility (can't import Prisma in Edge)
type AdminRoleType = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER';

// Augment the next-auth module (must use module augmentation, not replacement)
declare module 'next-auth' {
  /**
   * Augment the built-in User type
   */
  interface User {
    role?: AdminRoleType;
  }

  /**
   * Augment the built-in Session type
   */
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: AdminRoleType;
    };
  }
}

declare module 'next-auth/jwt' {
  /**
   * Augment the built-in JWT type
   */
  interface JWT {
    id?: string;
    role?: AdminRoleType;
  }
}
