import { Router } from 'express';
import { getIngredients } from '../controllers/catalogController.js';

const router = Router();

router.get('/', getIngredients);

export default router;
