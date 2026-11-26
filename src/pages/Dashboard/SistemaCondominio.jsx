import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Home,
  CheckCircle,
  Settings,
  MessageCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  PieChart as PieChartIcon,
  PlusCircle,
  TrendingUp,
  TrendingDown,
  Printer,
  AlertTriangle,
  History,
  Wrench,
  Megaphone,
  Pencil,
  Eye,
  EyeOff,
  RotateCcw,
  Search,
  Crown,
  Paperclip,
  ThumbsUp,
  UserPlus,
  FileCheck,
  Grid,
  FileBarChart,
  Target,
  Vote,
  Contact,
  MonitorPlay,
  BadgeAlert,
  LineChart,
  Edit,
  Trash2,
  Check,
  Lock,
  ShieldCheck,
  Sparkles,
  BookOpen,
  LogOut,
  Coins,
  BookMarked,
} from 'lucide-react';
import { Logo } from '../../components/ui/Logo';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { NavBtn } from '../../components/ui/NavBtn';
import { BotaoLetraMaior } from '../../components/ui/BotaoLetraMaior';
import { ModalGuiaCondominio } from '../../components/legal/ModalGuiaCondominio';
import { ModoMorador } from '../Resident/ModoMorador';
import { ModalUpgradePlano } from '../../components/billing/ModalUpgradePlano';
import {
  ModalConfirmacao,
  ModalInstalarApp,
  ModalReceber,
  ModalDetalhesUnidade,
  ModalReciboVisual,
  ModalDespesa,
  ModalRelatorio,
} from '../../features/modals/FinanceModals';
import {
  ModalEditarUnidade,
  ModalManutencao,
  ModalAvisos,
  ModalEnquete,
  ModalTelefonesUteis,
  ModalFilaAprovacao,
  ModalConfiguracoes,
  ModalNovaUnidade,
  ModalAuditoria,
} from '../../features/modals/ManagementModals';
import {
  ModalRateioExtra,
  ModalConvencaoAssembleia,
} from '../../features/modals/Phase2Modals';
import {
  safeStr,
  safeNum,
  formatarMoeda,
  formatarInteiro,
  generateId,
  gerarHashVerificador,
  useMetaTags,
  getIconeCategoria,
  CATEGORIAS_PADRAO,
  INFO_UTEIS_PADRAO,
  CHART_COLORS,
  MESES,
} from '../../utils/helpers';
import { calculateDelinquency, calculateDashboardMetrics } from '../../utils/accounting';
import { deleteCondoDocument } from '../../lib/storage';
import { resolveSubscriptionStatus, canUseFeature } from '../../config/plans';

const generateConicGradient = (data, total) => {
  if (total === 0) return 'conic-gradient(#f1f5f9 0% 100%)';
  let gradient = 'conic-gradient(';
  let start = 0;
  data.forEach((item, index) => {
    const percentage = (item.value / total) * 100;
    gradient += `${CHART_COLORS[index % CHART_COLORS.length]} ${start}% ${start + percentage}%, `;
    start += percentage;
  });
  return gradient.slice(0, -2) + ')';
};

