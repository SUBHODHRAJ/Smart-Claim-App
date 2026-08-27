import mongoose, { Schema, Document as MongooseDoc } from 'mongoose';

export interface IAchievementDoc extends MongooseDoc {
  userId: mongoose.Types.ObjectId;
  code: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
}

const AchievementSchema = new Schema<IAchievementDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    code: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, default: '🏆' },
    unlockedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

AchievementSchema.index({ userId: 1, code: 1 }, { unique: true });

export const Achievement = mongoose.model<IAchievementDoc>('Achievement', AchievementSchema);
