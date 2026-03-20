import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'destructive'
  | 'error'
  | 'outline';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-red-700 text-white',
  primary: 'bg-red-700 text-white',
  secondary: 'bg-slate-100 text-slate-700',
  success: 'bg-green-500 text-white',
  warning: 'bg-amber-500 text-white',
  destructive: 'bg-red-600 text-white',
  error: 'bg-red-600 text-white',
  outline: 'border border-slate-300 bg-transparent text-slate-700',
};

export function Badge({
  className,
  variant = 'default',
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
