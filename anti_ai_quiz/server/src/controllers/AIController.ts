import { Request, Response, NextFunction } from 'express';
import { AIService } from '../services/AIService';
import { DocumentService } from '../services/DocumentService';
import { QuizService } from '../services/QuizService';
import { PerformanceService } from '../services/PerformanceService';
import { AdaptiveService } from '../services/AdaptiveService';
import { StudyPlan } from '../models/StudyPlan';
import { sendSuccess, AppError } from '../utils/response';

export class AIController {
  /**
   * POST /api/ai/generate-quiz
   */
  static async generateQuiz(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);

      const { documentId, topic, numberOfQuestions = 5, difficulty = 'MEDIUM' } = req.body;

      if (!documentId) {
        throw new AppError('documentId is required to generate source-grounded quiz', 400, 'MISSING_DOCUMENT_ID');
      }

      const doc = await DocumentService.getById(documentId, req.user.userId, req.user.role);
      const relevantChunks = DocumentService.findRelevantChunks(doc, topic, 5);

      const count = Math.min(30, Math.max(1, parseInt(numberOfQuestions, 10) || 5));

      const generatedQuestions = await AIService.generateQuizQuestions({
        documentId: (doc._id as any).toString(),
        documentTitle: doc.title,
        topic: topic || 'General',
        chunks: relevantChunks,
        numberOfQuestions: count,
        difficulty,
      });

      // Save as PENDING questions for review if user is teacher or student
      const savedQuestions = await QuizService.saveGeneratedQuestions(
        generatedQuestions,
        (doc._id as any).toString(),
        req.user.userId
      );

      return sendSuccess(res, {
        document: { id: doc._id, title: doc.title },
        questions: savedQuestions,
        count: savedQuestions.length,
      }, 'AI Questions generated and ready for review', 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/ai/analyze-performance
   */
  static async analyzePerformance(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);

      const summary = await PerformanceService.getStudentSummary(req.user.userId);
      const recommendation = await AIService.analyzePerformanceAndRecommend({
        topics: summary.topics.map((t) => ({ topic: t.topic, accuracy: t.accuracy, total: t.questionsAttempted })),
        weakTopics: summary.weakTopics,
        strongTopics: summary.strongTopics,
        recentScoreAvg: summary.recentScoreAvg,
        recommendedDifficulty: summary.recommendedDifficulty,
      });

      return sendSuccess(res, recommendation, 'AI Performance Analysis & Recommendations generated');
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/ai/generate-study-plan
   */
  static async generateStudyPlan(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);

      const summary = await PerformanceService.getStudentSummary(req.user.userId);
      const planDays = AIService.generateStudyPlan(summary.weakTopics, summary.strongTopics);

      // Deactivate prior study plans
      await StudyPlan.updateMany({ userId: req.user.userId }, { $set: { isActive: false } });

      const newPlan = new StudyPlan({
        userId: req.user.userId,
        primaryWeakTopic: summary.weakTopics[0] || 'Core Review',
        days: planDays,
        aiRationale: `Customized 7-day learning trajectory focusing on ${summary.weakTopics[0] || 'fundamental review'} with active recall and adaptive assessments.`,
        isActive: true,
      });

      await newPlan.save();
      return sendSuccess(res, newPlan, 'Personalized 7-day study plan generated', 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/ai/active-study-plan
   */
  static async getActiveStudyPlan(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);

      let plan = await StudyPlan.findOne({ userId: req.user.userId, isActive: true });
      if (!plan) {
        // Auto-generate initial plan if none exists
        const summary = await PerformanceService.getStudentSummary(req.user.userId);
        const planDays = AIService.generateStudyPlan(summary.weakTopics, summary.strongTopics);
        plan = new StudyPlan({
          userId: req.user.userId,
          primaryWeakTopic: summary.weakTopics[0] || 'Foundations',
          days: planDays,
          aiRationale: 'Initial personalized learning plan based on baseline diagnostic.',
          isActive: true,
        });
        await plan.save();
      }

      return sendSuccess(res, plan, 'Active study plan retrieved');
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/ai/generate-adaptive
   */
  static async generateAdaptiveQuiz(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);

      const { topic, questionCount = 8, documentId } = req.body;
      const quiz = await AdaptiveService.generateAdaptiveQuizForStudent(
        req.user.userId,
        topic,
        parseInt(questionCount, 10) || 8,
        documentId
      );

      return sendSuccess(res, quiz, 'Personalized adaptive quiz generated', 201);
    } catch (err) {
      next(err);
    }
  }
}
