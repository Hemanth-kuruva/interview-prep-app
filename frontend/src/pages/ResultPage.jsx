import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  BarChart3,
  BookOpen,
  ArrowRight,
  Sparkles,
  HelpCircle
} from 'lucide-react';

export default function ResultPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'correct', 'wrong'

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/quiz/results/${attemptId}`);
        if (response.data.success) {
          setResult(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching result:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 font-medium text-sm">Calculating and analyzing results...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 glass-panel rounded-2xl text-center space-y-4">
        <XCircle className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Result Not Found</h2>
        <p className="text-sm text-slate-400">We could not load the details for this quiz attempt.</p>
        <Link
          to="/dashboard"
          className="inline-block px-5 py-2.5 rounded-xl bg-brand-500 text-slate-950 font-bold text-sm"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const {
    subject_name,
    mode,
    difficulty,
    score,
    total_questions,
    accuracy,
    time_taken,
    breakdown = [],
  } = result;

  const correctCount = score;
  const wrongCount = total_questions - score;

  const filteredQuestions = breakdown.filter((item) => {
    if (filterMode === 'correct') return item.is_correct;
    if (filterMode === 'wrong') return !item.is_correct;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Score Header Hero */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>QUIZ EVALUATION COMPLETE</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            {subject_name} ({mode === 'quiz' ? 'Timed Quiz' : 'Practice'})
          </h1>

          {/* Big Score Card */}
          <div className="my-6 inline-flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl min-w-[240px]">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Your Score</span>
            <div className="text-5xl sm:text-6xl font-black text-white my-1">
              <span className="text-brand-400">{score}</span>
              <span className="text-slate-600 text-3xl"> / {total_questions}</span>
            </div>
            <div className="mt-1 flex items-center space-x-2">
              <span className={`text-sm font-bold px-2.5 py-0.5 rounded-full ${accuracy >= 70 ? 'bg-emerald-500/20 text-emerald-400' : accuracy >= 40 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                {accuracy}% Accuracy
              </span>
            </div>
          </div>

          {/* Metrics Pills */}
          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <span className="text-[11px] font-semibold uppercase text-emerald-400 block">Correct</span>
              <span className="text-xl font-bold text-white">{correctCount}</span>
            </div>
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
              <span className="text-[11px] font-semibold uppercase text-rose-400 block">Wrong / Skipped</span>
              <span className="text-xl font-bold text-white">{wrongCount}</span>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
              <span className="text-[11px] font-semibold uppercase text-blue-400 block">Duration</span>
              <span className="text-xl font-bold text-white">{time_taken}s</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              to={`/quiz?subject=${result.subject_id}&mode=${mode}&difficulty=${difficulty}&count=${total_questions}`}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-sm shadow-md shadow-brand-500/20 transition-all hover:scale-105"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Session</span>
            </Link>
            <Link
              to="/select-subject"
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span>Choose Another Topic</span>
            </Link>
            <Link
              to="/progress"
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-all"
            >
              <BarChart3 className="w-4 h-4 text-brand-400" />
              <span>Full Analytics</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Question Breakdown Filter & List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-brand-400" />
            <span>Detailed Question Review</span>
          </h2>

          <div className="flex items-center space-x-2 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${filterMode === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              All ({breakdown.length})
            </button>
            <button
              onClick={() => setFilterMode('correct')}
              className={`px-3 py-1.5 rounded-lg transition-all ${filterMode === 'correct' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white'}`}
            >
              Correct ({correctCount})
            </button>
            <button
              onClick={() => setFilterMode('wrong')}
              className={`px-3 py-1.5 rounded-lg transition-all ${filterMode === 'wrong' ? 'bg-rose-500/20 text-rose-400' : 'text-slate-400 hover:text-white'}`}
            >
              Incorrect ({wrongCount})
            </button>
          </div>
        </div>

        {/* List of reviewed questions */}
        <div className="space-y-5">
          {filteredQuestions.map((q, index) => {
            const isCorrect = q.is_correct;
            return (
              <div
                key={q.question_id}
                className={`p-6 rounded-2xl border transition-all ${
                  isCorrect
                    ? 'bg-slate-900/80 border-slate-800 hover:border-emerald-500/30'
                    : 'bg-slate-900/80 border-slate-800 hover:border-rose-500/30'
                }`}
              >
                {/* Header status */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-400 uppercase">
                      Question {index + 1}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                      {q.difficulty}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {isCorrect ? (
                      <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Correct</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Incorrect</span>
                      </span>
                    )}
                  </div>
                </div>

                <h4 className="text-base font-semibold text-white mb-4 leading-relaxed">
                  {q.question}
                </h4>

                {/* Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                  {['A', 'B', 'C', 'D'].map((optKey) => {
                    const optText = q[`option_${optKey.toLowerCase()}`];
                    const isSelected = q.selected_answer === optKey;
                    const isCorrectAnswer = q.correct_answer === optKey;

                    let badgeStyle = 'bg-slate-900 border-slate-800 text-slate-400';
                    if (isCorrectAnswer) {
                      badgeStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/30';
                    } else if (isSelected && !isCorrectAnswer) {
                      badgeStyle = 'bg-rose-500/20 border-rose-500 text-rose-300 ring-1 ring-rose-500/30';
                    }

                    return (
                      <div
                        key={optKey}
                        className={`p-3 rounded-xl border text-xs flex items-start space-x-2.5 ${badgeStyle}`}
                      >
                        <span className="font-bold px-1.5 py-0.5 rounded bg-black/30 flex-shrink-0">
                          {optKey}
                        </span>
                        <span className="font-medium leading-relaxed">{optText}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {q.explanation && (
                  <div className="mt-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 space-y-1">
                    <span className="font-bold text-brand-400 flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Explanation:</span>
                    </span>
                    <p className="leading-relaxed text-slate-400">{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
