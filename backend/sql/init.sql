BEGIN;

DROP VIEW IF EXISTS drink_volume_nutrition;

DROP TABLE IF EXISTS drink_moods CASCADE;
DROP TABLE IF EXISTS moods CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS drink_milk_options CASCADE;
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
    carbs NUMERIC(6,2) DEFAULT 0,
    allergens TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]
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

CREATE TABLE drink_milk_options (
    drink_id INT REFERENCES drinks(id) ON DELETE CASCADE,
    ingredient_id INT REFERENCES ingredients(id) ON DELETE CASCADE,
    extra_price NUMERIC(6,2) NOT NULL DEFAULT 0,
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

INSERT INTO categories (name) VALUES
('Классика'), ('Кофе-миксы'), ('Холодный кофе'), ('Чай'), ('Холодный чай'), ('Молочные напитки');

INSERT INTO volumes (name, ml) VALUES
('espresso', 40), ('small', 200), ('standart', 300), ('grand', 400);

INSERT INTO tags (name) VALUES
('кофе'), ('чай'), ('молочный'), ('холодный'), ('горячий'), ('сладкий'),
('цитрус'), ('фруктовый'), ('сливочный'), ('матча'), ('тоник'),
('раф'), ('авторский'), ('сезонный');

INSERT INTO ingredients (name, price, type, is_optional, calories, protein, fat, carbs, allergens) VALUES
('Эспрессо', 25.00, 'coffee', FALSE, 9.00, 0.50, 0.20, 1.70, ARRAY[]::TEXT[]),
('Вода', 0.00, 'base', FALSE, 0.00, 0.00, 0.00, 0.00, ARRAY[]::TEXT[]),
('Молоко', 18.00, 'milk', FALSE, 60.00, 3.00, 3.20, 4.70, ARRAY['молоко', 'лактоза']),
('Сливки', 28.00, 'cream', FALSE, 118.00, 3.00, 10.00, 4.00, ARRAY['молоко', 'лактоза']),
('Ванильный сахар', 5.00, 'sweetener', FALSE, 399.00, 0.00, 0.00, 99.80, ARRAY[]::TEXT[]),
('Тоник', 20.00, 'mixer', FALSE, 34.00, 0.00, 0.00, 8.60, ARRAY[]::TEXT[]),
('Апельсиновый сок', 32.00, 'juice', FALSE, 45.00, 0.70, 0.20, 10.40, ARRAY[]::TEXT[]),
('Матча', 45.00, 'tea', FALSE, 324.00, 30.00, 5.00, 39.00, ARRAY[]::TEXT[]),
('Какао-порошок', 22.00, 'cocoa', FALSE, 228.00, 20.00, 14.00, 10.00, ARRAY[]::TEXT[]),
('Чайная смесь chai', 26.00, 'tea', FALSE, 330.00, 5.00, 6.00, 65.00, ARRAY[]::TEXT[]),
('Чёрный чай', 8.00, 'tea', FALSE, 1.00, 0.10, 0.00, 0.20, ARRAY[]::TEXT[]),
('Гречишный чай', 10.00, 'tea', FALSE, 0.00, 0.00, 0.00, 0.00, ARRAY[]::TEXT[]),
('Сироп топинамбура', 18.00, 'syrup', FALSE, 260.00, 0.00, 0.00, 65.00, ARRAY[]::TEXT[]),
('Пюре малины', 24.00, 'puree', FALSE, 90.00, 0.60, 0.30, 21.00, ARRAY[]::TEXT[]),
('Лайм', 10.00, 'fruit', FALSE, 25.00, 0.40, 0.10, 8.00, ARRAY[]::TEXT[]),
('Мята', 6.00, 'herb', FALSE, 49.00, 3.70, 0.90, 8.00, ARRAY[]::TEXT[]),
('Розмарин', 6.00, 'herb', FALSE, 131.00, 3.30, 5.90, 20.70, ARRAY[]::TEXT[]),
('Сироп лаванда', 18.00, 'syrup', FALSE, 280.00, 0.00, 0.00, 70.00, ARRAY[]::TEXT[]),
('Сироп солёная карамель', 18.00, 'syrup', FALSE, 300.00, 0.00, 0.00, 75.00, ARRAY[]::TEXT[]),
('Сироп кокос', 18.00, 'syrup', FALSE, 300.00, 0.00, 0.00, 75.00, ARRAY['кокос']),
('Сироп имбирь', 18.00, 'syrup', FALSE, 300.00, 0.00, 0.00, 75.00, ARRAY[]::TEXT[]),
('Сироп карамель', 18.00, 'syrup', FALSE, 300.00, 0.00, 0.00, 75.00, ARRAY[]::TEXT[]),
('Кокосовое молоко', 24.00, 'alt_milk', TRUE, 20.00, 0.20, 1.80, 2.70, ARRAY['кокос']),
('Овсяное молоко', 26.00, 'alt_milk', TRUE, 47.00, 1.00, 1.50, 6.70, ARRAY['овёс', 'глютен']),
('Доп. сироп карамель', 40.00, 'addon_syrup', TRUE, 300.00, 0.00, 0.00, 75.00, ARRAY[]::TEXT[]),
('Доп. сироп шоколад', 40.00, 'addon_syrup', TRUE, 320.00, 0.00, 0.00, 78.00, ARRAY[]::TEXT[]),
('Доп. сироп кокос', 40.00, 'addon_syrup', TRUE, 300.00, 0.00, 0.00, 75.00, ARRAY['кокос']);

INSERT INTO drinks (name, description, image_url, is_hot, is_seasonal, category_id) VALUES
('Эспрессо', 'Классический концентрированный чёрный кофе.', '/uploads/drinks/espresso.png', TRUE, FALSE, (SELECT id FROM categories WHERE name='Классика')),
('Американо', 'Чёрный кофе на основе эспрессо с добавлением горячей воды.', '/uploads/drinks/americano.png', TRUE, FALSE, (SELECT id FROM categories WHERE name='Классика')),
('Капучино', 'Кофейно-молочный напиток с плотной текстурой молока.', '/uploads/drinks/cappuchino.png', TRUE, FALSE, (SELECT id FROM categories WHERE name='Классика')),
('Латте', 'Мягкий молочно-кофейный напиток с большей порцией молока.', '/uploads/drinks/latte.png', TRUE, FALSE, (SELECT id FROM categories WHERE name='Классика')),
('Флэт уайт', 'Насыщенный молочно-кофейный напиток с ярким вкусом эспрессо.', '/uploads/drinks/flatwhite.png', TRUE, FALSE, (SELECT id FROM categories WHERE name='Классика')),
('Раф классический', 'Сливочный кофейный напиток на основе эспрессо и сливок.', '/uploads/drinks/raf.png', TRUE, FALSE, (SELECT id FROM categories WHERE name='Кофе-миксы')),
('Лавандовый раф', 'Сливочный раф с ароматом лаванды.', '/uploads/drinks/raf_lavanda.png', TRUE, FALSE, (SELECT id FROM categories WHERE name='Кофе-миксы')),
('Малиновый латте', 'Латте с малиновой нотой и сладким профилем.', '/uploads/drinks/rasberry_latte.png', TRUE, TRUE, (SELECT id FROM categories WHERE name='Кофе-миксы')),
('Джинджер', 'Авторский кофе с апельсином, карамелью и имбирной нотой.', '/uploads/drinks/ginjer.png', TRUE, TRUE, (SELECT id FROM categories WHERE name='Кофе-миксы')),
('Айс-латте', 'Лёд, молоко и эспрессо.', '/uploads/drinks/ice_latte.png', FALSE, FALSE, (SELECT id FROM categories WHERE name='Холодный кофе')),
('Эспрессо-тоник', 'Освежающий холодный кофе на основе эспрессо и тоника.', '/uploads/drinks/espresso_tonic.png', FALSE, FALSE, (SELECT id FROM categories WHERE name='Холодный кофе')),
('Мэверик бамбл', 'Кофейный напиток с апельсиновым соком и карамелью.', '/uploads/drinks/meveric_bamble.png', FALSE, TRUE, (SELECT id FROM categories WHERE name='Холодный кофе')),
('Матча латте', 'Напиток на основе матча, воды и молока.', '/uploads/drinks/matcha_latte.png', TRUE, FALSE, (SELECT id FROM categories WHERE name='Молочные напитки')),
('Какао', 'Насыщенный молочный какао-напиток.', '/uploads/drinks/cacao.png', TRUE, FALSE, (SELECT id FROM categories WHERE name='Молочные напитки')),
('Розмари Голд', 'Гречишный чай, лайм, розмарин и сироп топинамбура.', '/uploads/drinks/rosmary_gold.png', TRUE, TRUE, (SELECT id FROM categories WHERE name='Чай')),
('Пряный чай латте', 'Согревающий чайный напиток с молочной основой и пряным профилем.', '/uploads/drinks/prany_tea_latte.png', TRUE, FALSE, (SELECT id FROM categories WHERE name='Чай'));

INSERT INTO drink_volumes (drink_id, volume_id, price) VALUES
((SELECT id FROM drinks WHERE name='Эспрессо'), (SELECT id FROM volumes WHERE name='espresso'), 150.00),
((SELECT id FROM drinks WHERE name='Американо'), (SELECT id FROM volumes WHERE name='small'), 170.00),
((SELECT id FROM drinks WHERE name='Американо'), (SELECT id FROM volumes WHERE name='standart'), 200.00),
((SELECT id FROM drinks WHERE name='Американо'), (SELECT id FROM volumes WHERE name='grand'), 240.00),
((SELECT id FROM drinks WHERE name='Капучино'), (SELECT id FROM volumes WHERE name='small'), 200.00),
((SELECT id FROM drinks WHERE name='Капучино'), (SELECT id FROM volumes WHERE name='standart'), 260.00),
((SELECT id FROM drinks WHERE name='Капучино'), (SELECT id FROM volumes WHERE name='grand'), 300.00),
((SELECT id FROM drinks WHERE name='Латте'), (SELECT id FROM volumes WHERE name='standart'), 260.00),
((SELECT id FROM drinks WHERE name='Латте'), (SELECT id FROM volumes WHERE name='grand'), 300.00),
((SELECT id FROM drinks WHERE name='Флэт уайт'), (SELECT id FROM volumes WHERE name='small'), 210.00),
((SELECT id FROM drinks WHERE name='Раф классический'), (SELECT id FROM volumes WHERE name='standart'), 310.00),
((SELECT id FROM drinks WHERE name='Раф классический'), (SELECT id FROM volumes WHERE name='grand'), 330.00),
((SELECT id FROM drinks WHERE name='Лавандовый раф'), (SELECT id FROM volumes WHERE name='standart'), 350.00),
((SELECT id FROM drinks WHERE name='Лавандовый раф'), (SELECT id FROM volumes WHERE name='grand'), 370.00),
((SELECT id FROM drinks WHERE name='Малиновый латте'), (SELECT id FROM volumes WHERE name='standart'), 310.00),
((SELECT id FROM drinks WHERE name='Малиновый латте'), (SELECT id FROM volumes WHERE name='grand'), 360.00),
((SELECT id FROM drinks WHERE name='Джинджер'), (SELECT id FROM volumes WHERE name='standart'), 350.00),
((SELECT id FROM drinks WHERE name='Джинджер'), (SELECT id FROM volumes WHERE name='grand'), 380.00),
((SELECT id FROM drinks WHERE name='Айс-латте'), (SELECT id FROM volumes WHERE name='standart'), 260.00),
((SELECT id FROM drinks WHERE name='Айс-латте'), (SELECT id FROM volumes WHERE name='grand'), 300.00),
((SELECT id FROM drinks WHERE name='Эспрессо-тоник'), (SELECT id FROM volumes WHERE name='standart'), 300.00),
((SELECT id FROM drinks WHERE name='Эспрессо-тоник'), (SELECT id FROM volumes WHERE name='grand'), 330.00),
((SELECT id FROM drinks WHERE name='Мэверик бамбл'), (SELECT id FROM volumes WHERE name='standart'), 350.00),
((SELECT id FROM drinks WHERE name='Мэверик бамбл'), (SELECT id FROM volumes WHERE name='grand'), 380.00),
((SELECT id FROM drinks WHERE name='Матча латте'), (SELECT id FROM volumes WHERE name='small'), 245.00),
((SELECT id FROM drinks WHERE name='Матча латте'), (SELECT id FROM volumes WHERE name='standart'), 280.00),
((SELECT id FROM drinks WHERE name='Матча латте'), (SELECT id FROM volumes WHERE name='grand'), 320.00),
((SELECT id FROM drinks WHERE name='Какао'), (SELECT id FROM volumes WHERE name='small'), 240.00),
((SELECT id FROM drinks WHERE name='Какао'), (SELECT id FROM volumes WHERE name='standart'), 290.00),
((SELECT id FROM drinks WHERE name='Какао'), (SELECT id FROM volumes WHERE name='grand'), 360.00),
((SELECT id FROM drinks WHERE name='Розмари Голд'), (SELECT id FROM volumes WHERE name='standart'), 325.00),
((SELECT id FROM drinks WHERE name='Пряный чай латте'), (SELECT id FROM volumes WHERE name='standart'), 325.00);

INSERT INTO drink_volume_ingredients (drink_volume_id, ingredient_id, amount_g) VALUES
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Эспрессо' AND v.name='espresso'), (SELECT id FROM ingredients WHERE name='Эспрессо'), 40),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Американо' AND v.name='small'), (SELECT id FROM ingredients WHERE name='Эспрессо'), 40),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Американо' AND v.name='small'), (SELECT id FROM ingredients WHERE name='Вода'), 160),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Американо' AND v.name='standart'), (SELECT id FROM ingredients WHERE name='Эспрессо'), 40),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Американо' AND v.name='standart'), (SELECT id FROM ingredients WHERE name='Вода'), 260),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Американо' AND v.name='grand'), (SELECT id FROM ingredients WHERE name='Эспрессо'), 40),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Американо' AND v.name='grand'), (SELECT id FROM ingredients WHERE name='Вода'), 360),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Капучино' AND v.name='small'), (SELECT id FROM ingredients WHERE name='Эспрессо'), 30),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Капучино' AND v.name='small'), (SELECT id FROM ingredients WHERE name='Молоко'), 170),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Капучино' AND v.name='standart'), (SELECT id FROM ingredients WHERE name='Эспрессо'), 40),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Капучино' AND v.name='standart'), (SELECT id FROM ingredients WHERE name='Молоко'), 250),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Капучино' AND v.name='grand'), (SELECT id FROM ingredients WHERE name='Эспрессо'), 40),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Капучино' AND v.name='grand'), (SELECT id FROM ingredients WHERE name='Молоко'), 350),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Латте' AND v.name='standart'), (SELECT id FROM ingredients WHERE name='Эспрессо'), 30),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Латте' AND v.name='standart'), (SELECT id FROM ingredients WHERE name='Молоко'), 270),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Латте' AND v.name='grand'), (SELECT id FROM ingredients WHERE name='Эспрессо'), 40),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Латте' AND v.name='grand'), (SELECT id FROM ingredients WHERE name='Молоко'), 360),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Флэт уайт' AND v.name='small'), (SELECT id FROM ingredients WHERE name='Эспрессо'), 40),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Флэт уайт' AND v.name='small'), (SELECT id FROM ingredients WHERE name='Молоко'), 160),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Раф классический' AND v.name='standart'), (SELECT id FROM ingredients WHERE name='Эспрессо'), 40),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Раф классический' AND v.name='standart'), (SELECT id FROM ingredients WHERE name='Сливки'), 180),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Раф классический' AND v.name='standart'), (SELECT id FROM ingredients WHERE name='Молоко'), 60),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Раф классический' AND v.name='standart'), (SELECT id FROM ingredients WHERE name='Ванильный сахар'), 20),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Раф классический' AND v.name='grand'), (SELECT id FROM ingredients WHERE name='Эспрессо'), 40),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Раф классический' AND v.name='grand'), (SELECT id FROM ingredients WHERE name='Сливки'), 240),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Раф классический' AND v.name='grand'), (SELECT id FROM ingredients WHERE name='Молоко'), 90),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Раф классический' AND v.name='grand'), (SELECT id FROM ingredients WHERE name='Ванильный сахар'), 30),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Лавандовый раф' AND v.name='standart'), (SELECT id FROM ingredients WHERE name='Эспрессо'), 40),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Лавандовый раф' AND v.name='standart'), (SELECT id FROM ingredients WHERE name='Сливки'), 160),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Лавандовый раф' AND v.name='standart'), (SELECT id FROM ingredients WHERE name='Молоко'), 80),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Лавандовый раф' AND v.name='standart'), (SELECT id FROM ingredients WHERE name='Сироп лаванда'), 20),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Лавандовый раф' AND v.name='grand'), (SELECT id FROM ingredients WHERE name='Эспрессо'), 40),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Лавандовый раф' AND v.name='grand'), (SELECT id FROM ingredients WHERE name='Сливки'), 220),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Лавандовый раф' AND v.name='grand'), (SELECT id FROM ingredients WHERE name='Молоко'), 110),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Лавандовый раф' AND v.name='grand'), (SELECT id FROM ingredients WHERE name='Сироп лаванда'), 30),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Малиновый латте' AND v.name='standart'), (SELECT id FROM ingredients WHERE name='Эспрессо'), 30),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Малиновый латте' AND v.name='standart'), (SELECT id FROM ingredients WHERE name='Молоко'), 240),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Малиновый латте' AND v.name='standart'), (SELECT id FROM ingredients WHERE name='Пюре малины'), 30),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Малиновый латте' AND v.name='grand'), (SELECT id FROM ingredients WHERE name='Эспрессо'), 40),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Малиновый латте' AND v.name='grand'), (SELECT id FROM ingredients WHERE name='Молоко'), 320),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Малиновый латте' AND v.name='grand'), (SELECT id FROM ingredients WHERE name='Пюре малины'), 40),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Джинджер' AND v.name='standart'), (SELECT id FROM ingredients WHERE name='Эспрессо'), 40),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Джинджер' AND v.name='standart'), (SELECT id FROM ingredients WHERE name='Апельсиновый сок'), 170),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Джинджер' AND v.name='standart'), (SELECT id FROM ingredients WHERE name='Сироп имбирь'), 20),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Джинджер' AND v.name='standart'), (SELECT id FROM ingredients WHERE name='Сироп карамель'), 15),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Джинджер' AND v.name='standart'), (SELECT id FROM ingredients WHERE name='Вода'), 55),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Джинджер' AND v.name='grand'), (SELECT id FROM ingredients WHERE name='Эспрессо'), 40),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Джинджер' AND v.name='grand'), (SELECT id FROM ingredients WHERE name='Апельсиновый сок'), 240),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Джинджер' AND v.name='grand'), (SELECT id FROM ingredients WHERE name='Сироп имбирь'), 25),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Джинджер' AND v.name='grand'), (SELECT id FROM ingredients WHERE name='Сироп карамель'), 20),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Джинджер' AND v.name='grand'), (SELECT id FROM ingredients WHERE name='Вода'), 75),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Айс-латте' AND v.name='standart'), (SELECT id FROM ingredients WHERE name='Эспрессо'), 40),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Айс-латте' AND v.name='standart'), (SELECT id FROM ingredients WHERE name='Молоко'), 240),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Айс-латте' AND v.name='standart'), (SELECT id FROM ingredients WHERE name='Сироп карамель'), 20),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Айс-латте' AND v.name='grand'), (SELECT id FROM ingredients WHERE name='Эспрессо'), 40),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Айс-латте' AND v.name='grand'), (SELECT id FROM ingredients WHERE name='Молоко'), 330),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Айс-латте' AND v.name='grand'), (SELECT id FROM ingredients WHERE name='Сироп карамель'), 30),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Эспрессо-тоник' AND v.name='standart'), (SELECT id FROM ingredients WHERE name='Эспрессо'), 40),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Эспрессо-тоник' AND v.name='standart'), (SELECT id FROM ingredients WHERE name='Тоник'), 260),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Эспрессо-тоник' AND v.name='grand'), (SELECT id FROM ingredients WHERE name='Эспрессо'), 40),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Эспрессо-тоник' AND v.name='grand'), (SELECT id FROM ingredients WHERE name='Тоник'), 360),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Мэверик бамбл' AND v.name='standart'), (SELECT id FROM ingredients WHERE name='Эспрессо'), 40),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Мэверик бамбл' AND v.name='standart'), (SELECT id FROM ingredients WHERE name='Апельсиновый сок'), 240),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Мэверик бамбл' AND v.name='standart'), (SELECT id FROM ingredients WHERE name='Сироп карамель'), 20),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Мэверик бамбл' AND v.name='grand'), (SELECT id FROM ingredients WHERE name='Эспрессо'), 40),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Мэверик бамбл' AND v.name='grand'), (SELECT id FROM ingredients WHERE name='Апельсиновый сок'), 330),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Мэверик бамбл' AND v.name='grand'), (SELECT id FROM ingredients WHERE name='Сироп карамель'), 30),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Матча латте' AND v.name='small'), (SELECT id FROM ingredients WHERE name='Матча'), 5),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Матча латте' AND v.name='small'), (SELECT id FROM ingredients WHERE name='Молоко'), 165),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Матча латте' AND v.name='small'), (SELECT id FROM ingredients WHERE name='Вода'), 30),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Матча латте' AND v.name='standart'), (SELECT id FROM ingredients WHERE name='Матча'), 6),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Матча латте' AND v.name='standart'), (SELECT id FROM ingredients WHERE name='Молоко'), 250),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Матча латте' AND v.name='standart'), (SELECT id FROM ingredients WHERE name='Вода'), 44),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Матча латте' AND v.name='grand'), (SELECT id FROM ingredients WHERE name='Матча'), 8),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Матча латте' AND v.name='grand'), (SELECT id FROM ingredients WHERE name='Молоко'), 330),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Матча латте' AND v.name='grand'), (SELECT id FROM ingredients WHERE name='Вода'), 62),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Какао' AND v.name='small'), (SELECT id FROM ingredients WHERE name='Какао-порошок'), 15),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Какао' AND v.name='small'), (SELECT id FROM ingredients WHERE name='Молоко'), 170),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Какао' AND v.name='small'), (SELECT id FROM ingredients WHERE name='Ванильный сахар'), 15),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Какао' AND v.name='standart'), (SELECT id FROM ingredients WHERE name='Какао-порошок'), 20),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Какао' AND v.name='standart'), (SELECT id FROM ingredients WHERE name='Молоко'), 260),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Какао' AND v.name='standart'), (SELECT id FROM ingredients WHERE name='Ванильный сахар'), 20),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Какао' AND v.name='grand'), (SELECT id FROM ingredients WHERE name='Какао-порошок'), 28),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Какао' AND v.name='grand'), (SELECT id FROM ingredients WHERE name='Молоко'), 340),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Какао' AND v.name='grand'), (SELECT id FROM ingredients WHERE name='Ванильный сахар'), 25),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Розмари Голд' AND v.name='standart'), (SELECT id FROM ingredients WHERE name='Гречишный чай'), 260),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Розмари Голд' AND v.name='standart'), (SELECT id FROM ingredients WHERE name='Лайм'), 20),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Розмари Голд' AND v.name='standart'), (SELECT id FROM ingredients WHERE name='Розмарин'), 2),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Розмари Голд' AND v.name='standart'), (SELECT id FROM ingredients WHERE name='Сироп топинамбура'), 18),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Пряный чай латте' AND v.name='standart'), (SELECT id FROM ingredients WHERE name='Чайная смесь chai'), 25),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Пряный чай латте' AND v.name='standart'), (SELECT id FROM ingredients WHERE name='Молоко'), 255),
((SELECT dv.id FROM drink_volumes dv JOIN drinks d ON d.id=dv.drink_id JOIN volumes v ON v.id=dv.volume_id WHERE d.name='Пряный чай латте' AND v.name='standart'), (SELECT id FROM ingredients WHERE name='Вода'), 20);

