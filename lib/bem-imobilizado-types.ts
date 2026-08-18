export type BemImobilizadoInput = {
  descricao: string;
  propriedadeId: number;
  categoria: string;
  metodo: string;
  valorAquisicao: number;
  dataAquisicao: string;
  taxaDepreciacao: number;
  vidaUtil: number;
  valorResidual: number;
};

export const CATEGORIAS_IMOBILIZADO = [
  'Máquinas e Equipamentos',
  'Tratores',
  'Implementos',
  'Veículos',
  'Benfeitorias',
  'Animais de Trabalho',
  'Instalações',
  'Outros',
] as const;

export const METODOS_DEPRECIACAO = ['Linear', 'Saldos Decrescentes'] as const;

export const CATEGORIA_CORES: Record<string, string> = {
  'Máquinas e Equipamentos': 'bg-slate-100 text-slate-800 border-slate-200',
  Tratores: 'bg-amber-50 text-amber-900 border-amber-100',
  Implementos: 'bg-orange-50 text-orange-900 border-orange-100',
  Veículos: 'bg-sky-50 text-sky-900 border-sky-100',
  Benfeitorias: 'bg-stone-100 text-stone-800 border-stone-200',
  'Animais de Trabalho': 'bg-yellow-50 text-yellow-900 border-yellow-100',
  Instalações: 'bg-emerald-50 text-emerald-900 border-emerald-100',
  Outros: 'bg-gray-100 text-gray-800 border-gray-200',
};

/** Vida útil (anos) a partir da taxa anual (% a.a.). */
export function calcularVidaUtilPelaTaxa(taxaDepreciacao: number): number {
  if (!taxaDepreciacao || taxaDepreciacao <= 0) return 0;
  return Math.round((100 / taxaDepreciacao) * 100) / 100;
}

/** Taxa anual (% a.a.) a partir da vida útil (anos). */
export function calcularTaxaPelaVidaUtil(vidaUtil: number): number {
  if (!vidaUtil || vidaUtil <= 0) return 0;
  return Math.round((100 / vidaUtil) * 100) / 100;
}