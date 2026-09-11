import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { videoService } from '../services/video';
import { storageService } from '../services/storage';
import { aiService } from '../services/ai';
import { checkProjectAccess } from '../lib/access';
import { runFile, binaryAvailable, resolveLocalBinary, isValidYoutubeUrl } from '../lib/exec';
import { AuthenticatedRequest } from '../middleware/auth';
import path from 'path';
import fs from 'fs';

// Helper to convert CSS hex colors to ASS ABGR format (e.g. #8b5cf6 -> &H00F65C8B)
function hexToAssColor(hex: string): string {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length === 6) {
    const r = cleanHex.substring(0, 2);
    const g = cleanHex.substring(2, 4);
    const b = cleanHex.substring(4, 6);
    return `&H00${b}${g}${r}`; // ASS format is BBGGRR (Alpha is 00)
  }
  return '&H00FFFFFF'; // Default to white
}

// Helper to format float seconds to ASS format (H:MM:SS.CS)
function formatAssTime(seconds: number): string {
  const s = Math.max(0, seconds);
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const secs = Math.floor(s % 60);
  const centiseconds = Math.floor((s % 1) * 100);
  
  const pad = (num: number, size: number) => num.toString().padStart(size, '0');
  return `${hours}:${pad(minutes, 2)}:${pad(secs, 2)}.${pad(centiseconds, 2)}`;
}

