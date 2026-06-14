const express = require('express');
const router = express.Router();
const userInfoController = require('../controllers/userInfoController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, userInfoController.getUserInfo);

module.exports = router;
