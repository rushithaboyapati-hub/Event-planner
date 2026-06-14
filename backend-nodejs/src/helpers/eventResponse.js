const User = require('../models/User');
const Category = require('../models/Category');
const Venue = require('../models/Venue');
const Tag = require('../models/Tag');
const Registration = require('../models/Registration');

async function toEventResponse(event) {
  const [organizer, category, venue, tags, registeredCount] = await Promise.all([
    User.findOne({ id: event.organizerId }),
    event.categoryId != null ? Category.findOne({ id: event.categoryId }) : null,
    event.venueId != null ? Venue.findOne({ id: event.venueId }) : null,
    event.tagIds && event.tagIds.length ? Tag.find({ id: { $in: event.tagIds } }) : [],
    Registration.countDocuments({ eventId: event.id, status: 'CONFIRMED' })
  ]);

  return {
    id: event.id,
    title: event.title,
    status: event.status,
    startTime: event.startTime,
    endTime: event.endTime,
    capacity: event.capacity,
    registeredCount,
    organizerId: event.organizerId,
    organizerName: organizer ? organizer.name : null,
    categoryId: event.categoryId || null,
    categoryName: category ? category.name : null,
    venueId: event.venueId || null,
    venueName: venue ? venue.name : null,
    tags: tags.map((t) => t.name),
    createdAt: event.createdAt
  };
}

async function toEventResponseList(events) {
  return Promise.all(events.map(toEventResponse));
}

module.exports = { toEventResponse, toEventResponseList };
