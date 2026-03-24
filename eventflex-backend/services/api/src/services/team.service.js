'use strict';
const { v4: uuidv4 } = require('uuid');
const prisma = require('../config/prisma');
const { generateTeamCode } = require('../utils/slugify');
const { logger } = require('../utils/logger');
const emailService = require('./email.service');
const notificationService = require('./notification.service');
const config = require('../config');

/**
 * Create a team for an event
 */
const createTeam = async ({ eventId, name, leaderId }) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw Object.assign(new Error('Event not found.'), { statusCode: 404 });

  // Ensure user is registered for the event
  const registration = await prisma.registration.findFirst({
    where: { eventId, userId: leaderId, status: { not: 'CANCELLED' } },
  });
  if (!registration) throw Object.assign(new Error('You must be registered for the event to create a team.'), { statusCode: 403 });

  // Check if already in a team
  const existingMembership = await prisma.teamMember.findFirst({
    where: { userId: leaderId, team: { eventId } },
  });
  if (existingMembership) throw Object.assign(new Error('You are already in a team for this event.'), { statusCode: 409 });

  const teamCode = generateTeamCode();
  const inviteToken = uuidv4();
  const inviteExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const team = await prisma.$transaction(async (tx) => {
    const newTeam = await tx.team.create({
      data: {
        eventId,
        name,
        teamCode,
        leaderId,
        maxMembers: event.maxTeamSize,
        inviteToken,
        inviteExpiresAt,
      },
    });
    await tx.teamMember.create({
      data: { teamId: newTeam.id, userId: leaderId, role: 'LEADER' },
    });
    return newTeam;
  });

  logger.info(`Team created: ${team.id} for event: ${eventId}`);
  return team;
};

/**
 * Join a team using an invite token
 */
const joinTeam = async (inviteToken, userId) => {
  const team = await prisma.team.findUnique({
    where: { inviteToken },
    include: { members: true },
  });
  if (!team) throw Object.assign(new Error('Invalid invite link.'), { statusCode: 404 });
  if (team.inviteExpiresAt < new Date()) throw Object.assign(new Error('Invite link has expired.'), { statusCode: 400 });
  if (team.isLocked) throw Object.assign(new Error('This team is locked.'), { statusCode: 400 });

  // Check capacity
  if (team.currentMemberCount >= team.maxMembers) {
    throw Object.assign(new Error('Team is full.'), { statusCode: 400 });
  }

  // Check if already a member
  const existing = team.members.find((m) => m.userId === userId);
  if (existing) throw Object.assign(new Error('Already in this team.'), { statusCode: 409 });

  // Ensure user is registered for the event
  const registration = await prisma.registration.findFirst({
    where: { eventId: team.eventId, userId, status: { not: 'CANCELLED' } },
  });
  if (!registration) throw Object.assign(new Error('You must be registered for the event to join a team.'), { statusCode: 403 });

  await prisma.$transaction([
    prisma.teamMember.create({ data: { teamId: team.id, userId, role: 'MEMBER', invitedBy: team.leaderId } }),
    prisma.team.update({ where: { id: team.id }, data: { currentMemberCount: { increment: 1 } } }),
    // Link registration to team
    prisma.registration.update({ where: { id: registration.id }, data: { teamId: team.id } }),
  ]);

  logger.info(`User ${userId} joined team ${team.id}`);
  return team;
};

/**
 * Remove a member from a team (team leader only)
 */
const removeMember = async (teamId, memberId, requesterId) => {
  if (memberId === requesterId) throw Object.assign(new Error('Leader cannot remove themselves.'), { statusCode: 400 });

  await prisma.$transaction([
    prisma.teamMember.deleteMany({ where: { teamId, userId: memberId } }),
    prisma.team.update({ where: { id: teamId }, data: { currentMemberCount: { decrement: 1 } } }),
  ]);
};

/**
 * Transfer team leadership
 */
const transferLeadership = async (teamId, currentLeaderId, newLeaderId) => {
  await prisma.$transaction([
    prisma.teamMember.updateMany({ where: { teamId, userId: currentLeaderId }, data: { role: 'MEMBER' } }),
    prisma.teamMember.updateMany({ where: { teamId, userId: newLeaderId }, data: { role: 'LEADER' } }),
    prisma.team.update({ where: { id: teamId }, data: { leaderId: newLeaderId } }),
  ]);
};

/**
 * Send team invite to email
 */
const inviteByEmail = async (teamId, leaderId, emails) => {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: { event: { select: { title: true } }, leader: { select: { fullName: true } } },
  });

  const inviteUrl = `${config.frontendUrl}/teams/join/${team.inviteToken}`;

  for (const email of emails) {
    await emailService.queueEmail('teamInvite', email, {
      leaderName: team.leader.fullName,
      teamName: team.name,
      eventName: team.event.title,
      inviteUrl,
    });
  }
};

/**
 * Get team chat messages (paginated)
 */
const getMessages = async (teamId, { page = 1, limit = 50 } = {}) => {
  const skip = (page - 1) * limit;
  return prisma.teamChatMessage.findMany({
    where: { teamId, isDeleted: false },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit,
    include: { sender: { select: { id: true, fullName: true, avatarUrl: true } } },
  });
};

/**
 * Post a chat message
 */
const postMessage = async (teamId, senderId, { message, messageType = 'TEXT', fileUrl = null }) => {
  if (message.length > config.maxTeamChatLength) {
    throw Object.assign(new Error(`Message too long (max ${config.maxTeamChatLength} chars).`), { statusCode: 400 });
  }
  return prisma.teamChatMessage.create({
    data: { teamId, senderId, message, messageType, fileUrl },
    include: { sender: { select: { id: true, fullName: true, avatarUrl: true } } },
  });
};

module.exports = { createTeam, joinTeam, removeMember, transferLeadership, inviteByEmail, getMessages, postMessage };
