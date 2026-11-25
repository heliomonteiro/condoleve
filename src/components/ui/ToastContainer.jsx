import React from 'react';
import { XCircle, CheckCircle, X } from 'lucide-react';
import { safeStr } from '../../utils/helpers';
import { useAuth } from '../../contexts/AuthContext';

export const ToastContainer = () => {
  const { toasts, removeToast } = useAuth();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-0 right-0 z-[10050] flex flex-col items-center gap-2 pointer-events-none px-4 no-print">
      {toasts.map(t => (
        <div key={t.id} className={`pointer-events-auto animate-in slide-in-from-top-2 fade-in duration-300 shadow-2xl rounded-2xl px-6 py-4 flex items-center gap-3 min-w-[300px] max-w-sm border ${t.type === 'error' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-[#1e293b] border-slate-800 text-white'}`}>
          {t.type === 'error' ? <XCircle size={20}/> : <CheckCircle size={20} className="text-[#84cc16]"/>}
          <span className="font-bold text-xs flex-1 text-left">{safeStr(t.msg)}</span>
          <button onClick={() => removeToast(t.id)}>
            <X size={14} className="opacity-50 hover:opacity-100"/>
          </button>
        </div>
      ))}
    </div>
  );
};
