import pool from '../config/db.js';

export async function getRecommendations(req, res) {
  try {
    const userId = req.user.id;

    const prefResult = await pool.query(
      `SELECT t.id, t.name
       FROM user_preferences up
       JOIN tags t ON t.id = up.tag_id
       WHERE up.user_id = $1`,
      [userId]
    );

    const preferredTagIds = prefResult.rows.map((row) => row.id);
    const preferredTagNames = prefResult.rows.map((row) => row.name);

    if (preferredTagIds.length === 0) {
      const fallback = await pool.query(
        'SELECT * FROM drinks ORDER BY id DESC LIMIT 10'
      );
      return res.json({
        preferred_tags: [],
        recommendations: fallback.rows,
      });
    }

    const result = await pool.query(
      `SELECT d.*, COUNT(*)::int AS tag_match_count
       FROM drinks d
       JOIN drink_tags dt ON dt.drink_id = d.id
       WHERE dt.tag_id = ANY($1::int[])
       GROUP BY d.id
       ORDER BY tag_match_count DESC, d.id DESC
       LIMIT 10`,
      [preferredTagIds]
    );

    return res.json({
      preferred_tags: preferredTagNames,
      recommendations: result.rows,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to get recommendations' });
  }
}

export async function getRecommendationsByMood(req, res) {
  const moodId = Number(req.params.mood_id);

  if (!Number.isFinite(moodId)) {
    return res.status(400).json({ error: 'Invalid mood_id' });
  }

  try {
    const result = await pool.query(
      `SELECT d.*
       FROM drinks d
       JOIN drink_moods dm ON dm.drink_id = d.id
       WHERE dm.mood_id = $1
       ORDER BY d.id`,
      [moodId]
    );

    return res.json({
      mood_id: moodId,
      recommendations: result.rows,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to get mood recommendations' });
  }
}

export async function getDailyDrink(req, res) {
  try {
    const dayKey = new Date().toISOString().slice(0, 10);

    const result = await pool.query(
      `SELECT *
       FROM drinks
       ORDER BY md5(id::text || $1)
       LIMIT 1`,
      [dayKey]
    );

    if (result.rows.length === 0) {
      return res.json({ date: dayKey, drink: null });
    }

    return res.json({
      date: dayKey,
      drink: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to get daily drink' });
  }
}
