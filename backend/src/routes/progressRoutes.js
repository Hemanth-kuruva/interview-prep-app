const express = require('express');
const router = express.Router();
const { getProgressSummary } = require('../controllers/progressController');
const { verifyToken } = require('../middleware/auth');

router.get('/summary', verifyToken, getProgressSummary);

module.exports = router;
