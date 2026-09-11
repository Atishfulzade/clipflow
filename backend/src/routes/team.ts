import { Router } from 'express';
import { 
  inviteMember, 
  listMembers,
  updateMember,
  removeMember,
  cancelInvitation,
  approveInvitation,
  getReceivedInvitations,
  acceptReceivedInvitation,
  declineReceivedInvitation
} from '../controllers/team';
import { requireRole } from '../middleware/rbac';
import { Role } from '@prisma/client';

const router = Router();

// Secures creation of invites to OWNER role only
router.post('/invite', requireRole([Role.OWNER]) as any, inviteMember as any);

// Secures viewing of member lists to OWNER, MANAGER, and EDITOR
router.get('/members', requireRole([Role.OWNER, Role.MANAGER, Role.EDITOR]) as any, listMembers as any);

// Update member role or project access (restricted to OWNER)
router.put('/members/:id', requireRole([Role.OWNER]) as any, updateMember as any);

// Remove member from team (restricted to OWNER)
router.delete('/members/:id', requireRole([Role.OWNER]) as any, removeMember as any);

// Cancel/delete pending invitation (restricted to OWNER)
router.delete('/invitations/:id', requireRole([Role.OWNER]) as any, cancelInvitation as any);

// Instantly approve/activate a pending invitation (restricted to OWNER)
router.post('/invitations/:id/approve', requireRole([Role.OWNER]) as any, approveInvitation as any);

// Received invitations for currently logged in collaborator
router.get('/invitations/received', getReceivedInvitations as any);
router.post('/invitations/:id/accept', acceptReceivedInvitation as any);
router.post('/invitations/:id/decline', declineReceivedInvitation as any);

export default router;
