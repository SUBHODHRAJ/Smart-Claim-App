import mongoose from 'mongoose';
import { Assignment, IAssignmentDoc } from '../models/Assignment';
import { Quiz } from '../models/Quiz';
import { AppError } from '../utils/response';

export class AssignmentService {
  static async createAssignment(params: {
    quizId: string;
    targetRole?: 'ALL' | 'CLASS' | 'INDIVIDUAL';
    targetUserIds?: string[];
    classGroup?: string;
    startDate?: Date;
    dueDate: Date;
    timeLimitMinutes?: number;
    attemptsAllowed?: number;
    createdBy: string;
  }): Promise<IAssignmentDoc> {
    const {
      quizId,
      targetRole = 'ALL',
      targetUserIds = [],
      classGroup = 'Class 101',
      startDate = new Date(),
      dueDate,
      timeLimitMinutes = 20,
      attemptsAllowed = 3,
      createdBy,
    } = params;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      throw new AppError('Quiz not found to assign', 404, 'NOT_FOUND');
    }

    const assignment = new Assignment({
      quizId: quiz._id,
      quizTitle: quiz.title,
      targetRole,
      targetUserIds: targetUserIds.map((id) => new mongoose.Types.ObjectId(id)),
      classGroup,
      startDate,
      dueDate,
      timeLimitMinutes,
      attemptsAllowed,
      createdBy: new mongoose.Types.ObjectId(createdBy),
    });

    await assignment.save();
    return assignment;
  }

  static async listAssignmentsForStudent(userId: string, classGroup = 'Class 101') {
    return Assignment.find({
      $or: [
        { targetRole: 'ALL' },
        { targetRole: 'CLASS', classGroup },
        { targetRole: 'INDIVIDUAL', targetUserIds: new mongoose.Types.ObjectId(userId) },
      ],
      dueDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // current and recent
    })
      .populate('quizId')
      .sort({ dueDate: 1 })
      .lean();
  }

  static async listAssignmentsForTeacher(teacherId: string) {
    return Assignment.find({ createdBy: new mongoose.Types.ObjectId(teacherId) })
      .populate('quizId')
      .sort({ createdAt: -1 })
      .lean();
  }

  static async deleteAssignment(assignmentId: string, userId: string, userRole: string) {
    const item = await Assignment.findById(assignmentId);
    if (!item) throw new AppError('Assignment not found', 404, 'NOT_FOUND');
    if (item.createdBy.toString() !== userId && userRole !== 'ADMIN') {
      throw new AppError('Permission denied', 403, 'FORBIDDEN');
    }
    await Assignment.findByIdAndDelete(assignmentId);
    return { success: true };
  }
}
