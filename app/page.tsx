import Link from 'next/link';
import { prisma } from '../lib/prisma';
import { redirect } from 'next/navigation';
import { Search, Mail, Edit2 } from 'lucide-react';

interface Props {
  searchParams: Promise<{
    q?: string;
    editar_produtor?: string;
  }>;
}

export default async function Home({ searchParams }: Props) {
  const resolvedSearch = await searchParams;
  const termoBusca = (resolvedSearch.q || '').toLowerCase();
  const produtorIdEditando = resolvedSearch.editar_produtor ? parseInt(resolvedSearch.editar_produtor) : null;

  const todosProdutores = await prisma.produtores.findMany({
    include: {
      propriedades: true
    },
    orderBy: { nome: 'asc' }
  });

  const produtorEditando = produtorIdEditando 
    ? todosProdutores.find((p) => p.id === produtorIdEditando) 
    : null;

  const propriedades = await prisma.propriedades.findMany();

  // Server Action para atualizar o produtor
  async function atualizarProdutor(formData: FormData) {
    'use server'
    const id = parseInt(formData.get('id') as string);
    const nome = formData.get('nome') as string;
    const cpf_cnpj = formData.get('cpf_cnpj') as string;
    const telefone = formData.get('telefone') as string;
    const email = formData.get('email') as string;
    const municipio = formData.get('municipio') as string;
    const uf = formData.get('uf') as string;
    const tipo_producao = formData.get('tipo_producao') as any;

    if (!id || !nome || !cpf_cnpj) return;

    await prisma.produtores.update({
      where: { id },
      data: {
        nome,
        cpf_cnpj,
        telefone,
        email,
        municipio,
        uf,
        tipo_producao
      }
    });

    redirect('/');
  }

  // Filtrar produtores incluindo o e-mail nos critérios
  const produtoresFiltrados = todosProdutores.filter((p) => {
    if (!termoBusca) return true;

    const nomeMatch = p.nome.toLowerCase().includes(termoBusca);
    const cpfCnpjMatch = p.cpf_cnpj?.toLowerCase().includes(termoBusca);
    const emailMatch = p.email?.toLowerCase().includes(termoBusca);
    const municipioMatch = p.municipio?.toLowerCase().includes(termoBusca);
    const ufMatch = p.uf?.toLowerCase().includes(termoBusca);
    
    const propriedadeMatch = p.propriedades.some((prop) => 
      prop.municipio?.toLowerCase().includes(termoBusca) ||
      prop.uf?.toLowerCase().includes(termoBusca) ||
      prop.tipo_exploracao?.toLowerCase().includes(termoBusca) ||
      prop.nome_propriedade.toLowerCase().includes(termoBusca)
    );

    return nomeMatch || cpfCnpjMatch || emailMatch || municipioMatch || ufMatch || propriedadeMatch;
  });

  const tiposProducao = [
    { value: 'Misto', label: 'Misto' },
    { value: 'Lavoura', label: 'Lavoura' },
    { value: 'Pecu_ria', label: 'Pecuária' },
    { value: 'Suinocultura', label: 'Suinocultura' },
    { value: 'Silvicultura', label: 'Silvicultura' },
    { value: 'Avicultura', label: 'Avicultura' }
  ];

  return (
    <main className="min-h-screen bg-gray-50 relative">
      <header className="bg-white shadow-sm sticky top-0 z-10 border-b border-gray-100">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <h1 className="text-2xl font-bold text-emerald-900 tracking-tight">
              Contador <span className="text-emerald-600">da Roça</span>
            </h1>
          </div>
          <Link href="/produtor/novo" className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-emerald-700 transition duration-150 flex items-center gap-2 shadow-sm">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Novo Produtor
          </Link>
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Painel de Gestão</h2>
            <p className="mt-2 text-lg text-gray-600">Visão geral dos seus produtores e propriedades rurais.</p>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-lg shadow-gray-100/50 flex items-start gap-6">
            <div className="bg-emerald-100 p-4 rounded-2xl">
              <svg className="w-8 h-8 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Produtores</p>
              <p className="text-4xl font-bold text-gray-900 mt-1">{todosProdutores.length}</p>
              <p className="text-sm text-emerald-600 font-medium mt-2">Cadastrados no sistema</p>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-lg shadow-gray-100/50 flex items-start gap-6">
            <div className="bg-sky-100 p-4 rounded-2xl">
              <svg className="w-8 h-8 text-sky-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Propriedades</p>
              <p className="text-4xl font-bold text-gray-900 mt-1">{propriedades.length}</p>
              <p className="text-sm text-sky-600 font-medium mt-2">Áreas rurais registradas</p>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-lg shadow-gray-100/50 flex items-start gap-6">
             <div className="bg-amber-100 p-4 rounded-2xl">
                <svg className="w-8 h-8 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Safra Atual</p>
              <p className="text-4xl font-bold text-gray-900 mt-1">24/25</p>
              <p className="text-sm text-amber-600 font-medium mt-2">Monitoramento ativo</p>
            </div>
          </div>
        </section>

        <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-lg shadow-gray-100/50">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 pb-6 border-b border-gray-100 gap-4">
            <h3 className="text-2xl font-semibold text-gray-900">Lista de Produtores</h3>
            
            <form method="GET" className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <div className="relative w-full md:w-96">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                  <Search size={18} />
                </span>
                <input 
                  type="text" 
                  name="q" 
                  defaultValue={resolvedSearch.q || ''}
                  placeholder="Buscar por nome, CPF/CNPJ, e-mail, cidade..." 
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 text-sm font-medium focus:ring-2 focus:ring-emerald-200 focus:border-[#1e5631] outline-none transition"
                />
              </div>
              <button type="submit" className="bg-[#1e5631] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#174426] transition shadow-sm">
                Filtrar
              </button>
              {resolvedSearch.q && (
                <Link href="/" className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                  Limpar
                </Link>
              )}
            </form>
          </div>

          <div className="flow-root">
            {produtoresFiltrados.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl">
                    <svg className="mx-auto w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <p className="mt-4 text-lg font-medium text-gray-600">Nenhum produtor encontrado.</p>
                    <p className="text-gray-500 mt-1">Tente pesquisar por outros termos ou limpe o filtro.</p>
                </div>
            ) : (
              <ul role="list" className="divide-y divide-gray-100">
                {produtoresFiltrados.map((p) => (
                  <li key={p.id} className="py-6 flex items-center justify-between gap-x-6 hover:bg-gray-50 rounded-xl px-4 transition duration-150 group">
                    <div className="flex min-w-0 gap-x-5 items-center">
                      <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-800 text-xl font-bold border-2 border-emerald-100 group-hover:bg-emerald-100">
                        {p.nome.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-auto">
                        <p className="text-lg font-semibold leading-6 text-gray-900">{p.nome}</p>
                        <p className="mt-1 truncate text-sm leading-5 text-gray-500">CPF/CNPJ: {p.cpf_cnpj}</p>
                        {p.email && (
                          <p className="mt-0.5 truncate text-xs leading-5 text-gray-500 flex items-center gap-1">
                            <Mail size={12} className="text-gray-400" /> {p.email}
                          </p>
                        )}
                        <p className="mt-1 truncate text-xs leading-5 text-emerald-700 font-medium bg-emerald-50 inline-block px-3 py-1 rounded-full">
                            📍 {p.municipio || 'Não informado'} - {p.uf || '---'}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-x-4">
                        <Link 
                          href={`/?editar_produtor=${p.id}`} 
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Editar Produtor"
                        >
                          <Edit2 size={18} />
                        </Link>
                        <Link 
                        href={`/produtor/${p.id}`} 
                        className="text-emerald-600 font-semibold text-sm hover:text-emerald-800 flex items-center gap-1.5 group-hover:underline"
                        >
                        Acessar Perfil
                        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                        </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
        
        <footer className="mt-16 pt-10 border-t border-gray-100 text-center text-gray-500">
            <p>&copy; 2026 Contador da Roça Soluções Rurais. Todos os direitos reservados.</p>
            <p className='mt-1 text-sm'>Desenvolvido com Next.js e Tailwind CSS.</p>
        </footer>
      </div>

      {/* MODAL DE EDIÇÃO DE PRODUTOR */}
      {produtorEditando && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">Editar Produtor Rural</h2>
              <Link href="/" className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</Link>
            </div>

            <form action={atualizarProdutor} className="p-8 space-y-4 max-h-[80vh] overflow-y-auto">
              <input type="hidden" name="id" value={produtorEditando.id} />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo / Razão Social *</label>
                <input 
                  type="text" 
                  name="nome" 
                  defaultValue={produtorEditando.nome} 
                  required 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#1e5631]" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CPF / CNPJ *</label>
                  <input 
                    type="text" 
                    name="cpf_cnpj" 
                    defaultValue={produtorEditando.cpf_cnpj} 
                    required 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#1e5631]" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input 
                    type="text" 
                    name="telefone" 
                    defaultValue={produtorEditando.telefone || ''} 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#1e5631]" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <input 
                  type="email" 
                  name="email" 
                  defaultValue={produtorEditando.email || ''} 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#1e5631]" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Município</label>
                  <input 
                    type="text" 
                    name="municipio" 
                    defaultValue={produtorEditando.municipio || ''} 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#1e5631]" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">UF</label>
                  <input 
                    type="text" 
                    name="uf" 
                    maxLength={2} 
                    defaultValue={produtorEditando.uf || ''} 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#1e5631]" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Produção Principal</label>
                <select 
                  name="tipo_producao" 
                  defaultValue={produtorEditando.tipo_producao || 'Misto'} 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 outline-none bg-white focus:ring-2 focus:ring-emerald-100 focus:border-[#1e5631]"
                >
                  {tiposProducao.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Link href="/" className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition">
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
    </main>
  );
}