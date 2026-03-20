'use client';

import { forwardRef, useId, type InputHTMLAttributes, type ChangeEvent } from 'react';

import { cn } from '@/lib/utils';

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  error?: boolean;
  label?: string;
  description?: string;
  /** onChange receives the new checked state as a boolean */
  onChange?: (checked: boolean) => void;
  /** onChangeEvent receives the full change event if needed */
  onChangeEvent?: (event: ChangeEvent<HTMLInputElement>) => void;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, error, label, description, id, onChange, onChangeEvent, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      onChange?.(event.target.checked);
      onChangeEvent?.(event);
    };

    return (
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          ref={ref}
          id={inputId}
          onChange={handleChange}
          className={cn(
            'h-4 w-4 shrink-0 rounded border border-input bg-background',
            'accent-primary',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive',
            className
          )}
          {...props}
        />
        {(label || description) && (
          <div className="grid gap-1 leading-none">
            {label && (
              <label
                htmlFor={inputId}
                className={cn(
                  'text-sm font-medium leading-none cursor-pointer',
                  'peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                  error && 'text-destructive'
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
