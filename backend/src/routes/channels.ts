import { Router } from 'express';
import { listChannels, connectChannel, oauthCallback, disconnectChannel } from '../controllers/channels';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, listChannels);
router.delete('/:id', authenticateToken, disconnectChannel);
router.get('/connect/:platform', authenticateToken, connectChannel);
router.get('/callback/:platform', oauthCallback);

export default router;
