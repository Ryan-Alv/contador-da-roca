import { Decimal } from '@prisma/client/runtime/library';
import type { AtivoBiologicoInput } from './ativos-biologicos-types';

export type { AtivoBiologicoInput } from './ativos-biologicos-types';
export {
  ESPECIES,
  CATEGORIAS,
  ESTAGIOS,
  UNIDADES,
} from './ativos-biologicos-types';

export function toNumber(value: Decimal | number | null | undefined): number {
  if (value == null) return 0;
  if (typeof value === 'number') return value;
  return Number(value);
}

/** CPC 29 / NBC TG 29: variação do valor justo em relação ao valor anterior ou custo de aquisição. */
export function calcularGanhoPerda(
  valorJustoAtual: Decimal | number,
  valorJustoAnterior: Decimal | number | null | undefined,
  custoAquisicao: Decimal | number | null | undefined
): number {
  const atual = toNumber(valorJustoAtual);
  const base =
    valorJustoAnterior != null
      ? toNumber(valorJustoAnterior)
      : toNumber(custoAquisicao);

  return atual - base;
}

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

export function formatarQuantidade(quantidade: Decimal | number, unidade: string): string {
  const qtd = toNumber(quantidade);
  const formatted = new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 2,
  }).format(qtd);
  return `${formatted} ${unidade}`;
}

export function serializarAtivo(
  ativo: {
    id: number;
    descricao: string;
    propriedade_id: number;
    especie: string;
    categoria: string;
    estagio: string;
    quantidade: Decimal;
    unidade: string;
    valor_justo_anterior: Decimal | null;
    valor_justo_atual: Decimal;
    custo_aquisicao: Decimal;
    data_avaliacao: Date;
    created_at: Date;
    updated_at: Date;
    propriedades?: { id: number; nome_propriedade: string } | null;
  }
) {
  const valorJustoAtual = toNumber(ativo.valor_justo_atual);
  const ganhoPerda = calcularGanhoPerda(
    ativo.valor_justo_atual,
    ativo.valor_justo_anterior,
    ativo.custo_aquisicao
  );

  return {
    id: ativo.id,
    descricao: ativo.descricao,
    propriedadeId: ativo.propriedade_id,
    propriedadeNome: ativo.propriedades?.nome_propriedade ?? '',
    especie: ativo.especie,
    categoria: ativo.categoria,
    estagio: ativo.estagio,
    quantidade: toNumber(ativo.quantidade),
    unidade: ativo.unidade,
    valorJustoAnterior:
      ativo.valor_justo_anterior != null
        ? toNumber(ativo.valor_justo_anterior)
        : null,
    valorJustoAtual,
    custoAquisicao: toNumber(ativo.custo_aquisicao),
    dataAvaliacao: ativo.data_avaliacao.toISOString().slice(0, 10),
    ganhoPerda,
    createdAt: ativo.created_at.toISOString(),
    updatedAt: ativo.updated_at.toISOString(),
  };
}

export function calcularTotais(
  ativos: Array<{
    valor_justo_atual: Decimal;
    valor_justo_anterior: Decimal | null;
    custo_aquisicao: Decimal;
  }>
) {
  const valorJustoTotal = ativos.reduce(
    (acc, a) => acc + toNumber(a.valor_justo_atual),
    0
  );
  const resultadoTotal = ativos.reduce(
    (acc, a) =>
      acc +
      calcularGanhoPerda(
        a.valor_justo_atual,
        a.valor_justo_anterior,
        a.custo_aquisicao
      ),
    0
  );

  return { valorJustoTotal, resultadoTotal };
}

export function parseAtivoInput(body: unknown): AtivoBiologicoInput {
  if (!body || typeof body !== 'object') {
    throw new Error('Corpo da requisição inválido.');
  }

  const data = body as Record<string, unknown>;

  const descricao = String(data.descricao ?? '').trim();
  const propriedadeId = Number(data.propriedadeId);
  const especie = String(data.especie ?? '').trim();
  const categoria = String(data.categoria ?? '').trim();
  const estagio = String(data.estagio ?? '').trim();
  const quantidade = Number(data.quantidade);
  const unidade = String(data.unidade ?? '').trim();
  const valorJustoAtual = Number(data.valorJustoAtual);
  const custoAquisicao = Number(data.custoAquisicao);
  const dataAvaliacao = String(data.dataAvaliacao ?? '').trim();

  const valorJustoAnteriorRaw = data.valorJustoAnterior;
  const valorJustoAnterior =
    valorJustoAnteriorRaw == null || valorJustoAnteriorRaw === ''
      ? null
      : Number(valorJustoAnteriorRaw);

  if (!descricao) throw new Error('Descrição é obrigatória.');
  if (!propriedadeId || Number.isNaN(propriedadeId)) {
    throw new Error('Propriedade é obrigatória.');
  }
  if (!especie) throw new Error('Espécie é obrigatória.');
  if (!categoria) throw new Error('Categoria é obrigatória.');
  if (!estagio) throw new Error('Estágio é obrigatório.');
  if (Number.isNaN(quantidade) || quantidade <= 0) {
    throw new Error('Quantidade deve ser maior que zero.');
  }
  if (!unidade) throw new Error('Unidade é obrigatória.');
  if (Number.isNaN(valorJustoAtual) || valorJustoAtual < 0) {
    throw new Error('Valor justo atual inválido.');
  }
  if (Number.isNaN(custoAquisicao) || custoAquisicao < 0) {
    throw new Error('Custo de aquisição inválido.');
  }
  if (!dataAvaliacao) throw new Error('Data de avaliação é obrigatória.');

  return {
    descricao,
    propriedadeId,
    especie,
    categoria,
    estagio,
    quantidade,
    unidade,
    valorJustoAnterior,
    valorJustoAtual,
    custoAquisicao,
    dataAvaliacao,
  };
}

export function toPrismaData(input: AtivoBiologicoInput) {
  return {
    descricao: input.descricao,
    propriedade_id: input.propriedadeId,
    especie: input.especie,
    categoria: input.categoria,
    estagio: input.estagio,
    quantidade: input.quantidade,
    unidade: input.unidade,
    valor_justo_anterior: input.valorJustoAnterior,
    valor_justo_atual: input.valorJustoAtual,
    custo_aquisicao: input.custoAquisicao,
    data_avaliacao: new Date(`${input.dataAvaliacao}T00:00:00.000Z`),
  };
}
