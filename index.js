require('dotenv').config();
const express = require('express');
const knexConfig = require('./knexfile');
const knex = require('knex')(knexConfig);
const ExcelJS = require('exceljs');
const path = require('path');

console.log('> index.js carregado');

const app = express();

// 1) Servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// 2) Para capturar JSON no body
app.use(express.json());

/**
 * Gera cupom alfanumérico de tamanho fixo (6 dígitos)
 */
function gerarCupom(tamanho = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let cupom = '';
  for (let i = 0; i < tamanho; i++) {
    cupom += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return cupom;
}

/**
 * Rota para cadastro de terreiros
 */
app.post('/api/terreiros/register', async (req, res) => {
  try {
    const { nome_responsavel, nome_terreiro, documento, endereco, email, telefone } = req.body;
    const cupom = gerarCupom(6);
    const [id] = await knex('terreiros')
      .insert({ nome_responsavel, nome_terreiro, documento, endereco, email, telefone, cupom })
      .returning('id');
    res.json({ id, cupom });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao registrar terreiro.' });
  }
});

/**
 * Rota para exportar Excel de todos os terreiros
 */
app.get('/api/admin/export', async (req, res) => {
  try {
    const terreiros = await knex('terreiros').select('*');
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Terreiros');
    ws.columns = [
      { header: 'Nome', key: 'nome_responsavel' },
      { header: 'Terreiro', key: 'nome_terreiro' },
      { header: 'Documento', key: 'documento' },
      { header: 'E-mail', key: 'email' },
      { header: 'Telefone', key: 'telefone' },
      { header: 'Cupom', key: 'cupom' },
      { header: 'Criado em', key: 'criado_em' },
    ];
    terreiros.forEach(t => ws.addRow(t));
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=terreiros.xlsx');
    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao exportar Excel.' });
  }
});

// Finalmente, dispara o servidor e exibe no console
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
