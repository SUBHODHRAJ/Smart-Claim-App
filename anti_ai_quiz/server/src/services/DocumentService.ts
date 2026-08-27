import mongoose from 'mongoose';
import { DocumentModel, IDocumentDoc } from '../models/Document';
import { extractDocumentText } from '../utils/pdfExtractor';
import { AppError } from '../utils/response';

export class DocumentService {
  static async processAndSave(
    fileBuffer: Buffer,
    mimeType: string,
    originalFilename: string,
    title: string,
    ownerId: string,
    isPublic = false
  ): Promise<IDocumentDoc> {
    const extracted = await extractDocumentText(fileBuffer, mimeType, originalFilename);

    const doc = new DocumentModel({
      owner: new mongoose.Types.ObjectId(ownerId),
      title: title || originalFilename.replace(/\.[^/.]+$/, ''),
      originalFilename,
      fileType: mimeType,
      fileSize: fileBuffer.length,
      extractedText: extracted.text,
      totalPages: extracted.totalPages,
      chunks: extracted.chunks,
      topics: extracted.topics,
      isPublic,
    });

    await doc.save();
    return doc;
  }

  static async processRawText(
    text: string,
    title: string,
    ownerId: string,
    isPublic = false
  ): Promise<IDocumentDoc> {
    const buffer = Buffer.from(text, 'utf-8');
    return this.processAndSave(buffer, 'text/plain', `${title || 'Notes'}.txt`, title, ownerId, isPublic);
  }

  static async getById(documentId: string, userId: string, userRole: string): Promise<IDocumentDoc> {
    if (!mongoose.Types.ObjectId.isValid(documentId)) {
      throw new AppError('Invalid document ID format', 400, 'INVALID_ID');
    }

    const doc = await DocumentModel.findById(documentId);
    if (!doc) {
      throw new AppError('Document not found', 404, 'NOT_FOUND');
    }

    // Ownership check: must be owner, or document is public, or admin/teacher
    const isOwner = doc.owner.toString() === userId;
    const canAccess = isOwner || doc.isPublic || userRole === 'TEACHER' || userRole === 'ADMIN';

    if (!canAccess) {
      throw new AppError('Access denied to this private document', 403, 'FORBIDDEN');
    }

    return doc;
  }

  static async listUserDocuments(userId: string, userRole: string): Promise<IDocumentDoc[]> {
    if (userRole === 'TEACHER' || userRole === 'ADMIN') {
      // Teachers and Admins can see their documents and shared documents
      return DocumentModel.find({
        $or: [{ owner: new mongoose.Types.ObjectId(userId) }, { isPublic: true }],
      })
        .select('-extractedText')
        .sort({ createdAt: -1 })
        .lean() as any;
    }

    // Students see only their own documents
    return DocumentModel.find({ owner: new mongoose.Types.ObjectId(userId) })
      .select('-extractedText')
      .sort({ createdAt: -1 })
      .lean() as any;
  }

  static async deleteDocument(documentId: string, userId: string, userRole: string) {
    const doc = await this.getById(documentId, userId, userRole);
    if (doc.owner.toString() !== userId && userRole !== 'ADMIN') {
      throw new AppError('Only the document owner can delete this document', 403, 'FORBIDDEN');
    }
    await DocumentModel.findByIdAndDelete(documentId);
    return { success: true };
  }

  static findRelevantChunks(doc: IDocumentDoc, topic?: string, maxChunks = 5) {
    if (!doc.chunks || doc.chunks.length === 0) return [];
    if (!topic || topic.toLowerCase() === 'all' || topic.toLowerCase() === 'general') {
      return doc.chunks.slice(0, maxChunks);
    }

    const searchTerms = topic.toLowerCase().split(/\s+/).filter(Boolean);
    const scoredChunks = doc.chunks.map((chunk) => {
      const lowerText = chunk.text.toLowerCase();
      let score = 0;
      searchTerms.forEach((term) => {
        const regex = new RegExp(`\\b${term}\\b`, 'gi');
        const matches = (lowerText.match(regex) || []).length;
        score += matches * 2;
      });
      chunk.topicKeywords.forEach((kw) => {
        if (searchTerms.some((st) => kw.toLowerCase().includes(st))) {
          score += 5;
        }
      });
      return { chunk, score };
    });

    // Sort by relevance score
    scoredChunks.sort((a, b) => b.score - a.score);
    const topScored = scoredChunks.filter((s) => s.score > 0).slice(0, maxChunks);

    // Fallback if no specific keyword match found
    if (topScored.length === 0) {
      return doc.chunks.slice(0, maxChunks);
    }

    return topScored.map((s) => s.chunk);
  }
}