export function SistemaCondominio({
  supabase,
  session,
  contexto,
  onSwitch,
  onLogout,
  showToast,
}) {
  const [loading, setLoading] = useState(true);
  const cId = contexto.condominio_id || 'default';

  const isSindico = contexto.role === 'sindico' || contexto.role === 'admin';
  const isConselheiro = contexto.role === 'conselheiro';
  const isGestorOuConselho = isSindico || isConselheiro;

  const [abaAtiva, setAbaAtiva] = useState(isGestorOuConselho ? 'caixa' : 'mural');

  const [unidades, setUnidades] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [pagamentos, setPagamentos] = useState([]);
  const [patrimonio, setPatrimonio] = useState([]);
  const [avisos, setAvisos] = useState([]);
  const [enquetes, setEnquetes] = useState([]);
  const [convitesPendentes, setConvitesPendentes] = useState([]);
  const [historicoTaxas, setHistoricoTaxas] = useState([]);
  const [rateiosExtras, setRateiosExtras] = useState([]);
  const [assinaturaDb, setAssinaturaDb] = useState(null);

  const [config, setConfig] = useState({
    valorCondominio: 200,
    sindicaNome: 'Síndico(a)',
    predioNome: 'CondoLeve',
    chavePix: '',
    saldoInicial: 0,
    inicioOperacao: '',
    categorias: CATEGORIAS_PADRAO,
    telefonesUteis: INFO_UTEIS_PADRAO,
    telefoneSindico: '',
  });

  const [mesAtual, setMesAtual] = useState(() => MESES[new Date().getMonth()]);
  const [anoAtual, setAnoAtual] = useState(() => new Date().getFullYear());
  const [busca, setBusca] = useState('');
  const [filtroCategoriaDespesa, setFiltroCategoriaDespesa] = useState('Todas');
  const [modoPrivacidade, setModoPrivacidade] = useState(false);

  // Modais
  const [modalPagamento, setModalPagamento] = useState(null);
  const [modalDetalhesUnidade, setModalDetalhesUnidade] = useState(null);
  const [modalReciboVisual, setModalReciboVisual] = useState(null);
  const [modalEditar, setModalEditar] = useState(null);
  const [modalNovaUnidade, setModalNovaUnidade] = useState(false);
  const [modalAuditoria, setModalAuditoria] = useState(false);
  const [modalGuia, setModalGuia] = useState(false);
  const [modalRateio, setModalRateio] = useState(false);
  const [modalConvencao, setModalConvencao] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [modalConfig, setModalConfig] = useState(false);
  const [modalNovaDespesa, setModalNovaDespesa] = useState(false);
  const [modalEditarDespesa, setModalEditarDespesa] = useState(null);
  const [modalRelatorio, setModalRelatorio] = useState(false);
  const [modalManutencao, setModalManutencao] = useState(false);
  const [modalAvisos, setModalAvisos] = useState(false);
  const [modalEnquete, setModalEnquete] = useState(false);
  const [modalTelefones, setModalTelefones] = useState(false);
  const [modalInstalar, setModalInstalar] = useState(false);
  const [modalFila, setModalFila] = useState(false);
  const [modalUpgradeMotivo, setModalUpgradeMotivo] = useState(null);
  const [confirmacao, setConfirmacao] = useState(null);
  const [printMode, setPrintMode] = useState(null);

  const [modoMorador, setModoMorador] = useState(!isGestorOuConselho);
  const [unidadeMorador, setUnidadeMorador] = useState(
    contexto.unidades ? { ...contexto.unidades, id: contexto.unidade_id } : null
  );

  useMetaTags(config);

  const subscription = useMemo(
    () => resolveSubscriptionStatus(assinaturaDb, unidades.length),
    [assinaturaDb, unidades.length]
  );

  const solicitarUpgrade = useCallback((motivo) => {
    setModalUpgradeMotivo(motivo || 'Ative o CondoLeve Pro para liberar todos os recursos.');
  }, []);

  const carregarDados = useCallback(async () => {
    setLoading(true);
    try {
      // Segregação LGPD & Performance: Morador só busca seus próprios registros e dados coletivos!
      const unidadesQuery = isGestorOuConselho
        ? supabase.from('unidades').select('*').eq('condominio_id', cId)
        : supabase
            .from('unidades')
            .select('*')
            .eq('condominio_id', cId)
            .eq('id', contexto.unidade_id);

      const pagamentosQuery = isGestorOuConselho
        ? supabase.from('pagamentos').select('*').eq('condominio_id', cId)
        : supabase
            .from('pagamentos')
            .select('*')
            .eq('condominio_id', cId)
            .eq('unidade_id', contexto.unidade_id);

      const despesasQuery = isGestorOuConselho
        ? supabase.from('despesas').select('*').eq('condominio_id', cId)
        : Promise.resolve({ data: [] });

      const convitesQuery = isSindico
        ? supabase.from('convites').select('*').eq('condominio_id', cId).eq('status', 'pendente')
        : Promise.resolve({ data: [] });

      const [
        resUnidades,
        resPagamentos,
        resDespesas,
        resAvisos,
        resZeladoria,
        resEnquetes,
        resConfig,
        resConvites,
        resTaxas,
        resAssinatura,
        resRateios,
      ] = await Promise.all([
        unidadesQuery,
        pagamentosQuery,
        despesasQuery,
        supabase.from('avisos').select('*').eq('condominio_id', cId),
        supabase.from('zeladoria').select('*').eq('condominio_id', cId),
        supabase.from('enquetes').select('*').eq('condominio_id', cId),
        supabase.from('config_geral').select('*').eq('condominio_id', cId).maybeSingle(),
        convitesQuery,
        supabase.from('historico_taxas').select('*').eq('condominio_id', cId),
        supabase.from('assinaturas_condominio').select('*').eq('condominio_id', cId).maybeSingle(),
        supabase.from('rateios_extras').select('*').eq('condominio_id', cId),
      ]);

      if (resUnidades.data) {
        const sorted = [...resUnidades.data].sort((a, b) =>
          String(a.numero).localeCompare(String(b.numero), undefined, { numeric: true })
        );
        setUnidades(sorted);
        if (!isGestorOuConselho && sorted[0]) {
          setUnidadeMorador(sorted[0]);
        }
      }
      if (resPagamentos.data) setPagamentos(resPagamentos.data);
      if (resDespesas.data) setDespesas(resDespesas.data);
      if (resAvisos.data) setAvisos(resAvisos.data);
      if (resZeladoria.data) setPatrimonio(resZeladoria.data);
      if (resEnquetes.data) setEnquetes(resEnquetes.data);
      if (resTaxas && !resTaxas.error && resTaxas.data) setHistoricoTaxas(resTaxas.data);
      if (resRateios && !resRateios.error && resRateios.data) setRateiosExtras(resRateios.data);
      if (resAssinatura && !resAssinatura.error && resAssinatura.data) {
        setAssinaturaDb(resAssinatura.data);
      }

      if (resConvites.data) {
        setConvitesPendentes(
          resConvites.data.map((c) => ({
            id: c.id,
            userId: c.user_id,
            numero: c.numero_unidade,
            email: c.email,
            data: new Date(c.criado_em).toLocaleDateString('pt-BR'),
          }))
        );
      }

      if (resConfig.data) {
        const dadosMesclados = { ...resConfig.data.dados };
        if (!dadosMesclados.telefonesUteis) dadosMesclados.telefonesUteis = INFO_UTEIS_PADRAO;
        if (!dadosMesclados.inicioOperacao) {
          const d = new Date();
          dadosMesclados.inicioOperacao = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
            2,
            '0'
          )}`;
        }
        setConfig((prev) => ({ ...prev, ...dadosMesclados }));
      }
    } catch (error) {
      console.error(error);
      showToast('Erro de conexão ao carregar dados.', 'error');
    } finally {
      setLoading(false);
    }
  }, [cId, contexto.unidade_id, isGestorOuConselho, isSindico, showToast, supabase]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const exportarCSV = () => {
    let csv = 'Data,Tipo,Descricao,Categoria,Valor\n';
    pagamentos.forEach((p) => {
      const uni = unidades.find((u) => u.id === p.unidade_id)?.numero || '?';
      csv += `"${p.data}",Receita,"Apto ${uni}",Taxa Condominial,${p.valor}\n`;
    });
    despesas
      .filter((d) => d.pago !== false)
      .forEach((d) => {
        csv += `"${d.data}",Despesa,"${String(d.descricao).replace(/"/g, '""')}","${
          d.categoria
        }",${d.valor}\n`;
      });
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Relatorio_${config.predioNome}_${mesAtual}_${anoAtual}.csv`;
    a.click();
  };

  const exportarBackup = () => {
    try {
      const backupData = {
        geradoEm: new Date().toISOString(),
        config,
        unidades,
        pagamentos,
        despesas,
        patrimonio,
        avisos,
        enquetes,
      };
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Backup_CondoLeve_${config.predioNome}_${
        new Date().toISOString().split('T')[0]
      }.json`;
      a.click();
      showToast('Backup (JSON) exportado com sucesso!');
    } catch {
      showToast('Erro ao exportar backup.', 'error');
    }
  };

  const resetarSistema = async (silent = false) => {
    if (!isSindico) return;
    setLoading(true);
    try {
      const { error: rpcErr } = await supabase.rpc('excluir_condominio_completo', {
        p_condominio_id: cId,
      });

      if (rpcErr) {
        await Promise.all([
          supabase.from('pagamentos').delete().eq('condominio_id', cId),
          supabase.from('despesas').delete().eq('condominio_id', cId),
          supabase.from('avisos').delete().eq('condominio_id', cId),
          supabase.from('zeladoria').delete().eq('condominio_id', cId),
          supabase.from('enquetes').delete().eq('condominio_id', cId),
          supabase.from('unidades').delete().eq('condominio_id', cId),
          supabase.from('config_geral').delete().eq('condominio_id', cId),
          supabase.from('vinculos').delete().eq('condominio_id', cId),
        ]);
        await supabase.from('condominios').delete().eq('id', cId);
      }

      if (!silent) {
        showToast('Condomínio resetado completamente.');
        setModalConfig(false);
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (e) {
      if (!silent) showToast('Erro ao resetar: ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const adicionarPagamento = async (unidadeId, valor, data, urlComprovante) => {
    if (!isSindico) return;
    const hashGerado = gerarHashVerificador(unidadeId, valor, data);
    const novo = {
      user_id: session.user.id,
      condominio_id: cId,
      unidade_id: unidadeId,
      valor,
      data,
      mes: mesAtual,
      ano: anoAtual,
      url_comprovante: urlComprovante,
      hash_recibo: hashGerado,
    };
    const { data: dbData, error } = await supabase
      .from('pagamentos')
      .insert(novo)
      .select()
      .single();
    if (error) showToast('Erro ao salvar recebimento.', 'error');
    else {
      setPagamentos((prev) => [...prev, dbData]);
      if (urlComprovante) {
        setAssinaturaDb((prev) =>
          prev ? { ...prev, arquivos_mes_usados: (prev.arquivos_mes_usados || 0) + 1 } : prev
        );
      }
      showToast('Pagamento registrado com sucesso!');
    }
  };

  const removerPagamento = async (pagamentoId) => {
    if (!isSindico) return;
    const item = pagamentos.find((x) => x.id === pagamentoId);
    if (item && item.url_comprovante) deleteCondoDocument(supabase, item.url_comprovante);
    setPagamentos((prev) => prev.filter((p) => p.id !== pagamentoId));
    await supabase.from('pagamentos').delete().eq('id', pagamentoId);
    showToast('Pagamento removido do extrato.');
  };

  const atualizarComprovantePagamento = async (pagamentoId, novaUrl) => {
    if (!isSindico) return;
    setPagamentos((prev) =>
      prev.map((p) => (p.id === pagamentoId ? { ...p, url_comprovante: novaUrl } : p))
    );
    await supabase.from('pagamentos').update({ url_comprovante: novaUrl }).eq('id', pagamentoId);
    setAssinaturaDb((prev) =>
      prev ? { ...prev, arquivos_mes_usados: (prev.arquivos_mes_usados || 0) + 1 } : prev
    );
    showToast('Comprovante anexado ao pagamento!');
  };

  const fmt = (val) => formatarMoeda(val);
  const fmtPriv = (val) => (modoPrivacidade ? 'R$ •••••' : formatarMoeda(val));

  const enviarReciboWhatsApp = (pagamento, unidade) => {
    const hashExibicao = pagamento.hash_recibo || 'N/A';
    const texto = `🧾 *RECIBO DE PAGAMENTO*\n\n🏢 Condomínio: *${config.predioNome}*\n🏠 Unidade: *${unidade.numero}*\n💰 Valor Recebido: *${fmt(pagamento.valor)}*\n📅 Data de Pagamento: *${pagamento.data}*\n\n✅ Pagamento confirmado pelo síndico.\n🔐 Autenticidade: ${hashExibicao}\n\n_Gerado pelo CondoLeve • https://condoleve.drafthub.com.br_`;
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
  };

  const adicionarUnidade = async (novaUnidade) => {
    if (!isSindico) return;
    const { data, error } = await supabase
      .from('unidades')
      .insert({ ...novaUnidade, user_id: session.user.id, condominio_id: cId })
      .select()
      .single();
    if (error) {
      if (error.message?.includes('Limite de')) {
        solicitarUpgrade(error.message);
      } else {
        showToast(error.message || 'Erro ao criar apartamento.', 'error');
      }
      return;
    }
    setUnidades((prev) =>
      [...prev, data].sort((a, b) =>
        String(a.numero).localeCompare(String(b.numero), undefined, { numeric: true })
      )
    );
    setModalNovaUnidade(false);
    showToast(`Apto ${data.numero} adicionado!`);
  };

  const abrirAuditoria = async () => {
    setModalAuditoria(true);
    setLoadingAudit(true);
    try {
      const { data } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('condominio_id', cId)
        .order('criado_em', { ascending: false })
        .limit(40);
      setAuditLogs(data || []);
    } catch {
      setAuditLogs([]);
    } finally {
      setLoadingAudit(false);
    }
  };

  const salvarNovaDespesa = async (despesaData, isRepetir) => {
    if (!isSindico) return;
    const dadosSafe = { ...despesaData };
    delete dadosSafe.repetir;

    const baseDespesa = { ...dadosSafe, user_id: session.user.id, condominio_id: cId };
    const [y, m] = baseDespesa.data.split('-');
    const ano = parseInt(y, 10);
    const despesasParaInserir = [
      {
        ...baseDespesa,
        mes: MESES[parseInt(m, 10) - 1],
        ano,
        data: baseDespesa.data.split('-').reverse().join('/'),
      },
    ];

    if (isRepetir) {
      const [anoInt, mesInt, diaInt] = baseDespesa.data.split('-').map(Number);
      for (let i = mesInt + 1; i <= 12; i++) {
        despesasParaInserir.push({
          ...baseDespesa,
          mes: MESES[i - 1],
          ano: anoInt,
          data: `${String(diaInt).padStart(2, '0')}/${String(i).padStart(2, '0')}/${anoInt}`,
          pago: false,
        });
      }
    }

    const { data: inserted, error } = await supabase
      .from('despesas')
      .insert(despesasParaInserir)
      .select();
    if (error) {
      showToast(`Falha ao salvar despesa: ${error.message}`, 'error');
    } else {
      setDespesas((prev) => [...prev, ...inserted]);
      if (dadosSafe.url_comprovante) {
        setAssinaturaDb((prev) =>
          prev ? { ...prev, arquivos_mes_usados: (prev.arquivos_mes_usados || 0) + 1 } : prev
        );
      }
      showToast('Despesa lançada com sucesso!');
      setModalNovaDespesa(false);
    }
  };

  const editarDespesa = async (d) => {
    if (!isSindico) return;
    const dadosSafe = { ...d };
    delete dadosSafe.repetir;

    setDespesas((prev) => prev.map((x) => (x.id === dadosSafe.id ? { ...x, ...dadosSafe } : x)));
    const { error } = await supabase.from('despesas').update(dadosSafe).eq('id', dadosSafe.id);
    if (error) {
      showToast(`Erro ao editar: ${error.message}`, 'error');
    } else {
      showToast('Despesa atualizada com sucesso.');
    }
  };

  const apagarDespesa = async (id) => {
    if (!isSindico) return;
    const item = despesas.find((x) => x.id === id);
    if (item && item.url_comprovante) deleteCondoDocument(supabase, item.url_comprovante);
    await supabase.from('despesas').delete().eq('id', id);
    setDespesas((prev) => prev.filter((x) => x.id !== id));
    showToast('Despesa excluída.');
  };

  const salvarAviso = async (item) => {
    if (!isSindico) return;
    const { data, error } = await supabase
      .from('avisos')
      .insert({ ...item, user_id: session.user.id, condominio_id: cId })
      .select()
      .single();
    if (!error) {
      setAvisos((prev) => [data, ...prev]);
      showToast('Aviso publicado!');
    } else {
      showToast('Erro: ' + error.message, 'error');
    }
  };

  const apagarAviso = async (id) => {
    if (!isSindico) return;
    await supabase.from('avisos').delete().eq('id', id);
    setAvisos((prev) => prev.filter((a) => a.id !== id));
    showToast('Aviso excluído.');
  };

  const salvarEnquete = async (item) => {
    if (!isSindico) return;
    const { data, error } = await supabase
      .from('enquetes')
      .insert({ ...item, user_id: session.user.id, condominio_id: cId })
      .select()
      .single();
    if (!error) {
      setEnquetes((prev) => [data, ...prev]);
      showToast('Votação criada!');
    } else {
      showToast('Erro: ' + error.message, 'error');
    }
  };

  const registrarVotoEnquete = async (enqueteId, voto, unidadeId) => {
    // 1. Tenta RPC atômica no servidor (sem race condition)
    const { data: rpcOpcoes, error: rpcErr } = await supabase.rpc('votar_enquete', {
      p_enquete_id: enqueteId,
      p_unidade_id: unidadeId,
      p_opcao: voto,
    });

    if (!rpcErr && rpcOpcoes) {
      setEnquetes((prev) =>
        prev.map((x) => (x.id === enqueteId ? { ...x, opcoes: rpcOpcoes } : x))
      );
      showToast('Voto computado com segurança!');
      return;
    }

    // 2. Fallback caso a migration 000002 ainda não esteja ativa no banco remoto
    const e = enquetes.find((x) => x.id === enqueteId);
    if (!e) return;
    const novaOpcoes = { sim: 0, nao: 0, votosDetalhados: {}, votaram: [], ...e.opcoes };
    const votoAnterior = novaOpcoes.votosDetalhados[unidadeId];
    if (votoAnterior === voto) return;

    if (votoAnterior) novaOpcoes[votoAnterior] = Math.max(0, novaOpcoes[votoAnterior] - 1);
    novaOpcoes[voto] = (novaOpcoes[voto] || 0) + 1;
    novaOpcoes.votosDetalhados[unidadeId] = voto;
    if (!novaOpcoes.votaram.includes(unidadeId)) novaOpcoes.votaram.push(unidadeId);

    setEnquetes((prev) =>
      prev.map((x) => (x.id === enqueteId ? { ...x, opcoes: novaOpcoes } : x))
    );
    const { error } = await supabase
      .from('enquetes')
      .update({ opcoes: novaOpcoes })
      .eq('id', enqueteId);
    if (error) showToast('Erro ao registrar voto.', 'error');
    else showToast(votoAnterior ? 'Voto alterado!' : 'Voto computado com sucesso!');
  };

  const apagarEnquete = async (id) => {
    if (!isSindico) return;
    await supabase.from('enquetes').delete().eq('id', id);
    setEnquetes((prev) => prev.filter((e) => e.id !== id));
    showToast('Enquete excluída.');
  };

  const encerrarEnquete = async (id) => {
    if (!isSindico) return;
    await supabase.from('enquetes').update({ ativa: false }).eq('id', id);
    setEnquetes((prev) => prev.map((e) => (e.id === id ? { ...e, ativa: false } : e)));
    showToast('Votação encerrada!');
  };

  const abrirChamadoManutencao = async (item) => {
    const { data, error } = await supabase
      .from('zeladoria')
      .insert({ ...item, user_id: session.user.id, condominio_id: cId })
      .select()
      .single();
    if (!error) {
      setPatrimonio((prev) => [data, ...prev]);
      showToast('Chamado aberto!');
    } else {
      showToast('Erro: ' + error.message, 'error');
    }
  };

  const toggleStatusManutencao = async (id, concluido) => {
    if (!isSindico) return;
    const status = concluido ? 'concluido' : 'aberto';
    setPatrimonio((prev) => prev.map((p) => (p.id === id ? { ...p, concluido, status } : p)));
    const { error } = await supabase.from('zeladoria').update({ concluido, status }).eq('id', id);
    if (error) {
      await supabase.from('zeladoria').update({ concluido }).eq('id', id);
    }
    showToast(concluido ? 'Chamado resolvido!' : 'Chamado reaberto.');
  };

  const atualizarChamadoManutencao = async (id, updates) => {
    if (!isSindico) return;
    setPatrimonio((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    const { error } = await supabase.from('zeladoria').update(updates).eq('id', id);
    if (error) {
      // Fallback caso a migration 20261126000000 ainda não tenha sido rodada no banco
      await supabase.from('zeladoria').update({ concluido: Boolean(updates.concluido) }).eq('id', id);
      showToast(
        'Status básico salvo. Execute a migration 20261126000000 no Supabase para salvar respostas e status Em Andamento.',
        'error'
      );
      return;
    }
    showToast('Chamado atualizado!');
  };

  const criarRateiosExtras = async (itens) => {
    if (!isSindico) return;
    const rows = itens.map((it) => ({
      ...it,
      condominio_id: cId,
      user_id: session.user.id,
    }));
    const { data, error } = await supabase.from('rateios_extras').insert(rows).select();
    if (error) {
      showToast(
        error.message?.includes('rateios_extras')
          ? 'Execute a migration 20261126000000 no Supabase para ativar Rateios/Cotas Extras.'
          : error.message,
        'error'
      );
      return;
    }
    setRateiosExtras((prev) => [...prev, ...(data || [])]);
    showToast('Rateio / Cota Extra lançado com sucesso!');
  };

  const apagarRateioExtra = async (id) => {
    if (!isSindico) return;
    await supabase.from('rateios_extras').delete().eq('id', id);
    setRateiosExtras((prev) => prev.filter((r) => r.id !== id));
    showToast('Rateio removido.');
  };

  const apagarManutencao = async (id) => {
    if (!isSindico) return;
    const item = patrimonio.find((x) => x.id === id);
    if (item && item.url_foto) deleteCondoDocument(supabase, item.url_foto);
    await supabase.from('zeladoria').delete().eq('id', id);
    setPatrimonio((prev) => prev.filter((p) => p.id !== id));
    showToast('Chamado excluído.');
  };

  const salvarConfig = async (novaConfig) => {
    if (!isSindico) return;
    const valorMudou = Number(novaConfig.valorCondominio) !== Number(config.valorCondominio);
    setConfig(novaConfig);
    await supabase
      .from('config_geral')
      .upsert({ user_id: session.user.id, condominio_id: cId, dados: novaConfig }, { onConflict: 'condominio_id' });

    // Se a mensalidade mudou, grava vigência no histórico de taxas a partir do mês atual para proteger o passado!
    if (valorMudou) {
      const now = new Date();
      const compAtual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const { data: novaVigencia } = await supabase
        .from('historico_taxas')
        .upsert(
          {
            condominio_id: cId,
            competencia_inicio: compAtual,
            valor: Number(novaConfig.valorCondominio),
          },
          { onConflict: 'condominio_id,competencia_inicio' }
        )
        .select()
        .maybeSingle();

      if (novaVigencia) {
        setHistoricoTaxas((prev) => [
          ...prev.filter((t) => t.competencia_inicio !== compAtual),
          novaVigencia,
        ]);
      }
    }

    showToast('Configurações salvas!');
  };

  const processarAprovacao = async (pedido, aprovado, roleEscolhido = 'morador') => {
    if (!isSindico) return;
    setConvitesPendentes((prev) => prev.filter((f) => f.id !== pedido.id));

    const { data: rpcRes, error: rpcErr } = await supabase.rpc('processar_convite_condominio', {
      p_convite_id: pedido.id,
      p_aprovado: aprovado,
      p_role: roleEscolhido,
    });

    if (!rpcErr && rpcRes) {
      if (aprovado && rpcRes.unidade_id && roleEscolhido === 'morador') {
        setUnidades((prev) =>
          prev.map((u) => (u.id === rpcRes.unidade_id ? { ...u, linked_user_id: pedido.userId } : u))
        );
      }
      showToast(
        !aprovado
          ? 'Solicitação rejeitada.'
          : roleEscolhido === 'conselheiro'
          ? 'Aprovado como Conselheiro Fiscal!'
          : `Acesso aprovado para o Apto ${pedido.numero}!`
      );
      return;
    }

    if (aprovado) {
      const unit = unidades.find((u) => u.numero === pedido.numero);
      if (unit || roleEscolhido === 'conselheiro') {
        if (unit && roleEscolhido === 'morador') {
          await supabase
            .from('unidades')
            .update({ linked_user_id: pedido.userId })
            .eq('id', unit.id);
          setUnidades((prev) =>
            prev.map((u) => (u.id === unit.id ? { ...u, linked_user_id: pedido.userId } : u))
          );
        }
        await supabase.from('vinculos').insert({
          user_id: pedido.userId,
          condominio_id: cId,
          role: roleEscolhido,
          unidade_id: unit ? unit.id : null,
        });
        await supabase.from('convites').update({ status: 'aprovado' }).eq('id', pedido.id);
        showToast(
          roleEscolhido === 'conselheiro'
            ? 'Aprovado como Conselheiro Fiscal!'
            : `Acesso aprovado para o Apto ${unit.numero}!`
        );
      } else {
        showToast('Unidade não encontrada.', 'error');
      }
    } else {
      await supabase.from('convites').update({ status: 'rejeitado' }).eq('id', pedido.id);
      showToast('Solicitação rejeitada.');
    }
  };

  const getPagamentosMes = (unidade, chave) => {
    const [mes, ano] = chave.split('-');
    return pagamentos.filter(
      (p) => p.unidade_id === unidade.id && p.mes === mes && String(p.ano) === String(ano)
    );
  };
  const calcularTotalPago = (pags) => pags.reduce((acc, p) => acc + safeNum(p.valor), 0);
  const copiarTexto = (txt) => {
    if (!txt) {
      showToast('Chave PIX ainda não cadastrada pelo síndico.', 'error');
      return;
    }
    navigator.clipboard
      .writeText(txt)
      .then(() => showToast('Copiado para a área de transferência!'))
      .catch(() => showToast('Erro ao copiar', 'error'));
  };

  const chaveAtual = `${mesAtual}-${anoAtual}`;

  // Contabilidade e Inadimplência Exatas em Centavos (com histórico de vigência e isenção de síndico)
  const { unidadesFiltradas, inadimplenciaGlobal } = useMemo(() => {
    let uFilter = unidades;
    if (busca) {
      const b = busca.toLowerCase();
      uFilter = uFilter.filter(
        (u) =>
          String(u.numero).toLowerCase().includes(b) ||
          safeStr(u.proprietario?.nome).toLowerCase().includes(b) ||
          safeStr(u.inquilino?.nome).toLowerCase().includes(b)
      );
    }

    const devedoresGlobais = calculateDelinquency({
      unidades,
      pagamentos,
      config,
      historicoTaxas,
      rateiosExtras,
    });

    return { unidadesFiltradas: uFilter, inadimplenciaGlobal: devedoresGlobais };
  }, [unidades, busca, pagamentos, config, historicoTaxas, rateiosExtras]);

  const {
    taxaVigenteMes,
    receitaMes,
    gastoMes,
    gastoPagoMes,
    despesasFiltradas,
    gastosPorCategoria,
    saldoTotalReal,
    saldoAteMesSelecionado,
    historicoEvolutivo,
    potencialMes,
  } = useMemo(
    () =>
      calculateDashboardMetrics({
        unidades,
        despesas,
        pagamentos,
        mesAtual,
        anoAtual,
        config,
        historicoTaxas,
        rateiosExtras,
      }),
    [unidades, despesas, pagamentos, mesAtual, anoAtual, config, historicoTaxas, rateiosExtras]
  );

  const enviarWhatsAppCobranca = (dev) => {
    if (!canUseFeature(subscription, 'cobranca_whatsapp')) {
      solicitarUpgrade('Cobrança automática 1-Clique no WhatsApp é exclusiva do CondoLeve Pro.');
      return;
    }
    const u = dev.unidade;
    const foneRaw = safeStr(
      u.mora_proprietario !== false ? u.proprietario?.telefone : u.inquilino?.telefone
    );
    const foneNumeros = foneRaw.replace(/\D/g, '');

    if (!foneNumeros || foneNumeros.length < 10) {
      showToast('Morador sem WhatsApp válido cadastrado. Edite o Apto primeiro.', 'error');
      return;
    }

    const texto = `🏢 *${config.predioNome}*\n\nOlá, morador(a) do *Apto ${u.numero}*.\n\nConsta em nosso controle o valor em aberto de *${fmt(dev.valorTotalDevido)}* referente a ${dev.mesesAtraso} ${
      dev.mesesAtraso > 1 ? 'cotas condominiais' : 'cota condominial'
    }.\n\n🔑 Chave PIX oficial do condomínio: *${config.chavePix || 'Solicitar à administração'}*\n\nAssim que realizar o pagamento, por gentileza nos encaminhe o comprovante para emitirmos seu recibo digital.\nObrigado!`;
    window.open(`https://wa.me/55${foneNumeros}?text=${encodeURIComponent(texto)}`, '_blank');
  };

  if (loading && unidades.length === 0 && pagamentos.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <RotateCcw className="animate-spin text-[#84cc16]" />
        <p className="ml-4 font-black text-[#1e293b]">Carregando Condomínio...</p>
      </div>
    );
  }

  // MODO IMPRESSÃO DE CARTAZ
  if (printMode === 'cartaz') {
    return (
      <div className="bg-white min-h-screen p-10 font-sans z-[10000] relative">
        <div className="text-center mb-10 border-b-4 border-[#1e293b] pb-6">
          <h1 className="text-5xl font-black text-[#1e293b] uppercase tracking-tighter mb-2">
            Informações Úteis
          </h1>
          <h2 className="text-2xl font-bold text-slate-500">{config.predioNome}</h2>
        </div>
        <div className="grid grid-cols-2 gap-8">
          {config.telefonesUteis &&
            config.telefonesUteis.map((t, idx) => (
              <div key={idx} className="border-2 border-slate-200 p-6 rounded-3xl">
                <p className="text-xl font-black text-slate-400 uppercase tracking-widest mb-2">
                  {t.nome}
                </p>
                <p className="text-3xl font-black text-slate-800 break-words">{t.numero}</p>
              </div>
            ))}
        </div>
        <div className="mt-16 text-center border-t-2 border-slate-100 pt-8">
          <p className="text-lg font-bold text-slate-400">
            Administração: <span className="text-slate-800">{config.sindicaNome}</span> •{' '}
            {config.telefoneSindico}
          </p>
          <div className="mt-8 opacity-50">
            <Logo variant="simple" width="w-40" className="mx-auto" />
          </div>
        </div>
        <div className="fixed bottom-4 left-0 right-0 text-center no-print">
          <button
            type="button"
            onClick={() => setPrintMode(null)}
            className="bg-slate-800 text-white px-6 py-2 rounded-xl font-bold shadow-xl"
          >
            Voltar ao App
          </button>
        </div>
      </div>
    );
  }

  // APP MORADOR
  if (modoMorador && unidadeMorador) {
    return (
      <>
        <ModoMorador
          unidade={unidadeMorador}
          condominioId={cId}
          config={config}
          onExit={() => {
            if (isGestorOuConselho) {
              setModoMorador(false);
              setUnidadeMorador(null);
            } else {
              onSwitch();
            }
          }}
          onLogout={onLogout}
          mesAtual={mesAtual}
          anoAtual={anoAtual}
          getPagamentosMes={getPagamentosMes}
          calcularTotalPago={calcularTotalPago}
          fmt={fmt}
          avisos={avisos}
          enquetes={enquetes}
          patrimonio={patrimonio}
          showToast={showToast}
          copiarTexto={copiarTexto}
          abrirChamado={abrirChamadoManutencao}
          registrarVoto={registrarVotoEnquete}
          modalInstalar={modalInstalar}
          setModalInstalar={setModalInstalar}
          setPrintMode={setPrintMode}
          pagamentosCompletos={pagamentos}
          setModalReciboVisual={setModalReciboVisual}
          supabase={supabase}
          unidadesTotal={unidades.length}
          taxaVigenteMes={taxaVigenteMes}
          rateiosExtras={rateiosExtras}
        />
        {modalReciboVisual && (
          <ModalReciboVisual
            pagamento={modalReciboVisual.pagamento}
            unidade={modalReciboVisual.unidade}
            config={config}
            onClose={() => setModalReciboVisual(null)}
            fmt={fmt}
            enviarWhatsApp={enviarReciboWhatsApp}
            showToast={showToast}
          />
        )}
        {confirmacao && <ModalConfirmacao data={confirmacao} onClose={() => setConfirmacao(null)} />}
      </>
    );
  }

  const maxSaldoEvolucao = Math.max(...historicoEvolutivo.map((h) => h.saldoFinal), 1);
  const filaPendente = convitesPendentes.length;
  const porcentagemArrecadada = potencialMes > 0 ? (receitaMes / potencialMes) * 100 : 0;
  const porcentagemGastoPago = gastoMes > 0 ? (gastoPagoMes / gastoMes) * 100 : 0;
  const allowInadimplencia = canUseFeature(subscription, 'inadimplencia');

  return (
    <div
      className={`min-h-screen bg-slate-50 font-sans text-slate-800 pb-28 overflow-x-hidden ${
        printMode ? 'hidden print:block' : 'print:hidden'
      }`}
    >
      {/* HEADER FIXO SUPERIOR */}
      <div className="bg-[#1e293b] text-white py-3 px-4 flex justify-between items-center sticky top-0 z-40 border-b border-white/5 shadow-xl">
        <div className="flex gap-3 items-center">
          <div className="bg-white p-1 rounded-lg shadow-sm">
            <Logo variant="icon" width="w-8" />
          </div>
          <button
            type="button"
            onClick={onSwitch}
            className="text-left group cursor-pointer hover:opacity-80 transition"
          >
            <span className="font-black text-sm truncate max-w-[140px] sm:max-w-xs leading-tight tracking-tight flex items-center gap-1">
              {safeStr(config.predioNome)}{' '}
              <RotateCcw size={12} className="text-slate-500 group-hover:text-[#84cc16]" />
            </span>
            <span className="text-[10px] text-slate-400 font-bold opacity-80 flex items-center gap-1">
              {isConselheiro ? (
                <>
                  <ShieldCheck size={10} className="text-purple-400" /> Conselho (Leitura)
                </>
              ) : (
                <>
                  <Crown size={10} className="text-[#84cc16]" /> Gestor •{' '}
                  {subscription.planConfig.badge}
                </>
              )}
            </span>
          </button>
        </div>

        <div className="flex gap-1.5 sm:gap-2 items-center">
          <BotaoLetraMaior />
          {isSindico && subscription.effectivePlan !== 'pro' && (
            <button
              type="button"
              onClick={() => solicitarUpgrade()}
              className="bg-gradient-to-r from-[#84cc16] to-[#a3e635] text-[#1e293b] min-h-[38px] py-1.5 px-3 rounded-xl transition flex items-center gap-1 font-black text-xs shadow-md"
            >
              <Sparkles size={13} /> PRO
            </button>
          )}
          {isSindico && filaPendente > 0 && (
            <button
              type="button"
              onClick={() => setModalFila(true)}
              className="relative p-2 bg-red-500 text-white rounded-xl shadow-lg hover:bg-red-600 transition animate-bounce"
            >
              <UserPlus size={18} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-white text-red-500 font-black text-[9px] rounded-full flex items-center justify-center border-2 border-red-500">
                {filaPendente}
              </span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setModalInstalar(true)}
            className="hidden sm:flex bg-[#84cc16]/10 text-[#84cc16] hover:bg-[#84cc16]/20 py-1.5 px-3 rounded-xl transition items-center gap-2 font-black text-[10px]"
          >
            <MonitorPlay size={14} /> INSTALAR
          </button>
          {isSindico && (
            <button
              type="button"
              onClick={() => setModalConfig(true)}
              aria-label="Ajustes e Plano"
              className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition flex items-center gap-2"
            >
              <Settings size={18} />
            </button>
          )}
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              title="Sair da conta"
              aria-label="Sair da conta"
              className="bg-red-500/20 hover:bg-red-500/30 text-red-300 p-2 rounded-xl transition flex items-center gap-1"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </div>

      {/* BANNER CONTEXTUAL DE LIMITE DE UNIDADES OU TRIAL */}
      {isSindico && subscription.overUnitLimit && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2.5 text-xs font-black flex flex-col sm:flex-row items-center justify-center gap-2 text-center">
          <span>
            Seu condomínio possui {unidades.length} unidades (o Plano Grátis suporta até{' '}
            {subscription.planConfig.limits.maxUnits}). Seus dados estão salvos!
          </span>
          <button
            type="button"
            onClick={() =>
              solicitarUpgrade(
                `Condomínios com ${unidades.length} apartamentos utilizam o CondoLeve Pro.`
              )
            }
            className="bg-slate-900 text-white px-3 py-1 rounded-lg text-[10px] uppercase tracking-wider"
          >
            Liberar Unidades no Pro
          </button>
        </div>
      )}

      {/* HEADER PADRÃO */}
      <header className="bg-[#1e293b] text-white pt-6 px-6 pb-12 relative overflow-hidden text-center">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
          <Logo variant="icon" width="w-64" />
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/5 backdrop-blur-md p-2 rounded-2xl flex items-center justify-between border border-white/10 w-full max-w-xs mx-auto mb-4">
            <button
              type="button"
              onClick={() => {
                const idx = MESES.indexOf(mesAtual);
                if (idx > 0) setMesAtual(MESES[idx - 1]);
                else {
                  setAnoAtual(anoAtual - 1);
                  setMesAtual(MESES[11]);
                }
              }}
              className="p-3 hover:bg-white/10 rounded-xl transition"
            >
              <TrendingDown className="rotate-90 w-4 h-4 text-[#84cc16]" />
            </button>
            <div>
              <span className="font-black text-xl tracking-tight uppercase">
                {safeStr(mesAtual)}
              </span>
              <p className="text-[9px] font-bold text-slate-400 tracking-widest leading-none mt-1">
                {safeStr(anoAtual)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const idx = MESES.indexOf(mesAtual);
                if (idx < 11) setMesAtual(MESES[idx + 1]);
                else {
                  setAnoAtual(anoAtual + 1);
                  setMesAtual(MESES[0]);
                }
              }}
              className="p-3 hover:bg-white/10 rounded-xl transition"
            >
              <TrendingUp className="rotate-90 w-4 h-4 text-[#84cc16]" />
            </button>
          </div>

          <div className="flex gap-6 justify-center mt-2 items-center relative">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Entradas</p>
              <p className="font-black text-green-400">{fmtPriv(receitaMes)}</p>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Saídas</p>
              <p className="font-black text-red-400">-{fmtPriv(gastoMes)}</p>
            </div>
            <div className="relative ml-2">
              <button
                type="button"
                onClick={() => setModoPrivacidade(!modoPrivacidade)}
                className={`p-2 rounded-full transition ${
                  modoPrivacidade
                    ? 'bg-[#84cc16] text-[#1e293b]'
                    : 'bg-white/10 text-slate-400 hover:bg-white/20'
                }`}
              >
                {modoPrivacidade ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 relative z-10 -mt-8">
        {/* ABA RECEITAS */}
        {abaAtiva === 'receitas' && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <Card className="p-6 bg-white border-l-[6px] border-l-[#84cc16] shadow-xl flex flex-col sm:flex-row justify-between items-center text-left gap-4">
              <div className="w-full sm:w-1/2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                  <ArrowUpCircle size={14} className="text-[#84cc16]" /> Arrecadação de {mesAtual}
                </p>
                <div className="flex items-end gap-2 mb-3">
                  <p className="text-3xl font-black text-[#84cc16]">{fmtPriv(receitaMes)}</p>
                  <p className="text-xs font-bold text-slate-400 mb-1">/ {fmtPriv(potencialMes)}</p>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden relative">
                  <div
                    className="bg-[#84cc16] h-full absolute top-0 left-0 transition-all duration-500"
                    style={{ width: `${Math.min(porcentagemArrecadada, 100)}%` }}
                  />
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto flex-1 max-w-md mt-2 sm:mt-0">
                <div className="relative flex-1">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Buscar Apto ou Nome"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="pl-9 pr-4 py-3.5 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-[#84cc16] w-full bg-slate-50"
                  />
                </div>
                {isSindico && (
                  <button
                    type="button"
                    onClick={() => {
                      if (unidades.length >= subscription.planConfig.limits.maxUnits) {
                        solicitarUpgrade(
                          `Seu plano atual suporta até ${subscription.planConfig.limits.maxUnits} apartamentos.`
                        );
                        return;
                      }
                      setModalNovaUnidade(true);
                    }}
                    className="bg-[#1e293b] text-white px-4 py-3.5 rounded-xl font-black text-xs hover:bg-black transition flex items-center gap-1.5 shrink-0"
                  >
                    <PlusCircle size={16} /> <span className="hidden sm:inline">Novo Apto</span>
                  </button>
                )}
              </div>
            </Card>

            <div className="grid gap-3">
              {unidadesFiltradas.length > 0 ? (
                unidadesFiltradas.map((u) => {
                  const valorDevido = u.isento_taxa ? 0 : taxaVigenteMes;
                  const pags = getPagamentosMes(u, chaveAtual);
                  const totalPago = calcularTotalPago(pags);
                  const isPago = u.isento_taxa || totalPago >= valorDevido;
                  const isParcial = !u.isento_taxa && totalPago > 0 && totalPago < valorDevido;

                  return (
                    <Card
                      key={u.id}
                      className={`p-4 border-l-[6px] transition-all hover:shadow-md ${
                        isPago
                          ? 'border-l-[#84cc16]'
                          : isParcial
                          ? 'border-l-yellow-400'
                          : 'border-l-slate-200'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex gap-4 items-center text-left w-full sm:w-auto">
                          <div className="w-14 h-14 bg-slate-50 rounded-2xl font-black flex items-center justify-center text-slate-500 text-lg border border-slate-100 relative shrink-0">
                            {safeStr(u.numero)}
                            {u.linked_user_id && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-black text-slate-800 text-base">
                                {safeStr(
                                  u.mora_proprietario !== false
                                    ? u.proprietario?.nome || 'Proprietário'
                                    : u.inquilino?.nome || 'Morador'
                                )}
                              </p>
                              {isSindico && (
                                <button
                                  type="button"
                                  onClick={() => setModalEditar(u)}
                                  className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 px-2.5 py-1 rounded-lg flex items-center gap-1 transition"
                                >
                                  <Pencil size={12} /> Editar
                                </button>
                              )}
                            </div>
                            <div className="mt-1">
                              {u.isento_taxa ? (
                                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                  ISENTO DE TAXA
                                </span>
                              ) : totalPago > 0 ? (
                                <span
                                  className={`text-[10px] font-black uppercase tracking-tighter flex items-center gap-1 ${
                                    isPago ? 'text-[#84cc16]' : 'text-yellow-600'
                                  }`}
                                >
                                  <CheckCircle size={10} /> {isPago ? 'PAGO NESTE MÊS' : 'PARCIAL'}{' '}
                                  • {fmt(totalPago)}
                                </span>
                              ) : (
                                <span className="text-[10px] font-black text-slate-400 tracking-wide uppercase">
                                  AGUARDANDO {mesAtual}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:items-end w-full sm:w-auto gap-2 mt-2 sm:mt-0">
                          {totalPago > 0 || u.isento_taxa || isConselheiro ? (
                            <button
                              type="button"
                              onClick={() =>
                                setModalDetalhesUnidade({
                                  u,
                                  mes: mesAtual,
                                  ano: anoAtual,
                                  pags,
                                  totalPago,
                                  valorDevido,
                                })
                              }
                              className="w-full sm:w-auto text-[10px] bg-slate-100 text-slate-600 font-black px-4 py-3 rounded-xl hover:bg-slate-200 flex items-center justify-center gap-2 transition"
                            >
                              <Eye size={12} /> EXTRATO DA UNIDADE
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                if (subscription.overUnitLimit) {
                                  solicitarUpgrade(
                                    `Ative o CondoLeve Pro para gerenciar todos os ${unidades.length} apartamentos.`
                                  );
                                  return;
                                }
                                const dev = inadimplenciaGlobal.find((d) => d.unidade.id === u.id);
                                if (dev && dev.mesesAtraso > 1) {
                                  setConfirmacao({
                                    titulo: `Apto ${u.numero} possui atrasos`,
                                    texto: `Esta unidade tem ${dev.mesesAtraso} cotas pendentes (Total: ${fmtPriv(dev.valorTotalDevido)}). Deseja registrar o pagamento referente ao mês de ${mesAtual}?`,
                                    onConfirm: () => {
                                      setConfirmacao(null);
                                      setModalPagamento({
                                        unidadeId: u.id,
                                        valorSugerido: valorDevido,
                                      });
                                    },
                                  });
                                  return;
                                }
                                setModalPagamento({ unidadeId: u.id, valorSugerido: valorDevido });
                              }}
                              className="w-full sm:w-auto bg-[#1e293b] text-white text-[10px] font-black px-6 py-3 rounded-2xl shadow-lg active:scale-95 transition hover:bg-black"
                            >
                              RECEBER
                            </button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })
              ) : (
                <EmptyState
                  icon={Home}
                  title="Nenhum Apartamento"
                  desc="Nenhuma unidade cadastrada ou a busca não encontrou resultados."
                />
              )}
            </div>
          </div>
        )}

        {/* ABA COBRANÇAS / INADIMPLÊNCIA */}
        {abaAtiva === 'cobrancas' && (
          <div className="space-y-4 animate-in fade-in duration-500">
            {!allowInadimplencia ? (
              <Card className="p-8 text-center space-y-4 border-t-4 border-t-[#84cc16] shadow-xl">
                <div className="w-16 h-16 bg-lime-100 text-lime-700 rounded-2xl flex items-center justify-center mx-auto">
                  <Lock size={28} />
                </div>
                <h3 className="text-xl font-black text-slate-800">
                  Controle Automático de Inadimplência & Cobrança 1-Clique
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Descubra automaticamente quantas cotas cada unidade deve desde o início do prédio e
                  envie cobranças cordiais prontas com chave PIX no WhatsApp.{' '}
                  <b>Recuperar apenas 1 cota atrasada já paga meses do CondoLeve Pro!</b>
                </p>
                <button
                  type="button"
                  onClick={() =>
                    solicitarUpgrade('Desbloqueie a Régua de Inadimplência e Cobrança 1-Clique.')
                  }
                  className="bg-[#84cc16] text-[#1e293b] px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg hover:bg-[#a3e635] transition"
                >
                  DESBLOQUEAR NO CONDOLEVE PRO
                </button>
              </Card>
            ) : (
              <>
                <Card className="p-6 bg-white border-l-[6px] border-l-red-500 shadow-xl flex justify-between items-center text-left gap-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                      <BadgeAlert size={14} className="text-red-500" /> Inadimplência Acumulada
                    </p>
                    <p className="text-3xl font-black text-red-600">
                      {fmtPriv(
                        inadimplenciaGlobal.reduce((acc, d) => acc + d.valorTotalDevido, 0)
                      )}
                    </p>
                  </div>
                  <div className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-center border border-red-100 shadow-sm shrink-0">
                    <p className="text-xl font-black">{inadimplenciaGlobal.length}</p>
                    <p className="text-[8px] uppercase font-bold tracking-widest">Aptos</p>
                  </div>
                </Card>

                {inadimplenciaGlobal.length > 0 ? (
                  <div className="grid gap-3 mt-4">
                    {[...inadimplenciaGlobal]
                      .sort((a, b) => b.mesesAtraso - a.mesesAtraso)
                      .map((dev) => (
                        <Card
                          key={dev.unidade.id}
                          className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-center gap-4 hover:shadow-md transition border-l-[6px] border-l-red-500"
                        >
                          <div className="flex items-center gap-4 text-left w-full sm:w-auto">
                            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl font-black flex items-center justify-center text-lg border border-red-100 shrink-0">
                              {dev.unidade.numero}
                            </div>
                            <div className="flex-1">
                              <p className="font-black text-slate-800 text-sm">
                                {safeStr(
                                  dev.unidade.mora_proprietario !== false
                                    ? dev.unidade.proprietario?.nome
                                    : dev.unidade.inquilino?.nome
                                ) || 'Morador'}
                              </p>
                              <p className="text-[10px] font-black text-red-500 uppercase mt-1 bg-red-50 px-2 py-0.5 rounded-md inline-block">
                                {dev.mesesAtraso}{' '}
                                {dev.mesesAtraso > 1 ? 'cotas pendentes' : 'cota pendente'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between w-full sm:w-auto gap-4 mt-2 sm:mt-0 border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100">
                            <div className="text-left sm:text-right">
                              <p className="text-[9px] font-bold text-slate-400 uppercase">
                                Dívida Total
                              </p>
                              <p className="font-black text-lg text-slate-800">
                                {fmtPriv(dev.valorTotalDevido)}
                              </p>
                            </div>
                            {isSindico && (
                              <button
                                type="button"
                                onClick={() => enviarWhatsAppCobranca(dev)}
                                className="bg-[#1e293b] text-white px-5 py-3 rounded-xl text-[10px] font-black flex items-center gap-2 hover:bg-black transition whitespace-nowrap active:scale-95 shadow-lg"
                              >
                                <MessageCircle size={14} /> COBRAR
                              </button>
                            )}
                          </div>
                        </Card>
                      ))}
                  </div>
                ) : (
                  <div className="mt-4">
                    <EmptyState
                      icon={ThumbsUp}
                      title="Zero Inadimplência"
                      desc="Parabéns! Nenhuma unidade pagante está com cotas pendentes."
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ABA DESPESAS */}
        {abaAtiva === 'despesas' && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <Card className="p-6 bg-white border-l-[6px] border-l-orange-500 shadow-xl flex flex-col sm:flex-row justify-between items-center text-left gap-4">
              <div className="w-full sm:w-1/2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                  <ArrowDownCircle size={14} className="text-orange-500" /> Gastos de {mesAtual}
                </p>
                <div className="flex items-end gap-2 mb-3">
                  <p className="text-3xl font-black text-orange-600">{fmtPriv(gastoMes)}</p>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden relative flex">
                  <div
                    className="bg-orange-500 h-full absolute top-0 left-0 transition-all duration-500"
                    style={{ width: `${Math.min(porcentagemGastoPago, 100)}%` }}
                  />
                </div>
                <p className="text-[9px] font-bold text-slate-400 mt-2 flex justify-between uppercase">
                  <span>Pago: {fmtPriv(gastoPagoMes)}</span>
                  <span>Pendente: {fmtPriv(gastoMes - gastoPagoMes)}</span>
                </p>
              </div>
              {isSindico && (
                <button
                  type="button"
                  onClick={() => setModalNovaDespesa(true)}
                  className="w-full sm:w-auto bg-orange-500 text-white px-5 py-4 rounded-2xl font-black text-xs shadow-lg flex items-center justify-center gap-2 hover:bg-orange-600 transition active:scale-95 shrink-0"
                >
                  <PlusCircle size={18} /> LANÇAR CONTA
                </button>
              )}
            </Card>

            {despesasFiltradas.length === 0 && (
              <div className="mt-4">
                <EmptyState
                  icon={FileCheck}
                  title="Nenhuma Conta"
                  desc={`Ainda não foram lançadas despesas em ${mesAtual}.`}
                  action={isSindico ? () => setModalNovaDespesa(true) : null}
                  label="Lançar Primeira"
                />
              </div>
            )}

            {despesasFiltradas.length > 0 && (
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {['Todas', ...(config.categorias || CATEGORIAS_PADRAO)].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFiltroCategoriaDespesa(cat)}
                    className={`px-3 py-2 rounded-xl text-xs font-black whitespace-nowrap border transition ${
                      filtroCategoriaDespesa === cat
                        ? 'bg-[#1e293b] text-white border-[#1e293b]'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            <div className="grid gap-2">
              {despesasFiltradas
                .filter(
                  (d) =>
                    filtroCategoriaDespesa === 'Todas' || d.categoria === filtroCategoriaDespesa
                )
                .map((d) => {
                const isPago = d.pago !== false;
                return (
                  <Card
                    key={d.id}
                    className={`p-4 flex flex-col sm:flex-row justify-between items-center text-left border-l-4 ${
                      isPago ? 'border-l-slate-400' : 'border-l-orange-400 bg-orange-50/10'
                    }`}
                  >
                    <div className="w-full sm:w-auto">
                      <p className="font-black flex items-center gap-2 text-slate-800">
                        {safeStr(d.descricao)}
                        {d.url_comprovante && (
                          <a
                            href={d.url_comprovante}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-slate-100 text-slate-500 p-1 rounded-md hover:bg-blue-100 hover:text-blue-600 transition"
                            title="Abrir comprovante/nota"
                          >
                            <Paperclip size={12} />
                          </a>
                        )}
                      </p>
                      <div className="flex gap-2 mt-1">
                        <div className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          {getIconeCategoria(d.categoria)}
                          <span className="text-[9px] uppercase font-black text-slate-500">
                            {safeStr(d.categoria)}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 self-center">
                          {safeStr(d.data)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end mt-4 sm:mt-0">
                      <div className="text-right mr-2">
                        <p className={`font-black ${isPago ? 'text-slate-800' : 'text-orange-500'}`}>
                          -{fmt(d.valor)}
                        </p>
                        <span
                          className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                            isPago
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-orange-100 text-orange-600'
                          }`}
                        >
                          {isPago ? 'PAGO' : 'PENDENTE'}
                        </span>
                      </div>

                      {isSindico && (
                        <div className="flex gap-1 items-center">
                          <button
                            type="button"
                            onClick={() => editarDespesa({ ...d, pago: !isPago })}
                            className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase transition flex items-center gap-1 shadow-sm ${
                              isPago
                                ? 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                : 'bg-slate-600 text-white hover:bg-slate-800'
                            }`}
                          >
                            {isPago ? <RotateCcw size={12} /> : <Check size={12} />}{' '}
                            {isPago ? 'DESFAZER' : 'PAGAR'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setModalEditarDespesa(d)}
                            className="p-2 text-slate-300 hover:text-blue-500"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmacao({
                                titulo: 'Apagar Conta?',
                                texto: 'Tem certeza que deseja apagar este lançamento?',
                                onConfirm: () => {
                                  apagarDespesa(d.id);
                                  setConfirmacao(null);
                                },
                              })
                            }
                            className="p-2 text-slate-300 hover:text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* ABA CAIXA (DASHBOARD) */}
        {abaAtiva === 'caixa' && (
          <div className="space-y-6 animate-in fade-in duration-500 text-left">
            <div className="bg-[#1e293b] text-white p-8 rounded-[32px] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                <PieChartIcon size={200} />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-end gap-6">
                <div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                    <Target size={14} className="text-[#84cc16]" /> Saldo em Caixa Hoje
                  </p>
                  <h2 className="text-4xl sm:text-5xl font-black mb-4 tracking-tighter">
                    {fmtPriv(saldoTotalReal)}
                  </h2>
                  <div className="pt-4 border-t border-white/10 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <History size={12} className="text-slate-400" />
                      <span className="text-[10px] text-slate-400 uppercase font-bold">
                        Acumulado até final de {safeStr(mesAtual)}/{safeStr(anoAtual)}:{' '}
                        <span className="text-white">{fmtPriv(saldoAteMesSelecionado)}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setModalRelatorio(true)}
                  className="bg-[#84cc16] text-[#1e293b] py-3 px-6 rounded-2xl font-black text-xs shadow-xl flex items-center justify-center gap-2 hover:bg-[#a3e635] transition w-full md:w-auto active:scale-95"
                >
                  <FileBarChart size={18} /> PRESTAÇÃO DE CONTAS
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 col-span-1">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                    <LineChart size={14} /> Evolução de Saldo
                  </h3>
                </div>
                <div className="flex items-end justify-between gap-2 h-32 mt-4 px-2">
                  {historicoEvolutivo.map((h, i) => {
                    const percentual =
                      maxSaldoEvolucao > 0 ? (h.saldoFinal / maxSaldoEvolucao) * 100 : 0;
                    const alturaBarra = h.saldoFinal > 0 ? Math.max(percentual, 3) : 0;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                        <div className="w-full flex-1 flex items-end justify-center relative">
                          <div
                            className="w-full max-w-[40px] bg-[#a3e635] rounded-t-md relative flex items-end justify-center transition-all duration-300 shadow-sm"
                            style={{ height: `${alturaBarra}%` }}
                          >
                            {h.saldoFinal > 0 && (
                              <span className="absolute -top-5 text-[9px] font-black text-slate-600 whitespace-nowrap animate-in fade-in">
                                {modoPrivacidade ? '•••' : formatarInteiro(h.saldoFinal)}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-[9px] font-bold text-slate-400">{h.mesLabel}</span>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card className="p-6 col-span-1">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                    <PieChartIcon size={14} /> Gastos de {mesAtual}
                  </h3>
                  <span className="text-[10px] bg-red-50 text-red-600 px-2 py-1 rounded-full font-black">
                    -{fmtPriv(gastoMes)}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div
                    className="relative w-32 h-32 rounded-full shrink-0 shadow-inner"
                    style={{ background: generateConicGradient(gastosPorCategoria, gastoMes) }}
                  >
                    <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center flex-col">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Total</span>
                      <span className="text-xs font-black text-slate-800">{fmtPriv(gastoMes)}</span>
                    </div>
                  </div>
                  <div className="flex-1 w-full space-y-2 max-h-32 overflow-y-auto pr-2">
                    {gastosPorCategoria.length > 0 ? (
                      gastosPorCategoria.map((cat, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-xs p-1 hover:bg-slate-50 rounded"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                            />
                            <span
                              className="font-bold text-slate-600 truncate max-w-[100px]"
                              title={cat.name}
                            >
                              {cat.name}
                            </span>
                          </div>
                          <span className="font-black text-slate-400 text-[10px]">
                            {((cat.value / (gastoMes || 1)) * 100).toFixed(0)}%
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-slate-300 text-xs italic w-full">
                        Nenhuma despesa lançada.
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ABA MAIS FERRAMENTAS */}
        {abaAtiva === 'mais' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-[#1e293b] p-6 rounded-b-[40px] text-center shadow-lg -mt-4 pb-10 mb-2">
              <div className="flex justify-center mb-2">
                <Logo variant="full" width="w-48" className="brightness-0 invert opacity-90" />
              </div>
              <p className="text-slate-400 text-xs font-medium mt-0">Recursos do Condomínio</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 px-2">
              <button
                type="button"
                onClick={() => setModalManutencao(true)}
                className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 hover:shadow-md transition active:scale-95 group relative"
              >
                <div className="bg-slate-50 text-slate-600 p-4 rounded-2xl relative group-hover:bg-[#84cc16]/10 group-hover:text-[#84cc16] transition">
                  <Wrench size={24} />
                  {patrimonio.filter((p) => !p.concluido).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white" />
                  )}
                </div>
                <span className="font-black text-slate-700 text-[10px] uppercase tracking-widest">
                  Manutenção
                </span>
              </button>

              <button
                type="button"
                onClick={() => setModalAvisos(true)}
                className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 hover:shadow-md transition active:scale-95 group"
              >
                <div className="bg-orange-50 text-orange-500 p-4 rounded-2xl group-hover:bg-orange-100 transition">
                  <Megaphone size={24} />
                </div>
                <span className="font-black text-slate-700 text-[10px] uppercase tracking-widest">
                  Mural
                </span>
              </button>

              <button
                type="button"
                onClick={() => setModalEnquete(true)}
                className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 hover:shadow-md transition active:scale-95 group"
              >
                <div className="bg-blue-50 text-blue-500 p-4 rounded-2xl group-hover:bg-blue-100 transition">
                  <Vote size={24} />
                </div>
                <span className="font-black text-slate-700 text-[10px] uppercase tracking-widest">
                  Enquetes
                </span>
              </button>

              <button
                type="button"
                onClick={() => setModalTelefones(true)}
                className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 hover:shadow-md transition active:scale-95 group relative"
              >
                <div className="absolute top-2 right-2 bg-slate-100 text-slate-400 p-1 rounded-full">
                  <Printer size={10} />
                </div>
                <div className="bg-teal-50 text-teal-600 p-4 rounded-2xl group-hover:bg-teal-100 transition">
                  <Contact size={24} />
                </div>
                <span className="font-black text-slate-700 text-[10px] uppercase tracking-widest text-center">
                  Contatos & Info
                </span>
              </button>

              {isSindico && (
                <>
                  <button
                    type="button"
                    onClick={() => setModalFila(true)}
                    className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 hover:shadow-md transition active:scale-95 group relative"
                  >
                    {filaPendente > 0 && (
                      <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white font-black text-[9px] rounded-full flex items-center justify-center">
                        {filaPendente}
                      </span>
                    )}
                    <div className="bg-purple-50 text-purple-600 p-4 rounded-2xl group-hover:bg-purple-100 transition">
                      <UserPlus size={24} />
                    </div>
                    <span className="font-black text-slate-700 text-[10px] uppercase tracking-widest text-center">
                      Moradores
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalConfig(true)}
                    className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 hover:shadow-md transition active:scale-95 group"
                  >
                    <div className="bg-slate-50 text-slate-600 p-4 rounded-2xl group-hover:bg-slate-200 transition">
                      <Settings size={24} />
                    </div>
                    <span className="font-black text-slate-700 text-[10px] uppercase tracking-widest">
                      Ajustes & Plano
                    </span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={abrirAuditoria}
                className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 hover:shadow-md transition active:scale-95 group"
              >
                <div className="bg-slate-50 text-slate-600 p-4 rounded-2xl group-hover:bg-lime-100 group-hover:text-lime-700 transition">
                  <History size={24} />
                </div>
                <span className="font-black text-slate-700 text-[10px] uppercase tracking-widest">
                  Auditoria
                </span>
              </button>

              <button
                type="button"
                onClick={() => setModalGuia(true)}
                className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 hover:shadow-md transition active:scale-95 group"
              >
                <div className="bg-lime-50 text-lime-700 p-4 rounded-2xl group-hover:bg-lime-100 transition">
                  <BookOpen size={24} />
                </div>
                <span className="font-black text-slate-700 text-[10px] uppercase tracking-widest text-center">
                  Guia &amp; Leis
                </span>
              </button>

              <button
                type="button"
                onClick={() => setModalRateio(true)}
                className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 hover:shadow-md transition active:scale-95 group"
              >
                <div className="bg-amber-50 text-amber-600 p-4 rounded-2xl group-hover:bg-amber-100 transition">
                  <Coins size={24} />
                </div>
                <span className="font-black text-slate-700 text-[10px] uppercase tracking-widest text-center">
                  Rateio Extra
                </span>
              </button>

              <button
                type="button"
                onClick={() => setModalConvencao(true)}
                className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 hover:shadow-md transition active:scale-95 group"
              >
                <div className="bg-indigo-50 text-indigo-600 p-4 rounded-2xl group-hover:bg-indigo-100 transition">
                  <BookMarked size={24} />
                </div>
                <span className="font-black text-slate-700 text-[10px] uppercase tracking-widest text-center">
                  Convenção
                </span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* BARRA DE NAVEGAÇÃO INFERIOR */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 border-t border-slate-100 px-2 py-4 flex justify-around items-end z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pb-10 backdrop-blur-xl">
        <NavBtn
          active={abaAtiva === 'receitas'}
          onClick={() => setAbaAtiva('receitas')}
          icon={<ArrowUpCircle size={22} />}
          label="Receitas"
        />
        <NavBtn
          active={abaAtiva === 'despesas'}
          onClick={() => setAbaAtiva('despesas')}
          icon={<ArrowDownCircle size={22} />}
          label="Despesas"
        />
        <NavBtn
          active={abaAtiva === 'cobrancas'}
          onClick={() => setAbaAtiva('cobrancas')}
          icon={<AlertTriangle size={22} />}
          label="Cobranças"
          badgeCount={allowInadimplencia ? inadimplenciaGlobal.length : 0}
        />
        <NavBtn
          active={abaAtiva === 'caixa'}
          onClick={() => setAbaAtiva('caixa')}
          icon={<PieChartIcon size={22} />}
          label="Dashboard"
        />
        <NavBtn
          active={abaAtiva === 'mais'}
          onClick={() => setAbaAtiva('mais')}
          icon={<Grid size={22} />}
          label="Mais"
        />
      </nav>

      {/* MODAIS MODULARES */}
      {confirmacao && <ModalConfirmacao data={confirmacao} onClose={() => setConfirmacao(null)} />}

      {modalUpgradeMotivo && (
        <ModalUpgradePlano
          motivo={modalUpgradeMotivo}
          onClose={() => setModalUpgradeMotivo(null)}
          subscription={subscription}
          condominioNome={config.predioNome}
          condominioId={cId}
          showToast={showToast}
        />
      )}

      {modalPagamento && (
        <ModalReceber
          showToast={showToast}
          valorSugerido={modalPagamento.valorSugerido}
          onClose={() => setModalPagamento(null)}
          onConfirm={(v, d, url) => {
            adicionarPagamento(modalPagamento.unidadeId, v, d, url);
            setModalPagamento(null);
          }}
          supabase={supabase}
          condominioId={cId}
          subscription={subscription}
          onRequestUpgrade={solicitarUpgrade}
        />
      )}

      {modalDetalhesUnidade && (
        <ModalDetalhesUnidade
          showToast={showToast}
          dados={modalDetalhesUnidade}
          readOnly={isConselheiro}
          onAdd={(v, d, url) => {
            adicionarPagamento(modalDetalhesUnidade.u.id, v, d, url);
            setModalDetalhesUnidade({
              ...modalDetalhesUnidade,
              pags: [
                ...modalDetalhesUnidade.pags,
                { id: generateId(), valor: v, data: d, url_comprovante: url },
              ],
            });
          }}
          onDelete={(pid) =>
            setConfirmacao({
              titulo: 'Apagar Pagamento?',
              texto: 'Tem certeza que deseja remover este recebimento?',
              onConfirm: () => {
                removerPagamento(pid);
                setModalDetalhesUnidade({
                  ...modalDetalhesUnidade,
                  pags: modalDetalhesUnidade.pags.filter((p) => p.id !== pid),
                });
                setConfirmacao(null);
              },
            })
          }
          onClose={() => setModalDetalhesUnidade(null)}
          fmt={fmt}
          enviarRecibo={enviarReciboWhatsApp}
          supabase={supabase}
          condominioId={cId}
          setModalReciboVisual={setModalReciboVisual}
          onUpdatePagamento={atualizarComprovantePagamento}
          subscription={subscription}
          onRequestUpgrade={solicitarUpgrade}
        />
      )}

      {modalReciboVisual && (
        <ModalReciboVisual
          pagamento={modalReciboVisual.pagamento}
          unidade={modalReciboVisual.unidade}
          config={config}
          onClose={() => setModalReciboVisual(null)}
          fmt={fmt}
          enviarWhatsApp={enviarReciboWhatsApp}
          showToast={showToast}
        />
      )}

      {modalNovaDespesa && (
        <ModalDespesa
          showToast={showToast}
          supabase={supabase}
          condominioId={cId}
          categorias={config.categorias}
          onClose={() => setModalNovaDespesa(false)}
          onSave={salvarNovaDespesa}
          subscription={subscription}
          onRequestUpgrade={solicitarUpgrade}
          onAiUsed={() =>
            setAssinaturaDb((prev) =>
              prev ? { ...prev, creditos_ia_usados: (prev.creditos_ia_usados || 0) + 1 } : prev
            )
          }
        />
      )}

      {modalEditarDespesa && (
        <ModalDespesa
          showToast={showToast}
          supabase={supabase}
          condominioId={cId}
          categorias={config.categorias}
          despesaParaEditar={modalEditarDespesa}
          onClose={() => setModalEditarDespesa(null)}
          onSave={(d) => {
            editarDespesa({ ...d, id: modalEditarDespesa.id });
            setModalEditarDespesa(null);
          }}
          subscription={subscription}
          onRequestUpgrade={solicitarUpgrade}
        />
      )}

      {modalEditar && (
        <ModalEditarUnidade
          u={modalEditar}
          onClose={() => setModalEditar(null)}
          onSave={(novo) => {
            supabase
              .from('unidades')
              .update(novo)
              .eq('id', novo.id)
              .then(() => {
                setUnidades((prev) => prev.map((x) => (x.id === novo.id ? novo : x)));
                setModalEditar(null);
                showToast('Dados da unidade salvos!');
              });
          }}
          ativarModoMorador={() => {
            setUnidadeMorador(modalEditar);
            setModoMorador(true);
            setModalEditar(null);
          }}
          cId={cId}
          showToast={showToast}
        />
      )}

      {modalConfig && (
        <ModalConfiguracoes
          config={config}
          setConfig={salvarConfig}
          onClose={() => setModalConfig(false)}
          triggerConfirm={setConfirmacao}
          resetar={resetarSistema}
          showToast={showToast}
          exportarBackup={exportarBackup}
          supabase={supabase}
          condominioId={cId}
          currentUserId={session.user.id}
          onSwitchContexto={onSwitch}
          subscription={subscription}
          onRequestUpgrade={solicitarUpgrade}
          unidadesCount={unidades.length}
          onLogout={onLogout}
        />
      )}

      {modalRelatorio && (
        <ModalRelatorio
          receita={receitaMes}
          despesa={gastoMes}
          saldo={saldoAteMesSelecionado}
          despesas={despesasFiltradas}
          pagamentos={pagamentos.filter(
            (p) => p.mes === mesAtual && String(p.ano) === String(anoAtual)
          )}
          unidades={unidades}
          mes={mesAtual}
          ano={anoAtual}
          onClose={() => setModalRelatorio(false)}
          fmt={fmt}
          exportarCSV={exportarCSV}
          config={config}
          showToast={showToast}
          subscription={subscription}
          onRequestUpgrade={solicitarUpgrade}
        />
      )}

      {modalManutencao && (
        <ModalManutencao
          lista={patrimonio}
          readOnly={isConselheiro}
          onClose={() => setModalManutencao(false)}
          onToggle={toggleStatusManutencao}
          onUpdateChamado={atualizarChamadoManutencao}
          onDelete={(id) =>
            setConfirmacao({
              titulo: 'Apagar Chamado?',
              texto: 'Isso removerá o registro de manutenção.',
              onConfirm: () => {
                apagarManutencao(id);
                setConfirmacao(null);
              },
            })
          }
        />
      )}

      {modalAvisos && (
        <ModalAvisos
          lista={avisos}
          readOnly={isConselheiro}
          onClose={() => setModalAvisos(false)}
          onSave={salvarAviso}
          onDelete={(id) =>
            setConfirmacao({
              titulo: 'Apagar Aviso?',
              texto: 'Ele sumirá do mural dos moradores.',
              onConfirm: () => {
                apagarAviso(id);
                setConfirmacao(null);
              },
            })
          }
          supabase={supabase}
          condominioId={cId}
          showToast={showToast}
          subscription={subscription}
          onRequestUpgrade={solicitarUpgrade}
          onAiUsed={() =>
            setAssinaturaDb((prev) =>
              prev ? { ...prev, creditos_ia_usados: (prev.creditos_ia_usados || 0) + 1 } : prev
            )
          }
        />
      )}

      {modalEnquete && (
        <ModalEnquete
          lista={enquetes}
          readOnly={isConselheiro}
          onClose={() => setModalEnquete(false)}
          onSave={salvarEnquete}
          onDelete={(id) =>
            setConfirmacao({
              titulo: 'Apagar Enquete?',
              texto: 'Os votos serão perdidos permanentemente.',
              onConfirm: () => {
                apagarEnquete(id);
                setConfirmacao(null);
              },
            })
          }
          onEncerrar={encerrarEnquete}
          subscription={subscription}
          onRequestUpgrade={solicitarUpgrade}
        />
      )}

      {modalTelefones && (
        <ModalTelefonesUteis
          config={config}
          readOnly={isConselheiro}
          setConfig={salvarConfig}
          onClose={() => setModalTelefones(false)}
          setPrintMode={setPrintMode}
        />
      )}

      {modalFila && (
        <ModalFilaAprovacao
          fila={convitesPendentes}
          onClose={() => setModalFila(false)}
          processarAprovacao={processarAprovacao}
          subscription={subscription}
          onRequestUpgrade={solicitarUpgrade}
        />
      )}

      {modalInstalar && <ModalInstalarApp onClose={() => setModalInstalar(false)} />}

      {modalNovaUnidade && (
        <ModalNovaUnidade
          onClose={() => setModalNovaUnidade(false)}
          onSave={adicionarUnidade}
        />
      )}

      {modalAuditoria && (
        <ModalAuditoria
          logs={auditLogs}
          loading={loadingAudit}
          onClose={() => setModalAuditoria(false)}
        />
      )}

      {modalGuia && (
        <ModalGuiaCondominio onClose={() => setModalGuia(false)} convencao={config.convencao} />
      )}

      {modalRateio && (
        <ModalRateioExtra
          rateios={rateiosExtras}
          unidades={unidades}
          mesAtual={mesAtual}
          anoAtual={anoAtual}
          readOnly={isConselheiro}
          onClose={() => setModalRateio(false)}
          onCreate={criarRateiosExtras}
          onDelete={apagarRateioExtra}
          subscription={subscription}
          onRequestUpgrade={solicitarUpgrade}
        />
      )}

      {modalConvencao && (
        <ModalConvencaoAssembleia
          config={config}
          setConfig={salvarConfig}
          onClose={() => setModalConvencao(false)}
          supabase={supabase}
          condominioId={cId}
          showToast={showToast}
          subscription={subscription}
          onRequestUpgrade={solicitarUpgrade}
          readOnly={isConselheiro}
        />
      )}
    </div>
  );
}
