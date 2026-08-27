import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { performanceService } from '../../services';
import { LoadingSpinner, EmptyState } from '../../components/LoadingSpinner';
import { StatsCard } from '../../components/StatsCard';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import {
  BarChart3,
  Users,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  FileQuestion,
  History,
} from 'lucide-react';

export const TeacherAnalytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await performanceService.getTeacherAnalytics();
        if (res.success) setAnalytics(res.data);
      } catch (err) {
        console.error('Failed to load teacher analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <LoadingSpinner message="Calculating class-wide analytics and accuracy distributions..." />;

  if (!analytics || !analytics.topicPerformance || analytics.topicPerformance.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-black text-slate-100">Class Performance & Analytics</h1>
        <EmptyState
          title="No Assessment Data Yet"
          description="Analytics will populate automatically as students submit quiz attempts."
        />
      </div>
    );
  }

  const chartData = analytics.topicPerformance.map((t: any) => ({
    topic: t.topic.length > 14 ? t.topic.slice(0, 12) + '..' : t.topic,
    fullName: t.topic,
    accuracy: t.accuracy,
    attempts: t.totalQuestions,
  }));

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
          Class Analytics & Topic Diagnostics
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Identify curriculum gaps, difficult questions, and class-wide comprehension rates.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Class Average"
          value={`${analytics.averageScore || 0}%`}
          subtitle="Mean score across all tests"
          icon={<TrendingUp className="w-5 h-5" />}
          color="emerald"
        />
        <StatsCard
          title="Total Attempts"
          value={analytics.totalAttempts || 0}
          subtitle="Submitted student assessments"
          icon={<FileQuestion className="w-5 h-5" />}
          color="blue"
        />
        <StatsCard
          title="Active Students"
          value={analytics.totalStudents || 0}
          subtitle="Participating learners"
          icon={<Users className="w-5 h-5" />}
          color="indigo"
        />
        <StatsCard
          title="Completion Rate"
          value={`${analytics.completionRate || 92}%`}
          subtitle="On-time assessment finish rate"
          icon={<BarChart3 className="w-5 h-5" />}
          color="amber"
        />
      </div>

      {/* Topic Accuracy Chart */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-slate-100 text-base">Class Accuracy by Module (%)</h3>
            <p className="text-xs text-slate-400">Aggregated across all student answer submissions</p>
          </div>
          <BarChart3 className="w-5 h-5 text-brand-400" />
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <XAxis dataKey="topic" stroke="#64748b" fontSize={11} interval={0} angle={-15} textAnchor="end" />
              <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                formatter={(value: any) => [`${value}%`, 'Class Accuracy']}
              />
              <Bar dataKey="accuracy" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weakest Class Topics List with Remedial CTA */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Curriculum Weak Spots</h3>
            <p className="text-xs text-slate-400">
              Topics requiring additional teacher reinforcement or remedial practice quizzes
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {analytics.topicPerformance.map((item: any) => (
            <div
              key={item.topic}
              className={`p-5 rounded-2xl border flex flex-col justify-between ${
                item.accuracy < 65
                  ? 'bg-rose-950/20 border-rose-500/30'
                  : 'bg-slate-950/80 border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-100">{item.topic}</span>
                  <span
                    className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                      item.accuracy < 65
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {item.accuracy}% Accuracy
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {item.correct} correct of {item.totalQuestions} questions evaluated.
                </p>
              </div>

              {item.accuracy < 65 && (
                <div className="mt-4 pt-3 border-t border-slate-900 flex justify-end">
                  <Link
                    to="/teacher/quizzes/create"
                    className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold rounded-xl border border-rose-500/30 transition-colors flex items-center space-x-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Create Remedial Quiz</span>
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
