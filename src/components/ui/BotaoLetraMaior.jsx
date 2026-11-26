import React from 'react';
import { Type } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function BotaoLetraMaior({ variant = 'dark' }) {
  const { letraGrande, toggleLetraGrande } = useAuth();

  const styles =
    variant === 'light'
      ? letraGrande
        ? 'bg-[#84cc16] text-[#1e293b] border-[#84cc16]'
        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
      : letraGrande
      ? 'bg-[#84cc16] text-[#1e293b] border-[#84cc16]'
      : 'bg-white/10 text-white border-white/15 hover:bg-white/20';

  return (
    <button
      type="button"
      onClick={toggleLetraGrande}
      title={letraGrande ? 'Voltar ao tamanho normal de letra' : 'Aumentar tamanho das letras'}
      aria-label={letraGrande ? 'Diminuir tamanho da letra' : 'Aumentar tamanho da letra'}
      className={`min-h-[44px] min-w-[48px] px-3 py-2 rounded-xl border text-xs font-black transition flex items-center justify-center gap-1.5 ${styles}`}
    >
      <Type size={15} />
      <span>{letraGrande ? 'A-' : 'A+'}</span>
    </button>
  );
}
