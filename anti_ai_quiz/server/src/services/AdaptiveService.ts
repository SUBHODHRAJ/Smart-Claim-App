import mongoose from 'mongoose';
import { PerformanceService } from './PerformanceService';
import { Question, IQuestionDoc } from '../models/Question';
import { Quiz, IQuizDoc } from '../models/Quiz';
import { AIService } from './AIService';
import { DocumentService } from './DocumentService';
import { AppError } from '../utils/response';
import { DifficultyLevel } from '../types';

export class AdaptiveService {
  /**
   * Determine difficulty distribution for a student
   */
  static getDifficultyDistribution(recentScoreAvg: number, totalQuestions: number) {
    let easyRatio = 0.4;
    let mediumRatio = 0.4;
    let hardRatio = 0.2;

    if (recentScoreAvg >= 80) {
      easyRatio = 0.2;
      mediumRatio = 0.5;
      hardRatio = 0.3;
    } else if (recentScoreAvg <= 50) {
      easyRatio = 0.5;
      mediumRatio = 0.4;
      hardRatio = 0.1;
    }

    const easyCount = Math.max(1, Math.round(totalQuestions * easyRatio));
    const hardCount = Math.max(0, Math.round(totalQuestions * hardRatio));
    const mediumCount = Math.max(1, totalQuestions - easyCount - hardCount);

    return { easyCount, mediumCount, hardCount };
  }

  /**
   * Create an Adaptive Personalized Quiz for a student
   */
  static async generateAdaptiveQuizForStudent(
    userId: string,
    targetTopic?: string,
    questionCount = 10,
    documentId?: string
  ): Promise<IQuizDoc> {
    const summary = await PerformanceService.getStudentSummary(userId);
    const weakTopics = summary.weakTopics;
    
    // Choose primary topic: specified topic, or weakest topic, or default
    const topicToFocus = targetTopic || (weakTopics.length > 0 ? weakTopics[0] : 'General');
    const { easyCount, mediumCount, hardCount } = this.getDifficultyDistribution(summary.recentScoreAvg, questionCount);

    let selectedQuestions: IQuestionDoc[] = [];

    // 1. Try finding existing approved questions in the database matching topic & difficulty
    const query: any = { validationStatus: 'APPROVED' };
    if (topicToFocus && topicToFocus !== 'General') {
      query.topic = new RegExp(topicToFocus, 'i');
    }

    const easyQuestions = await Question.find({ ...query, difficulty: 'EASY' }).limit(easyCount);
    const medQuestions = await Question.find({ ...query, difficulty: 'MEDIUM' }).limit(mediumCount);
    const hardQuestions = await Question.find({ ...query, difficulty: 'HARD' }).limit(hardCount);

    selectedQuestions = [...easyQuestions, ...medQuestions, ...hardQuestions];

    // 2. If not enough questions exist in question bank and documentId is provided, generate dynamically
    if (selectedQuestions.length < questionCount && documentId) {
      const doc = await DocumentService.getById(documentId, userId, 'STUDENT');
      const chunks = DocumentService.findRelevantChunks(doc, topicToFocus, 4);
      const needed = questionCount - selectedQuestions.length;

      const generated = await AIService.generateQuizQuestions({
        documentId: (doc._id as any).toString(),
        documentTitle: doc.title,
        topic: topicToFocus,
        chunks,
        numberOfQuestions: needed,
        difficulty: summary.recommendedDifficulty,
      });

      // Save generated questions as APPROVED for adaptive student practice
      for (const g of generated) {
        const qDoc = new Question({
          documentId: doc._id,
          question: g.question,
          options: g.options,
          correctAnswer: g.correctAnswer,
          explanation: g.explanation,
          topic: g.topic,
          difficulty: g.difficulty,
          sourceReference: g.sourceReference,
          aiQualityScore: g.aiQualityScore,
          validationStatus: 'APPROVED',
          createdBy: new mongoose.Types.ObjectId(userId),
        });
        await qDoc.save();
        selectedQuestions.push(qDoc);
      }
    }

    if (selectedQuestions.length === 0) {
      // Fallback: fetch any available approved questions or create baseline
      const fallbackQuestions = await Question.find({ validationStatus: 'APPROVED' }).limit(questionCount);
      selectedQuestions = fallbackQuestions;
    }

    if (selectedQuestions.length === 0) {
      throw new AppError('No questions available to construct adaptive quiz. Please upload study material first.', 400, 'NO_QUESTIONS_AVAILABLE');
    }

    // Create an ephemeral/practice adaptive quiz for the student
    const adaptiveQuiz = new Quiz({
      title: `Adaptive Practice: ${topicToFocus} (${summary.recommendedDifficulty})`,
      description: `Personalized adaptive assessment targeting your growth areas in ${topicToFocus}. Difficulty calibrated based on your recent average (${summary.recentScoreAvg}%).`,
      questionIds: selectedQuestions.map((q) => q._id),
      createdBy: new mongoose.Types.ObjectId(userId),
      difficulty: summary.recommendedDifficulty,
      timeLimitMinutes: Math.ceil(selectedQuestions.length * 1.5),
      isPublished: true,
      isAdaptive: true,
      topic: topicToFocus,
    });

    await adaptiveQuiz.save();
    return adaptiveQuiz;
  }
}
