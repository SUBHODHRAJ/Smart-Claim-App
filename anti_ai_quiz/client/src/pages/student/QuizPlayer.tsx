import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizService, attemptService } from '../../services';
import { Quiz, Question, Attempt } from '../../types';
import { LoadingSpinner, ErrorAlert } from '../../components/LoadingSpinner';
import {
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';

export const QuizPlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const timerRef = useRef<any>(null);
  const answersRef = useRef(answers);
  answersRef.current = answers;

  const submitQuiz = useCallback(async () => {
    if (!attempt || submitting) return;
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const payloadAnswers = questions.map((q) => ({
        questionId: q._id,
        selectedAnswer: answersRef.current[q._id] || 'UNANSWERED',
      }));

      const res = await attemptService.submitAttempt(attempt._id, payloadAnswers);
      if (res.success && res.data._id) {
        navigate(`/student/results/${res.data._id}`, { replace: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit quiz attempt.');
      setSubmitting(false);
    }
  }, [attempt, questions, submitting, navigate]);

  // Initial Load: Fetch Quiz and Start Attempt
  useEffect(() => {
    const initQuizSession = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [quizRes, attemptRes] = await Promise.all([
          quizService.getQuiz(id, true),
          attemptService.startAttempt(id),
        ]);

        if (quizRes.success) {
          setQuiz(quizRes.data);
          const qs = (quizRes.data.questionIds as Question[]) || [];
          setQuestions(qs);
        }

        if (attemptRes.success) {
          setAttempt(attemptRes.data);

          // Calculate remaining seconds based on server startedAt and timeLimit
          const started = new Date(attemptRes.data.startedAt).getTime();
          const limitMinutes = quizRes.data?.timeLimitMinutes || 15;
          const totalLimitSeconds = limitMinutes * 60;
          const elapsedSeconds = Math.max(0, Math.floor((Date.now() - started) / 1000));
          const remaining = Math.max(0, totalLimitSeconds - elapsedSeconds);

          setTimeLeftSeconds(remaining);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Unable to start quiz session.');
      } finally {
        setLoading(false);
      }
    };

    initQuizSession();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [id]);

  // Timer Tick
  useEffect(() => {
    if (timeLeftSeconds <= 0 || loading || submitting) return;

    timerRef.current = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          submitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timeLeftSeconds, loading, submitting, submitQuiz]);

  const handleSelectOption = (questionId: string, option: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <LoadingSpinner message="Securing and loading timed quiz attempt..." />;

  if (error || !quiz || questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <ErrorAlert message={error || 'Quiz questions not available.'} />
        <button
          onClick={() => navigate('/student/quizzes')}
          className="px-4 py-2 bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl"
        >
          Return to Quizzes
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / questions.length) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* Top Header Bar with Authoritative Timer */}
      <div className="sticky top-20 z-30 bg-slate-900/90 border border-slate-800/90 backdrop-blur-md rounded-2xl p-4 shadow-xl flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            {quiz.title}
          </span>
          <div className="text-sm font-black text-slate-100 flex items-center space-x-2">
            <span>
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-xs text-brand-400 font-semibold">{progressPercent}% Answered</span>
          </div>
        </div>

        {/* Timer Display */}
        <div
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-mono text-sm font-black transition-colors ${
            timeLeftSeconds < 120
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
              : 'bg-slate-950/80 text-brand-300 border border-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{formatTimer(timeLeftSeconds)}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-brand-500 to-indigo-500 transition-all duration-300 rounded-full"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        ></div>
      </div>

      {/* Main Question Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400 bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20">
            {currentQ.topic || 'General'}
          </span>
          <span className="text-xs text-slate-400">
            Difficulty: <span className="font-semibold text-slate-200">{currentQ.difficulty}</span>
          </span>
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-slate-100 mb-6 leading-relaxed">
          {currentQ.question}
        </h2>

        {/* Options List */}
        <div className="space-y-3">
          {currentQ.options.map((option, optIdx) => {
            const isSelected = answers[currentQ._id] === option;
            const letter = String.fromCharCode(65 + optIdx);

            return (
              <button
                key={optIdx}
                type="button"
                onClick={() => handleSelectOption(currentQ._id, option)}
                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center space-x-3.5 group ${
                  isSelected
                    ? 'bg-brand-500/15 border-brand-500 text-white shadow-md shadow-brand-500/10'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-brand-500 text-white'
                      : 'bg-slate-800/80 text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  {letter}
                </div>
                <span className="text-sm font-medium leading-relaxed">{option}</span>
              </button>
            );
          })}
        </div>

        {/* Bottom Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {currentIndex < questions.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              className="px-5 py-2.5 bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-brand-500/20 flex items-center space-x-1.5"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-emerald-600/25 flex items-center space-x-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Assessment</span>
            </button>
          )}
        </div>
      </div>

      {/* Question Palette Matrix */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Question Navigator
          </span>
          <span className="text-xs text-slate-500">
            {answeredCount} / {questions.length} completed
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {questions.map((q, idx) => {
            const isAnswered = !!answers[q._id];
            const isCurrent = idx === currentIndex;

            return (
              <button
                key={q._id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`w-9 h-9 rounded-xl font-bold text-xs transition-all flex items-center justify-center ${
                  isCurrent
                    ? 'ring-2 ring-brand-400 bg-brand-500 text-white'
                    : isAnswered
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-1">Submit Assessment?</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              You have answered <span className="text-brand-300 font-bold">{answeredCount}</span> out of{' '}
              <span className="text-slate-200 font-bold">{questions.length}</span> questions.
              {answeredCount < questions.length && (
                <span className="block text-amber-400 mt-1">
                  Warning: You have {questions.length - answeredCount} unanswered questions.
                </span>
              )}
            </p>

            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
              >
                Continue Quiz
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => {
                  setShowConfirmModal(false);
                  submitQuiz();
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-emerald-600/30"
              >
                {submitting ? 'Evaluating...' : 'Confirm Submission'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
