import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { ArrowLeft, Users } from 'lucide-react';

export default function NovoProdutorPage() {
  async function cadastrarProdutor(formData: FormData) {
    'use server'
    const nome = formData.get('nome') as string;
    const cpf_cnpj = formData.get('cpf_cnpj') as string;
    const telefone = formData.get('telefone') as string;
    const email = formData.get('email') as string;
    const municipio = formData.get('municipio') as string;
    const uf = formData.get('uf') as string;
    const tipo_producao = formData.get('tipo_producao') as string;

    if (!nome || !cpf_cnpj) return;

    await prisma.produtores.create({
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

  const tiposProducao = [
    { value: 'Misto', label: 'Misto' },
    { value: 'Lavoura', label: 'Lavoura' },
    { value: 'Pecu_ria', label: 'Pecuária' }, // mantém o value compatível com o enum atual
    { value: 'Suinocultura', label: 'Suinocultura' },
    { value: 'Silvicultura', label: 'Silvicultura' },
    { value: 'Avicultura', label: 'Avicultura' }
  ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden relative">
      <aside className="w-80 bg-[#1e5631] text-white flex flex-col justify-between p-6 shadow-xl">
        <div>
          <Link href="/" className="flex items-center gap-2 text-emerald-200 text-sm font-medium mb-8 hover:text-white transition">
            <ArrowLeft size={16} /> Voltar ao Painel
          </Link>

          <div className="bg-[#174426] p-4 rounded-2xl flex items-center gap-3 mb-8 border border-emerald-800/50">
            <div className="bg-emerald-900/80 p-3 rounded-xl text-emerald-300">
              <Users size={24} />
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight text-white">Novo Produtor</h2>
              <p className="text-xs text-emerald-300 mt-0.5">Cadastro rural</p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-emerald-900/50 mt-4">
          <p className="text-[10px] text-emerald-300 font-semibold uppercase tracking-wider">Base normativa</p>
          <p className="text-[11px] text-emerald-200 mt-0.5">NBC TG 29 • CPC 29 • SRF 83/2001</p>
        </div>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Cadastrar Novo Produtor</h1>
              <p className="text-gray-500 text-sm mt-0.5">Preencha as informações do produtor rural.</p>
            </div>
            <Link href="/" className="text-gray-400 hover:text-gray-600 font-bold text-xl">✕</Link>
          </div>

          <form action={cadastrarProdutor} className="p-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo / Razão Social *</label>
              <input type="text" name="nome" required placeholder="Ex: João da Silva" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#1e5631]" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CPF / CNPJ *</label>
                <input type="text" name="cpf_cnpj" required placeholder="Ex: 123.456.789-00" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#1e5631]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input type="text" name="telefone" placeholder="Ex: (11) 99999-9999" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#1e5631]" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input type="email" name="email" placeholder="Ex: contato@fazenda.com" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#1e5631]" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Município</label>
                <input type="text" name="municipio" placeholder="Ex: Sorriso" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#1e5631]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">UF</label>
                <input type="text" name="uf" maxLength={2} placeholder="Ex: MT" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 outline-none focus:ring-2 focus:ring-emerald-100 focus:border-[#1e5631]" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Produção Principal</label>
              <select name="tipo_producao" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 outline-none bg-white focus:ring-2 focus:ring-emerald-100 focus:border-[#1e5631]">
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
                Salvar Produtor
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}