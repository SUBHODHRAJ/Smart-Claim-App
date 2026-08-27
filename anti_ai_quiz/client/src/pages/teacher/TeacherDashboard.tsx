import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { performanceService, quizService, documentService } from '../../services';
import { StatsCard } from '../../components/StatsCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import {
  Users,
  FileQuestion,
  TrendingUp,
  FileText,
  Sparkles,
  AlertTriangle,
  Send,
  ArrowRight,
  ShieldCheck,
  BarChart3,
} from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [quizzesCount, setQuizzesCount] = useState(0);
  const [docsCount, setDocsCount] = useState(0);

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        setLoading(true);
        const [analyticRes, quizRes, docRes] = await Promise.all([
          performanceService.getTeacherAnalytics(),
          quizService.listQuizzes(),
          documentService.listDocuments(),
        ]);

        if (analyticRes.success) setAnalytics(analyticRes.data);
        if (quizRes.success) setQuizzesCount(quizRes.data.length);
        if (docRes.success) setDocsCount(docRes.data.length);
      } catch (err) {
        console.error('Failed to load teacher dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, []);

  if (loading) return <LoadingSpinner message="Loading instructor overview and class metrics..." />;

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-950/40 via-slate-900/90 to-brand-950/40 border border-emerald-500/20 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Teacher Review & Assessment Studio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100">
              Welcome, {user?.name}
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Generate source-grounded quizzes from lecture PDFs, review AI questions, and monitor class-wide weak areas.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/teacher/quizzes/create"
              className="px-5 py-3 bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-500/25 flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Quiz Generator Studio</span>
            </Link>
            <Link
              to="/teacher/documents"
              className="px-4 py-3 bg-slate-900 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors"
            >
              Upload Material
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Active Students"
          value={analytics?.totalStudents || 0}
          subtitle="Enrolled in class groups"
          icon={<Users className="w-5 h-5" />}
          color="emerald"
        />
        <StatsCard
          title="Created Quizzes"
          value={quizzesCount}
          subtitle="Assessments in Question Bank"
          icon={<FileQuestion className="w-5 h-5" />}
          color="blue"
        />
        <StatsCard
          title="Class Average Score"
          value={`${analytics?.averageScore || 0}%`}
          subtitle="Across all submitted attempts"
          icon={<TrendingUp className="w-5 h-5" />}
          color="indigo"
        />
        <StatsCard
          title="Course Materials"
          value={docsCount}
          subtitle="Processed PDFs & Documents"
          icon={<FileText className="w-5 h-5" />}
          color="amber"
        />
      </div>

      {/* Class Weak Areas & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class Weak Topics Alert (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <h3 className="font-bold text-slate-100 text-base">Class-Wide Problem Areas</h3>
            </div>
            <Link to="/teacher/analytics" className="text-xs text-brand-400 font-bold hover:text-brand-300">
              Full Analytics →
            </Link>
          </div>

          {analytics?.weakestClassTopics && analytics.weakestClassTopics.length > 0 ? (
            <div className="space-y-3">
              {analytics.weakestClassTopics.map((item: any) => (
                <div
                  key={item.topic}
                  className="p-4 bg-slate-950/80 border border-rose-500/20 rounded-2xl flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">{item.topic}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {item.correct} correct out of {item.totalQuestions} questions ({item.accuracy}% average)
                    </p>
                  </div>
                  <Link
                    to="/teacher/quizzes/create"
                    className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold rounded-xl transition-colors flex items-center space-x-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Remedial Quiz</span>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-400 bg-slate-950/60 rounded-2xl border border-slate-800">
              No severe weak topics detected across recent class attempts.
            </div>
          )}
        </div>

        {/* Quick Instructor Navigation (1 col) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-100 text-base mb-4">Instructor Toolkit</h3>
            <div className="space-y-2.5">
              <Link
                to="/teacher/quizzes/create"
                className="p-3.5 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 rounded-2xl flex items-center justify-between group transition-all"
              >
                <div className="flex items-center space-x-3">
                  <Sparkles className="w-4 h-4 text-brand-400" />
                  <span className="text-xs font-bold text-slate-200 group-hover:text-brand-300">
                    AI Question Generator Studio
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </Link>

              <Link
                to="/teacher/assignments"
                className="p-3.5 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 rounded-2xl flex items-center justify-between group transition-all"
              >
                <div className="flex items-center space-x-3">
                  <Send className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-slate-200 group-hover:text-indigo-300">
                    Assign Quizzes to Class
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </Link>

              <Link
                to="/teacher/documents"
                className="p-3.5 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 rounded-2xl flex items-center justify-between group transition-all"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-slate-200 group-hover:text-emerald-300">
                    Manage Course Materials
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <Link
              to="/teacher/analytics"
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center space-x-2"
            >
              <BarChart3 className="w-4 h-4" />
              <span>View Class Analytics</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
