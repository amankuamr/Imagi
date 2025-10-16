import { NextRequest, NextResponse } from 'next/server';
import GitHubStorage from '@/lib/github-storage';

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

    // Initialize GitHub storage
    const githubStorage = new GitHubStorage();

    // Upload to GitHub LFS (profile-photos folder)
    const result = await githubStorage.uploadImage(file, userId, 'profile-photos', 'avatar');

    return NextResponse.json({
      message: 'Profile photo uploaded successfully',
      url: result.url,
      path: result.path
    });

  } catch (error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}