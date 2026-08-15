import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token inválido.' }, { status: 400 });
  }

  // Buscar usuário com esse token
  const usuario = await prisma.usuarios.findFirst({
    where: { token_verificacao: token },
  });

  if (!usuario) {
    return NextResponse.json({ error: 'Token expirado ou inválido.' }, { status: 400 });
  }

  // Atualizar para verificado e limpar o token
  await prisma.usuarios.update({
    where: { id: usuario.id },
    data: {
      verificado: true,
      token_verificacao: null,
    },
  });

  // Redirecionar para o login com aviso de sucesso
  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?verificado=true`);
}