import axios from 'axios';
import { prisma } from '../lib/prisma';

export class PublisherService {
  async publishToYoutube(accessToken: string, clipUrl: string, title: string, description: string): Promise<string> {
    console.log(`[PublisherService] Publishing to YouTube: "${title}"`);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const mockId = `yt-short-${Math.random().toString(36).substring(2, 11)}`;
    return `https://youtube.com/shorts/${mockId}`;
  }

  async publishToTiktok(accessToken: string, clipUrl: string, title: string): Promise<string> {
    console.log(`[PublisherService] Publishing to TikTok: "${title}"`);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const mockId = `tt-video-${Math.random().toString(36).substring(2, 11)}`;
    return `https://tiktok.com/@creator/video/${mockId}`;
  }

  async publishToInstagram(accessToken: string, clipUrl: string, caption: string): Promise<string> {
    console.log(`[PublisherService] Publishing to Instagram: "${caption.substring(0, 20)}..."`);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const mockId = `ig-reel-${Math.random().toString(36).substring(2, 11)}`;
    return `https://instagram.com/reel/${mockId}`;
  }

  async publishToLinkedin(accessToken: string, clipUrl: string, text: string): Promise<string> {
    console.log(`[PublisherService] Publishing to LinkedIn: "${text.substring(0, 20)}..."`);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const mockId = `li-share-${Math.random().toString(36).substring(2, 11)}`;
    return `https://linkedin.com/feed/update/urn:li:share:${mockId}`;
  }

  async publishToX(accessToken: string, clipUrl: string, text: string): Promise<string> {
    console.log(`[PublisherService] Publishing to X: "${text.substring(0, 20)}..."`);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const mockId = `x-status-${Math.random().toString(36).substring(2, 11)}`;
    return `https://x.com/creator/status/${mockId}`;
  }

  async publishPost(postId: string): Promise<{ postUrl: string }> {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        clip: {
          include: {
            video: {
              include: {
                project: true
              }
            }
          }
        }
      }
    });

    if (!post) {
      throw new Error(`Post not found: ${postId}`);
    }

    const { platform, title, description, hashtags, clip } = post;
    const clipUrl = clip.clipUrl || '';
    
    // Find linked channel for this user and platform
    const channel = await prisma.channel.findFirst({
      where: {
        userId: clip.video.project.userId,
        platform: this.normalizePlatform(platform),
      }
    });

    const isMock = !channel || channel.accessToken.startsWith('mock-');
    const token = channel?.accessToken || 'mock-token';

    const cleanHashtags = Array.isArray(hashtags) ? hashtags : [];
    const fullTitle = `${title || 'Viral Clip'} ${cleanHashtags.map(h => `#${h}`).join(' ')}`.trim();
    const fullDesc = description || '';

    let postUrl = '';

    if (isMock) {
      console.log(`[PublisherService] Running mock publish flow for platform: ${platform}`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const mockId = Math.random().toString(36).substring(2, 11);
      postUrl = `https://${platform.toLowerCase()}.com/mock-post-${mockId}`;
    } else {
      switch (platform.toUpperCase()) {
        case 'YOUTUBE':
        case 'YOUTUBE_SHORTS':
          postUrl = await this.publishToYoutube(token, clipUrl, fullTitle, fullDesc);
          break;
        case 'TIKTOK':
          postUrl = await this.publishToTiktok(token, clipUrl, fullTitle);
          break;
        case 'INSTAGRAM':
        case 'INSTAGRAM_REELS':
          postUrl = await this.publishToInstagram(token, clipUrl, fullTitle);
          break;
        case 'LINKEDIN':
          postUrl = await this.publishToLinkedin(token, clipUrl, fullTitle);
          break;
        case 'X':
          postUrl = await this.publishToX(token, clipUrl, fullTitle);
          break;
        default:
          throw new Error(`Unsupported publishing platform: ${platform}`);
      }
    }

    // Update Post status
    await prisma.post.update({
      where: { id: postId },
      data: {
        status: 'PUBLISHED',
        publishedTime: new Date(),
        postUrl,
        errorLog: null,
      }
    });

    return { postUrl };
  }

  private normalizePlatform(platform: string): string {
    const p = platform.toUpperCase();
    if (p === 'YOUTUBE' || p === 'YOUTUBE_SHORTS') return 'YOUTUBE';
    if (p === 'TIKTOK') return 'TIKTOK';
    if (p === 'INSTAGRAM' || p === 'INSTAGRAM_REELS') return 'INSTAGRAM';
    if (p === 'LINKEDIN') return 'LINKEDIN';
    if (p === 'X') return 'X';
    return p;
  }
}

export const publisherService = new PublisherService();
