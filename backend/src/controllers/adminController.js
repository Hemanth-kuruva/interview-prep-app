const pool = require('../config/db');

/**
 * Get all questions with admin details and filters
 * GET /api/admin/questions
 */
async function getAdminQuestions(req, res) {
  try {
    const { subject_id, difficulty, search } = req.query;

    let query = `
      SELECT 
        q.id,
        q.subject_id,
        s.name AS subject_name,
        q.question,
        q.option_a,
        q.option_b,
        q.option_c,
        q.option_d,
        q.correct_answer,
        q.difficulty,
        q.explanation,
        q.created_at
      FROM questions q
      JOIN subjects s ON q.subject_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (subject_id && subject_id !== 'all') {
      query += ' AND q.subject_id = ?';
      params.push(subject_id);
    }

    if (difficulty && difficulty !== 'all') {
      query += ' AND q.difficulty = ?';
      params.push(difficulty);
    }

    if (search && search.trim() !== '') {
      query += ' AND (q.question LIKE ? OR s.name LIKE ?)';
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    query += ' ORDER BY q.id DESC';

    const [questions] = await pool.query(query, params);

    return res.json({
      success: true,
      count: questions.length,
      data: questions,
    });
  } catch (error) {
    console.error('Error fetching admin questions:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve questions for admin.',
      error: error.message,
    });
  }
}

/**
 * Create a new question
 * POST /api/admin/questions
 */
async function createQuestion(req, res) {
  try {
    const {
      subject_id,
      question,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_answer,
      difficulty = 'Medium',
      explanation = '',
    } = req.body;

    if (!subject_id || !question || !option_a || !option_b || !option_c || !option_d || !correct_answer) {
      return res.status(400).json({
        success: false,
        message: 'All fields (subject_id, question, options A-D, correct_answer) are required.',
      });
    }

    const validOptions = ['A', 'B', 'C', 'D'];
    if (!validOptions.includes(correct_answer.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'correct_answer must be one of: A, B, C, D.',
      });
    }

    const [result] = await pool.query(
      `INSERT INTO questions 
       (subject_id, question, option_a, option_b, option_c, option_d, correct_answer, difficulty, explanation)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        subject_id,
        question.trim(),
        option_a.trim(),
        option_b.trim(),
        option_c.trim(),
        option_d.trim(),
        correct_answer.toUpperCase(),
        difficulty,
        explanation.trim(),
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Question created successfully.',
      data: {
        id: result.insertId,
        subject_id,
        question,
        correct_answer: correct_answer.toUpperCase(),
        difficulty,
      },
    });
  } catch (error) {
    console.error('Error creating question:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create question.',
      error: error.message,
    });
  }
}

/**
 * Update an existing question
 * PUT /api/admin/questions/:id
 */
async function updateQuestion(req, res) {
  try {
    const { id } = req.params;
    const {
      subject_id,
      question,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_answer,
      difficulty,
      explanation,
    } = req.body;

    if (!subject_id || !question || !option_a || !option_b || !option_c || !option_d || !correct_answer) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required for updating a question.',
      });
    }

    const [result] = await pool.query(
      `UPDATE questions SET
        subject_id = ?,
        question = ?,
        option_a = ?,
        option_b = ?,
        option_c = ?,
        option_d = ?,
        correct_answer = ?,
        difficulty = ?,
        explanation = ?
       WHERE id = ?`,
      [
        subject_id,
        question.trim(),
        option_a.trim(),
        option_b.trim(),
        option_c.trim(),
        option_d.trim(),
        correct_answer.toUpperCase(),
        difficulty,
        explanation.trim(),
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Question not found.',
      });
    }

    return res.json({
      success: true,
      message: 'Question updated successfully.',
    });
  } catch (error) {
    console.error('Error updating question:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update question.',
      error: error.message,
    });
  }
}

/**
 * Delete a question
 * DELETE /api/admin/questions/:id
 */
async function deleteQuestion(req, res) {
  try {
    const { id } = req.params;

    const [result] = await pool.query('DELETE FROM questions WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Question not found.',
      });
    }

    return res.json({
      success: true,
      message: 'Question deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting question:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete question.',
      error: error.message,
    });
  }
}

/**
 * Get platform-wide overview statistics for admin
 * GET /api/admin/stats
 */
async function getAdminStats(req, res) {
  try {
    const [[usersCount]] = await pool.query('SELECT COUNT(id) AS total_users FROM users WHERE role = "student"');
    const [[questionsCount]] = await pool.query('SELECT COUNT(id) AS total_questions FROM questions');
    const [[attemptsCount]] = await pool.query('SELECT COUNT(id) AS total_attempts FROM quiz_attempts');
    const [subjectDistribution] = await pool.query(`
      SELECT s.name AS subject_name, COUNT(q.id) AS question_count
      FROM subjects s
      LEFT JOIN questions q ON s.id = q.subject_id
      GROUP BY s.id
      ORDER BY question_count DESC
    `);

    return res.json({
      success: true,
      data: {
        total_students: usersCount.total_users || 0,
        total_questions: questionsCount.total_questions || 0,
        total_attempts: attemptsCount.total_attempts || 0,
        subject_distribution: subjectDistribution,
      },
    });
  } catch (error) {
    console.error('Error fetching admin statistics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin statistics.',
      error: error.message,
    });
  }
}

module.exports = {
  getAdminQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getAdminStats,
};
