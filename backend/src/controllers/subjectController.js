const pool = require('../config/db');

/**
 * Get all subjects with question count
 * GET /api/subjects
 */
async function getSubjects(req, res) {
  try {
    const query = `
      SELECT 
        s.id, 
        s.name, 
        s.slug, 
        s.icon, 
        s.description,
        COUNT(q.id) AS total_questions
      FROM subjects s
      LEFT JOIN questions q ON s.id = q.subject_id
      GROUP BY s.id
      ORDER BY s.id ASC
    `;
    const [rows] = await pool.query(query);

    return res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve subjects.',
      error: error.message,
    });
  }
}

/**
 * Get a single subject by ID or Slug
 * GET /api/subjects/:id
 */
async function getSubjectById(req, res) {
  try {
    const { id } = req.params;
    const isNumeric = /^\d+$/.test(id);

    const query = `
      SELECT 
        s.id, 
        s.name, 
        s.slug, 
        s.icon, 
        s.description,
        COUNT(q.id) AS total_questions
      FROM subjects s
      LEFT JOIN questions q ON s.id = q.subject_id
      WHERE ${isNumeric ? 's.id = ?' : 's.slug = ?'}
      GROUP BY s.id
    `;
    const [rows] = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found.',
      });
    }

    return res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error('Error fetching subject by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve subject.',
      error: error.message,
    });
  }
}

module.exports = {
  getSubjects,
  getSubjectById,
};
