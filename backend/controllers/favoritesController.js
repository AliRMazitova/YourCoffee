import pool from '../config/db.js';

function resolveDrinkId(body) {
  if (body == null) return null;
  if (body.drink_id != null) return Number(body.drink_id);
  if (body.drinkId != null) return Number(body.drinkId);
  return null;
}

export async function getFavorites(req, res) {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT
         d.*,
         c.name AS category_name,
         COALESCE(MIN(dv.price), 0) AS min_price,
         COALESCE(MAX(dv.price), 0) AS max_price,
         COALESCE(
           ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL),
           '{}'
         ) AS tags
       FROM favorites f
       JOIN drinks d ON d.id = f.drink_id
       LEFT JOIN categories c ON c.id = d.category_id
       LEFT JOIN drink_volumes dv ON dv.drink_id = d.id
       LEFT JOIN drink_tags dt ON dt.drink_id = d.id
       LEFT JOIN tags t ON t.id = dt.tag_id
       WHERE f.user_id = $1
       GROUP BY f.id, d.id, c.name
       ORDER BY f.id DESC`,
      [userId]
    );

    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to get favorites' });
  }
}

export async function addFavorite(req, res) {
  const drinkId = resolveDrinkId(req.body);

  if (!Number.isFinite(drinkId)) {
    return res.status(400).json({ error: 'drink_id is required' });
  }

  try {
    const userId = req.user.id;
    const drinkExists = await pool.query('SELECT id FROM drinks WHERE id = $1', [
      drinkId,
    ]);
    if (drinkExists.rows.length === 0) {
      return res.status(404).json({ error: 'Drink not found' });
    }

    const existingFavorite = await pool.query(
      'SELECT id FROM favorites WHERE user_id = $1 AND drink_id = $2',
      [userId, drinkId]
    );

    if (existingFavorite.rows.length > 0) {
      return res.json({ message: 'Already in favorites' });
    }

    await pool.query('INSERT INTO favorites (user_id, drink_id) VALUES ($1, $2)', [
      userId,
      drinkId,
    ]);

    return res.status(201).json({ message: 'Added to favorites' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to add favorite' });
  }
}

export async function removeFavorite(req, res) {
  try {
    const userId = req.user.id;
    const drinkId = Number(req.params.drink_id);

    if (!Number.isFinite(drinkId)) {
      return res.status(400).json({ error: 'Invalid drink_id' });
    }

    await pool.query(
      'DELETE FROM favorites WHERE user_id = $1 AND drink_id = $2',
      [userId, drinkId]
    );

    return res.json({ message: 'Removed from favorites' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to remove favorite' });
  }
}
