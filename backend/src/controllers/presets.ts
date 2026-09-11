import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth';
import { isValidHexColor } from '../lib/exec';

const createPresetSchema = z.object({
  name: z.string().min(1, 'Preset name is required'),
  captionStyle: z.string().min(1, 'Caption style is required'),
  brandColor: z.string().refine(isValidHexColor, 'Brand color must be a hex code, e.g. #8b5cf6'),
  watermarkText: z.string().max(100).nullable().optional(),
  enableEmojis: z.boolean().default(true),
  enableProgressBar: z.boolean().default(true),
  enableWatermark: z.boolean().default(true),
  captionFont: z.string().default('Arial'),
  captionPosition: z.string().default('bottom'),
});

export const listPresets = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthenticatedRequest).user?.id || '';

    const presets = await prisma.brandPreset.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(presets);
  } catch (error: any) {
    console.error('[PresetsController] List presets error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const createPreset = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = createPresetSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.flatten().fieldErrors });
      return;
    }

    const data = parseResult.data;
    const ownerId = (req as AuthenticatedRequest).user?.id;
    if (!ownerId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const preset = await prisma.brandPreset.create({
      data: {
        name: data.name,
        userId: ownerId,
        captionStyle: data.captionStyle,
        brandColor: data.brandColor,
        watermarkText: data.watermarkText || null,
        enableEmojis: data.enableEmojis,
        enableProgressBar: data.enableProgressBar,
        enableWatermark: data.enableWatermark,
        captionFont: data.captionFont,
        captionPosition: data.captionPosition,
      },
    });

    res.status(201).json(preset);
  } catch (error: any) {
    console.error('[PresetsController] Create preset error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const deletePreset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user?.id;

    // Check if preset exists
    const preset = await prisma.brandPreset.findUnique({ where: { id } });
    if (!preset) {
      res.status(404).json({ error: 'Preset not found' });
      return;
    }

    if (preset.userId !== userId) {
      res.status(403).json({ error: 'Access denied: you do not own this preset' });
      return;
    }

    await prisma.brandPreset.delete({
      where: { id },
    });

    res.json({ success: true, message: 'Preset deleted successfully' });
  } catch (error: any) {
    console.error('[PresetsController] Delete preset error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};
