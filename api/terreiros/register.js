// api/terreiros/register.js
import { Client } from 'pg';
import dotenv from 'dotenv';
import { randomBytes } from 'crypto';

dotenv.config();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  const {
    nome_responsavel,
    nome_terreiro,
    documento,
    endereco,
    email,
    telefone,
    loja
  } = req.body;

  const client = new Client({
    host:     process.env.DB_HOST,
    port:     +process.env.DB_PORT,
    database: process.env.DB_NAME,
    user:     process.env.DB_USER,
    password: process.env.DB_PASS,
    ssl:      { rejectUnauthorized: false }
  });

  await client.connect();
  try {
    // 1) Se já existir este documento, retorna cupom e loja existentes
    const { rows } = await client.query(
      'SELECT id, cupom, loja FROM terreiros WHERE documento = $1',
      [documento]
    );
    if (rows.length > 0) {
      return res.status(200).json({
        id: rows[0].id,
        cupom: rows[0].cupom,
        loja: rows[0].loja,
        message: 'Documento já cadastrado, retornando dados existentes'
      });
    }

    // 2) Caso contrário, gera novo cupom e insere
    const cupom = randomBytes(3).toString('hex').toUpperCase();
    const result = await client.query(
      `INSERT INTO terreiros 
         (nome_responsavel, nome_terreiro, documento, endereco, email, telefone, cupom, loja) 
       VALUES($1,$2,$3,$4,$5,$6,$7,$8) 
       RETURNING id, cupom, loja`,
      [nome_responsavel, nome_terreiro, documento, endereco, email, telefone, cupom, loja]
    );

    return res.status(200).json({
      id: result.rows[0].id,
      cupom: result.rows[0].cupom,
      loja: result.rows[0].loja
    });

  } catch (err) {
    console.error('Erro ao cadastrar terreiro:', err);
    return res.status(500).json({ error: 'Erro interno.' });
  } finally {
    await client.end();
  }
}
