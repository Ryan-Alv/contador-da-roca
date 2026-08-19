'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

export default function LogoutButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: '/login' })}
      className={
        className ??
        'flex items-center gap-2 text-sm font-semibold text-red-500 hover:text-red-700 transition'
      }
    >
      <LogOut size={16} /> Sair
    </button>
  );
}
