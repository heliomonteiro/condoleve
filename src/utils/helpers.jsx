/* eslint-disable react-refresh/only-export-components */
import React, { useEffect } from 'react';
import { Droplets, Zap, Leaf, Sparkles, Wrench, Tags } from 'lucide-react';
import { safeStr } from './formatters';

export * from './formatters';

export const useMetaTags = (config) => {
  useEffect(() => {
    if (!config?.predioNome) return;
    document.title = `${config.predioNome} - CondoLeve`;
  }, [config?.predioNome]);
};

export const getIconeCategoria = (categoria) => {
  const cat = safeStr(categoria).toLowerCase();
  if (cat.includes('água') || cat.includes('agua')) {
    return <Droplets size={16} className="text-blue-500" />;
  }
  if (cat.includes('luz') || cat.includes('energia')) {
    return <Zap size={16} className="text-yellow-500" />;
  }
  if (cat.includes('jardin')) {
    return <Leaf size={16} className="text-green-500" />;
  }
  if (cat.includes('limpeza')) {
    return <Sparkles size={16} className="text-purple-500" />;
  }
  if (cat.includes('manuten')) {
    return <Wrench size={16} className="text-slate-500" />;
  }
  return <Tags size={16} className="text-slate-400" />;
};
