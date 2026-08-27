import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { quizService, assignmentService } from '../../services';
import { Quiz } from '../../types';
import { LoadingSpinner, EmptyState } from '../../components/LoadingSpinner';
import {
  FileQuestion,
  Sparkles,
  Send,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  BarChart2,
} from 'lucide-react';

export const TeacherQuizzes: React.FC = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningQuiz, setAssigningQuiz] = useState<Quiz | null>(null);
  const [dueDate, setDueDate] = useState('');
  const [timeLimit, setTimeLimit] = useState(20);
  const [attemptsAllowed, setAttemptsAllowed] = useState(3);
  const [assigning, setAssigning] = useState(false);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const res = await quizService.listQuizzes();
      if (res.success) setQuizzes(res.data);
    } catch (err) {
      console.error('Failed to load teacher quizzes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleTogglePublish = async (quiz: Quiz) => {
    try {
      const newStatus = !quiz.isPublished;
      const res = await quizService.publishQuiz(quiz._id, newStatus);
      if (res.success) {
        setQuizzes((prev) =>
          prev.map((q) => (q._id === quiz._id ? { ...q, isPublished: newStatus } : q))
        );
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update publish state.');
    }
  };

  const handleDeleteQuiz = async (id: string) => {
    if (!window.confirm('Delete this assessment and its questions?')) return;
    try {
      await quizService.deleteQuiz(id);
      setQuizzes((prev) => prev.filter((q) => q._id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete quiz.');
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningQuiz || !dueDate) return;

    try {
      setAssigning(true);
      const res = await assignmentService.create({
        quizId: assigningQuiz._id,
        targetRole: 'ALL',
        classGroup: 'Class 101',
        dueDate,
        timeLimitMinutes: timeLimit,
        attemptsAllowed,
      });

      if (res.success) {
        alert(`Quiz "${assigningQuiz.title}" assigned to class successfully!`);
        setAssigningQuiz(null);
        navigate('/teacher/assignments');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to assign quiz.');
    } finally {
      setAssigning(false);
    }
  };

  if (loading && quizzes.length === 0) return <LoadingSpinner message="Loading quizzes..." />;

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
            Question Bank & Published Quizzes
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your verified assessments, toggle student visibility, and assign tests to classes.
          </p>
        </div>

        <Link
          to="/teacher/quizzes/create"
          className="px-4 py-2.5 bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-500/20 flex items-center space-x-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>New AI Assessment</span>
        </Link>
      </div>

      {/* Quizzes List */}
      {quizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div
              key={quiz._id}
              className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      quiz.isPublished
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {quiz.isPublished ? 'Published' : 'Draft / Unpublished'}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleDeleteQuiz(quiz._id)}
                    className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="text-base font-bold text-slate-100 line-clamp-2 mb-1">{quiz.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">{quiz.description}</p>

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

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleTogglePublish(quiz)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors ${
                    quiz.isPublished
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500'
                  }`}
                >
                  {quiz.isPublished ? 'Unpublish' : 'Publish'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAssigningQuiz(quiz);
                    // Default due date: 7 days from now
                    const d = new Date();
                    d.setDate(d.getDate() + 7);
                    setDueDate(d.toISOString().slice(0, 10));
                  }}
                  className="px-3.5 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Assign</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Quizzes in Bank"
          description="Create your first source-grounded quiz using the AI Quiz Studio."
          actionText="Open AI Studio"
          onAction={() => navigate('/teacher/quizzes/create')}
        />
      )}

      {/* Assign Modal */}
      {assigningQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-slate-100 mb-1">
              Assign Assessment: {assigningQuiz.title}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Students will see this test in their dashboard until the due date.
            </p>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Time Limit (Mins)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={180}
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(parseInt(e.target.value, 10))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Attempts Allowed
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={attemptsAllowed}
                    onChange={(e) => setAttemptsAllowed(parseInt(e.target.value, 10))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAssigningQuiz(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning}
                  className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {assigning ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
