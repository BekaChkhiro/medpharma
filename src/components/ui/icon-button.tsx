'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

import { Spinner } from './spinner';

export type IconButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  isLoading?: boolean;
  'aria-label': string;
}

const variantStyles: Record<IconButtonVariant, string> = {
  primary:
    'bg-red-700 text-white hover:bg-red-800 shadow-sm',
  secondary:
    'bg-slate-100 text-slate-700 hover:bg-slate-200',
  ghost: 'text-slate-600 hover:bg-slate-100',
  destructive:
    'bg-red-600 text-white hover:bg-red-700 shadow-sm',
};

const sizeStyles: Record<IconButtonSize, string> = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      variant = 'ghost',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-[var(--radius-md)] transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {isLoading ? <Spinner size="sm" className="text-current" /> : children}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
