/**
 * Cria (ou promove) um usuário ADMIN.
 *
 * Uso:
 *   node scripts/criar-admin.js "Nome do Admin" admin@exemplo.com senhaSegura123
 */
require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const [, , nome, email, senha] = process.argv;

  if (!nome || !email || !senha) {
    console.error('Uso: node scripts/criar-admin.js "Nome do Admin" admin@exemplo.com senhaSegura123');
    process.exit(1);
  }

  const senha_hash = await bcrypt.hash(senha, 10);

  const usuario = await prisma.usuarios.upsert({
    where: { email },
    update: { role: 'ADMIN', verificado: true, senha_hash },
    create: {
      nome,
      email,
      senha_hash,
      role: 'ADMIN',
      verificado: true,
    },
  });

  console.log(`Usuário ADMIN pronto: ${usuario.email} (id ${usuario.id})`);
  await prisma.$disconnect();
}

main().catch(async (erro) => {
  console.error(erro);
  await prisma.$disconnect();
  process.exit(1);
});
