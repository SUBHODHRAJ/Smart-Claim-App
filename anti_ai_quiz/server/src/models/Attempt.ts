import mongoose, { Schema, Document as MongooseDoc } from 'mongoose';
import { IAttemptAnswer } from '../types';

export interface IAttemptDoc extends MongooseDoc {
  userId: mongoose.Types.ObjectId;
  quizId: mongoose.Types.ObjectId;
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
  createdAt: Date;
  updatedAt: Date;
}

const AttemptAnswerSchema = new Schema(
  {
    questionId: { type: String, required: true },
    questionText: { type: String, required: true },
    options: [{ type: String }],
    selectedAnswer: { type: String, required: true },
    correctAnswer: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
    explanation: { type: String },
    topic: { type: String, required: true },
    difficulty: { type: String, default: 'MEDIUM' },
    sourceReference: {
      documentId: String,
      documentTitle: String,
      page: Number,
      chunkIndex: Number,
      snippet: String,
    },
    timeSpentSeconds: { type: Number, default: 0 },
  },
  { _id: false }
);

const TopicBreakdownSchema = new Schema(
  {
    topic: { type: String, required: true },
    total: { type: Number, required: true },
    correct: { type: Number, required: true },
    accuracy: { type: Number, required: true },
  },
  { _id: false }
);

const AttemptSchema = new Schema<IAttemptDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
    quizTitle: { type: String, required: true },
    answers: [AttemptAnswerSchema],
    startedAt: { type: Date, required: true },
    submittedAt: { type: Date },
    score: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    timeTakenSeconds: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['IN_PROGRESS', 'COMPLETED', 'EXPIRED'],
      default: 'IN_PROGRESS',
      index: true,
    },
    topicBreakdown: [TopicBreakdownSchema],
  },
  { timestamps: true }
);

AttemptSchema.index({ userId: 1, createdAt: -1 });

export const Attempt = mongoose.model<IAttemptDoc>('Attempt', AttemptSchema);
