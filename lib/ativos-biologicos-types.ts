export type AtivoBiologicoInput = {
  descricao: string;
  propriedadeId: number;
  especie: string;
  categoria: string;
  estagio: string;
  quantidade: number;
  unidade: string;
  valorJustoAnterior?: number | null;
  valorJustoAtual: number;
  custoAquisicao: number;
  dataAvaliacao: string;
};

export const ESPECIES = [
  'Soja',
  'Milho',
  'Gado de Corte',
  'Gado Leiteiro',
  'Nelore',
  'Eucalipto',
  'Café',
  'Cana-de-açúcar',
] as const;

export const CATEGORIAS = ['Planta', 'Animal'] as const;

export const ESTAGIOS = ['Crescimento', 'Produção', 'Colheita/Abate'] as const;

export const UNIDADES = ['ha', 'cabeças', 'ton', 'sc'] as const;
