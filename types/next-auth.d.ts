import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'ADMIN' | 'USER';
      produtorId: number | null;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role?: 'ADMIN' | 'USER';
    produtorId?: number | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: 'ADMIN' | 'USER';
    produtorId?: number | null;
  }
}
