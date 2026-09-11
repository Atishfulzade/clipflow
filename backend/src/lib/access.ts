import { prisma } from './prisma';
import { Role } from '@prisma/client';

/**
 * Returns true if `userId` may access `projectId` — either as the direct
 * owner, or as a team member of the project's team (scoped to a specific
 * project if the membership is project-restricted).
 */
export const checkProjectAccess = async (projectId: string, userId: string): Promise<boolean> => {
  if (!userId || !projectId) return false;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return false;
  if (project.userId === userId) return true;
  if (!project.teamId) return false;

  const teamMember = await prisma.teamMember.findFirst({
    where: {
      teamId: project.teamId,
      userId,
    },
  });

  if (!teamMember) return false;
  if (teamMember.projectId && teamMember.projectId !== projectId) return false;

  return true;
};

/** Roles allowed to manage team membership (invite/remove/change roles). */
const TEAM_MANAGER_ROLES: Role[] = [Role.OWNER, Role.MANAGER];

/**
 * Returns the caller's TeamMember record for `teamId`, or null if they are
 * not a member of that team at all.
 */
export const getTeamMembership = async (teamId: string, userId: string) => {
  if (!userId || !teamId) return null;
  return prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } },
  });
};

/** True if `userId` is a member (any role) of `teamId`. */
export const isTeamMember = async (teamId: string, userId: string): Promise<boolean> => {
  const membership = await getTeamMembership(teamId, userId);
  return !!membership;
};

/** True if `userId` holds a management-capable role (OWNER/MANAGER) on `teamId`. */
export const isTeamManager = async (teamId: string, userId: string): Promise<boolean> => {
  const membership = await getTeamMembership(teamId, userId);
  return !!membership && TEAM_MANAGER_ROLES.includes(membership.role);
};
