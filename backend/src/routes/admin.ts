import { Router } from 'express';
import { getSystemMetrics, listAllUsers, getGlobalPlatformData } from '../controllers/admin';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Require OWNER authentication for all admin endpoints
router.use(authenticateToken as any, requireAdmin as any);

// Retrieve global server MRR and worker loads
router.get('/metrics', getSystemMetrics);

// Retrieve general subscriber profiles list
router.get('/users', listAllUsers);

// Retrieve all global platform data (videos, clips, posts, analytics)
router.get('/platform-data', getGlobalPlatformData);

export default router;
