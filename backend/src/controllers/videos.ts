import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { videoQueue } from '../queues/videoQueue';
import { checkProjectAccess } from '../lib/access';
import { isValidYoutubeUrl } from '../lib/exec';
import { AuthenticatedRequest } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'upload-' + uniqueSuffix + path.extname(file.originalname));
  }
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit for local uploads
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
    if (!allowedExtensions.includes(ext)) {
      return cb(new Error('Only video files are allowed'));
    }
    cb(null, true);
  }
});

export const uploadVideoFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, title } = req.body;
    if (!projectId) {
      res.status(400).json({ error: 'projectId is required' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'No video file uploaded' });
      return;
    }

    const ownerId = (req as AuthenticatedRequest).user?.id || '';
    // Verify project exists and user has access
    const hasAccess = await checkProjectAccess(projectId, ownerId);
    if (!hasAccess) {
      res.status(403).json({ error: 'Access denied or project not found' });
      return;
    }

    const videoPath = path.resolve(req.file.path);
    const videoUrl = `/uploads/${path.basename(req.file.path)}`;

    // Create video record with status PENDING
    const video = await prisma.video.create({
      data: {
        projectId,
        title: title || req.file.originalname.replace(/\.[^/.]+$/, ""),
        videoUrl,
        status: 'PENDING',
      },
    });

    // Dispatch background processing job
    await videoQueue.add(
      `process-video-${video.id}`,
      {
        videoId: video.id,
        videoPath,
      },
      { jobId: video.id } // Set explicit job ID to prevent duplicate jobs
    );

    res.status(202).json({
      message: 'Video file uploaded and processing scheduled successfully',
      video,
    });
  } catch (error: any) {
    console.error('[VideosController] Upload error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const importVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, youtubeUrl, videoUrl, title } = req.body;

    if (!projectId) {
      res.status(400).json({ error: 'projectId is required' });
      return;
    }

    const targetYoutubeUrl = youtubeUrl || (videoUrl ? 'https://youtube.com/watch?v=mock-upload' : null);
    if (!targetYoutubeUrl) {
      res.status(400).json({ error: 'youtubeUrl or videoUrl is required' });
      return;
    }

    if (youtubeUrl && !isValidYoutubeUrl(youtubeUrl)) {
      res.status(400).json({ error: 'youtubeUrl must be a valid youtube.com or youtu.be URL' });
      return;
    }

    const ownerId = (req as AuthenticatedRequest).user?.id || '';
    // Verify project exists and user has access
    const hasAccess = await checkProjectAccess(projectId, ownerId);
    if (!hasAccess) {
      res.status(403).json({ error: 'Access denied or project not found' });
      return;
    }

    // Create video record with status PENDING
    const video = await prisma.video.create({
      data: {
        projectId,
        title: title || 'Imported Video Highlights',
        youtubeUrl: targetYoutubeUrl,
        videoUrl: videoUrl || null,
        status: 'PENDING',
      },
    });

    // Dispatch background processing job
    await videoQueue.add(
      `process-video-${video.id}`,
      {
        videoId: video.id,
        youtubeUrl: targetYoutubeUrl,
      },
      { jobId: video.id } // Set explicit job ID to prevent duplicate jobs
    );

    res.status(202).json({
      message: 'Video import scheduled successfully',
      video,
    });
  } catch (error: any) {
    console.error('[VideosController] Import error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const listVideos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.query;
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

    const filter: any = {
      projectId: {
        in: allowedProjectIds
      }
    };
    if (projectId) {
      if (!allowedProjectIds.includes(projectId as string)) {
        res.status(403).json({ error: 'Access denied to this project' });
        return;
      }
      filter.projectId = projectId as string;
    }

    const videos = await prisma.video.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' },
      include: {
        clips: true,
      },
    });

    res.json(videos);
  } catch (error: any) {
    console.error('[VideosController] List error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const getVideoDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user?.id || '';

    // Get the video first to see its projectId
    const video = await prisma.video.findUnique({
      where: { id },
      include: {
        project: true
      }
    });

    if (!video) {
      res.status(404).json({ error: 'Video not found' });
      return;
    }

    // Verify access
    const hasAccess = await checkProjectAccess(video.projectId, userId);
    if (!hasAccess) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Return the full details with transcript and clips
    const fullVideo = await prisma.video.findUnique({
      where: { id },
      include: {
        transcript: true,
        clips: {
          orderBy: { viralityScore: 'desc' },
        },
      },
    });

    res.json(fullVideo);
  } catch (error: any) {
    console.error('[VideosController] Details error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};
