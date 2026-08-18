'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import {
  CATEGORIAS,
  ESPECIES,
  ESTAGIOS,
  UNIDADES,
  type AtivoBiologicoInput,
} from '@/lib/ativos-biologicos-types';

export type AtivoSerializado = {
  id: number;
  descricao: string;
  propriedadeId: number;
  propriedadeNome: string;
  especie: string;
  categoria: string;
  estagio: string;
  quantidade: number;
  unidade: string;
  valorJustoAnterior: number | null;
  valorJustoAtual: number;
  custoAquisicao: number;
  dataAvaliacao: string;
  ganhoPerda: number;
};

type PropriedadeOption = {
  id: number;
  nome_propriedade: string;
};

type Props = {
  produtorId: number;
  propriedades: PropriedadeOption[];
  ativo?: AtivoSerializado | null;
  onCloseHref: string;
};

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#1e5631]';

export default function AtivoBiologicoModal({
  produtorId,
  propriedades,
  ativo,
  onCloseHref,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = Boolean(ativo);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload: AtivoBiologicoInput = {
      descricao: String(formData.get('descricao') ?? ''),
      propriedadeId: Number(formData.get('propriedadeId')),
      especie: String(formData.get('especie') ?? ''),
      categoria: String(formData.get('categoria') ?? ''),
      estagio: String(formData.get('estagio') ?? ''),
      quantidade: Number(formData.get('quantidade')),
      unidade: String(formData.get('unidade') ?? ''),
      valorJustoAnterior:
        formData.get('valorJustoAnterior') === ''
          ? null
          : Number(formData.get('valorJustoAnterior')),
      valorJustoAtual: Number(formData.get('valorJustoAtual')),
      custoAquisicao: Number(formData.get('custoAquisicao')),
      dataAvaliacao: String(formData.get('dataAvaliacao') ?? ''),
    };

    const url = isEditing
      ? `/api/produtor/${produtorId}/ativos-biologicos/${ativo!.id}`
      : `/api/produtor/${produtorId}/ativos-biologicos`;

    try {
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar ativo biológico.');
      }

      router.push(onCloseHref);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar ativo biológico.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Editar Ativo' : 'Novo Ativo Biológico'}
          </h2>
          <Link href={onCloseHref} className="text-gray-400 hover:text-gray-600 text-xl font-bold">
            ✕
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
            <input
              type="text"
              name="descricao"
              required
              defaultValue={ativo?.descricao ?? ''}
              placeholder="Ex: Soja safra 2025/26"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Propriedade *</label>
            <select
              name="propriedadeId"
              required
              defaultValue={ativo?.propriedadeId ?? ''}
              className={`${inputClass} bg-white`}
            >
              <option value="" disabled>
                Selecione...
              </option>
              {propriedades.map((prop) => (
                <option key={prop.id} value={prop.id}>
                  {prop.nome_propriedade}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Espécie *</label>
              <select
                name="especie"
                required
                defaultValue={ativo?.especie ?? ''}
                className={`${inputClass} bg-white`}
              >
                <option value="" disabled>
                  Selecione...
                </option>
                {ESPECIES.map((especie) => (
                  <option key={especie} value={especie}>
                    {especie}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
              <select
                name="categoria"
                required
                defaultValue={ativo?.categoria ?? ''}
                className={`${inputClass} bg-white`}
              >
                <option value="" disabled>
                  Selecione...
                </option>
                {CATEGORIAS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estágio *</label>
              <select
                name="estagio"
                required
                defaultValue={ativo?.estagio ?? ''}
                className={`${inputClass} bg-white`}
              >
                <option value="" disabled>
                  Selecione...
                </option>
                {ESTAGIOS.map((est) => (
                  <option key={est} value={est}>
                    {est}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade *</label>
              <input
                type="number"
                step="0.01"
                name="quantidade"
                required
                min="0.01"
                defaultValue={ativo?.quantidade ?? ''}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unidade *</label>
              <select
                name="unidade"
                required
                defaultValue={ativo?.unidade ?? ''}
                className={`${inputClass} bg-white`}
              >
                <option value="" disabled>
                  Selecione...
                </option>
                {UNIDADES.map((un) => (
                  <option key={un} value={un}>
                    {un}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor Justo Anterior (R$)
              </label>
              <input
                type="number"
                step="0.01"
                name="valorJustoAnterior"
                min="0"
                defaultValue={ativo?.valorJustoAnterior ?? ''}
                placeholder="0,00"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor Justo Atual (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                name="valorJustoAtual"
                required
                min="0"
                defaultValue={ativo?.valorJustoAtual ?? ''}
                placeholder="0,00"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custo Aquisição (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                name="custoAquisicao"
                required
                min="0"
                defaultValue={ativo?.custoAquisicao ?? ''}
                placeholder="0,00"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Avaliação *
              </label>
              <input
                type="date"
                name="dataAvaliacao"
                required
                defaultValue={ativo?.dataAvaliacao ?? ''}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Link
              href={onCloseHref}
              className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-[#1e5631] text-white font-semibold hover:bg-[#174426] transition shadow-lg shadow-emerald-900/10 disabled:opacity-60"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
