'use client';

import {
  useState,
  useRef,
  useCallback,
  type DragEvent,
  type ChangeEvent,
} from 'react';

import {
  Upload,
  X,
  Star,
  GripVertical,
  Loader2,
  AlertCircle,
  ImageIcon,
} from 'lucide-react';

import { cn } from '@/lib/utils';

import { Button } from './button';

export interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

interface ImageUploadProps {
  images: ProductImage[];
  onImagesChange: (images: ProductImage[]) => void;
  onUpload: (files: File[]) => Promise<ProductImage[]>;
  onDelete: (imageId: string) => Promise<void>;
  onSetPrimary: (imageId: string) => Promise<void>;
  onReorder: (imageIds: string[]) => Promise<void>;
  onUpdateAlt?: (imageId: string, alt: string) => Promise<void>;
  maxImages?: number;
  disabled?: boolean;
  className?: string;
  labels?: {
    dropzone?: string;
    dropzoneHint?: string;
    browse?: string;
    uploading?: string;
    setPrimary?: string;
    primary?: string;
    delete?: string;
    altText?: string;
    maxImagesReached?: string;
  };
}

export function ImageUpload({
  images,
  onImagesChange,
  onUpload,
  onDelete,
  onSetPrimary,
  onReorder,
  onUpdateAlt,
  maxImages = 10,
  disabled = false,
  className,
  labels = {},
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [editingAlt, setEditingAlt] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    dropzone = 'Drag & drop images here',
    dropzoneHint = 'or click to browse',
    browse = 'Browse Files',
    uploading = 'Uploading...',
    setPrimary = 'Set as Primary',
    primary = 'Primary',
    delete: deleteLabel = 'Delete',
    altText = 'Alt text',
    maxImagesReached = 'Maximum images reached',
  } = labels;

  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    async (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled || images.length >= maxImages) return;

      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith('image/')
      );

      if (files.length === 0) {
        setError('Please drop image files only');
        return;
      }

      await uploadFiles(files);
    },
    [disabled, images.length, maxImages]
  );

  const handleFileSelect = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      await uploadFiles(files);

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    []
  );

  const uploadFiles = async (files: File[]) => {
    setError(null);
    setIsUploading(true);

    try {
      // Limit files to remaining capacity
      const remainingSlots = maxImages - images.length;
      const filesToUpload = files.slice(0, remainingSlots);

      const newImages = await onUpload(filesToUpload);
      onImagesChange([...images, ...newImages]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (imageId: string) => {
    try {
      await onDelete(imageId);
      onImagesChange(images.filter((img) => img.id !== imageId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete image');
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    try {
      await onSetPrimary(imageId);
      onImagesChange(
        images.map((img) => ({
          ...img,
          isPrimary: img.id === imageId,
        }))
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to set primary image'
      );
    }
  };

  // Drag and drop reordering
  const handleImageDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleImageDragOver = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const [draggedImage] = newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedImage);

    onImagesChange(newImages);
    setDraggedIndex(index);
  };

  const handleImageDragEnd = async () => {
    if (draggedIndex !== null) {
      try {
        await onReorder(images.map((img) => img.id));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to reorder images'
        );
      }
    }
    setDraggedIndex(null);
  };

  const handleAltUpdate = async (imageId: string, alt: string) => {
    if (onUpdateAlt) {
      try {
        await onUpdateAlt(imageId, alt);
        onImagesChange(
          images.map((img) => (img.id === imageId ? { ...img, alt } : img))
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to update alt text'
        );
      }
    }
    setEditingAlt(null);
  };

  const canUpload = !disabled && images.length < maxImages;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop zone */}
      {canUpload && (
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={cn(
            'relative rounded-lg border-2 border-dashed p-8 text-center transition-colors',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50',
            isUploading && 'pointer-events-none opacity-50'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="absolute inset-0 cursor-pointer opacity-0"
            disabled={disabled || isUploading}
          />

          <div className="flex flex-col items-center gap-2">
            {isUploading ? (
              <>
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">{uploading}</p>
              </>
            ) : (
              <>
                <Upload className="h-10 w-10 text-muted-foreground" />
                <p className="text-sm font-medium">{dropzone}</p>
                <p className="text-xs text-muted-foreground">{dropzoneHint}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  {browse}
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Max images warning */}
      {images.length >= maxImages && (
        <p className="text-sm text-amber-600">{maxImagesReached}</p>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              draggable={!disabled}
              onDragStart={() => handleImageDragStart(index)}
              onDragOver={(e) => handleImageDragOver(e, index)}
              onDragEnd={handleImageDragEnd}
              className={cn(
                'group relative aspect-square overflow-hidden rounded-lg border bg-muted',
                draggedIndex === index && 'opacity-50',
                image.isPrimary && 'ring-2 ring-primary'
              )}
            >
              {/* Image */}
              {image.url ? (
                <img
                  src={image.url}
                  alt={image.alt || ''}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              )}

              {/* Primary badge */}
              {image.isPrimary && (
                <div className="absolute left-2 top-2 rounded bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                  {primary}
                </div>
              )}

              {/* Drag handle */}
              {!disabled && (
                <div className="absolute left-2 top-2 cursor-grab opacity-0 transition-opacity group-hover:opacity-100">
                  {!image.isPrimary && (
                    <div className="rounded bg-black/50 p-1">
                      <GripVertical className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              )}

              {/* Actions overlay */}
              {!disabled && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  {!image.isPrimary && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => handleSetPrimary(image.id)}
                      className="text-xs"
                    >
                      <Star className="mr-1 h-3 w-3" />
                      {setPrimary}
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(image.id)}
                    className="text-xs"
                  >
                    <X className="mr-1 h-3 w-3" />
                    {deleteLabel}
                  </Button>
                </div>
              )}

              {/* Alt text */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                {editingAlt === image.id ? (
                  <input
                    type="text"
                    defaultValue={image.alt || ''}
                    onBlur={(e) => handleAltUpdate(image.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAltUpdate(image.id, e.currentTarget.value);
                      } else if (e.key === 'Escape') {
                        setEditingAlt(null);
                      }
                    }}
                    className="w-full rounded bg-white/90 px-2 py-1 text-xs text-black"
                    autoFocus
                    placeholder={altText}
                  />
                ) : (
                  <p
                    onClick={() => !disabled && onUpdateAlt && setEditingAlt(image.id)}
                    className={cn(
                      'truncate text-xs text-white',
                      !disabled && onUpdateAlt && 'cursor-pointer hover:underline'
                    )}
                    title={image.alt || altText}
                  >
                    {image.alt || (
                      <span className="italic opacity-50">{altText}</span>
                    )}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {images.length === 0 && !canUpload && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <ImageIcon className="h-10 w-10 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">No images</p>
        </div>
      )}
    </div>
  );
}
