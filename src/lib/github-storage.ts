import { Octokit } from '@octokit/rest';
import sharp from 'sharp';
import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';

interface GitHubConfig {
  token: string;
  repoOwner: string;
  repoName: string;
}

interface ImageMetadata {
  url: string;
  path: string;
  title: string;
  userId: string;
  game: string;
  genre?: string;
  originalSize: number;
  optimizedSize: number;
  uploadedAt: Date;
}

interface GitHubFileResponse {
  sha: string;
  download_url?: string;
  [key: string]: unknown;
}

interface GitHubContentResponse {
  download_url: string;
  [key: string]: unknown;
}

interface UploadResult {
  url: string;
  path: string;
  size: number;
  compressed: boolean;
}

class GitHubStorage {
  private octokit: Octokit;
  private config: GitHubConfig;
  private rateLimitDelay = 1000; // 1 second between requests

  constructor() {
    this.config = {
      token: process.env.GITHUB_TOKEN!,
      repoOwner: process.env.GITHUB_REPO_OWNER!,
      repoName: process.env.GITHUB_REPO_NAME!,
    };

    this.octokit = new Octokit({
      auth: this.config.token,
    });
  }

  async uploadImage(
    file: File,
    userId: string,
    gameName: string,
    genre?: string,
    name?: string
  ): Promise<UploadResult> {
    try {
      // Check rate limits
      await this.checkRateLimit();

      // Optimize image before upload
      const optimizedBuffer = await this.optimizeImage(file);

      // Generate unique path
      const fileName = this.generateFileName(file.name, userId, gameName);
      const filePath = `images/${fileName}`;

      // Upload to GitHub
      const { data } = await this.octokit.repos.createOrUpdateFileContents({
        owner: this.config.repoOwner,
        repo: this.config.repoName,
        path: filePath,
        message: `Upload ${fileName} - ${gameName}`,
        content: Buffer.from(optimizedBuffer).toString('base64'),
      });

      // Get the actual download URL from GitHub API
      const { data: fileData } = await this.octokit.repos.getContent({
        owner: this.config.repoOwner,
        repo: this.config.repoName,
        path: filePath,
      });

      const contentData = fileData as GitHubContentResponse;
      const downloadUrl = contentData.download_url;

      // Store metadata in Firestore
      await this.storeMetadata({
        url: downloadUrl,
        path: filePath,
        title: name || file.name, // Use provided name or filename as fallback
        userId,
        game: gameName,
        genre: genre,
        originalSize: file.size,
        optimizedSize: optimizedBuffer.length,
        uploadedAt: new Date(),
      });

      console.log('Stored metadata:', {
        url: downloadUrl,
        path: filePath,
        title: name || file.name,
        userId,
        game: gameName,
        genre: genre,
      });

      // Add delay to respect rate limits
      await this.delay(this.rateLimitDelay);

      return {
        url: downloadUrl,
        path: filePath,
        size: optimizedBuffer.length,
        compressed: optimizedBuffer.length < file.size,
      };
    } catch (error) {
      console.error('GitHub upload error:', error);
      throw new Error(`Failed to upload image: ${error}`);
    }
  }

  async deleteImage(filePath: string): Promise<void> {
    try {
      await this.checkRateLimit();

      // Get file SHA first
      const sha = await this.getFileSha(filePath);

      await this.octokit.repos.deleteFile({
        owner: this.config.repoOwner,
        repo: this.config.repoName,
        path: filePath,
        message: `Delete ${filePath}`,
        sha,
      });

      await this.delay(this.rateLimitDelay);
    } catch (error) {
      console.error('GitHub delete error:', error);
      throw new Error(`Failed to delete image: ${error}`);
    }
  }

  async getRepositoryInfo(): Promise<{
    size: number;
    fileCount: number;
    remainingStorage: number;
  }> {
    try {
      const { data } = await this.octokit.repos.get({
        owner: this.config.repoOwner,
        repo: this.config.repoName,
      });

      // Get approximate file count (this is an estimate)
      const fileCount = await this.getFileCount();

      return {
        size: data.size * 1024, // Convert KB to bytes
        fileCount,
        remainingStorage: (100 * 1024 * 1024 * 1024) - (data.size * 1024), // 100GB limit
      };
    } catch (error) {
      console.error('Error getting repo info:', error);
      throw error;
    }
  }

  private async optimizeImage(file: File): Promise<Buffer> {
    const buffer = Buffer.from(await file.arrayBuffer());

    // Get image metadata
    const metadata = await sharp(buffer).metadata();

    // Optimize based on image type and size
    let optimized = sharp(buffer);

    // Resize if too large (max 1920px width)
    if (metadata.width && metadata.width > 1920) {
      optimized = optimized.resize(1920, null, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Compress based on format
    if (metadata.format === 'jpeg') {
      optimized = optimized.jpeg({
        quality: 85,
        progressive: true,
      });
    } else if (metadata.format === 'png') {
      optimized = optimized.png({
        compressionLevel: 8,
        quality: 85,
      });
    } else if (metadata.format === 'webp') {
      optimized = optimized.webp({
        quality: 85,
      });
    }

    return optimized.toBuffer();
  }

  private generateFileName(originalName: string, userId: string, gameName: string): string {
    const timestamp = Date.now();
    const sanitizedGameName = gameName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    const extension = originalName.split('.').pop();
    return `${userId}/${sanitizedGameName}/${timestamp}.${extension}`;
  }

  private async storeMetadata(metadata: ImageMetadata): Promise<void> {
    try {
      await addDoc(collection(db, 'images'), {
        ...metadata,
        storageProvider: 'github',
      });
    } catch (error) {
      console.error('Error storing metadata:', error);
      // Don't throw - metadata storage failure shouldn't fail upload
    }
  }

  private async getFileSha(filePath: string): Promise<string> {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner: this.config.repoOwner,
        repo: this.config.repoName,
        path: filePath,
      });
      const fileData = data as GitHubFileResponse;
      return fileData.sha;
    } catch (error) {
      throw new Error(`File not found: ${filePath}`);
    }
  }

  private async getFileCount(): Promise<number> {
    try {
      // This is an approximation - in a real implementation,
      // you might want to maintain a separate count
      const { data } = await this.octokit.repos.getContent({
        owner: this.config.repoOwner,
        repo: this.config.repoName,
        path: 'images',
      });

      if (Array.isArray(data)) {
        return data.length;
      }
      return 0;
    } catch {
      return 0;
    }
  }

  private async checkRateLimit(): Promise<void> {
    try {
      const { data } = await this.octokit.rateLimit.get();
      const remaining = data.rate.remaining;

      if (remaining < 10) {
        const resetTime = new Date(data.rate.reset * 1000);
        const waitTime = resetTime.getTime() - Date.now();
        if (waitTime > 0) {
          console.log(`Rate limit low. Waiting ${Math.ceil(waitTime / 1000)} seconds...`);
          await this.delay(waitTime);
        }
      }
    } catch (error) {
      // If we can't check rate limit, just add a small delay
      await this.delay(500);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default GitHubStorage;