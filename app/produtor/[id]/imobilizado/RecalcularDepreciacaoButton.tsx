'use client';

import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';

export default function RecalcularDepreciacaoButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.refresh()}
      className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 transition"
      title="Recalcular depreciação"
    >
      <RefreshCw size={18} />
    </button>
  );
}
