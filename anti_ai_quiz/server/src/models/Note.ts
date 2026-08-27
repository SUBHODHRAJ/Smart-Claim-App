import mongoose, { Schema, Document as MongooseDoc } from 'mongoose';

export interface INoteDoc extends MongooseDoc {
  userId: mongoose.Types.ObjectId;
  documentId?: mongoose.Types.ObjectId;
  quizId?: mongoose.Types.ObjectId;
  topic: string;
  title: string;
  content: string;
  tags: string[];
  isShared: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<INoteDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    documentId: { type: Schema.Types.ObjectId, ref: 'Document' },
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz' },
    topic: { type: String, required: true, default: 'General', index: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    tags: [{ type: String }],
    isShared: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NoteSchema.index({ userId: 1, topic: 1 });

export const Note = mongoose.model<INoteDoc>('Note', NoteSchema);
