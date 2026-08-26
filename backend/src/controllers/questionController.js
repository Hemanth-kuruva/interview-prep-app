const pool = require('../config/db');

/**
 * Get questions with optional filters (subject_id, difficulty, limit)
 * GET /api/questions
 */
async function getQuestions(req, res) {
  try {
    const { subject_id, difficulty, limit = 50, include_answers } = req.query;

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
        q.difficulty
        ${include_answers === 'true' ? ', q.correct_answer, q.explanation' : ''}
      FROM questions q
      JOIN subjects s ON q.subject_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (subject_id) {
      query += ' AND q.subject_id = ?';
      params.push(subject_id);
    }

    if (difficulty && difficulty.toLowerCase() !== 'all') {
      query += ' AND q.difficulty = ?';
      params.push(difficulty);
    }

    query += ' ORDER BY RAND() LIMIT ?';
    params.push(parseInt(limit, 10));

    const [rows] = await pool.query(query, params);

    return res.json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error('Error querying questions:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve questions.',
      error: error.message,
    });
  }
}

/**
 * Get question by ID
 * GET /api/questions/:id
 */
async function getQuestionById(req, res) {
  try {
    const { id } = req.params;

    const query = `
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
        q.explanation
      FROM questions q
      JOIN subjects s ON q.subject_id = s.id
      WHERE q.id = ?
    `;

    const [rows] = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Question not found.',
      });
    }

    return res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error('Error fetching question:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve question.',
      error: error.message,
    });
  }
}

module.exports = {
  getQuestions,
  getQuestionById,
};
