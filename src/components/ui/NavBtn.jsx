import React from 'react';

export const NavBtn = ({ active, onClick, icon, label, badgeCount }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-1 min-w-[58px] min-h-[48px] px-1 rounded-xl transition relative ${
      active
        ? 'text-[#1e293b] font-black bg-[#84cc16]/15'
        : 'text-slate-500 hover:text-slate-800'
    }`}
  >
    <div className={`relative ${active ? 'text-[#65a30d]' : ''}`}>
      {icon}
      {badgeCount > 0 && (
        <span className="absolute -top-1.5 -right-2.5 bg-red-600 text-white text-[10px] font-black min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full border-2 border-white">
          {badgeCount}
        </span>
      )}
    </div>
    <span className="text-[10px] font-black uppercase tracking-tight leading-none">{label}</span>
  </button>
);
