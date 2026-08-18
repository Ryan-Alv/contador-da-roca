import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
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
  TrendingUp,
  TrendingDown,
  Sprout,
} from 'lucide-react';
import {
  calcularGanhoPerda,
  calcularTotais,
  formatarMoeda,
  formatarQuantidade,
} from '@/lib/ativos-biologicos';
import AtivoBiologicoModal from './AtivoBiologicoModal';
import ExcluirAtivoButton from './ExcluirAtivoButton';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ nova?: string; editar?: string }>;
}

export default async function AtivosBiologicosPage({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const produtorId = parseInt(resolvedParams.id, 10);

  if (Number.isNaN(produtorId)) notFound();

  const produtor = await prisma.produtores.findUnique({
    where: { id: produtorId },
  });

  if (!produtor) notFound();

  const propriedades = await prisma.propriedades.findMany({
    where: { produtor_id: produtorId },
    orderBy: { nome_propriedade: 'asc' },
  });

  const propriedadeIds = propriedades.map((p) => p.id);

  const ativos = await prisma.ativos_biologicos.findMany({
    where: { propriedade_id: { in: propriedadeIds } },
    include: { propriedades: { select: { id: true, nome_propriedade: true } } },
    orderBy: { created_at: 'desc' },
  });

  const { valorJustoTotal, resultadoTotal } = calcularTotais(ativos);
  const basePath = `/produtor/${produtorId}/ativos-biologicos`;
  const modalNovoAberto = resolvedSearch.nova === 'true';
  const ativoIdEditando = resolvedSearch.editar
    ? parseInt(resolvedSearch.editar, 10)
    : null;

  const ativoEditando = ativoIdEditando
    ? ativos.find((a) => a.id === ativoIdEditando)
    : null;

  const ativoEditandoSerializado = ativoEditando
    ? {
        id: ativoEditando.id,
        descricao: ativoEditando.descricao,
        propriedadeId: ativoEditando.propriedade_id,
        propriedadeNome: ativoEditando.propriedades?.nome_propriedade ?? '',
        especie: ativoEditando.especie,
        categoria: ativoEditando.categoria,
        estagio: ativoEditando.estagio,
        quantidade: Number(ativoEditando.quantidade),
        unidade: ativoEditando.unidade,
        valorJustoAnterior:
          ativoEditando.valor_justo_anterior != null
            ? Number(ativoEditando.valor_justo_anterior)
            : null,
        valorJustoAtual: Number(ativoEditando.valor_justo_atual),
        custoAquisicao: Number(ativoEditando.custo_aquisicao),
        dataAvaliacao: ativoEditando.data_avaliacao.toISOString().slice(0, 10),
        ganhoPerda: calcularGanhoPerda(
          ativoEditando.valor_justo_atual,
          ativoEditando.valor_justo_anterior,
          ativoEditando.custo_aquisicao
        ),
      }
    : null;

  const navLinkClass = (active: boolean) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition ${
      active
        ? 'bg-[#2d6a4f] text-white font-medium shadow-sm'
        : 'text-emerald-100 hover:bg-[#255d43]'
    }`;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden relative">
      <aside className="w-80 bg-[#1e5631] text-white flex flex-col justify-between p-6 shadow-xl overflow-y-auto">
        <div>
          <Link
            href="/"
            className="flex items-center gap-2 text-emerald-200 text-sm font-medium mb-8 hover:text-white transition"
          >
            <ArrowLeft size={16} /> Voltar aos Produtores
          </Link>

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
            <Link
              href={`/produtor/${produtor.id}`}
              className={navLinkClass(false)}
            >
              <Building2 size={18} /> Propriedades
            </Link>
            <Link href={basePath} className={navLinkClass(true)}>
              <Leaf size={18} /> Ativos Biológicos
            </Link>
            <Link
              href={`/produtor/${produtor.id}/imobilizado`}
              className={navLinkClass(false)}
            >
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

        <div className="pt-6 border-t border-emerald-900/50 mt-4">
          <p className="text-[10px] text-emerald-300 font-semibold uppercase tracking-wider">
            Base normativa
          </p>
          <p className="text-[11px] text-emerald-200 mt-0.5">
            NBC TG 29 • CPC 29 • SRF 83/2001
          </p>
        </div>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">Ativos Biológicos</h1>
              <p className="text-gray-500 text-sm mt-1">
                Contabilização de plantas e animais conforme CPC 29 / NBC TG 29.
              </p>
            </div>
            <Link
              href={`${basePath}?nova=true`}
              className="bg-[#1e5631] text-white px-5 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-[#174426] transition shadow-lg shadow-emerald-900/10"
            >
              <Plus size={18} /> Novo Ativo
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Valor Justo Total</p>
                <p className="text-3xl font-extrabold text-gray-900 mt-1">
                  {formatarMoeda(valorJustoTotal)}
                </p>
              </div>
              <div className="bg-emerald-50 p-4 rounded-xl text-[#1e5631]">
                <Sprout size={28} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Resultado (Ganho/Perda)</p>
                <div className="flex items-center gap-2 mt-1">
                  {resultadoTotal >= 0 ? (
                    <TrendingUp size={22} className="text-emerald-600" />
                  ) : (
                    <TrendingDown size={22} className="text-red-600" />
                  )}
                  <p
                    className={`text-3xl font-extrabold ${
                      resultadoTotal >= 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {formatarMoeda(Math.abs(resultadoTotal))}
                  </p>
                </div>
              </div>
              <div
                className={`p-4 rounded-xl ${
                  resultadoTotal >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                }`}
              >
                {resultadoTotal >= 0 ? <TrendingUp size={28} /> : <TrendingDown size={28} />}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Carteira de Ativos</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-gray-500 uppercase text-xs tracking-wider">
                    <th className="px-6 py-4 font-semibold">Descrição</th>
                    <th className="px-6 py-4 font-semibold">Propriedade</th>
                    <th className="px-6 py-4 font-semibold">Espécie</th>
                    <th className="px-6 py-4 font-semibold">Estágio</th>
                    <th className="px-6 py-4 font-semibold">Qtd.</th>
                    <th className="px-6 py-4 font-semibold">Valor Justo</th>
                    <th className="px-6 py-4 font-semibold">Ganho/Perda</th>
                    <th className="px-6 py-4 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ativos.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                        Nenhum ativo biológico cadastrado. Clique em &quot;Novo Ativo&quot; para
                        começar.
                      </td>
                    </tr>
                  ) : (
                    ativos.map((ativo) => {
                      const ganhoPerda = calcularGanhoPerda(
                        ativo.valor_justo_atual,
                        ativo.valor_justo_anterior,
                        ativo.custo_aquisicao
                      );
                      const positivo = ganhoPerda >= 0;

                      return (
                        <tr key={ativo.id} className="hover:bg-gray-50/80 transition">
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {ativo.descricao}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {ativo.propriedades?.nome_propriedade ?? '—'}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-100">
                              {ativo.especie}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{ativo.estagio}</td>
                          <td className="px-6 py-4 text-gray-600">
                            {formatarQuantidade(ativo.quantidade, ativo.unidade)}
                          </td>
                          <td className="px-6 py-4 font-semibold text-gray-900">
                            {formatarMoeda(Number(ativo.valor_justo_atual))}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1 font-semibold ${
                                positivo ? 'text-emerald-600' : 'text-red-600'
                              }`}
                            >
                              {positivo ? (
                                <TrendingUp size={14} />
                              ) : (
                                <span className="text-red-600">−</span>
                              )}
                              {formatarMoeda(Math.abs(ganhoPerda))}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-end">
                              <ExcluirAtivoButton
                                produtorId={produtorId}
                                ativoId={ativo.id}
                                editHref={`${basePath}?editar=${ativo.id}`}
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
        <AtivoBiologicoModal
          produtorId={produtorId}
          propriedades={propriedades}
          onCloseHref={basePath}
        />
      )}

      {ativoEditandoSerializado && (
        <AtivoBiologicoModal
          produtorId={produtorId}
          propriedades={propriedades}
          ativo={ativoEditandoSerializado}
          onCloseHref={basePath}
        />
      )}
    </div>
  );
}
