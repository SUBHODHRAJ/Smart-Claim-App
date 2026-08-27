import mongoose, { Schema, Document as MongooseDoc } from 'mongoose';
import { IStudyPlanDay } from '../types';

export interface IStudyPlanDoc extends MongooseDoc {
  userId: mongoose.Types.ObjectId;
  primaryWeakTopic: string;
  days: IStudyPlanDay[];
  aiRationale: string;
  isActive: boolean;
  generatedAt: Date;
}

const StudyPlanSchema = new Schema<IStudyPlanDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    primaryWeakTopic: { type: String, required: true },
    days: [
      {
        dayNumber: { type: Number, required: true },
        title: { type: String, required: true },
        topic: { type: String, required: true },
        focusArea: { type: String, required: true },
        tasks: [
          {
            type: {
              type: String,
              enum: ['REVIEW_NOTES', 'FLASHCARDS', 'PRACTICE_QUIZ', 'MOCK_TEST', 'ASSESSMENT'],
              required: true,
            },
            description: { type: String, required: true },
            completed: { type: Boolean, default: false },
            estimatedMinutes: { type: Number, default: 15 },
          },
        ],
      },
    ],
    aiRationale: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const StudyPlan = mongoose.model<IStudyPlanDoc>('StudyPlan', StudyPlanSchema);
