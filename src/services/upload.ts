/**
 * Upload Service - S3-compatible storage for image uploads
 *
 * This service handles file uploads to S3-compatible storage providers
 * (AWS S3, DigitalOcean Spaces, MinIO, Cloudflare R2, etc.)
 *
 * Features:
 * - File type validation (images only)
 * - File size limits
 * - Automatic filename sanitization
 * - Image optimization with Sharp
 * - Public URL generation
 * - Error handling
 */

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import sharp from 'sharp';

import { serverEnv } from '@/lib/env';

// =============================================================================
// CONFIGURATION
// =============================================================================

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

// Image optimization settings
const IMAGE_QUALITY = 85;
const MAX_WIDTH = 2000;
const MAX_HEIGHT = 2000;

// =============================================================================
// S3 CLIENT INITIALIZATION
// =============================================================================

let s3Client: S3Client | null = null;

/**
 * Get or initialize S3 client
 */
function getS3Client(): S3Client {
  if (!serverEnv.s3.isConfigured) {
    throw new Error(
      'S3 storage is not configured. Please set S3_* environment variables.'
    );
  }

  if (!s3Client) {
    s3Client = new S3Client({
      endpoint: serverEnv.s3.endpoint,
      region: serverEnv.s3.region,
      credentials: {
        accessKeyId: serverEnv.s3.accessKey!,
        secretAccessKey: serverEnv.s3.secretKey!,
      },
      // Force path-style for compatibility with non-AWS S3 providers
      forcePathStyle: !serverEnv.s3.endpoint?.includes('amazonaws.com'),
    });
  }

  return s3Client;
}

// =============================================================================
// TYPES
// =============================================================================

export interface UploadOptions {
  /**
   * File to upload
   */
  file: File;

  /**
   * Optional folder path within the bucket (e.g., "products", "banners")
   */
  folder?: string;

  /**
   * Whether to optimize the image (resize, compress)
   * Default: true
   */
  optimize?: boolean;

  /**
   * Custom filename (without extension)
   * If not provided, a unique filename will be generated
   */
  filename?: string;
}

export interface UploadResult {
  /**
   * Public URL of the uploaded file
   */
  url: string;

  /**
   * S3 key (path within bucket)
   */
  key: string;

  /**
   * Original filename
   */
  originalFilename: string;

  /**
   * File size in bytes
   */
  size: number;

  /**
   * MIME type
   */
  mimeType: string;

  /**
   * Image dimensions (if available)
   */
  width?: number;
  height?: number;
}

export interface DeleteOptions {
  /**
   * S3 key of the file to delete
   */
  key: string;
}

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Validate file type
 */
function validateFileType(file: File): void {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(
      `Invalid file type: ${file.type}. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`
    );
  }

  // Additional extension check
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
    throw new Error(
      `Invalid file extension: ${extension}. Allowed extensions: ${ALLOWED_EXTENSIONS.join(', ')}`
    );
  }
}

/**
 * Validate file size
 */
function validateFileSize(file: File): void {
  if (file.size > MAX_FILE_SIZE) {
    const maxSizeMB = MAX_FILE_SIZE / 1024 / 1024;
    const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
    throw new Error(
      `File size ${fileSizeMB}MB exceeds maximum allowed size of ${maxSizeMB}MB`
    );
  }

  if (file.size === 0) {
    throw new Error('File is empty');
  }
}

/**
 * Sanitize filename to be S3-safe
 */
function sanitizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Generate unique filename
 */
function generateFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalFilename.split('.').pop()?.toLowerCase() || 'jpg';
  const nameWithoutExt = originalFilename
    .split('.')
    .slice(0, -1)
    .join('.')
    .substring(0, 30);

  const sanitizedName = sanitizeFilename(nameWithoutExt);
  return `${sanitizedName}-${timestamp}-${random}.${extension}`;
}

// =============================================================================
// IMAGE OPTIMIZATION
// =============================================================================

/**
 * Optimize image using Sharp
 * - Resize if too large
 * - Compress to reduce file size
 * - Convert to WebP for better compression
 */
