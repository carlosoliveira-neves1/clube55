// api/terreiros/register.js
import { Client } from 'pg';
import dotenv from 'dotenv';
import { randomBytes } from 'crypto';

dotenv.config();

export default async function handler(req, res) {
  console.log('📥 Nova requisição em /api/terreiros/register');
  console.log('Método:', req.method);
  console.log('ENV DB_HOST:', process.env.DB_HOST);
  console.log('ENV DB_NAME:', process.env.DB_NAME);
  // etc.

  if (req.method !== 'POST') {
    console.error('❌ Método não permitido');
    return res.status(405).end('Method Not Allowed');
  }

  const { nome_responsavel, nome_terreiro, documento, endereco, email, telefone } = req.body;
  const cupom = randomBytes(3).toString('hex').toUpperCase();

  const client = new Client({
    host:     process.env.DB_HOST,
    port:     +process.env.DB_PORT,
    database: process.env.DB_NAME,
    user:     process.env.DB_USER,
    password: process.env.DB_PASS,
    ssl:      { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Conectou ao banco em produção');

    const result = await client.query(
      `INSERT INTO terreiros 
         (nome_responsavel,nome_terreiro,documento,endereco,email,telefone,cupom) 
       VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [nome_responsavel, nome_terreiro, documento, endereco, email, telefone, cupom]
    );
    console.log('✅ Registro inserido com id', result.rows[0].id);
    res.status(200).json({ id: result.rows[0].id, cupom });
  } catch (err) {
    console.error('❌ Erro no handler:', err.stack || err.message);
    res.status(500).json({ error: 'Erro interno. Veja logs.' });
  } finally {
    await client.end();
  }
}
