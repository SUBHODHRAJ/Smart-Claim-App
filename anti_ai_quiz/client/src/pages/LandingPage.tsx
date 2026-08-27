import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import {
  BrainCircuit,
  FileText,
  CheckCircle,
  BarChart2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Target,
  Repeat,
  Layers,
  Award,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-brand-500 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-brand-600/20 to-indigo-600/20 blur-[130px] rounded-full -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-bold uppercase tracking-wider mb-6 animate-pulse-slow">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen AI Personalized Assessment</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
            Turn Your Study Material Into{' '}
            <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Adaptive Mastery
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Not just question generation. CogniQuiz is a closed-loop personalized learning platform where AI creates source-grounded learning content, teachers ensure quality, and real performance continuously powers adaptive quizzes.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-bold rounded-xl transition-all shadow-xl shadow-brand-500/25 flex items-center justify-center space-x-2 text-sm"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-semibold rounded-xl transition-all text-sm flex items-center justify-center space-x-2"
            >
              <span>Explore Live Demo</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Closed-Loop Learning Workflow */}
      <section className="py-16 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
              The Closed-Loop Personalized Learning Engine
            </h2>
            <p className="text-slate-400 text-sm mt-2 max-w-xl mx-auto">
              Every step reinforces the next, creating a continuous improvement cycle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { step: '01', title: 'Upload Material', desc: 'PDFs & lecture notes with semantic page chunking', icon: <FileText className="w-5 h-5 text-brand-400" /> },
              { step: '02', title: 'AI Generation', desc: 'Strictly source-grounded MCQs with citations', icon: <Sparkles className="w-5 h-5 text-indigo-400" /> },
              { step: '03', title: 'Teacher Review', desc: 'Quality check, edit, approve, and calibrate difficulty', icon: <ShieldCheck className="w-5 h-5 text-emerald-400" /> },
              { step: '04', title: 'Timed Practice', desc: 'Authoritative server timer & auto-evaluations', icon: <Zap className="w-5 h-5 text-amber-400" /> },
              { step: '05', title: 'Weak Topic AI', desc: 'Deterministic accuracy metrics & targeted recommendations', icon: <Target className="w-5 h-5 text-rose-400" /> },
              { step: '06', title: 'Adaptive Quiz', desc: 'Dynamic difficulty recalibration & flashcards', icon: <Repeat className="w-5 h-5 text-purple-400" /> },
            ].map((card) => (
              <div
                key={card.step}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-brand-500/40 transition-all shadow-sm"
              >
                <span className="text-[10px] font-black text-slate-500 tracking-widest block mb-2">{card.step}</span>
                <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/80 inline-block mb-3">
                  {card.icon}
                </div>
                <h3 className="text-sm font-bold text-slate-100 mb-1">{card.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Differentiating Pillars */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 hover:border-slate-700 transition-all">
            <div className="p-3 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 inline-block mb-5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-3">Grounded & Verified</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              No AI hallucinations. Every generated question and explanation links directly to a specific page and snippet in your uploaded PDF, backed by Teacher Quality Scoring.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 hover:border-slate-700 transition-all">
            <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 inline-block mb-5">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-3">Adaptive Difficulty</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Quizzes adjust dynamically. Strong in CPU Scheduling? We ramp up difficulty. Struggling with Deadlocks? We prioritize foundational concepts with targeted drills.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 hover:border-slate-700 transition-all">
            <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 inline-block mb-5">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-3">Gamified Retention</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Daily streaks, milestone badges, 7-day personalized study schedules, active-recall flashcard decks, and weekly competitive leaderboards keep motivation high.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-slate-800/80 bg-slate-950 text-center text-xs text-slate-500">
        <p>© 2026 CogniQuiz AI — Personalized AI Assessment Platform. All rights reserved.</p>
      </footer>
    </div>
  );
};
