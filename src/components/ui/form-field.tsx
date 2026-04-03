'use client';

import { forwardRef, type HTMLAttributes, type ReactNode, useId } from 'react';

import { cn } from '@/lib/utils';

import { Label } from './label';

export interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
}

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  (
    { className, label, htmlFor, required, error, hint, children, ...props },
    ref
  ) => {
    const generatedId = useId();
    const fieldId = htmlFor || generatedId;

    return (
      <div ref={ref} className={cn('space-y-2', className)} {...props}>
        {label && (
          <Label htmlFor={fieldId} required={required} error={!!error}>
            {label}
          </Label>
        )}
        {children}
        {hint && !error && (
          <p className="text-sm text-slate-500">{hint}</p>
        )}
        {error && <FormError>{error}</FormError>}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface FormErrorProps extends HTMLAttributes<HTMLParagraphElement> {}

export const FormError = forwardRef<HTMLParagraphElement, FormErrorProps>(
  ({ className, children, ...props }, ref) => {
    if (!children) return null;

    return (
      <p
        ref={ref}
        className={cn('text-sm text-red-600', className)}
        role="alert"
        {...props}
      >
        {children}
      </p>
    );
  }
);

FormError.displayName = 'FormError';
