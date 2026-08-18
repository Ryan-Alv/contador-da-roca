'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { Edit2, Trash2 } from 'lucide-react';

type Props = {
  produtorId: number;
  ativoId: number;
  editHref: string;
};

export default function ExcluirAtivoButton({ produtorId, ativoId, editHref }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm('Deseja excluir este ativo biológico?')) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/produtor/${produtorId}/ativos-biologicos/${ativoId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao excluir ativo.');
      }

      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir ativo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href={editHref}
        className="p-1.5 text-gray-400 hover:text-blue-600 transition rounded-lg hover:bg-blue-50"
        title="Editar"
      >
        <Edit2 size={16} />
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="p-1.5 text-gray-400 hover:text-red-600 transition rounded-lg hover:bg-red-50 disabled:opacity-50"
        title="Excluir"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
