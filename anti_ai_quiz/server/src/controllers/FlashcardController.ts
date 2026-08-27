import { Request, Response, NextFunction } from 'express';
import { FlashcardService } from '../services/FlashcardService';
import { sendSuccess, AppError } from '../utils/response';

export class FlashcardController {
  static async generateFlashcards(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const { documentId, topic, count } = req.body;
      if (!documentId) throw new AppError('documentId is required', 400);

      const cards = await FlashcardService.generateFlashcards({
        documentId,
        topic,
        count: parseInt(count, 10) || 8,
        userId: req.user.userId,
      });

      return sendSuccess(res, cards, 'Flashcards generated successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  static async listFlashcards(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const topic = req.query.topic as string;
      const cards = await FlashcardService.listUserFlashcards(req.user.userId, topic);
      return sendSuccess(res, cards, 'Flashcards retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const { status } = req.body;
      if (!['LEARNING', 'KNOWN', 'DIFFICULT'].includes(status)) {
        throw new AppError('Invalid status', 400);
      }
      const card = await FlashcardService.updateStatus(req.params.id, status, req.user.userId);
      return sendSuccess(res, card, 'Flashcard updated');
    } catch (err) {
      next(err);
    }
  }

  static async deleteFlashcard(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const result = await FlashcardService.deleteCard(req.params.id, req.user.userId);
      return sendSuccess(res, result, 'Flashcard deleted');
    } catch (err) {
      next(err);
    }
  }
}
