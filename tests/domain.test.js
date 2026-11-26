import test from 'node:test';
import assert from 'node:assert/strict';

import {
  toCents,
  fromCents,
  getFeeForCompetencia,
  calculateDelinquency,
  calculateDashboardMetrics,
} from '../src/utils/accounting.js';
import { resolveSubscriptionStatus, canUseFeature } from '../src/config/plans.js';
import { maskPhone } from '../src/utils/formatters.js';
import { translateError } from '../src/utils/errorTranslator.js';

test('Aritmética em centavos elimina erros de ponto flutuante (0.1 + 0.2)', () => {
  const soma = fromCents(toCents(0.1) + toCents(0.2));
  assert.equal(soma, 0.3);
  assert.equal(fromCents(toCents(199.9) * 3), 599.7);
});

test('Histórico de vigência da taxa preserva meses antigos após reajuste', () => {
  const historico = [
    { competencia_inicio: '2026-01', valor: 200 },
    { competencia_inicio: '2026-11', valor: 280 },
  ];

  // Outubro/2026 (mês 9 zero-based) deve continuar R$ 200
  assert.equal(getFeeForCompetencia(2026, 9, historico, 280), 200);
  // Novembro/2026 (mês 10 zero-based) aplica o novo valor R$ 280
  assert.equal(getFeeForCompetencia(2026, 10, historico, 280), 280);
});

test('Inadimplência respeita isenção do síndico e histórico de taxas', () => {
  const now = new Date();
  const mesAtualIdx = now.getMonth();
  const anoAtual = now.getFullYear();
  const compAtual = `${anoAtual}-${String(mesAtualIdx + 1).padStart(2, '0')}`;

  const unidades = [
    { id: 'u-sindico', numero: '101', isento_taxa: true },
    { id: 'u-em-dia', numero: '102', isento_taxa: false },
    { id: 'u-parcial', numero: '103', isento_taxa: false },
  ];

  const mesNome = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ][mesAtualIdx];

  const pagamentos = [
    { unidade_id: 'u-em-dia', mes: mesNome, ano: anoAtual, valor: 250 },
    { unidade_id: 'u-parcial', mes: mesNome, ano: anoAtual, valor: 100 },
  ];

  const inadimplentes = calculateDelinquency({
    unidades,
    pagamentos,
    config: { valorCondominio: 250, inicioOperacao: compAtual },
    historicoTaxas: [{ competencia_inicio: compAtual, valor: 250 }],
  });

  // Síndico (101) e morador em dia (102) não podem aparecer como devedores
  assert.equal(inadimplentes.length, 1);
  assert.equal(inadimplentes[0].unidade.numero, '103');
  assert.equal(inadimplentes[0].mesesAtraso, 1);
  assert.equal(inadimplentes[0].valorTotalDevido, 150);
});

test('Dashboard não desconta despesas ainda pendentes do saldo real em caixa', () => {
  const metrics = calculateDashboardMetrics({
    unidades: [
      { id: '1', numero: '101', isento_taxa: true },
      { id: '2', numero: '102', isento_taxa: false },
    ],
    pagamentos: [{ unidade_id: '2', mes: 'Novembro', ano: 2026, valor: 200 }],
    despesas: [
      { id: 'd1', mes: 'Novembro', ano: 2026, valor: 80, pago: true, categoria: 'Água' },
      { id: 'd2', mes: 'Novembro', ano: 2026, valor: 50, pago: false, categoria: 'Luz' },
    ],
    mesAtual: 'Novembro',
    anoAtual: 2026,
    config: { valorCondominio: 200, saldoInicial: 1000 },
    historicoTaxas: [],
  });

  assert.equal(metrics.potencialMes, 200); // Apenas 1 unidade pagante (101 é isenta)
  assert.equal(metrics.receitaMes, 200);
  assert.equal(metrics.gastoMes, 130); // Total lançado no mês (80 + 50)
  assert.equal(metrics.gastoPagoMes, 80); // Apenas pago
  assert.equal(metrics.saldoTotalReal, 1120); // 1000 + 200 - 80 (ignora os 50 pendentes)
});

test('Motor de Planos: Trial expirado faz downgrade suave para Free sem perder dados', () => {
  const pastDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
  const subExpirada = resolveSubscriptionStatus(
    { plano: 'trial', status: 'ativo', trial_ate: pastDate, creditos_ia_usados: 2 },
    12 // 12 unidades (> 8 do plano Free)
  );

  assert.equal(subExpirada.effectivePlan, 'free');
  assert.equal(subExpirada.isPro, false);
  assert.equal(subExpirada.overUnitLimit, true);
  assert.equal(canUseFeature(subExpirada, 'upload'), false);
  assert.equal(canUseFeature(subExpirada, 'ai'), false);
  assert.equal(canUseFeature(subExpirada, 'inadimplencia'), false);

  const subPro = resolveSubscriptionStatus(
    { plano: 'pro', status: 'ativo', creditos_ia_usados: 10, arquivos_mes_usados: 5 },
    24
  );
  assert.equal(subPro.effectivePlan, 'pro');
  assert.equal(subPro.isPro, true);
  assert.equal(subPro.overUnitLimit, false);
  assert.equal(canUseFeature(subPro, 'upload'), true);
  assert.equal(canUseFeature(subPro, 'ai'), true);
  assert.equal(canUseFeature(subPro, 'inadimplencia'), true);
});

test('Utilitários de usabilidade: máscara de telefone e tradutor de erros em português', () => {
  assert.equal(maskPhone('11988887777'), '(11) 98888-7777');
  assert.match(
    translateError(new Error('Invalid login credentials')),
    /E-mail ou senha incorretos/
  );
  assert.match(translateError('Failed to fetch'), /Sem conexão com a internet/);
});
