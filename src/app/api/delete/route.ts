import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { db } from '@/lib/firebase';
import { collection, doc, deleteDoc, getDocs, query, where } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  const { public_id, doc_id } = await request.json();

  if (!public_id || !doc_id) {
    return NextResponse.json({ error: 'Missing public_id or doc_id' }, { status: 400 });
  }

  try {
    // Delete from Cloudinary
    await cloudinary.uploader.destroy(public_id);
    
    // Delete from Firestore
    await deleteDoc(doc(db, 'images', doc_id));
    
    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
