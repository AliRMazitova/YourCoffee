import { Router } from 'express';
import {
  getAllDrinks,
  getDrinkById,
  getDrinkVolumes,
  getDrinkIngredients,
  getDrinkTags,
  getDrinkMoods,
  getDrinkAddons,
  calculateDrinkPrice,
} from '../controllers/drinksController.js';

const router = Router();

router.post('/calculate', calculateDrinkPrice);
router.get('/', getAllDrinks);
router.get('/:id', getDrinkById);
router.get('/:id/volumes', getDrinkVolumes);
router.get('/:id/ingredients', getDrinkIngredients);
router.get('/:id/tags', getDrinkTags);
router.get('/:id/moods', getDrinkMoods);
router.get('/:id/addons', getDrinkAddons);

export default router;
