import mongoose from 'mongoose';
import { Quiz, IQuizDoc } from '../models/Quiz';
import { Question, IQuestionDoc } from '../models/Question';
import { DocumentModel } from '../models/Document';
import { AppError } from '../utils/response';
import { ValidationStatus, DifficultyLevel } from '../types';

export class QuizService {
  /**
   * Save newly generated questions as PENDING for teacher review
   */
  static async saveGeneratedQuestions(
    questionsData: any[],
    documentId: string,
    userId: string
  ): Promise<IQuestionDoc[]> {
    const created: IQuestionDoc[] = [];

    for (const q of questionsData) {
      const question = new Question({
        documentId: new mongoose.Types.ObjectId(documentId),
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || '',
        topic: q.topic || 'General',
        difficulty: q.difficulty || 'MEDIUM',
        sourceReference: q.sourceReference,
        aiQualityScore: q.aiQualityScore || 90,
        validationStatus: 'PENDING',
        createdBy: new mongoose.Types.ObjectId(userId),
      });

      await question.save();
      created.push(question);
    }

    return created;
  }

  /**
   * Teacher updates or edits a question
   */
  static async updateQuestion(
    questionId: string,
    updates: Partial<{
      question: string;
      options: string[];
      correctAnswer: string;
      explanation: string;
      topic: string;
      difficulty: DifficultyLevel;
      validationStatus: ValidationStatus;
    }>,
    userId: string,
    userRole: string
  ): Promise<IQuestionDoc> {
    const question = await Question.findById(questionId);
    if (!question) {
      throw new AppError('Question not found', 404, 'NOT_FOUND');
    }

    if (question.createdBy.toString() !== userId && userRole !== 'ADMIN' && userRole !== 'TEACHER') {
      throw new AppError('Permission denied', 403, 'FORBIDDEN');
    }

    if (updates.question !== undefined) question.question = updates.question;
    if (updates.options !== undefined) question.options = updates.options;
    if (updates.correctAnswer !== undefined) question.correctAnswer = updates.correctAnswer;
    if (updates.explanation !== undefined) question.explanation = updates.explanation;
    if (updates.topic !== undefined) question.topic = updates.topic;
    if (updates.difficulty !== undefined) question.difficulty = updates.difficulty;
    if (updates.validationStatus !== undefined) question.validationStatus = updates.validationStatus;

    await question.save();
    return question;
  }

  /**
   * Teacher sets validation status (APPROVED, REJECTED, PENDING)
   */
  static async setQuestionStatus(
    questionId: string,
    status: ValidationStatus,
    userId: string,
    userRole: string
  ): Promise<IQuestionDoc> {
    return this.updateQuestion(questionId, { validationStatus: status }, userId, userRole);
  }

  /**
   * Create a Quiz from questions
   */
  static async createQuiz(params: {
    title: string;
    description?: string;
    documentId?: string;
    questionIds: string[];
    createdBy: string;
    difficulty?: DifficultyLevel;
    timeLimitMinutes?: number;
    isPublished?: boolean;
    isAdaptive?: boolean;
    topic?: string;
  }): Promise<IQuizDoc> {
    const {
      title,
      description,
      documentId,
      questionIds,
      createdBy,
      difficulty = 'MEDIUM',
      timeLimitMinutes = 15,
      isPublished = false,
      isAdaptive = false,
      topic = 'General',
    } = params;

    if (!questionIds || questionIds.length === 0) {
      throw new AppError('A quiz must contain at least 1 question', 400, 'NO_QUESTIONS');
    }

    const quiz = new Quiz({
      title,
      description: description || '',
      documentId: documentId ? new mongoose.Types.ObjectId(documentId) : undefined,
      questionIds: questionIds.map((id) => new mongoose.Types.ObjectId(id)),
      createdBy: new mongoose.Types.ObjectId(createdBy),
      difficulty,
      timeLimitMinutes,
      isPublished,
      isAdaptive,
      topic,
    });

    await quiz.save();

    // Link quizId back to questions
    await Question.updateMany(
      { _id: { $in: questionIds.map((id) => new mongoose.Types.ObjectId(id)) } },
      { $set: { quizId: quiz._id } }
    );

    return quiz;
  }

  /**
   * Publish or unpublish a quiz
   */
  static async publishQuiz(
    quizId: string,
    isPublished: boolean,
    userId: string,
    userRole: string
  ): Promise<IQuizDoc> {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      throw new AppError('Quiz not found', 404, 'NOT_FOUND');
    }

    if (quiz.createdBy.toString() !== userId && userRole !== 'ADMIN') {
      throw new AppError('Permission denied to publish this quiz', 403, 'FORBIDDEN');
    }

    quiz.isPublished = isPublished;
    await quiz.save();
    return quiz;
  }

  /**
   * List quizzes based on role and access
   */
  static async listQuizzes(userId: string, userRole: string) {
    if (userRole === 'TEACHER' || userRole === 'ADMIN') {
      // Teachers see all quizzes they created or all if admin
      return Quiz.find(userRole === 'ADMIN' ? {} : { createdBy: new mongoose.Types.ObjectId(userId) })
        .populate('questionIds')
        .sort({ createdAt: -1 })
        .lean();
    }

    // Students only see published quizzes
    return Quiz.find({ isPublished: true })
      .select('-__v')
      .populate({
        path: 'questionIds',
        select: '-correctAnswer -explanation', // Protect answers before student starts attempt
      })
      .sort({ createdAt: -1 })
      .lean();
  }

  /**
   * Get quiz by ID
   */
  static async getQuizById(quizId: string, userId: string, userRole: string, forTaking = false) {
    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      throw new AppError('Invalid quiz ID format', 400, 'INVALID_ID');
    }

    const quiz = await Quiz.findById(quizId).populate('questionIds');
    if (!quiz) {
      throw new AppError('Quiz not found', 404, 'NOT_FOUND');
    }

    if (!quiz.isPublished && quiz.createdBy.toString() !== userId && userRole !== 'ADMIN') {
      throw new AppError('This quiz is not yet published', 403, 'FORBIDDEN');
    }

    // If a student is taking or previewing the quiz, strip answers to prevent cheating
    if (userRole === 'STUDENT' || forTaking) {
      const safeQuiz = quiz.toObject();
      safeQuiz.questionIds = safeQuiz.questionIds.map((q: any) => {
        const { correctAnswer, ...safeQ } = q;
        return safeQ;
      });
      return safeQuiz;
    }

    return quiz;
  }

  /**
   * Delete quiz
   */
  static async deleteQuiz(quizId: string, userId: string, userRole: string) {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) throw new AppError('Quiz not found', 404, 'NOT_FOUND');
    if (quiz.createdBy.toString() !== userId && userRole !== 'ADMIN') {
      throw new AppError('Permission denied', 403, 'FORBIDDEN');
    }
    await Quiz.findByIdAndDelete(quizId);
    return { success: true };
  }
}
