import { Decimal } from '@prisma/client/runtime/library';
import type { BemImobilizadoInput } from './bem-imobilizado-types';

export type { BemImobilizadoInput } from './bem-imobilizado-types';
export {
  CATEGORIAS_IMOBILIZADO,
  METODOS_DEPRECIACAO,
  CATEGORIA_CORES,
  calcularVidaUtilPelaTaxa,
  calcularTaxaPelaVidaUtil,
} from './bem-imobilizado-types';

export function toNumber(value: Decimal | number | null | undefined): number {
  if (value == null) return 0;
  if (typeof value === 'number') return value;
  return Number(value);
}

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

export function formatarPercentual(taxa: number): string {
  return `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(taxa)}%`;
}

export function calcularMesesDecorridos(dataAquisicao: Date, dataReferencia = new Date()): number {
  const inicio = new Date(dataAquisicao);
  const fim = new Date(dataReferencia);

  if (fim <= inicio) return 0;

  let meses =
    (fim.getFullYear() - inicio.getFullYear()) * 12 +
    (fim.getMonth() - inicio.getMonth());

  if (fim.getDate() < inicio.getDate()) {
    meses -= 1;
  }

  return Math.max(0, meses);
}

/**
 * Depreciação linear mensal conforme prática fiscal brasileira (IN SRF 162/98).
 * Depreciação acumulada = min(base depreciável, depreciação mensal × meses decorridos).
 */
export function calcularDepreciacaoAcumulada(
  valorAquisicao: Decimal | number,
  valorResidual: Decimal | number,
  taxaDepreciacao: Decimal | number,
  dataAquisicao: Date,
  dataReferencia = new Date()
): number {
  const aquisicao = toNumber(valorAquisicao);
  const residual = toNumber(valorResidual);
  const taxa = toNumber(taxaDepreciacao);
  const baseDepreciavel = Math.max(0, aquisicao - residual);

  if (baseDepreciavel <= 0 || taxa <= 0) return 0;

  const depreciacaoMensal = (baseDepreciavel * (taxa / 100)) / 12;
  const mesesDecorridos = calcularMesesDecorridos(dataAquisicao, dataReferencia);
  const acumulada = depreciacaoMensal * mesesDecorridos;

  return Math.min(baseDepreciavel, Math.round(acumulada * 100) / 100);
}

export function calcularValorLiquido(
  valorAquisicao: Decimal | number,
  depreciacaoAcumulada: number
): number {
  return Math.max(0, toNumber(valorAquisicao) - depreciacaoAcumulada);
}

type BemBase = {
  valor_aquisicao: Decimal;
  valor_residual: Decimal;
  taxa_depreciacao: Decimal;
  data_aquisicao: Date;
};

export function calcularMetricasBem(bem: BemBase, dataReferencia = new Date()) {
  const valorAquisicao = toNumber(bem.valor_aquisicao);
  const depreciacaoAcumulada = calcularDepreciacaoAcumulada(
    bem.valor_aquisicao,
    bem.valor_residual,
    bem.taxa_depreciacao,
    bem.data_aquisicao,
    dataReferencia
  );
  const valorLiquido = calcularValorLiquido(valorAquisicao, depreciacaoAcumulada);

  return { valorAquisicao, depreciacaoAcumulada, valorLiquido };
}

export function calcularTotaisImobilizado(
  bens: BemBase[],
  dataReferencia = new Date()
) {
  return bens.reduce(
    (acc, bem) => {
      const metricas = calcularMetricasBem(bem, dataReferencia);
      acc.valorAquisicaoTotal += metricas.valorAquisicao;
      acc.depreciacaoAcumuladaTotal += metricas.depreciacaoAcumulada;
      acc.valorLiquidoTotal += metricas.valorLiquido;
      return acc;
    },
    { valorAquisicaoTotal: 0, depreciacaoAcumuladaTotal: 0, valorLiquidoTotal: 0 }
  );
}

export function serializarBem(
  bem: BemBase & {
    id: number;
    descricao: string;
    propriedade_id: number;
    categoria: string;
    metodo: string;
    vida_util: number;
    created_at?: Date;
    updated_at?: Date;
    propriedades?: { id: number; nome_propriedade: string } | null;
  },
  dataReferencia = new Date()
) {
  const metricas = calcularMetricasBem(bem, dataReferencia);

  return {
    id: bem.id,
    descricao: bem.descricao,
    propriedadeId: bem.propriedade_id,
    propriedadeNome: bem.propriedades?.nome_propriedade ?? '',
    categoria: bem.categoria,
    metodo: bem.metodo,
    valorAquisicao: metricas.valorAquisicao,
    dataAquisicao: bem.data_aquisicao.toISOString().slice(0, 10),
    taxaDepreciacao: toNumber(bem.taxa_depreciacao),
    vidaUtil: bem.vida_util,
    valorResidual: toNumber(bem.valor_residual),
    depreciacaoAcumulada: metricas.depreciacaoAcumulada,
    valorLiquido: metricas.valorLiquido,
  };
}

export function parseBemInput(body: unknown): BemImobilizadoInput {
  if (!body || typeof body !== 'object') {
    throw new Error('Corpo da requisição inválido.');
  }

  const data = body as Record<string, unknown>;

  const descricao = String(data.descricao ?? '').trim();
  const propriedadeId = Number(data.propriedadeId);
  const categoria = String(data.categoria ?? '').trim();
  const metodo = String(data.metodo ?? 'Linear').trim();
  const valorAquisicao = Number(data.valorAquisicao);
  const dataAquisicao = String(data.dataAquisicao ?? '').trim();
  const taxaDepreciacao = Number(data.taxaDepreciacao);
  const vidaUtil = Number(data.vidaUtil);
  const valorResidual = Number(data.valorResidual ?? 0);

  if (!descricao) throw new Error('Descrição é obrigatória.');
  if (!propriedadeId || Number.isNaN(propriedadeId)) {
    throw new Error('Propriedade é obrigatória.');
  }
  if (!categoria) throw new Error('Categoria é obrigatória.');
  if (!metodo) throw new Error('Método é obrigatório.');
  if (Number.isNaN(valorAquisicao) || valorAquisicao <= 0) {
    throw new Error('Valor de aquisição inválido.');
  }
  if (!dataAquisicao) throw new Error('Data de aquisição é obrigatória.');
  if (Number.isNaN(taxaDepreciacao) || taxaDepreciacao <= 0) {
    throw new Error('Taxa de depreciação inválida.');
  }
  if (Number.isNaN(vidaUtil) || vidaUtil <= 0) {
    throw new Error('Vida útil inválida.');
  }
  if (Number.isNaN(valorResidual) || valorResidual < 0) {
    throw new Error('Valor residual inválido.');
  }
  if (valorResidual >= valorAquisicao) {
    throw new Error('Valor residual deve ser menor que o valor de aquisição.');
  }

  return {
    descricao,
    propriedadeId,
    categoria,
    metodo,
    valorAquisicao,
    dataAquisicao,
    taxaDepreciacao,
    vidaUtil,
    valorResidual,
  };
}

export function toPrismaData(input: BemImobilizadoInput) {
  return {
    descricao: input.descricao,
    propriedade_id: input.propriedadeId,
    categoria: input.categoria,
    metodo: input.metodo,
    valor_aquisicao: input.valorAquisicao,
    data_aquisicao: new Date(`${input.dataAquisicao}T00:00:00.000Z`),
    taxa_depreciacao: input.taxaDepreciacao,
    vida_util: Math.round(input.vidaUtil),
    valor_residual: input.valorResidual,
  };
}
