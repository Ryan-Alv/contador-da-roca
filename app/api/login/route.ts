// app/api/login/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-mail e senha são obrigatórios.' },
        { status: 400 }
      );
    }

    // Buscar usuário no MySQL usando o Prisma
    const usuario = await prisma.usuarios.findUnique({
      where: { email },
    });

    if (!usuario || !usuario.senha_hash) {
      return NextResponse.json(
        { error: 'E-mail ou senha incorretos.' },
        { status: 401 }
      );
    }

    // Verificar se o usuário já confirmou o e-mail
    if (!usuario.verificado) {
      return NextResponse.json(
        { error: 'Por favor, confirme seu e-mail antes de fazer login. Verifique sua caixa de entrada.' },
        { status: 401 }
      );
    }

    // Validar a senha com bcrypt
    const senhaValida = await bcrypt.compare(password, usuario.senha_hash);

    if (!senhaValida) {
      return NextResponse.json(
        { error: 'E-mail ou senha incorretos.' },
        { status: 401 }
      );
    }

    // Gerar Token JWT de sessão (validade de 8 horas)
    const token = jwt.sign(
      { userId: usuario.id, email: usuario.email },
      process.env.JWT_SECRET || 'agrocont_segredo_jwt',
      { expiresIn: '8h' }
    );

    return NextResponse.json(
      { message: 'Login realizado com sucesso', token },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor.' },
      { status: 500 }
    );
  }
}