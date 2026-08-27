export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';
export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';
export type ValidationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type FlashcardStatus = 'LEARNING' | 'KNOWN' | 'DIFFICULT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  currentStreak: number;
  longestStreak: number;
  points: number;
  classGroup?: string;
  avatarUrl?: string;
}

export interface SourceReference {
  documentId: string;
  documentTitle?: string;
  page?: number;
  chunkIndex?: number;
  snippet?: string;
}

export interface Question {
  _id: string;
  quizId?: string;
  documentId?: string;
  question: string;
  options: string[];
  correctAnswer?: string;
  explanation?: string;
  topic: string;
  difficulty: DifficultyLevel;
  sourceReference?: SourceReference;
  aiQualityScore: number;
  validationStatus: ValidationStatus;
  createdBy?: string;
  createdAt?: string;
}

export interface Quiz {
  _id: string;
  title: string;
  description: string;
  documentId?: string;
  questionIds: Question[] | string[];
  createdBy: string;
  difficulty: DifficultyLevel;
  timeLimitMinutes: number;
  isPublished: boolean;
  isAdaptive?: boolean;
  topic: string;
  passPercentage?: number;
  createdAt: string;
}

export interface AttemptAnswer {
  questionId: string;
  questionText: string;
  options: string[];
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation?: string;
  topic: string;
  difficulty: DifficultyLevel;
  sourceReference?: SourceReference;
  timeSpentSeconds?: number;
}

export interface Attempt {
  _id: string;
  userId: string;
  quizId: string;
  quizTitle: string;
  answers: AttemptAnswer[];
  startedAt: string;
  submittedAt?: string;
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
  createdAt: string;
}

export interface DocumentItem {
  _id: string;
  owner: string;
  title: string;
  originalFilename: string;
  fileType: string;
  fileSize: number;
  totalPages: number;
  topics: string[];
  chunks: {
    chunkIndex: number;
    text: string;
    page: number;
    wordCount: number;
    topicKeywords: string[];
  }[];
  isPublic: boolean;
  createdAt: string;
}

export interface TopicPerformance {
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
  lastPracticed: string;
}

export interface PerformanceSummary {
  userId: string;
  overallAccuracy: number;
  totalQuizzesTaken: number;
  totalQuestionsAttempted: number;
  totalCorrect: number;
  currentStreak: number;
  longestStreak: number;
  topics: TopicPerformance[];
  weakTopics: string[];
  strongTopics: string[];
  recommendedDifficulty: DifficultyLevel;
  recentScoreAvg: number;
  improvementRate: number;
}

export interface AIRecommendation {
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

export interface StudyPlanDay {
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

export interface StudyPlan {
  _id: string;
  userId: string;
  primaryWeakTopic: string;
  days: StudyPlanDay[];
  aiRationale: string;
  isActive: boolean;
  generatedAt: string;
}

export interface FlashcardItem {
  _id: string;
  userId: string;
  documentId?: string;
  topic: string;
  front: string;
  back: string;
  status: FlashcardStatus;
  reviewCount: number;
  lastReviewed?: string;
  sourceReference?: SourceReference;
}

export interface NoteItem {
  _id: string;
  userId: string;
  documentId?: string;
  quizId?: string;
  topic: string;
  title: string;
  content: string;
  tags: string[];
  isShared: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentItem {
  _id: string;
  quizId: Quiz;
  quizTitle: string;
  targetRole: 'ALL' | 'CLASS' | 'INDIVIDUAL';
  classGroup?: string;
  startDate: string;
  dueDate: string;
  timeLimitMinutes: number;
  attemptsAllowed: number;
  createdBy: string;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  points: number;
  streak: number;
  classGroup: string;
}

export interface AchievementItem {
  _id: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
}
