import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  BrainCircuit,
  Flame,
  Trophy,
  Moon,
  Sun,
  LogOut,
  User as UserIcon,
  Shield,
  GraduationCap,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-brand-300 bg-clip-text text-transparent">
              CogniQuiz <span className="text-brand-400 text-sm font-bold">AI</span>
            </span>
          </div>
        </Link>

        {/* Right side items */}
        <div className="flex items-center space-x-3">
          {isAuthenticated && user ? (
            <>
              {/* Streak Badge */}
              <div
                title="Daily Learning Streak"
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold"
              >
                <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
                <span>{user.currentStreak || 0} Day Streak</span>
              </div>

              {/* Points Badge */}
              <div
                title="Earned Learning Points"
                className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold"
              >
                <Trophy className="w-3.5 h-3.5 text-indigo-400" />
                <span>{user.points || 0} pts</span>
              </div>

              {/* Role badge */}
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
                {user.role === 'TEACHER' ? (
                  <GraduationCap className="w-4 h-4 text-emerald-400" />
                ) : user.role === 'ADMIN' ? (
                  <Shield className="w-4 h-4 text-rose-400" />
                ) : (
                  <UserIcon className="w-4 h-4 text-brand-400" />
                )}
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-slate-200 leading-none">{user.name}</div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">{user.role}</div>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-xl border border-transparent hover:border-slate-800 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-brand-500/25"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-xl border border-slate-800 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
