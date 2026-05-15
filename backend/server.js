import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import drinksRoutes from './routes/drinks.js';
import authRoutes from './routes/auth.js';
import favoritesRoutes from './routes/favorites.js';
import preferencesRoutes from './routes/preferences.js';
import recommendationsRoutes from './routes/recommendations.js';
import categoriesRoutes from './routes/categories.js';
import tagsRoutes from './routes/tags.js';
import moodsRoutes from './routes/moods.js';
import ingredientsRoutes from './routes/ingredients.js';
import pool from './config/db.js';
import { syncDrinkImages } from './services/drinkImageSync.js';
import { notFoundHandler, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, 'uploads');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmet());
app.use(
  cors({
    origin: allowedOrigin,
  })
);
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

app.get('/', (req, res) => {
  res.json({ ok: true, message: 'YourCoffee API' });
});

app.use('/api/drinks', drinksRoutes);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/preferences', preferencesRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/tags', tagsRoutes);
app.use('/api/moods', moodsRoutes);
app.use('/api/ingredients', ingredientsRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

async function bootstrap() {
  try {
    const updated = await syncDrinkImages(pool);
    if (updated > 0) {
      console.log(`Backfilled ${updated} drink image URLs`);
    }
  } catch (error) {
    console.warn(`Drink image sync skipped: ${error.message}`);
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

bootstrap();
