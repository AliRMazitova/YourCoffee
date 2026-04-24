import pool from '../config/db.js';

function buildRecommendationSelect() {
  return `
    SELECT
      d.*,
      c.name AS category_name,
      COALESCE(MIN(dv.price), 0) AS min_price,
      COALESCE(MAX(dv.price), 0) AS max_price,
      COALESCE(
        ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL),
        '{}'
      ) AS tags
    FROM drinks d
    LEFT JOIN categories c ON c.id = d.category_id
    LEFT JOIN drink_volumes dv ON dv.drink_id = d.id
    LEFT JOIN drink_tags dt ON dt.drink_id = d.id
    LEFT JOIN tags t ON t.id = dt.tag_id
  `;
}

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
        `
          ${buildRecommendationSelect()}
          GROUP BY d.id, c.name
          ORDER BY d.id DESC
          LIMIT 10
        `
      );
      return res.json({
        preferred_tags: [],
        recommendations: fallback.rows,
      });
    }

    const result = await pool.query(
      `
       SELECT
         recommendation_rows.*,
         COUNT(DISTINCT matched_tags.tag_id)::int AS tag_match_count
       FROM (
         ${buildRecommendationSelect()}
         GROUP BY d.id, c.name
       ) AS recommendation_rows
       JOIN drink_tags matched_tags ON matched_tags.drink_id = recommendation_rows.id
       WHERE matched_tags.tag_id = ANY($1::int[])
       GROUP BY
         recommendation_rows.id,
         recommendation_rows.name,
         recommendation_rows.description,
         recommendation_rows.image_url,
         recommendation_rows.is_hot,
         recommendation_rows.is_seasonal,
         recommendation_rows.category_id,
         recommendation_rows.category_name,
         recommendation_rows.min_price,
         recommendation_rows.max_price,
         recommendation_rows.tags
       ORDER BY tag_match_count DESC, recommendation_rows.id DESC
       LIMIT 10
      `,
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
