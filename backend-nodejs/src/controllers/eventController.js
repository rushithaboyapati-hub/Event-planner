const Event = require('../models/Event');
const User = require('../models/User');
const Category = require('../models/Category');
const Venue = require('../models/Venue');
const Tag = require('../models/Tag');
const Registration = require('../models/Registration');
const { toEventResponse, toEventResponseList } = require('../helpers/eventResponse');
const { sendError } = require('../utils/errors');

exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ id: 1 });
    res.json(await toEventResponseList(events));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUpcomingEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: 'PUBLISHED', startTime: { $gte: new Date() } }).sort({ startTime: 1 });
    res.json(await toEventResponseList(events));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findOne({ id: Number(req.params.id) });
    if (!event) return sendError(res, 404, `Event not found with id : '${req.params.id}'`);
    res.json(await toEventResponse(event));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

async function checkVenueConflict(venueId, startTime, endTime, excludeEventId) {
  const query = {
    venueId,
    status: { $ne: 'CANCELLED' },
    startTime: { $lt: endTime },
    endTime: { $gt: startTime }
  };
  if (excludeEventId != null) {
    query.id = { $ne: excludeEventId };
  }
  return Event.find(query);
}

exports.createEvent = async (req, res) => {
  try {
    const organizerId = Number(req.query.organizerId);
    const { title, startTime, endTime, capacity, categoryId, venueId, tagIds } = req.body;

    if (!title || title.length > 200) {
      return sendError(res, 400, 'Title is required and must be at most 200 characters');
    }
    if (!startTime || !endTime) {
      return sendError(res, 400, 'Start time and end time are required');
    }
    if (!capacity || capacity < 1) {
      return sendError(res, 400, 'Capacity must be at least 1');
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start > end) {
      return sendError(res, 400, 'Start time must be before end time');
    }
    if (start < new Date()) {
      return sendError(res, 400, 'Cannot create events in the past');
    }

    const organizer = await User.findOne({ id: organizerId });
    if (!organizer) return sendError(res, 404, `User not found with id : '${organizerId}'`);

    if (categoryId != null) {
      const category = await Category.findOne({ id: categoryId });
      if (!category) return sendError(res, 404, `Category not found with id : '${categoryId}'`);
    }

    if (venueId != null) {
      const venue = await Venue.findOne({ id: venueId });
      if (!venue) return sendError(res, 404, `Venue not found with id : '${venueId}'`);

      const conflicts = await checkVenueConflict(venueId, start, end, null);
      if (conflicts.length > 0) {
        return res.status(409).json({ error: 'Venue is already booked during this time slot' });
      }
    }

    let validTagIds = [];
    if (tagIds && tagIds.length) {
      const tags = await Tag.find({ id: { $in: tagIds } });
      if (tags.length !== tagIds.length) {
        return sendError(res, 404, 'One or more tags not found');
      }
      validTagIds = tags.map((t) => t.id);
    }

    const event = await Event.create({
      title,
      startTime: start,
      endTime: end,
      capacity,
      organizerId,
      categoryId: categoryId || null,
      venueId: venueId || null,
      tagIds: validTagIds,
      status: 'PUBLISHED'
    });

    res.status(201).json(await toEventResponse(event));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findOne({ id: Number(req.params.id) });
    if (!event) return sendError(res, 404, `Event not found with id : '${req.params.id}'`);

    const { title, startTime, endTime, capacity, categoryId, venueId, tagIds } = req.body;

    let start = event.startTime;
    let end = event.endTime;

    if (startTime != null && endTime != null) {
      start = new Date(startTime);
      end = new Date(endTime);
      if (start > end) {
        return sendError(res, 400, 'Start time must be before end time');
      }
      event.startTime = start;
      event.endTime = end;
    }

    if (title != null) event.title = title;
    if (capacity != null) event.capacity = capacity;

    if (categoryId != null) {
      const category = await Category.findOne({ id: categoryId });
      if (!category) return sendError(res, 404, `Category not found with id : '${categoryId}'`);
      event.categoryId = categoryId;
    }

    if (venueId != null) {
      const venue = await Venue.findOne({ id: venueId });
      if (!venue) return sendError(res, 404, `Venue not found with id : '${venueId}'`);

      const conflicts = await checkVenueConflict(venueId, event.startTime, event.endTime, event.id);
      if (conflicts.length > 0) {
        return res.status(409).json({ error: 'Venue is already booked during this time slot' });
      }
      event.venueId = venueId;
    }

    if (tagIds != null) {
      const tags = await Tag.find({ id: { $in: tagIds } });
      if (tags.length !== tagIds.length) {
        return sendError(res, 404, 'One or more tags not found');
      }
      event.tagIds = tags.map((t) => t.id);
    }

    await event.save();
    res.json(await toEventResponse(event));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.cancelEvent = async (req, res) => {
  try {
    const event = await Event.findOne({ id: Number(req.params.id) });
    if (!event) return sendError(res, 404, `Event not found with id : '${req.params.id}'`);
    event.status = 'CANCELLED';
    await event.save();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({ id: Number(req.params.id) });
    if (!event) return sendError(res, 404, `Event not found with id : '${req.params.id}'`);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCalendarEvents = async (req, res) => {
  try {
    const { startDate, endDate, categoryId, userId } = req.body;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    let events = await Event.find({ startTime: { $gte: start, $lte: end } });

    if (userId != null) {
      const confirmed = await Registration.find({ userId, status: 'CONFIRMED' });
      const confirmedEventIds = new Set(confirmed.map((r) => r.eventId));
      events = events.filter((e) => confirmedEventIds.has(e.id));
    }

    if (categoryId != null) {
      events = events.filter((e) => e.categoryId === categoryId);
    }

    res.json(await toEventResponseList(events));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.checkConflict = async (req, res) => {
  try {
    const eventId = Number(req.params.eventId);
    const userId = Number(req.params.userId);

    const event = await Event.findOne({ id: eventId });
    if (!event) return sendError(res, 404, `Event not found with id : '${eventId}'`);

    const registrations = await Registration.find({ userId, status: { $ne: 'CANCELLED' } });
    const eventIds = registrations.map((r) => r.eventId).filter((id) => id !== eventId);
    const candidateEvents = await Event.find({
      id: { $in: eventIds },
      startTime: { $lt: event.endTime },
      endTime: { $gt: event.startTime }
    });

    const conflictingEvents = await toEventResponseList(candidateEvents);

    res.json({
      hasConflict: conflictingEvents.length > 0,
      conflictingEvents
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
