'use strict';

/**
 * authorize middleware factory
 * Usage: authorize(['ADMIN', 'SUPER_ADMIN'])
 * Must be called AFTER authenticate middleware.
 */
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required.',
      });
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: `Access denied. Required roles: ${roles.join(', ')}`,
      });
    }

    next();
  };
};

/**
 * isEventOrganizer — verifies current user is an organizer of the specified event
 * Reads event ID from req.params.id or req.params.eventId
 */
const isEventOrganizer = async (req, res, next) => {
  try {
    const prisma = require('../config/prisma');
    const eventId = req.params.id || req.params.eventId;

    const organizer = await prisma.eventOrganizer.findUnique({
      where: { eventId_userId: { eventId, userId: req.user.id } },
    });

    // Also allow SUPER_ADMIN and ADMIN
    if (!organizer && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You are not an organizer of this event.',
      });
    }

    req.organizerRole = organizer?.role;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * isPrimaryOrganizer — verifies current user is THE primary organizer
 */
const isPrimaryOrganizer = async (req, res, next) => {
  try {
    const prisma = require('../config/prisma');
    const eventId = req.params.id || req.params.eventId;

    const organizer = await prisma.eventOrganizer.findUnique({
      where: { eventId_userId: { eventId, userId: req.user.id } },
    });

    if (!organizer || organizer.role !== 'PRIMARY_ORGANIZER') {
      if (!['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'Only the primary organizer can perform this action.',
        });
      }
    }
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * isTeamLeader — verifies current user is the leader of the specified team
 */
const isTeamLeader = async (req, res, next) => {
  try {
    const prisma = require('../config/prisma');
    const teamId = req.params.id || req.params.teamId;

    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) {
      return res.status(404).json({ success: false, error: 'Not Found', message: 'Team not found.' });
    }

    if (team.leaderId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only the team leader can perform this action.',
      });
    }

    req.team = team;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * isTeamMember — verifies current user is a member (or leader) of the team
 */
const isTeamMember = async (req, res, next) => {
  try {
    const prisma = require('../config/prisma');
    const teamId = req.params.id || req.params.teamId;

    const membership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId: req.user.id } },
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You are not a member of this team.',
      });
    }

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { authorize, isEventOrganizer, isPrimaryOrganizer, isTeamLeader, isTeamMember };
