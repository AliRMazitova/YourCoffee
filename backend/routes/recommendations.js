import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  getRecommendations,
  getRecommendationsByMood,
  getDailyDrink,
} from '../controllers/recommendationsController.js';

const router = Router();

router.use(authMiddleware);

router.get('/daily', getDailyDrink);
router.get('/mood/:mood_id', getRecommendationsByMood);
router.get('/', getRecommendations);

export default router;
