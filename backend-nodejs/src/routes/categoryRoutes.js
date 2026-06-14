const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', categoryController.getAll);
router.post('/', authenticate, authorize('ORGANIZER', 'ADMIN'), categoryController.create);
router.put('/:id', authenticate, authorize('ORGANIZER', 'ADMIN'), categoryController.update);
router.delete('/:id', authenticate, authorize('ORGANIZER', 'ADMIN'), categoryController.remove);

module.exports = router;