async function optimizeImage(
  buffer: ArrayBuffer,
  mimeType: string
): Promise<{ buffer: Buffer; width: number; height: number }> {
  let image = sharp(Buffer.from(buffer));

  // Get metadata
  const metadata = await image.metadata();

  // Resize if too large
  if (
    metadata.width &&
    metadata.height &&
    (metadata.width > MAX_WIDTH || metadata.height > MAX_HEIGHT)
  ) {
    image = image.resize(MAX_WIDTH, MAX_HEIGHT, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  // Convert and compress based on format
  let optimized: Buffer;
  if (mimeType === 'image/png') {
    optimized = await image.png({ quality: IMAGE_QUALITY }).toBuffer();
  } else if (mimeType === 'image/webp') {
    optimized = await image.webp({ quality: IMAGE_QUALITY }).toBuffer();
  } else if (mimeType === 'image/gif') {
    optimized = await image.gif().toBuffer();
  } else {
    // Default to JPEG
    optimized = await image.jpeg({ quality: IMAGE_QUALITY }).toBuffer();
  }

  // Get final dimensions
  const finalMetadata = await sharp(optimized).metadata();

  return {
    buffer: optimized,
    width: finalMetadata.width || 0,
    height: finalMetadata.height || 0,
  };
}

// =============================================================================
// UPLOAD FUNCTIONS
// =============================================================================

/**
 * Upload a file to S3
 */
export async function uploadFile(
  options: UploadOptions
): Promise<UploadResult> {
  const { file, folder = 'uploads', optimize = true, filename } = options;

  // Validate
  validateFileType(file);
  validateFileSize(file);

  // Get S3 client
  const client = getS3Client();

  // Generate key (path in S3)
  const generatedFilename = filename
    ? `${sanitizeFilename(filename)}.${file.name.split('.').pop()}`
    : generateFilename(file.name);
  const key = folder ? `${folder}/${generatedFilename}` : generatedFilename;

  // Read file buffer
  const arrayBuffer = await file.arrayBuffer();

  let uploadBuffer: Buffer;
  let width: number | undefined;
  let height: number | undefined;

  // Optimize image if enabled
  if (optimize && file.type.startsWith('image/')) {
    try {
      const optimized = await optimizeImage(arrayBuffer, file.type);
      uploadBuffer = optimized.buffer;
      width = optimized.width;
      height = optimized.height;
    } catch (error) {
      console.error('Image optimization failed, uploading original:', error);
      uploadBuffer = Buffer.from(arrayBuffer);
    }
  } else {
    uploadBuffer = Buffer.from(arrayBuffer);
  }

  // Upload to S3
  const command = new PutObjectCommand({
    Bucket: serverEnv.s3.bucket,
    Key: key,
    Body: uploadBuffer,
    ContentType: file.type,
    // Make publicly readable
    ACL: 'public-read',
    // Cache for 1 year
    CacheControl: 'public, max-age=31536000, immutable',
  });

  try {
    await client.send(command);
  } catch (error) {
    console.error('S3 upload failed:', error);
    throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Generate public URL
  const url = generatePublicUrl(key);

  return {
    url,
    key,
    originalFilename: file.name,
    size: uploadBuffer.length,
    mimeType: file.type,
    width,
    height,
  };
}

/**
 * Upload multiple files
 */
export async function uploadMultipleFiles(
  files: UploadOptions[]
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];
  const errors: Error[] = [];

  for (const fileOptions of files) {
    try {
      const result = await uploadFile(fileOptions);
      results.push(result);
    } catch (error) {
      errors.push(
        error instanceof Error ? error : new Error('Unknown upload error')
      );
    }
  }

  if (errors.length > 0 && results.length === 0) {
    throw new Error(
      `All uploads failed: ${errors.map((e) => e.message).join(', ')}`
    );
  }

  if (errors.length > 0) {
    console.warn(
      `Some uploads failed: ${errors.map((e) => e.message).join(', ')}`
    );
  }

  return results;
}

// =============================================================================
// DELETE FUNCTIONS
// =============================================================================

/**
 * Delete a file from S3
 */
export async function deleteFile(options: DeleteOptions): Promise<void> {
  const { key } = options;

  if (!key) {
    throw new Error('File key is required');
  }

  const client = getS3Client();

  const command = new DeleteObjectCommand({
    Bucket: serverEnv.s3.bucket,
    Key: key,
  });

  try {
    await client.send(command);
  } catch (error) {
    console.error('S3 delete failed:', error);
    throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete multiple files
 */
export async function deleteMultipleFiles(keys: string[]): Promise<void> {
  const errors: Error[] = [];

  for (const key of keys) {
    try {
      await deleteFile({ key });
    } catch (error) {
      errors.push(
        error instanceof Error ? error : new Error('Unknown delete error')
      );
    }
  }

  if (errors.length > 0) {
    console.warn(
      `Some deletes failed: ${errors.map((e) => e.message).join(', ')}`
    );
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Check if a file exists in S3
 */
export async function fileExists(key: string): Promise<boolean> {
  const client = getS3Client();

  const command = new HeadObjectCommand({
    Bucket: serverEnv.s3.bucket,
    Key: key,
  });

  try {
    await client.send(command);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Generate public URL for an S3 key
 */
export function generatePublicUrl(key: string): string {
  // Use custom public URL if configured (e.g., CloudFront CDN)
  if (serverEnv.s3.publicUrl) {
    return `${serverEnv.s3.publicUrl}/${key}`;
  }

  // Construct URL from S3 endpoint
  const endpoint = serverEnv.s3.endpoint || '';
  const bucket = serverEnv.s3.bucket || '';

  // AWS S3 URL format
  if (endpoint.includes('amazonaws.com')) {
    return `https://${bucket}.s3.${serverEnv.s3.region}.amazonaws.com/${key}`;
  }

  // Generic S3-compatible URL format (DigitalOcean, MinIO, etc.)
  return `${endpoint}/${bucket}/${key}`;
}

/**
 * Extract S3 key from public URL
 */
export function extractKeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const bucket = serverEnv.s3.bucket || '';

    // Remove leading slash and bucket name if present
    let key = pathname.replace(/^\//, '');
    if (key.startsWith(`${bucket}/`)) {
      key = key.substring(bucket.length + 1);
    }

    return key;
  } catch (error) {
    console.error('Failed to extract key from URL:', error);
    return null;
  }
}

// =============================================================================
// VALIDATION EXPORTS
// =============================================================================

export const uploadConfig = {
  maxFileSize: MAX_FILE_SIZE,
  allowedMimeTypes: ALLOWED_MIME_TYPES,
  allowedExtensions: ALLOWED_EXTENSIONS,
  maxWidth: MAX_WIDTH,
  maxHeight: MAX_HEIGHT,
  imageQuality: IMAGE_QUALITY,
};
