import { Router } from 'express';
import { AdminController } from '../controllers/GamificationController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.use(requireRole('ADMIN'));

router.get('/stats', AdminController.getPlatformStats);
router.get('/users', AdminController.listUsers);
router.put('/users/:id/role', AdminController.updateUserRole);

export default router;
