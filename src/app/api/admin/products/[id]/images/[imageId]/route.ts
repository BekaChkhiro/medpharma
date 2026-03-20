import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deleteFile, extractKeyFromUrl } from '@/services/upload';

// GET /api/admin/products/[id]/images/[imageId] - Get single image
export async function GET(
  request: NextRequest,
  segmentData: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, imageId } = await segmentData.params;

    const image = await prisma.productImage.findFirst({
      where: {
        id: imageId,
        productId: id,
      },
    });

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: image,
    });
  } catch (error) {
    console.error('Error fetching image:', error);
    return NextResponse.json(
      { error: 'Failed to fetch image' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/products/[id]/images/[imageId] - Update single image (alt text, isPrimary)
export async function PUT(
  request: NextRequest,
  segmentData: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, imageId } = await segmentData.params;
    const body = await request.json();

    const { alt, isPrimary } = body;

    // Check if image exists
    const existingImage = await prisma.productImage.findFirst({
      where: {
        id: imageId,
        productId: id,
      },
    });

    if (!existingImage) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // If setting as primary, unset other primaries first
    if (isPrimary === true) {
      await prisma.productImage.updateMany({
        where: { productId: id, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const updatedImage = await prisma.productImage.update({
      where: { id: imageId },
      data: {
        ...(alt !== undefined && { alt }),
        ...(isPrimary !== undefined && { isPrimary }),
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedImage,
      message: 'Image updated successfully',
    });
  } catch (error) {
    console.error('Error updating image:', error);
    return NextResponse.json(
      { error: 'Failed to update image' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products/[id]/images/[imageId] - Delete single image
export async function DELETE(
  request: NextRequest,
  segmentData: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, imageId } = await segmentData.params;

    // Find the image
    const image = await prisma.productImage.findFirst({
      where: {
        id: imageId,
        productId: id,
      },
    });

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Delete from S3
    const s3Key = extractKeyFromUrl(image.url);
    if (s3Key) {
      try {
        await deleteFile({ key: s3Key });
      } catch (s3Error) {
        console.error('Error deleting from S3:', s3Error);
        // Continue with database deletion even if S3 fails
      }
    }

    // Delete from database
    await prisma.productImage.delete({
      where: { id: imageId },
    });

    // If this was the primary image, set another one as primary
    if (image.isPrimary) {
      const nextImage = await prisma.productImage.findFirst({
        where: { productId: id },
        orderBy: { sortOrder: 'asc' },
      });

      if (nextImage) {
        await prisma.productImage.update({
          where: { id: nextImage.id },
          data: { isPrimary: true },
        });
      }
    }

    // Reorder remaining images
    const remainingImages = await prisma.productImage.findMany({
      where: { productId: id },
      orderBy: { sortOrder: 'asc' },
    });

    if (remainingImages.length > 0) {
      await prisma.$transaction(
        remainingImages.map((img, index) =>
          prisma.productImage.update({
            where: { id: img.id },
            data: { sortOrder: index },
          })
        )
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}
