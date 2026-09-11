import { Router } from 'express';
import { 
  register, 
  login, 
  googleAuth, 
  logout, 
  getMe, 
  updateProfile, 
  forgotPassword, 
  resetPassword,
  getInvitation,
  claimInvitation
} from '../controllers/auth';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/logout', authenticateToken as any, logout as any);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', authenticateToken as any, getMe as any);
router.post('/profile', authenticateToken as any, updateProfile as any);

// Team invitation claim routes
router.get('/invitations/:token', getInvitation);
router.post('/invitations/claim', claimInvitation);

export default router;
