import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { quizService, assignmentService } from '../../services';
import { Quiz, AssignmentItem } from '../../types';
import { LoadingSpinner, EmptyState } from '../../components/LoadingSpinner';
import { FileQuestion, Clock, BarChart2, Play, Search, Filter, Sparkles, Send } from 'lucide-react';

export const StudentQuizzes: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [quizRes, assignRes] = await Promise.all([
          quizService.listQuizzes(),
          assignmentService.listForStudent(),
        ]);

        if (quizRes.success) setQuizzes(quizRes.data);
        if (assignRes.success) setAssignments(assignRes.data);
      } catch (err) {
        console.error('Failed to load quizzes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredQuizzes = quizzes.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.topic && q.topic.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDiff = selectedDifficulty === 'ALL' || q.difficulty === selectedDifficulty;
    return matchesSearch && matchesDiff;
  });

  if (loading) return <LoadingSpinner message="Fetching quizzes and assignments..." />;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
          Available Quizzes & Assessments
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Take teacher-assigned tests or practice with AI-curated modules.
        </p>
      </div>

      {/* Teacher Assigned Tests Section */}
      {assignments.length > 0 && (
        <div className="bg-slate-900/80 border border-brand-500/20 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <Send className="w-5 h-5 text-brand-400" />
            <h2 className="text-lg font-bold text-slate-100">Assigned Quizzes from Instructor</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignments.map((a) => (
              <div
                key={a._id}
                className="p-5 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col justify-between hover:border-brand-500/40 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 px-2 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20">
                      Assigned
                    </span>
                    <span className="text-xs text-slate-400">
                      Due: {new Date(a.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-100 text-sm mb-1">{a.quizTitle}</h3>
                  <div className="flex items-center space-x-3 text-xs text-slate-400 mt-2">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{a.timeLimitMinutes} mins</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <FileQuestion className="w-3.5 h-3.5" />
                      <span>Max {a.attemptsAllowed} attempts</span>
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-900">
                  <Link
                    to={`/student/attempt/${a.quizId._id || a.quizId}`}
                    className="w-full py-2 bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-brand-500/20 flex items-center justify-center space-x-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start Timed Test</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search topic or title..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-brand-500"
          >
            <option value="ALL">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>
      </div>

      {/* All Quizzes Grid */}
      {filteredQuizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <div
              key={quiz._id}
              className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      quiz.difficulty === 'HARD'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : quiz.difficulty === 'EASY'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {quiz.difficulty}
                  </span>
                  {quiz.isAdaptive && (
                    <span className="flex items-center space-x-1 text-[10px] font-bold text-brand-300 bg-brand-500/10 px-2 py-0.5 rounded-full border border-brand-500/20">
                      <Sparkles className="w-3 h-3" />
                      <span>Adaptive</span>
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-100 group-hover:text-brand-300 transition-colors line-clamp-2">
                  {quiz.title}
                </h3>
                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {quiz.description || 'Comprehensive evaluation module.'}
                </p>

                <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-slate-400">
                  <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{quiz.timeLimitMinutes} Mins</span>
                  </div>
                  <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center space-x-1.5">
                    <FileQuestion className="w-3.5 h-3.5 text-slate-400" />
                    <span>{Array.isArray(quiz.questionIds) ? quiz.questionIds.length : 0} Questions</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80">
                <Link
                  to={`/student/attempt/${quiz._id}`}
                  className="w-full py-2.5 bg-slate-800 hover:bg-brand-600 text-slate-200 hover:text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center space-x-2"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Begin Quiz</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Quizzes Available"
          description="There are currently no published quizzes matching your search criteria."
        />
      )}
    </div>
  );
};
