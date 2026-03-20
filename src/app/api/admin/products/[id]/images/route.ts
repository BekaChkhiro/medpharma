import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { uploadFile, deleteFile, extractKeyFromUrl } from '@/services/upload';

// GET /api/admin/products/[id]/images - Get all images for a product
export async function GET(
  request: NextRequest,
  segmentData: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await segmentData.params;

    const images = await prisma.productImage.findMany({
      where: { productId: id },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: images,
    });
  } catch (error) {
    console.error('Error fetching product images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}

// POST /api/admin/products/[id]/images - Upload images to a product
export async function POST(
  request: NextRequest,
  segmentData: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await segmentData.params;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id },
      include: { images: { select: { id: true } } },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // Get current max sort order
    const maxSortOrder = await prisma.productImage.aggregate({
      where: { productId: id },
      _max: { sortOrder: true },
    });

    let currentSortOrder = (maxSortOrder._max.sortOrder ?? -1) + 1;
    const uploadedImages = [];

    // Check if this is the first image (will be set as primary)
    const isFirstImage = product.images.length === 0;

    for (const file of files) {
      try {
        // Upload to S3
        const uploadResult = await uploadFile({
          file,
          folder: `products/${id}`,
          optimize: true,
        });

        // Create database record
        const image = await prisma.productImage.create({
          data: {
            url: uploadResult.url,
            alt: file.name.replace(/\.[^/.]+$/, ''), // Use filename without extension as alt
            sortOrder: currentSortOrder,
            isPrimary: isFirstImage && currentSortOrder === (maxSortOrder._max.sortOrder ?? -1) + 1,
            productId: id,
          },
        });

        uploadedImages.push(image);
        currentSortOrder++;
      } catch (uploadError) {
        console.error('Error uploading file:', uploadError);
        // Continue with other files
      }
    }

    if (uploadedImages.length === 0) {
      return NextResponse.json(
        { error: 'Failed to upload any files' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: uploadedImages,
      message: `${uploadedImages.length} image(s) uploaded successfully`,
    });
  } catch (error) {
    console.error('Error uploading product images:', error);
    return NextResponse.json(
      { error: 'Failed to upload images' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/products/[id]/images - Reorder images or update multiple
export async function PUT(
  request: NextRequest,
  segmentData: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await segmentData.params;
    const body = await request.json();

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Handle reorder operation
    if (body.reorder && Array.isArray(body.imageIds)) {
      const imageIds = body.imageIds as string[];

      // Update sort orders in a transaction
      await prisma.$transaction(
        imageIds.map((imageId, index) =>
          prisma.productImage.update({
            where: { id: imageId, productId: id },
            data: { sortOrder: index },
          })
        )
      );

      const images = await prisma.productImage.findMany({
        where: { productId: id },
        orderBy: { sortOrder: 'asc' },
      });

      return NextResponse.json({
        success: true,
        data: images,
        message: 'Images reordered successfully',
      });
    }

    // Handle set primary operation
    if (body.setPrimary && body.imageId) {
      await prisma.$transaction([
        // Remove primary from all images
        prisma.productImage.updateMany({
          where: { productId: id },
          data: { isPrimary: false },
        }),
        // Set new primary
        prisma.productImage.update({
          where: { id: body.imageId, productId: id },
          data: { isPrimary: true },
        }),
      ]);

      const images = await prisma.productImage.findMany({
        where: { productId: id },
        orderBy: { sortOrder: 'asc' },
      });

      return NextResponse.json({
        success: true,
        data: images,
        message: 'Primary image updated',
      });
    }

    return NextResponse.json(
      { error: 'Invalid operation' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating product images:', error);
    return NextResponse.json(
      { error: 'Failed to update images' },
      { status: 500 }
    );
  }
}
