import multer from 'multer';
import { Request } from 'express';
import { env } from '../config/env';
import { AppError } from '../utils/response';

const allowedMimeTypes = [
  'application/pdf',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
];

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024, // e.g. 15MB
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Check extension and mime type
    const isAllowed = allowedMimeTypes.includes(file.mimetype) || 
      file.originalname.match(/\.(pdf|txt|docx|doc)$/i);

    if (isAllowed) {
      cb(null, true);
    } else {
      cb(new AppError('Invalid file format. Only PDF, DOCX, and TXT files are supported.', 400, 'INVALID_FILE_TYPE'));
    }
  },
});
