import { Router } from 'express';
import { createProject, listProjects } from '../controllers/projects';
import { importVideo, listVideos, getVideoDetails, upload, uploadVideoFile } from '../controllers/videos';
import { handleStripeWebhook } from '../controllers/webhooks';
import { authenticateToken } from '../middleware/auth';
import teamRouter from './team';
import adminRouter from './admin';
import analyticsRouter from './analytics';
import billingRouter from './billing';
import channelsRouter from './channels';
import postsRouter from './posts';
import clipsRouter from './render';
import presetsRouter from './presets';
import authRouter from './auth';
import notificationsRouter from './notifications';

const router = Router();

// Auth (unauthenticated)
router.use('/auth', authRouter);

// Webhooks (unauthenticated)
router.post('/webhooks/stripe', handleStripeWebhook);

// Channels (selectively authenticated inside its router)
router.use('/channels', channelsRouter);

// Protect all subsequent API routes
router.use(authenticateToken);

// Projects
router.post('/projects', createProject);
router.get('/projects', listProjects);

// Videos
router.post('/videos', importVideo);
router.post('/videos/upload', upload.single('video'), uploadVideoFile);
router.get('/videos', listVideos);
router.get('/videos/:id', getVideoDetails);

// Sub routers
router.use('/team', teamRouter);
router.use('/admin', adminRouter);
router.use('/analytics', analyticsRouter);
router.use('/billing', billingRouter);
router.use('/posts', postsRouter);
router.use('/clips', clipsRouter);
router.use('/presets', presetsRouter);
router.use('/notifications', notificationsRouter);

export default router;
