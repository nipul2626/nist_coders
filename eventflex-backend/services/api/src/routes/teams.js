'use strict';
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');
const prisma = require('../config/prisma');
const teamService = require('../services/team.service');
const { isTeamLeader, isTeamMember } = require('../middleware/authorize');

// POST /teams
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { eventId, name } = req.body;
    if (!eventId || !name) return res.status(422).json({ success: false, error: 'ValidationError', message: 'eventId and name are required.' });
    const team = await teamService.createTeam({ eventId, name, leaderId: req.user.id });
    res.status(201).json({ success: true, data: team });
  } catch (err) { next(err); }
});

// GET /teams/:id
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const team = await prisma.team.findUnique({
      where: { id: req.params.id },
      include: {
        members: { include: { user: { select: { id: true, fullName: true, email: true, avatarUrl: true } } } },
        event: { select: { id: true, title: true, startDate: true } },
      },
    });
    if (!team) return res.status(404).json({ success: false, error: 'NotFound', message: 'Team not found.' });
    res.json({ success: true, data: team });
  } catch (err) { next(err); }
});

// PUT /teams/:id
router.put('/:id', authenticate, isTeamLeader, async (req, res, next) => {
  try {
    const { name, isLocked } = req.body;
    const team = await prisma.team.update({ where: { id: req.params.id }, data: { name, isLocked } });
    res.json({ success: true, data: team });
  } catch (err) { next(err); }
});

// DELETE /teams/:id
router.delete('/:id', authenticate, isTeamLeader, async (req, res, next) => {
  try {
    await prisma.team.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Team disbanded.' });
  } catch (err) { next(err); }
});

// POST /teams/:id/invite (send email invites)
router.post('/:id/invite', authenticate, isTeamLeader, async (req, res, next) => {
  try {
    const { emails } = req.body;
    if (!emails?.length) return res.status(422).json({ success: false, error: 'ValidationError', message: 'emails array required.' });
    await teamService.inviteByEmail(req.params.id, req.user.id, emails);
    res.json({ success: true, message: `Invites sent to ${emails.length} email(s).` });
  } catch (err) { next(err); }
});

// POST /teams/join/:inviteToken
router.post('/join/:inviteToken', authenticate, async (req, res, next) => {
  try {
    const team = await teamService.joinTeam(req.params.inviteToken, req.user.id);
    res.json({ success: true, data: team, message: 'Joined team successfully.' });
  } catch (err) { next(err); }
});

// DELETE /teams/:id/members/:userId
router.delete('/:id/members/:userId', authenticate, isTeamLeader, async (req, res, next) => {
  try {
    await teamService.removeMember(req.params.id, req.params.userId, req.user.id);
    res.json({ success: true, message: 'Member removed.' });
  } catch (err) { next(err); }
});

// PATCH /teams/:id/transfer-leadership
router.patch('/:id/transfer-leadership', authenticate, isTeamLeader, async (req, res, next) => {
  try {
    const { newLeaderId } = req.body;
    if (!newLeaderId) return res.status(422).json({ success: false, error: 'ValidationError', message: 'newLeaderId required.' });
    await teamService.transferLeadership(req.params.id, req.user.id, newLeaderId);
    res.json({ success: true, message: 'Leadership transferred.' });
  } catch (err) { next(err); }
});

// GET /teams/:id/chat
router.get('/:id/chat', authenticate, isTeamMember, async (req, res, next) => {
  try {
    const messages = await teamService.getMessages(req.params.id, { page: req.query.page, limit: req.query.limit });
    res.json({ success: true, data: messages });
  } catch (err) { next(err); }
});

// POST /teams/:id/chat
router.post('/:id/chat', authenticate, isTeamMember, async (req, res, next) => {
  try {
    const { message, messageType, fileUrl } = req.body;
    if (!message) return res.status(422).json({ success: false, error: 'ValidationError', message: 'message is required.' });
    const msg = await teamService.postMessage(req.params.id, req.user.id, { message, messageType, fileUrl });
    // Broadcast via WebSocket
    const wsClient = require('../services/websocket.client');
    wsClient.emitTeamMessage(req.params.id, msg);
    res.status(201).json({ success: true, data: msg });
  } catch (err) { next(err); }
});

module.exports = router;
