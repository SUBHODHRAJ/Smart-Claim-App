import React from 'react';
import { Sparkles, Inbox, AlertCircle } from 'lucide-react';

export const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading intelligent workspace...' }) => (
  <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center animate-fade-in">
    <div className="relative mb-4">
      <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-brand-500 animate-spin"></div>
      <Sparkles className="w-5 h-5 text-brand-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
    </div>
    <p className="text-slate-300 font-medium text-sm tracking-wide">{message}</p>
  </div>
);

export const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}> = ({ icon, title, description, actionText, onAction }) => (
  <div className="flex flex-col items-center justify-center p-12 bg-slate-900/60 border border-slate-800/80 rounded-2xl text-center max-w-lg mx-auto my-8">
    <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
      {icon || <Inbox className="w-7 h-7" />}
    </div>
    <h3 className="text-lg font-bold text-slate-100 mb-2">{title}</h3>
    <p className="text-slate-400 text-sm mb-6 leading-relaxed">{description}</p>
    {actionText && onAction && (
      <button
        onClick={onAction}
        className="px-5 py-2.5 bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-brand-500/20 active:scale-95"
      >
        {actionText}
      </button>
    )}
  </div>
);

export const ErrorAlert: React.FC<{ message: string; onDismiss?: () => void }> = ({ message, onDismiss }) => (
  <div className="flex items-center justify-between p-4 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-200 text-sm mb-6 animate-fade-in">
    <div className="flex items-center space-x-3">
      <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
      <span>{message}</span>
    </div>
    {onDismiss && (
      <button onClick={onDismiss} className="text-rose-400 hover:text-rose-200 text-xs uppercase font-bold ml-4">
        Dismiss
      </button>
    )}
  </div>
);
