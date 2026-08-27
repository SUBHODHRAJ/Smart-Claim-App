import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FileQuestion,
  BarChart3,
  BookOpen,
  Sparkles,
  StickyNote,
  Award,
  Layers,
  CalendarDays,
  FileText,
  Users,
  Send,
  GraduationCap,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  const studentNavItems = [
    { to: '/student/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/student/quizzes', label: 'My Quizzes & Tests', icon: <FileQuestion className="w-4 h-4" /> },
    { to: '/student/performance', label: 'Analytics & Weak Topics', icon: <BarChart3 className="w-4 h-4" /> },
    { to: '/student/study-plan', label: 'AI 7-Day Study Plan', icon: <CalendarDays className="w-4 h-4" /> },
    { to: '/student/flashcards', label: 'Recall Flashcards', icon: <Layers className="w-4 h-4" /> },
    { to: '/student/notes', label: 'Study Notes', icon: <StickyNote className="w-4 h-4" /> },
    { to: '/student/leaderboard', label: 'Leaderboard', icon: <Award className="w-4 h-4" /> },
  ];

  const teacherNavItems = [
    { to: '/teacher/dashboard', label: 'Teacher Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/teacher/documents', label: 'Study Materials & PDFs', icon: <FileText className="w-4 h-4" /> },
    { to: '/teacher/quizzes/create', label: 'AI Quiz Studio', icon: <Sparkles className="w-4 h-4 text-brand-400" /> },
    { to: '/teacher/quizzes', label: 'Question Bank & Quizzes', icon: <FileQuestion className="w-4 h-4" /> },
    { to: '/teacher/assignments', label: 'Assignments & Classes', icon: <Send className="w-4 h-4" /> },
    { to: '/teacher/analytics', label: 'Class Performance', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  const adminNavItems = [
    { to: '/admin/dashboard', label: 'Platform Metrics', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/admin/users', label: 'User Directory', icon: <Users className="w-4 h-4" /> },
  ];

  const items =
    user.role === 'TEACHER' ? teacherNavItems : user.role === 'ADMIN' ? adminNavItems : studentNavItems;

  return (
    <aside className="w-64 shrink-0 hidden md:block border-r border-slate-800/80 bg-slate-950/40 p-4 min-h-[calc(100vh-4rem)]">
      <div className="mb-4 px-3 py-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          {user.role} Navigation
        </span>
      </div>

      <nav className="space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
