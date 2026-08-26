import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatCard from '../components/StatCard';
import {
  Database,
  Coffee,
  Server,
  Cpu,
  Network,
  Brain,
  Code2,
  BookOpen,
  Award,
  Zap,
  Clock,
  ArrowRight,
  TrendingUp,
  Flame,
  CheckCircle,
  Play
} from 'lucide-react';

// Icon resolver helper
const iconMap = {
  Database,
  Coffee,
  Server,
  Cpu,
  Network,
  Brain,
  Code2,
  BookOpen,
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [subjectsRes, progressRes] = await Promise.all([
          api.get('/subjects'),
          api.get('/progress/summary'),
        ]);

        if (subjectsRes.data.success) {
          setSubjects(subjectsRes.data.data);
        }
        if (progressRes.data.success) {
          setProgress(progressRes.data.data);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleStartPractice = (subjectId) => {
    navigate(`/quiz?subject=${subjectId}&mode=practice&difficulty=All&count=5`);
  };

  const handleStartQuiz = (subjectId) => {
    navigate(`/quiz?subject=${subjectId}&mode=quiz&difficulty=All&count=5`);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-slate-900 rounded-3xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-28 bg-slate-900 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-44 bg-slate-900 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-brand-950/40 border border-slate-800 p-8 shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-full bg-brand-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold mb-3">
              <Flame className="w-3.5 h-3.5" />
              <span>INTERVIEW PREPARATION ACTIVE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to practice, <span className="text-brand-400">{user?.name?.split(' ')[0]}</span>?
            </h1>
            <p className="mt-2 text-slate-400 text-sm max-w-xl">
              Sharpen your core engineering concepts with curated subject questions, timed tests, and detailed answer explanations.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/select-subject"
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-sm shadow-lg shadow-brand-500/20 transition-all hover:scale-105"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Customize Quiz</span>
            </Link>
            <Link
              to="/progress"
              className="inline-flex items-center space-x-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-all"
            >
              <span>View Analytics</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Quizzes Taken"
          value={progress?.total_quizzes || 0}
          subtitle="Completed sessions"
          icon={Award}
          color="emerald"
        />
        <StatCard
          title="Overall Accuracy"
          value={`${progress?.average_accuracy || 0}%`}
          subtitle={`${progress?.total_correct || 0} correct of ${progress?.total_questions_answered || 0}`}
          icon={TrendingUp}
          color="blue"
        />
        <StatCard
          title="Strongest Subject"
          value={progress?.strongest_subject?.name || 'N/A'}
          subtitle={progress?.strongest_subject ? `${progress.strongest_subject.accuracy}% accuracy` : 'Take quizzes to evaluate'}
          icon={Zap}
          color="purple"
        />
        <StatCard
          title="Time Practiced"
          value={`${Math.round((progress?.total_time_spent_seconds || 0) / 60)} min`}
          subtitle="Dedicated study time"
          icon={Clock}
          color="amber"
        />
      </div>

      {/* Subject Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Explore Subjects</h2>
            <p className="text-xs text-slate-400">Select a subject to start practicing or take a timed evaluation.</p>
          </div>
          <Link
            to="/select-subject"
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center space-x-1"
          >
            <span>Advanced Config</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((sub) => {
            const IconComponent = iconMap[sub.icon] || BookOpen;
            return (
              <div
                key={sub.id}
                className="group relative rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-brand-500/40 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/5 hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center text-brand-400 group-hover:bg-brand-500/10 group-hover:border-brand-500/30 transition-colors">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60">
                      {sub.total_questions} Questions
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-brand-300 transition-colors">
                    {sub.name}
                  </h3>
                  <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {sub.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => handleStartPractice(sub.id)}
                    className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-brand-400" />
                    <span>Practice</span>
                  </button>
                  <button
                    onClick={() => handleStartQuiz(sub.id)}
                    className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg text-xs font-bold bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 border border-brand-500/30 transition-colors"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Timed Quiz</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Attempts Section */}
      {progress?.recent_attempts && progress.recent_attempts.length > 0 && (
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-brand-400" />
              <span>Recent Activity</span>
            </h2>
            <Link to="/progress" className="text-xs font-semibold text-slate-400 hover:text-white">
              View All History
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-800/50 text-slate-400 border-b border-slate-700/50">
                <tr>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Mode</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Accuracy</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {progress.recent_attempts.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-semibold text-white">{att.subject_name}</td>
                    <td className="px-4 py-3 capitalize">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${att.mode === 'quiz' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                        {att.mode}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-medium text-slate-200">
                      {att.score} / {att.total_questions}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${att.accuracy >= 70 ? 'text-emerald-400' : att.accuracy >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                        {att.accuracy}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {new Date(att.attempted_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/results/${att.id}`}
                        className="text-xs font-semibold text-brand-400 hover:text-brand-300 hover:underline"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
