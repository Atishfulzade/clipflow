import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../middleware/auth';

interface OAuthStatePayload {
  purpose: 'channel-connect';
  userId: string;
}

/**
 * Produces a short-lived, signed `state` value for the OAuth connect flow.
 * Using a signed token (rather than the raw userId) prevents a caller from
 * hitting the unauthenticated `/callback/:platform` endpoint directly with
 * an arbitrary `state=<victim-user-id>` to link a channel onto someone
 * else's account.
 */
export const signOAuthState = (userId: string): string => {
  const payload: OAuthStatePayload = { purpose: 'channel-connect', userId };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '10m' });
};

/** Returns the userId the state was issued for, or null if invalid/expired. */
export const verifyOAuthState = (state: string | undefined | null): string | null => {
  if (!state) return null;
  try {
    const decoded = jwt.verify(state, JWT_SECRET) as OAuthStatePayload;
    if (decoded.purpose !== 'channel-connect' || !decoded.userId) return null;
    return decoded.userId;
  } catch {
    return null;
  }
};
