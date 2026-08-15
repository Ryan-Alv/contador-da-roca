import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

const customPrismaAdapter = {
  ...PrismaAdapter(prisma),
  async createUser(data: any) {
    return prisma.usuarios.create({
      data: {
        nome: data.name || "Usuário Google",
        email: data.email,
        senha_hash: "",
        verificado: true,
      },
    });
  },
  async getUser(id: string) {
    const user = await prisma.usuarios.findUnique({ where: { id: parseInt(id) } });
    if (!user) return null;
    return { id: user.id.toString(), name: user.nome, email: user.email, emailVerified: null };
  },
  async getUserByEmail(email: string) {
    const user = await prisma.usuarios.findUnique({ where: { email } });
    if (!user) return null;
    return { id: user.id.toString(), name: user.nome, email: user.email, emailVerified: null };
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
        userId: parseInt(data.userId), // <-- Convertido para Int aqui
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
    const user = await prisma.usuarios.update({
      where: { id: parseInt(data.id) },
      data: { nome: data.name, email: data.email },
    });
    return { id: user.id.toString(), name: user.nome, email: user.email, emailVerified: null };
  },
};

const handler = NextAuth({
  adapter: customPrismaAdapter as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as any).id = token.sub;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };