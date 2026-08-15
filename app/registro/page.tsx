// app/registro/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

export default function RegistroPage() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao criar conta.');
      }

      // Redireciona para a tela de login após o sucesso
      router.push('/login?cadastrado=true');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-6 py-12">
      {/* Cabeçalho / Ícone Superior */}
      <div className="mb-6 flex flex-col items-center">
        <div className="bg-[#1e5631] text-white p-3.5 rounded-2xl shadow-md mb-3">
          <User size={28} />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Criar sua conta</h1>
        <p className="text-sm text-gray-500 mt-1">Comece a gerenciar suas propriedades com o Contador da Roça</p>
      </div>

      {/* Caixa do Formulário */}
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl shadow-gray-100 border border-gray-100">
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">Nome Completo</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <User size={18} />
              </span>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu Nome"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#1e5631] transition"
              />
            </div>
          </div>

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
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">Senha</label>
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
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <>Cadastrar conta <ArrowRight size={18} /></>}
          </button>
        </form>
      </div>

      {/* Rodapé Alternativo para Login */}
      <p className="text-sm text-gray-500 mt-6">
        Já tem uma conta?{' '}
        <Link href="/login" className="text-[#1e5631] font-semibold hover:underline">
          Faça login
        </Link>
      </p>
    </main>
  );
}