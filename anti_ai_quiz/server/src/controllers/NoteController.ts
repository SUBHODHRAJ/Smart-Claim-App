import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Note } from '../models/Note';
import { sendSuccess, AppError } from '../utils/response';

export class NoteController {
  static async createNote(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const { title, content, topic, documentId, quizId, tags } = req.body;

      if (!title || !content) {
        throw new AppError('Title and content are required', 400);
      }

      const note = new Note({
        userId: new mongoose.Types.ObjectId(req.user.userId),
        title,
        content,
        topic: topic || 'General',
        documentId: documentId ? new mongoose.Types.ObjectId(documentId) : undefined,
        quizId: quizId ? new mongoose.Types.ObjectId(quizId) : undefined,
        tags: Array.isArray(tags) ? tags : [],
      });

      await note.save();
      return sendSuccess(res, note, 'Note created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  static async listNotes(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const topic = req.query.topic as string;
      const query: any = { userId: new mongoose.Types.ObjectId(req.user.userId) };
      if (topic && topic !== 'ALL') {
        query.topic = new RegExp(topic, 'i');
      }
      const notes = await Note.find(query).sort({ updatedAt: -1 }).lean();
      return sendSuccess(res, notes, 'Notes retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async updateNote(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const note = await Note.findById(req.params.id);
      if (!note) throw new AppError('Note not found', 404);
      if (note.userId.toString() !== req.user.userId) throw new AppError('Access denied', 403);

      const { title, content, topic, tags } = req.body;
      if (title !== undefined) note.title = title;
      if (content !== undefined) note.content = content;
      if (topic !== undefined) note.topic = topic;
      if (tags !== undefined) note.tags = tags;

      await note.save();
      return sendSuccess(res, note, 'Note updated');
    } catch (err) {
      next(err);
    }
  }

  static async deleteNote(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const note = await Note.findById(req.params.id);
      if (!note) throw new AppError('Note not found', 404);
      if (note.userId.toString() !== req.user.userId) throw new AppError('Access denied', 403);

      await Note.findByIdAndDelete(req.params.id);
      return sendSuccess(res, { success: true }, 'Note deleted');
    } catch (err) {
      next(err);
    }
  }
}
