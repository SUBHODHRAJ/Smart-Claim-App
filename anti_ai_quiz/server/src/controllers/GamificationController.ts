import { Request, Response, NextFunction } from 'express';
import { GamificationService } from '../services/GamificationService';
import { User } from '../models/User';
import { Quiz } from '../models/Quiz';
import { DocumentModel } from '../models/Document';
import { Attempt } from '../models/Attempt';
import { sendSuccess, AppError } from '../utils/response';

export class GamificationController {
  static async getLeaderboard(req: Request, res: Response, next: NextFunction) {
    try {
      const board = await GamificationService.getLeaderboard();
      return sendSuccess(res, board, 'Weekly leaderboard retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async getMyAchievements(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const list = await GamificationService.getUserAchievements(req.user.userId);
      return sendSuccess(res, list, 'User achievements retrieved');
    } catch (err) {
      next(err);
    }
  }
}

export class AdminController {
  static async getPlatformStats(req: Request, res: Response, next: NextFunction) {
    try {
      const totalUsers = await User.countDocuments();
      const totalStudents = await User.countDocuments({ role: 'STUDENT' });
      const totalTeachers = await User.countDocuments({ role: 'TEACHER' });
      const totalDocuments = await DocumentModel.countDocuments();
      const totalQuizzes = await Quiz.countDocuments();
      const totalAttempts = await Attempt.countDocuments({ status: 'COMPLETED' });

      const recentUsers = await User.find().select('-password').sort({ createdAt: -1 }).limit(10).lean();

      return sendSuccess(res, {
        totalUsers,
        totalStudents,
        totalTeachers,
        totalDocuments,
        totalQuizzes,
        totalAttempts,
        recentUsers,
      }, 'Platform stats retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();
      return sendSuccess(res, users, 'Users retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async updateUserRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { role } = req.body;
      if (!['STUDENT', 'TEACHER', 'ADMIN'].includes(role)) {
        throw new AppError('Invalid role', 400);
      }
      const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
      if (!user) throw new AppError('User not found', 404);
      return sendSuccess(res, user, 'User role updated');
    } catch (err) {
      next(err);
    }
  }
}
