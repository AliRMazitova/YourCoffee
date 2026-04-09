import pool from '../config/db.js';

function resolveTagIds(body) {
  if (body == null) return null;
  if (Array.isArray(body.tags)) return body.tags;
  if (Array.isArray(body.tagIds)) return body.tagIds;
  return null;
}

export async function getPreferences(req, res) {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT t.id, t.name
       FROM user_preferences up
       JOIN tags t ON t.id = up.tag_id
       WHERE up.user_id = $1
       ORDER BY t.id`,
      [userId]
    );

    const tagIds = result.rows.map((row) => row.id);

    return res.json({
      tags: tagIds,
      tag_details: result.rows,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to get preferences' });
  }
}

export async function upsertPreferences(req, res) {
  const tagIds = resolveTagIds(req.body);

  if (!Array.isArray(tagIds)) {
    return res.status(400).json({
      error: 'Body must include tags (array of tag ids), e.g. { "tags": [1, 2, 3] }',
    });
  }

  const normalized = tagIds
    .map((x) => Number(x))
    .filter((x) => Number.isFinite(x));
  if (normalized.length !== tagIds.length) {
    return res.status(400).json({ error: 'All tags must be numeric ids' });
  }
  const uniqueTagIds = [...new Set(normalized)];

  try {
    const userId = req.user.id;
    if (uniqueTagIds.length > 0) {
      const existingTags = await pool.query(
        'SELECT id FROM tags WHERE id = ANY($1::int[])',
        [uniqueTagIds]
      );
      if (existingTags.rows.length !== uniqueTagIds.length) {
        return res.status(400).json({ error: 'Some tags do not exist' });
      }
    }

    await pool.query('DELETE FROM user_preferences WHERE user_id = $1', [userId]);

    for (const tagId of uniqueTagIds) {
      await pool.query(
        'INSERT INTO user_preferences (user_id, tag_id) VALUES ($1, $2)',
        [userId, tagId]
      );
    }

    return res.json({ message: 'Preferences updated', tags: uniqueTagIds });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update preferences' });
  }
}
