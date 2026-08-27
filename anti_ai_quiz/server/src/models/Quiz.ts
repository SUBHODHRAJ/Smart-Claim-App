import mongoose, { Schema, Document as MongooseDoc } from 'mongoose';
import { DifficultyLevel } from '../types';

export interface IQuizDoc extends MongooseDoc {
  title: string;
  description: string;
  documentId?: mongoose.Types.ObjectId;
  questionIds: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  difficulty: DifficultyLevel;
  timeLimitMinutes: number;
  isPublished: boolean;
  isAdaptive: boolean;
  topic: string;
  passPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}

const QuizSchema = new Schema<IQuizDoc>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    documentId: { type: Schema.Types.ObjectId, ref: 'Document', index: true },
    questionIds: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    difficulty: {
      type: String,
      enum: ['EASY', 'MEDIUM', 'HARD'],
      default: 'MEDIUM',
    },
    timeLimitMinutes: { type: Number, default: 15, min: 1, max: 180 },
    isPublished: { type: Boolean, default: false, index: true },
    isAdaptive: { type: Boolean, default: false },
    topic: { type: String, default: 'General', index: true },
    passPercentage: { type: Number, default: 60 },
  },
  { timestamps: true }
);

export const Quiz = mongoose.model<IQuizDoc>('Quiz', QuizSchema);
