import { NextRequest, NextResponse } from 'next/server';
import { UploadApiResponse } from 'cloudinary';
import cloudinary from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const userId = formData.get('userId') as string;

    if (!file || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' }, { status: 400 });
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 });
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer();

    // Upload to Cloudinary with optimization
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'imagi/profile-photos',
          public_id: `user-${userId}-${Date.now()}`,
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' }, // Crop to face if possible
            { quality: 'auto', fetch_format: 'auto' } // Auto optimize quality and format
          ],
          resource_type: 'image'
        },
        (error, result) => {
          if (error) reject(error);
          else if (result) resolve(result);
          else reject(new Error('Upload failed'));
        }
      ).end(Buffer.from(buffer));
    });

    return NextResponse.json({
      message: 'Profile photo uploaded successfully',
      url: result.secure_url,
      public_id: result.public_id
    });

  } catch (error) {
    console.error('Profile photo upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}