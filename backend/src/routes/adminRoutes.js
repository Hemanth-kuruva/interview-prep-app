const express = require('express');
const router = express.Router();
const {
  getAdminQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getAdminStats,
} = require('../controllers/adminController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// All admin routes require valid token and admin role
router.use(verifyToken, requireAdmin);

router.get('/questions', getAdminQuestions);
router.post('/questions', createQuestion);
router.put('/questions/:id', updateQuestion);
router.delete('/questions/:id', deleteQuestion);
router.get('/stats', getAdminStats);

module.exports = router;
