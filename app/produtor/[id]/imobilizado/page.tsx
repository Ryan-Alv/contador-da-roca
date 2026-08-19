import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  Building2,
  Leaf,
  Tractor,
  Users,
  DollarSign,
  Calculator,
  BarChart3,
  BookOpen,
  Calendar,
  FileText,
  AlertCircle,
  ArrowLeft,
  Plus,
  Mail,
  Package,
} from 'lucide-react';
import {
  calcularMetricasBem,
  calcularTotaisImobilizado,
  formatarMoeda,
  formatarPercentual,
  serializarBem,
} from '@/lib/bem-imobilizado';
import { CATEGORIA_CORES } from '@/lib/bem-imobilizado-types';
import BemImobilizadoModal from './BemImobilizadoModal';
import ExcluirBemButton from './ExcluirBemButton';
import RecalcularDepreciacaoButton from './RecalcularDepreciacaoButton';
import LogoutButton from '@/components/LogoutButton';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ nova?: string; editar?: string }>;
}

export default async function ImobilizadoPage({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const produtorId = parseInt(resolvedParams.id, 10);

  if (Number.isNaN(produtorId)) notFound();

  // Defesa em profundidade: o middleware já bloqueia acesso indevido,
  // mas checamos de novo aqui direto no servidor (também precisamos da
  // role para decidir se mostra "Voltar aos Produtores").
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'ADMIN' && session.user.produtorId !== produtorId) {
    redirect(session.user.produtorId ? `/produtor/${session.user.produtorId}` : '/pendente');
  }

  const produtor = await prisma.produtores.findUnique({
    where: { id: produtorId },
  });

  if (!produtor) notFound();

  const propriedades = await prisma.propriedades.findMany({
    where: { produtor_id: produtorId },
    orderBy: { nome_propriedade: 'asc' },
  });

  const propriedadeIds = propriedades.map((p) => p.id);

  const bens = await prisma.bem_imobilizado.findMany({
    where: { propriedade_id: { in: propriedadeIds } },
    include: { propriedades: { select: { id: true, nome_propriedade: true } } },
    orderBy: { created_at: 'desc' },
  });

  const totais = calcularTotaisImobilizado(bens);
  const basePath = `/produtor/${produtorId}/imobilizado`;
  const modalNovoAberto = resolvedSearch.nova === 'true';
  const bemIdEditando = resolvedSearch.editar ? parseInt(resolvedSearch.editar, 10) : null;

  const bemEditando = bemIdEditando ? bens.find((b) => b.id === bemIdEditando) : null;
  const bemEditandoSerializado = bemEditando ? serializarBem(bemEditando) : null;

  const navLinkClass = (active: boolean) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition ${
      active
        ? 'bg-[#2d6a4f] text-white font-medium shadow-sm'
        : 'text-emerald-100 hover:bg-[#255d43]'
    }`;

  function categoriaClass(categoria: string) {
    return (
      CATEGORIA_CORES[categoria] ??
      'bg-amber-50 text-amber-900 border-amber-100'
    );
  }

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden relative">
      <aside className="w-80 bg-[#1e5631] text-white flex flex-col justify-between p-6 shadow-xl overflow-y-auto">
        <div>
          {session.user.role === 'ADMIN' && (
            <Link
              href="/"
              className="flex items-center gap-2 text-emerald-200 text-sm font-medium mb-8 hover:text-white transition"
            >
              <ArrowLeft size={16} /> Voltar aos Produtores
            </Link>
          )}

          <div className="bg-[#174426] p-4 rounded-2xl flex items-center gap-3 mb-8 border border-emerald-800/50">
            <div className="bg-emerald-900/80 p-3 rounded-xl text-emerald-300">
              <Leaf size={24} />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-base leading-tight text-white truncate">
                {produtor.nome}
              </h2>
              <p className="text-xs text-emerald-300 mt-0.5">
                {produtor.municipio || '---'}/{produtor.uf || '---'}
              </p>
              {produtor.email && (
                <p className="text-xs text-emerald-200/80 mt-1 truncate flex items-center gap-1">
                  <Mail size={11} className="shrink-0" /> {produtor.email}
                </p>
              )}
            </div>
          </div>

          <nav className="space-y-1.5">
            <Link href={`/produtor/${produtor.id}`} className={navLinkClass(false)}>
              <Building2 size={18} /> Propriedades
            </Link>
            <Link
              href={`/produtor/${produtor.id}/ativos-biologicos`}
              className={navLinkClass(false)}
            >
              <Leaf size={18} /> Ativos Biológicos
            </Link>
            <Link href={basePath} className={navLinkClass(true)}>
              <Tractor size={18} /> Imobilizado
            </Link>
            <a href="#" className={navLinkClass(false)}>
              <Users size={18} /> Folha Rural
            </a>
            <a href="#" className={navLinkClass(false)}>
              <DollarSign size={18} /> Conciliação Bancária
            </a>
            <a href="#" className={navLinkClass(false)}>
              <Calculator size={18} /> Apuração
            </a>
            <a href="#" className={navLinkClass(false)}>
              <BarChart3 size={18} /> Demonstrações
            </a>
            <a href="#" className={navLinkClass(false)}>
              <BookOpen size={18} /> Plano de Contas
            </a>
            <a href="#" className={navLinkClass(false)}>
              <Calendar size={18} /> Agenda Fiscal
            </a>
            <a href="#" className={navLinkClass(false)}>
              <FileText size={18} /> SPED ECD/ECF
            </a>
            <a href="#" className={navLinkClass(false)}>
              <AlertCircle size={18} /> Obrigações Fiscais
            </a>
          </nav>
        </div>

        <div className="pt-6 border-t border-emerald-900/50 mt-4 space-y-4">
          <div>
            <p className="text-[10px] text-emerald-300 font-semibold uppercase tracking-wider">
              Base normativa
            </p>
            <p className="text-[11px] text-emerald-200 mt-0.5">
              NBC TG 29 • CPC 29 • SRF 83/2001
            </p>
          </div>
          <LogoutButton className="flex items-center gap-2 text-sm font-medium text-emerald-100 hover:text-white transition" />
        </div>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">Ativo Imobilizado</h1>
              <p className="text-gray-500 text-sm mt-1">
                Bens do ativo imobilizado rural com cálculo de depreciação linear.
              </p>
            </div>
            <Link
              href={`${basePath}?nova=true`}
              className="bg-[#1e5631] text-white px-5 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-[#174426] transition shadow-lg shadow-emerald-900/10"
            >
              <Plus size={18} /> Novo Bem
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <p className="text-sm font-medium text-gray-500">Valor de Aquisição</p>
              <p className="text-3xl font-extrabold text-[#1e5631] mt-1">
                {formatarMoeda(totais.valorAquisicaoTotal)}
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <p className="text-sm font-medium text-gray-500">Depreciação Acumulada</p>
              <p className="text-3xl font-extrabold text-amber-600 mt-1">
                {formatarMoeda(totais.depreciacaoAcumuladaTotal)}
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-500">Valor Líquido</p>
                  <RecalcularDepreciacaoButton />
                </div>
                <p className="text-3xl font-extrabold text-emerald-600 mt-1">
                  {formatarMoeda(totais.valorLiquidoTotal)}
                </p>
              </div>
              <div className="bg-emerald-50 p-4 rounded-xl text-emerald-600">
                <Package size={28} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Bens Imobilizados</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-gray-500 uppercase text-xs tracking-wider">
                    <th className="px-6 py-4 font-semibold">Bem</th>
                    <th className="px-6 py-4 font-semibold">Propriedade</th>
                    <th className="px-6 py-4 font-semibold">Categoria</th>
                    <th className="px-6 py-4 font-semibold">Aquisição</th>
                    <th className="px-6 py-4 font-semibold">Tx. Dep.</th>
                    <th className="px-6 py-4 font-semibold">Dep. Acumulada</th>
                    <th className="px-6 py-4 font-semibold">Valor Líquido</th>
                    <th className="px-6 py-4 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bens.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                        Nenhum bem imobilizado cadastrado. Clique em &quot;Novo Bem&quot; para
                        começar.
                      </td>
                    </tr>
                  ) : (
                    bens.map((bem) => {
                      const metricas = calcularMetricasBem(bem);

                      return (
                        <tr key={bem.id} className="hover:bg-gray-50/80 transition">
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {bem.descricao}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {bem.propriedades?.nome_propriedade ?? '—'}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${categoriaClass(bem.categoria)}`}
                            >
                              {bem.categoria}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-900">
                            {formatarMoeda(metricas.valorAquisicao)}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {formatarPercentual(Number(bem.taxa_depreciacao))}
                          </td>
                          <td className="px-6 py-4 font-semibold text-amber-600">
                            {formatarMoeda(metricas.depreciacaoAcumulada)}
                          </td>
                          <td className="px-6 py-4 font-semibold text-emerald-600">
                            {formatarMoeda(metricas.valorLiquido)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-end">
                              <ExcluirBemButton
                                produtorId={produtorId}
                                bemId={bem.id}
                                editHref={`${basePath}?editar=${bem.id}`}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {modalNovoAberto && (
        <BemImobilizadoModal
          produtorId={produtorId}
          propriedades={propriedades}
          onCloseHref={basePath}
        />
      )}

      {bemEditandoSerializado && (
        <BemImobilizadoModal
          produtorId={produtorId}
          propriedades={propriedades}
          bem={bemEditandoSerializado}
          onCloseHref={basePath}
        />
      )}
    </div>
  );
}
