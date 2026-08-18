import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  calcularTotaisImobilizado,
  parseBemInput,
  serializarBem,
  toPrismaData,
} from '@/lib/bem-imobilizado';

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

    const propriedadeIds = await getPropriedadesIds(produtorId);

    const bens = await prisma.bem_imobilizado.findMany({
      where: { propriedade_id: { in: propriedadeIds } },
      include: { propriedades: { select: { id: true, nome_propriedade: true } } },
      orderBy: { created_at: 'desc' },
    });

    const serializados = bens.map((b) => serializarBem(b));
    const totais = calcularTotaisImobilizado(bens);

    return NextResponse.json({
      bens: serializados,
      totais,
    });
  } catch (error) {
    console.error('GET imobilizado:', error);
    return NextResponse.json({ error: 'Erro ao listar bens imobilizados.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { produtorId: produtorIdParam } = await params;
    const produtorId = await getProdutorId(produtorIdParam);

    if (!produtorId) {
      return NextResponse.json({ error: 'Produtor não encontrado.' }, { status: 404 });
    }

    const body = await request.json();
    const input = parseBemInput(body);
    const propriedadeIds = await getPropriedadesIds(produtorId);

    if (!propriedadeIds.includes(input.propriedadeId)) {
      return NextResponse.json(
        { error: 'Propriedade não pertence a este produtor.' },
        { status: 400 }
      );
    }

    const bem = await prisma.bem_imobilizado.create({
      data: toPrismaData(input),
      include: { propriedades: { select: { id: true, nome_propriedade: true } } },
    });

    return NextResponse.json(serializarBem(bem), { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao criar bem imobilizado.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