INSERT INTO drink_addons (drink_id, ingredient_id)
SELECT d.id, i.id
FROM drinks d
JOIN ingredients i ON i.name IN ('Доп. сироп карамель', 'Доп. сироп шоколад', 'Доп. сироп кокос')
WHERE d.name IN ('Капучино', 'Латте', 'Флэт уайт', 'Раф классический', 'Лавандовый раф', 'Малиновый латте', 'Джинджер', 'Айс-латте', 'Эспрессо-тоник', 'Мэверик бамбл', 'Матча латте', 'Какао');

INSERT INTO drink_milk_options (drink_id, ingredient_id, extra_price)
SELECT DISTINCT
    d.id,
    i.id,
    CASE
        WHEN i.name = 'Молоко' THEN 0.00
        ELSE 60.00
    END AS extra_price
FROM drinks d
JOIN drink_volumes dv ON dv.drink_id = d.id
JOIN drink_volume_ingredients dvi ON dvi.drink_volume_id = dv.id
JOIN ingredients base_milk ON base_milk.id = dvi.ingredient_id AND base_milk.name = 'Молоко'
JOIN ingredients i ON i.name IN ('Молоко', 'Кокосовое молоко', 'Овсяное молоко');

INSERT INTO drink_tags (drink_id, tag_id)
SELECT d.id, t.id FROM drinks d JOIN tags t ON t.name IN ('кофе','горячий') WHERE d.name IN ('Эспрессо','Американо');
INSERT INTO drink_tags (drink_id, tag_id)
SELECT d.id, t.id FROM drinks d JOIN tags t ON t.name IN ('кофе','молочный','горячий') WHERE d.name IN ('Капучино','Латте','Флэт уайт');
INSERT INTO drink_tags (drink_id, tag_id)
SELECT d.id, t.id FROM drinks d JOIN tags t ON t.name IN ('кофе','молочный','сливочный','раф','горячий','авторский') WHERE d.name IN ('Раф классический','Лавандовый раф');
INSERT INTO drink_tags (drink_id, tag_id)
SELECT d.id, t.id FROM drinks d JOIN tags t ON t.name IN ('кофе','молочный','фруктовый','сладкий','авторский','сезонный') WHERE d.name='Малиновый латте';
INSERT INTO drink_tags (drink_id, tag_id)
SELECT d.id, t.id FROM drinks d JOIN tags t ON t.name IN ('кофе','цитрус','сладкий','авторский','сезонный') WHERE d.name='Джинджер';
INSERT INTO drink_tags (drink_id, tag_id)
SELECT d.id, t.id FROM drinks d JOIN tags t ON t.name IN ('кофе','молочный','холодный') WHERE d.name='Айс-латте';
INSERT INTO drink_tags (drink_id, tag_id)
SELECT d.id, t.id FROM drinks d JOIN tags t ON t.name IN ('кофе','холодный','тоник','цитрус') WHERE d.name='Эспрессо-тоник';
INSERT INTO drink_tags (drink_id, tag_id)
SELECT d.id, t.id FROM drinks d JOIN tags t ON t.name IN ('кофе','холодный','цитрус','сладкий','авторский','сезонный') WHERE d.name='Мэверик бамбл';
INSERT INTO drink_tags (drink_id, tag_id)
SELECT d.id, t.id FROM drinks d JOIN tags t ON t.name IN ('чай','матча','молочный','горячий') WHERE d.name='Матча латте';
INSERT INTO drink_tags (drink_id, tag_id)
SELECT d.id, t.id FROM drinks d JOIN tags t ON t.name IN ('молочный','горячий','сладкий') WHERE d.name='Какао';
INSERT INTO drink_tags (drink_id, tag_id)
SELECT d.id, t.id FROM drinks d JOIN tags t ON t.name IN ('чай','цитрус','горячий','сезонный') WHERE d.name='Розмари Голд';
INSERT INTO drink_tags (drink_id, tag_id)
SELECT d.id, t.id FROM drinks d JOIN tags t ON t.name IN ('чай','молочный','сладкий','горячий','авторский') WHERE d.name='Пряный чай латте';

