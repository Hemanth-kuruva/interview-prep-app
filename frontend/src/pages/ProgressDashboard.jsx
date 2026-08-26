import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatCard from '../components/StatCard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Award,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export default function ProgressDashboard() {
  const [progress, setProgress] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [progressRes, historyRes] = await Promise.all([
          api.get('/progress/summary'),
          api.get('/quiz/history'),
        ]);

        if (progressRes.data.success) {
          setProgress(progressRes.data.data);
        }
        if (historyRes.data.success) {
          setHistory(historyRes.data.data);
        }
      } catch (err) {
        console.error('Failed to load progress data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-64 bg-slate-800 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-slate-900 rounded-xl" />
            ))}
          </div>
          <div className="h-80 bg-slate-900 rounded-2xl" />
        </div>
      </div>
    );
  }

  const subjectChartData = progress?.subject_breakdown?.map((s) => ({
    name: s.subject_name,
    accuracy: parseFloat(s.avg_accuracy),
    attempts: s.attempts_count,
  })) || [];

  const historyTrendData = [...history].reverse().map((h, i) => ({
    index: `#${i + 1}`,
    subject: h.subject_name,
    accuracy: parseFloat(h.accuracy),
    score: `${h.score}/${h.total_questions}`,
  }));

  const getBarColor = (accuracy) => {
    if (accuracy >= 80) return '#22c55e'; // emerald
    if (accuracy >= 60) return '#3b82f6'; // blue
    if (accuracy >= 40) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
            <BarChart3 className="w-8 h-8 text-brand-400" />
            <span>Progress & Analytics Dashboard</span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Real-time breakdown of subject competencies, trends, and quiz evaluations.
          </p>
        </div>

        <Link
          to="/select-subject"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-sm shadow-md shadow-brand-500/20 transition-all hover:scale-105"
        >
          <span>Take New Quiz</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Quizzes"
          value={progress?.total_quizzes || 0}
          subtitle="Attempts recorded"
          icon={Award}
          color="emerald"
        />
        <StatCard
          title="Average Accuracy"
          value={`${progress?.average_accuracy || 0}%`}
          subtitle={`${progress?.total_correct || 0} correct total`}
          icon={TrendingUp}
          color="blue"
        />
        <StatCard
          title="Strongest Topic"
          value={progress?.strongest_subject?.name || 'N/A'}
          subtitle={progress?.strongest_subject ? `${progress.strongest_subject.accuracy}% accuracy` : 'Keep practicing'}
          icon={Zap}
          color="purple"
        />
        <StatCard
          title="Area to Improve"
          value={progress?.weakest_subject?.name || 'N/A'}
          subtitle={progress?.weakest_subject ? `${progress.weakest_subject.accuracy}% accuracy` : 'No weak topics yet'}
          icon={AlertCircle}
          color="rose"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Subject Accuracy Bar Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Layers className="w-5 h-5 text-brand-400" />
              <span>Subject-Wise Accuracy (%)</span>
            </h3>
            <span className="text-xs text-slate-400 font-semibold">Target: 80%+</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectChartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b" 
                  fontSize={11} 
                  angle={-25} 
                  textAnchor="end" 
                />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(value, name) => [`${value}%`, 'Accuracy']}
                />
                <Bar dataKey="accuracy" radius={[6, 6, 0, 0]}>
                  {subjectChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.accuracy)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Accuracy Trend Over Time */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <span>Recent Attempt Trends</span>
            </h3>
            <span className="text-xs text-slate-400 font-semibold">Chronological</span>
          </div>

          <div className="h-64 w-full">
            {historyTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="accuracyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="index" stroke="#64748b" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(value, name, item) => [`${value}% (${item.payload.subject})`, 'Score']}
                  />
                  <Area
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#38bdf8"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#accuracyGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                No attempt history available yet.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Subject Progress Visual Bars */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white">Subject Mastery Level</h3>
        
        <div className="space-y-4">
          {progress?.subject_breakdown?.map((sub) => {
            const acc = parseFloat(sub.avg_accuracy);
            return (
              <div key={sub.subject_id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-200">{sub.subject_name}</span>
                  <div className="flex items-center space-x-3">
                    <span className="text-slate-400 font-normal">{sub.attempts_count} Attempts ({sub.total_correct}/{sub.total_questions} correct)</span>
                    <span className={`font-bold ${acc >= 70 ? 'text-emerald-400' : acc >= 40 ? 'text-amber-400' : 'text-slate-400'}`}>
                      {acc}%
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700/40">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${acc}%`,
                      backgroundColor: getBarColor(acc),
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full Quiz Attempts History Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-brand-400" />
            <span>Complete Attempt Logs</span>
          </h3>
          <span className="text-xs text-slate-400 font-medium">{history.length} Sessions Logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-800/60 text-slate-400 border-b border-slate-700/60">
              <tr>
                <th className="px-5 py-3.5">Subject</th>
                <th className="px-5 py-3.5">Mode</th>
                <th className="px-5 py-3.5">Difficulty</th>
                <th className="px-5 py-3.5">Score</th>
                <th className="px-5 py-3.5">Accuracy</th>
                <th className="px-5 py-3.5">Duration</th>
                <th className="px-5 py-3.5">Attempted Date</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {history.length > 0 ? (
                history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4 font-semibold text-white">{item.subject_name}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold capitalize ${item.mode === 'quiz' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                        {item.mode}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400">{item.difficulty}</td>
                    <td className="px-5 py-4 font-mono font-bold text-slate-200">
                      {item.score} / {item.total_questions}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`font-bold ${item.accuracy >= 70 ? 'text-emerald-400' : item.accuracy >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                        {item.accuracy}%
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400">{item.time_taken}s</td>
                    <td className="px-5 py-4 text-xs text-slate-400">
                      {new Date(item.attempted_at).toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        to={`/results/${item.id}`}
                        className="inline-flex items-center space-x-1 text-xs font-bold text-brand-400 hover:text-brand-300 hover:underline"
                      >
                        <span>Review</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-slate-500 text-sm">
                    No quiz history recorded yet. Start practicing to see your data!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
