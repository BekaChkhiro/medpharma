'use client';

import {
  forwardRef,
  useEffect,
  useCallback,
  type HTMLAttributes,
  type MouseEvent,
} from 'react';

import { createPortal } from 'react-dom';

import { cn } from '@/lib/utils';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  /** Whether the modal is open (alias for isOpen) */
  open?: boolean;
  /** Whether the modal is open */
  isOpen?: boolean;
  onClose: () => void;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  /** Modal size preset */
  size?: ModalSize;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  full: 'max-w-[90vw]',
};

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      className,
      open,
      isOpen,
      onClose,
      closeOnOverlayClick = true,
      closeOnEscape = true,
      size = 'lg',
      children,
      ...props
    },
    ref
  ) => {
    // Support both open and isOpen props
    const isVisible = open ?? isOpen ?? false;

    const handleEscape = useCallback(
      (event: KeyboardEvent) => {
        if (closeOnEscape && event.key === 'Escape') {
          onClose();
        }
      },
      [closeOnEscape, onClose]
    );

    const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
      if (closeOnOverlayClick && event.target === event.currentTarget) {
        onClose();
      }
    };

    useEffect(() => {
      if (isVisible) {
        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';
      }

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
      };
    }, [isVisible, handleEscape]);

    if (!isVisible) return null;

    const modalContent = (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        role="dialog"
        aria-modal="true"
      >
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black/50 animate-fadeIn"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />

        {/* Modal content */}
        <div
          ref={ref}
          className={cn(
            'relative z-50 w-full max-h-[90vh] overflow-auto',
            'rounded-xl bg-[#FDFBF7] p-6 shadow-lg',
            'animate-scaleIn',
            sizeClasses[size],
            className
          )}
          {...props}
        >
          {children}
        </div>
      </div>
    );

    if (typeof window === 'undefined') return null;

    return createPortal(modalContent, document.body);
  }
);

Modal.displayName = 'Modal';

export const ModalHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('mb-4 flex flex-col space-y-1.5', className)}
      {...props}
    />
  );
});

ModalHeader.displayName = 'ModalHeader';

export const ModalTitle = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  return (
    <h2
      ref={ref}
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  );
});

ModalTitle.displayName = 'ModalTitle';

export const ModalDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn('text-sm text-slate-500', className)}
      {...props}
    />
  );
});

ModalDescription.displayName = 'ModalDescription';

export const ModalFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('mt-6 flex justify-end gap-3', className)}
      {...props}
    />
  );
});

ModalFooter.displayName = 'ModalFooter';

export interface ModalCloseButtonProps
  extends HTMLAttributes<HTMLButtonElement> {
  onClose: () => void;
}

export const ModalCloseButton = forwardRef<
  HTMLButtonElement,
  ModalCloseButtonProps
>(({ className, onClose, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClose}
      className={cn(
        'absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100',
        'focus:outline-none focus:ring-2 focus:ring-[#df2b1b]/30 focus:ring-offset-2',
        'disabled:pointer-events-none',
        className
      )}
      aria-label="Close"
      {...props}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  );
});

ModalCloseButton.displayName = 'ModalCloseButton';
