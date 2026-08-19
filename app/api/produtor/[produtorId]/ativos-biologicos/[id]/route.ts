import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { exigirAcessoProdutor } from '@/lib/api-guard';
import { parseAtivoInput, serializarAtivo, toPrismaData } from '@/lib/ativos-biologicos';

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
    const ativoId = parseInt(idParam, 10);

    if (!produtorId || Number.isNaN(ativoId)) {
      return NextResponse.json({ error: 'Recurso não encontrado.' }, { status: 404 });
    }

    const acessoNegado = await exigirAcessoProdutor(produtorId);
    if (acessoNegado) return acessoNegado;

    const propriedadeIds = await getPropriedadesIds(produtorId);
    const ativo = await prisma.ativos_biologicos.findFirst({
      where: { id: ativoId, propriedade_id: { in: propriedadeIds } },
      include: { propriedades: { select: { id: true, nome_propriedade: true } } },
    });

    if (!ativo) {
      return NextResponse.json({ error: 'Ativo biológico não encontrado.' }, { status: 404 });
    }

    return NextResponse.json(serializarAtivo(ativo));
  } catch (error) {
    console.error('GET ativo-biologico:', error);
    return NextResponse.json({ error: 'Erro ao buscar ativo biológico.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { produtorId: produtorIdParam, id: idParam } = await params;
    const produtorId = await getProdutorId(produtorIdParam);
    const ativoId = parseInt(idParam, 10);

    if (!produtorId || Number.isNaN(ativoId)) {
      return NextResponse.json({ error: 'Recurso não encontrado.' }, { status: 404 });
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

    const existente = await prisma.ativos_biologicos.findFirst({
      where: { id: ativoId, propriedade_id: { in: propriedadeIds } },
    });

    if (!existente) {
      return NextResponse.json({ error: 'Ativo biológico não encontrado.' }, { status: 404 });
    }

    const ativo = await prisma.ativos_biologicos.update({
      where: { id: ativoId },
      data: toPrismaData(input),
      include: { propriedades: { select: { id: true, nome_propriedade: true } } },
    });

    return NextResponse.json(serializarAtivo(ativo));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao atualizar ativo biológico.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { produtorId: produtorIdParam, id: idParam } = await params;
    const produtorId = await getProdutorId(produtorIdParam);
    const ativoId = parseInt(idParam, 10);

    if (!produtorId || Number.isNaN(ativoId)) {
      return NextResponse.json({ error: 'Recurso não encontrado.' }, { status: 404 });
    }

    const acessoNegado = await exigirAcessoProdutor(produtorId);
    if (acessoNegado) return acessoNegado;

    const propriedadeIds = await getPropriedadesIds(produtorId);
    const existente = await prisma.ativos_biologicos.findFirst({
      where: { id: ativoId, propriedade_id: { in: propriedadeIds } },
    });

    if (!existente) {
      return NextResponse.json({ error: 'Ativo biológico não encontrado.' }, { status: 404 });
    }

    await prisma.ativos_biologicos.delete({ where: { id: ativoId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE ativo-biologico:', error);
    return NextResponse.json({ error: 'Erro ao excluir ativo biológico.' }, { status: 500 });
  }
}
