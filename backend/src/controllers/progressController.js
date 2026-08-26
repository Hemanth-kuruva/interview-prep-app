const pool = require('../config/db');

/**
 * Get aggregated progress summary for the student
 * GET /api/progress/summary
 */
async function getProgressSummary(req, res) {
  try {
    const userId = req.user.id;

    // Overall aggregate stats
    const [overallRows] = await pool.query(
      `SELECT 
        COUNT(id) AS total_quizzes,
        COALESCE(SUM(total_questions), 0) AS total_questions_answered,
        COALESCE(SUM(score), 0) AS total_correct,
        COALESCE(AVG(accuracy), 0) AS average_accuracy,
        COALESCE(SUM(time_taken), 0) AS total_time_spent_seconds
       FROM quiz_attempts
       WHERE user_id = ?`,
      [userId]
    );

    const overall = overallRows[0];

    // Subject-wise performance to find strongest & weakest subject
    const [subjectStats] = await pool.query(
      `SELECT 
        s.id AS subject_id,
        s.name AS subject_name,
        COUNT(qa.id) AS attempts_count,
        COALESCE(AVG(qa.accuracy), 0) AS avg_accuracy,
        COALESCE(SUM(qa.score), 0) AS total_correct,
        COALESCE(SUM(qa.total_questions), 0) AS total_questions
       FROM subjects s
       LEFT JOIN quiz_attempts qa ON s.id = qa.subject_id AND qa.user_id = ?
       GROUP BY s.id
       ORDER BY avg_accuracy DESC`,
      [userId]
    );

    // Filter subjects that have at least 1 attempt
    const attemptedSubjects = subjectStats.filter((s) => s.attempts_count > 0);

    let strongestSubject = null;
    let weakestSubject = null;

    if (attemptedSubjects.length > 0) {
      strongestSubject = {
        name: attemptedSubjects[0].subject_name,
        accuracy: parseFloat(attemptedSubjects[0].avg_accuracy).toFixed(1),
      };
      weakestSubject = {
        name: attemptedSubjects[attemptedSubjects.length - 1].subject_name,
        accuracy: parseFloat(attemptedSubjects[attemptedSubjects.length - 1].avg_accuracy).toFixed(1),
      };
    }

    // Recent 5 attempts
    const [recentAttempts] = await pool.query(
      `SELECT 
        qa.id,
        s.name AS subject_name,
        s.icon AS subject_icon,
        qa.mode,
        qa.difficulty,
        qa.score,
        qa.total_questions,
        qa.accuracy,
        qa.time_taken,
        qa.attempted_at
       FROM quiz_attempts qa
       JOIN subjects s ON qa.subject_id = s.id
       WHERE qa.user_id = ?
       ORDER BY qa.attempted_at DESC
       LIMIT 5`,
      [userId]
    );

    return res.json({
      success: true,
      data: {
        total_quizzes: overall.total_quizzes || 0,
        total_questions_answered: parseInt(overall.total_questions_answered, 10) || 0,
        total_correct: parseInt(overall.total_correct, 10) || 0,
        average_accuracy: parseFloat(overall.average_accuracy || 0).toFixed(1),
        total_time_spent_seconds: parseInt(overall.total_time_spent_seconds, 10) || 0,
        strongest_subject: strongestSubject,
        weakest_subject: weakestSubject,
        subject_breakdown: subjectStats.map((s) => ({
          subject_id: s.subject_id,
          subject_name: s.subject_name,
          attempts_count: s.attempts_count,
          avg_accuracy: parseFloat(s.avg_accuracy).toFixed(1),
          total_correct: parseInt(s.total_correct, 10) || 0,
          total_questions: parseInt(s.total_questions, 10) || 0,
        })),
        recent_attempts: recentAttempts,
      },
    });
  } catch (error) {
    console.error('Error fetching progress summary:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve progress statistics.',
      error: error.message,
    });
  }
}

module.exports = {
  getProgressSummary,
};
