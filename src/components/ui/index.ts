/**
 * UI Components - MedPharma Plus Design System
 *
 * Base UI component library with consistent styling,
 * accessibility features, and TypeScript support.
 */

// Buttons
export { Button } from './button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './button';

export { IconButton } from './icon-button';
export type {
  IconButtonProps,
  IconButtonVariant,
  IconButtonSize,
} from './icon-button';

// Form Inputs
export { Input } from './input';
export type { InputProps } from './input';

export { Textarea } from './textarea';
export type { TextareaProps } from './textarea';

export { Select } from './select';
export type { SelectProps, SelectOption } from './select';

export { Checkbox } from './checkbox';
export type { CheckboxProps } from './checkbox';

export { Label } from './label';
export type { LabelProps } from './label';

export { FormField, FormError } from './form-field';
export type { FormFieldProps, FormErrorProps } from './form-field';

export { QuantitySelector } from './quantity-selector';
export type { QuantitySelectorProps } from './quantity-selector';

// Display Components
export { Badge } from './badge';
export type { BadgeProps, BadgeVariant } from './badge';

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './card';
export type { CardProps } from './card';

export { Alert, AlertIcon, AlertTitle, AlertDescription } from './alert';
export type { AlertProps, AlertVariant } from './alert';

export { Avatar } from './avatar';
export type { AvatarProps, AvatarSize } from './avatar';

// Modal / Dialog
export {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  ModalCloseButton,
} from './modal';
export type { ModalProps, ModalCloseButtonProps } from './modal';

// Loading States
export { Spinner } from './spinner';
export type { SpinnerProps, SpinnerSize } from './spinner';

export { Skeleton, SkeletonCard, SkeletonProduct, SkeletonTable } from './skeleton';
export type { SkeletonProps } from './skeleton';

// Toast / Notifications
export { ToastProvider, useToast } from './toast';
export type { Toast, ToastVariant } from './toast';

// Layout
export { Container } from './container';
export type { ContainerProps, ContainerSize } from './container';

export { Separator } from './separator';
export type { SeparatorProps } from './separator';

// Accessibility
export { VisuallyHidden } from './visually-hidden';
export type { VisuallyHiddenProps } from './visually-hidden';

// Tabs
export { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
