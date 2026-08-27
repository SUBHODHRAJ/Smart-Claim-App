import mongoose from 'mongoose';
import { Quiz } from '../models/Quiz';
import { Question } from '../models/Question';
import { Attempt, IAttemptDoc } from '../models/Attempt';
import { User } from '../models/User';
import { AppError } from '../utils/response';
import { IAttemptAnswer } from '../types';
import { PerformanceService } from './PerformanceService';
import { GamificationService } from './GamificationService';

export class EvaluationService {
  /**
   * Start a new quiz attempt
   */
  static async startAttempt(quizId: string, userId: string): Promise<IAttemptDoc> {
    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      throw new AppError('Invalid quiz ID format', 400, 'INVALID_ID');
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      throw new AppError('Quiz not found', 404, 'NOT_FOUND');
    }

    if (!quiz.isPublished) {
      throw new AppError('This quiz is not currently open for student attempts', 403, 'QUIZ_NOT_PUBLISHED');
    }

    // Check if there is an existing unfinished attempt within the time limit
    const existing = await Attempt.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      quizId: new mongoose.Types.ObjectId(quizId),
      status: 'IN_PROGRESS',
    });

    if (existing) {
      const elapsedMinutes = (Date.now() - new Date(existing.startedAt).getTime()) / 60000;
      if (elapsedMinutes < quiz.timeLimitMinutes + 2) {
        return existing;
      } else {
        existing.status = 'EXPIRED';
        await existing.save();
      }
    }

    const attempt = new Attempt({
      userId: new mongoose.Types.ObjectId(userId),
      quizId: new mongoose.Types.ObjectId(quizId),
      quizTitle: quiz.title,
      answers: [],
      startedAt: new Date(),
      status: 'IN_PROGRESS',
    });

    await attempt.save();
    return attempt;
  }

  /**
   * Submit and evaluate student answers
   */
  static async submitAttempt(
    attemptId: string,
    submissionAnswers: { questionId: string; selectedAnswer: string; timeSpentSeconds?: number }[],
    userId: string
  ): Promise<IAttemptDoc> {
    const attempt = await Attempt.findById(attemptId);
    if (!attempt) {
      throw new AppError('Attempt session not found', 404, 'NOT_FOUND');
    }

    // User Isolation: strictly match authenticated userId
    if (attempt.userId.toString() !== userId) {
      throw new AppError('Access denied: You cannot submit another user\'s attempt', 403, 'FORBIDDEN');
    }

    if (attempt.status === 'COMPLETED') {
      throw new AppError('This attempt has already been submitted', 400, 'ALREADY_SUBMITTED');
    }

    const quiz = await Quiz.findById(attempt.quizId).populate('questionIds');
    if (!quiz) {
      throw new AppError('Associated quiz could not be found', 404, 'QUIZ_NOT_FOUND');
    }

    const now = new Date();
    const elapsedSeconds = Math.max(1, Math.round((now.getTime() - new Date(attempt.startedAt).getTime()) / 1000));
    
    // Evaluate each question strictly against database records
    const evaluatedAnswers: IAttemptAnswer[] = [];
    const questionsList = (quiz.questionIds as any[]) || [];
    const questionsMap = new Map<string, any>();
    questionsList.forEach((q) => questionsMap.set(q._id.toString(), q));

    const topicStats: Record<string, { total: number; correct: number }> = {};
    let totalCorrect = 0;

    for (const q of questionsList) {
      const qId = q._id.toString();
      const userSub = submissionAnswers.find((s) => s.questionId === qId);
      const selectedAnswer = userSub ? userSub.selectedAnswer.trim() : 'UNANSWERED';
      const isCorrect = selectedAnswer.toLowerCase() === q.correctAnswer.trim().toLowerCase();

      if (isCorrect) totalCorrect++;

      const topicName = q.topic || 'General';
      if (!topicStats[topicName]) {
        topicStats[topicName] = { total: 0, correct: 0 };
      }
      topicStats[topicName].total += 1;
      if (isCorrect) topicStats[topicName].correct += 1;

      evaluatedAnswers.push({
        questionId: qId,
        questionText: q.question,
        options: q.options,
        selectedAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation,
        topic: topicName,
        difficulty: q.difficulty,
        sourceReference: q.sourceReference,
        timeSpentSeconds: userSub?.timeSpentSeconds || 0,
      });
    }

    const totalQuestions = questionsList.length;
    const percentage = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    const topicBreakdown = Object.entries(topicStats).map(([topic, stat]) => ({
      topic,
      total: stat.total,
      correct: stat.correct,
      accuracy: Math.round((stat.correct / stat.total) * 100),
    }));

    // Update attempt
    attempt.answers = evaluatedAnswers;
    attempt.score = totalCorrect;
    attempt.totalQuestions = totalQuestions;
    attempt.percentage = percentage;
    attempt.timeTakenSeconds = elapsedSeconds;
    attempt.submittedAt = now;
    attempt.status = 'COMPLETED';
    attempt.topicBreakdown = topicBreakdown;

    await attempt.save();

    // Trigger streak & activity update
    const user = await User.findById(userId);
    if (user) {
      await user.recordActivity();
      // Award points: 10 pts per correct answer + 20 bonus for completion
      user.points += totalCorrect * 10 + 20;
      await user.save();
    }

    // Update historical performance engine
    await PerformanceService.recordAttemptPerformance(userId, attempt);

    // Check gamification achievements
    await GamificationService.checkAchievementsOnQuizSubmit(userId, attempt, totalCorrect, percentage);

    return attempt;
  }

  /**
   * Get single attempt by ID with strict user isolation
   */
  static async getAttemptById(attemptId: string, userId: string, userRole: string): Promise<IAttemptDoc> {
    if (!mongoose.Types.ObjectId.isValid(attemptId)) {
      throw new AppError('Invalid attempt ID format', 400, 'INVALID_ID');
    }

    const attempt = await Attempt.findById(attemptId);
    if (!attempt) {
      throw new AppError('Attempt record not found', 404, 'NOT_FOUND');
    }

    // User Isolation: Only owner or teacher/admin can view
    if (attempt.userId.toString() !== userId && userRole !== 'TEACHER' && userRole !== 'ADMIN') {
      throw new AppError('Access denied: Cannot view another user\'s attempt', 403, 'FORBIDDEN');
    }

    return attempt;
  }

  /**
   * List attempts for authenticated user
   */
  static async listUserAttempts(userId: string): Promise<IAttemptDoc[]> {
    return Attempt.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean() as any;
  }
}
