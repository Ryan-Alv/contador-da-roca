import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Informe o seu e-mail.' }, { status: 400 });
    }

    const usuario = await prisma.usuarios.findUnique({ where: { email } });
    
    // Por segurança, mesmo se o e-mail não existir, respondemos com sucesso 
    // para evitar que pessoas descubran quais e-mails estão cadastrados no sistema.
    if (!usuario) {
      return NextResponse.json({ message: 'Se o e-mail existir, as instruções foram enviadas.' }, { status: 200 });
    }

    // Gerar token seguro e tempo de expiração (ex: 1 hora)
    const token_redefinicao = crypto.randomBytes(32).toString('hex');
    const expiracao_redefinicao = new Date(Date.now() + 3600000); // 1 hora no futuro

    await prisma.usuarios.update({
      where: { email },
      data: {
        token_redefinicao,
        expiracao_redefinicao,
      },
    });

    const linkRedefinicao = `${process.env.NEXT_PUBLIC_APP_URL}/redefinir-senha?token=${token_redefinicao}`;

    await resend.emails.send({
      from: 'Contador da Roça <onboarding@resend.dev>',
      to: email,
      subject: 'Redefinição de senha - Contador da Roça',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
          <h2 style="color: #1e5631;">Redefinição de Senha</h2>
          <p>Você solicitou a alteração de senha da sua conta no <strong>Contador da Roça</strong>.</p>
          <p>Clique no botão abaixo para escolher uma nova senha. Este link é válido por 1 hora:</p>
          <a href="${linkRedefinicao}" style="background-color: #1e5631; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; margin-top: 15px;">Redefinir minha senha</a>
          <p style="margin-top: 25px; font-size: 12px; color: #666;">Se você não solicitou isso, ignore este e-mail.</p>
        </div>
      `,
    });

    return NextResponse.json({ message: 'E-mail de recuperação enviado com sucesso!' }, { status: 200 });
  } catch (error) {
    console.error('Erro no esqueci-senha:', error);
    return NextResponse.json({ error: 'Erro interno ao processar a solicitação.' }, { status: 500 });
  }
}