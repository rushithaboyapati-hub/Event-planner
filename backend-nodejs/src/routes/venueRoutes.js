const express = require('express');
const router = express.Router();
const venueController = require('../controllers/venueController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', venueController.getAll);
router.post('/', authenticate, authorize('ORGANIZER', 'ADMIN'), venueController.create);
router.put('/:id', authenticate, authorize('ORGANIZER', 'ADMIN'), venueController.update);
router.delete('/:id', authenticate, authorize('ORGANIZER', 'ADMIN'), venueController.remove);

module.exports = router;
