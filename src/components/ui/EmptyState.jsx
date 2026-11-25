import React from 'react';

export const EmptyState = ({ icon: Icon, title, desc, action, label }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center px-4 bg-white rounded-3xl border-2 border-dashed border-slate-100">
        <div className="bg-slate-50 p-4 rounded-full mb-4 text-slate-300">
            <Icon size={32} />
        </div>
        <h3 className="font-black text-slate-700 text-sm mb-1">{title}</h3>
        <p className="text-xs text-slate-400 max-w-[200px] mb-6 leading-relaxed">{desc}</p>
        {action && (
            <button 
                onClick={action} 
                className="bg-[#1e293b] text-white px-6 py-3 rounded-xl font-black text-xs shadow-lg hover:bg-black transition"
            >
                {label}
            </button>
        )}
    </div>
);
