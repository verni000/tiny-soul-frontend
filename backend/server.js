
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';
console.log(`🟢 Running in ${isProduction ? 'production' : 'development'} mode`);

const bcrypt = require('bcrypt');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(bodyParser.json());

const pool = new Pool(
  isProduction
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false,
        },
      }
    : {
        host: 'localhost',
        port: 5432,
        user: 'verr',
        password: 'G6h4trichk',
        database: 'gamedb',
      }
);
pool
  .query('SELECT NOW()')
  .then(r => console.log('✅ Postgres connected at', r.rows[0].now))
  .catch(e => console.error('❌ DB connection error:', e));

app.get('/', (req, res) => res.send('Server is running!'));

// ✅ 1. ENDPOINT REGISTER USER
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Enkripsi password
      await pool.query(
       'INSERT INTO players (username, password) VALUES ($1, $2)',
       [username, hashedPassword]
      );
    res.send('✅ Akun berhasil dibuat!');
  } catch (err) {
    console.error('❌ Register error:', err);
    res.status(500).send('Gagal mendaftar');
  }
});

// ✅ 2. ENDPOINT LOGIN USER
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM players WHERE username = $1', [username]);
    if (result.rows.length === 0) return res.status(401).send('Username tidak ditemukan');

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      res.send('✅ Login berhasil!');
    } else {
      res.status(401).send('❌ Password salah!');
    }
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).send('Terjadi kesalahan saat login');
  }
});

app.listen(4000, () => console.log('Server jalan di port 4000'));