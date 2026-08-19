import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * Garante que o usuário logado pode acessar dados do produtor `produtorId`.
 * ADMIN acessa qualquer produtor; USER só acessa o próprio (session.user.produtorId).
 *
 * Retorna `null` quando autorizado, ou uma NextResponse de erro (401/403)
 * que a rota deve retornar imediatamente.
 */
export async function exigirAcessoProdutor(produtorId: number): Promise<NextResponse | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  if (session.user.role !== 'ADMIN' && session.user.produtorId !== produtorId) {
    return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
  }

  return null;
}
