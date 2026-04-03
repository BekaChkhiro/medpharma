'use client';

import { type ComponentProps } from 'react';

import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

import { type ButtonVariant, type ButtonSize } from './button';

export interface ButtonLinkProps extends ComponentProps<typeof Link> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[#df2b1b] text-white hover:bg-[#c42418] shadow-sm hover:shadow-md',
  secondary:
    'bg-[#FDFBF7] text-slate-800 border border-slate-200 hover:bg-slate-100 hover:border-slate-300',
  outline:
    'bg-[#FDFBF7] text-slate-800 border border-slate-200 hover:bg-slate-100 hover:border-slate-300',
  ghost:
    'bg-[#FDFBF7] text-slate-800 border border-slate-200 hover:bg-slate-100 hover:border-slate-300',
  destructive:
    'bg-red-600 text-white hover:bg-red-700 shadow-sm',
  danger:
    'bg-red-600 text-white hover:bg-red-700 shadow-sm',
  default:
    'bg-[#df2b1b] text-white hover:bg-[#c42418] shadow-sm hover:shadow-md',
  link:
    'text-[#df2b1b] underline-offset-4 hover:underline',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-sm rounded-lg',
  md: 'h-11 px-5 text-sm rounded-xl',
  lg: 'h-12 px-7 text-base rounded-xl',
  icon: 'h-10 w-10 rounded-xl',
};

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#df2b1b]/30 focus-visible:ring-offset-2',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {leftIcon && <span className="shrink-0">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </Link>
  );
}
