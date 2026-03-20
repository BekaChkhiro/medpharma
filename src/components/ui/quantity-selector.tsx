'use client';

import { forwardRef, type HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export interface QuantitySelectorProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export const QuantitySelector = forwardRef<HTMLDivElement, QuantitySelectorProps>(
  (
    {
      className,
      value,
      onChange,
      min = 1,
      max = 99,
      disabled = false,
      size = 'md',
      ...props
    },
    ref
  ) => {
    const handleDecrement = () => {
      if (value > min) {
        onChange(value - 1);
      }
    };

    const handleIncrement = () => {
      if (value < max) {
        onChange(value + 1);
      }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseInt(e.target.value, 10);
      if (!isNaN(newValue) && newValue >= min && newValue <= max) {
        onChange(newValue);
      }
    };

    const buttonClasses = cn(
      'flex items-center justify-center border border-input bg-background transition-colors',
      'hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      size === 'sm' ? 'h-8 w-8 text-sm' : 'h-10 w-10'
    );

    const inputClasses = cn(
      'w-12 border-y border-input bg-background text-center',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      'disabled:cursor-not-allowed disabled:opacity-50',
      '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
      size === 'sm' ? 'h-8 text-sm' : 'h-10'
    );

    return (
      <div
        ref={ref}
        className={cn('inline-flex items-center', className)}
        {...props}
      >
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || value <= min}
          className={cn(buttonClasses, 'rounded-l-[var(--radius-md)]')}
          aria-label="Decrease quantity"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <input
          type="number"
          value={value}
          onChange={handleInputChange}
          min={min}
          max={max}
          disabled={disabled}
          className={inputClasses}
          aria-label="Quantity"
        />
        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || value >= max}
          className={cn(buttonClasses, 'rounded-r-[var(--radius-md)]')}
          aria-label="Increase quantity"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>
    );
  }
);

QuantitySelector.displayName = 'QuantitySelector';
