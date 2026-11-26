// ============================================================================
// CondoLeve — Matriz Comercial, Planos, Cotas e Unit Economics
// ============================================================================
// Regra de Ouro de Sustentabilidade (Unit Economics):
// - Plano FREE consome APENAS linhas leves de texto no PostgreSQL (~custo zero),
//   sem gastar Storage de arquivos nem chamadas contínuas de IA.
// - Todo condomínio novo ganha 30 dias de TRIAL PRO automático (sem cartão)
//   para experimentar o efeito "Uau" completo antes de decidir assinar.
// - Se não assinar após 30 dias, entra em downgrade suave (nunca perde dados!).

export const TRIAL_DAYS = 30;

export const PLANS = {
  free: {
    id: 'free',
    name: 'CondoLeve Grátis',
    badge: 'GRÁTIS',
    priceMonthly: 0,
    priceYearlyMonthlyEq: 0,
    tagline: 'Para micro-prédios saírem do caderninho sem custo.',
    limits: {
      maxUnits: 8,
      maxStorageUploadsPerMonth: 0, // Zero impacto no limite de 1GB do Supabase Free
      maxAiCreditsPerMonth: 0,
      allowInadimplenciaAcumulada: false,
      allowWhatsAppCobranca1Click: false,
      allowOfficialReportExport: false,
      allowEnquetes: false,
      allowBackupJson: false,
      allowConselhoFiscal: false,
    },
  },
  trial: {
    id: 'trial',
    name: 'Degustação Pro (30 dias)',
    badge: 'TRIAL PRO',
    priceMonthly: 0,
    priceYearlyMonthlyEq: 0,
    tagline: 'Acesso completo liberado para testar no seu prédio.',
    limits: {
      maxUnits: 30,
      maxStorageUploadsPerMonth: 30, // Protege contra abuso em contas teste (~3MB c/ WebP)
      maxAiCreditsPerMonth: 10,      // 10 usos grátis p/ o síndico ver a mágica da IA
      allowInadimplenciaAcumulada: true,
      allowWhatsAppCobranca1Click: true,
      allowOfficialReportExport: true,
      allowEnquetes: true,
      allowBackupJson: true,
      allowConselhoFiscal: true,
    },
  },
  pro: {
    id: 'pro',
    name: 'CondoLeve Pro',
    badge: 'PRO',
    priceMonthly: 29.9,
    priceYearlyMonthlyEq: 24.9,
    tagline: 'Gestão completa para prédios de até 30 unidades.',
    limits: {
      maxUnits: 30,
      maxStorageUploadsPerMonth: 300, // ~30MB/mês em WebP -> altíssima margem
      maxAiCreditsPerMonth: 150,      // Custo real Gemini Flash < R$ 0,60/mês
      allowInadimplenciaAcumulada: true,
      allowWhatsAppCobranca1Click: true,
      allowOfficialReportExport: true,
      allowEnquetes: true,
      allowBackupJson: true,
      allowConselhoFiscal: true,
    },
  },
  enterprise: {
    id: 'enterprise',
    name: 'CondoLeve Mais (31+ aptos)',
    badge: 'EM BREVE',
    comingSoon: true,
    priceMonthly: null,
    priceYearlyMonthlyEq: null,
    tagline: 'Para condomínios maiores, múltiplos blocos e gestão sob medida.',
    limits: {
      maxUnits: 999,
      maxStorageUploadsPerMonth: 1000,
      maxAiCreditsPerMonth: 500,
      allowInadimplenciaAcumulada: true,
      allowWhatsAppCobranca1Click: true,
      allowOfficialReportExport: true,
      allowEnquetes: true,
      allowBackupJson: true,
      allowConselhoFiscal: true,
    },
  },
};

export const PRO_HIGHLIGHTS = [
  {
    key: 'unidades',
    title: 'Até 30 apartamentos',
    desc: 'Ideal para pequenos condomínios. Para 31+ unidades, conheça o plano CondoLeve Mais (Em breve).',
  },
  {
    key: 'cobranca',
    title: 'Régua de Inadimplência & Cobrança 1-Clique',
    desc: 'Cálculo automático de cotas atrasadas e envio direto no WhatsApp com chave PIX.',
  },
  {
    key: 'anexos',
    title: 'Notas Fiscais, Comprovantes e Fotos na Nuvem',
    desc: 'Anexe boletos, comprovantes PIX e fotos de manutenção com compressão inteligente.',
  },
  {
    key: 'ia',
    title: 'Assistente IA (Zero Digitação)',
    desc: 'Tire foto da conta para preencher sozinho e reescreva avisos em tom diplomático.',
  },
  {
    key: 'relatorios',
    title: 'Prestação de Contas Oficial + Excel + Conselho',
    desc: 'Infográfico mensal pronto para WhatsApp, exportação CSV/Excel e perfil Conselheiro.',
  },
  {
    key: 'enquetes',
    title: 'Votações Digitais Auditáveis (1 voto por Apto)',
    desc: 'Decisões rápidas sem precisar marcar reunião presencial para tudo.',
  },
];

