import React from 'react';
import { BookOpen, X, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';
import { SourceReference } from '../types';

interface SourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceReference?: SourceReference;
  questionText?: string;
}

export const SourceModal: React.FC<SourceModalProps> = ({
  isOpen,
  onClose,
  sourceReference,
  questionText,
}) => {
  if (!isOpen || !sourceReference) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">Source Material Verification</h3>
              <p className="text-xs text-slate-400">Grounded in verified uploaded document</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {questionText && (
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Referenced Question
              </span>
              <p className="text-sm text-slate-200 font-medium">{questionText}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 flex items-center space-x-3">
              <FileText className="w-4 h-4 text-brand-400" />
              <div>
                <span className="text-[11px] text-slate-400 block">Document Source</span>
                <span className="text-xs font-semibold text-slate-200 truncate block">
                  {sourceReference.documentTitle || 'Uploaded Study PDF'}
                </span>
              </div>
            </div>
            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 flex items-center space-x-3">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <div>
                <span className="text-[11px] text-slate-400 block">Page Reference</span>
                <span className="text-xs font-semibold text-slate-200">
                  Page {sourceReference.page || 1}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-950/90 p-4 rounded-xl border border-brand-500/20">
            <div className="flex items-center space-x-2 text-brand-400 text-xs font-bold uppercase mb-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Extracted Source Snippet</span>
            </div>
            <p className="text-sm text-slate-300 italic leading-relaxed border-l-2 border-brand-500/60 pl-3">
              "{sourceReference.snippet || 'Referenced from document text.'}"
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950/60 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
