const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize('ADMIN'), userController.getAllUsers);
router.get('/unverified', authenticate, authorize('ADMIN'), userController.getUnverifiedUsers);
router.get('/email/:email', authenticate, authorize('ADMIN'), userController.getUserByEmail);
router.get('/:id', authenticate, authorize('ADMIN'), userController.getUser);
router.post('/', authenticate, authorize('ADMIN'), userController.createUser);
router.put('/:id', authenticate, authorize('ADMIN'), userController.updateUser);
router.patch('/:id/verify', authenticate, authorize('ADMIN'), userController.verifyUser);
router.delete('/:id', authenticate, authorize('ADMIN'), userController.deleteUser);

module.exports = router;
