import { Router } from 'express';
import { renderClipWithCaptions, getClipMetadata } from '../controllers/render';

const router = Router();

router.post('/:id/render', renderClipWithCaptions);
router.get('/:id/metadata', getClipMetadata);

export default router;
