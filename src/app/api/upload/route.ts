import { NextRequest, NextResponse } from 'next/server';
import { UploadApiResponse } from 'cloudinary';
import cloudinary from '@/lib/cloudinary';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('image') as File;
  const name = formData.get('name') as string;
  const genre = formData.get('genre') as string;
  const game = formData.get('game') as string;

  if (!file || !name || !genre || !game) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    
    // Upload to Cloudinary
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'imagi' },
        (error, result) => {
          if (error) reject(error);
          else if (result) resolve(result);
          else reject(new Error('Upload failed'));
        }
      ).end(Buffer.from(buffer));
    });

   
    // Save metadata to Firestore
    await addDoc(collection(db, 'images'), {
      title: name,
      genre: genre,
      game: game,
      url: result.secure_url,
      public_id: result.public_id,
      uploadedAt: new Date(),
      likes: 0,
      dislikes: 0,
      likedBy: [],
      dislikedBy: [],
    });

    return NextResponse.json({ message: 'Uploaded successfully', url: result.secure_url });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
