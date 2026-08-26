const express = require('express');
const router = express.Router();
const { getQuestions, getQuestionById } = require('../controllers/questionController');

router.get('/', getQuestions);
router.get('/:id', getQuestionById);

module.exports = router;
