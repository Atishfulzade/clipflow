import { Queue } from 'bullmq';
import { connectionOptions } from '../config/redis';

export interface VideoJobData {
  videoId: string;
  youtubeUrl?: string;
  videoPath?: string;
}

export const videoQueue = new Queue<VideoJobData>('video-processing', {
  connection: connectionOptions,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});
