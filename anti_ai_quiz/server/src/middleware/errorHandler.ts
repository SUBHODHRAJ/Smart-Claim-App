import { Request, Response, NextFunction } from 'express';
import { AppError, sendError } from '../utils/response';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Never expose sensitive internals
  console.error('[Error Middleware]', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
  });

  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.errorCode);
  }

  // Handle Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'Field';
    return sendError(res, `${field} already exists.`, 409, 'DUPLICATE_KEY_ERROR');
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors || {}).map((e: any) => e.message).join(', ');
    return sendError(res, `Validation Error: ${messages}`, 422, 'VALIDATION_ERROR');
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return sendError(res, 'Invalid or expired authentication token', 401, 'UNAUTHORIZED');
  }

  // Handle Multer upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return sendError(res, 'Uploaded file exceeds the maximum allowed size limit', 413, 'FILE_TOO_LARGE');
  }

  return sendError(res, err.message || 'Internal server error occurred', 500, 'INTERNAL_SERVER_ERROR');
};
