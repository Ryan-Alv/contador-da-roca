import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { exigirAcessoProdutor } from '@/lib/api-guard';
import {
  calcularTotais,
  parseAtivoInput,
  serializarAtivo,
  toPrismaData,
} from '@/lib/ativos-biologicos';

type RouteParams = { params: Promise<{ produtorId: string }> };

async function getProdutorId(produtorId: string) {
  const id = parseInt(produtorId, 10);
  if (Number.isNaN(id)) return null;

  const produtor = await prisma.produtores.findUnique({ where: { id } });
  return produtor ? id : null;
}

async function getPropriedadesIds(produtorId: number) {
  const propriedades = await prisma.propriedades.findMany({
    where: { produtor_id: produtorId },
    select: { id: true },
  });
  return propriedades.map((p) => p.id);
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { produtorId: produtorIdParam } = await params;
    const produtorId = await getProdutorId(produtorIdParam);

    if (!produtorId) {
      return NextResponse.json({ error: 'Produtor não encontrado.' }, { status: 404 });
    }

    const acessoNegado = await exigirAcessoProdutor(produtorId);
    if (acessoNegado) return acessoNegado;

    const propriedadeIds = await getPropriedadesIds(produtorId);

    const ativos = await prisma.ativos_biologicos.findMany({
      where: { propriedade_id: { in: propriedadeIds } },
      include: { propriedades: { select: { id: true, nome_propriedade: true } } },
      orderBy: { created_at: 'desc' },
    });

    const serializados = ativos.map(serializarAtivo);
    const totais = calcularTotais(ativos);

    return NextResponse.json({
      ativos: serializados,
      totais: {
        valorJustoTotal: totais.valorJustoTotal,
        resultadoTotal: totais.resultadoTotal,
      },
    });
  } catch (error) {
    console.error('GET ativos-biologicos:', error);
    return NextResponse.json({ error: 'Erro ao listar ativos biológicos.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { produtorId: produtorIdParam } = await params;
    const produtorId = await getProdutorId(produtorIdParam);

    if (!produtorId) {
      return NextResponse.json({ error: 'Produtor não encontrado.' }, { status: 404 });
    }

    const acessoNegado = await exigirAcessoProdutor(produtorId);
    if (acessoNegado) return acessoNegado;

    const body = await request.json();
    const input = parseAtivoInput(body);
    const propriedadeIds = await getPropriedadesIds(produtorId);

    if (!propriedadeIds.includes(input.propriedadeId)) {
      return NextResponse.json(
        { error: 'Propriedade não pertence a este produtor.' },
        { status: 400 }
      );
    }

    const ativo = await prisma.ativos_biologicos.create({
      data: toPrismaData(input),
      include: { propriedades: { select: { id: true, nome_propriedade: true } } },
    });

    return NextResponse.json(serializarAtivo(ativo), { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao criar ativo biológico.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
