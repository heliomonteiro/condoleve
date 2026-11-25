import React from 'react';

export const NavBtn = ({ active, onClick, icon, label, badgeCount }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition relative ${active ? 'text-[#84cc16] scale-110' : 'text-slate-400 hover:text-slate-600'}`}>
      <div className="relative">
          {icon}
          {badgeCount > 0 && <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[8px] font-black w-3.5 h-3.5 flex items-center justify-center rounded-full border border-white">{badgeCount}</span>}
      </div>
      <span className="text-[9px] font-black uppercase tracking-wide">{label}</span>
  </button>
);
