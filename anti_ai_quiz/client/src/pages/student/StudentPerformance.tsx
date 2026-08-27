import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { performanceService, aiService } from '../../services';
import { PerformanceSummary, AIRecommendation } from '../../types';
import { LoadingSpinner, EmptyState } from '../../components/LoadingSpinner';
import { StatsCard } from '../../components/StatsCard';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  BrainCircuit,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Play,
  Layers,
  Calendar,
  BarChart2,
  Award,
} from 'lucide-react';

export const StudentPerformance: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<PerformanceSummary | null>(null);
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [generatingAdaptive, setGeneratingAdaptive] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [perfRes, aiRes] = await Promise.all([
          performanceService.getStudentPerformance(),
          aiService.analyzePerformance(),
        ]);

        if (perfRes.success) setSummary(perfRes.data);
        if (aiRes.success) setRecommendation(aiRes.data);
      } catch (err) {
        console.error('Failed to load performance analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const handleLaunchAdaptive = async (topic?: string) => {
    try {
      setGeneratingAdaptive(true);
      const res = await aiService.generateAdaptiveQuiz({
        topic: topic || summary?.weakTopics[0] || 'Core Concepts',
        questionCount: 8,
      });
      if (res.success && res.data._id) {
        navigate(`/student/attempt/${res.data._id}`);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to generate adaptive quiz.');
    } finally {
      setGeneratingAdaptive(false);
    }
  };

  if (loading) return <LoadingSpinner message="Calculating deep mastery analytics & weak topics..." />;

  if (!summary || summary.topics.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-black text-slate-100">Performance & Weak Topic Engine</h1>
        <EmptyState
          title="No Performance Data Yet"
          description="Complete your first quiz or assessment to generate AI-driven mastery graphs, weak-topic detection, and adaptive learning trajectories."
          actionText="Take a Quiz Now"
          onAction={() => navigate('/student/quizzes')}
        />
      </div>
    );
  }

  const chartData = summary.topics.map((t) => ({
    topic: t.topic.length > 14 ? t.topic.slice(0, 12) + '..' : t.topic,
    fullName: t.topic,
    accuracy: t.accuracy,
    attempts: t.questionsAttempted,
  }));

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
            Learning Analytics & Weak Topic Detection
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Deterministic performance tracking connected directly with AI adaptive recommendations.
          </p>
        </div>

        <button
          onClick={() => handleLaunchAdaptive()}
          disabled={generatingAdaptive}
          className="px-5 py-3 bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-500/25 flex items-center space-x-2 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{generatingAdaptive ? 'Calibrating...' : 'Launch Adaptive Practice'}</span>
        </button>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Overall Accuracy"
          value={`${summary.overallAccuracy}%`}
          subtitle="Cumulative score across all modules"
          icon={<TrendingUp className="w-5 h-5" />}
          color="blue"
        />
        <StatsCard
          title="Weak Topics Detected"
          value={summary.weakTopics.length}
          subtitle="Accuracy under target threshold"
          icon={<AlertTriangle className="w-5 h-5" />}
          color="rose"
        />
        <StatsCard
          title="Mastered Areas"
          value={summary.strongTopics.length}
          subtitle="Accuracy 75% or higher"
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="emerald"
        />
        <StatsCard
          title="Next Calibrated Level"
          value={summary.recommendedDifficulty}
          subtitle="Adaptive engine recommendation"
          icon={<BrainCircuit className="w-5 h-5" />}
          color="indigo"
        />
      </div>

      {/* Interactive Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topic Accuracy Bar Chart */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Topic Accuracy (%)</h3>
              <p className="text-xs text-slate-400">Directly measured from quiz questions</p>
            </div>
            <BarChart2 className="w-5 h-5 text-brand-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="topic" stroke="#64748b" fontSize={11} interval={0} angle={-20} textAnchor="end" />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                  formatter={(value: any) => [`${value}%`, 'Accuracy']}
                />
                <Bar dataKey="accuracy" fill="#0284c7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Mastery Chart */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Knowledge Radar</h3>
              <p className="text-xs text-slate-400">Multi-topic mastery profile</p>
            </div>
            <BrainCircuit className="w-5 h-5 text-indigo-400" />
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="topic" stroke="#94a3b8" fontSize={10} />
                <PolarRadiusAxis stroke="#475569" domain={[0, 100]} />
                <Radar name="Accuracy" dataKey="accuracy" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Weak Topic Targeted Action List */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Growth Focus Areas</h3>
              <p className="text-xs text-slate-400">
                Topics prioritized by the adaptive engine for rapid score recovery
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {summary.topics.map((t) => (
            <div
              key={t.topic}
              className={`p-5 rounded-2xl border flex flex-col justify-between ${
                t.isWeak
                  ? 'bg-rose-950/20 border-rose-500/30'
                  : 'bg-slate-950/70 border-slate-800/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-100">{t.topic}</span>
                  <span
                    className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                      t.isWeak
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {t.accuracy}% Accuracy
                  </span>
                </div>

                <p className="text-xs text-slate-400">
                  {t.correct} correct out of {t.questionsAttempted} questions attempted.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {t.isWeak ? 'Recommended: 10 Adaptive MCQs' : 'Mastered & Maintained'}
                </span>
                <button
                  type="button"
                  onClick={() => handleLaunchAdaptive(t.topic)}
                  className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center space-x-1"
                >
                  <span>Practice Topic</span>
                  <Play className="w-3 h-3 fill-current" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
