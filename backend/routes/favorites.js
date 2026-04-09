import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  getFavorites,
  addFavorite,
  removeFavorite,
} from '../controllers/favoritesController.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getFavorites);
router.post('/', addFavorite);
router.delete('/:drink_id', removeFavorite);

export default router;
