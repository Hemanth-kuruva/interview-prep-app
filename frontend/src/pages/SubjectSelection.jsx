import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import {
  Database,
  Coffee,
  Server,
  Cpu,
  Network,
  Brain,
  Code2,
  BookOpen,
  Zap,
  CheckCircle2,
  Clock,
  Sparkles,
  SlidersHorizontal,
  ArrowRight
} from 'lucide-react';

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

export default function SubjectSelection() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Configuration States
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [mode, setMode] = useState('quiz'); // 'quiz' or 'practice'
  const [difficulty, setDifficulty] = useState('All'); // 'All', 'Easy', 'Medium', 'Hard'
  const [questionCount, setQuestionCount] = useState(5); // 5, 10, 15

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await api.get('/subjects');
        if (response.data.success) {
          setSubjects(response.data.data);
          const initialSubjectId = searchParams.get('subject');
          if (initialSubjectId) {
            const found = response.data.data.find((s) => String(s.id) === String(initialSubjectId));
            if (found) setSelectedSubject(found);
          } else if (response.data.data.length > 0) {
            setSelectedSubject(response.data.data[0]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch subjects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [searchParams]);

  const handleStart = () => {
    if (!selectedSubject) return;
    navigate(`/quiz?subject=${selectedSubject.id}&mode=${mode}&difficulty=${difficulty}&count=${questionCount}`);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-64 bg-slate-800 rounded-lg"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-slate-900 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
          <SlidersHorizontal className="w-8 h-8 text-brand-400" />
          <span>Configure Quiz Session</span>
        </h1>
        <p className="mt-1.5 text-sm text-slate-400">
          Customize your interview preparation parameters to match your targets.
        </p>
      </div>

      {/* Step 1: Select Subject */}
      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
          1. Choose Subject
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {subjects.map((sub) => {
            const IconComponent = iconMap[sub.icon] || BookOpen;
            const isSelected = selectedSubject?.id === sub.id;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSelectedSubject(sub)}
                className={`relative p-4 rounded-xl border text-left flex flex-col justify-between transition-all duration-200 ${
                  isSelected
                    ? 'bg-brand-500/15 border-brand-500 text-white ring-2 ring-brand-500/20 shadow-lg shadow-brand-500/10'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                {isSelected && (
                  <CheckCircle2 className="w-4 h-4 text-brand-400 absolute top-3 right-3" />
                )}
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2.5 ${isSelected ? 'bg-brand-500/20 text-brand-300' : 'bg-slate-800 text-slate-400'}`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">{sub.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{sub.total_questions} Questions</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Choose Mode */}
      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
          2. Choose Mode
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Timed Quiz */}
          <div
            onClick={() => setMode('quiz')}
            className={`cursor-pointer p-5 rounded-2xl border transition-all ${
              mode === 'quiz'
                ? 'bg-brand-500/10 border-brand-500 ring-2 ring-brand-500/20 shadow-lg'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2.5 rounded-xl ${mode === 'quiz' ? 'bg-brand-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}>
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-white">Timed Quiz Mode</h4>
                  <p className="text-xs text-slate-400">Simulates real interview test pressure</p>
                </div>
              </div>
              <input
                type="radio"
                name="mode"
                checked={mode === 'quiz'}
                onChange={() => setMode('quiz')}
                className="text-brand-500 focus:ring-brand-500"
              />
            </div>
            <ul className="mt-4 space-y-1.5 text-xs text-slate-300">
              <li className="flex items-center space-x-2">
                <Clock className="w-3.5 h-3.5 text-brand-400" />
                <span>60 seconds per question countdown</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
                <span>Answers & detailed reviews shown upon submission</span>
              </li>
            </ul>
          </div>

          {/* Practice Mode */}
          <div
            onClick={() => setMode('practice')}
            className={`cursor-pointer p-5 rounded-2xl border transition-all ${
              mode === 'practice'
                ? 'bg-blue-500/10 border-blue-500 ring-2 ring-blue-500/20 shadow-lg'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2.5 rounded-xl ${mode === 'practice' ? 'bg-blue-500 text-white font-bold' : 'bg-slate-800 text-slate-400'}`}>
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-white">Practice Mode</h4>
                  <p className="text-xs text-slate-400">Self-paced learning & instant feedback</p>
                </div>
              </div>
              <input
                type="radio"
                name="mode"
                checked={mode === 'practice'}
                onChange={() => setMode('practice')}
                className="text-blue-500 focus:ring-blue-500"
              />
            </div>
            <ul className="mt-4 space-y-1.5 text-xs text-slate-300">
              <li className="flex items-center space-x-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>No timer pressure; study at your own pace</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Instant explanation check available per question</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Step 3 & 4: Difficulty and Question Count */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Difficulty */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
            3. Select Difficulty
          </label>
          <div className="grid grid-cols-4 gap-2">
            {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => setDifficulty(diff)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                  difficulty === diff
                    ? 'bg-brand-500/20 border-brand-500 text-brand-300 shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Question Count */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
            4. Number of Questions
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[5, 10, 15, 20].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setQuestionCount(num)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                  questionCount === num
                    ? 'bg-brand-500/20 border-brand-500 text-brand-300 shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                {num} Questions
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Launch Button */}
      <div className="pt-4 border-t border-slate-800 flex justify-end">
        <button
          type="button"
          onClick={handleStart}
          disabled={!selectedSubject}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-500 to-emerald-400 hover:from-brand-400 hover:to-emerald-300 text-slate-950 font-extrabold text-sm shadow-xl shadow-brand-500/20 flex items-center justify-center space-x-2 transition-all hover:scale-105 disabled:opacity-50"
        >
          <span>Start {selectedSubject ? selectedSubject.name : ''} {mode === 'quiz' ? 'Timed Quiz' : 'Practice'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
