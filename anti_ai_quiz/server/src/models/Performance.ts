import mongoose, { Schema, Document as MongooseDoc } from 'mongoose';
import { ITopicPerformance, DifficultyLevel } from '../types';

export interface IPerformanceDoc extends MongooseDoc {
  userId: mongoose.Types.ObjectId;
  overallAccuracy: number;
  totalQuizzesTaken: number;
  totalQuestionsAttempted: number;
  totalCorrect: number;
  totalTimeSpentSeconds: number;
  topics: ITopicPerformance[];
  weakTopics: string[];
  strongTopics: string[];
  recommendedDifficulty: DifficultyLevel;
  recentScores: number[];
  recentScoreAvg: number;
  improvementRate: number;
  updatedAt: Date;
}

const TopicPerformanceSchema = new Schema(
  {
    topic: { type: String, required: true },
    questionsAttempted: { type: Number, default: 0 },
    correct: { type: Number, default: 0 },
    incorrect: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    averageTimeSeconds: { type: Number, default: 0 },
    isWeak: { type: Boolean, default: false },
    difficultyPerformance: {
      easy: { total: { type: Number, default: 0 }, correct: { type: Number, default: 0 } },
      medium: { total: { type: Number, default: 0 }, correct: { type: Number, default: 0 } },
      hard: { total: { type: Number, default: 0 }, correct: { type: Number, default: 0 } },
    },
    trend: { type: String, enum: ['IMPROVING', 'STABLE', 'DECLINING'], default: 'STABLE' },
    lastPracticed: { type: Date, default: Date.now },
  },
  { _id: false }
);

const PerformanceSchema = new Schema<IPerformanceDoc>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    overallAccuracy: { type: Number, default: 0 },
    totalQuizzesTaken: { type: Number, default: 0 },
    totalQuestionsAttempted: { type: Number, default: 0 },
    totalCorrect: { type: Number, default: 0 },
    totalTimeSpentSeconds: { type: Number, default: 0 },
    topics: [TopicPerformanceSchema],
    weakTopics: [{ type: String }],
    strongTopics: [{ type: String }],
    recommendedDifficulty: {
      type: String,
      enum: ['EASY', 'MEDIUM', 'HARD'],
      default: 'MEDIUM',
    },
    recentScores: [{ type: Number }],
    recentScoreAvg: { type: Number, default: 0 },
    improvementRate: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Performance = mongoose.model<IPerformanceDoc>('Performance', PerformanceSchema);
