// app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailVerificado = searchParams.get('verificado');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (!res || res.error) {
        throw new Error(res?.error || 'E-mail ou senha incorretos.');
      }

      // O middleware cuida de redirecionar ADMIN -> painel geral
      // e USER -> sua própria página de produtor.
      router.push(callbackUrl);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    signIn('google', { callbackUrl: '/' });
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-6 py-12">
      <div className="mb-6 flex flex-col items-center">
        <div className="bg-[#1e5631] text-white p-3.5 rounded-2xl shadow-md mb-3">
          <Lock size={28} />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Bem-vindo de volta</h1>
        <p className="text-sm text-gray-500 mt-1">Faça login na sua conta do Contador da Roça</p>
      </div>

      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl shadow-gray-100 border border-gray-100">
        {emailVerificado && (
          <div className="mb-6 p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm rounded-xl text-center font-medium flex items-center justify-center gap-2">
            <CheckCircle2 size={18} /> E-mail verificado com sucesso! Faça login abaixo.
          </div>
        )}

        {/* Botão de Login com Google */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full mb-6 flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.95H1.2v3.15C3.16 21.32 7.23 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.25c-.25-.72-.38-1.5-.38-2.25s.13-1.53.38-2.25V6.6H1.2C.43 8.17 0 9.94 0 12s.43 3.83 1.2 5.4l4.08-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.23 0 3.16 2.68 1.2 6.6l4.08 3.15c.95-2.84 3.6-4.95 6.72-4.95z"
            />
          </svg>
          Continuar com o Google
        </button>

        <div className="relative flex py-2 items-center mb-6">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase tracking-wider">ou</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">E-mail</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <Mail size={18} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#1e5631] transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">Senha</label>
              <Link href="/esqueci-senha" className="text-xs font-medium text-[#1e5631] hover:underline">
                Esqueceu a senha?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <Lock size={18} />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#1e5631] transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#1e5631] text-white py-3.5 rounded-xl font-semibold hover:bg-[#174426] transition shadow-lg shadow-emerald-900/10 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <>Entrar <ArrowRight size={18} /></>}
          </button>
        </form>
      </div>

      <p className="text-sm text-gray-500 mt-6">
        Não tem uma conta?{' '}
        <Link href="/registro" className="text-[#1e5631] font-semibold hover:underline">
          Cadastre-se
        </Link>
      </p>
    </main>
  );
}