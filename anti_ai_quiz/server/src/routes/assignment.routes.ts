import { Router } from 'express';
import { AssignmentController } from '../controllers/AssignmentController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.post('/', requireRole('TEACHER', 'ADMIN'), AssignmentController.createAssignment);
router.get('/student', AssignmentController.listStudentAssignments);
router.get('/teacher', requireRole('TEACHER', 'ADMIN'), AssignmentController.listTeacherAssignments);
router.delete('/:id', requireRole('TEACHER', 'ADMIN'), AssignmentController.deleteAssignment);

export default router;
