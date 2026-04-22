BEGIN;

DROP VIEW IF EXISTS drink_volume_nutrition;

DROP TABLE IF EXISTS drink_moods CASCADE;
DROP TABLE IF EXISTS moods CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS drink_addons CASCADE;
DROP TABLE IF EXISTS drink_volume_ingredients CASCADE;
DROP TABLE IF EXISTS drink_volumes CASCADE;
DROP TABLE IF EXISTS volumes CASCADE;
DROP TABLE IF EXISTS ingredients CASCADE;
DROP TABLE IF EXISTS drink_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS drinks CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE drinks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    is_hot BOOLEAN DEFAULT TRUE,
    is_seasonal BOOLEAN DEFAULT FALSE,
    category_id INT REFERENCES categories(id)
);

CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE drink_tags (
    drink_id INT REFERENCES drinks(id) ON DELETE CASCADE,
    tag_id INT REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (drink_id, tag_id)
);

CREATE TABLE ingredients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    price NUMERIC(6,2) DEFAULT 0,
    type VARCHAR(50),
    is_optional BOOLEAN DEFAULT TRUE,
    calories NUMERIC(6,2) DEFAULT 0,
    protein NUMERIC(6,2) DEFAULT 0,
    fat NUMERIC(6,2) DEFAULT 0,
    carbs NUMERIC(6,2) DEFAULT 0
);

CREATE TABLE volumes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(10) NOT NULL UNIQUE,
    ml INT NOT NULL
);

CREATE TABLE drink_volumes (
    id SERIAL PRIMARY KEY,
    drink_id INT REFERENCES drinks(id) ON DELETE CASCADE,
    volume_id INT REFERENCES volumes(id) ON DELETE CASCADE,
    price NUMERIC(6,2) NOT NULL,
    UNIQUE (drink_id, volume_id)
);

CREATE TABLE drink_volume_ingredients (
    drink_volume_id INT REFERENCES drink_volumes(id) ON DELETE CASCADE,
    ingredient_id INT REFERENCES ingredients(id) ON DELETE CASCADE,
    amount_g NUMERIC(6,2) NOT NULL,
    PRIMARY KEY (drink_volume_id, ingredient_id)
);

CREATE TABLE drink_addons (
    drink_id INT REFERENCES drinks(id) ON DELETE CASCADE,
    ingredient_id INT REFERENCES ingredients(id) ON DELETE CASCADE,
    PRIMARY KEY (drink_id, ingredient_id)
);

CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    drink_id INT REFERENCES drinks(id) ON DELETE CASCADE
);

CREATE TABLE user_preferences (
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    tag_id INT REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, tag_id)
);

CREATE TABLE moods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE drink_moods (
    drink_id INT REFERENCES drinks(id) ON DELETE CASCADE,
    mood_id INT REFERENCES moods(id) ON DELETE CASCADE,
    PRIMARY KEY (drink_id, mood_id)
);

CREATE VIEW drink_volume_nutrition AS
SELECT
    dv.id AS drink_volume_id,
    d.id AS drink_id,
    d.name AS drink_name,
    d.is_seasonal,
    v.name AS volume_name,
    v.ml,
    dv.price,
    ROUND(COALESCE(SUM(i.calories * dvi.amount_g / 100.0), 0), 2) AS calories,
    ROUND(COALESCE(SUM(i.protein * dvi.amount_g / 100.0), 0), 2) AS protein,
    ROUND(COALESCE(SUM(i.fat * dvi.amount_g / 100.0), 0), 2) AS fat,
    ROUND(COALESCE(SUM(i.carbs * dvi.amount_g / 100.0), 0), 2) AS carbs
FROM drink_volumes dv
JOIN drinks d ON d.id = dv.drink_id
JOIN volumes v ON v.id = dv.volume_id
LEFT JOIN drink_volume_ingredients dvi ON dvi.drink_volume_id = dv.id
LEFT JOIN ingredients i ON i.id = dvi.ingredient_id
GROUP BY dv.id, d.id, d.name, d.is_seasonal, v.name, v.ml, dv.price;

COMMIT;
