// reset_db.js
require('dotenv').config();
const knex = require('knex')(require('./knexfile'));

;(async () => {
  // Lista de tabelas a remover
  const toDrop = ['alembic_version', 'cupom', 'terreiro', 'terreiros'];

  for (const name of toDrop) {
    if (await knex.schema.hasTable(name)) {
      await knex.schema.dropTable(name);
      console.log(`🗑  Drop table "${name}"`);
    }
  }

  // Agora recria a tabela "terreiros"
  await knex.schema.createTable('terreiros', table => {
    table.increments('id').primary();
    table.string('nome_responsavel').notNullable();
    table.string('nome_terreiro').notNullable();
    table.string('documento').notNullable();
    table.text('endereco').notNullable();
    table.string('email').notNullable();
    table.string('telefone').notNullable();
    table.string('cupom').notNullable();
    table.timestamp('criado_em').defaultTo(knex.fn.now());
  });
  console.log('✅ Table "terreiros" criada com sucesso');

  process.exit(0);
})();
