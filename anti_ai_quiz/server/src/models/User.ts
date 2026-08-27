import mongoose, { Schema, Document as MongooseDoc } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole } from '../types';

export interface IUserDoc extends MongooseDoc {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: Date;
  points: number;
  classGroup?: string;
  avatarUrl?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
  recordActivity(): Promise<void>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDoc>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ['STUDENT', 'TEACHER', 'ADMIN'],
      default: 'STUDENT',
      index: true,
    },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActivityDate: { type: Date },
    points: { type: Number, default: 0 },
    classGroup: { type: String, default: 'Class 101' },
    avatarUrl: { type: String },
  },
  { timestamps: true }
);

// Hash password prior to saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Safe streak update (prevents multiple increases within the same calendar day)
UserSchema.methods.recordActivity = async function (): Promise<void> {
  const now = new Date();
  const last = this.lastActivityDate ? new Date(this.lastActivityDate) : null;

  if (!last) {
    this.currentStreak = 1;
    this.longestStreak = Math.max(this.longestStreak || 0, 1);
  } else {
    // Check calendar day difference
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfLast = new Date(last.getFullYear(), last.getMonth(), last.getDate()).getTime();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const diffDays = Math.round((startOfToday - startOfLast) / oneDayMs);

    if (diffDays === 1) {
      // Consecutive day!
      this.currentStreak += 1;
      if (this.currentStreak > this.longestStreak) {
        this.longestStreak = this.currentStreak;
      }
    } else if (diffDays > 1) {
      // Streak broken
      this.currentStreak = 1;
    }
    // If diffDays === 0, already recorded today, keep current streak
  }

  this.lastActivityDate = now;
  await this.save();
};

export const User = mongoose.model<IUserDoc>('User', UserSchema);
