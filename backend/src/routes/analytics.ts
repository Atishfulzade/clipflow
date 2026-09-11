import { Router } from 'express';
import { getCreatorAnalytics } from '../controllers/analytics';

const router = Router();

router.get('/', getCreatorAnalytics);

export default router;
