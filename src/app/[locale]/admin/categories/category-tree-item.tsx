'use client';

import { useState } from 'react';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ChevronRight,
  ChevronDown,
  GripVertical,
  Edit,
  Trash2,
  Package,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { type CategoryWithChildren } from '@/types/category';

interface CategoryTreeItemProps {
  category: CategoryWithChildren;
  depth: number;
  onEdit: (category: CategoryWithChildren) => void;
  onDelete: (category: CategoryWithChildren) => void;
}

export function CategoryTreeItem({
  category,
  depth,
  onEdit,
  onDelete,
}: CategoryTreeItemProps) {
  const t = useTranslations('admin.categories');
  const [isExpanded, setIsExpanded] = useState(true);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const hasChildren = category.children && category.children.length > 0;
  const productCount = category._count?.products || 0;

  return (
    <div ref={setNodeRef} style={style} className={cn(isDragging && 'opacity-50')}>
      {/* Category Row */}
      <div
        className={cn(
          'group flex items-center gap-2 rounded-xl border border-slate-200 bg-[#FDFBF7] p-3 transition-colors hover:bg-slate-50',
          isDragging && 'bg-slate-50'
        )}
        style={{ marginLeft: `${depth * 24}px` }}
      >
        {/* Drag Handle */}
        <button
          type="button"
          className="cursor-grab touch-none text-slate-500 hover:text-slate-900 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {/* Expand/Collapse Button */}
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-500 hover:text-slate-900"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <div className="w-4" />
        )}

        {/* Category Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-900">
              {category.nameEn}
            </span>
            <span className="text-sm text-slate-500">
              / {category.nameKa}
            </span>

            {/* Product Count Badge */}
            {productCount > 0 && (
              <div className="flex items-center gap-1 rounded-full bg-slate-50 px-2 py-0.5 text-xs text-slate-500">
                <Package className="h-3 w-3" />
                {productCount}
              </div>
            )}

            {/* Active Status Badge */}
            {!category.isActive && (
              <span className="rounded-full bg-red-600/10 px-2 py-0.5 text-xs font-medium text-red-600">
                {t('inactive')}
              </span>
            )}
            {category.isActive && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                {t('active')}
              </span>
            )}
          </div>

          {/* Slug */}
          <div className="mt-0.5 text-xs text-slate-500">
            /{category.slug}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(category)}
            title={t('editCategory')}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(category)}
            title={t('deleteCategory')}
            className="text-red-600 hover:bg-red-600/5 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="mt-2 space-y-2">
          {category.children!.map((child) => (
            <CategoryTreeItem
              key={child.id}
              category={child}
              depth={depth + 1}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
