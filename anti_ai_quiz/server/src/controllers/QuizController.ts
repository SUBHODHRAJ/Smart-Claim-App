import { Request, Response, NextFunction } from 'express';
import { QuizService } from '../services/QuizService';
import { Question } from '../models/Question';
import { sendSuccess, AppError } from '../utils/response';

export class QuizController {
  static async createQuiz(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);

      const { title, description, documentId, questionIds, difficulty, timeLimitMinutes, isPublished, topic } = req.body;
      if (!title) throw new AppError('Quiz title is required', 400);

      const quiz = await QuizService.createQuiz({
        title,
        description,
        documentId,
        questionIds,
        createdBy: req.user.userId,
        difficulty,
        timeLimitMinutes,
        isPublished: isPublished === true,
        topic,
      });

      return sendSuccess(res, quiz, 'Quiz created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  static async listQuizzes(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const quizzes = await QuizService.listQuizzes(req.user.userId, req.user.role);
      return sendSuccess(res, quizzes, 'Quizzes retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async getQuiz(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const forTaking = req.query.taking === 'true';
      const quiz = await QuizService.getQuizById(req.params.id, req.user.userId, req.user.role, forTaking);
      return sendSuccess(res, quiz, 'Quiz details retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async publishQuiz(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const { isPublished = true } = req.body;
      const quiz = await QuizService.publishQuiz(req.params.id, isPublished, req.user.userId, req.user.role);
      return sendSuccess(res, quiz, `Quiz ${isPublished ? 'published' : 'unpublished'} successfully`);
    } catch (err) {
      next(err);
    }
  }

  static async deleteQuiz(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const result = await QuizService.deleteQuiz(req.params.id, req.user.userId, req.user.role);
      return sendSuccess(res, result, 'Quiz deleted');
    } catch (err) {
      next(err);
    }
  }

  // Teacher Review Questions endpoints
  static async updateQuestion(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const question = await QuizService.updateQuestion(
        req.params.questionId,
        req.body,
        req.user.userId,
        req.user.role
      );
      return sendSuccess(res, question, 'Question updated successfully');
    } catch (err) {
      next(err);
    }
  }

  static async setQuestionStatus(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const { status } = req.body; // 'APPROVED' | 'REJECTED' | 'PENDING'
      if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
        throw new AppError('Invalid status value', 400);
      }
      const question = await QuizService.setQuestionStatus(
        req.params.questionId,
        status,
        req.user.userId,
        req.user.role
      );
      return sendSuccess(res, question, `Question status set to ${status}`);
    } catch (err) {
      next(err);
    }
  }

  static async createManualQuestion(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const { question, options, correctAnswer, explanation, topic, difficulty, documentId } = req.body;

      if (!question || !options || !correctAnswer) {
        throw new AppError('Question text, options, and correctAnswer are required', 400);
      }

      const q = new Question({
        question,
        options,
        correctAnswer,
        explanation: explanation || '',
        topic: topic || 'General',
        difficulty: difficulty || 'MEDIUM',
        documentId,
        aiQualityScore: 100, // Teacher-authored question
        validationStatus: 'APPROVED',
        createdBy: req.user.userId,
      });

      await q.save();
      return sendSuccess(res, q, 'Manual question created', 201);
    } catch (err) {
      next(err);
    }
  }
}
