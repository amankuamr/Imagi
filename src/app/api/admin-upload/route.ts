import { NextRequest, NextResponse } from 'next/server';
import GitHubStorage from '@/lib/github-storage';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('image') as File;
  const name = formData.get('name') as string;
  const genre = formData.get('genre') as string;
  const game = formData.get('game') as string;
  const userId = formData.get('userId') as string;
  const userEmail = formData.get('userEmail') as string;
  const service = formData.get('service') as string;

  if (!file || !name || !genre || !game || !userId || !userEmail) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // If service is specified as 'github', redirect to GitHub upload
  if (service === 'github') {
    console.log('Redirecting to GitHub upload service');
    // Reconstruct formData for GitHub upload
    const githubFormData = new FormData();
    githubFormData.append('image', file);
    githubFormData.append('name', name);
    githubFormData.append('genre', genre);
    githubFormData.append('game', game);
    githubFormData.append('userId', userId);
    githubFormData.append('userEmail', userEmail);

    // Forward to GitHub upload API
    const githubResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/github-upload`, {
      method: 'POST',
      body: githubFormData,
    });

    return githubResponse;
  }

  try {
    // Initialize GitHub storage
    const githubStorage = new GitHubStorage();

    // Upload to GitHub LFS
    const result = await githubStorage.uploadImage(file, userId, game, genre, name);

    // Check if image already exists to prevent duplicates
    const existingImages = await getDocs(collection(db, 'images'));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const duplicate = existingImages.docs.find((doc: any) => {
      const data = doc.data();
      return data.url === result.url || data.path === result.path;
    });

    if (duplicate) {
      console.log('Duplicate image found, skipping:', result.url);
      return NextResponse.json({
        message: 'Image already exists',
        url: result.url,
        path: result.path,
        duplicate: true
      });
    }

    // Save directly to images collection (admin upload)
    const imageData = {
      title: name,
      genre: genre,
      game: game,
      url: result.url,
      path: result.path,
      uploadedAt: new Date(),
      likes: 0,
      dislikes: 0,
      likedBy: [],
      dislikedBy: [],
      userId: userId, // Use real admin user ID
      uploadedBy: userEmail, // Store uploader's email
      storageProvider: 'github',
    };

    console.log('Saving to Firestore:', imageData);

    await addDoc(collection(db, 'images'), imageData);

    return NextResponse.json({
      message: 'Image uploaded successfully to GitHub',
      url: result.url,
      path: result.path,
      storageProvider: 'github'
    });
  } catch (error) {
    console.error('Admin upload error:', error);
    return NextResponse.json({
      error: 'Upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}