INSERT INTO moods (name) VALUES
('Взбодриться'), ('Сосредоточиться'), ('Согреться'), ('Расслабиться'), ('Побаловать себя'),
('Освежиться'), ('Что-то необычное'), ('Нежное и молочное'), ('Сладкое настроение'), ('Уютный вечер');

INSERT INTO drink_moods (drink_id, mood_id) VALUES
((SELECT id FROM drinks WHERE name='Эспрессо'), (SELECT id FROM moods WHERE name='Взбодриться')),
((SELECT id FROM drinks WHERE name='Эспрессо'), (SELECT id FROM moods WHERE name='Сосредоточиться')),
((SELECT id FROM drinks WHERE name='Американо'), (SELECT id FROM moods WHERE name='Взбодриться')),
((SELECT id FROM drinks WHERE name='Американо'), (SELECT id FROM moods WHERE name='Сосредоточиться')),
((SELECT id FROM drinks WHERE name='Капучино'), (SELECT id FROM moods WHERE name='Согреться')),
((SELECT id FROM drinks WHERE name='Капучино'), (SELECT id FROM moods WHERE name='Нежное и молочное')),
((SELECT id FROM drinks WHERE name='Капучино'), (SELECT id FROM moods WHERE name='Уютный вечер')),
((SELECT id FROM drinks WHERE name='Латте'), (SELECT id FROM moods WHERE name='Нежное и молочное')),
((SELECT id FROM drinks WHERE name='Латте'), (SELECT id FROM moods WHERE name='Расслабиться')),
((SELECT id FROM drinks WHERE name='Латте'), (SELECT id FROM moods WHERE name='Уютный вечер')),
((SELECT id FROM drinks WHERE name='Флэт уайт'), (SELECT id FROM moods WHERE name='Взбодриться')),
((SELECT id FROM drinks WHERE name='Флэт уайт'), (SELECT id FROM moods WHERE name='Сосредоточиться')),
((SELECT id FROM drinks WHERE name='Флэт уайт'), (SELECT id FROM moods WHERE name='Нежное и молочное')),
((SELECT id FROM drinks WHERE name='Раф классический'), (SELECT id FROM moods WHERE name='Побаловать себя')),
((SELECT id FROM drinks WHERE name='Раф классический'), (SELECT id FROM moods WHERE name='Согреться')),
((SELECT id FROM drinks WHERE name='Раф классический'), (SELECT id FROM moods WHERE name='Сладкое настроение')),
((SELECT id FROM drinks WHERE name='Лавандовый раф'), (SELECT id FROM moods WHERE name='Расслабиться')),
((SELECT id FROM drinks WHERE name='Лавандовый раф'), (SELECT id FROM moods WHERE name='Побаловать себя')),
((SELECT id FROM drinks WHERE name='Лавандовый раф'), (SELECT id FROM moods WHERE name='Сладкое настроение')),
((SELECT id FROM drinks WHERE name='Малиновый латте'), (SELECT id FROM moods WHERE name='Побаловать себя')),
((SELECT id FROM drinks WHERE name='Малиновый латте'), (SELECT id FROM moods WHERE name='Сладкое настроение')),
((SELECT id FROM drinks WHERE name='Малиновый латте'), (SELECT id FROM moods WHERE name='Что-то необычное')),
((SELECT id FROM drinks WHERE name='Джинджер'), (SELECT id FROM moods WHERE name='Что-то необычное')),
((SELECT id FROM drinks WHERE name='Джинджер'), (SELECT id FROM moods WHERE name='Взбодриться')),
((SELECT id FROM drinks WHERE name='Джинджер'), (SELECT id FROM moods WHERE name='Согреться')),
((SELECT id FROM drinks WHERE name='Айс-латте'), (SELECT id FROM moods WHERE name='Освежиться')),
((SELECT id FROM drinks WHERE name='Айс-латте'), (SELECT id FROM moods WHERE name='Нежное и молочное')),
((SELECT id FROM drinks WHERE name='Эспрессо-тоник'), (SELECT id FROM moods WHERE name='Освежиться')),
((SELECT id FROM drinks WHERE name='Эспрессо-тоник'), (SELECT id FROM moods WHERE name='Взбодриться')),
((SELECT id FROM drinks WHERE name='Эспрессо-тоник'), (SELECT id FROM moods WHERE name='Что-то необычное')),
((SELECT id FROM drinks WHERE name='Мэверик бамбл'), (SELECT id FROM moods WHERE name='Освежиться')),
((SELECT id FROM drinks WHERE name='Мэверик бамбл'), (SELECT id FROM moods WHERE name='Что-то необычное')),
((SELECT id FROM drinks WHERE name='Мэверик бамбл'), (SELECT id FROM moods WHERE name='Побаловать себя')),
((SELECT id FROM drinks WHERE name='Матча латте'), (SELECT id FROM moods WHERE name='Сосредоточиться')),
((SELECT id FROM drinks WHERE name='Матча латте'), (SELECT id FROM moods WHERE name='Расслабиться')),
((SELECT id FROM drinks WHERE name='Матча латте'), (SELECT id FROM moods WHERE name='Нежное и молочное')),
((SELECT id FROM drinks WHERE name='Какао'), (SELECT id FROM moods WHERE name='Согреться')),
((SELECT id FROM drinks WHERE name='Какао'), (SELECT id FROM moods WHERE name='Уютный вечер')),
((SELECT id FROM drinks WHERE name='Какао'), (SELECT id FROM moods WHERE name='Сладкое настроение')),
((SELECT id FROM drinks WHERE name='Розмари Голд'), (SELECT id FROM moods WHERE name='Расслабиться')),
((SELECT id FROM drinks WHERE name='Розмари Голд'), (SELECT id FROM moods WHERE name='Что-то необычное')),
((SELECT id FROM drinks WHERE name='Розмари Голд'), (SELECT id FROM moods WHERE name='Согреться')),
((SELECT id FROM drinks WHERE name='Пряный чай латте'), (SELECT id FROM moods WHERE name='Согреться')),
((SELECT id FROM drinks WHERE name='Пряный чай латте'), (SELECT id FROM moods WHERE name='Уютный вечер')),
((SELECT id FROM drinks WHERE name='Пряный чай латте'), (SELECT id FROM moods WHERE name='Расслабиться'));

