import pool from '../config/db.js';

const HIDDEN_USER_TAGS = [
  'горячий',
  'холодный',
  'освежающий',
  'согревающий',
  'уютный',
  'нежный',
  'тонизирующий',
  'классический',
  'легкий',
  'травяной',
  'спокойный',
];

export async function getCategories(req, res) {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY id');
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch categories' });
  }
}

export async function getTags(req, res) {
  const scope = String(req.query.scope || '').trim().toLowerCase();

  try {
    if (scope === 'user') {
      const result = await pool.query(
        `SELECT *
         FROM tags
         WHERE NOT (name = ANY($1::text[]))
         ORDER BY id`,
        [HIDDEN_USER_TAGS]
      );
      return res.json(result.rows);
    }

    const result = await pool.query('SELECT * FROM tags ORDER BY id');
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch tags' });
  }
}

export async function getMoods(req, res) {
  try {
    const result = await pool.query('SELECT * FROM moods ORDER BY id');
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch moods' });
  }
}

export async function getIngredients(req, res) {
  const type = req.query.type;

  try {
    if (type) {
      const result = await pool.query(
        'SELECT * FROM ingredients WHERE type = $1 ORDER BY id',
        [type]
      );
      return res.json(result.rows);
    }

    const result = await pool.query('SELECT * FROM ingredients ORDER BY id');
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch ingredients' });
  }
}
