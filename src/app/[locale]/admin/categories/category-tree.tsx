'use client';

import { useState } from 'react';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useTranslations } from 'next-intl';

import { type CategoryWithChildren, type CategoryReorderItem } from '@/types/category';

import { CategoryTreeItem } from './category-tree-item';

interface CategoryTreeProps {
  categories: CategoryWithChildren[];
  onEdit: (category: CategoryWithChildren) => void;
  onDelete: (category: CategoryWithChildren) => void;
  onReorder: (items: CategoryReorderItem[]) => Promise<void>;
}

// Helper to flatten the tree into a list with parent/sortOrder info
function flattenTree(categories: CategoryWithChildren[], parentId: string | null = null): CategoryReorderItem[] {
  const result: CategoryReorderItem[] = [];

  categories.forEach((category, index) => {
    result.push({
      id: category.id,
      parentId,
      sortOrder: index,
    });

    if (category.children && category.children.length > 0) {
      result.push(...flattenTree(category.children, category.id));
    }
  });

  return result;
}

// Helper to find a category by ID in the tree
function findCategoryById(
  categories: CategoryWithChildren[],
  id: string
): CategoryWithChildren | null {
  for (const category of categories) {
    if (category.id === id) return category;
    if (category.children && category.children.length > 0) {
      const found = findCategoryById(category.children, id);
      if (found) return found;
    }
  }
  return null;
}

// Helper to get all category IDs from the tree
function getAllCategoryIds(categories: CategoryWithChildren[]): string[] {
  const ids: string[] = [];
  categories.forEach((category) => {
    ids.push(category.id);
    if (category.children && category.children.length > 0) {
      ids.push(...getAllCategoryIds(category.children));
    }
  });
  return ids;
}

// Helper to move a category in the tree
function moveCategory(
  categories: CategoryWithChildren[],
  activeId: string,
  overId: string
): CategoryWithChildren[] {
  // Create a deep copy
  const newCategories = JSON.parse(JSON.stringify(categories)) as CategoryWithChildren[];

  // Find the active and over categories
  const activeCategory = findCategoryById(newCategories, activeId);
  const overCategory = findCategoryById(newCategories, overId);

  if (!activeCategory || !overCategory) return categories;

  // Remove activeCategory from its current parent
  function removeFromParent(cats: CategoryWithChildren[]): boolean {
    for (let i = 0; i < cats.length; i++) {
      if (cats[i].id === activeId) {
        cats.splice(i, 1);
        return true;
      }
      if (cats[i].children && removeFromParent(cats[i].children!)) {
        return true;
      }
    }
    return false;
  }

  removeFromParent(newCategories);

  // Find where to insert the active category
  function insertCategory(cats: CategoryWithChildren[]): boolean {
    for (let i = 0; i < cats.length; i++) {
      if (cats[i].id === overId) {
        // Insert after the over category
        cats.splice(i + 1, 0, activeCategory!);
        return true;
      }
      if (cats[i].children && insertCategory(cats[i].children!)) {
        return true;
      }
    }
    return false;
  }

  if (!insertCategory(newCategories)) {
    // If we couldn't find the over category, add to root
    newCategories.push(activeCategory!);
  }

  return newCategories;
}

export function CategoryTree({
  categories,
  onEdit,
  onDelete,
  onReorder,
}: CategoryTreeProps) {
  const t = useTranslations('admin.categories');
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);

    if (!over || active.id === over.id) return;

    // Move the category in the local state
    const newCategories = moveCategory(categories, active.id as string, over.id as string);

    // Flatten the tree to get the new order
    const reorderItems = flattenTree(newCategories);

    // Send to API
    await onReorder(reorderItems);
  };

  const allIds = getAllCategoryIds(categories);
  const activeCategory = activeId ? findCategoryById(categories, activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={allIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {categories.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-slate-500">
              {t('noCategories')}
            </div>
          ) : (
            categories.map((category) => (
              <CategoryTreeItem
                key={category.id}
                category={category}
                depth={0}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </div>
      </SortableContext>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeCategory ? (
          <div className="rounded-xl border border-slate-200 bg-[#FDFBF7] p-3 shadow-lg">
            <div className="font-medium text-slate-900">
              {activeCategory.nameEn}
            </div>
            <div className="text-xs text-slate-500">
              /{activeCategory.slug}
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
