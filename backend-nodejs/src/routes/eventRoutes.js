const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', eventController.getAllEvents);
router.get('/upcoming', eventController.getUpcomingEvents);
router.post('/calendar', eventController.getCalendarEvents);
router.get('/:eventId/conflicts/:userId', authenticate, authorize('USER', 'ORGANIZER', 'ADMIN'), eventController.checkConflict);
router.get('/:id', eventController.getEvent);
router.post('/', authenticate, authorize('ORGANIZER', 'ADMIN'), eventController.createEvent);
router.put('/:id', authenticate, authorize('ORGANIZER', 'ADMIN'), eventController.updateEvent);
router.patch('/:id/cancel', authenticate, authorize('ORGANIZER', 'ADMIN'), eventController.cancelEvent);
router.delete('/:id', authenticate, authorize('ORGANIZER', 'ADMIN'), eventController.deleteEvent);

module.exports = router;
