import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { Role } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    isAdmin: boolean;
  };
}

export const requireRole = (allowedRoles: Role[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      const teamId = req.headers['x-team-id'] as string || req.body.teamId || req.query.teamId as string;

      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      if (!teamId) {
        res.status(400).json({ error: 'x-team-id header or teamId parameter is required' });
        return;
      }

      // Check if user is member of team and has allowed role
      const member = await prisma.teamMember.findUnique({
        where: {
          teamId_userId: {
            teamId,
            userId,
          },
        },
      });

      if (!member || !allowedRoles.includes(member.role)) {
        res.status(403).json({ 
          error: `Forbidden: Insufficient privileges. Allowed roles are: ${allowedRoles.join(', ')}` 
        });
        return;
      }

      next();
    } catch (error: any) {
      console.error('[RBAC Middleware] Authorization check error:', error);
      res.status(500).json({ error: 'Authorization verification failed' });
    }
  };
};
