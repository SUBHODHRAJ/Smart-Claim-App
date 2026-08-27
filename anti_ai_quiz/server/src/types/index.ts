export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';

export type QuestionType = 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER';

export type ValidationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type FlashcardStatus = 'LEARNING' | 'KNOWN' | 'DIFFICULT';

export interface ISourceReference {
  documentId: string;
  documentTitle?: string;
  page?: number;
  chunkIndex?: number;
  snippet?: string;
}

export interface IQuestion {
  _id?: string;
  quizId?: string;
  documentId?: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  topic: string;
  difficulty: DifficultyLevel;
  sourceReference?: ISourceReference;
  aiQualityScore?: number;
  validationStatus: ValidationStatus;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IQuiz {
  _id?: string;
  title: string;
  description?: string;
  documentId?: string;
  questions: IQuestion[];
  createdBy: string;
  difficulty: DifficultyLevel;
  timeLimitMinutes: number;
  isPublished: boolean;
  isAdaptive?: boolean;
  topic?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAttemptAnswer {
  questionId: string;
  questionText: string;
  options: string[];
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation?: string;
  topic: string;
  difficulty: DifficultyLevel;
  sourceReference?: ISourceReference;
  timeSpentSeconds?: number;
}

export interface IAttempt {
  _id?: string;
  userId: string;
  quizId: string;
  quizTitle: string;
  answers: IAttemptAnswer[];
  startedAt: Date;
  submittedAt: Date;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeTakenSeconds: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED';
  topicBreakdown: {
    topic: string;
    total: number;
    correct: number;
    accuracy: number;
  }[];
}

export interface ITopicPerformance {
  topic: string;
  questionsAttempted: number;
  correct: number;
  incorrect: number;
  accuracy: number;
  averageTimeSeconds: number;
  isWeak: boolean;
  difficultyPerformance: {
    easy: { total: number; correct: number };
    medium: { total: number; correct: number };
    hard: { total: number; correct: number };
  };
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  lastPracticed: Date;
}

export interface IPerformanceSummary {
  userId: string;
  overallAccuracy: number;
  totalQuizzesTaken: number;
  totalQuestionsAttempted: number;
  totalCorrect: number;
  currentStreak: number;
  longestStreak: number;
  topics: ITopicPerformance[];
  weakTopics: string[];
  strongTopics: string[];
  recommendedDifficulty: DifficultyLevel;
  recentScoreAvg: number;
  improvementRate: number;
}

export interface IAIRecommendation {
  strengths: string[];
  weaknesses: string[];
  primaryWeakTopic: string;
  recommendations: string[];
  nextActions: string[];
  suggestedQuizConfig: {
    topic: string;
    difficulty: DifficultyLevel;
    questionCount: number;
  };
}

export interface IStudyPlanDay {
  dayNumber: number;
  title: string;
  topic: string;
  focusArea: string;
  tasks: {
    type: 'REVIEW_NOTES' | 'FLASHCARDS' | 'PRACTICE_QUIZ' | 'MOCK_TEST' | 'ASSESSMENT';
    description: string;
    completed: boolean;
    estimatedMinutes: number;
  }[];
}

export interface IApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errorCode?: string;
}
