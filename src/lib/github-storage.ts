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
      await this.octokit.repos.createOrUpdateFileContents({
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


      // Add delay to respect rate limits
      await this.delay(this.rateLimitDelay);

      return {
        url: downloadUrl,
        path: filePath,
        size: optimizedBuffer.length,
        compressed: optimizedBuffer.length < file.size,
      };
    } catch {
      throw new Error('Failed to upload image');
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
    } catch {
      throw new Error('Failed to get repository info');
    }
  }

  private async optimizeImage(file: File): Promise<Buffer> {
    const buffer = Buffer.from(await file.arrayBuffer());
    const originalSize = buffer.length;

    // Get image metadata
    const metadata = await sharp(buffer).metadata();

    let optimized = sharp(buffer);
    let quality = 95; // Start with high quality

    // Smart compression based on original size
    if (originalSize > 5 * 1024 * 1024) { // > 5MB
      quality = 85;
    } else if (originalSize > 2 * 1024 * 1024) { // > 2MB
      quality = 90;
    } else {
      quality = 95;
    }

    // Resize if too large (max 1920px width, maintain aspect ratio)
    if (metadata.width && metadata.width > 1920) {
      const aspectRatio = metadata.height! / metadata.width!;
      const newHeight = Math.round(1920 * aspectRatio);

      optimized = optimized.resize(1920, newHeight, {
        fit: 'inside',
        withoutEnlargement: true,
        kernel: sharp.kernel.lanczos3, // High quality resizing
      });
      // Image resized for optimization
    }

    // Compress based on format with quality preservation
    if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
      optimized = optimized.jpeg({
        quality: quality,
        progressive: true,
        mozjpeg: true, // Better compression
        chromaSubsampling: '4:4:4', // Preserve color quality
      });
    } else if (metadata.format === 'png') {
      // Convert large PNGs to JPEG for better compression
      if (originalSize > 1 * 1024 * 1024) { // > 1MB PNG
        optimized = optimized.jpeg({
          quality: quality,
          progressive: true,
        });
      } else {
        optimized = optimized.png({
          compressionLevel: 6, // Balanced compression
          quality: quality,
          palette: true, // Use palette if possible
        });
      }
    } else if (metadata.format === 'webp') {
      optimized = optimized.webp({
        quality: quality,
        effort: 6, // Higher effort for better compression
      });
    } else {
      // Convert other formats to JPEG
      optimized = optimized.jpeg({
        quality: quality,
        progressive: true,
      });
    }

    const optimizedBuffer = await optimized.toBuffer();


    return optimizedBuffer;
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
    } catch {
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
    } catch {
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
          await this.delay(waitTime);
        }
      }
    } catch {
      // If we can't check rate limit, just add a small delay
      await this.delay(500);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default GitHubStorage;