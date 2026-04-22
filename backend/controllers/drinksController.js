import pool from '../config/db.js';

function buildDrinkBaseSelect() {
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

function parseIntParam(value) {
  if (value === undefined || value === null || value === '') return null;
  const n = Number.parseInt(String(value), 10);
  return Number.isFinite(n) ? n : null;
}

function parseBoolParam(value) {
  if (value === undefined || value === null || value === '') return null;
  if (value === 'true' || value === true) return true;
  if (value === 'false' || value === false) return false;
  return null;
}

function parseNumParam(value) {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function getAllDrinks(req, res) {
  const category = parseIntParam(req.query.category);
  const tag = parseIntParam(req.query.tag);
  const isHot = parseBoolParam(req.query.is_hot);
  const minPrice = parseNumParam(req.query.min_price);
  const maxPrice = parseNumParam(req.query.max_price);

  if (req.query.category !== undefined && category === null) {
    return res.status(400).json({ error: 'category must be an integer' });
  }
  if (req.query.tag !== undefined && tag === null) {
    return res.status(400).json({ error: 'tag must be an integer' });
  }
  if (req.query.is_hot !== undefined && isHot === null) {
    return res.status(400).json({ error: 'is_hot must be true or false' });
  }
  if (req.query.min_price !== undefined && minPrice === null) {
    return res.status(400).json({ error: 'min_price must be a number' });
  }
  if (req.query.max_price !== undefined && maxPrice === null) {
    return res.status(400).json({ error: 'max_price must be a number' });
  }
  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
    return res
      .status(400)
      .json({ error: 'min_price cannot be greater than max_price' });
  }

  try {
    const conditions = ['1=1'];
    const params = [];
    let p = 1;

    if (category !== null) {
      conditions.push(`d.category_id = $${p++}`);
      params.push(category);
    }
    if (isHot !== null) {
      conditions.push(`d.is_hot = $${p++}`);
      params.push(isHot);
    }
    if (tag !== null) {
      conditions.push(
        `EXISTS (SELECT 1 FROM drink_tags dt WHERE dt.drink_id = d.id AND dt.tag_id = $${p++})`
      );
      params.push(tag);
    }
    if (minPrice !== null) {
      conditions.push(
        `EXISTS (SELECT 1 FROM drink_volumes dv_min WHERE dv_min.drink_id = d.id AND dv_min.price >= $${p++})`
      );
      params.push(minPrice);
    }
    if (maxPrice !== null) {
      conditions.push(
        `EXISTS (SELECT 1 FROM drink_volumes dv_max WHERE dv_max.drink_id = d.id AND dv_max.price <= $${p++})`
      );
      params.push(maxPrice);
    }

    const sql = `
      ${buildDrinkBaseSelect()}
      WHERE ${conditions.join(' AND ')}
      GROUP BY d.id, c.name
      ORDER BY d.id
    `;

    const result = await pool.query(sql, params);
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch drinks' });
  }
}

export async function getDrinkById(req, res) {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  try {
    const result = await pool.query(
      `
        ${buildDrinkBaseSelect()}
        WHERE d.id = $1
        GROUP BY d.id, c.name
      `,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Drink not found' });
    }
    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch drink' });
  }
}

export async function getDrinkVolumes(req, res) {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  try {
    const result = await pool.query(
      `SELECT dvn.drink_volume_id AS id,
              dvn.drink_id,
              dv.volume_id,
              dvn.price,
              dvn.volume_name,
              dvn.ml,
              dvn.calories,
              dvn.protein,
              dvn.fat,
              dvn.carbs
       FROM drink_volume_nutrition dvn
       JOIN drink_volumes dv ON dv.id = dvn.drink_volume_id
       WHERE dvn.drink_id = $1
       ORDER BY dvn.ml`,
      [id]
    );
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch volumes' });
  }
}

export async function getDrinkIngredients(req, res) {
  const id = Number(req.params.id);
  const volumeId =
    req.query.volume_id === undefined ? null : Number(req.query.volume_id);

  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  if (req.query.volume_id !== undefined && !Number.isFinite(volumeId)) {
    return res.status(400).json({ error: 'volume_id must be a number' });
  }

  try {
    const params = [id];
    let volumeFilter = '';

    if (volumeId !== null) {
      params.push(volumeId);
      volumeFilter = ' AND dv.volume_id = $2';
    }

    const result = await pool.query(
      `SELECT dv.id AS drink_volume_id,
              dv.drink_id,
              dv.volume_id,
              v.name AS volume_name,
              v.ml,
              dvi.ingredient_id,
              dvi.amount_g,
              i.name, i.price, i.type, i.is_optional
       FROM drink_volumes dv
       JOIN volumes v ON v.id = dv.volume_id
       JOIN drink_volume_ingredients dvi ON dvi.drink_volume_id = dv.id
       JOIN ingredients i ON i.id = dvi.ingredient_id
       WHERE dv.drink_id = $1${volumeFilter}
       ORDER BY v.ml, i.name`,
      params
    );
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch ingredients' });
  }
}

export async function getDrinkTags(req, res) {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  try {
    const result = await pool.query(
      `SELECT t.id, t.name
       FROM drink_tags dt
       JOIN tags t ON t.id = dt.tag_id
       WHERE dt.drink_id = $1
       ORDER BY t.id`,
      [id]
    );
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch tags' });
  }
}

export async function getDrinkMoods(req, res) {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  try {
    const result = await pool.query(
      `SELECT m.id, m.name
       FROM drink_moods dm
       JOIN moods m ON m.id = dm.mood_id
       WHERE dm.drink_id = $1
       ORDER BY m.id`,
      [id]
    );
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch moods' });
  }
}

export async function getDrinkAddons(req, res) {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  try {
    const result = await pool.query(
      `SELECT i.id, i.name, i.price, i.type, i.is_optional,
              i.calories, i.protein, i.fat, i.carbs
       FROM drink_addons da
       JOIN ingredients i ON i.id = da.ingredient_id
       WHERE da.drink_id = $1
       ORDER BY i.name`,
      [id]
    );
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch addons' });
  }
}

export async function calculateDrinkPrice(req, res) {
  const drinkId = Number(req.body.drink_id);
  const volumeId = Number(req.body.volume_id);
  const extraIngredientIds = Array.isArray(req.body.ingredients)
    ? [...new Set(req.body.ingredients.map((x) => Number(x)).filter((x) => Number.isFinite(x)))]
    : [];

  if (!Number.isFinite(drinkId) || !Number.isFinite(volumeId)) {
    return res.status(400).json({
      error: 'drink_id and volume_id are required and must be numbers',
    });
  }

  try {
    const volRow = await pool.query(
      `SELECT dv.price
       FROM drink_volumes dv
       WHERE dv.drink_id = $1 AND dv.volume_id = $2`,
      [drinkId, volumeId]
    );

    if (volRow.rows.length === 0) {
      return res.status(404).json({
        error: 'Volume not available for this drink',
      });
    }

    const basePrice = Number(volRow.rows[0].price);
    let extrasTotal = 0;
    const extrasBreakdown = [];

    if (extraIngredientIds.length > 0) {
      const ingRes = await pool.query(
        `SELECT i.id, i.name, i.price
         FROM drink_addons da
         JOIN ingredients i ON i.id = da.ingredient_id
         WHERE da.drink_id = $1
           AND i.id = ANY($2::int[])`,
        [drinkId, extraIngredientIds]
      );

      if (ingRes.rows.length !== extraIngredientIds.length) {
        return res.status(400).json({
          error: 'Some ingredient ids are invalid or unavailable for this drink',
        });
      }

      for (const row of ingRes.rows) {
        const price = Number(row.price);
        extrasTotal += price;
        extrasBreakdown.push({
          ingredient_id: row.id,
          name: row.name,
          price,
        });
      }
    }

    const total = basePrice + extrasTotal;

    return res.json({
      drink_id: drinkId,
      volume_id: volumeId,
      base_price: basePrice,
      extras: extrasBreakdown,
      extras_total: extrasTotal,
      total,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to calculate price' });
  }
}
