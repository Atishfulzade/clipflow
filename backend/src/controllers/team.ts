import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { Role } from '@prisma/client';
import { createNotification } from '../services/notifications';
import { AuthenticatedRequest } from '../middleware/auth';
import { isTeamMember, isTeamManager } from '../lib/access';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export const inviteMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const { teamId, email, role, projectId, inviteeName } = req.body;
    const inviterId = (req as AuthenticatedRequest).user?.id;

    if (!teamId || !email || !inviteeName) {
      res.status(400).json({ error: 'teamId, email, and inviteeName are required parameters' });
      return;
    }

    // Verify team exists
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) {
      res.status(404).json({ error: `Team not found: ${teamId}` });
      return;
    }

    // Verify inviter exists
    if (!inviterId) {
      res.status(401).json({ error: 'Unauthorized: Inviter session not found' });
      return;
    }

    const inviterIsManager = await isTeamManager(teamId, inviterId);
    if (!inviterIsManager) {
      res.status(403).json({ error: 'Forbidden: Only team owners or managers can invite collaborators' });
      return;
    }

    const inviter = await prisma.user.findUnique({ where: { id: inviterId } });

    // Check if there is already a pending invitation for this email in this team
    const existingInvite = await prisma.invitation.findFirst({
      where: {
        teamId,
        email,
        status: 'PENDING',
      },
    });

    if (existingInvite) {
      res.status(400).json({ error: 'A pending invitation already exists for this email address' });
      return;
    }

    // Check if the user is already a member of the team
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      const existingMember = await prisma.teamMember.findFirst({
        where: {
          teamId,
          userId: existingUser.id,
        },
      });
      if (existingMember) {
        res.status(400).json({ error: 'User is already an active member of this team workspace' });
        return;
      }
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex');
    const memberRole = (role as Role) || Role.EDITOR;

    // Create Invitation
    const invitation = await prisma.invitation.create({
      data: {
        email,
        teamId,
        projectId: projectId || null,
        role: memberRole,
        invitedById: inviterId,
        token,
        inviteeName,
        status: 'PENDING',
      },
      include: {
        project: {
          select: { name: true }
        }
      }
    });

    // Send email with invite link
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

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const inviteUrl = `${frontendUrl}/claim-invite?token=${token}`;
    const inviterName = inviter?.name || inviter?.email || 'A team member';
    const projectName = invitation.project?.name || 'VibeCut Project';

    const mailOptions = {
      from: process.env.SMTP_FROM || '"VibeCut Support" <support@vibecut.ai>',
      to: email,
      subject: `Invitation to collaborate on ${projectName}`,
      text: `Hello ${inviteeName},\n\n${inviterName} has invited you to collaborate as a ${memberRole} on the project "${projectName}".\n\nPlease click the link below to accept the invitation and set up your account:\n\n${inviteUrl}\n\nIf you did not expect this invitation, please ignore this email.`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 12px; background-color: #fafafa;">
          <h2 style="color: #7c3aed; margin-top: 0;">Collaborate on VibeCut.ai</h2>
          <p style="color: #27272a; font-size: 14px; line-height: 1.5;">Hello <strong>${inviteeName}</strong>,</p>
          <p style="color: #27272a; font-size: 14px; line-height: 1.5;">
            <strong>${inviterName}</strong> has invited you to join their workspace team as a <strong>${memberRole}</strong> to collaborate on the project <strong>"${projectName}"</strong>.
          </p>
          <div style="margin: 24px 0;">
            <a href="${inviteUrl}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 14px;">Accept Invitation</a>
          </div>
          <p style="color: #71717a; font-size: 12px; line-height: 1.5; margin-bottom: 0;">If you did not expect this invitation, you can safely ignore this email.</p>
        </div>
      `,
    };

    try {
      if (isMock) {
        const info = await transporter.sendMail(mailOptions);
        console.log('\n==================================================');
        console.log(`[MOCK EMAIL SENT] Team Invitation for: ${email}`);
        console.log(`Invitee Name: ${inviteeName}`);
        console.log(`Invited By: ${inviterName}`);
        console.log(`Project Bound: ${projectName}`);
        console.log(`Role Assigned: ${memberRole}`);
        console.log(`Claim Link: ${inviteUrl}`);
        console.log('Envelope:', info.envelope);
        console.log('==================================================\n');
      } else {
        await transporter.sendMail(mailOptions);
      }
    } catch (mailError) {
      console.error(`[MAIL ERROR] Failed to send team invitation email to ${email}:`, mailError);
      console.log('\n==================================================');
      console.log(`[FALLBACK EMAIL LOG] Team Invitation for: ${email}`);
      console.log(`Invitee Name: ${inviteeName}`);
      console.log(`Invited By: ${inviterName}`);
      console.log(`Project Bound: ${projectName}`);
      console.log(`Role Assigned: ${memberRole}`);
      console.log(`Claim Link: ${inviteUrl}`);
      console.log('==================================================\n');
    }

    // Create real-time notification for owner
    await createNotification(
      inviterId,
      'Invitation Sent',
      `Sent invitation to ${inviteeName} (${email}) for project "${projectName}".`,
      'SUCCESS'
    );

    // If the invited user already exists, send them a notification as well
    if (existingUser) {
      await createNotification(
        existingUser.id,
        'Workspace Invitation',
        `You have been invited by ${inviterName} to join their team workspace for project "${projectName}".`,
        'INFO'
      );
    }

    res.status(201).json({
      message: 'Collaborator invited successfully',
      invitation: {
        id: invitation.id,
        email: invitation.email,
        inviteeName: invitation.inviteeName,
        role: invitation.role,
        status: invitation.status,
      },
    });
  } catch (error: any) {
    console.error('[TeamController] Invite error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const listMembers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { teamId } = req.query;
    const requesterId = (req as AuthenticatedRequest).user?.id;

    if (!teamId) {
      res.status(400).json({ error: 'teamId query parameter is required' });
      return;
    }

    if (!requesterId || !(await isTeamMember(teamId as string, requesterId))) {
      res.status(403).json({ error: 'Forbidden: you are not a member of this team' });
      return;
    }

    const members = await prisma.teamMember.findMany({
      where: { teamId: teamId as string },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
        project: {
          select: {
            name: true,
          },
        },
      },
    });

    const acceptedInvites = await prisma.invitation.findMany({
      where: { teamId: teamId as string, status: 'ACCEPTED' },
      include: {
        invitedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    const membersWithInviter = members.map((mem) => {
      const invite = acceptedInvites.find(
        (i) => i.email.toLowerCase() === mem.user.email.toLowerCase()
      );
      return {
        ...mem,
        invitedBy: invite
          ? {
              name: invite.invitedBy.name,
              email: invite.invitedBy.email,
            }
          : null,
      };
    });

    const pendingInvites = await prisma.invitation.findMany({
      where: { teamId: teamId as string, status: 'PENDING' },
      include: {
        invitedBy: {
          select: {
            name: true,
            email: true,
          },
        },
        project: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      members: membersWithInviter,
      pendingInvites,
    });
  } catch (error: any) {
    console.error('[TeamController] List error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const updateMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role, projectId } = req.body;
    const requesterId = (req as AuthenticatedRequest).user?.id;

    const target = await prisma.teamMember.findUnique({ where: { id } });
    if (!target) {
      res.status(404).json({ error: 'Team member not found' });
      return;
    }
    if (!requesterId || !(await isTeamManager(target.teamId, requesterId))) {
      res.status(403).json({ error: 'Forbidden: only team owners or managers can update members' });
      return;
    }

    const member = await prisma.teamMember.update({
      where: { id },
      data: {
        role: role || undefined,
        projectId: projectId === '' ? null : projectId || undefined,
      },
      include: {
        user: { select: { name: true, email: true } },
      }
    });

    res.json({ success: true, member });
  } catch (error: any) {
    console.error('[TeamController] UpdateMember error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const removeMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const requesterId = (req as AuthenticatedRequest).user?.id;

    const target = await prisma.teamMember.findUnique({ where: { id } });
    if (!target) {
      res.status(404).json({ error: 'Team member not found' });
      return;
    }
    if (!requesterId || !(await isTeamManager(target.teamId, requesterId))) {
      res.status(403).json({ error: 'Forbidden: only team owners or managers can remove members' });
      return;
    }

    await prisma.teamMember.delete({
      where: { id },
    });

    res.json({ success: true, message: 'Member removed successfully' });
  } catch (error: any) {
    console.error('[TeamController] RemoveMember error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const cancelInvitation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const requesterId = (req as AuthenticatedRequest).user?.id;

    const invitation = await prisma.invitation.findUnique({ where: { id } });
    if (!invitation) {
      res.status(404).json({ error: 'Invitation not found' });
      return;
    }

    const canCancel =
      !!requesterId &&
      (invitation.invitedById === requesterId || (await isTeamManager(invitation.teamId, requesterId)));
    if (!canCancel) {
      res.status(403).json({ error: 'Forbidden: only the inviter or a team owner/manager can cancel this invitation' });
      return;
    }

    await prisma.invitation.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Invitation cancelled successfully' });
  } catch (error: any) {
    console.error('[TeamController] CancelInvitation error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const approveInvitation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const invitation = await prisma.invitation.findUnique({
      where: { id },
      include: {
        project: { select: { name: true } }
      }
    });

    if (!invitation || invitation.status !== 'PENDING') {
      res.status(400).json({ error: 'Invalid or already accepted invitation' });
      return;
    }

    const { email, teamId, role, projectId, inviteeName } = invitation;
    const projectName = invitation.project?.name || 'General Workspace';

    // 1. Check if user already exists
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: inviteeName || email.split('@')[0],
          role: role,
          isOnboarded: true, // Bypasses onboarding
        }
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          role,
          isOnboarded: true,
        }
      });
    }

    // 2. Create/upsert TeamMember record
    await prisma.teamMember.upsert({
      where: {
        teamId_userId: {
          teamId,
          userId: user.id
        }
      },
      update: { 
        role,
        projectId
      },
      create: {
        teamId,
        userId: user.id,
        role,
        projectId
      }
    });

    // 3. Mark invitation as accepted
    await prisma.invitation.update({
      where: { id },
      data: { status: 'ACCEPTED' }
    });

    // Create real-time notification for inviter (owner)
    await createNotification(
      invitation.invitedById,
      'Invitation Accepted',
      `${inviteeName || email} has joined your team workspace!`,
      'SUCCESS'
    );

    // Create real-time notification for invitee (collaborator)
    await createNotification(
      user.id,
      'Welcome to the Team',
      `You have successfully joined the team workspace and been granted access to project "${projectName}".`,
      'SUCCESS'
    );

    res.json({ success: true, message: 'Invitation approved and collaborator activated successfully' });
  } catch (error: any) {
    console.error('[TeamController] ApproveInvitation error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const getReceivedInvitations = async (req: Request, res: Response): Promise<void> => {
  try {
    const userEmail = (req as AuthenticatedRequest).user?.email;

    if (!userEmail) {
      res.status(401).json({ error: 'Unauthorized: User email not found' });
      return;
    }

    const invitations = await prisma.invitation.findMany({
      where: {
        email: userEmail,
        status: 'PENDING',
      },
      include: {
        team: {
          select: {
            name: true,
          },
        },
        invitedBy: {
          select: {
            name: true,
            email: true,
          },
        },
        project: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(invitations);
  } catch (error: any) {
    console.error('[TeamController] getReceivedInvitations error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const acceptReceivedInvitation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user?.id;
    const userEmail = (req as AuthenticatedRequest).user?.email;

    if (!userId || !userEmail) {
      res.status(401).json({ error: 'Unauthorized: Session not found' });
      return;
    }

    const invitation = await prisma.invitation.findUnique({
      where: { id },
      include: {
        project: { select: { name: true } }
      }
    });

    if (!invitation || invitation.status !== 'PENDING') {
      res.status(400).json({ error: 'Invalid or already accepted invitation' });
      return;
    }

    // Security check: ensure this invitation was actually sent to the logged-in user
    if (invitation.email.toLowerCase() !== userEmail.toLowerCase()) {
      res.status(403).json({ error: 'Forbidden: You can only accept invitations sent to your email address' });
      return;
    }

    const { teamId, role, projectId, inviteeName } = invitation;
    const projectName = invitation.project?.name || 'General Workspace';

    // 1. Update user role if needed (bypassing onboarding since they are joining a workspace)
    await prisma.user.update({
      where: { id: userId },
      data: {
        isOnboarded: true,
      }
    });

    // 2. Create/upsert TeamMember record
    await prisma.teamMember.upsert({
      where: {
        teamId_userId: {
          teamId,
          userId
        }
      },
      update: { 
        role,
        projectId
      },
      create: {
        teamId,
        userId,
        role,
        projectId
      }
    });

    // 3. Mark invitation as accepted
    await prisma.invitation.update({
      where: { id },
      data: { status: 'ACCEPTED' }
    });

    // Create real-time notification for inviter (owner)
    await createNotification(
      invitation.invitedById,
      'Invitation Accepted',
      `${inviteeName || userEmail} has joined your team workspace!`,
      'SUCCESS'
    );

    // Create real-time notification for invitee (collaborator)
    await createNotification(
      userId,
      'Welcome to the Team',
      `You have successfully joined the team workspace and been granted access to project "${projectName}".`,
      'SUCCESS'
    );

    res.json({ success: true, message: 'Invitation accepted and collaborator activated successfully' });
  } catch (error: any) {
    console.error('[TeamController] acceptReceivedInvitation error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const declineReceivedInvitation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userEmail = (req as AuthenticatedRequest).user?.email;

    if (!userEmail) {
      res.status(401).json({ error: 'Unauthorized: Session not found' });
      return;
    }

    const invitation = await prisma.invitation.findUnique({
      where: { id }
    });

    if (!invitation) {
      res.status(404).json({ error: 'Invitation not found' });
      return;
    }

    // Security check: ensure this invitation was actually sent to the logged-in user
    if (invitation.email.toLowerCase() !== userEmail.toLowerCase()) {
      res.status(403).json({ error: 'Forbidden: You can only decline invitations sent to your email address' });
      return;
    }

    // Delete the invitation. Deleting keeps DB clean, matches cancelInvitation
    await prisma.invitation.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Invitation declined successfully' });
  } catch (error: any) {
    console.error('[TeamController] declineReceivedInvitation error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};
