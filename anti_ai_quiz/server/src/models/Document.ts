import mongoose, { Schema, Document as MongooseDoc } from 'mongoose';
import { ExtractedChunk } from '../utils/pdfExtractor';

export interface IDocumentDoc extends MongooseDoc {
  owner: mongoose.Types.ObjectId;
  title: string;
  originalFilename: string;
  fileType: string;
  fileSize: number;
  extractedText: string;
  totalPages: number;
  chunks: ExtractedChunk[];
  topics: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChunkSchema = new Schema(
  {
    chunkIndex: { type: Number, required: true },
    text: { type: String, required: true },
    page: { type: Number, default: 1 },
    wordCount: { type: Number, default: 0 },
    topicKeywords: [{ type: String }],
  },
  { _id: false }
);

const DocumentSchema = new Schema<IDocumentDoc>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    originalFilename: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    extractedText: { type: String, required: true },
    totalPages: { type: Number, default: 1 },
    chunks: [ChunkSchema],
    topics: [{ type: String, index: true }],
    isPublic: { type: Boolean, default: false },
  },
  { timestamps: true }
);

DocumentSchema.index({ owner: 1, createdAt: -1 });

export const DocumentModel = mongoose.model<IDocumentDoc>('Document', DocumentSchema);
