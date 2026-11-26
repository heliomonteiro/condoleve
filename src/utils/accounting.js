import { MESES, safeNum, getAbsoluteMonthIndex, getMonthKey } from './formatters.js';

/**
 * Aritmética em centavos inteiros para eliminar erros de ponto flutuante (ex: 0.1 + 0.2).
 */
export const toCents = (val) => Math.round(safeNum(val) * 100);
export const fromCents = (cents) => Math.round(cents) / 100;

export function sumPaymentsCents(pagamentos = []) {
  return pagamentos.reduce((acc, p) => acc + toCents(p.valor), 0);
}

/**
 * Retorna a taxa condominial vigente em uma determinada competência (ano, monthIndex 0..11),
 * consultando `historicoTaxas` ordenado por `competencia_inicio` ('YYYY-MM').
 */
export function getFeeForCompetencia(year, monthZeroBased, historicoTaxas = [], valorPadraoAtual = 0) {
  const targetKey = `${year}-${String(monthZeroBased + 1).padStart(2, '0')}`;
  if (!historicoTaxas || historicoTaxas.length === 0) {
    return safeNum(valorPadraoAtual);
  }

  const sorted = [...historicoTaxas].sort((a, b) =>
    String(a.competencia_inicio).localeCompare(String(b.competencia_inicio))
  );

  let applicable = null;
  for (const item of sorted) {
    if (String(item.competencia_inicio) <= targetKey) {
      applicable = Number(item.valor);
    } else {
      break;
    }
  }

  return applicable !== null ? applicable : safeNum(sorted[0]?.valor ?? valorPadraoAtual);
}

/**
 * Soma os rateios / cotas extras aplicáveis a uma unidade em determinado mês/ano.
 */
export function getExtraChargesCentsForUnit(rateiosExtras = [], mesStr, anoNum, isUnidadeIsenta = false) {
  let totalCents = 0;
  for (const r of rateiosExtras) {
    if (r.mes === mesStr && String(r.ano) === String(anoNum)) {
      if (!isUnidadeIsenta || r.incluir_isentos) {
        totalCents += toCents(r.valor_por_unidade);
      }
    }
  }
  return totalCents;
}

/**
 * Calcula a inadimplência histórica precisa respeitando:
 * 1) Vigência histórica de reajustes da taxa condominial (`historicoTaxas`)
 * 2) Unidades isentas da taxa ordinária (`u.isento_taxa === true`, ex: apto do síndico)
 * 3) Rateios / cotas extras cadastrados na competência
 * 4) Aritmética exata em centavos
 */
export function calculateDelinquency({
  unidades = [],
  pagamentos = [],
  config = {},
  historicoTaxas = [],
  rateiosExtras = [],
}) {
  const devedoresGlobais = [];
  const valorAtual = safeNum(config.valorCondominio);
  if (
    valorAtual <= 0 &&
    (!historicoTaxas || historicoTaxas.length === 0) &&
    (!rateiosExtras || rateiosExtras.length === 0)
  ) {
    return devedoresGlobais;
  }

  const now = new Date();
  const defaultInicio = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [startYearStr, startMonthStr] = (config.inicioOperacao || defaultInicio).split('-');
  const startIndex = getAbsoluteMonthIndex(
    parseInt(startYearStr, 10),
    parseInt(startMonthStr, 10) - 1
  );
  const currentRealIndex = getAbsoluteMonthIndex(now.getFullYear(), now.getMonth());

  const paymentCentsMap = new Map();
  for (const p of pagamentos) {
    const key = `${p.unidade_id}|${p.mes}|${p.ano}`;
    paymentCentsMap.set(key, (paymentCentsMap.get(key) || 0) + toCents(p.valor));
  }

  for (const u of unidades) {
    let mesesAtraso = 0;
    let totalDevidoCents = 0;

    for (let idx = startIndex; idx <= currentRealIndex; idx++) {
      const iterYear = Math.floor(idx / 12);
      const iterMonthZero = idx % 12;
      const iterMonthStr = MESES[iterMonthZero];

      const taxaOrdinariaCents = u.isento_taxa
        ? 0
        : toCents(getFeeForCompetencia(iterYear, iterMonthZero, historicoTaxas, valorAtual));
      const extrasMesCents = getExtraChargesCentsForUnit(
        rateiosExtras,
        iterMonthStr,
        iterYear,
        Boolean(u.isento_taxa)
      );

      const devidoMesCents = taxaOrdinariaCents + extrasMesCents;
      if (devidoMesCents <= 0) continue;

      const pagoCents = paymentCentsMap.get(`${u.id}|${iterMonthStr}|${iterYear}`) || 0;
      if (pagoCents < devidoMesCents) {
        mesesAtraso++;
        totalDevidoCents += devidoMesCents - pagoCents;
      }
    }

    if (mesesAtraso > 0 && totalDevidoCents > 0) {
      devedoresGlobais.push({
        unidade: u,
        mesesAtraso,
        valorTotalDevido: fromCents(totalDevidoCents),
      });
    }
  }

  return devedoresGlobais;
}

