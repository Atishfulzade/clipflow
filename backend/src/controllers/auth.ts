import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role, Plan, SubscriptionStatus } from '@prisma/client';
import { AuthenticatedRequest, JWT_SECRET } from '../middleware/auth';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import axios from 'axios';
import { createNotification } from '../services/notifications';

const TOKEN_EXPIRY = '7d';

const setAuthCookie = (res: Response, token: string) => {
  res.cookie('vibecut_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
};

const claimPendingInvitation = async (userId: string, email: string) => {
  const pendingInvite = await prisma.invitation.findFirst({
    where: { email, status: 'PENDING' }
  });
  if (pendingInvite) {
    // Update user role to match the invited role and set isOnboarded to true
    await prisma.user.update({
      where: { id: userId },
      data: { 
        role: pendingInvite.role, 
        isOnboarded: true 
      }
    });

    // Add them to the team workspace with the designated role and project binding
    await prisma.teamMember.upsert({
      where: {
        teamId_userId: {
          teamId: pendingInvite.teamId,
          userId: userId
        }
      },
      update: { 
        role: pendingInvite.role,
        projectId: pendingInvite.projectId
      },
      create: {
        teamId: pendingInvite.teamId,
        userId: userId,
        role: pendingInvite.role,
        projectId: pendingInvite.projectId
      }
    });

    // Mark the invitation as accepted
    await prisma.invitation.update({
      where: { id: pendingInvite.id },
      data: { status: 'ACCEPTED' }
    });

    // Fetch project name if bound
    let projectName = 'General Workspace';
    if (pendingInvite.projectId) {
      const project = await prisma.project.findUnique({ where: { id: pendingInvite.projectId } });
      if (project) {
        projectName = project.name;
      }
    }

    // Create real-time notification for inviter (owner)
    await createNotification(
      pendingInvite.invitedById,
      'Invitation Accepted',
      `${pendingInvite.inviteeName || email} has joined your team workspace!`,
      'SUCCESS'
    );

    // Create real-time notification for invitee (collaborator)
    await createNotification(
      userId,
      'Welcome to the Team',
      `You have successfully joined the team workspace and been granted access to project "${projectName}".`,
      'SUCCESS'
    );
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    let user;
    let userRole: Role = Role.OWNER;
    const passwordHash = await bcrypt.hash(password, 10);

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      if (existingUser.passwordHash) {
        res.status(400).json({ error: 'User with this email already exists' });
        return;
      }

      // Claiming an invited user who has a placeholder record
      const teamMembership = await prisma.teamMember.findFirst({
        where: { userId: existingUser.id }
      });

      userRole = teamMembership?.role || Role.EDITOR;

      user = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          passwordHash,
          name: name || existingUser.name || email.split('@')[0],
          role: userRole,
          isOnboarded: true,
        },
      });
    } else {
      // Check if there is a pending invitation for this email
      const pendingInvite = await prisma.invitation.findFirst({
        where: { email, status: 'PENDING' }
      });

      if (pendingInvite) {
        userRole = pendingInvite.role;
        user = await prisma.user.create({
          data: {
            email,
            passwordHash,
            name: name || email.split('@')[0],
            role: userRole,
            isOnboarded: true, // Bypasses onboarding
          },
        });

        // Create team membership
        await prisma.teamMember.create({
          data: {
            teamId: pendingInvite.teamId,
            userId: user.id,
            role: userRole,
            projectId: pendingInvite.projectId,
          },
        });

        // Mark invitation as accepted
        await prisma.invitation.update({
          where: { id: pendingInvite.id },
          data: { status: 'ACCEPTED' }
        });
      } else {
        // Standard self-registered owner
        user = await prisma.user.create({
          data: {
            email,
            passwordHash,
            name: name || email.split('@')[0],
            role: userRole,
            isOnboarded: false,
          },
        });

        const team = await prisma.team.create({
          data: {
            name: `${user.name || 'My'}'s Team`,
          },
        });

        await prisma.teamMember.create({
          data: {
            teamId: team.id,
            userId: user.id,
            role: userRole,
          },
        });

        await prisma.project.create({
          data: {
            name: 'Default Workspace',
            description: 'Your default project workspace for viral highlights.',
            userId: user.id,
            teamId: team.id,
          },
        });

        await prisma.subscription.create({
          data: {
            userId: user.id,
            stripeSubscriptionId: `sub_mock_${Date.now()}`,
            plan: Plan.FREE,
            status: SubscriptionStatus.ACTIVE,
            priceId: 'price_mock_free',
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });
      }
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    setAuthCookie(res, token);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isOnboarded: user.isOnboarded,
        teams: await prisma.teamMember.findMany({
          where: { userId: user.id },
          select: {
            teamId: true,
            role: true,
            team: { select: { name: true } }
          }
        }),
      },
    });
  } catch (error: any) {
    console.error('[AuthController] Register error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    await claimPendingInvitation(user.id, user.email);
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } }) || user;

    const token = jwt.sign(
      { id: dbUser.id, email: dbUser.email, role: dbUser.role },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    setAuthCookie(res, token);

    res.json({
      token,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
        isOnboarded: dbUser.isOnboarded,
        teams: await prisma.teamMember.findMany({
          where: { userId: dbUser.id },
          select: {
            teamId: true,
            role: true,
            team: { select: { name: true } }
          }
        }),
      },
    });
  } catch (error: any) {
    console.error('[AuthController] Login error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, accessToken } = req.body;

    if (!code && !accessToken) {
      res.status(400).json({ error: 'Authorization code or access token is required' });
      return;
    }

    let email: string;
    let name: string;

    // Fast-path bypass for Playwright E2E testing
    if (code === 'mock_test_code' || accessToken === 'mock_test_token') {
      email = 'google-user@clipflow.ai';
      name = 'Google User';
    } else if (accessToken) {
      try {
        // Fetch user profile from Google's userinfo API using the access token
        const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const payload = response.data;
        if (!payload || !payload.email) {
          res.status(400).json({ error: 'Invalid Google userinfo payload' });
          return;
        }
        email = payload.email;
        name = payload.name || email.split('@')[0];
      } catch (err: any) {
        console.error('[AuthController] Google OAuth access token verification failed:', err.response?.data || err.message);
        res.status(400).json({ error: 'Google OAuth access token verification failed' });
        return;
      }
    } else {
      const googleClientId = process.env.GOOGLE_CLIENT_ID || 'dummy-client-id';
      const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || 'dummy-client-secret';
      const googleRedirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google-callback';

      const oauth2Client = new OAuth2Client(
        googleClientId,
        googleClientSecret,
        googleRedirectUri
      );

      try {
        // Exchange authorization code for tokens
        const { tokens } = await oauth2Client.getToken(code!);
        
        if (!tokens.id_token) {
          res.status(400).json({ error: 'No ID token returned from Google' });
          return;
        }

        // Verify the ID token signature and extract user claims
        const ticket = await oauth2Client.verifyIdToken({
          idToken: tokens.id_token,
          audience: googleClientId,
        });
        
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
          res.status(400).json({ error: 'Invalid Google token payload' });
          return;
        }
        
        email = payload.email;
        name = payload.name || email.split('@')[0];
      } catch (err: any) {
        console.error('[AuthController] Google OAuth verification failed:', err);
        res.status(400).json({ error: 'Google OAuth token verification failed' });
        return;
      }
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Check if there is a pending invitation for this email
      const pendingInvite = await prisma.invitation.findFirst({
        where: { email, status: 'PENDING' }
      });

      if (pendingInvite) {
        const userRole = pendingInvite.role;
        user = await prisma.user.create({
          data: {
            email,
            name: name || email.split('@')[0],
            role: userRole,
            isOnboarded: true, // Bypasses onboarding
          },
        });

        // Create team membership
        await prisma.teamMember.create({
          data: {
            teamId: pendingInvite.teamId,
            userId: user.id,
            role: userRole,
            projectId: pendingInvite.projectId,
          },
        });

        // Mark invitation as accepted
        await prisma.invitation.update({
          where: { id: pendingInvite.id },
          data: { status: 'ACCEPTED' }
        });
      } else {
        // Register new user via Google - default to OWNER and isOnboarded true
        user = await prisma.user.create({
          data: {
            email,
            name: name || email.split('@')[0],
            role: Role.OWNER,
            isOnboarded: true,
          },
        });

        const team = await prisma.team.create({
          data: {
            name: `${user.name}'s Team`,
          },
        });

        await prisma.teamMember.create({
          data: {
            teamId: team.id,
            userId: user.id,
            role: Role.OWNER,
          },
        });

        await prisma.project.create({
          data: {
            name: 'Default Workspace',
            description: 'Your default project workspace for viral highlights.',
            userId: user.id,
            teamId: team.id,
          },
        });

        await prisma.subscription.create({
          data: {
            userId: user.id,
            stripeSubscriptionId: `sub_mock_${Date.now()}`,
            plan: Plan.FREE,
            status: SubscriptionStatus.ACTIVE,
            priceId: 'price_mock_free',
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });
      }
    } else {
      // User exists. Sync their User.role with their TeamMember.role if they belong to any team/company.
      const membership = await prisma.teamMember.findFirst({
        where: { userId: user.id },
      });

      if (membership) {
        if (user.role !== membership.role || !user.isOnboarded) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { 
              role: membership.role,
              isOnboarded: true,
            },
          });
        }
      } else {
        // Exists but has no team. Assign OWNER and create a team.
        if (user.role !== Role.OWNER || !user.isOnboarded) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { 
              role: Role.OWNER,
              isOnboarded: true,
            },
          });
        }

        const team = await prisma.team.create({
          data: {
            name: `${user.name || user.email.split('@')[0]}'s Team`,
          },
        });

        await prisma.teamMember.create({
          data: {
            teamId: team.id,
            userId: user.id,
            role: Role.OWNER,
          },
        });

        await prisma.project.create({
          data: {
            name: 'Default Workspace',
            description: 'Your default project workspace for viral highlights.',
            userId: user.id,
            teamId: team.id,
          },
        });

        await prisma.subscription.create({
          data: {
            userId: user.id,
            stripeSubscriptionId: `sub_mock_${Date.now()}`,
            plan: Plan.FREE,
            status: SubscriptionStatus.ACTIVE,
            priceId: 'price_mock_free',
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });
      }
    }

    await claimPendingInvitation(user.id, user.email);
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } }) || user;

    const token = jwt.sign(
      { id: dbUser.id, email: dbUser.email, role: dbUser.role },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    setAuthCookie(res, token);

    res.json({
      token,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
        isOnboarded: dbUser.isOnboarded,
        teams: await prisma.teamMember.findMany({
          where: { userId: dbUser.id },
          select: {
            teamId: true,
            role: true,
            team: { select: { name: true } }
          }
        }),
      },
    });
  } catch (error: any) {
    console.error('[AuthController] Google auth error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie('vibecut_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
    res.json({ message: 'Logged out successfully' });
  } catch (error: any) {
    console.error('[AuthController] Logout error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isOnboarded: true,
        creatorNiche: true,
        platformsUsed: true,
        postingFrequency: true,
        teams: {
          select: {
            teamId: true,
            role: true,
            team: {
              select: {
                name: true
              }
            }
          }
        }
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error: any) {
    console.error('[AuthController] GetMe error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { creatorNiche, platformsUsed, postingFrequency } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        creatorNiche,
        platformsUsed,
        postingFrequency,
        isOnboarded: true,
      },
    });

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isOnboarded: user.isOnboarded,
      creatorNiche: user.creatorNiche,
      platformsUsed: user.platformsUsed,
      postingFrequency: user.postingFrequency,
    });
  } catch (error: any) {
    console.error('[AuthController] UpdateProfile error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // For security, do not disclose if the user exists or not
      res.json({ message: 'If a matching account exists, a password reset link has been sent.' });
      return;
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 3600000); // 1 hour expiration

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry,
      },
    });

    // Configure nodemailer transporter
    const isMock = !process.env.SMTP_HOST;
    let transporter;
    if (!isMock) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: 'windows',
      });
    }

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    const mailOptions = {
      from: process.env.SMTP_FROM || '"ClipFlow.ai Support" <support@clipflow.ai>',
      to: email,
      subject: 'Reset your ClipFlow.ai Password',
      text: `Hello,\n\nYou requested to reset your password. Please click the link below to set a new password:\n\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you did not request this, please ignore this email.`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 12px; background-color: #fafafa;">
          <h2 style="color: #7c3aed; margin-top: 0;">Reset your Password</h2>
          <p style="color: #27272a; font-size: 14px; line-height: 1.5;">Hello,</p>
          <p style="color: #27272a; font-size: 14px; line-height: 1.5;">We received a request to reset the password for your ClipFlow.ai account. Click the button below to set a new password:</p>
          <div style="margin: 24px 0;">
            <a href="${resetUrl}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 14px;">Reset Password</a>
          </div>
          <p style="color: #71717a; font-size: 12px; line-height: 1.5; margin-bottom: 0;">This link will expire in 1 hour. If you did not make this request, you can safely ignore this email.</p>
        </div>
      `,
    };

    try {
      if (isMock) {
        const info = await transporter.sendMail(mailOptions);
        console.log('\n==================================================');
        console.log(`[MOCK EMAIL SENT] Password Reset for: ${email}`);
        console.log(`Reset Link: ${resetUrl}`);
        console.log('Envelope:', info.envelope);
        console.log('==================================================\n');
      } else {
        await transporter.sendMail(mailOptions);
      }
    } catch (mailError) {
      console.error(`[MAIL ERROR] Failed to send password reset email to ${email}:`, mailError);
      console.log('\n==================================================');
      console.log(`[FALLBACK EMAIL LOG] Password Reset for: ${email}`);
      console.log(`Reset Link: ${resetUrl}`);
      console.log('==================================================\n');
    }

    res.json({ message: 'If a matching account exists, a password reset link has been sent.' });
  } catch (error: any) {
    console.error('[AuthController] Forgot password error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ error: 'Token and new password are required' });
      return;
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      res.status(400).json({ error: 'Invalid or expired password reset token.' });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    res.json({ message: 'Password has been reset successfully.' });
  } catch (error: any) {
    console.error('[AuthController] Reset password error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const getInvitation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;

    if (!token) {
      res.status(400).json({ error: 'Token is required' });
      return;
    }

    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        team: {
          select: { name: true }
        },
        invitedBy: {
          select: { name: true, email: true }
        },
        project: {
          select: { name: true }
        }
      }
    });

    if (!invitation || invitation.status !== 'PENDING') {
      res.status(404).json({ error: 'Invitation not found or already accepted' });
      return;
    }

    res.json(invitation);
  } catch (error: any) {
    console.error('[AuthController] GetInvitation error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const claimInvitation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password, name } = req.body;

    if (!token || !password) {
      res.status(400).json({ error: 'Token and password are required' });
      return;
    }

    const invitation = await prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation || invitation.status !== 'PENDING') {
      res.status(400).json({ error: 'Invalid or expired invitation token' });
      return;
    }

    const { email, teamId, role } = invitation;

    let user = await prisma.user.findUnique({ where: { email } });
    const passwordHash = await bcrypt.hash(password, 10);

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          name: name || user.name || email.split('@')[0],
          role: role,
          isOnboarded: true,
        }
      });
    } else {
      user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          name: name || email.split('@')[0],
          role: role,
          isOnboarded: true,
        }
      });
    }

    await prisma.teamMember.upsert({
      where: {
        teamId_userId: {
          teamId,
          userId: user.id
        }
      },
      update: { 
        role,
        projectId: invitation.projectId
      },
      create: {
        teamId,
        userId: user.id,
        role,
        projectId: invitation.projectId
      }
    });

    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: 'ACCEPTED' }
    });

    const jwtToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    setAuthCookie(res, jwtToken);

    res.json({
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isOnboarded: user.isOnboarded,
        teams: [
          {
            teamId,
            role,
            team: await prisma.team.findUnique({ where: { id: teamId }, select: { name: true } })
          }
        ]
      }
    });
  } catch (error: any) {
    console.error('[AuthController] ClaimInvitation error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};
