import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { aiService } from '../../services';
import { StudyPlan, StudyPlanDay } from '../../types';
import { LoadingSpinner, EmptyState } from '../../components/LoadingSpinner';
import {
  CalendarDays,
  Sparkles,
  CheckCircle2,
  Circle,
  Clock,
  ArrowRight,
  BookOpen,
  Layers,
  FileQuestion,
  RefreshCw,
} from 'lucide-react';

export const StudyPlanPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        setLoading(true);
        const res = await aiService.getActiveStudyPlan();
        if (res.success && res.data) {
          setPlan(res.data);
          // Load local task state if present
          const savedTasks = localStorage.getItem(`study_tasks_${res.data._id}`);
          if (savedTasks) {
            setCompletedTasks(JSON.parse(savedTasks));
          }
        }
      } catch (err) {
        console.error('Failed to load study plan:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, []);

  const handleToggleTask = (taskKey: string) => {
    setCompletedTasks((prev) => {
      const updated = { ...prev, [taskKey]: !prev[taskKey] };
      if (plan) {
        localStorage.setItem(`study_tasks_${plan._id}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleRegenerate = async () => {
    try {
      setRegenerating(true);
      const res = await aiService.generateStudyPlan();
      if (res.success) {
        setPlan(res.data);
        setCompletedTasks({});
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to regenerate study plan');
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) return <LoadingSpinner message="Generating personalized 7-day learning schedule..." />;

  const totalTasks = plan ? plan.days.reduce((acc, d) => acc + d.tasks.length, 0) : 0;
  const doneTasks = Object.values(completedTasks).filter(Boolean).length;
  const progressPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Header Card */}
      <div className="relative overflow-hidden bg-gradient-to-r from-brand-950/60 via-slate-900/90 to-indigo-950/40 border border-brand-500/20 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Learning Trajectory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100">
              Personalized 7-Day Study Plan
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Targeted growth plan tailored to your weakest topic (
              <span className="text-brand-300 font-bold">{plan?.primaryWeakTopic}</span>) with active recall intervals.
            </p>
          </div>

          <div className="flex flex-col items-end space-y-2">
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all border border-slate-700 flex items-center space-x-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
              <span>{regenerating ? 'Recalibrating...' : 'Regenerate Plan'}</span>
            </button>
            <span className="text-[11px] text-slate-400 font-semibold">
              {doneTasks} of {totalTasks} tasks completed ({progressPercent}%)
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 h-2 w-full bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-emerald-400 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* 7 Days List */}
      <div className="space-y-4">
        {plan?.days.map((day) => (
          <div
            key={day.dayNumber}
            className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm hover:border-slate-700 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 font-black text-xs flex items-center justify-center">
                  D{day.dayNumber}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">{day.title}</h3>
                  <p className="text-xs text-brand-300 font-medium">Focus: {day.topic}</p>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 italic">{day.focusArea}</span>
            </div>

            <div className="space-y-2.5 pt-2">
              {day.tasks.map((task, tIdx) => {
                const taskKey = `${day.dayNumber}_${tIdx}`;
                const isDone = !!completedTasks[taskKey];

                return (
                  <div
                    key={tIdx}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between group ${
                      isDone
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-400'
                        : 'bg-slate-950/70 border-slate-800/80 text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleTask(taskKey)}
                      className="flex items-center space-x-3 text-left flex-1"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-500 group-hover:text-slate-400 shrink-0" />
                      )}
                      <span className={`text-xs font-medium ${isDone ? 'line-through text-slate-500' : ''}`}>
                        {task.description}
                      </span>
                    </button>

                    <div className="flex items-center space-x-3 shrink-0 ml-4">
                      <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{task.estimatedMinutes}m</span>
                      </span>

                      {task.type === 'FLASHCARDS' && (
                        <Link
                          to="/student/flashcards"
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold rounded-lg transition-colors flex items-center space-x-1"
                        >
                          <Layers className="w-3 h-3" />
                          <span>Cards</span>
                        </Link>
                      )}
                      {(task.type === 'PRACTICE_QUIZ' || task.type === 'MOCK_TEST' || task.type === 'ASSESSMENT') && (
                        <Link
                          to="/student/quizzes"
                          className="px-2.5 py-1 bg-brand-500/20 hover:bg-brand-500 text-brand-300 hover:text-white text-[10px] font-bold rounded-lg transition-colors flex items-center space-x-1"
                        >
                          <FileQuestion className="w-3 h-3" />
                          <span>Quiz</span>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
