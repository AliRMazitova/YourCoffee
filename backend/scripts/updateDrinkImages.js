import 'dotenv/config';
import pg from 'pg';

const drinkImages = [
  ['Эспрессо', '/uploads/drinks/espresso.png'],
  ['Американо', '/uploads/drinks/americano.png'],
  ['Капучино', '/uploads/drinks/cappuchino.png'],
  ['Латте', '/uploads/drinks/latte.png'],
  ['Флэт уайт', '/uploads/drinks/flatwhite.png'],
  ['Раф классический', '/uploads/drinks/raf.png'],
  ['Лавандовый раф', '/uploads/drinks/raf_lavanda.png'],
  ['Малиновый латте', '/uploads/drinks/rasberry_latte.png'],
  ['Джинджер', '/uploads/drinks/ginjer.png'],
  ['Айс-латте', '/uploads/drinks/ice_latte.png'],
  ['Эспрессо-тоник', '/uploads/drinks/espresso_tonic.png'],
  ['Мэверик бамбл', '/uploads/drinks/meveric_bamble.png'],
  ['Матча латте', '/uploads/drinks/matcha_latte.png'],
  ['Какао', '/uploads/drinks/cacao.png'],
  ['Розмари Голд', '/uploads/drinks/rosmary_gold.png'],
  ['Пряный чай латте', '/uploads/drinks/prany_tea_latte.png'],
];

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

try {
  for (const [name, imageUrl] of drinkImages) {
    await pool.query('UPDATE drinks SET image_url = $1 WHERE name = $2', [
      imageUrl,
      name,
    ]);
  }

  const result = await pool.query(
    'SELECT id, name, image_url FROM drinks ORDER BY id',
  );
  console.table(result.rows);
} finally {
  await pool.end();
}
