import React, { useState, useEffect } from 'react';
import { flashcardService, documentService } from '../../services';
import { FlashcardItem, FlashcardStatus, DocumentItem } from '../../types';
import { LoadingSpinner, EmptyState } from '../../components/LoadingSpinner';
import {
  Layers,
  Sparkles,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Plus,
  Trash2,
  Filter,
} from 'lucide-react';

export const FlashcardsPage: React.FC = () => {
  const [cards, setCards] = useState<FlashcardItem[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState('ALL');
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [showGenModal, setShowGenModal] = useState(false);
  const [genDocId, setGenDocId] = useState('');
  const [genTopic, setGenTopic] = useState('');
  const [generating, setGenerating] = useState(false);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const [cardRes, docRes] = await Promise.all([
        flashcardService.list(selectedTopic === 'ALL' ? undefined : selectedTopic),
        documentService.listDocuments(),
      ]);

      if (cardRes.success) setCards(cardRes.data);
      if (docRes.success) {
        setDocuments(docRes.data);
        if (docRes.data.length > 0 && !genDocId) {
          setGenDocId(docRes.data[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to load flashcards:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, [selectedTopic]);

  const toggleFlip = (id: string) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleUpdateStatus = async (id: string, status: FlashcardStatus, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await flashcardService.updateStatus(id, status);
      if (res.success) {
        setCards((prev) => prev.map((c) => (c._id === id ? res.data : c)));
      }
    } catch (err) {
      console.error('Failed to update flashcard:', err);
    }
  };

  const handleDeleteCard = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this flashcard?')) return;
    try {
      await flashcardService.delete(id);
      setCards((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error('Failed to delete flashcard:', err);
    }
  };

  const handleGenerateCards = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genDocId) return;

    try {
      setGenerating(true);
      const res = await flashcardService.generate({
        documentId: genDocId,
        topic: genTopic || undefined,
        count: 8,
      });

      if (res.success) {
        setShowGenModal(false);
        fetchCards();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to generate flashcards.');
    } finally {
      setGenerating(false);
    }
  };

  const topicsList = Array.from(new Set(cards.map((c) => c.topic).filter(Boolean)));

  if (loading && cards.length === 0) {
    return <LoadingSpinner message="Loading active recall flashcard decks..." />;
  }

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
            Active Recall Flashcards
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Reinforce definitions and core theorems through spaced repetition.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowGenModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-500/20 flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate from Document</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex items-center space-x-3 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedTopic('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            selectedTopic === 'ALL'
              ? 'bg-brand-500 text-white'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          All Topics ({cards.length})
        </button>
        {topicsList.map((t) => (
          <button
            key={t}
            onClick={() => setSelectedTopic(t)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedTopic === t
                ? 'bg-brand-500 text-white'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Flashcards Deck Grid */}
      {cards.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => {
            const isFlipped = !!flippedCards[card._id];

            return (
              <div
                key={card._id}
                onClick={() => toggleFlip(card._id)}
                className={`min-h-[260px] p-6 rounded-3xl border cursor-pointer transition-all flex flex-col justify-between select-none shadow-md ${
                  isFlipped
                    ? 'bg-slate-900/95 border-brand-500/50 shadow-brand-500/10'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 bg-brand-500/10 px-2.5 py-0.5 rounded-full border border-brand-500/20">
                      {card.topic}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          card.status === 'KNOWN'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : card.status === 'DIFFICULT'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {card.status}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteCard(card._id, e)}
                        className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="py-2">
                    {!isFlipped ? (
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                          Question / Prompt
                        </span>
                        <h3 className="text-base font-bold text-slate-100 leading-relaxed">{card.front}</h3>
                      </div>
                    ) : (
                      <div>
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-1">
                          Answer & Explanation
                        </span>
                        <p className="text-sm font-medium text-slate-200 leading-relaxed">{card.back}</p>
                        {card.sourceReference && (
                          <div className="mt-3 text-[11px] text-brand-300 font-semibold flex items-center space-x-1">
                            <BookOpen className="w-3 h-3" />
                            <span>Page {card.sourceReference.page || 1} Reference</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 flex items-center space-x-1">
                    <RotateCw className="w-3 h-3" />
                    <span>Click to Flip</span>
                  </span>

                  {isFlipped && (
                    <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={(e) => handleUpdateStatus(card._id, 'DIFFICULT', e)}
                        className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-bold rounded-lg transition-colors"
                      >
                        Difficult
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleUpdateStatus(card._id, 'KNOWN', e)}
                        className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-lg transition-colors"
                      >
                        Mastered
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No Flashcards Found"
          description="Generate active recall flashcards from your uploaded study materials or lecture notes."
          actionText="Generate Flashcards"
          onAction={() => setShowGenModal(true)}
        />
      )}

      {/* Generation Modal */}
      {showGenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-slate-100 mb-1">Generate AI Flashcards</h3>
            <p className="text-xs text-slate-400 mb-4">
              AI will extract key definitions, conditions, and core formulas from your document.
            </p>

            <form onSubmit={handleGenerateCards} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Source Study Document
                </label>
                <select
                  value={genDocId}
                  onChange={(e) => setGenDocId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-brand-500"
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
                  Topic Keyword (Optional)
                </label>
                <input
                  type="text"
                  value={genTopic}
                  onChange={(e) => setGenTopic(e.target.value)}
                  placeholder="e.g. Deadlocks or CPU Scheduling"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGenModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {generating ? 'Generating Cards...' : 'Generate Deck'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
