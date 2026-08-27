import mongoose, { Schema, Document as MongooseDoc } from 'mongoose';
import { FlashcardStatus, ISourceReference } from '../types';

export interface IFlashcardDoc extends MongooseDoc {
  userId: mongoose.Types.ObjectId;
  documentId?: mongoose.Types.ObjectId;
  topic: string;
  front: string;
  back: string;
  status: FlashcardStatus;
  reviewCount: number;
  lastReviewed?: Date;
  sourceReference?: ISourceReference;
  createdAt: Date;
  updatedAt: Date;
}

const FlashcardSchema = new Schema<IFlashcardDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    documentId: { type: Schema.Types.ObjectId, ref: 'Document', index: true },
    topic: { type: String, required: true, index: true },
    front: { type: String, required: true, trim: true },
    back: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['LEARNING', 'KNOWN', 'DIFFICULT'],
      default: 'LEARNING',
      index: true,
    },
    reviewCount: { type: Number, default: 0 },
    lastReviewed: { type: Date },
    sourceReference: {
      documentId: String,
      documentTitle: String,
      page: Number,
      snippet: String,
    },
  },
  { timestamps: true }
);

FlashcardSchema.index({ userId: 1, topic: 1 });

export const Flashcard = mongoose.model<IFlashcardDoc>('Flashcard', FlashcardSchema);
