import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Não autenticado -> manda para o login, guardando para onde voltar depois.
  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = token.role as 'ADMIN' | 'USER' | undefined;
  const produtorId = (token.produtorId as number | null | undefined) ?? null;

  // Autenticado, mas sem produtor vinculado (ex.: cadastro público ou login
  // Google novo que o admin ainda não linkou) -> tela explicando a situação,
  // em vez de mandar de volta pro /login (o que seria confuso, já que a
  // pessoa está de fato logada).
  const destinoPadrao = produtorId
    ? new URL(`/produtor/${produtorId}`, req.url)
    : new URL('/pendente', req.url);

  // Painel administrativo (raiz "/"): só ADMIN.
  if (pathname === '/') {
    if (role !== 'ADMIN') {
      return NextResponse.redirect(destinoPadrao);
    }
    return NextResponse.next();
  }

  // Cadastro de novo produtor: só ADMIN.
  if (pathname.startsWith('/produtor/novo')) {
    if (role !== 'ADMIN') {
      return NextResponse.redirect(destinoPadrao);
    }
    return NextResponse.next();
  }

  // Páginas de um produtor específico: ADMIN acessa qualquer um,
  // USER só acessa o próprio produtorId.
  const match = pathname.match(/^\/produtor\/(\d+)/);
  if (match) {
    const idNaRota = parseInt(match[1], 10);

    if (role === 'ADMIN') {
      return NextResponse.next();
    }

    if (role === 'USER' && produtorId === idNaRota) {
      return NextResponse.next();
    }

    return NextResponse.redirect(destinoPadrao);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/produtor/:path*'],
};
