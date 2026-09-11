import { Queue } from 'bullmq';
import { connectionOptions } from '../config/redis';

export interface PublishJobData {
  postId: string;
}

export const publishQueue = new Queue<PublishJobData>('post-publishing', {
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
