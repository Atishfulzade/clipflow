import { Worker, Job } from 'bullmq';
import { connectionOptions } from '../config/redis';
import { videoQueue, VideoJobData } from '../queues/videoQueue';
import { prisma } from '../lib/prisma';
import { aiService } from '../services/ai';
import { storageService } from '../services/storage';
import { videoService } from '../services/video';
import { runFile, binaryAvailable, resolveLocalBinary, isValidYoutubeUrl } from '../lib/exec';
import path from 'path';
import fs from 'fs';

export const videoWorker = new Worker<VideoJobData>(
  'video-processing',
  async (job: Job<VideoJobData>) => {
    const { videoId, youtubeUrl, videoPath } = job.data;
    console.log(`[Worker] Started processing video: ${videoId}`);

    try {
      // Step 1: Update status to TRANSCRIBING
      await prisma.video.update({
        where: { id: videoId },
        data: { status: 'TRANSCRIBING' },
      });

      // Step 2: Establish local media path
      let localMediaPath = videoPath || '';
      
      if (youtubeUrl && !localMediaPath) {
        if (!isValidYoutubeUrl(youtubeUrl)) {
          throw new Error(`Refusing to download: "${youtubeUrl}" is not a recognized YouTube URL.`);
        }

        console.log(`[Worker] Downloading YouTube stream: ${youtubeUrl}`);
        const mockDlPath = path.join(__dirname, `../../temp-${videoId}.mp4`);
        const tempDir = path.dirname(mockDlPath);
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }

        // Try downloading using yt-dlp (checking local build first)
        const ytDlpBin = resolveLocalBinary('bin/yt-dlp.exe', 'yt-dlp');
        const hasYtDlp = await binaryAvailable(ytDlpBin, '--version');

        if (!hasYtDlp) {
          throw new Error('yt-dlp binary is not installed or available on this system.');
        }

        console.log(`[Worker] Executing stream download...`);
        try {
          await runFile(ytDlpBin, ['-f', 'mp4', '-o', mockDlPath, youtubeUrl]);
          console.log(`[Worker] yt-dlp download completed.`);
        } catch (err: any) {
          console.error(`[Worker] yt-dlp download failed: ${err.stderr || err.message}`);
          throw err;
        }

        localMediaPath = mockDlPath;
      }

      if (!fs.existsSync(localMediaPath)) {
        throw new Error(`Local media file not found for processing: ${localMediaPath}`);
      }

      // Step 3: Speech to Text (Gemini API)
      console.log(`[Worker] Stripping audio track with FFmpeg to optimize payload size...`);
      const localAudioPath = path.join(
        path.dirname(localMediaPath),
        `audio-${videoId}.mp3`
      );
      
      await videoService.extractAudioTrack(localMediaPath, localAudioPath);

      console.log(`[Worker] Extracting speech timestamps...`);
      const transcription = await aiService.transcribeVideo(localAudioPath);
      
      // Clean up local temp audio file
      if (fs.existsSync(localAudioPath)) {
        fs.unlinkSync(localAudioPath);
      }

      // Save transcript to DB
      await prisma.transcript.create({
        data: {
          videoId,
          text: transcription.text,
          segments: transcription.segments as any,
        },
      });

      // Step 4: AI Highlights & Hooks Analysis
      console.log(`[Worker] Running virality hook evaluation...`);
      await prisma.video.update({
        where: { id: videoId },
        data: { status: 'ANALYZING' },
      });

      const clips = await aiService.detectClips(transcription.text, transcription.segments);
      
      // Step 5: Render and Trim each identified Clip
      console.log(`[Worker] Identified ${clips.length} viral segments. Launching FFmpeg renderer...`);
      
      for (let i = 0; i < clips.length; i++) {
        const detected = clips[i];
        
        // Create initial pending clip object
        const dbClip = await prisma.clip.create({
          data: {
            videoId,
            title: detected.title,
            start: detected.start,
            end: detected.end,
            viralityScore: detected.viralityScore,
            retentionScore: detected.retentionScore,
            confidenceScore: detected.confidenceScore,
            transcriptText: detected.transcriptText,
            captionsStatus: 'PENDING',
          },
        });

        const localClipPath = path.join(
          path.dirname(localMediaPath), 
          `clip-${dbClip.id}.mp4`
        );

        try {
          // Crop and render clip with FFmpeg
          await videoService.extractClip({
            inputPath: localMediaPath,
            outputPath: localClipPath,
            start: detected.start,
            end: detected.end,
            cropTo916: true,
            watermarkText: 'CLIPFLOW.AI',
          });

          // Upload rendered clip to storage
          const fileKey = `clips/${videoId}/clip-${dbClip.id}.mp4`;
          const clipUrl = await storageService.uploadFile(localClipPath, fileKey);

          // Update clip record with status and url
          await prisma.clip.update({
            where: { id: dbClip.id },
            data: {
              clipUrl,
              captionsStatus: 'COMPLETED',
            },
          });

          // Clean up local temp clip file
          if (fs.existsSync(localClipPath)) {
            fs.unlinkSync(localClipPath);
          }
        } catch (clipErr) {
          console.error(`[Worker] Failed rendering clip: ${dbClip.id}`, clipErr);
          await prisma.clip.update({
            where: { id: dbClip.id },
            data: { captionsStatus: 'FAILED' },
          });
        }
      }

      // Step 6: Complete job
      console.log(`[Worker] Process completed for video: ${videoId}`);
      await prisma.video.update({
        where: { id: videoId },
        data: { status: 'COMPLETED' },
      });

      // Cleanup local original media download temp file
      if (youtubeUrl && fs.existsSync(localMediaPath)) {
        fs.unlinkSync(localMediaPath);
      }
    } catch (err: any) {
      console.error(`[Worker] Processing failure on video: ${videoId}`, err);
      
      await prisma.video.update({
        where: { id: videoId },
        data: { status: 'FAILED' },
      });
      
      throw err; // Fail BullMQ job
    }
  },
  { connection: connectionOptions }
);

videoWorker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} completed successfully.`);
});

videoWorker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err);
});
