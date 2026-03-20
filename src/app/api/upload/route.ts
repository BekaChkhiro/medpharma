/**
 * Upload API Route
 *
 * POST /api/upload - Upload one or more images to S3
 * DELETE /api/upload - Delete an image from S3
 *
 * Authentication: Required (admin only)
 */

import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { serverEnv } from '@/lib/env';
import {
  uploadFile,
  uploadMultipleFiles,
  deleteFile,
  uploadConfig,
} from '@/services/upload';

// =============================================================================
// CONFIGURATION
// =============================================================================

// Increase max body size for file uploads
export const runtime = 'nodejs';
export const maxDuration = 30; // 30 seconds max

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if user is authenticated as admin
 */
async function checkAuth() {
  const session = await auth();

  if (!session || !session.user) {
    return {
      authorized: false,
      error: 'Unauthorized - Admin authentication required',
    };
  }

  return { authorized: true };
}

/**
 * Check if S3 is configured
 */
function checkS3Configuration() {
  if (!serverEnv.s3.isConfigured) {
    return {
      configured: false,
      error:
        'S3 storage is not configured. Please set S3_* environment variables.',
    };
  }
  return { configured: true };
}

// =============================================================================
// POST - Upload File(s)
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const auth = await checkAuth();
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: 401 }
      );
    }

    // Check S3 configuration
    const s3Check = checkS3Configuration();
    if (!s3Check.configured) {
      return NextResponse.json(
        { success: false, error: s3Check.error },
        { status: 500 }
      );
    }

    // Parse form data
    const formData = await request.formData();

    // Get optional parameters
    const folder = formData.get('folder')?.toString() || 'uploads';
    const optimize = formData.get('optimize')?.toString() !== 'false';

    // Get files
    const files: File[] = [];
    const fileEntries = Array.from(formData.entries()).filter(
      ([key]) => key === 'file' || key === 'files' || key.startsWith('file[')
    );

    for (const [, value] of fileEntries) {
      if (value instanceof File) {
        files.push(value);
      }
    }

    // Validate at least one file
    if (files.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No files provided. Use "file" or "files" field in form data.',
        },
        { status: 400 }
      );
    }

    // Upload files
    let results;

    if (files.length === 1) {
      // Single file upload
      const result = await uploadFile({
        file: files[0],
        folder,
        optimize,
      });
      results = [result];
    } else {
      // Multiple file upload
      results = await uploadMultipleFiles(
        files.map((file) => ({
          file,
          folder,
          optimize,
        }))
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          files: results,
          count: results.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Upload error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      },
      { status: 500 }
    );
  }
}

// =============================================================================
// DELETE - Delete File
// =============================================================================

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const auth = await checkAuth();
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: 401 }
      );
    }

    // Check S3 configuration
    const s3Check = checkS3Configuration();
    if (!s3Check.configured) {
      return NextResponse.json(
        { success: false, error: s3Check.error },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { key } = body;

    if (!key) {
      return NextResponse.json(
        {
          success: false,
          error: 'File key is required',
        },
        { status: 400 }
      );
    }

    // Delete file
    await deleteFile({ key });

    return NextResponse.json(
      {
        success: true,
        message: 'File deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed',
      },
      { status: 500 }
    );
  }
}

// =============================================================================
// GET - Configuration Info
// =============================================================================

export async function GET() {
  try {
    // Check authentication
    const auth = await checkAuth();
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: 401 }
      );
    }

    // Return upload configuration
    return NextResponse.json(
      {
        success: true,
        data: {
          configured: serverEnv.s3.isConfigured,
          maxFileSize: uploadConfig.maxFileSize,
          maxFileSizeMB: uploadConfig.maxFileSize / 1024 / 1024,
          allowedMimeTypes: uploadConfig.allowedMimeTypes,
          allowedExtensions: uploadConfig.allowedExtensions,
          imageOptimization: {
            enabled: true,
            maxWidth: uploadConfig.maxWidth,
            maxHeight: uploadConfig.maxHeight,
            quality: uploadConfig.imageQuality,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Config error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get config',
      },
      { status: 500 }
    );
  }
}
