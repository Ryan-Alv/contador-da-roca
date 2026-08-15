import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const { token, novaSenha } = await request.json();

    if (!token || !novaSenha) {
      return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 });
    }

    // Buscar usuário pelo token e verificar se não expirou
    const usuario = await prisma.usuarios.findFirst({
      where: {
        token_redefinicao: token,
        expiracao_redefinicao: { gte: new Date() }, // Maior ou igual à data atual
      },
    });

    if (!usuario) {
      return NextResponse.json({ error: 'Token inválido ou expirado. Solicite uma nova recuperação.' }, { status: 400 });
    }

    const senha_hash = await bcrypt.hash(novaSenha, 10);

    // Atualizar senha e limpar os tokens de redefinição
    await prisma.usuarios.update({
      where: { id: usuario.id },
      data: {
        senha_hash,
        token_redefinicao: null,
        expiracao_redefinicao: null,
      },
    });

    return NextResponse.json({ message: 'Senha redefinida com sucesso!' }, { status: 200 });
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    return NextResponse.json({ error: 'Erro interno ao salvar a nova senha.' }, { status: 500 });
  }
}