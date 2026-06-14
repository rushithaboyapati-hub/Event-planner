const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/events/:eventId/register', authenticate, authorize('USER', 'ORGANIZER', 'ADMIN'), registrationController.register);
router.delete('/events/:eventId/register', authenticate, authorize('USER', 'ORGANIZER', 'ADMIN'), registrationController.cancelRegistration);
router.get('/users/:userId/registrations', authenticate, authorize('USER', 'ORGANIZER', 'ADMIN'), registrationController.getUserRegistrations);
router.get('/events/:eventId/registrations', authenticate, authorize('USER', 'ORGANIZER', 'ADMIN'), registrationController.getEventRegistrations);
router.patch('/registrations/:registrationId/attend', authenticate, authorize('ADMIN'), registrationController.markAttended);

module.exports = router;
