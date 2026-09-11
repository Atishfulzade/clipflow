import { Router } from 'express';
import { listPresets, createPreset, deletePreset } from '../controllers/presets';

const router = Router();

router.get('/', listPresets);
router.post('/', createPreset);
router.delete('/:id', deletePreset);

export default router;
