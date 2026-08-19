/**
 * Normaliza cpf_cnpj (só dígitos), telefone (só dígitos) e email
 * (minúsculas/trim) de todos os produtores já cadastrados, e avisa
 * sobre duplicatas reais que precisam ser corrigidas manualmente
 * antes de aplicar a constraint única no banco (`prisma db push`).
 *
 * Uso:
 *   node scripts/normalizar-produtores.js
 */
require('dotenv/config');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function apenasDigitos(valor) {
  return (valor || '').replace(/\D/g, '');
}

function normalizarEmail(valor) {
  return (valor || '').trim().toLowerCase();
}

async function main() {
  const produtores = await prisma.produtores.findMany({ orderBy: { id: 'asc' } });

  const porCpf = new Map();
  const porTelefone = new Map();
  const porEmail = new Map();
  const conflitos = [];

  for (const p of produtores) {
    const cpfNorm = apenasDigitos(p.cpf_cnpj);
    const telNorm = apenasDigitos(p.telefone) || null;
    const emailNorm = normalizarEmail(p.email) || null;

    if (porCpf.has(cpfNorm)) {
      const anterior = porCpf.get(cpfNorm);
      conflitos.push(`CPF/CNPJ "${cpfNorm}" duplicado entre "${anterior.nome}" (id ${anterior.id}) e "${p.nome}" (id ${p.id}).`);
    } else {
      porCpf.set(cpfNorm, { nome: p.nome, id: p.id });
    }

    if (telNorm) {
      if (porTelefone.has(telNorm)) {
        const anterior = porTelefone.get(telNorm);
        conflitos.push(`Telefone "${telNorm}" duplicado entre "${anterior.nome}" (id ${anterior.id}) e "${p.nome}" (id ${p.id}).`);
      } else {
        porTelefone.set(telNorm, { nome: p.nome, id: p.id });
      }
    }

    if (emailNorm) {
      if (porEmail.has(emailNorm)) {
        const anterior = porEmail.get(emailNorm);
        conflitos.push(`E-mail "${emailNorm}" duplicado entre "${anterior.nome}" (id ${anterior.id}) e "${p.nome}" (id ${p.id}).`);
      } else {
        porEmail.set(emailNorm, { nome: p.nome, id: p.id });
      }
    }
  }

  if (conflitos.length > 0) {
    console.log('\n⚠️  Encontrei duplicatas reais que precisam ser corrigidas ANTES de rodar "npx prisma db push":\n');
    conflitos.forEach((c) => console.log('  - ' + c));
    console.log('\nEdite um dos dois registros (pela tela de admin) para corrigir o valor duplicado, depois rode este script de novo.');
    await prisma.$disconnect();
    process.exit(1);
  }

  console.log(`Nenhuma duplicata encontrada entre os ${produtores.length} produtores. Normalizando valores...`);

  for (const p of produtores) {
    const cpfNorm = apenasDigitos(p.cpf_cnpj);
    const telNorm = apenasDigitos(p.telefone) || null;
    const emailNorm = normalizarEmail(p.email) || null;

    if (cpfNorm !== p.cpf_cnpj || telNorm !== p.telefone || emailNorm !== p.email) {
      await prisma.produtores.update({
        where: { id: p.id },
        data: { cpf_cnpj: cpfNorm, telefone: telNorm, email: emailNorm },
      });
      console.log(`  atualizado: ${p.nome} (id ${p.id})`);
    }
  }

  console.log('\nPronto! Agora rode "npx prisma db push" para aplicar as constraints únicas.');
  await prisma.$disconnect();
}

main().catch(async (erro) => {
  console.error(erro);
  await prisma.$disconnect();
  process.exit(1);
});
