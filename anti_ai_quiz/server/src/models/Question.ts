import mongoose, { Schema, Document as MongooseDoc } from 'mongoose';
import { DifficultyLevel, ValidationStatus, ISourceReference } from '../types';

export interface IQuestionDoc extends MongooseDoc {
  quizId?: mongoose.Types.ObjectId;
  documentId?: mongoose.Types.ObjectId;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  topic: string;
  difficulty: DifficultyLevel;
  sourceReference?: ISourceReference;
  aiQualityScore: number;
  validationStatus: ValidationStatus;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SourceReferenceSchema = new Schema(
  {
    documentId: { type: String },
    documentTitle: { type: String },
    page: { type: Number },
    chunkIndex: { type: Number },
    snippet: { type: String },
  },
  { _id: false }
);

const QuestionSchema = new Schema<IQuestionDoc>(
  {
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', index: true },
    documentId: { type: Schema.Types.ObjectId, ref: 'Document', index: true },
    question: { type: String, required: true, trim: true },
    options: {
      type: [String],
      required: true,
      validate: [(val: string[]) => val.length >= 2, 'Options must have at least 2 choices'],
    },
    correctAnswer: { type: String, required: true, trim: true },
    explanation: { type: String, default: '' },
    topic: { type: String, required: true, trim: true, index: true },
    difficulty: {
      type: String,
      enum: ['EASY', 'MEDIUM', 'HARD'],
      default: 'MEDIUM',
      index: true,
    },
    sourceReference: SourceReferenceSchema,
    aiQualityScore: { type: Number, default: 90, min: 0, max: 100 },
    validationStatus: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

export const Question = mongoose.model<IQuestionDoc>('Question', QuestionSchema);
