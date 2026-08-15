import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { 
  Building2, Leaf, Tractor, Users, DollarSign, Calculator, 
  BarChart3, BookOpen, Calendar, FileText, AlertCircle, ArrowLeft, Plus, Trash2, Edit2, FileText as FileIcon, Mail
} from 'lucide-react';

interface Props {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    nova?: string;
    editar?: string;
  }>;
}

export default async function ProdutorPropriedades({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const produtorId = parseInt(resolvedParams.id);

  if (isNaN(produtorId)) notFound();

  const produtor = await prisma.produtores.findUnique({
    where: { id: produtorId }
  });

  if (!produtor) notFound();

  const propriedades = await prisma.propriedades.findMany({
    where: { produtor_id: produtorId }
  });

  async function criarPropriedade(formData: FormData) {
    'use server'
    const nome_propriedade = formData.get('nome_propriedade') as string;
    const cpf_cnpj = formData.get('cpf_cnpj') as string;
    const municipio = formData.get('municipio') as string;
    const uf = formData.get('uf') as string;
    const area_total = parseFloat(formData.get('area_total') as string) || 0;
    const tipo_exploracao = formData.get('tipo_exploracao') as string;
    const registro_car = formData.get('registro_car') as string;
    const ccir_itr = formData.get('ccir_itr') as string;

    if (!nome_propriedade) return;

    await prisma.propriedades.create({
      data: {
        produtores: {
          connect: { id: produtorId }
        },
        nome_propriedade,
        cpf_cnpj,
        municipio,
        uf,
        area_total,
        tipo_exploracao,
        registro_car,
        ccir_itr
      }
    });

    redirect(`/produtor/${produtorId}`);
  }

  async function excluirPropriedade(formData: FormData) {
    'use server'
    const propId = parseInt(formData.get('propId') as string);
    if (!propId) return;

    await prisma.propriedades.delete({
      where: { id: propId }
    });

    redirect(`/produtor/${produtorId}`);
  }

  async function atualizarPropriedade(formData: FormData) {
    'use server'
    const propId = parseInt(formData.get('propId') as string);
    const nome_propriedade = formData.get('nome_propriedade') as string;
    const cpf_cnpj = formData.get('cpf_cnpj') as string;
    const municipio = formData.get('municipio') as string;
    const uf = formData.get('uf') as string;
    const area_total = parseFloat(formData.get('area_total') as string) || 0;
    const tipo_exploracao = formData.get('tipo_exploracao') as string;
    const registro_car = formData.get('registro_car') as string;
    const ccir_itr = formData.get('ccir_itr') as string;

    if (!propId || !nome_propriedade) return;

    await prisma.propriedades.update({
      where: { id: propId },
      data: {
        nome_propriedade,
        cpf_cnpj,
        municipio,
        uf,
        area_total,
        tipo_exploracao,
        registro_car,
        ccir_itr
      }
    });

    redirect(`/produtor/${produtorId}`);
  }

  const modalNovoAberto = resolvedSearch.nova === 'true';
  const propIdEditando = resolvedSearch.editar ? parseInt(resolvedSearch.editar) : null;
  const propriedadeEditando = propIdEditando ? propriedades.find(p => p.id === propIdEditando) : null;

  const tiposExploracao = ['Lavoura', 'Pecuária', 'Misto', 'Silvicultura', 'Avicultura', 'Suinocultura'];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden relative">
      <aside className="w-80 bg-[#1e5631] text-white flex flex-col justify-between p-6 shadow-xl overflow-y-auto">
        <div>
          <Link href="/" className="flex items-center gap-2 text-emerald-200 text-sm font-medium mb-8 hover:text-white transition">
            <ArrowLeft size={16} /> Voltar aos Produtores
          </Link>

          <div className="bg-[#174426] p-4 rounded-2xl flex items-center gap-3 mb-8 border border-emerald-800/50">
            <div className="bg-emerald-900/80 p-3 rounded-xl text-emerald-300">
              <Leaf size={24} />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-base leading-tight text-white truncate">{produtor.nome}</h2>
              <p className="text-xs text-emerald-300 mt-0.5">{produtor.municipio || '---'}/{produtor.uf || '---'}</p>
              {produtor.email && (
                <p className="text-xs text-emerald-200/80 mt-1 truncate flex items-center gap-1">
                  <Mail size={11} className="shrink-0" /> {produtor.email}
                </p>
              )}
            </div>
          </div>

          <nav className="space-y-1.5">
            <a href={`/produtor/${produtor.id}`} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#2d6a4f] text-white font-medium shadow-sm transition">
              <Building2 size={18} /> Propriedades
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-emerald-100 hover:bg-[#255d43] transition"><Leaf size={18} /> Ativos Biológicos</a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-emerald-100 hover:bg-[#255d43] transition"><Tractor size={18} /> Imobilizado</a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-emerald-100 hover:bg-[#255d43] transition"><Users size={18} /> Folha Rural</a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-emerald-100 hover:bg-[#255d43] transition"><DollarSign size={18} /> Conciliação Bancária</a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-emerald-100 hover:bg-[#255d43] transition"><Calculator size={18} /> Apuração</a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-emerald-100 hover:bg-[#255d43] transition"><BarChart3 size={18} /> Demonstrações</a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-emerald-100 hover:bg-[#255d43] transition"><BookOpen size={18} /> Plano de Contas</a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-emerald-100 hover:bg-[#255d43] transition"><Calendar size={18} /> Agenda Fiscal</a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-emerald-100 hover:bg-[#255d43] transition"><FileText size={18} /> SPED ECD/ECF</a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-emerald-100 hover:bg-[#255d43] transition"><AlertCircle size={18} /> Obrigações Fiscais</a>
          </nav>
        </div>

        <div className="pt-6 border-t border-emerald-900/50 mt-4">
          <p className="text-[10px] text-emerald-300 font-semibold uppercase tracking-wider">Base normativa</p>
          <p className="text-[11px] text-emerald-200 mt-0.5">NBC TG 29 • CPC 29 • SRF 83/2001</p>
        </div>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">Propriedades Rurais</h1>
              <p className="text-gray-500 text-sm mt-1">Cadastro das unidades produtivas vinculadas aos produtores rurais.</p>
            </div>
            <Link 
              href={`/produtor/${produtor.id}?nova=true`} 
              className="bg-[#1e5631] text-white px-5 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-[#174426] transition shadow-lg shadow-emerald-900/10"
            >
              <Plus size={18} /> Nova Propriedade
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {propriedades.length === 0 ? (
              <p className="text-gray-400 text-sm col-span-3">Nenhuma propriedade cadastrada para este produtor ainda. Clique em "Nova Propriedade" para começar.</p>
            ) : (
              propriedades.map((prop) => (
                <div key={prop.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 relative flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-emerald-50 p-3 rounded-xl text-[#1e5631]">
                        <Building2 size={22} />
                      </div>
                      <div className="flex gap-2 text-gray-400 items-center">
                        <Link href={`/produtor/${produtor.id}?editar=${prop.id}`} className="hover:text-blue-600 transition p-1">
                          <Edit2 size={16} />
                        </Link>
                        <form action={excluirPropriedade}>
                          <input type="hidden" name="propId" value={prop.id} />
                          <button type="submit" className="hover:text-red-600 transition p-1">
                            <Trash2 size={16} />
                          </button>
                        </form>
                      </div>
                    </div>

                    <h3 className="font-bold text-lg text-gray-900 mb-1">{prop.nome_propriedade}</h3>
                    <p className="text-xs text-gray-500 mb-4 flex items-center gap-1">
                      <Users size={13} /> {produtor.nome} {prop.cpf_cnpj ? `• ${prop.cpf_cnpj}` : ''}
                    </p>

                    <div className="space-y-1.5 text-sm text-gray-600 mb-6">
                      <p className="flex items-center gap-1.5">📍 {prop.municipio || 'Não informado'} - {prop.uf || '---'}</p>
                      <p>🌾 Exploração: <span className="font-semibold text-gray-900">{prop.tipo_exploracao || 'Misto'}</span></p>
                      <p>📐 Área: <span className="font-semibold text-gray-900">{prop.area_total ? Number(prop.area_total) : 0} ha</span></p>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4 space-y-1 text-xs text-gray-500">
                    <p className="flex items-center gap-1.5">
                      <FileIcon size={13} className="text-gray-400" /> CAR: {prop.registro_car || 'Não informado'}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <FileIcon size={13} className="text-gray-400" /> CCIR/ITR: {prop.ccir_itr || 'Não informado'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {modalNovoAberto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">Nova Propriedade</h2>
              <Link href={`/produtor/${produtor.id}`} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</Link>
            </div>

            <form action={criarPropriedade} className="p-8 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Propriedade *</label>
                <input type="text" name="nome_propriedade" required placeholder="Ex: Fazenda Santa Helena" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#1e5631]" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Produtor Rural *</label>
                <input type="text" disabled value={produtor.nome} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CPF / CNPJ</label>
                  <input type="text" name="cpf_cnpj" placeholder="Ex: 12.345.678/0001-90" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#1e5631]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Município</label>
                  <input type="text" name="municipio" placeholder="Ex: Ribeirão Preto" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#1e5631]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">UF</label>
                  <input type="text" name="uf" maxLength={2} placeholder="Ex: SP" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#1e5631]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Área Total (ha)</label>
                  <input type="number" step="0.01" name="area_total" placeholder="Ex: 850" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#1e5631]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Exploração</label>
                  <select name="tipo_exploracao" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 outline-none bg-white focus:ring-2 focus:ring-emerald-100 focus:border-[#1e5631]">
                    {tiposExploracao.map(tipo => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registro CAR</label>
                  <input type="text" name="registro_car" placeholder="Ex: SP-3509507-1234" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#1e5631]" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CCIR / ITR</label>
                <input type="text" name="ccir_itr" placeholder="Ex: 540.000.123/2025" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#1e5631]" />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Link href={`/produtor/${produtor.id}`} className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition">
                  Cancelar
                </Link>
                <button type="submit" className="px-6 py-3 rounded-xl bg-[#1e5631] text-white font-semibold hover:bg-[#174426] transition shadow-lg shadow-emerald-900/10">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {propriedadeEditando && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">Editar Propriedade</h2>
              <Link href={`/produtor/${produtor.id}`} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</Link>
            </div>

            <form action={atualizarPropriedade} className="p-8 space-y-4 max-h-[80vh] overflow-y-auto">
              <input type="hidden" name="propId" value={propriedadeEditando.id} />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Propriedade *</label>
                <input type="text" name="nome_propriedade" defaultValue={propriedadeEditando.nome_propriedade} required className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#1e5631]" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Produtor Rural *</label>
                <input type="text" disabled value={produtor.nome} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CPF / CNPJ</label>
                  <input type="text" name="cpf_cnpj" defaultValue={propriedadeEditando.cpf_cnpj || ''} placeholder="Ex: 12.345.678/0001-90" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#1e5631]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Município</label>
                  <input type="text" name="municipio" defaultValue={propriedadeEditando.municipio || ''} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#1e5631]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">UF</label>
                  <input type="text" name="uf" maxLength={2} defaultValue={propriedadeEditando.uf || ''} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#1e5631]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Área Total (ha)</label>
                  <input type="number" step="0.01" name="area_total" defaultValue={propriedadeEditando.area_total ? Number(propriedadeEditando.area_total) : ''} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#1e5631]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Exploração</label>
                  <select name="tipo_exploracao" defaultValue={propriedadeEditando.tipo_exploracao || 'Misto'} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 outline-none bg-white focus:ring-2 focus:ring-emerald-100 focus:border-[#1e5631]">
                    {tiposExploracao.map(tipo => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registro CAR</label>
                  <input type="text" name="registro_car" defaultValue={propriedadeEditando.registro_car || ''} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#1e5631] />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CCIR / ITR</label>
                <input type="text" name="ccir_itr" defaultValue={propriedadeEditando.ccir_itr || ''} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#1e5631]" />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Link href={`/produtor/${produtor.id}`} className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition">
                  Cancelar
                </Link>
                <button type="submit" className="px-6 py-3 rounded-xl bg-[#1e5631] text-white font-semibold hover:bg-[#174426] transition shadow-lg shadow-emerald-900/10">
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}