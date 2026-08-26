import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Timer from '../components/Timer';
import ProgressBar from '../components/ProgressBar';
import {
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Send,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  BookOpen,
  Zap,
  RotateCcw
} from 'lucide-react';

export default function QuizPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const subjectId = searchParams.get('subject') || '1';
  const mode = searchParams.get('mode') || 'quiz';
  const difficulty = searchParams.get('difficulty') || 'All';
  const count = parseInt(searchParams.get('count') || '5', 10);

  const [quizData, setQuizData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { [questionId]: 'A' | 'B' | 'C' | 'D' }
  const [showPracticeExplanation, setShowPracticeExplanation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [error, setError] = useState('');

  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    const startSession = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.post('/quiz/start', {
          subject_id: subjectId,
          mode,
          difficulty,
          count,
        });

        if (response.data.success) {
          setQuizData(response.data.data);
          setQuestions(response.data.data.questions || []);
          startTimeRef.current = Date.now();
        }
      } catch (err) {
        console.error('Failed to start quiz:', err);
        setError(err.response?.data?.message || 'Failed to load quiz session. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    startSession();
  }, [subjectId, mode, difficulty, count]);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (optionKey) => {
    if (!currentQ) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionKey,
    }));
  };

  const handleClearOption = () => {
    if (!currentQ) return;
    setUserAnswers((prev) => {
      const next = { ...prev };
      delete next[currentQ.id];
      return next;
    });
  };

  const handleNext = () => {
    setShowPracticeExplanation(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setShowPracticeExplanation(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (submitting) return;
    try {
      setSubmitting(true);
      setShowConfirmModal(false);

      const timeTakenSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);

      const answersPayload = questions.map((q) => ({
        question_id: q.id,
        selected_answer: userAnswers[q.id] || 'SKIP',
      }));

      const response = await api.post('/quiz/submit', {
        subject_id: subjectId,
        mode,
        difficulty,
        time_taken: timeTakenSeconds,
        answers: answersPayload,
      });

      if (response.data.success) {
        const attemptId = response.data.data.attempt_id;
        navigate(`/results/${attemptId}`);
      }
    } catch (err) {
      console.error('Error submitting quiz:', err);
      alert('Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const answeredCount = Object.keys(userAnswers).length;
  const unansweredCount = questions.length - answeredCount;

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 font-medium text-sm">Generating your technical questions...</p>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 glass-panel rounded-2xl text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Quiz Unavailable</h2>
        <p className="text-sm text-slate-400">{error || 'No questions available for this configuration.'}</p>
        <button
          onClick={() => navigate('/select-subject')}
          className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-sm transition-all"
        >
          Return to Subjects
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Quiz Top Navigation Header */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-start">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-white">{quizData?.subject_name}</h2>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${mode === 'quiz' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'}`}>
                {mode === 'quiz' ? 'Timed Quiz' : 'Practice'}
              </span>
            </div>
            <p className="text-xs text-slate-400">Difficulty: {difficulty}</p>
          </div>
        </div>

        {/* Timer in Quiz Mode */}
        {mode === 'quiz' && quizData?.time_limit_seconds && (
          <Timer
            initialSeconds={quizData.time_limit_seconds}
            onExpire={handleSubmitQuiz}
            isPaused={submitting}
          />
        )}
      </div>

      {/* Progress Bar & Quick Jump Grid */}
      <div className="space-y-3">
        <ProgressBar
          current={currentIndex}
          total={questions.length}
          answeredCount={answeredCount}
        />

        {/* Question Jump Dots */}
        <div className="flex items-center flex-wrap gap-1.5 pt-1">
          {questions.map((q, idx) => {
            const isAnswered = !!userAnswers[q.id];
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => {
                  setShowPracticeExplanation(false);
                  setCurrentIndex(idx);
                }}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                  isCurrent
                    ? 'bg-brand-500 text-slate-950 ring-2 ring-brand-400'
                    : isAnswered
                    ? 'bg-slate-800 text-brand-400 border border-brand-500/40'
                    : 'bg-slate-900 text-slate-500 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Question Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 relative space-y-6 shadow-2xl">
        
        {/* Question Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              currentQ.difficulty === 'Easy'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : currentQ.difficulty === 'Medium'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
            }`}
          >
            {currentQ.difficulty}
          </span>
        </div>

        {/* Question Text */}
        <h3 className="text-lg sm:text-xl font-semibold text-white leading-relaxed">
          {currentQ.question}
        </h3>

        {/* Options List */}
        <div className="space-y-3">
          {['A', 'B', 'C', 'D'].map((key) => {
            const optionField = `option_${key.toLowerCase()}`;
            const optionText = currentQ[optionField];
            const isSelected = userAnswers[currentQ.id] === key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSelectOption(key)}
                className={`w-full p-4 rounded-xl text-left border flex items-center space-x-3.5 transition-all duration-200 ${
                  isSelected
                    ? 'bg-brand-500/15 border-brand-500 text-white ring-1 ring-brand-500 shadow-md shadow-brand-500/10'
                    : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-colors ${
                    isSelected
                      ? 'bg-brand-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {key}
                </div>
                <span className="text-sm font-medium leading-relaxed">{optionText}</span>
              </button>
            );
          })}
        </div>

        {/* Practice Mode: Instant Explanation Dropdown */}
        {mode === 'practice' && currentQ.explanation && (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowPracticeExplanation(!showPracticeExplanation)}
              className="inline-flex items-center space-x-2 text-xs font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 px-3.5 py-2 rounded-lg border border-blue-500/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>{showPracticeExplanation ? 'Hide Answer & Explanation' : 'Reveal Correct Answer & Explanation'}</span>
            </button>

            {showPracticeExplanation && (
              <div className="mt-3 p-4 rounded-xl bg-blue-950/40 border border-blue-800/60 text-sm space-y-2">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase">
                  <CheckCircle className="w-4 h-4" />
                  <span>Correct Answer: Option {currentQ.correct_answer}</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">{currentQ.explanation}</p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Quiz Bottom Navigation */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        {userAnswers[currentQ.id] && (
          <button
            type="button"
            onClick={handleClearOption}
            className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Choice</span>
          </button>
        )}

        {currentIndex === questions.length - 1 ? (
          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            disabled={submitting}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-emerald-400 hover:from-brand-400 hover:to-emerald-300 text-slate-950 font-bold text-sm shadow-lg shadow-brand-500/20 transition-all hover:scale-105 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Submitting...' : 'Submit Quiz'}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-sm transition-all"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel max-w-md w-full p-6 rounded-2xl border border-slate-800 space-y-5 shadow-2xl">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Submit Quiz?</h4>
                <p className="text-xs text-slate-400">Are you sure you want to finish and calculate your score?</p>
              </div>
            </div>

            <div className="bg-slate-900/90 rounded-xl p-4 space-y-2 text-sm border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Questions:</span>
                <span className="font-bold text-white">{questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Answered:</span>
                <span className="font-bold text-brand-400">{answeredCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Unanswered / Skipped:</span>
                <span className="font-bold text-amber-400">{unansweredCount}</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800"
              >
                Review More
              </button>
              <button
                type="button"
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className="px-5 py-2 rounded-xl text-sm font-bold bg-brand-500 hover:bg-brand-400 text-slate-950 shadow-md shadow-brand-500/20 disabled:opacity-50"
              >
                {submitting ? 'Evaluating...' : 'Yes, Submit Now'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
