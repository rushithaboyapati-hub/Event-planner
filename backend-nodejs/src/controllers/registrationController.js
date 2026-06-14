const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Waitlist = require('../models/Waitlist');
const { toRegistrationResponse, toRegistrationResponseList } = require('../helpers/registrationResponse');
const { sendError } = require('../utils/errors');

async function checkSchedulingConflict(userId, startTime, endTime, excludeEventId) {
  const registrations = await Registration.find({ userId, status: { $ne: 'CANCELLED' } });
  const eventIds = registrations.map((r) => r.eventId).filter((id) => id !== excludeEventId);
  if (eventIds.length === 0) return [];

  const conflicts = await Event.find({
    id: { $in: eventIds },
    startTime: { $lt: endTime },
    endTime: { $gt: startTime }
  });
  return conflicts;
}

async function addToWaitlist(userId, eventId) {
  const existing = await Waitlist.findOne({ userId, eventId });
  if (existing) return;
  const position = await Waitlist.countDocuments({ eventId });
  await Waitlist.create({ userId, eventId, position: position + 1 });
}

async function promoteFromWaitlist(eventId) {
  const event = await Event.findOne({ id: eventId });
  if (!event) return;

  const confirmed = await Registration.countDocuments({ eventId, status: 'CONFIRMED' });
  const available = event.capacity - confirmed;
  if (available <= 0) return;

  const waitlisted = await Waitlist.find({ eventId }).sort({ position: 1 });
  for (let i = 0; i < Math.min(available, waitlisted.length); i++) {
    const w = waitlisted[i];
    const reg = await Registration.findOne({ userId: w.userId, eventId });
    if (reg && reg.status === 'PENDING') {
      reg.status = 'CONFIRMED';
      await reg.save();
    }
  }
}

exports.register = async (req, res) => {
  try {
    const eventId = Number(req.params.eventId);
    const userId = Number(req.query.userId);

    const user = await User.findOne({ id: userId });
    if (!user) return sendError(res, 404, `User not found with id : '${userId}'`);

    const event = await Event.findOne({ id: eventId });
    if (!event) return sendError(res, 404, `Event not found with id : '${eventId}'`);

    if (event.status === 'CANCELLED') {
      return sendError(res, 400, 'Cannot register for a cancelled event');
    }
    if (event.startTime < new Date()) {
      return sendError(res, 400, 'Cannot register for a past event');
    }

    const existing = await Registration.findOne({ userId, eventId });
    if (existing) {
      return res.status(409).json({ error: 'Already registered for this event' });
    }

    const conflicts = await checkSchedulingConflict(userId, event.startTime, event.endTime, eventId);
    if (conflicts.length > 0) {
      const titles = conflicts.map((e) => e.title).join(', ');
      return res.status(409).json({ error: `Scheduling conflict with: ${titles}` });
    }

    const confirmedCount = await Registration.countDocuments({ eventId, status: 'CONFIRMED' });

    let status = 'CONFIRMED';
    if (confirmedCount >= event.capacity) {
      status = 'PENDING';
    }

    const registration = await Registration.create({ userId, eventId, status });

    if (status === 'PENDING') {
      await addToWaitlist(userId, eventId);
    }

    res.status(201).json(await toRegistrationResponse(registration));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.cancelRegistration = async (req, res) => {
  try {
    const eventId = Number(req.params.eventId);
    const userId = Number(req.query.userId);

    const registration = await Registration.findOne({ userId, eventId });
    if (!registration) {
      return sendError(res, 404, `Registration for user ${userId} on event ${eventId} not found`);
    }

    registration.status = 'CANCELLED';
    await registration.save();

    await promoteFromWaitlist(eventId);

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserRegistrations = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const registrations = await Registration.find({ userId }).sort({ id: 1 });
    res.json(await toRegistrationResponseList(registrations));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getEventRegistrations = async (req, res) => {
  try {
    const eventId = Number(req.params.eventId);
    const registrations = await Registration.find({ eventId }).sort({ id: 1 });
    res.json(await toRegistrationResponseList(registrations));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markAttended = async (req, res) => {
  try {
    const registrationId = Number(req.params.registrationId);
    const registration = await Registration.findOne({ id: registrationId });
    if (!registration) return sendError(res, 404, `Registration not found with id : '${registrationId}'`);
    registration.status = 'ATTENDED';
    await registration.save();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