INSERT INTO tags (name) VALUES
('освежающий'),
('согревающий'),
('уютный'),
('пряный'),
('ягодный'),
('шоколадный'),
('нежный'),
('тонизирующий'),
('классический'),
('легкий'),
('травяной'),
('спокойный')
ON CONFLICT (name) DO NOTHING;

WITH expert_pairs (drink_name, tag_name) AS (
    VALUES
    ('Эспрессо', 'классический'),
    ('Эспрессо', 'тонизирующий'),
    ('Эспрессо', 'легкий'),

    ('Американо', 'классический'),
    ('Американо', 'тонизирующий'),
    ('Американо', 'легкий'),

    ('Капучино', 'уютный'),
    ('Капучино', 'нежный'),
    ('Капучино', 'согревающий'),

    ('Латте', 'уютный'),
    ('Латте', 'нежный'),
    ('Латте', 'согревающий'),

    ('Флэт уайт', 'тонизирующий'),
    ('Флэт уайт', 'нежный'),

    ('Раф классический', 'уютный'),
    ('Раф классический', 'согревающий'),
    ('Раф классический', 'нежный'),

    ('Лавандовый раф', 'уютный'),
    ('Лавандовый раф', 'согревающий'),
    ('Лавандовый раф', 'нежный'),
    ('Лавандовый раф', 'спокойный'),

    ('Малиновый латте', 'ягодный'),
    ('Малиновый латте', 'уютный'),
    ('Малиновый латте', 'нежный'),

    ('Джинджер', 'пряный'),
    ('Джинджер', 'согревающий'),
    ('Джинджер', 'тонизирующий'),

    ('Айс-латте', 'освежающий'),
    ('Айс-латте', 'нежный'),
    ('Айс-латте', 'легкий'),

    ('Эспрессо-тоник', 'освежающий'),
    ('Эспрессо-тоник', 'тонизирующий'),
    ('Эспрессо-тоник', 'легкий'),

    ('Мэверик бамбл', 'освежающий'),
    ('Мэверик бамбл', 'легкий'),
    ('Мэверик бамбл', 'тонизирующий'),

    ('Матча латте', 'нежный'),
    ('Матча латте', 'спокойный'),

    ('Какао', 'шоколадный'),
    ('Какао', 'уютный'),
    ('Какао', 'согревающий'),
    ('Какао', 'нежный'),

    ('Розмари Голд', 'травяной'),
    ('Розмари Голд', 'спокойный'),
    ('Розмари Голд', 'уютный'),
    ('Розмари Голд', 'легкий'),

    ('Пряный чай латте', 'пряный'),
    ('Пряный чай латте', 'уютный'),
    ('Пряный чай латте', 'согревающий'),
    ('Пряный чай латте', 'нежный')
)
INSERT INTO drink_tags (drink_id, tag_id)
SELECT d.id, t.id
FROM expert_pairs ep
JOIN drinks d ON d.name = ep.drink_name
JOIN tags t ON t.name = ep.tag_name
ON CONFLICT DO NOTHING;

COMMIT;
