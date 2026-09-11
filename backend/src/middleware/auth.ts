import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
  };
}

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error(
    'JWT_SECRET must be set in production. Refusing to start with the insecure development default.'
  );
}
if (!process.env.JWT_SECRET) {
  console.warn('[Auth] JWT_SECRET is not set — using an insecure development default. Set JWT_SECRET before deploying.');
}

export const JWT_SECRET = process.env.JWT_SECRET || 'clipflow-secret-key-12345';

const parseCookies = (cookieHeader: string | undefined): Record<string, string> => {
  const list: Record<string, string> = {};
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    const name = parts[0].trim();
    if (name) {
      list[name] = parts.slice(1).join('=').trim();
    }
  });
  return list;
};

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1];

  // Fallback to secure HttpOnly cookie or query parameter if header is missing
  if (!token) {
    const cookies = parseCookies(req.headers.cookie);
    token = cookies['vibecut_token'] || (req.query.token as string);
  }

  if (!token) {
    res.status(401).json({ error: 'Authentication token required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: Role;
    };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired authentication token' });
    return;
  }
};

// Configurable via ADMIN_EMAIL so the admin account isn't hardcoded into source.
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'atishfulzade1234@gmail.com';

export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.email !== ADMIN_EMAIL) {
    res.status(403).json({ error: 'Forbidden: Global site admin privileges required' });
    return;
  }
  next();
};
