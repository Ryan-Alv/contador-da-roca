import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { Resend } from 'resend';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { nome, email, password } = await request.json();

    if (!nome || !email || !password) {
      return NextResponse.json({ error: 'Preencha todos os campos.' }, { status: 400 });
    }

    const usuarioExistente = await prisma.usuarios.findUnique({ where: { email } });
    if (usuarioExistente) {
      return NextResponse.json({ error: 'Este e-mail já está cadastrado.' }, { status: 400 });
    }

    const saltRounds = 10;
    const senha_hash = await bcrypt.hash(password, saltRounds);
    
    // Gerar um token único de verificação
    const token_verificacao = crypto.randomBytes(32).toString('hex');

    // Criar o usuário como não verificado
    await prisma.usuarios.create({
      data: {
        nome,
        email,
        senha_hash,
        verificado: false,
        token_verificacao,
      },
    });

    const linkConfirmacao = `${process.env.NEXT_PUBLIC_APP_URL}/api/verificar?token=${token_verificacao}`;

    // Disparar o e-mail real via Resend
    // Nota: No plano gratuito do Resend, você pode enviar para o seu próprio e-mail cadastrado
    await resend.emails.send({
      from: 'Contador da Roça <onboarding@resend.dev>',
      to: email,
      subject: 'Confirme seu cadastro no Contador da Roça',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
          <h2 style="color: #1e5631;">Olá, ${nome}!</h2>
          <p>Obrigado por se registrar no <strong>Contador da Roça</strong>.</p>
          <p>Para ativar sua conta e começar a gerenciar suas propriedades rurais, clique no botão abaixo:</p>
          <a href="${linkConfirmacao}" style="background-color: #1e5631; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; margin-top: 15px;">Confirmar meu e-mail</a>
          <p style="margin-top: 25px; font-size: 12px; color: #666;">Se você não solicitou este cadastro, pode ignorar esta mensagem.</p>
        </div>
      `,
    });

    return NextResponse.json({ 
      message: 'Conta criada com sucesso! Verifique sua caixa de entrada para ativar o acesso.' 
    }, { status: 201 });

  } catch (error) {
    console.error('Erro no registro com e-mail:', error);
    return NextResponse.json({ error: 'Erro interno ao processar o cadastro.' }, { status: 500 });
  }
}