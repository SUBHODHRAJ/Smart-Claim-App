import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { attemptService, aiService } from '../../services';
import { Attempt, SourceReference } from '../../types';
import { LoadingSpinner, ErrorAlert } from '../../components/LoadingSpinner';
import { SourceModal } from '../../components/SourceModal';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  BookOpen,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const QuizResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<{
    ref: SourceReference;
    questionText: string;
  } | null>(null);

  useEffect(() => {
    const fetchAttemptResult = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await attemptService.getAttempt(id);
        if (res.success) {
          setAttempt(res.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load attempt results.');
      } finally {
        setLoading(false);
      }
    };

    fetchAttemptResult();
  }, [id]);

  if (loading) return <LoadingSpinner message="Calculating comprehensive results & source citations..." />;

  if (error || !attempt) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <ErrorAlert message={error || 'Attempt result not found.'} />
        <Link to="/student/quizzes" className="text-xs text-brand-400 font-bold">
          ← Back to Quizzes
        </Link>
      </div>
    );
  }

  const isPassed = attempt.percentage >= 60;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Top Banner Card */}
      <div
        className={`relative overflow-hidden border rounded-3xl p-6 sm:p-8 shadow-xl ${
          isPassed
            ? 'bg-gradient-to-r from-emerald-950/40 via-slate-900/90 to-brand-950/40 border-emerald-500/30'
            : 'bg-gradient-to-r from-rose-950/30 via-slate-900/90 to-amber-950/30 border-rose-500/30'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-800 text-xs font-bold uppercase tracking-wider mb-2">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Assessment Completed</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100">{attempt.quizTitle}</h1>
            <p className="text-xs text-slate-400 mt-1">
              Completed on {new Date(attempt.submittedAt || attempt.createdAt).toLocaleString()}
            </p>
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div
                className={`text-4xl sm:text-5xl font-black ${
                  isPassed ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {attempt.percentage}%
              </div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                Final Score
              </div>
            </div>

            <div className="h-12 w-px bg-slate-800 hidden sm:block"></div>

            <div className="text-xs text-slate-300 space-y-1">
              <div>
                Correct:{' '}
                <span className="font-bold text-emerald-400">
                  {attempt.score} / {attempt.totalQuestions}
                </span>
              </div>
              <div>
                Time Taken:{' '}
                <span className="font-bold text-slate-200">
                  {Math.floor(attempt.timeTakenSeconds / 60)}m {attempt.timeTakenSeconds % 60}s
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <Link
            to="/student/performance"
            className="px-4 py-2 bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>View Weak Topic Analysis</span>
          </Link>
          <Link
            to="/student/flashcards"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center space-x-1.5"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Practice Related Flashcards</span>
          </Link>
          <Link
            to="/student/quizzes"
            className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
          >
            All Quizzes
          </Link>
        </div>
      </div>

      {/* Topic Breakdown Bar */}
      {attempt.topicBreakdown && attempt.topicBreakdown.length > 0 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">
            Topic Breakdown in This Assessment
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {attempt.topicBreakdown.map((tb) => (
              <div key={tb.topic} className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl">
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-200">{tb.topic}</span>
                  <span className={tb.accuracy >= 65 ? 'text-emerald-400' : 'text-rose-400'}>
                    {tb.accuracy}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full ${
                      tb.accuracy >= 65 ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${tb.accuracy}%` }}
                  ></div>
                </div>
                <div className="text-[11px] text-slate-400">
                  {tb.correct} of {tb.total} correct
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Question Explanations List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-100">Detailed Question Review & Citations</h3>

        {attempt.answers.map((ans, idx) => {
          const isCorrect = ans.isCorrect;

          return (
            <div
              key={idx}
              className={`bg-slate-900/90 border rounded-3xl p-6 sm:p-7 shadow-sm transition-all ${
                isCorrect ? 'border-emerald-500/20' : 'border-rose-500/20'
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center space-x-2">
                  {isCorrect ? (
                    <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Correct</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Incorrect</span>
                    </span>
                  )}
                  <span className="text-xs text-slate-400">• {ans.topic}</span>
                </div>

                {ans.sourceReference && (
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedSource({
                        ref: ans.sourceReference!,
                        questionText: ans.questionText,
                      })
                    }
                    className="inline-flex items-center space-x-1.5 px-3 py-1 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 text-brand-300 text-xs font-bold rounded-xl transition-colors shadow-sm"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>View Source (Page {ans.sourceReference.page || 1})</span>
                  </button>
                )}
              </div>

              <h4 className="text-base font-bold text-slate-100 mb-4 leading-relaxed">
                {idx + 1}. {ans.questionText}
              </h4>

              {/* Answers comparison */}
              <div className="space-y-2 mb-4">
                <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
                  <span className="text-slate-400">Your Answer:</span>
                  <span
                    className={`font-semibold ${
                      isCorrect ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'
                    }`}
                  >
                    {ans.selectedAnswer}
                  </span>
                </div>

                {!isCorrect && (
                  <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-xs flex items-center justify-between">
                    <span className="text-emerald-300 font-medium">Correct Answer:</span>
                    <span className="text-emerald-300 font-bold">{ans.correctAnswer}</span>
                  </div>
                )}
              </div>

              {/* Source-backed explanation */}
              {ans.explanation && (
                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 text-xs text-slate-300 space-y-1">
                  <span className="text-brand-400 font-bold block uppercase tracking-wider text-[10px]">
                    Educational Explanation & Reference:
                  </span>
                  <p className="leading-relaxed">{ans.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Grounded Source Modal */}
      {selectedSource && (
        <SourceModal
          isOpen={!!selectedSource}
          onClose={() => setSelectedSource(null)}
          sourceReference={selectedSource.ref}
          questionText={selectedSource.questionText}
        />
      )}
    </div>
  );
};
