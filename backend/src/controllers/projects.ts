import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export const createProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Project name is required' });
      return;
    }

    const ownerId = (req as AuthenticatedRequest).user?.id;
    if (!ownerId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Find the user's active team workspace to bind the project
    const teamMember = await prisma.teamMember.findFirst({
      where: { userId: ownerId }
    });

    const project = await prisma.project.create({
      data: {
        name,
        description,
        userId: ownerId,
        teamId: teamMember?.teamId || null,
      },
    });

    res.status(201).json(project);
  } catch (error: any) {
    console.error('[ProjectsController] Create error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const listProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthenticatedRequest).user?.id || '';
    
    // Find all team IDs the user is a member of to show shared projects
    const teamMemberships = await prisma.teamMember.findMany({
      where: { userId }
    });

    // Build query conditions based on memberships and project restrictions
    const conditions: any[] = [{ userId }];

    for (const membership of teamMemberships) {
      if (membership.projectId) {
        // Restricted to a single project in this team
        conditions.push({
          id: membership.projectId,
          teamId: membership.teamId
        });
      } else {
        // Can access any project in this team
        conditions.push({
          teamId: membership.teamId
        });
      }
    }

    const projects = await prisma.project.findMany({
      where: {
        OR: conditions
      },
      orderBy: { createdAt: 'desc' },
      include: {
        videos: {
          select: { id: true, status: true },
        },
      },
    });

    res.json(projects);
  } catch (error: any) {
    console.error('[ProjectsController] List error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};
