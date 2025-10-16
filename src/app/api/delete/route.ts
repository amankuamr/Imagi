import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';
import { db } from '@/lib/firebase';
import { doc, deleteDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  const { path, public_id, doc_id } = await request.json();

  console.log('Delete request received:', { path, public_id, doc_id });

  if (!doc_id) {
    console.error('Missing doc_id');
    return NextResponse.json({ error: 'Missing doc_id' }, { status: 400 });
  }

  // Must have either path (GitHub) or public_id (Cloudinary)
  if (!path && !public_id) {
    console.error('Missing both path and public_id');
    return NextResponse.json({ error: 'Missing path (GitHub) or public_id (Cloudinary)' }, { status: 400 });
  }

  try {
    // Handle GitHub deletion
    if (path) {
      console.log(`Attempting to delete from GitHub: ${path}`);

      // Clean the path - remove GitHub URL prefix if present
      let cleanPath = path;
      if (path.startsWith('https://')) {
        // Extract path from GitHub URL
        const urlMatch = path.match(/https:\/\/raw\.githubusercontent\.com\/[^\/]+\/[^\/]+\/(.+)/);
        if (urlMatch) {
          cleanPath = urlMatch[1];
          console.log(`Cleaned path from URL: ${cleanPath}`);
        }
      }

      const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN,
      });

      const repoOwner = process.env.GITHUB_REPO_OWNER!;
      const repoName = process.env.GITHUB_REPO_NAME!;

      console.log(`GitHub config: ${repoOwner}/${repoName}`);
      console.log(`Using path: ${cleanPath}`);

      try {
        // Get file SHA first (required for deletion)
        console.log(`Getting file info for: ${cleanPath}`);
        const { data: fileData } = await octokit.repos.getContent({
          owner: repoOwner,
          repo: repoName,
          path: cleanPath,
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sha = (fileData as any).sha;
        console.log(`File SHA: ${sha}`);

        // Delete from GitHub
        console.log(`Deleting file from GitHub...`);
        await octokit.repos.deleteFile({
          owner: repoOwner,
          repo: repoName,
          path: cleanPath,
          message: `Delete ${cleanPath}`,
          sha: sha,
        });

        console.log(`Successfully deleted from GitHub: ${cleanPath}`);
      } catch (githubError) {
        console.error(`GitHub deletion failed for ${cleanPath}:`, githubError);
        // Try alternative: maybe the path needs different formatting
        console.error('Attempting alternative path formats...');

        // Try without 'images/' prefix
        if (cleanPath.startsWith('images/')) {
          const altPath = cleanPath.substring(7); // Remove 'images/' prefix
          console.log(`Trying alternative path: ${altPath}`);

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

            console.log(`Successfully deleted with alternative path: ${altPath}`);
          } catch (altError) {
            console.error(`Alternative path also failed:`, altError);
            throw githubError;
          }
        } else {
          throw githubError;
        }
      }
    }

    // Handle Cloudinary deletion (legacy support)
    if (public_id) {
      const cloudinary = await import('cloudinary').then(mod => mod.v2);
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      await cloudinary.uploader.destroy(public_id);
      console.log(`Successfully deleted from Cloudinary: ${public_id}`);
    }

    // Delete from Firestore
    await deleteDoc(doc(db, 'images', doc_id));

    return NextResponse.json({
      message: `Deleted successfully from ${path ? 'GitHub' : 'Cloudinary'} and Firestore`
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({
      error: 'Delete failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
