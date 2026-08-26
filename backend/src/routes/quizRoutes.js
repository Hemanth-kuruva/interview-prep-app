const express = require('express');
const router = express.Router();
const {
  startQuiz,
  submitQuiz,
  getQuizResult,
  getQuizHistory,
} = require('../controllers/quizController');
const { verifyToken } = require('../middleware/auth');

router.post('/start', verifyToken, startQuiz);
router.post('/submit', verifyToken, submitQuiz);
router.get('/results/:attemptId', verifyToken, getQuizResult);
router.get('/history', verifyToken, getQuizHistory);

module.exports = router;
