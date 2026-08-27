import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentService } from '../../services';
import { DocumentItem } from '../../types';
import { LoadingSpinner, EmptyState, ErrorAlert } from '../../components/LoadingSpinner';
import {
  FileText,
  UploadCloud,
  Sparkles,
  Trash2,
  BookOpen,
  CheckCircle2,
  FilePlus,
  Eye,
  X,
} from 'lucide-react';

export const TeacherDocuments: React.FC = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Upload Form State
  const [activeTab, setActiveTab] = useState<'FILE' | 'TEXT'>('FILE');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docTitle, setDocTitle] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  // Preview Modal
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await documentService.listDocuments();
      if (res.success) setDocuments(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load study materials.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setUploading(true);

    try {
      if (activeTab === 'FILE') {
        if (!selectedFile) {
          setError('Please select a PDF or document file to upload.');
          setUploading(false);
          return;
        }
        await documentService.uploadFile(selectedFile, docTitle, isPublic);
      } else {
        if (!pastedText.trim()) {
          setError('Please enter or paste your lecture text.');
          setUploading(false);
          return;
        }
        await documentService.uploadText(pastedText, docTitle || 'Lecture Notes', isPublic);
      }

      // Reset form & reload
      setSelectedFile(null);
      setDocTitle('');
      setPastedText('');
      fetchDocuments();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Upload processing failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this course material?')) return;
    try {
      await documentService.deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d._id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete document.');
    }
  };

  if (loading && documents.length === 0) return <LoadingSpinner message="Loading course study materials..." />;

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
          Study Materials & PDF Processing
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Upload syllabi, lecture slides, and textbooks. The engine extracts text and generates source-grounded quizzes.
        </p>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      {/* Upload Box Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-4 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('FILE')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'FILE'
                ? 'bg-brand-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Upload PDF / Document
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('TEXT')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'TEXT'
                ? 'bg-brand-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Paste Raw Text
          </button>
        </div>

        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Document Title
            </label>
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="e.g. Operating Systems Chapter 5 — CPU Scheduling"
              className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-brand-500"
            />
          </div>

          {activeTab === 'FILE' ? (
            <div className="border-2 border-dashed border-slate-800 hover:border-brand-500/50 rounded-2xl p-6 text-center transition-all bg-slate-950/40">
              <UploadCloud className="w-8 h-8 text-brand-400 mx-auto mb-2" />
              <label className="cursor-pointer">
                <span className="text-xs font-bold text-brand-400 hover:text-brand-300 underline">
                  Choose a PDF or Document
                </span>
                <span className="text-xs text-slate-400 block mt-1">
                  Supported: PDF, TXT, DOCX (Max 15MB)
                </span>
                <input
                  type="file"
                  accept=".pdf,.txt,.doc,.docx"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                      if (!docTitle) setDocTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ''));
                    }
                  }}
                  className="hidden"
                />
              </label>
              {selectedFile && (
                <div className="mt-3 inline-flex items-center space-x-2 px-3 py-1 bg-brand-500/10 border border-brand-500/30 text-brand-300 rounded-lg text-xs font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Paste Chapter / Lecture Text
              </label>
              <textarea
                rows={6}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste reading material, definitions, or study notes..."
                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-brand-500 resize-none font-mono"
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="rounded border-slate-800 bg-slate-950 text-brand-500 focus:ring-brand-500"
              />
              <span>Share with all students in class</span>
            </label>

            <button
              type="submit"
              disabled={uploading}
              className="px-6 py-2.5 bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-500/25 flex items-center space-x-2 disabled:opacity-50"
            >
              <FilePlus className="w-4 h-4" />
              <span>{uploading ? 'Extracting & Chunking...' : 'Process Document'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Materials List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-100">Uploaded Study Materials ({documents.length})</h2>

        {documents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <div
                key={doc._id}
                className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="p-2.5 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(doc._id)}
                      className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-sm font-bold text-slate-100 line-clamp-2 mb-1">{doc.title}</h3>
                  <p className="text-[11px] text-slate-400">
                    {doc.totalPages} Pages • {doc.chunks ? doc.chunks.length : 0} Semantic Chunks
                  </p>

                  {doc.topics && doc.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {doc.topics.slice(0, 3).map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] text-slate-300 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-6 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setPreviewDoc(doc)}
                    className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center space-x-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Chunks</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(`/teacher/quizzes/create?docId=${doc._id}`)}
                    className="py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-brand-500/20 flex items-center justify-center space-x-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Documents Uploaded"
            description="Upload your course lecture notes or textbooks above to activate the AI Quiz Generator."
          />
        )}
      </div>

      {/* Chunks Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div>
                <h3 className="font-bold text-slate-100 text-base">{previewDoc.title}</h3>
                <p className="text-xs text-slate-400">
                  {previewDoc.totalPages} Pages • {previewDoc.chunks?.length || 0} Grounded Chunks
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-3 pr-2">
              {previewDoc.chunks?.map((chunk) => (
                <div
                  key={chunk.chunkIndex}
                  className="p-4 bg-slate-950/90 border border-slate-800/90 rounded-2xl space-y-2"
                >
                  <div className="flex items-center justify-between text-xs text-brand-400 font-bold">
                    <span>Chunk #{chunk.chunkIndex + 1} (Page {chunk.page})</span>
                    <span className="text-slate-500 text-[10px] font-normal">{chunk.wordCount} words</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed italic">"{chunk.text}"</p>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end mt-4">
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
