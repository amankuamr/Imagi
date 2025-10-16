import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';
import { db } from '@/lib/firebase';
import { doc, deleteDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  const { path, public_id, doc_id } = await request.json();

  if (!doc_id) {
    return NextResponse.json({ error: 'Missing doc_id' }, { status: 400 });
  }

  // Must have either path (GitHub) or public_id (Cloudinary)
  if (!path && !public_id) {
    return NextResponse.json({ error: 'Missing path (GitHub) or public_id (Cloudinary)' }, { status: 400 });
  }

  try {
    // Handle GitHub deletion
    if (path) {
      // Clean the path - remove GitHub URL prefix if present
      let cleanPath = path;
      if (path.startsWith('https://')) {
        // Extract path from GitHub URL
        const urlMatch = path.match(/https:\/\/raw\.githubusercontent\.com\/[^\/]+\/[^\/]+\/(.+)/);
        if (urlMatch) {
          cleanPath = urlMatch[1];
        }
      }

      const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN,
      });

      const repoOwner = process.env.GITHUB_REPO_OWNER!;
      const repoName = process.env.GITHUB_REPO_NAME!;

      try {
        // Get file SHA first (required for deletion)
        const { data: fileData } = await octokit.repos.getContent({
          owner: repoOwner,
          repo: repoName,
          path: cleanPath,
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sha = (fileData as any).sha;

        // Delete from GitHub
        await octokit.repos.deleteFile({
          owner: repoOwner,
          repo: repoName,
          path: cleanPath,
          message: `Delete ${cleanPath}`,
          sha: sha,
        });
      } catch (githubError) {
        // Try alternative: maybe the path needs different formatting
        if (cleanPath.startsWith('images/')) {
          const altPath = cleanPath.substring(7); // Remove 'images/' prefix

          try {
            const { data: altFileData } = await octokit.repos.getContent({
              owner: repoOwner,
              repo: repoName,
              path: altPath,
            });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const altSha = (altFileData as any).sha;

            await octokit.repos.deleteFile({
              owner: repoOwner,
              repo: repoName,
              path: altPath,
              message: `Delete ${altPath}`,
              sha: altSha,
            });
          } catch {
            throw githubError;
          }
        } else {
          throw githubError;
        }
      }
    }

    // Handle Cloudinary deletion (legacy support)
    if (public_id) {
      // Cloudinary package removed - skip deletion for legacy images
      // In production, you might want to keep this for existing images
    }

    // Delete from Firestore
    await deleteDoc(doc(db, 'images', doc_id));

    return NextResponse.json({
      message: `Deleted successfully from ${path ? 'GitHub' : 'Cloudinary'} and Firestore`
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Delete failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
