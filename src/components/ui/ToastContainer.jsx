import React from 'react';
import { XCircle, CheckCircle, X } from 'lucide-react';
import { safeStr } from '../../utils/helpers';
import { useAuth } from '../../contexts/AuthContext';

export const ToastContainer = () => {
  const { toasts, removeToast } = useAuth();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-[10050] flex flex-col items-center gap-2 pointer-events-none px-4 no-print">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          aria-live="polite"
          className={`pointer-events-auto animate-in slide-in-from-top-2 fade-in duration-300 shadow-2xl rounded-2xl pl-5 pr-2 py-2.5 flex items-center gap-3 min-w-[290px] max-w-sm border ${
            t.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-[#1e293b] border-slate-800 text-white'
          }`}
        >
          {t.type === 'error' ? (
            <XCircle size={20} className="shrink-0" />
          ) : (
            <CheckCircle size={20} className="text-[#84cc16] shrink-0" />
          )}
          <span className="font-bold text-xs flex-1 text-left leading-snug">{safeStr(t.msg)}</span>
          <button
            type="button"
            onClick={() => removeToast(t.id)}
            aria-label="Fechar aviso"
            className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl opacity-70 hover:opacity-100 hover:bg-black/10 transition shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};
