import mongoose from 'mongoose';
import { Achievement, IAchievementDoc } from '../models/Achievement';
import { User } from '../models/User';
import { Attempt } from '../models/Attempt';

export class GamificationService {
  /**
   * Evaluate and award achievements
   */
  static async checkAchievementsOnQuizSubmit(
    userId: string,
    attempt: any,
    totalCorrect: number,
    percentage: number
  ) {
    const user = await User.findById(userId);
    if (!user) return;

    const userObjId = new mongoose.Types.ObjectId(userId);
    const totalAttemptsCount = await Attempt.countDocuments({ userId: userObjId, status: 'COMPLETED' });

    const achievementsToUnlock: Array<{ code: string; title: string; description: string; icon: string }> = [];

    // 1. First Quiz
    if (totalAttemptsCount >= 1) {
      achievementsToUnlock.push({
        code: 'FIRST_QUIZ',
        title: 'First Step to Mastery',
        description: 'Completed your very first AI assessment.',
        icon: '🎯',
      });
    }

    // 2. Perfect Score
    if (percentage === 100) {
      achievementsToUnlock.push({
        code: 'PERFECT_SCORE',
        title: 'Flawless Knowledge',
        description: 'Scored a perfect 100% on a quiz attempt.',
        icon: '🌟',
      });
    }

    // 3. Fast Solver (< 30s per question on average with >= 80% score)
    if (attempt.totalQuestions >= 5 && attempt.timeTakenSeconds / attempt.totalQuestions < 30 && percentage >= 80) {
      achievementsToUnlock.push({
        code: 'FAST_SOLVER',
        title: 'Lightning Learner',
        description: 'Maintained high accuracy with rapid recall speed.',
        icon: '⚡',
      });
    }

    // 4. Streak Badges
    if (user.currentStreak >= 3) {
      achievementsToUnlock.push({
        code: 'STREAK_3',
        title: 'Consistent Thinker',
        description: 'Achieved a 3-day active learning streak.',
        icon: '🔥',
      });
    }

    if (user.currentStreak >= 7) {
      achievementsToUnlock.push({
        code: 'STREAK_7',
        title: 'Relentless Scholar',
        description: 'Reached a milestone 7-day study streak.',
        icon: '🏆',
      });
    }

    // Unlock in DB
    for (const ach of achievementsToUnlock) {
      try {
        const exists = await Achievement.findOne({ userId: userObjId, code: ach.code });
        if (!exists) {
          await Achievement.create({
            userId: userObjId,
            code: ach.code,
            title: ach.title,
            description: ach.description,
            icon: ach.icon,
          });
        }
      } catch (err) {
        // Ignore duplicate key race conditions
      }
    }
  }

  /**
   * Get user achievements
   */
  static async getUserAchievements(userId: string): Promise<any[]> {
    return Achievement.find({ userId: new mongoose.Types.ObjectId(userId) }).sort({ unlockedAt: -1 }).lean();
  }

  /**
   * Weekly Leaderboard
   */
  static async getLeaderboard() {
    // Top 20 students by points and streak
    const users = await User.find({ role: 'STUDENT' })
      .select('name points currentStreak avatarUrl classGroup')
      .sort({ points: -1, currentStreak: -1 })
      .limit(20)
      .lean();

    return users.map((u, index) => ({
      rank: index + 1,
      id: (u._id as any).toString(),
      name: u.name,
      points: u.points || 0,
      streak: u.currentStreak || 0,
      classGroup: u.classGroup || 'Class 101',
    }));
  }
}
