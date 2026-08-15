'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [novaSenha, setNovaSenha] = useState('');
  const [error, setError] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Token de redefinição ausente.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/redefinir-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, novaSenha }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao redefinir senha.');

      setSucesso(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-6 py-12">
      <div className="mb-6 flex flex-col items-center">
        <div className="bg-[#1e5631] text-white p-3.5 rounded-2xl shadow-md mb-3">
          <Lock size={28} />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Nova Senha</h1>
        <p className="text-sm text-gray-500 mt-1">Digite sua nova senha de acesso</p>
      </div>

      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl shadow-gray-100 border border-gray-100">
        {sucesso ? (
          <div className="flex flex-col items-center text-center py-4">
            <CheckCircle2 className="w-14 h-14 text-emerald-600 mb-3 animate-bounce" />
            <h2 className="text-lg font-bold text-gray-900">Senha alterada!</h2>
            <p className="text-sm text-gray-500 mt-1">Redirecionando para o login...</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">Nova Senha</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                    <Lock size={18} />
                  </span>
                  <input
                    type="password"
                    required
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
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
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <>Salvar nova senha <ArrowRight size={18} /></>}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}