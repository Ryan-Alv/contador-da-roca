import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';

// Adapter customizado: a tabela `usuarios` usa `id` numérico (autoincrement),
// enquanto o adapter padrão do NextAuth espera strings (cuid). Mantemos a
// conversão para permitir login social (Google) junto com login por senha.
const customPrismaAdapter = {
  ...PrismaAdapter(prisma),
  async createUser(data: any) {
    const usuario = await prisma.usuarios.create({
      data: {
        nome: data.name || 'Usuário Google',
        email: data.email,
        senha_hash: '',
        verificado: true,
      },
    });
    return {
      id: usuario.id.toString(),
      name: usuario.nome,
      email: usuario.email,
      emailVerified: null,
    };
  },
  async getUser(id: string) {
    const usuario = await prisma.usuarios.findUnique({ where: { id: parseInt(id) } });
    if (!usuario) return null;
    return { id: usuario.id.toString(), name: usuario.nome, email: usuario.email, emailVerified: null };
  },
  async getUserByEmail(email: string) {
    const usuario = await prisma.usuarios.findUnique({ where: { email } });
    if (!usuario) return null;
    return { id: usuario.id.toString(), name: usuario.nome, email: usuario.email, emailVerified: null };
  },
  async getUserByAccount({ providerAccountId, provider }: { providerAccountId: string; provider: string }) {
    const account = await prisma.account.findUnique({
      where: { provider_providerAccountId: { provider, providerAccountId } },
      include: { user: true },
    });
    if (!account || !account.user) return null;
    return { id: account.user.id.toString(), name: account.user.nome, email: account.user.email, emailVerified: null };
  },
  async linkAccount(data: any) {
    return prisma.account.create({
      data: {
        userId: parseInt(data.userId),
        provider: data.provider,
        type: data.type,
        providerAccountId: data.providerAccountId,
        access_token: data.access_token,
        expires_at: data.expires_at,
        token_type: data.token_type,
        scope: data.scope,
        id_token: data.id_token,
        refresh_token: data.refresh_token,
        session_state: data.session_state,
      },
    });
  },
  async updateUser(data: any) {
    const usuario = await prisma.usuarios.update({
      where: { id: parseInt(data.id) },
      data: { nome: data.name, email: data.email },
    });
    return { id: usuario.id.toString(), name: usuario.nome, email: usuario.email, emailVerified: null };
  },
};

export const authOptions: NextAuthOptions = {
  adapter: customPrismaAdapter as any,
  providers: [
    CredentialsProvider({
      name: 'Credenciais',
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('E-mail e senha são obrigatórios.');
        }

        const usuario = await prisma.usuarios.findUnique({
          where: { email: credentials.email },
        });

        if (!usuario || !usuario.senha_hash) {
          throw new Error('E-mail ou senha incorretos.');
        }

        if (!usuario.verificado) {
          throw new Error('Confirme seu e-mail antes de fazer login.');
        }

        const senhaValida = await bcrypt.compare(credentials.password, usuario.senha_hash);
        if (!senhaValida) {
          throw new Error('E-mail ou senha incorretos.');
        }

        return {
          id: usuario.id.toString(),
          name: usuario.nome,
          email: usuario.email,
          role: usuario.role,
          produtorId: usuario.produtor_id,
        } as any;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
      }

      if (token.sub) {
        const usuario = await prisma.usuarios.findUnique({
          where: { id: parseInt(token.sub) },
        });
        if (usuario) {
          token.role = usuario.role;
          token.produtorId = usuario.produtor_id;
          token.name = usuario.nome;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = (token as any).role ?? 'USER';
        (session.user as any).produtorId = (token as any).produtorId ?? null;
      }
      return session;
    },
  },
};
