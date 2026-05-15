import pool from '../config/db.js';
import { drinkImages } from '../constants/drinkImages.js';

export async function syncDrinkImages(db = pool, options = {}) {
  const { overwrite = false } = options;
  let updated = 0;

  for (const [name, imageUrl] of drinkImages) {
    const result = await db.query(
      overwrite
        ? 'UPDATE drinks SET image_url = $1 WHERE name = $2'
        : `UPDATE drinks
           SET image_url = $1
           WHERE name = $2
             AND (image_url IS NULL OR btrim(image_url) = '')`,
      [imageUrl, name],
    );

    updated += result.rowCount ?? 0;
  }

  return updated;
}
