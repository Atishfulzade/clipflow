import { Router } from 'express';
import { listPosts, schedulePost, publishPostImmediately, cancelPost } from '../controllers/posts';

const router = Router();

router.get('/', listPosts);
router.post('/schedule', schedulePost);
router.post('/:id/publish', publishPostImmediately);
router.delete('/:id', cancelPost);

export default router;
