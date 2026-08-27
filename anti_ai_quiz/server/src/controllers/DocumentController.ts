import { Request, Response, NextFunction } from 'express';
import { DocumentService } from '../services/DocumentService';
import { sendSuccess, AppError } from '../utils/response';

export class DocumentController {
  static async uploadDocument(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      
      const file = req.file;
      const { title, isPublic, textContent } = req.body;

      let doc;
      if (file) {
        doc = await DocumentService.processAndSave(
          file.buffer,
          file.mimetype,
          file.originalname,
          title || file.originalname,
          req.user.userId,
          isPublic === 'true' || isPublic === true
        );
      } else if (textContent) {
        doc = await DocumentService.processRawText(
          textContent,
          title || 'Pasted Notes',
          req.user.userId,
          isPublic === 'true' || isPublic === true
        );
      } else {
        throw new AppError('Please provide a file or pasted text content', 400, 'NO_CONTENT');
      }

      return sendSuccess(res, doc, 'Document processed and extracted successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  static async listDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const docs = await DocumentService.listUserDocuments(req.user.userId, req.user.role);
      return sendSuccess(res, docs, 'Documents retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async getDocument(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const doc = await DocumentService.getById(req.params.id, req.user.userId, req.user.role);
      return sendSuccess(res, doc, 'Document details retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async deleteDocument(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const result = await DocumentService.deleteDocument(req.params.id, req.user.userId, req.user.role);
      return sendSuccess(res, result, 'Document deleted');
    } catch (err) {
      next(err);
    }
  }
}
