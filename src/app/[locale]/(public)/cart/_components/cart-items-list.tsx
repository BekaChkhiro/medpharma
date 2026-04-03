'use client';

/**
 * Cart Items List Component
 * Displays list of cart items with quantity controls
 */

import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { CartItem } from '@/store/cart-store';

import { CartItemRow } from './cart-item-row';

interface CartItemsListProps {
  items: CartItem[];
  locale: 'ka' | 'en';
  onClearCart: () => void;
}

export function CartItemsList({ items, locale, onClearCart }: CartItemsListProps) {
  const t = useTranslations('cart');
  const tCommon = useTranslations('common');

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b">
        <div className="flex items-center gap-2">
          <span className="font-semibold">
            {items.length} {items.length === 1 ? t('item') : t('items')}
          </span>
        </div>

        {/* Clear cart button with confirmation */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t('clear')}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('clear')}</AlertDialogTitle>
              <AlertDialogDescription>
                {locale === 'ka'
                  ? 'დარწმუნებული ხართ, რომ გსურთ კალათის გასუფთავება? ეს მოქმედება შეუქცევადია.'
                  : 'Are you sure you want to clear your cart? This action cannot be undone.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={onClearCart}
                className="bg-red-600 hover:bg-red-700"
              >
                {tCommon('yes')}, {t('clear')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardHeader>

      <CardContent className="divide-y p-0">
        {items.map((item) => (
          <CartItemRow key={item.productId} item={item} locale={locale} />
        ))}
      </CardContent>
    </Card>
  );
}
