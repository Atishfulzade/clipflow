import fs from 'fs';
import path from 'path';
import { runFile, binaryAvailable, resolveLocalBinary, sanitizeForDrawtext, isValidHexColor } from '../lib/exec';

export interface ClipParams {
  inputPath: string;
  outputPath: string;
  start: number;
  end: number;
  cropTo916: boolean;
  watermarkText?: string;
  subtitlesPath?: string;
  progressBarColor?: string;
}

export interface VideoService {
  extractClip(params: ClipParams): Promise<string>;
  extractAudioTrack(videoPath: string, audioPath: string): Promise<string>;
}

class VideoServiceImpl implements VideoService {
  private ffmpegBin(): string {
    return resolveLocalBinary('bin/ffmpeg.exe', 'ffmpeg');
  }

  private async isFFmpegAvailable(): Promise<boolean> {
    if (fs.existsSync(this.ffmpegBin())) return true;
    return binaryAvailable('ffmpeg');
  }

  async extractClip(params: ClipParams): Promise<string> {
    const ffmpegAvailable = await this.isFFmpegAvailable();
    const outputDir = path.dirname(params.outputPath);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    if (!ffmpegAvailable) {
      throw new Error('FFmpeg is not available to process the video clip.');
    }

    const duration = params.end - params.start;
    const filters: string[] = [];

    if (params.cropTo916) {
      filters.push('crop=ih*9/16:ih:(iw-ow)/2:0');
    }

    if (params.watermarkText) {
      const safeText = sanitizeForDrawtext(params.watermarkText);
      if (safeText) {
        filters.push(`drawtext=text='${safeText}':x=(w-text_w)/2:y=h-120:fontsize=24:fontcolor=white:box=1:boxcolor=black@0.4`);
      }
    }

    if (params.progressBarColor && isValidHexColor(params.progressBarColor)) {
      const cleanColor = params.progressBarColor.replace('#', '0x');
      filters.push(`drawbox=x=0:y=ih-15:w=iw*t/${duration}:h=8:color=${cleanColor}:t=fill`);
    }

    if (params.subtitlesPath) {
      // Convert Windows backslashes and escape drive letter colons for FFmpeg filter parsing
      const escapedSubPath = params.subtitlesPath.replace(/\\/g, '/').replace(/:/g, '\\:');
      filters.push(`subtitles='${escapedSubPath}'`);
    }

    const args = ['-y', '-ss', String(params.start), '-t', String(duration), '-i', params.inputPath];
    if (filters.length) {
      args.push('-vf', filters.join(','));
    }
    args.push('-c:v', 'libx264', '-c:a', 'aac', params.outputPath);

    console.log(`[FFmpeg] Editing video: ${params.inputPath} -> ${params.outputPath}`);
    try {
      await runFile(this.ffmpegBin(), args);
      console.log(`[FFmpeg] Render completed successfully: ${params.outputPath}`);
      return params.outputPath;
    } catch (error: any) {
      console.error(`[FFmpeg] Error executing command: ${error.stderr || error.message}`);
      throw error;
    }
  }

  async extractAudioTrack(videoPath: string, audioPath: string): Promise<string> {
    const ffmpegAvailable = await this.isFFmpegAvailable();
    const outputDir = path.dirname(audioPath);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    if (!ffmpegAvailable) {
      throw new Error('FFmpeg is not available to extract the audio track.');
    }

    console.log(`[FFmpeg] Extracting mono audio track: ${videoPath} -> ${audioPath}`);
    const args = ['-y', '-i', videoPath, '-vn', '-ac', '1', '-ar', '16000', '-acodec', 'libmp3lame', audioPath];

    try {
      await runFile(this.ffmpegBin(), args);
      console.log(`[FFmpeg] Audio extraction completed: ${audioPath}`);
      return audioPath;
    } catch (error: any) {
      console.error(`[FFmpeg] Audio extraction error: ${error.stderr || error.message}`);
      throw error;
    }
  }
}

export const videoService = new VideoServiceImpl();
