// test-conn.js
require('dotenv').config();
const { Client } = require('pg');

(async () => {
  const client = new Client({
    host:     process.env.DB_HOST,
    port:     Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user:     process.env.DB_USER,
    password: process.env.DB_PASS,
    ssl:      { rejectUnauthorized: false }  // importante pro RDS
  });
  try {
    await client.connect();
    console.log('✅ Conectado com sucesso ao RDS!');
  } catch (err) {
    console.error('❌ Erro de conexão:', err.message);
  } finally {
    await client.end();
  }
})();
