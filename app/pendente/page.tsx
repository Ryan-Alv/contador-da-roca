import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import LogoutButton from '@/components/LogoutButton';
import { Clock } from 'lucide-react';

export default async function AcessoPendentePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect('/login');

  // Se o usuário já tem acesso normal, não faz sentido ficar aqui.
  if (session.user.role === 'ADMIN') redirect('/');
  if (session.user.produtorId) redirect(`/produtor/${session.user.produtorId}`);

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-5">
          <Clock className="text-amber-500" size={26} />
        </div>
        <h1 className="text-lg font-bold text-gray-900 mb-2">Acesso ainda não liberado</h1>
        <p className="text-sm text-gray-600 leading-relaxed mb-1">
          Sua conta (<span className="font-medium text-gray-800">{session.user.email}</span>) foi
          criada, mas ainda não está vinculada a nenhum produtor.
        </p>
        <p className="text-sm text-gray-600 leading-relaxed mb-6">
          Fale com o administrador do sistema para que ele vincule seu login ao seu cadastro de
          produtor rural.
        </p>
        <LogoutButton className="inline-flex items-center gap-2 text-sm font-semibold text-red-500 hover:text-red-700 transition mx-auto" />
      </div>
    </main>
  );
}
