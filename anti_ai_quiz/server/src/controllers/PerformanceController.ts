import { Request, Response, NextFunction } from 'express';
import { PerformanceService } from '../services/PerformanceService';
import { sendSuccess, AppError } from '../utils/response';

export class PerformanceController {
  /**
   * GET /api/performance
   */
  static async getStudentPerformance(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const summary = await PerformanceService.getStudentSummary(req.user.userId);
      return sendSuccess(res, summary, 'Student performance summary retrieved');
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/performance/topics
   */
  static async getTopicsPerformance(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const summary = await PerformanceService.getStudentSummary(req.user.userId);
      return sendSuccess(res, {
        topics: summary.topics,
        weakTopics: summary.weakTopics,
        strongTopics: summary.strongTopics,
      }, 'Topic performance breakdown retrieved');
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/performance/teacher-analytics
   */
  static async getTeacherAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const analytics = await PerformanceService.getTeacherAnalytics();
      return sendSuccess(res, analytics, 'Teacher class analytics retrieved');
    } catch (err) {
      next(err);
    }
  }
}
