import pool from '../config/db.js';
import { syncDrinkImages } from '../services/drinkImageSync.js';

try {
  await syncDrinkImages(pool, { overwrite: true });

  const result = await pool.query(
    'SELECT id, name, image_url FROM drinks ORDER BY id',
  );
  console.table(result.rows);
} finally {
  await pool.end();
}
