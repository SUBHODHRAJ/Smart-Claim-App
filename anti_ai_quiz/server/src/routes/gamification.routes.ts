import { Router } from 'express';
import { GamificationController } from '../controllers/GamificationController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Leaderboard is viewable by authenticated users
router.get('/leaderboard', authenticateToken, GamificationController.getLeaderboard);
router.get('/achievements', authenticateToken, GamificationController.getMyAchievements);

export default router;
