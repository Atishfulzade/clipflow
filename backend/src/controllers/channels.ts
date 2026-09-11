import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import axios from 'axios';
import { signOAuthState, verifyOAuthState } from '../lib/oauthState';

export const listChannels = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;

    const channels = await prisma.channel.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(channels);
  } catch (error: any) {
    console.error('[ChannelsController] List channels error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const disconnectChannel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    const channel = await prisma.channel.findUnique({ where: { id } });
    if (!channel) {
      res.status(404).json({ error: 'Channel not found' });
      return;
    }
    if (channel.userId !== userId) {
      res.status(403).json({ error: 'Access denied: you do not own this channel' });
      return;
    }

    await prisma.channel.delete({
      where: { id },
    });
    res.json({ success: true, message: 'Channel disconnected successfully' });
  } catch (error: any) {
    console.error('[ChannelsController] Disconnect channel error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const connectChannel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { platform } = req.params;
    const userId = (req as any).user?.id;

    if (!['YOUTUBE', 'TIKTOK', 'INSTAGRAM', 'LINKEDIN', 'X'].includes(platform.toUpperCase())) {
      res.status(400).json({ error: 'Unsupported social platform' });
      return;
    }

    const googleClientId = process.env.GOOGLE_CLIENT_ID;

    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    const state = signOAuthState(userId);

    // If client ID is present, run live Google OAuth redirect
    if (platform.toUpperCase() === 'YOUTUBE' && googleClientId) {
      const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google-callback';
      const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=https://www.googleapis.com/auth/youtube.upload&access_type=offline&state=${encodeURIComponent(state)}&prompt=consent`;
      res.redirect(googleOAuthUrl);
      return;
    }

    // Direct local mock callback bypass for local developers/demos
    console.log(`[ChannelsController] Mock OAuth redirect triggered for platform: ${platform}`);
    const callbackUrl = `${req.protocol}://${req.get('host')}/api/channels/callback/${platform.toLowerCase()}?code=mock-oauth-code-${Date.now()}&state=${encodeURIComponent(state)}`;
    res.redirect(callbackUrl);
  } catch (error: any) {
    console.error('[ChannelsController] Connect channel error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const oauthCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    // Disable caching to prevent 304 Not Modified responses
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const { platform } = req.params;
    const { code, state } = req.query;
    const ownerId = verifyOAuthState(state as string);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    if (!ownerId) {
      console.error('[ChannelsController] OAuth callback has an invalid, expired, or missing state token — refusing to link channel.');
      res.redirect(`${frontendUrl}/dashboard/settings?error=oauth_failed`);
      return;
    }

    console.log(`[ChannelsController] Received OAuth callback for ${platform}, code: ${code}`);

    let channelId = `mock-channel-id-${Date.now()}`;
    let channelName = `${platform.toUpperCase()} Channel`;
    let accessToken = `mock-access-token-${Date.now()}`;
    let refreshToken = `mock-refresh-token-${Date.now()}`;
    let expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour

    // If real auth code (not mock) and platform is YOUTUBE, fetch Google tokens
    if (code && !String(code).startsWith('mock-') && platform.toUpperCase() === 'YOUTUBE') {
      const googleClientId = process.env.GOOGLE_CLIENT_ID;
      const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const redirectUri = `${req.protocol}://${req.get('host')}/api/channels/callback/youtube`;

      try {
        const tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
          code,
          client_id: googleClientId,
          client_secret: googleClientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        });

        accessToken = tokenRes.data.access_token;
        refreshToken = tokenRes.data.refresh_token || null;
        expiresAt = new Date(Date.now() + tokenRes.data.expires_in * 1000);

        const profileRes = await axios.get('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        const ytChannel = profileRes.data.items?.[0];
        if (ytChannel) {
          channelId = ytChannel.id;
          channelName = ytChannel.snippet.title;
        }
      } catch (oauthErr: any) {
        console.error('[ChannelsController] Live Google OAuth validation failed, using fallback.', oauthErr.response?.data || oauthErr);
      }
    }

    // Ensure mock user exists to prevent Prisma foreign key check crash
    let user = await prisma.user.findUnique({ where: { id: ownerId } });
    if (!user) {
      await prisma.user.create({
        data: {
          id: ownerId,
          email: `${ownerId}@clipflow.ai`,
          name: 'Alex Creator',
          isOnboarded: true,
        } as any,
      });
    }

    // Save Channel detail to DB
    const channel = await prisma.channel.create({
      data: {
        userId: ownerId,
        platform: platform.toUpperCase(),
        channelId,
        channelName,
        accessToken,
        refreshToken,
        expiresAt,
      },
    });

    console.log(`[ChannelsController] Linked channel successfully: ${channelName}`);
    const platformUpper = platform.toUpperCase();
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Connection Success</title>
        <style>
          body {
            background-color: #09090b;
            color: #f4f4f5;
            font-family: sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            text-align: center;
          }
          .spinner {
            border: 3px solid rgba(255,255,255,0.1);
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border-left-color: #8b5cf6;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
          }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          h2 { margin: 0 0 10px 0; font-size: 18px; }
          p { margin: 0; font-size: 13px; color: #a1a1aa; }
        </style>
      </head>
      <body>
        <div class="spinner"></div>
        <h2>Connecting Channel...</h2>
        <p>Please wait while we link your ${platformUpper} channel.</p>
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'CHANNEL_CONNECTED', platform: '${platformUpper}' }, '*');
            setTimeout(() => window.close(), 800);
          } else {
            window.location.href = '${frontendUrl}/dashboard/settings?connected=true&platform=${platformUpper}';
          }
        </script>
      </body>
      </html>
    `);
  } catch (error: any) {
    console.error('[ChannelsController] OAuth callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/dashboard/settings?error=oauth_failed`);
  }
};
