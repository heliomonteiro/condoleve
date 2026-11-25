import React, { useEffect } from 'react';
import { Droplets, Zap, Leaf, Sparkles, Wrench, Tags } from 'lucide-react';

export const CHART_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#f43f5e', '#84cc16'];
export const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
export const CATEGORIAS_PADRAO = ['Água', 'Luz', 'Limpeza', 'Manutenção', 'Jardinagem', 'Administrativo', 'Outros', 'Fundo de Reserva'];

export const INFO_UTEIS_PADRAO = [
    { id: '1', nome: 'Polícia Militar', numero: '190' },
    { id: '2', nome: 'SAMU (Ambulância)', numero: '192' },
    { id: '3', nome: 'Corpo de Bombeiros', numero: '193' },
    { id: '4', nome: 'WiFi Salão de Festas', numero: 'Senha: 123' }
];

export const safeStr = (val) => val ? String(val) : "";
export const safeNum = (val) => Number(val) || 0;
export const formatarMoeda = (val) => safeNum(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const formatarInteiro = (val) => Math.round(safeNum(val)).toLocaleString('pt-BR');
export const generateId = () => crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + Math.random().toString().slice(2);

export const gerarHashVerificador = (unidadeId, valor, dataStr) => {
    const rawStr = `${unidadeId}-${valor}-${dataStr}-${Date.now()}`;
    let hash = 0;
    for (let i = 0; i < rawStr.length; i++) {
        const char = rawStr.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    const hex = Math.abs(hash).toString(16).toUpperCase();
    const timestamp = Date.now().toString(36).toUpperCase();
    return `${hex.slice(0, 4)}-${timestamp.slice(-4)}`; 
};

export const getMonthKey = (mesStr, anoNum) => parseInt(anoNum) * 100 + MESES.indexOf(mesStr);
export const getAbsoluteMonthIndex = (year, month) => year * 12 + month;

export const maskPhone = (v) => {
    if (!v) return "";
    v = v.replace(/\D/g, "");
    if (v.length <= 11) v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
    if (v.length <= 11) v = v.replace(/(\d)(\d{4})$/, "$1-$2");
    return v.substring(0, 15);
};

export const useMetaTags = (config) => {
  useEffect(() => {
    if (!config?.predioNome) return;
    document.title = `${config.predioNome} - CondoLeve`;
  }, [config?.predioNome]);
};

export const getIconeCategoria = (categoria) => {
  const cat = safeStr(categoria).toLowerCase();
  if (cat.includes('água') || cat.includes('agua')) return <Droplets size={16} className="text-blue-500"/>;
  if (cat.includes('luz') || cat.includes('energia')) return <Zap size={16} className="text-yellow-500"/>;
  if (cat.includes('jardin')) return <Leaf size={16} className="text-green-500"/>;
  if (cat.includes('limpeza')) return <Sparkles size={16} className="text-purple-500"/>;
  if (cat.includes('manuten')) return <Wrench size={16} className="text-slate-500"/>;
  return <Tags size={16} className="text-slate-400"/>;
};
