import { type Category } from '@/lib/db';

export interface CategoryWithChildren extends Category {
  children: CategoryWithChildren[];
  _count?: {
    products: number;
  };
}

export interface CategoryFormData {
  slug: string;
  nameKa: string;
  nameEn: string;
  descKa?: string;
  descEn?: string;
  parentId?: string | null;
  image?: string;
  isActive: boolean;
  metaTitleKa?: string;
  metaTitleEn?: string;
  metaDescKa?: string;
  metaDescEn?: string;
}

export interface CategoryReorderItem {
  id: string;
  parentId: string | null;
  sortOrder: number;
}