/**
 * Calcula todos os indicadores do Dashboard em centavos inteiros.
 */
export function calculateDashboardMetrics({
  unidades = [],
  despesas = [],
  pagamentos = [],
  mesAtual,
  anoAtual,
  config = {},
  historicoTaxas = [],
  rateiosExtras = [],
}) {
  const mesIdx = Math.max(0, MESES.indexOf(mesAtual));
  const taxaVigenteMes = getFeeForCompetencia(
    Number(anoAtual),
    mesIdx,
    historicoTaxas,
    config.valorCondominio
  );

  let potencialCents = 0;
  for (const u of unidades) {
    const ordinaria = u.isento_taxa ? 0 : toCents(taxaVigenteMes);
    const extras = getExtraChargesCentsForUnit(
      rateiosExtras,
      mesAtual,
      anoAtual,
      Boolean(u.isento_taxa)
    );
    potencialCents += ordinaria + extras;
  }
  const potencialMes = fromCents(potencialCents);

  const recCents = pagamentos
    .filter((p) => p.mes === mesAtual && String(p.ano) === String(anoAtual))
    .reduce((acc, p) => acc + toCents(p.valor), 0);

  const dpsSelecionado = despesas.filter(
    (d) => d.mes === mesAtual && String(d.ano) === String(anoAtual)
  );
  const gasCents = dpsSelecionado.reduce((acc, d) => acc + toCents(d.valor), 0);
  const gasPagoCents = dpsSelecionado
    .filter((d) => d.pago !== false)
    .reduce((acc, d) => acc + toCents(d.valor), 0);

  const catMapCents = {};
  dpsSelecionado.forEach((d) => {
    const cat = d.categoria || 'Outros';
    catMapCents[cat] = (catMapCents[cat] || 0) + toCents(d.valor);
  });
  const gastosPorCategoria = Object.keys(catMapCents)
    .map((c) => ({ name: c, value: fromCents(catMapCents[c]) }))
    .sort((a, b) => b.value - a.value);

  const saldoInicialCents = toCents(config.saldoInicial);
  const totalEntradasAllCents = pagamentos.reduce((acc, p) => acc + toCents(p.valor), 0);
  const totalSaidasAllCents = despesas
    .filter((d) => d.pago !== false)
    .reduce((acc, d) => acc + toCents(d.valor), 0);
  const saldoTotalReal = fromCents(
    saldoInicialCents + totalEntradasAllCents - totalSaidasAllCents
  );

  const selectedMonthKey = getMonthKey(mesAtual, anoAtual);
  const entradasAteSelCents = pagamentos
    .filter((p) => getMonthKey(p.mes, p.ano) <= selectedMonthKey)
    .reduce((acc, p) => acc + toCents(p.valor), 0);
  const saidasAteSelCents = despesas
    .filter((d) => d.pago !== false && getMonthKey(d.mes, d.ano) <= selectedMonthKey)
    .reduce((acc, d) => acc + toCents(d.valor), 0);
  const saldoAteMesSelecionado = fromCents(
    saldoInicialCents + entradasAteSelCents - saidasAteSelCents
  );

  const historicoEvolutivo = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(Number(anoAtual), mesIdx - i, 1);
    const mStr = MESES[d.getMonth()];
    const aNum = d.getFullYear();
    const loopKey = getMonthKey(mStr, aNum);

    const recMesLoop = fromCents(
      pagamentos
        .filter((p) => p.mes === mStr && String(p.ano) === String(aNum))
        .reduce((acc, p) => acc + toCents(p.valor), 0)
    );
    const despMesLoop = fromCents(
      despesas
        .filter((x) => x.pago !== false && x.mes === mStr && String(x.ano) === String(aNum))
        .reduce((acc, x) => acc + toCents(x.valor), 0)
    );

    const entAteLoopCents = pagamentos
      .filter((p) => getMonthKey(p.mes, p.ano) <= loopKey)
      .reduce((acc, p) => acc + toCents(p.valor), 0);
    const saiAteLoopCents = despesas
      .filter((x) => x.pago !== false && getMonthKey(x.mes, x.ano) <= loopKey)
      .reduce((acc, x) => acc + toCents(x.valor), 0);

    historicoEvolutivo.push({
      mesLabel: `${mStr.slice(0, 3).toUpperCase()}/${String(aNum).slice(2, 4)}`,
      receita: recMesLoop,
      despesa: despMesLoop,
      saldoFinal: fromCents(saldoInicialCents + entAteLoopCents - saiAteLoopCents),
    });
  }

  return {
    taxaVigenteMes,
    receitaMes: fromCents(recCents),
    gastoMes: fromCents(gasCents),
    gastoPagoMes: fromCents(gasPagoCents),
    despesasFiltradas: dpsSelecionado,
    gastosPorCategoria,
    saldoTotalReal,
    saldoAteMesSelecionado,
    historicoEvolutivo,
    potencialMes,
  };
}
