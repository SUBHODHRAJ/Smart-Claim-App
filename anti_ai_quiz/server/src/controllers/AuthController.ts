import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { sendSuccess, sendError, AppError } from '../utils/response';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password, role, classGroup } = req.body;
      if (!name || !email || !password) {
        throw new AppError('Name, email, and password are required', 400, 'MISSING_FIELDS');
      }
      if (password.length < 6) {
        throw new AppError('Password must be at least 6 characters', 400, 'PASSWORD_TOO_SHORT');
      }

      const result = await AuthService.register({ name, email, password, role, classGroup });
      return sendSuccess(res, result, 'Registration successful', 201);
    } catch (err) {
      next(err);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        throw new AppError('Email and password are required', 400, 'MISSING_FIELDS');
      }

      const result = await AuthService.login(email, password);
      return sendSuccess(res, result, 'Login successful');
    } catch (err) {
      next(err);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      }
      const user = await AuthService.getMe(req.user.userId);
      return sendSuccess(res, user, 'User details retrieved');
    } catch (err) {
      next(err);
    }
  }
}
