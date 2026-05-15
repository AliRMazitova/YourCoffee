import pool from '../config/db.js';
import { buildWeatherRecommendationPayload } from '../services/weatherExpertSystem.js';
import { getCurrentKazanWeather } from '../services/weatherService.js';

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

async function getMoodContext(moodId) {
  if (!Number.isFinite(moodId)) {
    return { mood: null, drinkIds: [] };
  }

  const moodResult = await pool.query(
    `SELECT id, name
     FROM moods
     WHERE id = $1`,
    [moodId]
  );

  if (moodResult.rows.length === 0) {
    return { mood: null, drinkIds: [] };
  }

  const drinkResult = await pool.query(
    `SELECT drink_id
     FROM drink_moods
     WHERE mood_id = $1`,
    [moodId]
  );

  return {
    mood: moodResult.rows[0],
    drinkIds: drinkResult.rows.map((row) => Number(row.drink_id)),
  };
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
      return res.json({
        preferred_tags: [],
        recommendations: [],
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
    const moodContext = await getMoodContext(moodId);

    if (!moodContext.mood) {
      return res.status(404).json({ error: 'Mood not found' });
    }

    const result = await pool.query(
      `
       ${buildRecommendationSelect()}
       WHERE EXISTS (
         SELECT 1
         FROM drink_moods dm
         WHERE dm.drink_id = d.id
           AND dm.mood_id = $1
       )
       GROUP BY d.id, c.name
       ORDER BY d.id
      `,
      [moodId]
    );

    return res.json({
      mood_id: moodId,
      mood_name: moodContext.mood.name,
      recommendations: result.rows,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to get mood recommendations' });
  }
}

export async function getWeatherRecommendations(req, res) {
  const moodId =
    req.query.mood_id === undefined ? null : Number(req.query.mood_id);
  const refresh = String(req.query.refresh || '').trim().toLowerCase() === 'true';

  if (req.query.mood_id !== undefined && !Number.isFinite(moodId)) {
    return res.status(400).json({ error: 'mood_id must be a number' });
  }

  try {
    const [weather, drinksResult, moodContext] = await Promise.all([
      getCurrentKazanWeather({ forceRefresh: refresh }),
      pool.query(
        `
          ${buildRecommendationSelect()}
          GROUP BY d.id, c.name
          ORDER BY d.id
        `
      ),
      getMoodContext(moodId)
    ]);

    if (moodId !== null && !moodContext.mood) {
      return res.status(404).json({ error: 'Mood not found' });
    }

    const payload = buildWeatherRecommendationPayload(
      weather,
      drinksResult.rows,
      {
        mood: moodContext.mood,
        moodDrinkIds: moodContext.drinkIds,
      }
    );

    return res.json({
      mode: 'weather',
      mood_id: moodContext.mood?.id ?? null,
      mood_name: moodContext.mood?.name ?? null,
      ...payload,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to get weather recommendations' });
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
