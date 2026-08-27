import mongoose from 'mongoose';
import { Flashcard, IFlashcardDoc } from '../models/Flashcard';
import { DocumentService } from './DocumentService';
import { AppError } from '../utils/response';
import { FlashcardStatus } from '../types';

export class FlashcardService {
  /**
   * Generate flashcards from document content
   */
  static async generateFlashcards(params: {
    documentId: string;
    topic?: string;
    count?: number;
    userId: string;
  }): Promise<IFlashcardDoc[]> {
    const { documentId, topic, count = 8, userId } = params;
    const doc = await DocumentService.getById(documentId, userId, 'STUDENT');
    const chunks = DocumentService.findRelevantChunks(doc, topic, 4);

    const generatedCards: IFlashcardDoc[] = [];

    for (const chunk of chunks) {
      if (generatedCards.length >= count) break;

      const sentences = chunk.text
        .split(/(?<=[.?!])\s+/)
        .filter((s) => s.length > 30 && s.length < 200);

      for (const sentence of sentences) {
        if (generatedCards.length >= count) break;

        const matchDef = sentence.match(/^([^,.]+?)\s+(is defined as|refers to|is a|is an|provides|means)\s+(.+)$/i);
        if (matchDef && matchDef[1].length < 40 && matchDef[3].length > 15) {
          const front = `What is ${matchDef[1].trim()}?`;
          const back = matchDef[3].trim().replace(/[.]+$/, '');

          const card = new Flashcard({
            userId: new mongoose.Types.ObjectId(userId),
            documentId: doc._id,
            topic: topic || chunk.topicKeywords[0] || 'Core Concepts',
            front,
            back,
            status: 'LEARNING',
            sourceReference: {
              documentId: (doc._id as any).toString(),
              documentTitle: doc.title,
              page: chunk.page,
              snippet: sentence,
            },
          });

          await card.save();
          generatedCards.push(card);
        }
      }
    }

    // Fallback if structured definition patterns are few
    if (generatedCards.length < count && chunks.length > 0) {
      for (let i = 0; i < chunks.length && generatedCards.length < count; i++) {
        const chunk = chunks[i];
        const card = new Flashcard({
          userId: new mongoose.Types.ObjectId(userId),
          documentId: doc._id,
          topic: topic || chunk.topicKeywords[0] || 'Core Review',
          front: `Key Takeaway on ${chunk.topicKeywords[0] || 'Topic'} (Page ${chunk.page})`,
          back: chunk.text.slice(0, 160) + '...',
          status: 'LEARNING',
          sourceReference: {
            documentId: (doc._id as any).toString(),
            documentTitle: doc.title,
            page: chunk.page,
            snippet: chunk.text.slice(0, 100),
          },
        });
        await card.save();
        generatedCards.push(card);
      }
    }

    return generatedCards;
  }

  /**
   * List flashcards for authenticated user
   */
  static async listUserFlashcards(userId: string, topic?: string) {
    const query: any = { userId: new mongoose.Types.ObjectId(userId) };
    if (topic && topic !== 'ALL') {
      query.topic = new RegExp(topic, 'i');
    }
    return Flashcard.find(query).sort({ status: 1, updatedAt: -1 }).lean();
  }

  /**
   * Update flashcard status (KNOWN, LEARNING, DIFFICULT)
   */
  static async updateStatus(cardId: string, status: FlashcardStatus, userId: string): Promise<IFlashcardDoc> {
    const card = await Flashcard.findById(cardId);
    if (!card) {
      throw new AppError('Flashcard not found', 404, 'NOT_FOUND');
    }
    if (card.userId.toString() !== userId) {
      throw new AppError('Access denied', 403, 'FORBIDDEN');
    }

    card.status = status;
    card.reviewCount += 1;
    card.lastReviewed = new Date();
    await card.save();
    return card;
  }

  /**
   * Delete flashcard
   */
  static async deleteCard(cardId: string, userId: string) {
    const card = await Flashcard.findById(cardId);
    if (!card) throw new AppError('Flashcard not found', 404, 'NOT_FOUND');
    if (card.userId.toString() !== userId) throw new AppError('Access denied', 403, 'FORBIDDEN');
    await Flashcard.findByIdAndDelete(cardId);
    return { success: true };
  }
}
