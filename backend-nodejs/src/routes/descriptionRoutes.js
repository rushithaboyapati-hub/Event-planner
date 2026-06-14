const express = require('express');
const router = express.Router();
const dc = require('../controllers/descriptionController');

router.post('/', dc.createDescription);
router.get('/', dc.getAllDescriptions);
router.get('/:eventId', dc.getDescription);
router.get('/:eventId/summary', dc.getDescriptionSummary);
router.put('/:eventId', dc.updateDescription);
router.delete('/:eventId', dc.deleteDescription);

module.exports = router;
