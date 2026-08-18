import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseBemInput, serializarBem, toPrismaData } from '@/lib/bem-imobilizado';

type RouteParams = {
  params: Promise<{ produtorId: string; id: string }>;
};

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
    const { produtorId: produtorIdParam, id: idParam } = await params;
    const produtorId = await getProdutorId(produtorIdParam);
    const bemId = parseInt(idParam, 10);

    if (!produtorId || Number.isNaN(bemId)) {
      return NextResponse.json({ error: 'Recurso não encontrado.' }, { status: 404 });
    }

    const propriedadeIds = await getPropriedadesIds(produtorId);
    const bem = await prisma.bem_imobilizado.findFirst({
      where: { id: bemId, propriedade_id: { in: propriedadeIds } },
      include: { propriedades: { select: { id: true, nome_propriedade: true } } },
    });

    if (!bem) {
      return NextResponse.json({ error: 'Bem imobilizado não encontrado.' }, { status: 404 });
    }

    return NextResponse.json(serializarBem(bem));
  } catch (error) {
    console.error('GET bem-imobilizado:', error);
    return NextResponse.json({ error: 'Erro ao buscar bem imobilizado.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { produtorId: produtorIdParam, id: idParam } = await params;
    const produtorId = await getProdutorId(produtorIdParam);
    const bemId = parseInt(idParam, 10);

    if (!produtorId || Number.isNaN(bemId)) {
      return NextResponse.json({ error: 'Recurso não encontrado.' }, { status: 404 });
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

    const existente = await prisma.bem_imobilizado.findFirst({
      where: { id: bemId, propriedade_id: { in: propriedadeIds } },
    });

    if (!existente) {
      return NextResponse.json({ error: 'Bem imobilizado não encontrado.' }, { status: 404 });
    }

    const bem = await prisma.bem_imobilizado.update({
      where: { id: bemId },
      data: toPrismaData(input),
      include: { propriedades: { select: { id: true, nome_propriedade: true } } },
    });

    return NextResponse.json(serializarBem(bem));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao atualizar bem imobilizado.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { produtorId: produtorIdParam, id: idParam } = await params;
    const produtorId = await getProdutorId(produtorIdParam);
    const bemId = parseInt(idParam, 10);

    if (!produtorId || Number.isNaN(bemId)) {
      return NextResponse.json({ error: 'Recurso não encontrado.' }, { status: 404 });
    }

    const propriedadeIds = await getPropriedadesIds(produtorId);
    const existente = await prisma.bem_imobilizado.findFirst({
      where: { id: bemId, propriedade_id: { in: propriedadeIds } },
    });

    if (!existente) {
      return NextResponse.json({ error: 'Bem imobilizado não encontrado.' }, { status: 404 });
    }

    await prisma.bem_imobilizado.delete({ where: { id: bemId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE bem-imobilizado:', error);
    return NextResponse.json({ error: 'Erro ao excluir bem imobilizado.' }, { status: 500 });
  }
}
