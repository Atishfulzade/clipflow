import { Worker, Job } from 'bullmq';
import { connectionOptions } from '../config/redis';
import { PublishJobData } from '../queues/publishQueue';
import { prisma } from '../lib/prisma';
import { publisherService } from '../services/publisher';

export const publishWorker = new Worker<PublishJobData>(
  'post-publishing',
  async (job: Job<PublishJobData>) => {
    const { postId } = job.data;
    console.log(`[PublishWorker] Starting publishing job for Post: ${postId}`);

    try {
      const result = await publisherService.publishPost(postId);
      console.log(`[PublishWorker] Successfully published Post: ${postId}. Destination: ${result.postUrl}`);
    } catch (err: any) {
      console.error(`[PublishWorker] Failed to publish Post: ${postId}`, err);
      
      await prisma.post.update({
        where: { id: postId },
        data: {
          status: 'FAILED',
          errorLog: err.message || String(err),
        },
      });

      throw err;
    }
  },
  { connection: connectionOptions }
);

publishWorker.on('completed', (job) => {
  console.log(`[PublishWorker] Job ${job.id} completed successfully.`);
});

publishWorker.on('failed', (job, err) => {
  console.error(`[PublishWorker] Job ${job?.id} failed:`, err);
});
