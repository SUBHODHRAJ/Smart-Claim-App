import { Router } from 'express';
import { PerformanceController } from '../controllers/PerformanceController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', PerformanceController.getStudentPerformance);
router.get('/topics', PerformanceController.getTopicsPerformance);
router.get('/teacher-analytics', requireRole('TEACHER', 'ADMIN'), PerformanceController.getTeacherAnalytics);

export default router;
