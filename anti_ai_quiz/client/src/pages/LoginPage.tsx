import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrainCircuit, Lock, Mail, ArrowRight, Sparkles, GraduationCap, UserCheck, Shield } from 'lucide-react';
import { ErrorAlert } from '../components/LoadingSpinner';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(email, password);
      const from = (location.state as any)?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === 'TEACHER') {
        navigate('/teacher/dashboard');
      } else if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError(null);
    setLoading(true);

    try {
      const user = await login(demoEmail, 'password123');
      if (user.role === 'TEACHER') {
        navigate('/teacher/dashboard');
      } else if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 blur-[100px] rounded-full -z-10"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-3 mb-4 group">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-100">
            CogniQuiz <span className="text-brand-400">AI</span>
          </span>
        </Link>
        <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Sign in to your learning account</h2>
        <p className="mt-2 text-xs text-slate-400">
          Or{' '}
          <Link to="/register" className="font-semibold text-brand-400 hover:text-brand-300 transition-colors">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

          <form className="space-y-4" onSubmit={handleLoginSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Logins for Hackathon Evaluators */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <div className="flex items-center space-x-2 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                1-Click Quick Demo Accounts
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('teacher@test.com')}
                className="flex items-center space-x-2 p-2.5 bg-slate-950/90 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition-all text-xs font-semibold text-slate-300 hover:text-emerald-400 group"
              >
                <GraduationCap className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-slate-200">Teacher</div>
                  <div className="text-[10px] text-slate-500">Alan Turing</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('studentA@test.com')}
                className="flex items-center space-x-2 p-2.5 bg-slate-950/90 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition-all text-xs font-semibold text-slate-300 hover:text-brand-400 group"
              >
                <UserCheck className="w-4 h-4 text-brand-400 shrink-0" />
                <div>
                  <div className="font-bold text-slate-200">Student A</div>
                  <div className="text-[10px] text-slate-500">Alex Johnson</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('studentB@test.com')}
                className="flex items-center space-x-2 p-2.5 bg-slate-950/90 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition-all text-xs font-semibold text-slate-300 hover:text-indigo-400 group"
              >
                <UserCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                <div>
                  <div className="font-bold text-slate-200">Student B</div>
                  <div className="text-[10px] text-slate-500">Sarah Connor</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('admin@test.com')}
                className="flex items-center space-x-2 p-2.5 bg-slate-950/90 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition-all text-xs font-semibold text-slate-300 hover:text-rose-400 group"
              >
                <Shield className="w-4 h-4 text-rose-400 shrink-0" />
                <div>
                  <div className="font-bold text-slate-200">Admin</div>
                  <div className="text-[10px] text-slate-500">Platform Mgr</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
