import { NextRequest, NextResponse } from 'next/server';
import GitHubStorage from '@/lib/github-storage';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('image') as File;
  const name = formData.get('name') as string;
  const genre = formData.get('genre') as string;
  const game = formData.get('game') as string;
  const userId = formData.get('userId') as string;
  const userEmail = formData.get('userEmail') as string;

  if (!file || !name || !genre || !game || !userId || !userEmail) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    // Initialize GitHub storage
    const githubStorage = new GitHubStorage();

    // Upload to GitHub LFS
    const result = await githubStorage.uploadImage(file, userId, game, genre);

    // Save request to Firestore
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
      status: 'pending',
      createdAt: new Date(),
    });

    return NextResponse.json({ message: 'Uploaded successfully', url: result.url });
  } catch (error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
