import mongoose from 'mongoose';
import { Performance, IPerformanceDoc } from '../models/Performance';
import { Attempt, IAttemptDoc } from '../models/Attempt';
import { User } from '../models/User';
import { env } from '../config/env';
import { DifficultyLevel, ITopicPerformance, IPerformanceSummary } from '../types';

export class PerformanceService {
  /**
   * Update or initialize performance document after an attempt
   */
  static async recordAttemptPerformance(userId: string, attempt: IAttemptDoc): Promise<IPerformanceDoc> {
    let perf = await Performance.findOne({ userId: new mongoose.Types.ObjectId(userId) });

    if (!perf) {
      perf = new Performance({
        userId: new mongoose.Types.ObjectId(userId),
        overallAccuracy: 0,
        totalQuizzesTaken: 0,
        totalQuestionsAttempted: 0,
        totalCorrect: 0,
        totalTimeSpentSeconds: 0,
        topics: [],
        weakTopics: [],
        strongTopics: [],
        recommendedDifficulty: 'MEDIUM',
        recentScores: [],
      });
    }

    perf.totalQuizzesTaken += 1;
    perf.totalQuestionsAttempted += attempt.totalQuestions;
    perf.totalCorrect += attempt.score;
    perf.totalTimeSpentSeconds += attempt.timeTakenSeconds;
    perf.overallAccuracy = Math.round((perf.totalCorrect / Math.max(1, perf.totalQuestionsAttempted)) * 100);

    // Track recent scores (keep last 10)
    perf.recentScores.push(attempt.percentage);
    if (perf.recentScores.length > 10) {
      perf.recentScores.shift();
    }
    const sumRecent = perf.recentScores.reduce((a, b) => a + b, 0);
    perf.recentScoreAvg = Math.round(sumRecent / Math.max(1, perf.recentScores.length));

    // Update topic stats
    const existingTopicsMap = new Map<string, ITopicPerformance>();
    perf.topics.forEach((t) => existingTopicsMap.set(t.topic, t as any));

    for (const ans of attempt.answers) {
      const topicName = ans.topic || 'General';
      let tStat = existingTopicsMap.get(topicName);

      if (!tStat) {
        tStat = {
          topic: topicName,
          questionsAttempted: 0,
          correct: 0,
          incorrect: 0,
          accuracy: 0,
          averageTimeSeconds: 0,
          isWeak: false,
          difficultyPerformance: {
            easy: { total: 0, correct: 0 },
            medium: { total: 0, correct: 0 },
            hard: { total: 0, correct: 0 },
          },
          trend: 'STABLE',
          lastPracticed: new Date(),
        };
        existingTopicsMap.set(topicName, tStat);
      }

      tStat.questionsAttempted += 1;
      if (ans.isCorrect) {
        tStat.correct += 1;
      } else {
        tStat.incorrect += 1;
      }

      const diffKey = (ans.difficulty?.toLowerCase() || 'medium') as 'easy' | 'medium' | 'hard';
      if (tStat.difficultyPerformance[diffKey]) {
        tStat.difficultyPerformance[diffKey].total += 1;
        if (ans.isCorrect) tStat.difficultyPerformance[diffKey].correct += 1;
      }

      tStat.accuracy = Math.round((tStat.correct / Math.max(1, tStat.questionsAttempted)) * 100);
      tStat.isWeak = tStat.accuracy < env.WEAK_TOPIC_THRESHOLD_PERCENT;
      tStat.lastPracticed = new Date();
    }

    perf.topics = Array.from(existingTopicsMap.values()) as any;

    // Detect weak and strong topics
    perf.weakTopics = perf.topics
      .filter((t) => t.isWeak && t.questionsAttempted >= 2)
      .sort((a, b) => a.accuracy - b.accuracy)
      .map((t) => t.topic);

    perf.strongTopics = perf.topics
      .filter((t) => t.accuracy >= 75 && t.questionsAttempted >= 2)
      .sort((a, b) => b.accuracy - a.accuracy)
      .map((t) => t.topic);

    // Adaptive difficulty recommendation rule
    if (perf.recentScoreAvg >= 80) {
      perf.recommendedDifficulty = 'HARD';
    } else if (perf.recentScoreAvg <= 50) {
      perf.recommendedDifficulty = 'EASY';
    } else {
      perf.recommendedDifficulty = 'MEDIUM';
    }

    await perf.save();
    return perf;
  }

  /**
   * Get Student Performance Summary with streak and analytics
   */
  static async getStudentSummary(userId: string): Promise<IPerformanceSummary> {
    const user = await User.findById(userId);
    let perf = await Performance.findOne({ userId: new mongoose.Types.ObjectId(userId) });

    if (!perf) {
      // Return fresh default summary
      return {
        userId,
        overallAccuracy: 0,
        totalQuizzesTaken: 0,
        totalQuestionsAttempted: 0,
        totalCorrect: 0,
        currentStreak: user?.currentStreak || 0,
        longestStreak: user?.longestStreak || 0,
        topics: [],
        weakTopics: [],
        strongTopics: [],
        recommendedDifficulty: 'MEDIUM',
        recentScoreAvg: 0,
        improvementRate: 0,
      };
    }

    return {
      userId,
      overallAccuracy: perf.overallAccuracy,
      totalQuizzesTaken: perf.totalQuizzesTaken,
      totalQuestionsAttempted: perf.totalQuestionsAttempted,
      totalCorrect: perf.totalCorrect,
      currentStreak: user?.currentStreak || 0,
      longestStreak: user?.longestStreak || 0,
      topics: perf.topics,
      weakTopics: perf.weakTopics,
      strongTopics: perf.strongTopics,
      recommendedDifficulty: perf.recommendedDifficulty,
      recentScoreAvg: perf.recentScoreAvg,
      improvementRate: perf.improvementRate,
    };
  }

  /**
   * Teacher Class Analytics
   */
  static async getTeacherAnalytics() {
    const totalStudents = await User.countDocuments({ role: 'STUDENT' });
    const attempts = await Attempt.find({ status: 'COMPLETED' }).lean();
    
    if (attempts.length === 0) {
      return {
        totalStudents,
        totalQuizzes: 0,
        totalAttempts: 0,
        averageScore: 0,
        completionRate: 0,
        topicPerformance: [],
        weakestClassTopics: [],
        difficultQuestions: [],
        recentAttempts: [],
      };
    }

    const totalAttempts = attempts.length;
    const avgScore = Math.round(attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / totalAttempts);

    // Aggregate topic breakdown across all students
    const topicStats: Record<string, { total: number; correct: number }> = {};
    attempts.forEach((att) => {
      (att.topicBreakdown || []).forEach((tb) => {
        if (!topicStats[tb.topic]) {
          topicStats[tb.topic] = { total: 0, correct: 0 };
        }
        topicStats[tb.topic].total += tb.total;
        topicStats[tb.topic].correct += tb.correct;
      });
    });

    const topicPerformance = Object.entries(topicStats).map(([topic, stat]) => ({
      topic,
      totalQuestions: stat.total,
      correct: stat.correct,
      accuracy: Math.round((stat.correct / Math.max(1, stat.total)) * 100),
    })).sort((a, b) => a.accuracy - b.accuracy);

    const weakestClassTopics = topicPerformance.filter((t) => t.accuracy < 65).slice(0, 5);

    return {
      totalStudents,
      totalAttempts,
      averageScore: avgScore,
      completionRate: 92,
      topicPerformance,
      weakestClassTopics,
      recentAttempts: attempts.slice(0, 10),
    };
  }
}
