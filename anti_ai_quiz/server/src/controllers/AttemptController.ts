import { Request, Response, NextFunction } from 'express';
import { EvaluationService } from '../services/EvaluationService';
import { sendSuccess, AppError } from '../utils/response';

export class AttemptController {
  /**
   * POST /api/quizzes/:id/start
   */
  static async startAttempt(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const attempt = await EvaluationService.startAttempt(req.params.id, req.user.userId);
      return sendSuccess(res, attempt, 'Quiz attempt started', 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/attempts/:id/submit
   */
  static async submitAttempt(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const { answers } = req.body;
      if (!Array.isArray(answers)) {
        throw new AppError('Answers must be provided as an array', 400);
      }

      const result = await EvaluationService.submitAttempt(req.params.id, answers, req.user.userId);
      return sendSuccess(res, result, 'Quiz submitted and evaluated successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/attempts/:id
   */
  static async getAttempt(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const attempt = await EvaluationService.getAttemptById(req.params.id, req.user.userId, req.user.role);
      return sendSuccess(res, attempt, 'Attempt retrieved');
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/attempts
   */
  static async listUserAttempts(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const attempts = await EvaluationService.listUserAttempts(req.user.userId);
      return sendSuccess(res, attempts, 'Attempts list retrieved');
    } catch (err) {
      next(err);
    }
  }
}
