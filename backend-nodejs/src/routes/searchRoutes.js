const express = require('express');
const router = express.Router();
const sc = require('../controllers/searchController');
const ec = require('../controllers/embeddingController');

router.get('/semantic', sc.semanticSearch);
router.get('/text', sc.textSearch);
router.get('/hybrid', sc.hybridSearch);

router.post('/embeddings', ec.createEmbedding);
router.get('/embeddings/:eventId', ec.getEmbedding);
router.delete('/embeddings/:eventId', ec.deleteEmbedding);
router.get('/embeddings/status/index', ec.getIndexStatus);

module.exports = router;
