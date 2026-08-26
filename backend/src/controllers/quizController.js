const pool = require('../config/db');

/**
 * Start a new Quiz or Practice session
 * POST /api/quiz/start
 * Body: { subject_id, difficulty, count, mode }
 */
async function startQuiz(req, res) {
  try {
    const { subject_id, difficulty = 'All', count = 10, mode = 'quiz' } = req.body;

    if (!subject_id) {
      return res.status(400).json({
        success: false,
        message: 'subject_id is required to start a quiz.',
      });
    }

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
        ${mode === 'practice' ? ', q.correct_answer, q.explanation' : ''}
      FROM questions q
      JOIN subjects s ON q.subject_id = s.id
      WHERE q.subject_id = ?
    `;
    const params = [subject_id];

    if (difficulty && difficulty.toLowerCase() !== 'all') {
      query += ' AND q.difficulty = ?';
      params.push(difficulty);
    }

    query += ' ORDER BY RAND() LIMIT ?';
    params.push(parseInt(count, 10) || 10);

    const [questions] = await pool.query(query, params);

    if (questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No questions found for the selected subject and difficulty.',
      });
    }

    // Recommended time: 60 seconds per question for timed quiz
    const timeLimitSeconds = questions.length * 60;

    return res.json({
      success: true,
      data: {
        subject_id: parseInt(subject_id, 10),
        subject_name: questions[0].subject_name,
        mode,
        difficulty,
        total_questions: questions.length,
        time_limit_seconds: timeLimitSeconds,
        questions,
      },
    });
  } catch (error) {
    console.error('Error starting quiz:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to start quiz session.',
      error: error.message,
    });
  }
}

/**
 * Submit Quiz and calculate score & accuracy
 * POST /api/quiz/submit
 * Body: { subject_id, mode, difficulty, time_taken, answers: [{ question_id, selected_answer }] }
 */
async function submitQuiz(req, res) {
  const connection = await pool.getConnection();
  try {
    const userId = req.user.id;
    const {
      subject_id,
      mode = 'quiz',
      difficulty = 'All',
      time_taken = 0,
      answers = [],
    } = req.body;

    if (!subject_id || !Array.isArray(answers) || answers.length === 0) {
      connection.release();
      return res.status(400).json({
        success: false,
        message: 'subject_id and non-empty answers array are required.',
      });
    }

    // Fetch correct answers for all submitted questions
    const questionIds = answers.map((a) => a.question_id);
    const [dbQuestions] = await connection.query(
      `SELECT id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty 
       FROM questions 
       WHERE id IN (?)`,
      [questionIds]
    );

    const questionMap = new Map();
    dbQuestions.forEach((q) => questionMap.set(q.id, q));

    let score = 0;
    const evaluatedAnswers = [];

    for (const ans of answers) {
      const q = questionMap.get(ans.question_id);
      if (q) {
        const isCorrect = (ans.selected_answer || '').toUpperCase() === q.correct_answer.toUpperCase();
        if (isCorrect) score++;

        evaluatedAnswers.push({
          question_id: q.id,
          question: q.question,
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c,
          option_d: q.option_d,
          selected_answer: ans.selected_answer || 'SKIP',
          correct_answer: q.correct_answer,
          is_correct: isCorrect,
          explanation: q.explanation,
          difficulty: q.difficulty,
        });
      }
    }

    const totalQuestions = answers.length;
    const accuracy = totalQuestions > 0 ? ((score / totalQuestions) * 100).toFixed(2) : 0;

    await connection.beginTransaction();

    // 1. Insert into quiz_attempts
    const [attemptResult] = await connection.query(
      `INSERT INTO quiz_attempts (user_id, subject_id, mode, difficulty, score, total_questions, accuracy, time_taken)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, subject_id, mode, difficulty, score, totalQuestions, accuracy, time_taken]
    );

    const attemptId = attemptResult.insertId;

    // 2. Insert into user_answers
    if (evaluatedAnswers.length > 0) {
      const userAnswersData = evaluatedAnswers.map((ea) => [
        attemptId,
        ea.question_id,
        ea.selected_answer,
        ea.is_correct ? 1 : 0,
      ]);

      await connection.query(
        `INSERT INTO user_answers (attempt_id, question_id, selected_answer, is_correct) VALUES ?`,
        [userAnswersData]
      );
    }

    await connection.commit();
    connection.release();

    return res.status(201).json({
      success: true,
      message: 'Quiz evaluated and saved successfully.',
      data: {
        attempt_id: attemptId,
        score,
        total_questions: totalQuestions,
        accuracy: parseFloat(accuracy),
        correct_count: score,
        wrong_count: totalQuestions - score,
        time_taken,
        breakdown: evaluatedAnswers,
      },
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Error submitting quiz:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit and evaluate quiz.',
      error: error.message,
    });
  }
}

/**
 * Get detailed result for a specific attempt
 * GET /api/quiz/results/:attemptId
 */
async function getQuizResult(req, res) {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;

    // Verify attempt ownership or admin
    const [attempts] = await pool.query(
      `SELECT qa.*, s.name AS subject_name, s.icon AS subject_icon
       FROM quiz_attempts qa
       JOIN subjects s ON qa.subject_id = s.id
       WHERE qa.id = ? AND (qa.user_id = ? OR ? = 'admin')`,
      [attemptId, userId, req.user.role]
    );

    if (attempts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Quiz attempt not found or access denied.',
      });
    }

    const attempt = attempts[0];

    // Fetch question review items
    const [answers] = await pool.query(
      `SELECT 
        ua.question_id,
        ua.selected_answer,
        ua.is_correct,
        q.question,
        q.option_a,
        q.option_b,
        q.option_c,
        q.option_d,
        q.correct_answer,
        q.explanation,
        q.difficulty
       FROM user_answers ua
       JOIN questions q ON ua.question_id = q.id
       WHERE ua.attempt_id = ?
       ORDER BY ua.id ASC`,
      [attemptId]
    );

    return res.json({
      success: true,
      data: {
        ...attempt,
        breakdown: answers,
      },
    });
  } catch (error) {
    console.error('Error fetching quiz result:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve quiz result.',
      error: error.message,
    });
  }
}

/**
 * Get all quiz history for authenticated user
 * GET /api/quiz/history
 */
async function getQuizHistory(req, res) {
  try {
    const userId = req.user.id;

    const [attempts] = await pool.query(
      `SELECT 
        qa.id,
        qa.subject_id,
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
       LIMIT 50`,
      [userId]
    );

    return res.json({
      success: true,
      data: attempts,
    });
  } catch (error) {
    console.error('Error fetching quiz history:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve quiz history.',
      error: error.message,
    });
  }
}

module.exports = {
  startQuiz,
  submitQuiz,
  getQuizResult,
  getQuizHistory,
};