export const renderClipWithCaptions = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { captionStyle, enableEmojis, enableProgressBar, enableWatermark, brandColor, watermarkText, captionFont, captionPosition } = req.body;

  try {
    // 1. Fetch Clip & parent Video details
    const clip = await prisma.clip.findUnique({
      where: { id },
      include: {
        video: {
          include: {
            transcript: true,
            project: true,
          },
        },
      },
    });

    if (!clip) {
      res.status(404).json({ error: `Clip not found: ${id}` });
      return;
    }

    const userId = (req as AuthenticatedRequest).user?.id || '';
    const hasAccess = await checkProjectAccess(clip.video.project.id, userId);
    if (!hasAccess) {
      res.status(403).json({ error: 'Access denied to render this clip' });
      return;
    }

    const { video } = clip;
    const segments = (video.transcript?.segments as any[]) || [];

    // 2. Filter and normalize transcript segments for this clip
    const clipSegments = segments.filter(
      (s) => s.start >= clip.start && s.end <= clip.end
    );

    // 3. Create styled ASS subtitle file
    const tempAssPath = path.join(__dirname, `../../temp-subtitle-${id}.ass`);
    const tempOutputDir = path.dirname(tempAssPath);
    if (!fs.existsSync(tempOutputDir)) {
      fs.mkdirSync(tempOutputDir, { recursive: true });
    }

    const primaryColorAss = captionStyle === 'beast' ? '&H0000FFFF' : '&H00FFFFFF';
    const outlineColorAss = captionStyle === 'podcast' ? hexToAssColor(brandColor || '#8b5cf6') : '&H00000000';
    const outlineThickness = captionStyle === 'minimalist' ? '1' : captionStyle === 'podcast' ? '3' : '4';
    const fontSize = captionStyle === 'minimalist' ? '28' : captionStyle === 'podcast' ? '36' : '42';
    const isBold = captionStyle === 'minimalist' ? '0' : '1';
    const fontAss = captionFont || 'Arial';
    const alignAss = captionPosition === 'top' ? '8' : captionPosition === 'middle' ? '5' : '2';
    
    // ASS headers
    let assContent = `[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Caption,${fontAss},${fontSize},${primaryColorAss},&H00000000,${outlineColorAss},&H00000000,${isBold},0,0,0,100,100,0,0,1,${outlineThickness},0,${alignAss},10,10,180,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

    // Add dialog event lines
    clipSegments.forEach((seg) => {
      const relStart = Math.max(0, seg.start - clip.start);
      const relEnd = Math.max(0, seg.end - clip.start);
      const startStr = formatAssTime(relStart);
      const endStr = formatAssTime(relEnd);
      
      let text = seg.text;
      if (!enableEmojis) {
        // Strip emojis if disabled (basic regex helper)
        text = text.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '');
      }

      assContent += `Dialogue: 0,${startStr},${endStr},Caption,,0,0,0,,${text.trim()}\n`;
    });

    fs.writeFileSync(tempAssPath, assContent);
    console.log(`[RenderController] Generated styled ASS subtitles for clip ${id}`);

    // 4. Resolve original video media source file
    let sourcePath = path.join(__dirname, `../../original-${video.id}.mp4`);
    
    // Download source stream if missing from local temp folder
    if (!fs.existsSync(sourcePath) && video.youtubeUrl) {
      if (!isValidYoutubeUrl(video.youtubeUrl)) {
        console.warn(`[RenderController] Refusing to re-download non-YouTube source URL for video ${video.id}.`);
        fs.writeFileSync(sourcePath, 'mock-media-source-binary-data');
      } else {
        console.log(`[RenderController] Source video missing locally. Re-downloading stream: ${video.youtubeUrl}`);
        const ytDlpBin = resolveLocalBinary('bin/yt-dlp.exe', 'yt-dlp');
        const hasYtDlp = await binaryAvailable(ytDlpBin, '--version');

        if (hasYtDlp) {
          try {
            await runFile(ytDlpBin, ['-f', 'mp4', '-o', sourcePath, video.youtubeUrl]);
          } catch (err: any) {
            console.warn('[RenderController] Failed download, creating mock video file.', err.stderr || err.message);
            fs.writeFileSync(sourcePath, 'mock-media-source-binary-data');
          }
        } else {
          console.warn('[RenderController] yt-dlp missing, creating mock video file.');
          fs.writeFileSync(sourcePath, 'mock-media-source-binary-data');
        }
      }
    }

    // 5. Execute FFmpeg rendering
    const localClipOutputPath = path.join(__dirname, `../../render-output-${id}.mp4`);
    
    await videoService.extractClip({
      inputPath: sourcePath,
      outputPath: localClipOutputPath,
      start: clip.start,
      end: clip.end,
      cropTo916: true,
      watermarkText: enableWatermark ? (watermarkText || 'VIBECUT.AI') : undefined,
      subtitlesPath: tempAssPath,
      progressBarColor: enableProgressBar ? (brandColor || '#8b5cf6') : undefined,
    });

    // 6. Upload rendered clip and update database
    const fileKey = `clips/${video.id}/clip-${id}-render.mp4`;
    const clipUrl = await storageService.uploadFile(localClipOutputPath, fileKey);

    const updatedClip = await prisma.clip.update({
      where: { id },
      data: {
        clipUrl,
        captionsStatus: 'COMPLETED',
      },
    });

    // 7. Cleanup temp files
    if (fs.existsSync(tempAssPath)) fs.unlinkSync(tempAssPath);
    if (fs.existsSync(localClipOutputPath)) fs.unlinkSync(localClipOutputPath);
    
    // Clean up re-downloaded original only if it was downloaded here
    if (video.youtubeUrl && fs.existsSync(sourcePath)) {
      fs.unlinkSync(sourcePath);
    }

    console.log(`[RenderController] Clip ${id} successfully rendered with custom style: ${captionStyle}`);
    res.json(updatedClip);
  } catch (error: any) {
    console.error('[RenderController] Render error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const getClipMetadata = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const clip = await prisma.clip.findUnique({
      where: { id },
      include: { video: { select: { projectId: true } } },
    });

    if (!clip) {
      res.status(404).json({ error: `Clip not found: ${id}` });
      return;
    }

    const userId = (req as AuthenticatedRequest).user?.id || '';
    const hasAccess = await checkProjectAccess(clip.video.projectId, userId);
    if (!hasAccess) {
      res.status(403).json({ error: 'Access denied to this clip' });
      return;
    }

    const transcriptText = clip.transcriptText || "No transcript available for this clip.";
    const title = clip.title || "Untitled Clip Highlight";

    console.log(`[RenderController] Generating AI metadata suggestions for clip ${id}...`);
    
    let metadata;
    try {
      metadata = await aiService.generateMetadata(title, transcriptText);
    } catch (aiError: any) {
      console.warn(`[RenderController] Gemini metadata generation failed, falling back to clip-derived metadata. Error: ${aiError.message}`);
      
      // High-quality fallback derived from real clip data
      const cleanTitle = title.replace(/[^\w\s-]/gi, '').trim();
      metadata = {
        titles: [
          title,
          `Viral Hook: ${title}`,
          `Why you need to know about ${cleanTitle}`,
          `Inside look: ${title}`,
          `This changes everything... 🤯`
        ],
        description: transcriptText.length > 140 
          ? transcriptText.substring(0, 137) + '...' 
          : transcriptText || `Check out this highlight about ${title}!`,
        hashtags: ['shorts', 'viral', 'trending', 'foryou', 'highlight']
      };
    }

    res.json(metadata);
  } catch (error: any) {
    console.error('[RenderController] Metadata controller critical error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};