/**
 * Resolve o estado efetivo da assinatura do condomínio a partir do registro
 * em `assinaturas_condominio` ou fallback seguro baseado na data de criação.
 */
export function resolveSubscriptionStatus(assinatura, unidadesCount = 0) {
  const now = new Date();

  // Se já for assinante Pro ativo
  if (assinatura?.plano === 'pro' && assinatura?.status === 'ativo') {
    const updatedAt = assinatura.atualizado_em ? new Date(assinatura.atualizado_em) : null;
    let proRenewDaysLeft = null;
    if (updatedAt && !Number.isNaN(updatedAt.getTime())) {
      const nextCycleEnd = new Date(updatedAt.getTime() + 30 * 24 * 60 * 60 * 1000);
      const diffDays = Math.ceil((nextCycleEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 5) {
        proRenewDaysLeft = diffDays;
      }
    }
    return {
      effectivePlan: 'pro',
      planConfig: PLANS.pro,
      isPro: true,
      isTrial: false,
      trialDaysLeft: 0,
      trialExpired: false,
      proRenewDaysLeft,
      isPaymentOverdue: false,
      aiUsed: Number(assinatura.creditos_ia_usados || 0),
      uploadsUsed: Number(assinatura.arquivos_mes_usados || 0),
      overUnitLimit: unidadesCount > PLANS.pro.limits.maxUnits,
    };
  }

  // Verifica janela de Trial (padrão: 30 dias a partir de trial_ate ou hoje se recém-criado)
  let trialEnd = null;
  if (assinatura?.trial_ate) {
    trialEnd = new Date(assinatura.trial_ate);
  } else if (!assinatura) {
    // Fallback enquanto a migration ainda não foi aplicada no banco remoto:
    // mantém experiência funcional em modo Trial para não travar condomínios atuais
    trialEnd = new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
  }

  const msLeft = trialEnd ? trialEnd.getTime() - now.getTime() : -1;
  const trialDaysLeft = msLeft > 0 ? Math.ceil(msLeft / (1000 * 60 * 60 * 24)) : 0;
  const inTrial = assinatura?.plano !== 'free_forcar' && trialDaysLeft > 0;

  const activePlanKey = inTrial ? 'trial' : 'free';
  const planConfig = PLANS[activePlanKey];

  return {
    effectivePlan: activePlanKey,
    planConfig,
    isPro: inTrial, // Durante o trial, recursos Pro ficam liberados dentro das cotas de trial
    isTrial: inTrial,
    trialDaysLeft,
    trialExpired: !inTrial && Boolean(assinatura?.trial_ate),
    proRenewDaysLeft: null,
    isPaymentOverdue: assinatura?.plano === 'pro' && assinatura?.status === 'atrasado',
    aiUsed: Number(assinatura?.creditos_ia_usados || 0),
    uploadsUsed: Number(assinatura?.arquivos_mes_usados || 0),
    overUnitLimit: unidadesCount > planConfig.limits.maxUnits,
  };
}

export function canUseFeature(subscriptionState, featureName) {
  const limits = subscriptionState?.planConfig?.limits || PLANS.free.limits;
  switch (featureName) {
    case 'upload':
      return (
        limits.maxStorageUploadsPerMonth > 0 &&
        subscriptionState.uploadsUsed < limits.maxStorageUploadsPerMonth
      );
    case 'ai':
      return (
        limits.maxAiCreditsPerMonth > 0 &&
        subscriptionState.aiUsed < limits.maxAiCreditsPerMonth
      );
    case 'inadimplencia':
      return Boolean(limits.allowInadimplenciaAcumulada);
    case 'cobranca_whatsapp':
      return Boolean(limits.allowWhatsAppCobranca1Click);
    case 'relatorio_oficial':
      return Boolean(limits.allowOfficialReportExport);
    case 'enquetes':
      return Boolean(limits.allowEnquetes);
    case 'backup':
      return Boolean(limits.allowBackupJson);
    case 'conselho':
      return Boolean(limits.allowConselhoFiscal);
    default:
      return true;
  }
}

export function getCheckoutLink(condominioNome = '', condominioId = '', ciclo = 'mensal') {
  const customCheckout = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_CHECKOUT_URL : '';
  if (customCheckout) {
    const sep = customCheckout.includes('?') ? '&' : '?';
    return `${customCheckout}${sep}condominio_id=${encodeURIComponent(condominioId)}&ciclo=${encodeURIComponent(ciclo)}`;
  }
  const comercialPhone = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_COMERCIAL_WHATSAPP) || '5534999358189';
  const msg = `Olá! Quero ativar o *CondoLeve Pro (${ciclo})* para o condomínio *${condominioNome || 'Meu Condomínio'}* (ID: ${condominioId}).`;
  return `https://wa.me/${comercialPhone}?text=${encodeURIComponent(msg)}`;
}
