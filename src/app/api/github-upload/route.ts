import { NextRequest, NextResponse } from 'next/server';
import GitHubStorage from '@/lib/github-storage';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const name = formData.get('name') as string;
    const genre = formData.get('genre') as string;
    const game = formData.get('game') as string;
    const userId = formData.get('userId') as string;
    const userEmail = formData.get('userEmail') as string;

    // Validate required fields
    if (!file || !name || !genre || !game || !userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: image, name, genre, game, userId, userEmail' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB for GitHub LFS)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 50MB' },
        { status: 400 }
      );
    }

    // Initialize GitHub storage
    const githubStorage = new GitHubStorage();

    // Upload to GitHub
    const result = await githubStorage.uploadImage(file, userId, game, genre, name);

    // Store upload request in Firestore (maintain existing structure)
    const { addDoc, collection } = await import('firebase/firestore');
    const { db } = await import('@/lib/firebase');

    await addDoc(collection(db, 'requests'), {
      userId: userId,
      userEmail: userEmail,
      type: 'image_upload',
      title: name,
      genre: genre,
      game: game,
      url: result.url,
      path: result.path,
      storageProvider: 'github',
      originalSize: file.size,
      optimizedSize: result.size,
      compressed: result.compressed,
      status: 'pending', // Changed from 'completed' to 'pending' for admin approval
      createdAt: new Date(),
    });

    return NextResponse.json({
      message: 'Image uploaded successfully to GitHub',
      url: result.url,
      path: result.path,
      size: result.size,
      compressed: result.compressed,
      storageProvider: 'github'
    });

  } catch (error) {
    console.error('GitHub upload error:', error);
    return NextResponse.json(
      {
        error: 'Upload failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check repository status
export async function GET() {
  try {
    const githubStorage = new GitHubStorage();
    const repoInfo = await githubStorage.getRepositoryInfo();

    return NextResponse.json({
      repository: {
        size: repoInfo.size,
        fileCount: repoInfo.fileCount,
        remainingStorage: repoInfo.remainingStorage,
        storageUsedGB: (repoInfo.size / (1024 * 1024 * 1024)).toFixed(2),
        storageRemainingGB: (repoInfo.remainingStorage / (1024 * 1024 * 1024)).toFixed(2),
      },
      limits: {
        maxStorageGB: 100,
        maxFileSizeMB: 50,
      }
    });
  } catch (error) {
    console.error('Error getting repository info:', error);
    return NextResponse.json(
      { error: 'Failed to get repository information' },
      { status: 500 }
    );
  }
}