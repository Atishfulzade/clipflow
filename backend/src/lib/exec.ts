import { execFile } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Runs a binary with an argument array (never through a shell), so
 * user-controlled strings (URLs, watermark text, colors, file paths)
 * cannot be interpreted as shell syntax.
 */
export const runFile = (bin: string, args: string[]): Promise<{ stdout: string; stderr: string }> => {
  return new Promise((resolve, reject) => {
    execFile(bin, args, { maxBuffer: 1024 * 1024 * 64 }, (error, stdout, stderr) => {
      if (error) {
        reject(Object.assign(error, { stdout, stderr }));
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
};

export const binaryAvailable = async (bin: string, versionArg = '--version'): Promise<boolean> => {
  try {
    await runFile(bin, [versionArg]);
    return true;
  } catch {
    return false;
  }
};

export const resolveLocalBinary = (relativePath: string, fallbackName: string): string => {
  const localPath = path.join(process.cwd(), relativePath);
  return fs.existsSync(localPath) ? localPath : fallbackName;
};

/**
 * Only http(s) URLs pointing at youtube.com/youtu.be watch/shorts/live
 * paths are accepted — this is the single choke point that keeps
 * arbitrary strings out of the yt-dlp download step.
 */
export const isValidYoutubeUrl = (value: string): boolean => {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') return false;

  const host = url.hostname.toLowerCase().replace(/^www\./, '');
  if (host === 'youtu.be') {
    return /^\/[A-Za-z0-9_-]{6,}$/.test(url.pathname);
  }
  if (host === 'youtube.com' || host === 'm.youtube.com') {
    return (
      url.pathname === '/watch' ||
      /^\/shorts\/[A-Za-z0-9_-]{6,}$/.test(url.pathname) ||
      /^\/live\/[A-Za-z0-9_-]{6,}$/.test(url.pathname) ||
      /^\/embed\/[A-Za-z0-9_-]{6,}$/.test(url.pathname)
    );
  }
  return false;
};

/**
 * Strips characters that have special meaning inside an ffmpeg filtergraph
 * (colon, single quote, backslash, comma, percent) so text supplied by a
 * user (watermark text, etc.) can't break out of the `drawtext` filter or
 * chain in extra filters. Keeps the text readable rather than escaping it,
 * since perfect ffmpeg filter-escaping is fragile and easy to get wrong.
 */
export const sanitizeForDrawtext = (text: string, maxLength = 100): string => {
  return text
    .replace(/[:'\\,%]/g, '')
    .replace(/[\r\n]+/g, ' ')
    .trim()
    .slice(0, maxLength);
};

/** Accepts only a 3 or 6-digit hex color, with or without a leading '#'. */
export const isValidHexColor = (value: string): boolean => /^#?[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(value);
