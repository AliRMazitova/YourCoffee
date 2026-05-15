import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  getRecommendations,
  getRecommendationsByMood,
  getDailyDrink,
  getWeatherRecommendations,
} from '../controllers/recommendationsController.js';

const router = Router();

router.get('/weather', getWeatherRecommendations);
router.get('/mood/:mood_id', getRecommendationsByMood);

router.use(authMiddleware);

router.get('/daily', getDailyDrink);
router.get('/', getRecommendations);

export default router;
