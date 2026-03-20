'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

import { Search, X, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Input } from '@/components/ui';

interface ProductSearchProps {
  value: string;
  onChange: (value: string) => void;
  loading?: boolean;
  className?: string;
}

export function ProductSearch({
  value,
  onChange,
  loading = false,
  className = '',
}: ProductSearchProps) {
  const t = useTranslations('products');
  const [localValue, setLocalValue] = useState(value);

  // Use ref to store the latest onChange callback
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Sync local value with external value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Stable debounced onChange using useRef
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedOnChange = useCallback((val: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      onChangeRef.current(val);
    }, 400);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    debouncedOnChange(newValue);
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div className={`relative ${className}`}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        ) : (
          <Search className="h-5 w-5 text-gray-400" />
        )}
      </div>
      <Input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={t('searchPlaceholder')}
        className="pl-10 pr-10"
      />
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
