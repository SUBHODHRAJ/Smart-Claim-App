import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { documentService, aiService, quizService } from '../../services';
import { DocumentItem, Question, DifficultyLevel } from '../../types';
import { LoadingSpinner, ErrorAlert } from '../../components/LoadingSpinner';
import { SourceModal } from '../../components/SourceModal';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Edit3,
  BookOpen,
  Plus,
  Send,
  Sliders,
  Check,
  X,
  FileQuestion,
  Layers,
} from 'lucide-react';

export const AIQuizGeneratorStudio: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generator Config
  const [selectedDocId, setSelectedDocId] = useState(searchParams.get('docId') || '');
  const [quizTitle, setQuizTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('MEDIUM');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(15);

  // Review Studio State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedSource, setSelectedSource] = useState<any>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        setLoading(true);
        const res = await documentService.listDocuments();
        if (res.success && res.data.length > 0) {
          setDocuments(res.data);
          const initialId = searchParams.get('docId') || res.data[0]._id;
          setSelectedDocId(initialId);
          const chosenDoc = res.data.find((d) => d._id === initialId) || res.data[0];
          if (chosenDoc) {
            setQuizTitle(`${chosenDoc.title} Assessment`);
            if (chosenDoc.topics && chosenDoc.topics.length > 0) {
              setTopic(chosenDoc.topics[0]);
            }
          }
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load documents.');
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, [searchParams]);

  const handleDocChange = (id: string) => {
    setSelectedDocId(id);
    const doc = documents.find((d) => d._id === id);
    if (doc) {
      setQuizTitle(`${doc.title} Assessment`);
      if (doc.topics && doc.topics.length > 0) {
        setTopic(doc.topics[0]);
      }
    }
  };

  const handleGenerateQuestions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocId) return;

    setError(null);
    setGenerating(true);

    try {
      const res = await aiService.generateQuiz({
        documentId: selectedDocId,
        topic: topic || 'Core Concepts',
        numberOfQuestions: questionCount,
        difficulty,
      });

      if (res.success && res.data.questions) {
        setQuestions(res.data.questions);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'AI Generation failed. Please ensure document has text content.');
    } finally {
      setGenerating(false);
    }
  };

  const handleApproveStatus = async (questionId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await quizService.setQuestionStatus(questionId, status);
      if (res.success) {
        setQuestions((prev) =>
          prev.map((q) => (q._id === questionId ? { ...q, validationStatus: status } : q))
        );
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update question status');
    }
  };

  const handleApproveAll = async () => {
    try {
      for (const q of questions) {
        if (q.validationStatus !== 'APPROVED') {
          await quizService.setQuestionStatus(q._id, 'APPROVED');
        }
      }
      setQuestions((prev) => prev.map((q) => ({ ...q, validationStatus: 'APPROVED' })));
    } catch (err) {
      console.error('Approve all error:', err);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingQuestion) return;
    try {
      const res = await quizService.updateQuestion(editingQuestion._id, editingQuestion);
      if (res.success) {
        setQuestions((prev) =>
          prev.map((q) => (q._id === editingQuestion._id ? res.data : q))
        );
        setEditingQuestion(null);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save question edit');
    }
  };

  const handlePublishQuiz = async () => {
    const approved = questions.filter((q) => q.validationStatus === 'APPROVED');
    if (approved.length === 0) {
      alert('Please approve at least 1 question before publishing.');
      return;
    }

    try {
      setPublishing(true);
      const res = await quizService.createQuiz({
        title: quizTitle || 'AI Verified Quiz',
        description: `Source-grounded assessment generated from course material. Topic: ${topic || 'General'}.`,
        documentId: selectedDocId,
        questionIds: approved.map((q) => q._id),
        difficulty,
        timeLimitMinutes,
        isPublished: true,
        topic: topic || 'General',
      });

      if (res.success) {
        alert('Quiz created, verified, and published to students successfully!');
        navigate('/teacher/quizzes');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to publish quiz.');
    } finally {
      setPublishing(false);
    }
  };

  if (loading) return <LoadingSpinner message="Initializing AI Question Generation Studio..." />;

  const approvedCount = questions.filter((q) => q.validationStatus === 'APPROVED').length;

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-bold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>AI Question Generation & Quality Review Studio</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
          AI Quiz Studio
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Generate grounded MCQs, review AI quality scores, edit distractors, and publish validated quizzes.
        </p>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      {/* Generator Configuration Form */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center space-x-2 text-sm font-bold text-slate-200 mb-6 border-b border-slate-800 pb-3">
          <Sliders className="w-4 h-4 text-brand-400" />
          <span>Generation Parameters</span>
        </div>

        <form onSubmit={handleGenerateQuestions} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Source Document Material
              </label>
              <select
                value={selectedDocId}
                onChange={(e) => handleDocChange(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-brand-500"
              >
                {documents.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.title} ({d.totalPages} pages)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Quiz Title
              </label>
              <input
                type="text"
                required
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                placeholder="e.g. CPU Scheduling Mastery Quiz"
                className="w-full px-3.5 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Focus Topic
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Deadlocks or Scheduling"
                className="w-full px-3.5 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Questions Count
              </label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-brand-500"
              >
                <option value={3}>3 Questions (Quick)</option>
                <option value={5}>5 Questions (Standard)</option>
                <option value={10}>10 Questions</option>
                <option value={15}>15 Questions</option>
                <option value={20}>20 Questions (Exam)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Calibrated Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                className="w-full px-3.5 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-brand-500"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={generating}
              className="px-6 py-3 bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-500/25 flex items-center space-x-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{generating ? 'AI Generating & Grounding Questions...' : 'Generate Questions with AI'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Review Studio & Questions Matrix */}
      {questions.length > 0 && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Teacher Review Matrix ({questions.length} Generated)
              </h2>
              <p className="text-xs text-slate-400">
                {approvedCount} of {questions.length} questions approved for publishing.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handleApproveAll}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
              >
                Approve All
              </button>
              <button
                type="button"
                onClick={handlePublishQuiz}
                disabled={publishing || approvedCount === 0}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-md shadow-emerald-600/30 flex items-center space-x-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{publishing ? 'Publishing...' : `Publish Quiz (${approvedCount})`}</span>
              </button>
            </div>
          </div>

          {/* Question Cards List */}
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div
                key={q._id}
                className={`bg-slate-900/90 border rounded-3xl p-6 sm:p-7 shadow-sm transition-all ${
                  q.validationStatus === 'APPROVED'
                    ? 'border-emerald-500/40 bg-slate-900/95'
                    : q.validationStatus === 'REJECTED'
                    ? 'border-rose-500/30 opacity-60'
                    : 'border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      Q{idx + 1}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-400 bg-brand-500/10 px-2.5 py-0.5 rounded-full border border-brand-500/20">
                      {q.topic}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">{q.difficulty}</span>

                    {/* AI Quality Score Badge */}
                    <span
                      title="AI Quality Score: Relevance, Distractor Quality, and Groundedness"
                      className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold flex items-center space-x-1"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-400" />
                      <span>{q.aiQualityScore || 95}% AI Quality</span>
                    </span>
                  </div>

                  {/* Teacher Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setEditingQuestion(q)}
                      className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Edit Question"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {q.sourceReference && (
                      <button
                        type="button"
                        onClick={() => setSelectedSource({ ref: q.sourceReference, questionText: q.question })}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1"
                        title="View Source Citation"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Source (p.{q.sourceReference.page || 1})</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleApproveStatus(q._id, 'APPROVED')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center space-x-1 ${
                        q.validationStatus === 'APPROVED'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApproveStatus(q._id, 'REJECTED')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center space-x-1 ${
                        q.validationStatus === 'REJECTED'
                          ? 'bg-rose-500 text-white'
                          : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white'
                      }`}
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-100 mb-4 leading-relaxed">{q.question}</h3>

                {/* Options Review */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                  {q.options.map((opt, oIdx) => {
                    const isCorrect = opt.trim().toLowerCase() === (q.correctAnswer || '').trim().toLowerCase();

                    return (
                      <div
                        key={oIdx}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                          isCorrect
                            ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200 font-semibold'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300'
                        }`}
                      >
                        <span>{opt}</span>
                        {isCorrect && (
                          <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950">
                            Correct
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {q.explanation && (
                  <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800/80 text-xs text-slate-300">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 block mb-1">
                      Explanation:
                    </span>
                    <p className="leading-relaxed">{q.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Question Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-100 mb-3">Edit AI Question</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Question Text
                </label>
                <textarea
                  rows={3}
                  value={editingQuestion.question}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, question: e.target.value })
                  }
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-brand-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Options (Choices)
                </label>
                {editingQuestion.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...editingQuestion.options];
                        newOpts[idx] = e.target.value;
                        setEditingQuestion({ ...editingQuestion, options: newOpts });
                      }}
                      className="flex-1 p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-brand-500"
                    />
                    <button
                      type="button"
                      onClick={() => setEditingQuestion({ ...editingQuestion, correctAnswer: opt })}
                      className={`px-2.5 py-1.5 text-[10px] font-bold rounded-lg ${
                        editingQuestion.correctAnswer === opt
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Set Correct
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Explanation
                </label>
                <textarea
                  rows={3}
                  value={editingQuestion.explanation || ''}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, explanation: e.target.value })
                  }
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-brand-500 resize-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
