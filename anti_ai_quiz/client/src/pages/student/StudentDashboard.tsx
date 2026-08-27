import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { performanceService, aiService, assignmentService, attemptService } from '../../services';
import { PerformanceSummary, AIRecommendation, AssignmentItem, Attempt } from '../../types';
import { StatsCard } from '../../components/StatsCard';
import { LoadingSpinner, EmptyState } from '../../components/LoadingSpinner';
import {
  BrainCircuit,
  Flame,
  Award,
  BarChart2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Play,
  Calendar,
  Layers,
  History,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<PerformanceSummary | null>(null);
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<Attempt[]>([]);
  const [generatingAdaptive, setGeneratingAdaptive] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [perfRes, assignRes, attemptRes] = await Promise.all([
          performanceService.getStudentPerformance(),
          assignmentService.listForStudent(),
          attemptService.listUserAttempts(),
        ]);

        if (perfRes.success) setSummary(perfRes.data);
        if (assignRes.success) setAssignments(assignRes.data);
        if (attemptRes.success) setRecentAttempts(attemptRes.data.slice(0, 5));

        // Load AI recommendation
        try {
          const aiRecRes = await aiService.analyzePerformance();
          if (aiRecRes.success) setRecommendation(aiRecRes.data);
        } catch (e) {
          // Fallback if AI call has issue
        }
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleStartAdaptive = async () => {
    try {
      setGeneratingAdaptive(true);
      const res = await aiService.generateAdaptiveQuiz({
        topic: recommendation?.primaryWeakTopic || summary?.weakTopics[0] || 'Core Review',
        questionCount: 8,
      });
      if (res.success && res.data._id) {
        navigate(`/student/attempt/${res.data._id}`);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to start adaptive quiz');
    } finally {
      setGeneratingAdaptive(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Assembling personalized study dashboard..." />;
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-brand-900/60 via-indigo-950/40 to-slate-900/80 border border-brand-500/20 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personalized Learning Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              {summary && summary.weakTopics.length > 0
                ? `System detected growth opportunity in "${summary.weakTopics[0]}". Let's master it today.`
                : 'Keep your knowledge sharp with AI-calibrated practice and source-grounded flashcards.'}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleStartAdaptive}
              disabled={generatingAdaptive}
              className="px-5 py-3 bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-brand-500/25 flex items-center space-x-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{generatingAdaptive ? 'Calibrating Questions...' : 'Start Adaptive Quiz'}</span>
            </button>
            <Link
              to="/student/quizzes"
              className="px-4 py-3 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all"
            >
              Browse All Quizzes
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Quizzes Completed"
          value={summary?.totalQuizzesTaken || 0}
          subtitle="Total submitted tests"
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="blue"
        />
        <StatsCard
          title="Overall Accuracy"
          value={`${summary?.overallAccuracy || 0}%`}
          subtitle="All attempted questions"
          icon={<BarChart2 className="w-5 h-5" />}
          color="emerald"
        />
        <StatsCard
          title="Daily Study Streak"
          value={`${user?.currentStreak || summary?.currentStreak || 0} Days`}
          subtitle={`Best: ${user?.longestStreak || summary?.longestStreak || 0} days`}
          icon={<Flame className="w-5 h-5 fill-amber-400" />}
          color="amber"
        />
        <StatsCard
          title="Earned Points"
          value={user?.points || 0}
          subtitle="Level: Apprentice Scholar"
          icon={<Award className="w-5 h-5" />}
          color="indigo"
        />
      </div>

      {/* AI Recommendation & Weak Topic Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-base">AI Intelligent Diagnostics</h3>
                <p className="text-xs text-slate-400">Based on historical attempt accuracy</p>
              </div>
            </div>
            {summary && summary.weakTopics.length > 0 && (
              <span className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold rounded-full flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Weak Area: {summary.weakTopics[0]}</span>
              </span>
            )}
          </div>

          <div className="space-y-4">
            {recommendation ? (
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Targeted Study Recommendation:
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  {recommendation.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-brand-400 font-bold">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-2 flex flex-wrap gap-2">
                  <Link
                    to="/student/study-plan"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-brand-500/20 hover:bg-brand-500/30 text-brand-300 border border-brand-500/30 rounded-lg text-xs font-bold transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>View 7-Day Action Plan</span>
                  </Link>
                  <Link
                    to="/student/flashcards"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-colors"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Drill Weak Flashcards</span>
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Complete more quizzes to unlock deep AI diagnostic reports.
              </p>
            )}

            {/* Topic Accuracy Progress Bars */}
            <div className="space-y-2.5 pt-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Topic Mastery Breakdown
              </span>
              {summary && summary.topics.length > 0 ? (
                summary.topics.slice(0, 4).map((top) => (
                  <div key={top.topic} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-200">{top.topic}</span>
                      <span className={top.accuracy < 60 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                        {top.accuracy}% ({top.correct}/{top.questionsAttempted})
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          top.accuracy < 60 ? 'bg-rose-500' : top.accuracy < 80 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${top.accuracy}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No topic attempts recorded yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Assigned Quizzes Sidebar */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-100 text-base">Assigned By Teacher</h3>
              <Link to="/student/quizzes" className="text-xs text-brand-400 hover:text-brand-300 font-semibold">
                See All
              </Link>
            </div>

            <div className="space-y-3">
              {assignments.length > 0 ? (
                assignments.slice(0, 3).map((assign) => (
                  <div
                    key={assign._id}
                    className="p-3.5 bg-slate-950/80 border border-slate-800/90 rounded-2xl hover:border-slate-700 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-brand-300 transition-colors">
                        {assign.quizTitle}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Due: {new Date(assign.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Link
                      to={`/student/attempt/${assign.quizId._id || assign.quizId}`}
                      className="p-2 bg-brand-500/10 hover:bg-brand-500 text-brand-400 hover:text-white rounded-xl transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-slate-500">
                  No pending assignments from your instructor.
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <Link
              to="/student/performance"
              className="w-full py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center space-x-2"
            >
              <span>Explore Full Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Attempts */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-slate-100 text-base">Recent Test Attempts</h3>
          </div>
          <Link to="/student/performance" className="text-xs text-brand-400 hover:text-brand-300 font-semibold">
            History
          </Link>
        </div>

        {recentAttempts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentAttempts.map((att) => (
              <div
                key={att._id}
                className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-200 truncate max-w-[160px]">
                      {att.quizTitle}
                    </span>
                    <span
                      className={`text-xs font-black px-2 py-0.5 rounded-full ${
                        att.percentage >= 80
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : att.percentage >= 60
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {att.percentage}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Score: {att.score} / {att.totalQuestions} • {Math.round(att.timeTakenSeconds / 60)} mins
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-900 flex justify-end">
                  <Link
                    to={`/student/results/${att._id}`}
                    className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center space-x-1"
                  >
                    <span>View Explanations</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-slate-500">
            You haven't completed any quizzes yet. Take your first test to see performance insights!
          </div>
        )}
      </div>
    </div>
  );
};
