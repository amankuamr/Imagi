import { NextRequest, NextResponse } from 'next/server';
import GitHubStorage from '@/lib/github-storage';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('image') as File;

  if (!file) {
    return NextResponse.json({ error: 'No image provided' }, { status: 400 });
  }

  try {
    // Initialize GitHub storage
    const githubStorage = new GitHubStorage();

    // Upload to GitHub LFS (logos folder)
    const result = await githubStorage.uploadImage(file, 'admin', 'logos', 'logo');

    return NextResponse.json({
      message: 'Logo uploaded successfully',
      url: result.url,
      path: result.path
    });
  } catch (error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}