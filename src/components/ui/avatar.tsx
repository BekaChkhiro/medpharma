'use client';

import { forwardRef, useState, type ImgHTMLAttributes } from 'react';

import { cn , getInitials } from '@/lib/utils';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps extends ImgHTMLAttributes<HTMLImageElement> {
  size?: AvatarSize;
  name?: string;
  fallback?: string;
}

const sizeStyles: Record<AvatarSize, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(
  ({ className, size = 'md', name, fallback, src, alt, ...props }, ref) => {
    const [imageError, setImageError] = useState(false);
    const initials = fallback || (name ? getInitials(name) : '?');

    if (!src || imageError) {
      return (
        <span
          ref={ref}
          className={cn(
            'inline-flex items-center justify-center rounded-full bg-muted font-medium text-muted-foreground',
            sizeStyles[size],
            className
          )}
          aria-label={name || alt || 'Avatar'}
        >
          {initials}
        </span>
      );
    }

    return (
      <span
        ref={ref}
        className={cn(
          'inline-block overflow-hidden rounded-full bg-muted',
          sizeStyles[size],
          className
        )}
      >
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
          {...props}
        />
      </span>
    );
  }
);

Avatar.displayName = 'Avatar';
