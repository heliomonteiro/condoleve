import React, { useState } from 'react';
import { Crown, CheckCircle2, Sparkles, ShieldCheck, X, ArrowRight, Building2 } from 'lucide-react';
import { PLANS, PRO_HIGHLIGHTS, getCheckoutLink } from '../../config/plans';
import { formatarMoeda } from '../../utils/helpers';

export function ModalUpgradePlano({
  onClose,
  motivo = null,
  subscription,
  condominioNome,
  condominioId,
}) {
  const [ciclo, setCiclo] = useState('anual');
  const precoExibido =
    ciclo === 'anual' ? PLANS.pro.priceYearlyMonthlyEq : PLANS.pro.priceMonthly;

  const abrirCheckout = () => {
    const url = getCheckoutLink(condominioNome, condominioId, ciclo);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 bg-[#1e293b]/90 z-[10020] flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm text-left">
      <div className="bg-white rounded-t-[32px] sm:rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in duration-200 max-h-[92vh] flex flex-col">
        {/* Header escuro premium */}
        <div className="bg-[#1e293b] text-white p-6 relative overflow-hidden shrink-0">
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-[#84cc16]/20 rounded-full blur-2xl pointer-events-none" />
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 bg-white/10 rounded-full hover:bg-white/20 transition"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>

          <div className="inline-flex items-center gap-1.5 bg-[#84cc16]/20 text-[#a3e635] border border-[#84cc16]/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
            <Crown size={12} /> CondoLeve Pro
          </div>

          <h3 className="text-2xl font-black leading-tight">
            {motivo || 'Desbloqueie a Gestão Completa do Seu Prédio'}
          </h3>
          <p className="text-xs text-slate-300 mt-1.5 font-medium leading-relaxed">
            10x mais barato que uma administradora tradicional — menos de R$ 2,50 por apartamento em um prédio de 20 unidades.
          </p>

          {subscription?.isTrial && (
            <div className="mt-3 bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-[11px] font-bold text-lime-300 flex items-center justify-between">
              <span>Degustação ativa: restam {subscription.trialDaysLeft} dias</span>
              <span>IA: {subscription.aiUsed}/{subscription.planConfig.limits.maxAiCreditsPerMonth}</span>
            </div>
          )}
        </div>

        {/* Corpo com comparativo e benefícios */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Seletor Anual vs Mensal */}
          <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1">
            <button
              type="button"
              onClick={() => setCiclo('anual')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 ${
                ciclo === 'anual'
                  ? 'bg-white text-[#1e293b] shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Anual <span className="bg-green-100 text-green-700 text-[9px] px-2 py-0.5 rounded-full">-20% OFF</span>
            </button>
            <button
              type="button"
              onClick={() => setCiclo('mensal')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition ${
                ciclo === 'mensal'
                  ? 'bg-white text-[#1e293b] shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Mensal (Sem fidelidade)
            </button>
          </div>

          {/* Card de Preço */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Valor único por condomínio
              </p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-3xl font-black text-[#1e293b]">
                  {formatarMoeda(precoExibido)}
                </span>
                <span className="text-xs font-bold text-slate-400">/mês</span>
              </div>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                {ciclo === 'anual'
                  ? `Cobrado anualmente (${formatarMoeda(precoExibido * 12)}/ano) • Economia de R$ 120`
                  : 'Cancele quando quiser, seus dados nunca são apagados'}
              </p>
            </div>
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-[10px] font-bold text-slate-400 line-through">
                Administradora: R$ 800/mês
              </span>
              <span className="text-xs font-black text-green-600 flex items-center gap-1 mt-1">
                <Building2 size={14} /> Pode entrar como despesa do prédio!
              </span>
            </div>
          </div>

          {/* Lista de benefícios Pro */}
          <div className="space-y-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles size={12} className="text-[#84cc16]" /> Tudo do plano Grátis + Recursos Pro:
            </p>
            {PRO_HIGHLIGHTS.map((item) => (
              <div key={item.key} className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-[#84cc16] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-black text-slate-800 leading-tight">{item.title}</p>
                  <p className="text-[11px] text-slate-500 leading-snug">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rodapé CTA */}
        <div className="p-5 bg-slate-50 border-t border-slate-100 shrink-0 space-y-2">
          <button
            type="button"
            onClick={abrirCheckout}
            className="w-full bg-[#84cc16] hover:bg-[#a3e635] text-[#1e293b] py-4 rounded-2xl font-black text-xs uppercase tracking-wider shadow-xl transition active:scale-95 flex items-center justify-center gap-2"
          >
            ATIVAR CONDOLEVE PRO AGORA <ArrowRight size={16} />
          </button>
          <p className="text-[10px] text-center text-slate-400 font-bold flex items-center justify-center gap-1">
            <ShieldCheck size={12} className="text-green-600" /> Pagamento via PIX ou Cartão • Nota fiscal p/ prestação de contas
          </p>
        </div>
      </div>
    </div>
  );
}
