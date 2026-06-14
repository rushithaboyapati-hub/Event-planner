const express = require('express');
const router = express.Router();
const alc = require('../controllers/activityLogController');

router.post('/', alc.createLog);
router.post('/bulk', alc.bulkCreateLogs);
router.get('/analytics', alc.getAnalytics);
router.get('/search', alc.searchLogs);
router.get('/users/:userId', alc.getUserLogs);
router.get('/events/:eventId', alc.getEventLogs);

module.exports = router;
