import { Request, Response, NextFunction } from 'express';
import { AssignmentService } from '../services/AssignmentService';
import { sendSuccess, AppError } from '../utils/response';

export class AssignmentController {
  static async createAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const { quizId, targetRole, targetUserIds, classGroup, startDate, dueDate, timeLimitMinutes, attemptsAllowed } = req.body;

      if (!quizId || !dueDate) {
        throw new AppError('quizId and dueDate are required', 400);
      }

      const assignment = await AssignmentService.createAssignment({
        quizId,
        targetRole,
        targetUserIds,
        classGroup,
        startDate: startDate ? new Date(startDate) : new Date(),
        dueDate: new Date(dueDate),
        timeLimitMinutes: parseInt(timeLimitMinutes, 10) || 20,
        attemptsAllowed: parseInt(attemptsAllowed, 10) || 3,
        createdBy: req.user.userId,
      });

      return sendSuccess(res, assignment, 'Assignment created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  static async listStudentAssignments(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const list = await AssignmentService.listAssignmentsForStudent(req.user.userId);
      return sendSuccess(res, list, 'Assigned quizzes retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async listTeacherAssignments(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const list = await AssignmentService.listAssignmentsForTeacher(req.user.userId);
      return sendSuccess(res, list, 'Created assignments retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async deleteAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const result = await AssignmentService.deleteAssignment(req.params.id, req.user.userId, req.user.role);
      return sendSuccess(res, result, 'Assignment removed');
    } catch (err) {
      next(err);
    }
  }
}
