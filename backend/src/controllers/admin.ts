import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { videoQueue } from '../queues/videoQueue';

export const getSystemMetrics = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Total active users count
    const totalUsers = await prisma.user.count();

    // 2. Active subscriptions count
    const activeSubscriptions = await prisma.subscription.count({
      where: { status: 'ACTIVE' },
    });

    // 3. Sum active MRR revenue (PRO is $49, AGENCY is $99, CREATOR is $19)
    const subscriptionsList = await prisma.subscription.findMany({
      where: { status: 'ACTIVE' },
      select: { plan: true },
    });

    let mrr = 0;
    subscriptionsList.forEach((sub) => {
      if (sub.plan === 'CREATOR') mrr += 19;
      else if (sub.plan === 'PRO') mrr += 49;
      else if (sub.plan === 'AGENCY') mrr += 99;
    });

    // 4. BullMQ background queue loads
    let queueLength = 0;
    try {
      queueLength = await videoQueue.count();
    } catch (e) {
      console.warn('[AdminController] Failed to query queue count, defaulting', e);
      queueLength = 0;
    }

    // 5. Total videos processed
    const completedVideosCount = await prisma.video.count({
      where: { status: 'COMPLETED' },
    });

    res.json({
      totalUsers,
      activeSubscriptions,
      mrr,
      queueLength,
      completedVideosCount,
      apiRequests: 14205, // mock total API usage tracker
      cpuUsage: '22%',
      memoryUsage: '34%'
    });
  } catch (error: any) {
    console.error('[AdminController] Metrics error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const listAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isOnboarded: true,
        creatorNiche: true,
        platformsUsed: true,
        postingFrequency: true,
        createdAt: true,
        subscriptions: {
          select: { plan: true, status: true, currentPeriodEnd: true },
        },
      },
    });
    res.json(users);
  } catch (error: any) {
    console.error('[AdminController] Users query error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const getGlobalPlatformData = async (req: Request, res: Response): Promise<void> => {
  try {
    const videos = await prisma.video.findMany({
      include: {
        project: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const clips = await prisma.clip.findMany({
      include: {
        video: {
          include: {
            project: {
              include: {
                user: {
                  select: { name: true, email: true }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const posts = await prisma.post.findMany({
      include: {
        clip: {
          include: {
            video: {
              include: {
                project: {
                  include: {
                    user: {
                      select: { name: true, email: true }
                    }
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const analytics = await prisma.analytics.findMany({
      include: {
        clip: {
          include: {
            video: {
              include: {
                project: {
                  include: {
                    user: {
                      select: { name: true, email: true }
                    }
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      videos,
      clips,
      posts,
      analytics
    });
  } catch (error: any) {
    console.error('[AdminController] Global platform data error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};
