import mongoose, { Schema, Document as MongooseDoc } from 'mongoose';

export interface IAssignmentDoc extends MongooseDoc {
  quizId: mongoose.Types.ObjectId;
  quizTitle: string;
  targetRole: 'ALL' | 'CLASS' | 'INDIVIDUAL';
  targetUserIds: mongoose.Types.ObjectId[];
  classGroup?: string;
  startDate: Date;
  dueDate: Date;
  timeLimitMinutes: number;
  attemptsAllowed: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema = new Schema<IAssignmentDoc>(
  {
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
    quizTitle: { type: String, required: true },
    targetRole: {
      type: String,
      enum: ['ALL', 'CLASS', 'INDIVIDUAL'],
      default: 'ALL',
    },
    targetUserIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    classGroup: { type: String, default: 'Class 101' },
    startDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    timeLimitMinutes: { type: Number, default: 20 },
    attemptsAllowed: { type: Number, default: 3 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

export const Assignment = mongoose.model<IAssignmentDoc>('Assignment', AssignmentSchema);
