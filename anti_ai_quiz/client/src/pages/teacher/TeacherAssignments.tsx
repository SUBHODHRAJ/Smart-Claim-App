import React, { useState, useEffect } from 'react';
import { assignmentService } from '../../services';
import { AssignmentItem } from '../../types';
import { LoadingSpinner, EmptyState } from '../../components/LoadingSpinner';
import { Send, Clock, Trash2, Calendar, Users, Award } from 'lucide-react';

export const TeacherAssignments: React.FC = () => {
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await assignmentService.listForTeacher();
      if (res.success) setAssignments(res.data);
    } catch (err) {
      console.error('Failed to load assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Cancel this assignment?')) return;
    try {
      await assignmentService.delete(id);
      setAssignments((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      console.error('Failed to delete assignment:', err);
    }
  };

  if (loading && assignments.length === 0) return <LoadingSpinner message="Loading active class assignments..." />;

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
          Class Assignments & Due Dates
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Monitor assigned assessment deadlines and track student test submissions.
        </p>
      </div>

      {assignments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((a) => (
            <div
              key={a._id}
              className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 bg-brand-500/10 px-2.5 py-0.5 rounded-full border border-brand-500/20">
                    Active Assignment
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(a._id)}
                    className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="text-base font-bold text-slate-100 mb-1">{a.quizTitle}</h3>
                <div className="space-y-2 text-xs text-slate-400 mt-3">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Due: {new Date(a.dueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Time Limit: {a.timeLimitMinutes} minutes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Target: {a.classGroup || 'All Class Students'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-800 text-[11px] text-slate-500">
                Created on {new Date(a.startDate).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Active Assignments"
          description="Go to Question Bank and click 'Assign' to assign a test to your class."
        />
      )}
    </div>
  );
};
