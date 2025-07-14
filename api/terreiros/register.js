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
    telefone
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
    // 1) Verifica se já existe esse documento
    const { rows } = await client.query(
      'SELECT id, cupom FROM terreiros WHERE documento = $1',
      [documento]
    );
    if (rows.length > 0) {
      // Retorna o cupom existente
      return res.status(200).json({
        id: rows[0].id,
        cupom: rows[0].cupom,
        message: 'Documento já cadastrado, retornando cupom existente'
      });
    }

    // 2) Se não existe, gera novo cupom e insere
    const cupom = randomBytes(3).toString('hex').toUpperCase();
    const result = await client.query(
      `INSERT INTO terreiros 
         (nome_responsavel, nome_terreiro, documento, endereco, email, telefone, cupom) 
       VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id, cupom`,
      [nome_responsavel, nome_terreiro, documento, endereco, email, telefone, cupom]
    );

    return res.status(200).json({
      id: result.rows[0].id,
      cupom: result.rows[0].cupom
    });

  } catch (err) {
    console.error('Erro ao cadastrar terreiro:', err);
    return res.status(500).json({ error: 'Erro interno.' });
  } finally {
    await client.end();
  }
}
