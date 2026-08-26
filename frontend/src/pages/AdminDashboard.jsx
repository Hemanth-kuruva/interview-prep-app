import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatCard from '../components/StatCard';
import {
  ShieldCheck,
  Plus,
  Search,
  Edit2,
  Trash2,
  HelpCircle,
  X,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Users,
  Award,
  Layers
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    subject_id: '',
    question: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A',
    difficulty: 'Medium',
    explanation: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, subRes, qRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/subjects'),
        api.get(`/admin/questions?subject_id=${selectedSubject}&difficulty=${selectedDifficulty}&search=${encodeURIComponent(search)}`),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (subRes.data.success) setSubjects(subRes.data.data);
      if (qRes.data.success) setQuestions(qRes.data.data);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedSubject, selectedDifficulty]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      subject_id: subjects.length > 0 ? subjects[0].id : '',
      question: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: 'A',
      difficulty: 'Medium',
      explanation: '',
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (q) => {
    setIsEditing(true);
    setCurrentId(q.id);
    setFormData({
      subject_id: q.subject_id,
      question: q.question,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_answer: q.correct_answer,
      difficulty: q.difficulty,
      explanation: q.explanation || '',
    });
    setShowModal(true);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/admin/questions/${currentId}`, formData);
      } else {
        await api.post('/admin/questions', formData);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error('Failed to save question:', err);
      alert(err.response?.data?.message || 'Error saving question.');
    }
  };

  const handleDeleteQuestion = async (id) => {
    try {
      await api.delete(`/admin/questions/${id}`);
      setDeleteConfirmId(null);
      fetchData();
    } catch (err) {
      console.error('Failed to delete question:', err);
      alert('Error deleting question.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ADMINISTRATOR CONTROL PANEL</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Question & Subject Management
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Create, update, organize, and monitor technical interview questions across all subjects.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-sm shadow-md shadow-brand-500/20 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Question</span>
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard
          title="Total Interview Questions"
          value={stats?.total_questions || 0}
          subtitle="Across all CS domains"
          icon={BookOpen}
          color="emerald"
        />
        <StatCard
          title="Registered Students"
          value={stats?.total_students || 0}
          subtitle="Active candidates"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Total Quiz Submissions"
          value={stats?.total_attempts || 0}
          subtitle="Evaluation sessions"
          icon={Award}
          color="amber"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions or topics..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </form>

        <div className="flex items-center space-x-2.5">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-300 focus:outline-none focus:border-brand-500"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-300 focus:outline-none focus:border-brand-500"
          >
            <option value="all">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Questions Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Questions Repository ({questions.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-800/60 text-slate-400 border-b border-slate-700/60">
              <tr>
                <th className="px-5 py-3.5">Subject</th>
                <th className="px-5 py-3.5">Difficulty</th>
                <th className="px-5 py-3.5">Question</th>
                <th className="px-5 py-3.5">Correct</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {questions.length > 0 ? (
                questions.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4 font-semibold text-white whitespace-nowrap">
                      {q.subject_name}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                        q.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' :
                        q.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="px-5 py-4 max-w-md">
                      <p className="line-clamp-2 font-medium text-slate-200">{q.question}</p>
                    </td>
                    <td className="px-5 py-4 font-bold text-brand-400 whitespace-nowrap">
                      Option {q.correct_answer}
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(q)}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-brand-400 hover:bg-slate-700 transition-colors"
                          title="Edit Question"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(q.id)}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete Question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-500 text-sm">
                    No questions found matching the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Question Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="glass-panel max-w-2xl w-full p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-brand-400" />
                <span>{isEditing ? 'Edit Question' : 'Add New Question'}</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                    Subject
                  </label>
                  <select
                    required
                    value={formData.subject_id}
                    onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                    Difficulty
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                  Question Text
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="e.g. What is the difference between TRUNCATE and DELETE?"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-brand-500"
                />
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {['a', 'b', 'c', 'd'].map((key) => {
                  const upperKey = key.toUpperCase();
                  return (
                    <div key={key}>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Option {upperKey}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData[`option_${key}`]}
                        onChange={(e) => setFormData({ ...formData, [`option_${key}`]: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Correct Answer Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-2">
                  Correct Answer Key
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['A', 'B', 'C', 'D'].map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFormData({ ...formData, correct_answer: key })}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        formData.correct_answer === key
                          ? 'bg-brand-500/20 border-brand-500 text-brand-300 ring-1 ring-brand-500'
                          : 'bg-slate-900 border-slate-700 text-slate-400'
                      }`}
                    >
                      Option {key}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                  Detailed Explanation / Concept Note
                </label>
                <textarea
                  rows={2}
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  placeholder="Explain why the correct answer is right..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs shadow-md shadow-brand-500/20"
                >
                  {isEditing ? 'Save Changes' : 'Create Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel max-w-sm w-full p-6 rounded-2xl border border-slate-800 space-y-4 shadow-2xl text-center">
            <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
            <h4 className="text-lg font-bold text-white">Confirm Deletion</h4>
            <p className="text-xs text-slate-400">
              Are you sure you want to permanently delete question #{deleteConfirmId}? This cannot be undone.
            </p>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteQuestion(deleteConfirmId)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
