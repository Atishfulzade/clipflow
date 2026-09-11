import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { publishQueue } from '../queues/publishQueue';
import { publisherService } from '../services/publisher';
import { checkProjectAccess } from '../lib/access';
import { AuthenticatedRequest } from '../middleware/auth';

export const listPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthenticatedRequest).user?.id || '';

    // Find all team memberships to determine accessible projects
    const teamMemberships = await prisma.teamMember.findMany({
      where: { userId }
    });

    const conditions: any[] = [{ userId }];
    for (const membership of teamMemberships) {
      if (membership.projectId) {
        conditions.push({ id: membership.projectId, teamId: membership.teamId });
      } else {
        conditions.push({ teamId: membership.teamId });
      }
    }

    const allowedProjects = await prisma.project.findMany({
      where: {
        OR: conditions
      },
      select: { id: true }
    });
    const allowedProjectIds = allowedProjects.map(p => p.id);
    
    const posts = await prisma.post.findMany({
      where: {
        clip: {
          video: {
            projectId: {
              in: allowedProjectIds
            }
          }
        },
      },
      include: {
        clip: true,
      },
      orderBy: { scheduledTime: 'asc' },
    });
    res.json(posts);
  } catch (error: any) {
    console.error('[PostsController] List posts error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const schedulePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clipId, platform, scheduledTime, title, description, hashtags } = req.body;
    const userId = (req as AuthenticatedRequest).user?.id || '';

    if (!clipId || !platform || !scheduledTime) {
      res.status(400).json({ error: 'clipId, platform, and scheduledTime are required' });
      return;
    }

    const scheduledDate = new Date(scheduledTime);
    if (isNaN(scheduledDate.getTime())) {
      res.status(400).json({ error: 'Invalid scheduledTime format' });
      return;
    }

    // Verify clip exists and user has access to its project
    const clip = await prisma.clip.findUnique({
      where: { id: clipId },
      include: {
        video: {
          select: { projectId: true }
        }
      }
    });

    if (!clip) {
      res.status(404).json({ error: 'Clip not found' });
      return;
    }

    const hasAccess = await checkProjectAccess(clip.video.projectId, userId);
    if (!hasAccess) {
      res.status(403).json({ error: 'Access denied to schedule post for this clip' });
      return;
    }

    const post = await prisma.post.create({
      data: {
        clipId,
        platform,
        status: 'SCHEDULED',
        scheduledTime: scheduledDate,
        title: title || '',
        description: description || '',
        hashtags: hashtags || [],
      },
    });

    const delay = Math.max(0, scheduledDate.getTime() - Date.now());
    console.log(`[PostsController] Scheduling BullMQ post publish job in ${delay}ms for Post: ${post.id}`);
    
    await publishQueue.add(
      `publish-post-${post.id}`,
      { postId: post.id },
      { delay }
    );

    res.status(201).json(post);
  } catch (error: any) {
    console.error('[PostsController] Schedule post error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const publishPostImmediately = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user?.id || '';
    
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        clip: {
          include: {
            video: {
              select: { projectId: true }
            }
          }
        }
      }
    });

    if (!post) {
      res.status(404).json({ error: 'Scheduled post not found' });
      return;
    }

    const hasAccess = await checkProjectAccess(post.clip.video.projectId, userId);
    if (!hasAccess) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    console.log(`[PostsController] Triggering immediate publishing for Post: ${id}`);
    await publisherService.publishPost(id);
    
    const updatedPost = await prisma.post.findUnique({
      where: { id },
      include: { clip: true },
    });
    
    res.json(updatedPost);
  } catch (error: any) {
    console.error('[PostsController] Immediate publishing error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const cancelPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user?.id || '';

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        clip: {
          include: {
            video: {
              select: { projectId: true }
            }
          }
        }
      }
    });

    if (!post) {
      res.status(404).json({ error: 'Scheduled post not found' });
      return;
    }

    const hasAccess = await checkProjectAccess(post.clip.video.projectId, userId);
    if (!hasAccess) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    await prisma.post.delete({
      where: { id },
    });
    res.json({ success: true, message: 'Scheduled post cancelled successfully' });
  } catch (error: any) {
    console.error('[PostsController] Cancel post error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};
