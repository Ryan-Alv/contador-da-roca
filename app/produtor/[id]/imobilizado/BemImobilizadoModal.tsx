'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import {
  calcularTaxaPelaVidaUtil,
  calcularVidaUtilPelaTaxa,
} from '@/lib/bem-imobilizado-types';
import {
  CATEGORIAS_IMOBILIZADO,
  METODOS_DEPRECIACAO,
  type BemImobilizadoInput,
} from '@/lib/bem-imobilizado-types';

export type BemSerializado = {
  id: number;
  descricao: string;
  propriedadeId: number;
  propriedadeNome: string;
  categoria: string;
  metodo: string;
  valorAquisicao: number;
  dataAquisicao: string;
  taxaDepreciacao: number;
  vidaUtil: number;
  valorResidual: number;
  depreciacaoAcumulada: number;
  valorLiquido: number;
};

type PropriedadeOption = {
  id: number;
  nome_propriedade: string;
};

type Props = {
  produtorId: number;
  propriedades: PropriedadeOption[];
  bem?: BemSerializado | null;
  onCloseHref: string;
};

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#1e5631]';

export default function BemImobilizadoModal({
  produtorId,
  propriedades,
  bem,
  onCloseHref,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taxaDepreciacao, setTaxaDepreciacao] = useState(
    bem?.taxaDepreciacao?.toString() ?? '10'
  );
  const [vidaUtil, setVidaUtil] = useState(bem?.vidaUtil?.toString() ?? '10');
  const [syncSource, setSyncSource] = useState<'taxa' | 'vida' | null>(null);

  const isEditing = Boolean(bem);

  function handleTaxaChange(value: string) {
    setTaxaDepreciacao(value);
    const taxa = parseFloat(value);
    if (!Number.isNaN(taxa) && taxa > 0) {
      setSyncSource('taxa');
      setVidaUtil(String(calcularVidaUtilPelaTaxa(taxa)));
    }
  }

  function handleVidaUtilChange(value: string) {
    setVidaUtil(value);
    const anos = parseFloat(value);
    if (!Number.isNaN(anos) && anos > 0) {
      setSyncSource('vida');
      setTaxaDepreciacao(String(calcularTaxaPelaVidaUtil(anos)));
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload: BemImobilizadoInput = {
      descricao: String(formData.get('descricao') ?? ''),
      propriedadeId: Number(formData.get('propriedadeId')),
      categoria: String(formData.get('categoria') ?? ''),
      metodo: String(formData.get('metodo') ?? 'Linear'),
      valorAquisicao: Number(formData.get('valorAquisicao')),
      dataAquisicao: String(formData.get('dataAquisicao') ?? ''),
      taxaDepreciacao: Number(formData.get('taxaDepreciacao')),
      vidaUtil: Number(formData.get('vidaUtil')),
      valorResidual: Number(formData.get('valorResidual') ?? 0),
    };

    const url = isEditing
      ? `/api/produtor/${produtorId}/imobilizado/${bem!.id}`
      : `/api/produtor/${produtorId}/imobilizado`;

    try {
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar bem imobilizado.');
      }

      router.push(onCloseHref);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar bem imobilizado.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Editar Bem' : 'Novo Bem Imobilizado'}
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
              defaultValue={bem?.descricao ?? ''}
              placeholder="Ex: Trator John Deere 5078E"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Propriedade *</label>
            <select
              name="propriedadeId"
              required
              defaultValue={bem?.propriedadeId ?? ''}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
              <select
                name="categoria"
                required
                defaultValue={bem?.categoria ?? 'Máquinas e Equipamentos'}
                className={`${inputClass} bg-white`}
              >
                {CATEGORIAS_IMOBILIZADO.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Método *</label>
              <select
                name="metodo"
                required
                defaultValue={bem?.metodo ?? 'Linear'}
                className={`${inputClass} bg-white`}
              >
                {METODOS_DEPRECIACAO.map((met) => (
                  <option key={met} value={met}>
                    {met}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor Aquisição (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                name="valorAquisicao"
                required
                min="0.01"
                defaultValue={bem?.valorAquisicao ?? ''}
                placeholder="0,00"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Aquisição *
              </label>
              <input
                type="date"
                name="dataAquisicao"
                required
                defaultValue={bem?.dataAquisicao ?? ''}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Taxa Depreciação (% a.a.)
              </label>
              <input
                type="number"
                step="0.01"
                name="taxaDepreciacao"
                min="0.01"
                value={taxaDepreciacao}
                onChange={(e) => handleTaxaChange(e.target.value)}
                className={inputClass}
              />
              {syncSource === 'taxa' && (
                <p className="text-xs text-emerald-600 mt-1">Vida útil atualizada automaticamente.</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vida Útil (anos)</label>
              <input
                type="number"
                step="0.01"
                name="vidaUtil"
                min="0.01"
                value={vidaUtil}
                onChange={(e) => handleVidaUtilChange(e.target.value)}
                className={inputClass}
              />
              {syncSource === 'vida' && (
                <p className="text-xs text-emerald-600 mt-1">Taxa atualizada automaticamente.</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor Residual (R$)
            </label>
            <input
              type="number"
              step="0.01"
              name="valorResidual"
              min="0"
              defaultValue={bem?.valorResidual ?? 0}
              placeholder="0,00"
              className={inputClass}
            />
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
