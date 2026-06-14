const User = require('../models/User');
const Event = require('../models/Event');
const { toEventResponse } = require('./eventResponse');

async function toRegistrationResponse(registration) {
  const [user, event] = await Promise.all([
    User.findOne({ id: registration.userId }),
    Event.findOne({ id: registration.eventId })
  ]);

  return {
    id: registration.id,
    user: user ? user.toJSON() : null,
    event: event ? await toEventResponse(event) : null,
    userId: registration.userId,
    eventId: registration.eventId,
    status: registration.status,
    registeredAt: registration.registeredAt
  };
}

async function toRegistrationResponseList(registrations) {
  return Promise.all(registrations.map(toRegistrationResponse));
}

module.exports = { toRegistrationResponse, toRegistrationResponseList };
