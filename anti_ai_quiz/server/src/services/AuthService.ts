import jwt from 'jsonwebtoken';
import { User, IUserDoc } from '../models/User';
import { env } from '../config/env';
import { AppError } from '../utils/response';
import { AuthUserPayload } from '../middleware/auth';
import { UserRole } from '../types';

export class AuthService {
  static generateToken(user: IUserDoc): string {
    const payload: AuthUserPayload = {
      userId: (user._id as any).toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    };
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as any });
  }

  static async register(data: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    classGroup?: string;
  }) {
    const existing = await User.findOne({ email: data.email.toLowerCase().trim() });
    if (existing) {
      throw new AppError('An account with this email already exists', 409, 'EMAIL_EXISTS');
    }

    const user = new User({
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      password: data.password,
      role: data.role || 'STUDENT',
      classGroup: data.classGroup || 'Class 101',
    });

    await user.save();
    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: (user._id as any).toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        points: user.points,
        classGroup: user.classGroup,
      },
    };
  }

  static async login(email: string, password: string) {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // Record login activity for streak
    await user.recordActivity();

    const token = this.generateToken(user);
    return {
      token,
      user: {
        id: (user._id as any).toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        points: user.points,
        classGroup: user.classGroup,
      },
    };
  }

  static async getMe(userId: string) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    return {
      id: (user._id as any).toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      points: user.points,
      classGroup: user.classGroup,
      createdAt: user.createdAt,
    };
  }
}
