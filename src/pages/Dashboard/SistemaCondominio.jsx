import React, { useState, useEffect, useMemo } from 'react';
import html2canvas from 'html2canvas';
import { Logo } from '../../components/ui/Logo';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { NavBtn } from '../../components/ui/NavBtn';
import { ModoMorador } from '../Resident/ModoMorador';
import { 
  safeStr, safeNum, formatarMoeda, formatarInteiro, generateId, gerarHashVerificador, getMonthKey, getAbsoluteMonthIndex, maskPhone, useMetaTags, getIconeCategoria, CATEGORIAS_PADRAO, INFO_UTEIS_PADRAO, CHART_COLORS, MESES
} from '../../utils/helpers';
import * as LucideIcons from 'lucide-react';
const { Download, Edit, Trash2, User, Home, Calendar, DollarSign, CheckCircle, XCircle, Phone, FileText, Settings, MessageCircle, ExternalLink, Wallet, ArrowDownCircle, ArrowUpCircle, PieChart, PlusCircle, TrendingUp, TrendingDown, Printer, Users, AlertTriangle, Clock, History, X, Copy, Database, Upload, Cloud, Lock, Unlock, Key, Megaphone, Wrench, Hammer, Star, Check, BarChart3, ArrowRight, Pencil, Smartphone, Sparkles, ListPlus, Eye, EyeOff, CalendarDays, Link: LinkIcon, Save, RefreshCw, WifiOff, LogOut, Mail, RotateCcw, Search, CheckSquare, Square, Crown, FileSpreadsheet, ShieldCheck, LockKeyhole, PlayCircle, Repeat, Paperclip, Image: ImageIcon, ThumbsUp, Calculator, UserPlus, LogIn, LogOut: LogOutIcon, AlertOctagon, FileCheck, Droplets, Zap, Leaf, PaintBucket, Construction, Shield, HelpCircle, Tags, Menu, Grid, Share2, FileBarChart, Target, Activity, Bell, BellRing, Smartphone: MobileIcon, MoreHorizontal, Vote, Send, Gift, Coffee, UserCheck, UserX, Link2, Layout, Share, Camera, ArrowLeft, Building, Ticket, AlertCircle, Info, LineChart, PartyPopper, Video, KeyRound, Contact, PhoneCall, MonitorPlay, AppWindow, MoveUpRight, Filter, Receipt, BadgeAlert, Wifi, ChevronDown, ChevronUp, PieChart: PieChartIcon, KeySquare } = LucideIcons;

const generateConicGradient = (data, total) => { if(total === 0) return 'conic-gradient(#f1f5f9 0% 100%)'; let gradient = 'conic-gradient('; let start = 0; data.forEach((item, index) => { const percentage = (item.value / total) * 100; gradient += `${CHART_COLORS[index % CHART_COLORS.length]} ${start}% ${start + percentage}%, ` ; start += percentage; }); return gradient.slice(0, -2) + ')'; };


export function SistemaCondominio({ supabase, session, contexto, onSwitch, showToast }) {
  const [loading, setLoading] = useState(true);
  const cId = contexto.condominio_id || 'default';
  
  const isSindico = contexto.role === 'sindico';
  const [abaAtiva, setAbaAtiva] = useState(isSindico ? 'caixa' : 'mural'); 
  
  const [unidades, setUnidades] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [pagamentos, setPagamentos] = useState([]);
  const [patrimonio, setPatrimonio] = useState([]); 
  const [avisos, setAvisos] = useState([]);
  const [enquetes, setEnquetes] = useState([]); 
  
  const [config, setConfig] = useState({ 
    valorCondominio: 200, sindicaNome: 'Síndico(a)', predioNome: 'CondoLeve', chavePix: '', 
    saldoInicial: 0, inicioOperacao: '', categorias: CATEGORIAS_PADRAO, telefonesUteis: INFO_UTEIS_PADRAO, filaAprovacao: [], telefoneSindico: ''
  });
  
  const [mesAtual, setMesAtual] = useState(MESES[new Date().getMonth()]);
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());
  const [busca, setBusca] = useState('');
  const [modoPrivacidade, setModoPrivacidade] = useState(false);
  
  // Modais State
  const [modalPagamento, setModalPagamento] = useState(null);
  const [modalDetalhesUnidade, setModalDetalhesUnidade] = useState(null); 
  const [modalReciboVisual, setModalReciboVisual] = useState(null); 
  const [modalEditar, setModalEditar] = useState(null);
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
  const [confirmacao, setConfirmacao] = useState(null);
  const [printMode, setPrintMode] = useState(null); 

  const [modoMorador, setModoMorador] = useState(!isSindico); 
  const [unidadeMorador, setUnidadeMorador] = useState(contexto.unidades ? { ...contexto.unidades, id: contexto.unidade_id } : null);

  useMetaTags(config);

  const carregarDados = async () => {
      setLoading(true);
      try {
          const [resUnidades, resPagamentos, resDespesas, resAvisos, resZeladoria, resEnquetes, resConfig] = await Promise.all([
              supabase.from('unidades').select('*').eq('condominio_id', cId), supabase.from('pagamentos').select('*').eq('condominio_id', cId), supabase.from('despesas').select('*').eq('condominio_id', cId), supabase.from('avisos').select('*').eq('condominio_id', cId), supabase.from('zeladoria').select('*').eq('condominio_id', cId), supabase.from('enquetes').select('*').eq('condominio_id', cId), supabase.from('config_geral').select('*').eq('condominio_id', cId).maybeSingle()
          ]);
          if (resUnidades.data) setUnidades(resUnidades.data.sort((a,b) => String(a.numero).localeCompare(String(b.numero), undefined, {numeric: true})));
          if (resPagamentos.data) setPagamentos(resPagamentos.data);
          if (resDespesas.data) setDespesas(resDespesas.data);
          if (resAvisos.data) setAvisos(resAvisos.data);
          if (resZeladoria.data) setPatrimonio(resZeladoria.data);
          if (resEnquetes.data) setEnquetes(resEnquetes.data);
          if (resConfig.data) {
              const dadosMesclados = { ...resConfig.data.dados };
              if (!dadosMesclados.telefonesUteis) dadosMesclados.telefonesUteis = INFO_UTEIS_PADRAO;
              if (!dadosMesclados.filaAprovacao) dadosMesclados.filaAprovacao = [];
              if (!dadosMesclados.inicioOperacao) { 
                  const d = new Date(); 
                  dadosMesclados.inicioOperacao = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; 
              }
              setConfig(prev => ({ ...prev, ...dadosMesclados }));
          }
      } catch (error) { console.error(error); showToast("Erro de conexão.", 'error'); } finally { setLoading(false); }
  };

  useEffect(() => { carregarDados(); }, [cId]);

  const exportarCSV = () => { let csv = "Data,Tipo,Descricao,Categoria,Valor\n"; pagamentos.forEach(p => { const uni = unidades.find(u=>u.id===p.unidade_id)?.numero || '?'; csv += `${p.data},Receita,Apto ${uni},Taxa Condominial,${p.valor}\n`; }); despesas.filter(d=>d.pago!==false).forEach(d => { csv += `${d.data},Despesa,${d.descricao},${d.categoria},${d.valor}\n`; }); const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' }); const url = window.URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `Relatorio_${config.predioNome}_${mesAtual}.csv`; a.click(); };
  
  const exportarBackup = () => {
      try {
          const backupData = { config, unidades, pagamentos, despesas, patrimonio, avisos, enquetes };
          const blob = new Blob([JSON.stringify(backupData)], {type: 'application/json'});
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Backup_CondoLeve_${config.predioNome}_${new Date().toISOString().split('T')[0]}.json`;
          a.click();
          showToast("Backup (JSON) exportado com sucesso!");
      } catch(e) { showToast("Erro ao exportar backup", "error"); }
  };

  const resetarSistema = async (silent = false) => { setLoading(true); try { await Promise.all([ supabase.from('pagamentos').delete().eq('condominio_id', cId), supabase.from('despesas').delete().eq('condominio_id', cId), supabase.from('avisos').delete().eq('condominio_id', cId), supabase.from('zeladoria').delete().eq('condominio_id', cId), supabase.from('enquetes').delete().eq('condominio_id', cId), supabase.from('unidades').delete().eq('condominio_id', cId), supabase.from('config_geral').delete().eq('condominio_id', cId), supabase.from('vinculos').delete().eq('condominio_id', cId) ]); await supabase.from('condominios').delete().eq('id', cId); if(!silent) { showToast("Condomínio resetado completamente."); setModalConfig(false); setTimeout(() => window.location.reload(), 1500); } } catch(e) { if(!silent) showToast("Erro ao resetar: " + e.message, 'error'); } finally { setLoading(false); } };

  // Adicionar Pagamento com Hash
  const adicionarPagamento = async (unidadeId, valor, data, urlComprovante) => { 
      const hashGerado = gerarHashVerificador(unidadeId, valor, data);
      const novo = { user_id: session.user.id, condominio_id: cId, unidade_id: unidadeId, valor, data, mes: mesAtual, ano: anoAtual, url_comprovante: urlComprovante, hash_recibo: hashGerado }; 
      const { data: dbData, error } = await supabase.from('pagamentos').insert(novo).select().single(); 
      if (error) showToast(`Erro ao salvar recebimento.`, 'error'); 
      else { setPagamentos(prev => [...prev, dbData]); showToast(`Pagamento registrado com sucesso!`); } 
  };
  const apagarArquivoStorage = async (url) => { if(!url) return; try { const nome = url.split('/').pop(); if(nome) await supabase.storage.from('comprovantes').remove([nome]); } catch(e) { console.error("Erro ao limpar storage", e); } };
  
  const removerPagamento = async (pagamentoId) => { 
      const item = pagamentos.find(x => x.id === pagamentoId);
      if (item && item.url_comprovante) apagarArquivoStorage(item.url_comprovante);
      setPagamentos(prev => prev.filter(p => p.id !== pagamentoId)); 
      await supabase.from('pagamentos').delete().eq('id', pagamentoId); 
      showToast('Pagamento removido do extrato.'); 
  };
  const atualizarComprovantePagamento = async (pagamentoId, novaUrl) => { setPagamentos(prev => prev.map(p => p.id === pagamentoId ? { ...p, url_comprovante: novaUrl } : p)); await supabase.from('pagamentos').update({ url_comprovante: novaUrl }).eq('id', pagamentoId); showToast('Comprovante anexado ao pagamento com sucesso!'); };
  const enviarReciboWhatsApp = (pagamento, unidade) => { const hashExibicao = pagamento.hash_recibo || 'N/A'; const texto = `🧾 *RECIBO DE PAGAMENTO*\n\n🏢 Condomínio: *${config.predioNome}*\n🏠 Unidade: *${unidade.numero}*\n💰 Valor Recebido: *${fmt(pagamento.valor)}*\n📅 Data de Pagamento: *${pagamento.data}*\n\n✅ Pagamento confirmado pelo síndico.\n🔐 Autenticidade: ${hashExibicao}\n\n_Gerado pelo app CondoLeve_`; window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank'); };

  // CRUD base
  const salvarNovaDespesa = async (despesaData, isRepetir) => { 
      const { repetir, ...dadosSafe } = despesaData;
      const baseDespesa = { ...dadosSafe, user_id: session.user.id, condominio_id: cId }; 
      const [y, m, day] = baseDespesa.data.split('-'); 
      const ano = parseInt(y); 
      const despesasParaInserir = [{ ...baseDespesa, mes: MESES[parseInt(m)-1], ano, data: baseDespesa.data.split('-').reverse().join('/') }]; 
      if (isRepetir) { 
          const [anoInt, mesInt, diaInt] = baseDespesa.data.split('-').map(Number); 
          for (let i = mesInt + 1; i <= 12; i++) { 
              despesasParaInserir.push({ ...baseDespesa, mes: MESES[i-1], ano: anoInt, data: `${String(diaInt).padStart(2,'0')}/${String(i).padStart(2,'0')}/${anoInt}`, pago: false }); 
          } 
      } 
      const { data: inserted, error } = await supabase.from('despesas').insert(despesasParaInserir).select(); 
      if (error) {
          console.error("DEBUG:", error);
          if (error.message?.includes('url_comprovante')) showToast('Erro BD: Coluna "url_comprovante" não existe na tabela "despesas". Vá ao painel do Supabase e use ALTER TABLE despesas ADD COLUMN url_comprovante text;', 'error');
          else showToast(`Falha BD: ${error.message}`, 'error');
      } else { 
          setDespesas(prev => [...prev, ...inserted]); 
          showToast('Despesa lançada com sucesso!'); 
          setModalNovaDespesa(false); 
      } 
  };
  const editarDespesa = async (d) => { 
      const { repetir, ...dadosSafe } = d;
      setDespesas(prev => prev.map(x => x.id === dadosSafe.id ? { ...x, ...dadosSafe } : x)); 
      const { error } = await supabase.from('despesas').update(dadosSafe).eq('id', dadosSafe.id); 
      if (error) {
          console.error("DEBUG:", error);
          if (error.message?.includes('url_comprovante')) showToast('Erro BD: Coluna "url_comprovante" não existe na tabela "despesas".', 'error');
          else showToast(`Erro ao editar: ${error.message}`, 'error');
      } else {
          showToast('Despesa atualizada com sucesso.'); 
      }
  };
  const apagarDespesa = async (id) => { 
      const item = despesas.find(x => x.id === id);
      if (item && item.url_comprovante) apagarArquivoStorage(item.url_comprovante);
      await supabase.from('despesas').delete().eq('id', id); 
      setDespesas(despesas.filter(x=>x.id!==id)); 
      showToast("Despesa excluída."); 
  };
  const salvarAviso = async (item) => { const {data, error} = await supabase.from('avisos').insert({...item, user_id:session.user.id, condominio_id: cId}).select().single(); if(!error) { setAvisos([data, ...avisos]); showToast('Aviso publicado!'); } else { showToast("Erro: " + error.message, "error"); } };
  const apagarAviso = async (id) => { await supabase.from('avisos').delete().eq('id',id); setAvisos(avisos.filter(a=>a.id!==id)); showToast('Aviso excluído.'); };
  
  const salvarEnquete = async (item) => { const {data, error} = await supabase.from('enquetes').insert({...item, user_id:session.user.id, condominio_id: cId}).select().single(); if(!error) { setEnquetes([data, ...enquetes]); showToast('Votação criada!'); } else { showToast("Erro: " + error.message, "error"); } };
  const registrarVotoEnquete = async (enqueteId, voto, unidadeId) => { 
      const e = enquetes.find(x => x.id === enqueteId); 
      if(!e) return; 
      
      let novaOpcoes = { sim: 0, nao: 0, votosDetalhados: {}, votaram: [], ...e.opcoes }; 
      if (novaOpcoes.votaram && !novaOpcoes.votosDetalhados) {
          novaOpcoes.votosDetalhados = {}; 
      }

      const votoAnterior = novaOpcoes.votosDetalhados[unidadeId];
      if (votoAnterior === voto) return; 

      if (votoAnterior) { novaOpcoes[votoAnterior] = Math.max(0, novaOpcoes[votoAnterior] - 1); }
      novaOpcoes[voto] = (novaOpcoes[voto] || 0) + 1;
      novaOpcoes.votosDetalhados[unidadeId] = voto;
      
      if (!novaOpcoes.votaram.includes(unidadeId)) {
          novaOpcoes.votaram.push(unidadeId);
      }

      setEnquetes(prev => prev.map(x => x.id === enqueteId ? { ...x, opcoes: novaOpcoes } : x)); 
      const { error } = await supabase.from('enquetes').update({ opcoes: novaOpcoes }).eq('id', enqueteId); 
      if(error) showToast("Erro", "error"); else showToast(votoAnterior ? "Voto alterado!" : "Voto computado com sucesso!"); 
  };
  const apagarEnquete = async (id) => { await supabase.from('enquetes').delete().eq('id',id); setEnquetes(enquetes.filter(e=>e.id!==id)); showToast('Enquete excluída.'); };
  const encerrarEnquete = async (id) => { await supabase.from('enquetes').update({ ativa: false }).eq('id', id); setEnquetes(prev => prev.map(e => e.id === id ? { ...e, ativa: false } : e)); showToast('Votação encerrada!'); };
  
  const abrirChamadoManutencao = async (item) => { const {data, error} = await supabase.from('zeladoria').insert({...item, user_id:session.user.id, condominio_id: cId}).select().single(); if(!error) { setPatrimonio([data, ...patrimonio]); showToast("Chamado aberto!"); } else { showToast("Erro: " + error.message, "error"); } };
  const toggleStatusManutencao = async (id, concluido) => { setPatrimonio(prev => prev.map(p => p.id === id ? { ...p, concluido } : p)); await supabase.from('zeladoria').update({ concluido }).eq('id', id); showToast(concluido ? 'Chamado resolvido!' : 'Chamado reaberto.'); };
  const apagarManutencao = async (id) => { 
      const item = patrimonio.find(x => x.id === id);
      if (item && item.url_foto) apagarArquivoStorage(item.url_foto);
      await supabase.from('zeladoria').delete().eq('id',id); 
      setPatrimonio(patrimonio.filter(p=>p.id!==id)); 
      showToast('Chamado excluído.'); 
  };
  const salvarConfig = async (novaConfig) => { setConfig(novaConfig); await supabase.from('config_geral').upsert({ user_id: session.user.id, condominio_id: cId, dados: novaConfig }, { onConflict: 'condominio_id' }); showToast('Configurações salvas!'); };

  const processarAprovacao = async (pedido, aprovado) => { 
      const novaFila = config.filaAprovacao.filter(f => f.id !== pedido.id); 
      if (aprovado) { 
          const unit = unidades.find(u => u.numero === pedido.numero); 
          if (unit) { 
              await supabase.from('unidades').update({ linked_user_id: pedido.userId }).eq('id', unit.id); 
              await supabase.from('vinculos').insert({ user_id: pedido.userId, condominio_id: cId, role: 'morador', unidade_id: unit.id }); 
              setUnidades(prev => prev.map(u => u.id === unit.id ? { ...u, linked_user_id: pedido.userId } : u)); 
              showToast(`Acesso aprovado para o Apto ${unit.numero}!`); 
          } else {
              showToast("Unidade não encontrada.", "error"); 
          }
      } else {
          showToast("Solicitação rejeitada."); 
      }
      salvarConfig({ ...config, filaAprovacao: novaFila }); 
  };

  const getPagamentosMes = (unidade, chave) => { const [mes, ano] = chave.split('-'); return pagamentos.filter(p => p.unidade_id === unidade.id && p.mes === mes && String(p.ano) === String(ano)); };
  const calcularTotalPago = (pags) => pags.reduce((acc, p) => acc + safeNum(p.valor), 0);
  const fmt = (val) => formatarMoeda(val);
  const fmtPriv = (val) => modoPrivacidade ? 'R$ •••••' : formatarMoeda(val);
  const copiarTexto = (txt) => { navigator.clipboard.writeText(txt).then(() => showToast('Copiado para a área de transferência!')).catch(() => showToast('Erro ao copiar', 'error')); };
  const chaveAtual = `${mesAtual}-${anoAtual}`;
  
  // INADIMPLÊNCIA ACUMULADA - CÁLCULO PRECISO
  const { unidadesFiltradas, inadimplenciaGlobal } = useMemo(() => { 
      let uFilter = unidades;
      if (busca) {
          const b = busca.toLowerCase(); 
          uFilter = uFilter.filter(u => u.numero.toLowerCase().includes(b) || safeStr(u.proprietario?.nome).toLowerCase().includes(b) || safeStr(u.inquilino?.nome).toLowerCase().includes(b));
      }

      const devedoresGlobais = [];
      const valorDevidoMensal = safeNum(config.valorCondominio);
      
      if (valorDevidoMensal > 0) {
          const dataInicioApp = config.inicioOperacao ? config.inicioOperacao.split('-') : [new Date().getFullYear(), String(new Date().getMonth() + 1).padStart(2, '0')];
          const startYear = parseInt(dataInicioApp[0]);
          const startMonth = parseInt(dataInicioApp[1]) - 1; // 0-indexed
          const startIndex = getAbsoluteMonthIndex(startYear, startMonth);
          
          const dataAtual = new Date();
          const currentRealIndex = getAbsoluteMonthIndex(dataAtual.getFullYear(), dataAtual.getMonth());
          
          unidades.forEach(u => {
              let mesesAtraso = 0;
              let valorTotalDevido = 0;

              for (let i = startIndex; i <= currentRealIndex; i++) {
                  const iterYear = Math.floor(i / 12);
                  const iterMonthStr = MESES[i % 12];
                  const pagsNoMes = pagamentos.filter(p => p.unidade_id === u.id && p.mes === iterMonthStr && String(p.ano) === String(iterYear));
                  const pagoNoMes = calcularTotalPago(pagsNoMes);
                  
                  if (pagoNoMes < valorDevidoMensal) {
                      mesesAtraso++;
                      valorTotalDevido += (valorDevidoMensal - pagoNoMes);
                  }
              }

              if (mesesAtraso > 0) {
                  devedoresGlobais.push({ unidade: u, mesesAtraso, valorTotalDevido });
              }
          });
      }

      return { unidadesFiltradas: uFilter, inadimplenciaGlobal: devedoresGlobais };
  }, [unidades, busca, pagamentos, config]);

  const enviarWhatsAppCobranca = (dev) => {
      const u = dev.unidade;
      const foneRaw = safeStr(u.mora_proprietario ? u.proprietario?.telefone : u.inquilino?.telefone);
      const foneNumeros = foneRaw.replace(/\D/g,'');
      
      if (!foneNumeros || foneNumeros.length < 10) {
          showToast("Morador sem WhatsApp válido cadastrado. Edite o Apto primeiro.", "error");
          return;
      }

      const texto = `🏢 *${config.predioNome}*\n\nOlá, morador(a) do *Apto ${u.numero}*.\n\nConsta em nosso sistema um débito de *${fmt(dev.valorTotalDevido)}* referente a ${dev.mesesAtraso} ${dev.mesesAtraso > 1 ? 'cotas pendentes' : 'cota pendente'} de condomínio.\n\nEvite juros e multas regularizando sua situação.\n\n🔑 Nossa Chave PIX: *${config.chavePix}*\n\nPor favor, envie o comprovante assim que realizar o pagamento.\nQualquer dúvida, estou à disposição.`;
      window.open(`https://wa.me/55${foneNumeros}?text=${encodeURIComponent(texto)}`, '_blank');
  };

  // Lógica Matemática dos Gráficos
  const { receitaMes, gastoMes, gastoPagoMes, despesasFiltradas, gastosPorCategoria, saldoTotalReal, saldoAteMesSelecionado, historicoEvolutivo, potencialMes } = useMemo(() => {
      const pgsSelecionado = unidades.filter(u => getPagamentosMes(u, chaveAtual).length > 0);
      const rec = pgsSelecionado.reduce((acc, u) => acc + calcularTotalPago(getPagamentosMes(u, chaveAtual)), 0);
      
      const dpsSelecionado = despesas.filter(d => d.mes === mesAtual && String(d.ano) === String(anoAtual));
      const gas = dpsSelecionado.reduce((acc, d) => acc + safeNum(d.valor), 0);
      const gasPago = dpsSelecionado.filter(d => d.pago !== false).reduce((acc, d) => acc + safeNum(d.valor), 0);
      
      const catMap = {}; dpsSelecionado.forEach(d => { const cat = d.categoria || 'Outros'; catMap[cat] = (catMap[cat] || 0) + safeNum(d.valor); });
      const categoriasChart = Object.keys(catMap).map(c => ({ name: c, value: catMap[c] })).sort((a,b) => b.value - a.value);
      
      const totalEntradasAll = pagamentos.reduce((acc, p) => acc + Number(p.valor), 0);
      const totalSaidasAll = despesas.filter(d => d.pago).reduce((acc, d) => acc + Number(d.valor), 0);
      const saldoGlobalHoje = safeNum(config.saldoInicial) + totalEntradasAll - totalSaidasAll;
      
      const selectedMonthKey = getMonthKey(mesAtual, anoAtual);
      const entradasAteSelecionado = pagamentos.filter(p => getMonthKey(p.mes, p.ano) <= selectedMonthKey).reduce((acc, p) => acc + Number(p.valor), 0);
      const saidasAteSelecionado = despesas.filter(d => d.pago && getMonthKey(d.mes, d.ano) <= selectedMonthKey).reduce((acc, d) => acc + Number(d.valor), 0);
      const saldoAteSelected = safeNum(config.saldoInicial) + entradasAteSelecionado - saidasAteSelecionado;

      const hist = [];
      const mesSelecionadoIndex = MESES.indexOf(mesAtual);
      
      for (let i = 5; i >= 0; i--) { 
          const d = new Date(anoAtual, mesSelecionadoIndex - i, 1);
          const mStr = MESES[d.getMonth()];
          const aNum = d.getFullYear();
          const loopKey = getMonthKey(mStr, aNum);

          const recMesLoop = pagamentos.filter(p => p.mes === mStr && String(p.ano) === String(aNum)).reduce((acc, p) => acc + Number(p.valor), 0);
          const despMesLoop = despesas.filter(d => d.pago !== false && d.mes === mStr && String(d.ano) === String(aNum)).reduce((acc, d) => acc + Number(d.valor), 0);

          const entAteLoop = pagamentos.filter(p => getMonthKey(p.mes, p.ano) <= loopKey).reduce((acc, p) => acc + Number(p.valor), 0);
          const saiAteLoop = despesas.filter(d => d.pago !== false && getMonthKey(d.mes, d.ano) <= loopKey).reduce((acc, d) => acc + Number(d.valor), 0);
          const saldoAbsolutoFimMes = safeNum(config.saldoInicial) + entAteLoop - saiAteLoop;

          hist.push({ mesLabel: `${mStr.substr(0,3).toUpperCase()}/${String(aNum).substr(2,2)}`, receita: recMesLoop, despesa: despMesLoop, saldoFinal: saldoAbsolutoFimMes });
      }

      const pot = unidades.length * safeNum(config.valorCondominio);

      return { receitaMes: rec, gastoMes: gas, gastoPagoMes: gasPago, despesasFiltradas: dpsSelecionado, gastosPorCategoria: categoriasChart, saldoTotalReal: saldoGlobalHoje, saldoAteMesSelecionado: saldoAteSelected, historicoEvolutivo: hist, potencialMes: pot };
  }, [unidades, despesas, pagamentos, chaveAtual, config]);

  

  if (loading && unidades.length === 0 && pagamentos.length === 0) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><RefreshCw className="animate-spin text-[#84cc16]"/><p className="ml-4 font-black text-[#1e293b]">Carregando Condomínio...</p></div>;
  
  // MODO IMPRESSÃO
  if (printMode === 'cartaz') {
      return (
          <div className="bg-white min-h-screen p-10 font-sans z-[10000] relative">
              <div className="text-center mb-10 border-b-4 border-[#1e293b] pb-6"><h1 className="text-5xl font-black text-[#1e293b] uppercase tracking-tighter mb-2">Informações Úteis</h1><h2 className="text-2xl font-bold text-slate-500">{config.predioNome}</h2></div>
              <div className="grid grid-cols-2 gap-8">{config.telefonesUteis && config.telefonesUteis.map((t, idx) => (<div key={idx} className="border-2 border-slate-200 p-6 rounded-3xl"><p className="text-xl font-black text-slate-400 uppercase tracking-widest mb-2">{t.nome}</p><p className="text-3xl font-black text-slate-800 break-words">{t.numero}</p></div>))}</div>
              <div className="mt-16 text-center border-t-2 border-slate-100 pt-8"><p className="text-lg font-bold text-slate-400">Síndico: <span className="text-slate-800">{config.sindicaNome}</span> • {config.telefoneSindico}</p><div className="mt-8 opacity-50"><Logo variant="simple" width="w-40" className="mx-auto" /></div></div>
              <div className="fixed bottom-4 left-0 right-0 text-center no-print"><button onClick={() => setPrintMode(null)} className="bg-slate-800 text-white px-6 py-2 rounded-xl font-bold shadow-xl">Voltar ao App</button></div>
          </div>
      );
  }

  // APP MORADOR
  if (modoMorador && unidadeMorador) return (
      <>
          <ModoMorador unidade={unidadeMorador} config={config} onExit={() => { if(isSindico) { setModoMorador(false); setUnidadeMorador(null); } else { onSwitch(); } }} mesAtual={mesAtual} anoAtual={anoAtual} getPagamentosMes={getPagamentosMes} calcularTotalPago={calcularTotalPago} fmt={fmt} avisos={avisos} enquetes={enquetes} patrimonio={patrimonio} showToast={showToast} copiarTexto={copiarTexto} abrirChamado={abrirChamadoManutencao} registrarVoto={registrarVotoEnquete} modalInstalar={modalInstalar} setModalInstalar={setModalInstalar} setPrintMode={setPrintMode} pagamentosCompletos={pagamentos} setModalReciboVisual={setModalReciboVisual} supabase={supabase} unidadesTotal={unidades.length} />
          {modalReciboVisual && <ModalReciboVisual pagamento={modalReciboVisual.pagamento} unidade={modalReciboVisual.unidade} config={config} onClose={() => setModalReciboVisual(null)} fmt={fmt} enviarWhatsApp={enviarReciboWhatsApp} />}
          {confirmacao && <ModalConfirmacao data={confirmacao} onClose={() => setConfirmacao(null)} />}
      </>
  );

  const maxSaldoEvolucao = Math.max(...historicoEvolutivo.map(h => h.saldoFinal), 1);
  const filaPendente = config.filaAprovacao?.length || 0;
  const porcentagemArrecadada = potencialMes > 0 ? (receitaMes / potencialMes) * 100 : 0;
  const porcentagemGastoPago = gastoMes > 0 ? (gastoPagoMes / gastoMes) * 100 : 0;

  return (
    <div className={`min-h-screen bg-slate-50 font-sans text-slate-800 pb-28 overflow-x-hidden ${printMode ? 'hidden print:block' : 'print:hidden'}`}>
       
       {/* HEADER FIXO SUPERIOR */}
       <div className="bg-[#1e293b] text-white py-3 px-4 flex justify-between items-center sticky top-0 z-40 border-b border-white/5 shadow-xl">
         <div className="flex gap-3 items-center">
             <div className="bg-white p-1 rounded-lg shadow-sm"><Logo variant="icon" width="w-8" /></div>
             <button onClick={onSwitch} className="text-left group cursor-pointer hover:opacity-80 transition">
                 <span className="font-black text-sm truncate max-w-[150px] sm:max-w-xs block leading-tight tracking-tight flex items-center gap-1">{safeStr(config.predioNome)} <RotateCcw size={12} className="text-slate-500 group-hover:text-[#84cc16]"/></span>
                 <span className="text-[10px] text-slate-400 font-bold opacity-80 flex items-center gap-1"><Crown size={10}/> Gestor</span>
             </button>
         </div>
         <div className="flex gap-2 items-center">
             {filaPendente > 0 && ( <button onClick={() => setModalFila(true)} className="relative p-2 bg-red-500 text-white rounded-xl shadow-lg hover:bg-red-600 transition animate-bounce"><UserPlus size={18}/><span className="absolute -top-1 -right-1 w-4 h-4 bg-white text-red-500 font-black text-[9px] rounded-full flex items-center justify-center border-2 border-red-500">{filaPendente}</span></button> )}
             <button onClick={() => setModalInstalar(true)} className="bg-[#84cc16]/10 text-[#84cc16] hover:bg-[#84cc16]/20 py-1.5 px-3 rounded-xl transition flex items-center gap-2 font-black text-[10px]"><MonitorPlay size={14}/> BAIXAR APP</button>
             <button onClick={() => setModalConfig(true)} className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition flex items-center gap-2"><Settings size={18}/></button>
         </div>
       </div>

       {/* HEADER PADRÃO (SEMPRE VISÍVEL) */}
       <header className="bg-[#1e293b] text-white pt-6 px-6 pb-12 relative overflow-hidden text-center">
         <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transform translate-x-1/4 -translate-y-1/4"><Logo variant="icon" width="w-64" /></div>
         <div className="max-w-4xl mx-auto">
             <div className="bg-white/5 backdrop-blur-md p-2 rounded-2xl flex items-center justify-between border border-white/10 w-full max-w-xs mx-auto mb-4">
                 <button onClick={() => { const idx = MESES.indexOf(mesAtual); if(idx > 0) setMesAtual(MESES[idx-1]); else { setAnoAtual(anoAtual-1); setMesAtual(MESES[11]); } }} className="p-3 hover:bg-white/10 rounded-xl transition"><TrendingDown className="rotate-90 w-4 h-4 text-[#84cc16]"/></button>
                 <div><span className="font-black text-xl tracking-tight uppercase">{safeStr(mesAtual)}</span><p className="text-[9px] font-bold text-slate-400 tracking-widest leading-none mt-1">{safeStr(anoAtual)}</p></div>
                 <button onClick={() => { const idx = MESES.indexOf(mesAtual); if(idx < 11) setMesAtual(MESES[idx+1]); else { setAnoAtual(anoAtual+1); setMesAtual(MESES[0]); } }} className="p-3 hover:bg-white/10 rounded-xl transition"><TrendingUp className="rotate-90 w-4 h-4 text-[#84cc16]"/></button>
             </div>
             <div className="flex gap-6 justify-center mt-2 items-center relative">
                 <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Entradas</p><p className="font-black text-green-400">{fmtPriv(receitaMes)}</p></div>
                 <div className="h-10 w-px bg-white/10"></div>
                 <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Saídas</p><p className="font-black text-red-400">-{fmtPriv(gastoMes)}</p></div>
                 <div className="relative ml-2"><button onClick={() => setModoPrivacidade(!modoPrivacidade)} className={`p-2 rounded-full transition ${modoPrivacidade ? 'bg-[#84cc16] text-[#1e293b]' : 'bg-white/10 text-slate-400 hover:bg-white/20'}`}>{modoPrivacidade ? <EyeOff size={16}/> : <Eye size={16}/>}</button></div>
             </div>
         </div>
       </header>

       <main className={`max-w-4xl mx-auto p-4 relative z-10 -mt-8`}>
         
         {/* ABA RECEITAS - MÊS ATUAL */}
         {abaAtiva === 'receitas' && (<div className="space-y-4 animate-in fade-in duration-500">
             
             <Card className="p-6 bg-white border-l-[6px] border-l-[#84cc16] shadow-xl flex flex-col sm:flex-row justify-between items-center text-left gap-4">
                 <div className="w-full sm:w-1/2">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2"><ArrowUpCircle size={14} className="text-[#84cc16]"/> Arrecadação de {mesAtual}</p>
                     <div className="flex items-end gap-2 mb-3">
                         <p className="text-3xl font-black text-[#84cc16]">{fmtPriv(receitaMes)}</p>
                         <p className="text-xs font-bold text-slate-400 mb-1">/ {fmtPriv(potencialMes)}</p>
                     </div>
                     <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden relative">
                         <div className="bg-[#84cc16] h-full absolute top-0 left-0 transition-all duration-500" style={{ width: `${Math.min(porcentagemArrecadada, 100)}%` }}></div>
                     </div>
                 </div>
                 <div className="relative w-full sm:w-auto flex-1 max-w-xs mt-2 sm:mt-0">
                     <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                     <input type="text" placeholder="Buscar Apto" value={busca} onChange={e=>setBusca(e.target.value)} className="pl-9 pr-4 py-4 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-[#84cc16] w-full bg-slate-50"/>
                 </div>
             </Card>

             <div className="grid gap-3">
                 {unidadesFiltradas.length > 0 ? unidadesFiltradas.map(u => { 
                     const valorDevido = safeNum(config.valorCondominio); 
                     const pags = getPagamentosMes(u, chaveAtual); 
                     const totalPago = calcularTotalPago(pags); 
                     const isPago = totalPago >= valorDevido; 
                     const isParcial = totalPago > 0 && totalPago < valorDevido; 
                     return (
                         <Card key={u.id} className={`p-4 border-l-[6px] transition-all hover:shadow-md ${isPago ? 'border-l-[#84cc16]' : (isParcial ? 'border-l-yellow-400' : 'border-l-slate-200')}`}>
                             <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                 <div className="flex gap-4 items-center text-left w-full sm:w-auto">
                                     <div className="w-14 h-14 bg-slate-50 rounded-2xl font-black flex items-center justify-center text-slate-400 text-lg border border-slate-100 relative shrink-0">
                                         {safeStr(u.numero)}
                                         {u.linked_user_id && <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>}
                                     </div>
                                     <div className="flex-1">
                                         <p className="font-black text-slate-800 flex items-center gap-2">{safeStr(u.mora_proprietario ? (u.proprietario?.nome || "Proprietário") : (u.inquilino?.nome || "Morador"))} <button onClick={() => setModalEditar(u)} className="text-slate-300 hover:text-blue-500"><Pencil size={12}/></button></p>
                                         <div className="mt-1">
                                             {totalPago > 0 ? <span className={`text-[10px] font-black uppercase tracking-tighter flex items-center gap-1 ${isPago ? 'text-[#84cc16]' : 'text-yellow-600'}`}><CheckCircle size={10}/> {isPago ? 'PAGO NESTE MÊS' : 'PARCIAL'} • {fmt(totalPago)}</span> : <span className="text-[10px] font-black text-slate-400 tracking-wide uppercase">AGUARDANDO {mesAtual}</span>}
                                         </div>
                                     </div>
                                 </div>
                                 <div className="flex flex-col sm:items-end w-full sm:w-auto gap-2 mt-2 sm:mt-0">
                                     {totalPago > 0 ? (
                                        <button onClick={() => setModalDetalhesUnidade({ u, mes: mesAtual, ano: anoAtual, pags, totalPago, valorDevido })} className="w-full sm:w-auto text-[10px] bg-slate-100 text-slate-600 font-black px-4 py-3 rounded-xl hover:bg-slate-200 flex items-center justify-center gap-2 transition"><Eye size={12}/> EXTRATO DA UNIDADE</button>
                                     ) : (
                                        <button onClick={() => {
                                            const dev = inadimplenciaGlobal.find(d => d.unidade.id === u.id);
                                            // Checamos dev.mesesAtraso > 1 porque o mês atual pode já estar contabilizado como > 0 atrasado.
                                            if (dev && dev.mesesAtraso > 1) {
                                                if (!window.confirm(`⚠️ AVISO: O Apto ${u.numero} possui ${dev.mesesAtraso} meses em aberto (Total: ${fmtPriv(dev.valorTotalDevido)}).\n\nTem certeza que deseja lançar o pagamento isolado apenas do mês de ${mesAtual} ignorando os atrasados?`)) return;
                                            }
                                            setModalPagamento({ unidadeId: u.id, valorSugerido: valorDevido });
                                        }} className="w-full sm:w-auto bg-[#1e293b] text-white text-[10px] font-black px-6 py-3 rounded-2xl shadow-lg active:scale-95 transition hover:bg-black">RECEBER</button>
                                     )}
                                 </div>
                             </div>
                         </Card>
                     ); 
                 }) : <EmptyState icon={Home} title="Nenhum Apartamento" desc="Você ainda não cadastrou nenhuma unidade ou a busca não encontrou resultados." />}
             </div>
         </div>)}

         {/* ABA COBRANÇAS / INADIMPLÊNCIA ACUMULADA */}
         {abaAtiva === 'cobrancas' && (
             <div className="space-y-4 animate-in fade-in duration-500">
                 
                 <Card className="p-6 bg-white border-l-[6px] border-l-red-500 shadow-xl flex justify-between items-center text-left gap-4">
                     <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2"><BadgeAlert size={14} className="text-red-500"/> Inadimplência Total</p>
                         <p className="text-3xl font-black text-red-600">{fmtPriv(inadimplenciaGlobal.reduce((acc, d) => acc + d.valorTotalDevido, 0))}</p>
                     </div>
                     <div className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-center border border-red-100 shadow-sm shrink-0">
                         <p className="text-xl font-black">{inadimplenciaGlobal.length}</p>
                         <p className="text-[8px] uppercase font-bold tracking-widest">Aptos</p>
                     </div>
                 </Card>

                 {inadimplenciaGlobal.length > 0 ? (
                     <div className="grid gap-3 mt-4">
                         {inadimplenciaGlobal.sort((a,b) => b.mesesAtraso - a.mesesAtraso).map(dev => (
                             <Card key={dev.unidade.id} className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-center gap-4 hover:shadow-md transition border-l-[6px] border-l-red-500">
                                 <div className="flex items-center gap-4 text-left w-full sm:w-auto">
                                    <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl font-black flex items-center justify-center text-lg border border-red-100 shrink-0">{dev.unidade.numero}</div>
                                    <div className="flex-1">
                                        <p className="font-black text-slate-800 text-sm">{safeStr(dev.unidade.mora_proprietario ? dev.unidade.proprietario?.nome : dev.unidade.inquilino?.nome) || 'Morador'}</p>
                                        <p className="text-[10px] font-black text-red-500 uppercase mt-1 bg-red-50 px-2 py-0.5 rounded-md inline-block">{dev.mesesAtraso} {dev.mesesAtraso > 1 ? 'cotas pendentes' : 'cota pendente'}</p>
                                    </div>
                                 </div>
                                 <div className="flex items-center justify-between w-full sm:w-auto gap-4 mt-2 sm:mt-0 border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100">
                                     <div className="text-left sm:text-right">
                                         <p className="text-[9px] font-bold text-slate-400 uppercase">Dívida Total</p>
                                         <p className="font-black text-lg text-slate-800">{fmtPriv(dev.valorTotalDevido)}</p>
                                     </div>
                                     <button onClick={() => enviarWhatsAppCobranca(dev)} className="bg-[#1e293b] text-white px-5 py-3 rounded-xl text-[10px] font-black flex items-center gap-2 hover:bg-black transition whitespace-nowrap active:scale-95 shadow-lg"><MessageCircle size={14}/> COBRAR</button>
                                 </div>
                             </Card>
                         ))}
                     </div>
                 ) : (
                     <div className="mt-4"><EmptyState icon={ThumbsUp} title="Zero Inadimplência" desc={`Parabéns! Nenhum apartamento está com débitos anteriores acumulados.`} /></div>
                 )}
             </div>
         )}

         {/* ABA DESPESAS */}
         {abaAtiva === 'despesas' && (<div className="space-y-4 animate-in fade-in duration-500">
             
             <Card className="p-6 bg-white border-l-[6px] border-l-orange-500 shadow-xl flex flex-col sm:flex-row justify-between items-center text-left gap-4">
                 <div className="w-full sm:w-1/2">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2"><ArrowDownCircle size={14} className="text-orange-500"/> Gastos de {mesAtual}</p>
                     <div className="flex items-end gap-2 mb-3">
                         <p className="text-3xl font-black text-orange-600">{fmtPriv(gastoMes)}</p>
                     </div>
                     <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden relative flex">
                         <div className="bg-orange-500 h-full absolute top-0 left-0 transition-all duration-500" style={{ width: `${Math.min(porcentagemGastoPago, 100)}%` }}></div>
                     </div>
                     <p className="text-[9px] font-bold text-slate-400 mt-2 flex justify-between uppercase"><span>Pago: {fmtPriv(gastoPagoMes)}</span><span>Pendente: {fmtPriv(gastoMes - gastoPagoMes)}</span></p>
                 </div>
                 <button onClick={() => setModalNovaDespesa(true)} className="w-full sm:w-auto bg-orange-500 text-white px-5 py-4 rounded-2xl font-black text-xs shadow-lg flex items-center justify-center gap-2 hover:bg-orange-600 transition active:scale-95 shrink-0"><PlusCircle size={18}/> LANÇAR CONTA</button>
             </Card>

             {despesasFiltradas.length === 0 && (<div className="mt-4"><EmptyState icon={FileCheck} title="Nenhuma Conta" desc={`Ainda não foram lançadas despesas em ${mesAtual}.`} action={() => setModalNovaDespesa(true)} label="Lançar Primeira"/></div>)}
             <div className="grid gap-2">
                 {despesasFiltradas.map(d => { 
                     const isPago = d.pago !== false; 
                     return (
                         <Card key={d.id} className={`p-4 flex flex-col sm:flex-row justify-between items-center text-left border-l-4 ${isPago ? 'border-l-slate-400' : 'border-l-orange-400 bg-orange-50/10'}`}>
                             <div className="w-full sm:w-auto"><p className={`font-black flex items-center gap-2 text-slate-800`}>{safeStr(d.descricao)}{d.url_comprovante && <a href={d.url_comprovante} target="_blank" rel="noopener noreferrer" className="bg-slate-100 text-slate-500 p-1 rounded-md hover:bg-blue-100 hover:text-blue-600 transition"><Paperclip size={12}/></a>}</p><div className="flex gap-2 mt-1"><div className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">{getIconeCategoria(d.categoria)}<span className="text-[9px] uppercase font-black text-slate-500">{safeStr(d.categoria)}</span></div><span className="text-[10px] font-bold text-slate-400 self-center">{safeStr(d.data)}</span></div></div>
                             <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end mt-4 sm:mt-0"><div className="text-right mr-2"><p className={`font-black ${isPago ? 'text-slate-800' : 'text-orange-500'}`}>-{fmt(d.valor)}</p><span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${isPago ? 'bg-slate-100 text-slate-600' : 'bg-orange-100 text-orange-600'}`}>{isPago ? 'PAGO' : 'PENDENTE'}</span></div><div className="flex gap-1 items-center"><button onClick={() => editarDespesa({...d, pago: !isPago})} className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase transition flex items-center gap-1 shadow-sm ${isPago ? 'bg-slate-100 text-slate-400 hover:bg-slate-200' : 'bg-slate-600 text-white hover:bg-slate-800'}`}>{isPago ? <RotateCcw size={12}/> : <Check size={12}/>} {isPago ? 'DESFAZER' : 'PAGAR'}</button><button onClick={() => setModalEditarDespesa(d)} className="p-2 text-slate-300 hover:text-blue-500"><Edit size={16}/></button><button onClick={() => setConfirmacao({ titulo: "Apagar Conta?", texto: "Tem certeza que deseja apagar este lançamento?", onConfirm: () => { apagarDespesa(d.id); setConfirmacao(null); } })} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={16}/></button></div></div>
                         </Card>
                     ); 
                 })}
             </div>
         </div>)}

         {/* ABA CAIXA (DASHBOARD) */}
         {abaAtiva === 'caixa' && (<div className="space-y-6 animate-in fade-in duration-500 text-left">
             <div className="bg-[#1e293b] text-white p-8 rounded-[32px] shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none transform translate-x-1/4 -translate-y-1/4"><PieChartIcon size={200}/></div>
                 <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-end gap-6">
                     <div>
                         <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 flex items-center gap-2"><Target size={14} className="text-[#84cc16]"/> Saldo em Caixa Hoje</p>
                         <h2 className="text-4xl sm:text-5xl font-black mb-4 tracking-tighter">{fmtPriv(saldoTotalReal)}</h2>
                         <div className="pt-4 border-t border-white/10 flex flex-col gap-1">
                             <div className="flex items-center gap-2">
                                 <History size={12} className="text-slate-400"/> 
                                 <span className="text-[10px] text-slate-400 uppercase font-bold">Acumulado até final de {safeStr(mesAtual)}/{safeStr(anoAtual)}: <span className="text-white">{fmtPriv(saldoAteMesSelecionado)}</span></span>
                             </div>
                         </div>
                     </div>
                     <button onClick={() => setModalRelatorio(true)} className="bg-[#84cc16] text-[#1e293b] py-3 px-6 rounded-2xl font-black text-xs shadow-xl flex items-center justify-center gap-2 hover:bg-[#a3e635] transition w-full md:w-auto active:scale-95"><FileBarChart size={18}/> PRESTAÇÃO DE CONTAS</button>
                 </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Evolução de Saldo */}
                 <Card className="p-6 col-span-1">
                     <div className="flex justify-between items-center mb-10"><h3 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><LineChart size={14}/> Evolução de Saldo</h3></div>
                     <div className="flex items-end justify-between gap-2 h-32 mt-4 px-2">
                         {historicoEvolutivo.map((h, i) => {
                             const percentual = maxSaldoEvolucao > 0 ? (h.saldoFinal / maxSaldoEvolucao) * 100 : 0;
                             const alturaBarra = h.saldoFinal > 0 ? Math.max(percentual, 3) : 0;
                             return ( <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end"><div className="w-full flex-1 flex items-end justify-center relative"><div className="w-full max-w-[40px] bg-[#a3e635] rounded-t-md relative flex items-end justify-center transition-all duration-300 shadow-sm" style={{ height: `${alturaBarra}%` }}>{h.saldoFinal > 0 && ( <span className="absolute -top-5 text-[9px] font-black text-slate-600 whitespace-nowrap animate-in fade-in"> {formatarInteiro(h.saldoFinal)} </span> )}</div></div><span className="text-[9px] font-bold text-slate-400">{h.mesLabel}</span></div> )
                         })}
                     </div>
                 </Card>

                 {/* Gastos do Mês */}
                 <Card className="p-6 col-span-1">
                     <div className="flex justify-between items-center mb-6"><h3 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><PieChart size={14}/> Gastos de {mesAtual}</h3><span className="text-[10px] bg-red-50 text-red-600 px-2 py-1 rounded-full font-black">-{fmtPriv(gastoMes)}</span></div>
                     <div className="flex flex-col sm:flex-row items-center gap-6">
                         <div className="relative w-32 h-32 rounded-full shrink-0 shadow-inner" style={{ background: generateConicGradient(gastosPorCategoria, gastoMes) }}>
                             <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center flex-col"><span className="text-[9px] font-bold text-slate-400 uppercase">Total</span><span className="text-xs font-black text-slate-800">{fmtPriv(gastoMes)}</span></div>
                         </div>
                         <div className="flex-1 w-full space-y-2 max-h-32 overflow-y-auto pr-2">
                             {gastosPorCategoria.length > 0 ? gastosPorCategoria.map((cat, i) => ( <div key={i} className="flex items-center justify-between text-xs p-1 hover:bg-slate-50 rounded"><div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}></div><span className="font-bold text-slate-600 truncate max-w-[100px]" title={cat.name}>{cat.name}</span></div><span className="font-black text-slate-400 text-[10px]">{((cat.value / (gastoMes || 1)) * 100).toFixed(0)}%</span></div> )) : <p className="text-center text-slate-300 text-xs italic w-full">Nenhuma despesa lançada.</p>}
                         </div>
                     </div>
                 </Card>
             </div>
         </div>)}

         {/* ABA FERRAMENTAS */}
         {abaAtiva === 'mais' && (<div className="space-y-6 animate-in fade-in duration-500">
             <div className="bg-[#1e293b] p-6 rounded-b-[40px] text-center shadow-lg -mt-4 pb-10 mb-2">
                 <div className="flex justify-center mb-2"><Logo variant="full" width="w-48" className="brightness-0 invert opacity-90" /></div>
                 <p className="text-slate-400 text-xs font-medium mt-0">Recursos do Condomínio</p>
             </div>
             
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4 px-2">
                 <button onClick={() => setModalManutencao(true)} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 hover:shadow-md transition active:scale-95 group relative">
                     <div className="bg-slate-50 text-slate-600 p-4 rounded-2xl relative group-hover:bg-[#84cc16]/10 group-hover:text-[#84cc16] transition"><Wrench size={24}/>{patrimonio.filter(p=>!p.concluido).length > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white"></span>}</div>
                     <span className="font-black text-slate-700 text-[10px] uppercase tracking-widest flex items-center gap-1">Manutenção</span>
                 </button>
                 
                 <button onClick={() => setModalAvisos(true)} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 hover:shadow-md transition active:scale-95 group">
                     <div className="bg-orange-50 text-orange-500 p-4 rounded-2xl group-hover:bg-orange-100 transition"><Megaphone size={24}/></div><span className="font-black text-slate-700 text-[10px] uppercase tracking-widest flex items-center gap-1">Mural</span>
                 </button>
                 
                 <button onClick={() => setModalEnquete(true)} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 hover:shadow-md transition active:scale-95 group">
                     <div className="bg-blue-50 text-blue-500 p-4 rounded-2xl group-hover:bg-blue-100 transition"><Vote size={24}/></div><span className="font-black text-slate-700 text-[10px] uppercase tracking-widest flex items-center gap-1">Enquetes</span>
                 </button>

                 <button onClick={() => setModalTelefones(true)} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 hover:shadow-md transition active:scale-95 group relative">
                     <div className="absolute top-2 right-2 bg-slate-100 text-slate-400 p-1 rounded-full"><Printer size={10}/></div><div className="bg-teal-50 text-teal-600 p-4 rounded-2xl group-hover:bg-teal-100 transition"><Contact size={24}/></div><span className="font-black text-slate-700 text-[10px] uppercase tracking-widest text-center">Contatos & Info</span>
                 </button>
                 
                 <button onClick={() => setModalFila(true)} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 hover:shadow-md transition active:scale-95 group relative">
                     {filaPendente > 0 && <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white font-black text-[9px] rounded-full flex items-center justify-center">{filaPendente}</span>}<div className="bg-purple-50 text-purple-600 p-4 rounded-2xl group-hover:bg-purple-100 transition"><UserPlus size={24}/></div><span className="font-black text-slate-700 text-[10px] uppercase tracking-widest text-center">Moradores</span>
                 </button>

                 <button onClick={() => setModalConfig(true)} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 hover:shadow-md transition active:scale-95 group">
                     <div className="bg-slate-50 text-slate-600 p-4 rounded-2xl group-hover:bg-slate-200 transition"><Settings size={24}/></div><span className="font-black text-slate-700 text-[10px] uppercase tracking-widest">Ajustes</span>
                 </button>
             </div>
         </div>)}
       </main>

       {/* NAV BAR INFERIOR PADRÃO */}
       <nav className="fixed bottom-0 left-0 right-0 bg-white/90 border-t border-slate-100 px-2 py-4 flex justify-around items-end z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pb-10 backdrop-blur-xl">
          <NavBtn active={abaAtiva === 'receitas'} onClick={() => setAbaAtiva('receitas')} icon={<ArrowUpCircle size={22}/>} label="Receitas" />
          <NavBtn active={abaAtiva === 'despesas'} onClick={() => setAbaAtiva('despesas')} icon={<ArrowDownCircle size={22}/>} label="Despesas" />
          <NavBtn active={abaAtiva === 'cobrancas'} onClick={() => setAbaAtiva('cobrancas')} icon={<AlertTriangle size={22}/>} label="Cobranças" badgeCount={inadimplenciaGlobal.length} />
          <NavBtn active={abaAtiva === 'caixa'} onClick={() => setAbaAtiva('caixa')} icon={<PieChartIcon size={22}/>} label="Dashboard" />
          <NavBtn active={abaAtiva === 'mais'} onClick={() => setAbaAtiva('mais')} icon={<Grid size={22}/>} label="Mais" />
       </nav>

      {/* TODOS OS MODAIS IMPLEMENTADOS (COM Z-INDEX HIERÁRQUICO SEGURO) */}
      {confirmacao && <ModalConfirmacao data={confirmacao} onClose={() => setConfirmacao(null)} />}
      
      {modalPagamento && <ModalReceber showToast={showToast} valorSugerido={modalPagamento.valorSugerido} onClose={() => setModalPagamento(null)} onConfirm={(v,d,url) => { adicionarPagamento(modalPagamento.unidadeId, v, d, url); setModalPagamento(null); }} supabase={supabase} />}
      
      {modalDetalhesUnidade && <ModalDetalhesUnidade showToast={showToast} dados={modalDetalhesUnidade} onAdd={(v,d,url) => { adicionarPagamento(modalDetalhesUnidade.u.id, v, d, url); setModalDetalhesUnidade({...modalDetalhesUnidade, pags: [...modalDetalhesUnidade.pags, {id: generateId(), valor: v, data: d, url_comprovante: url}]}); }} onDelete={(pid) => setConfirmacao({ titulo: "Apagar Pagamento?", texto: "Tem certeza que deseja remover este recebimento?", onConfirm: () => { removerPagamento(pid); setModalDetalhesUnidade({...modalDetalhesUnidade, pags: modalDetalhesUnidade.pags.filter(p=>p.id!==pid)}); setConfirmacao(null); } })} onClose={() => setModalDetalhesUnidade(null)} fmt={fmt} enviarRecibo={enviarReciboWhatsApp} supabase={supabase} setModalReciboVisual={setModalReciboVisual} onUpdatePagamento={atualizarComprovantePagamento} />}
      
      {modalReciboVisual && <ModalReciboVisual pagamento={modalReciboVisual.pagamento} unidade={modalReciboVisual.unidade} config={config} onClose={() => setModalReciboVisual(null)} fmt={fmt} enviarWhatsApp={enviarReciboWhatsApp} />}

      {modalNovaDespesa && <ModalDespesa showToast={showToast} supabase={supabase} categorias={config.categorias} onClose={() => setModalNovaDespesa(false)} onSave={salvarNovaDespesa} />}
      
      {modalEditarDespesa && <ModalDespesa showToast={showToast} supabase={supabase} categorias={config.categorias} despesaParaEditar={modalEditarDespesa} onClose={() => setModalEditarDespesa(null)} onSave={(d) => { editarDespesa({...d, id: modalEditarDespesa.id}); setModalEditarDespesa(null); }} />}
      
      {modalEditar && <ModalEditarUnidade u={modalEditar} onClose={() => setModalEditar(null)} onSave={(novo) => { supabase.from('unidades').update(novo).eq('id',novo.id).then(()=>{ setUnidades(unidades.map(x=>x.id===novo.id?novo:x)); setModalEditar(null); showToast("Dados salvos!"); }); }} ativarModoMorador={() => { setUnidadeMorador(modalEditar); setModoMorador(true); setModalEditar(null); }} config={config} cId={cId} />}
      
      {modalConfig && <ModalConfiguracoes config={config} setConfig={salvarConfig} onClose={() => setModalConfig(false)} triggerConfirm={setConfirmacao} resetar={resetarSistema} showToast={showToast} exportarBackup={exportarBackup} supabase={supabase} />}
      
      {modalRelatorio && <ModalRelatorio receita={receitaMes} despesa={gastoMes} saldo={saldoAteMesSelecionado} despesas={despesasFiltradas} pagamentos={pagamentos.filter(p => p.mes === mesAtual && String(p.ano) === String(anoAtual))} unidades={unidades} mes={mesAtual} ano={anoAtual} onClose={() => setModalRelatorio(false)} fmt={fmt} exportarCSV={exportarCSV} config={config} />}
      
      {modalManutencao && <ModalManutencao lista={patrimonio} onClose={() => setModalManutencao(false)} onToggle={toggleStatusManutencao} onDelete={(id) => setConfirmacao({ titulo: "Apagar Chamado?", texto: "Isso removerá o histórico.", onConfirm: () => { apagarManutencao(id); setConfirmacao(null); } })} />}
      
      {modalAvisos && <ModalAvisos lista={avisos} onClose={() => setModalAvisos(false)} onSave={salvarAviso} onDelete={(id) => setConfirmacao({ titulo: "Apagar Aviso?", texto: "Ele sumirá do app dos moradores.", onConfirm: () => { apagarAviso(id); setConfirmacao(null); } })} supabase={supabase} />}
      
      {modalEnquete && <ModalEnquete lista={enquetes} onClose={() => setModalEnquete(false)} onSave={salvarEnquete} onDelete={(id) => setConfirmacao({ titulo: "Apagar Enquete?", texto: "Os votos serão perdidos se excluir.", onConfirm: () => { apagarEnquete(id); setConfirmacao(null); } })} onEncerrar={encerrarEnquete} unidadesTotal={unidades.length} />}
      
      {modalTelefones && <ModalTelefonesUteis config={config} setConfig={salvarConfig} onClose={() => setModalTelefones(false)} setPrintMode={setPrintMode} />}
      
      {modalFila && <ModalFilaAprovacao fila={config.filaAprovacao} onClose={() => setModalFila(false)} processarAprovacao={processarAprovacao} />}
      
      {modalInstalar && <ModalInstalarApp onClose={() => setModalInstalar(false)} />}
    </div>
  );
}


function ModalConfirmacao({ data, onClose }) {
    // Modal de Confirmação Crítico: z-[10100]
    return (
        <div className="fixed inset-0 bg-[#1e293b]/90 z-[10100] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-[32px] p-6 max-w-sm w-full shadow-2xl animate-in zoom-in text-center">
                <div className="bg-red-50 text-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={32}/></div>
                <h3 className="text-xl font-black text-slate-800 mb-2">{data.titulo}</h3>
                <p className="text-sm text-slate-500 mb-6">{data.texto}</p>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 text-slate-500 font-bold bg-slate-100 rounded-xl hover:bg-slate-200 transition">Cancelar</button>
                    <button onClick={data.onConfirm} className="flex-1 py-3 text-white font-black bg-red-500 rounded-xl hover:bg-red-600 transition shadow-lg">Confirmar</button>
                </div>
            </div>
        </div>
    );
}

export function ModalInstalarApp({ onClose }) {
    return (
        <div className="fixed inset-0 bg-[#1e293b]/90 z-[9000] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in text-center relative overflow-hidden">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800"><X size={20}/></button>
                <div className="bg-[#84cc16]/10 text-[#84cc16] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"><MonitorPlay size={40}/></div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">Instale o App</h3>
                <p className="text-sm text-slate-500 mb-6 font-medium">O CondoLeve funciona direto no seu celular como um aplicativo nativo.</p>
                {/* CORREÇÃO DO DOM NESTING (DIVs em vez de tags P com DIVs dentro) */}
                <div className="text-left bg-slate-50 p-4 rounded-2xl space-y-3 mb-6">
                    <div className="text-xs font-bold text-slate-700 flex items-start gap-2"><div className="bg-[#1e293b] text-white w-5 h-5 rounded flex items-center justify-center shrink-0">1</div> Abra as opções do seu navegador (três pontinhos ou botão compartilhar).</div>
                    <div className="text-xs font-bold text-slate-700 flex items-start gap-2"><div className="bg-[#1e293b] text-white w-5 h-5 rounded flex items-center justify-center shrink-0">2</div> Escolha "Adicionar à Tela Inicial".</div>
                    <div className="text-xs font-bold text-slate-700 flex items-start gap-2"><div className="bg-[#1e293b] text-white w-5 h-5 rounded flex items-center justify-center shrink-0">3</div> Confirme e acesse o ícone na sua tela inicial!</div>
                </div>
                <button onClick={onClose} className="w-full bg-[#1e293b] text-white py-4 rounded-xl font-black text-xs hover:bg-black transition">ENTENDI</button>
            </div>
        </div>
    );
}

function ModalReceber({ valorSugerido, onClose, onConfirm, supabase, showToast }) {
    const [valor, setValor] = useState(valorSugerido || '');
    const [data, setData] = useState(new Date().toLocaleDateString('pt-BR'));
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);

    const handleUpload = async (e) => {
        try {
            setLoading(true);
            const file = e.target.files[0];
            if(!file) return;
            const nome = `pgto_${Date.now()}.${file.name.split('.').pop()}`;
            // PROTEÇÃO ANTI-404: Verifica o erro antes de seguir
            const { error } = await supabase.storage.from('comprovantes').upload(nome, file);
            if (error) { showToast("Falha no upload: " + error.message, "error"); return; }
            const { data: pubData } = supabase.storage.from('comprovantes').getPublicUrl(nome);
            setUrl(pubData.publicUrl);
        } catch(err) {
            console.error(err); showToast("Erro inesperado no upload", "error");
        } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-[#1e293b]/90 z-[9000] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-[32px] p-6 max-w-sm w-full shadow-2xl animate-in zoom-in">
                <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2"><DollarSign className="text-green-500"/> Receber Pagamento</h3>
                <div className="space-y-4">
                    <label className="block"><span className="text-[10px] font-black text-slate-400 uppercase">Valor (R$)</span><input type="number" value={valor} onChange={e=>setValor(e.target.value)} className="w-full border p-3 rounded-xl font-bold text-green-600 outline-none focus:border-[#84cc16]"/></label>
                    <label className="block"><span className="text-[10px] font-black text-slate-400 uppercase">Data (DD/MM/AAAA)</span><input value={data} onChange={e=>setData(e.target.value)} className="w-full border p-3 rounded-xl font-bold outline-none focus:border-[#84cc16]"/></label>
                    <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200 text-center">
                        <label className="cursor-pointer text-xs font-bold text-slate-500 flex flex-col items-center gap-2 hover:text-[#84cc16] transition">
                            {loading ? <RefreshCw className="animate-spin text-slate-400" size={24}/> : (url ? <CheckCircle className="text-green-500" size={24}/> : <Upload className="text-slate-400" size={24}/>)}
                            {url ? 'Comprovante Anexado!' : 'Anexar Comprovante (Opcional)'}
                            <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleUpload}/>
                        </label>
                    </div>
                </div>
                <div className="flex gap-3 mt-6">
                    <button onClick={onClose} className="flex-1 py-3 text-slate-500 font-bold bg-slate-100 rounded-xl hover:bg-slate-200">Cancelar</button>
                    <button onClick={() => onConfirm(Number(valor), data, url)} className="flex-1 py-3 text-white font-black bg-[#1e293b] rounded-xl hover:bg-black shadow-lg">Confirmar</button>
                </div>
            </div>
        </div>
    );
}

function ModalDetalhesUnidade({ dados, onClose, onAdd, onDelete, fmt, enviarRecibo, supabase, setModalReciboVisual, onUpdatePagamento, showToast }) {
    const { u, mes, ano, pags, totalPago, valorDevido } = dados;
    const isPago = totalPago >= valorDevido;

    const handleUploadExistente = async (e, pid) => {
        try {
            const file = e.target.files[0];
            if(!file) return;
            const nome = `pgto_upd_${Date.now()}.${file.name.split('.').pop()}`;
            // PROTEÇÃO ANTI-404
            const { error } = await supabase.storage.from('comprovantes').upload(nome, file);
            if (error) { showToast("Falha no upload: " + error.message, "error"); return; }
            const { data: pubData } = supabase.storage.from('comprovantes').getPublicUrl(nome);
            onUpdatePagamento(pid, pubData.publicUrl);
        } catch(err) { console.error(err); showToast("Erro inesperado", "error"); }
    };

    return (
        <div className="fixed inset-0 bg-[#1e293b]/90 z-[9000] flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm">
            <div className="bg-white rounded-t-[32px] sm:rounded-[32px] w-full max-w-md p-6 shadow-2xl animate-in slide-in-from-bottom-10 flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <div>
                        <h3 className="font-black text-xl text-slate-800">Apto {u.numero}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{mes}/{ano}</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><X size={20}/></button>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4 flex justify-between items-center">
                    <div><p className="text-[10px] font-black text-slate-400 uppercase">Total Pago</p><p className={`text-2xl font-black ${isPago ? 'text-[#84cc16]' : 'text-yellow-600'}`}>{fmt(totalPago)}</p></div>
                    <div className="text-right"><p className="text-[10px] font-black text-slate-400 uppercase">Fatura</p><p className="text-lg font-bold text-slate-600">{fmt(valorDevido)}</p></div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase border-b pb-1">Histórico deste Mês</p>
                    {pags.map(p => (
                        <div key={p.id} className="bg-white border border-slate-200 p-3 rounded-xl flex justify-between items-center shadow-sm">
                            <div><p className="font-black text-slate-800">{fmt(p.valor)}</p><p className="text-[9px] font-bold text-slate-400 uppercase">{p.data}</p></div>
                            <div className="flex gap-2">
                                {p.url_comprovante ? (
                                    <a href={p.url_comprovante} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-100"><Paperclip size={14}/></a>
                                ) : (
                                    <label className="p-2 bg-slate-100 text-slate-400 rounded-lg hover:bg-slate-200 cursor-pointer"><Upload size={14}/><input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => handleUploadExistente(e, p.id)}/></label>
                                )}
                                <button onClick={() => {onClose(); setModalReciboVisual({pagamento: p, unidade: u});}} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"><Receipt size={14}/></button>
                                <button onClick={() => enviarRecibo(p, u)} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"><Share2 size={14}/></button>
                                <button onClick={() => onDelete(p.id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"><Trash2 size={14}/></button>
                            </div>
                        </div>
                    ))}
                    {pags.length === 0 && <p className="text-center text-xs text-slate-400 py-4 italic">Nenhum pagamento registrado.</p>}
                </div>

                {!isPago && (
                    <button onClick={() => {
                        const val = prompt("Valor recebido:");
                        const dat = prompt("Data (DD/MM/AAAA):", new Date().toLocaleDateString('pt-BR'));
                        if(val && dat) onAdd(Number(val), dat, null);
                    }} className="w-full bg-[#1e293b] text-white py-4 rounded-xl font-black text-xs hover:bg-black shadow-lg flex justify-center items-center gap-2"><PlusCircle size={16}/> ADICIONAR NOVO PAGAMENTO</button>
                )}
            </div>
        </div>
    );
}

function ModalReciboVisual({ pagamento, unidade, config, onClose, fmt, enviarWhatsApp }) {
    const [gerando, setGerando] = useState(false);

    const baixarImagem = async () => {
        const elemento = document.getElementById('recibo-pdf');
        if (!elemento) return;
        setGerando(true);
        try {
            const canvas = await html2canvas(elemento, { scale: 3, backgroundColor: '#ffffff', useCORS: true });
            const dataUrl = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = `Recibo_Apto_${unidade.numero}_${pagamento.mes}_${pagamento.ano}.png`;
            a.click();
        } catch(err) { console.error("Erro ao gerar imagem:", err); } finally { setGerando(false); }
    };

    const copiarImagem = async () => {
        const elemento = document.getElementById('recibo-pdf');
        if (!elemento) return;
        setGerando(true);
        try {
            const canvas = await html2canvas(elemento, { scale: 3, backgroundColor: '#ffffff', useCORS: true });
            canvas.toBlob(async (blob) => {
                try {
                    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                    alert('Imagem copiada! É só colar (Ctrl+V) na conversa do WhatsApp.');
                } catch(e) { alert('Seu navegador bloqueou a cópia direta. Use o botão BAIXAR.'); }
            }, 'image/png');
        } catch(err) { console.error("Erro ao copiar imagem:", err); } finally { setGerando(false); }
    };

    return (
        <div className="fixed inset-0 bg-[#1e293b]/95 z-[9500] flex items-center justify-center p-4 backdrop-blur-md">
            <div className="w-full max-w-sm relative animate-in zoom-in duration-300">
                <button onClick={onClose} className="absolute -top-12 right-0 text-white hover:text-red-400 transition"><LucideIcons.X size={32}/></button>
                <div className="bg-white rounded-[24px] p-8 shadow-2xl relative overflow-hidden font-mono" id="recibo-pdf">
                    <div className="text-center mb-6">
                        <Logo variant="simple" width="w-24" className="mx-auto mb-2 grayscale opacity-50"/>
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest mt-2">Recibo de Pagamento</h2>
                    </div>

                    <div className="space-y-4 text-xs font-bold text-slate-600 border-y-2 border-dashed border-slate-200 py-6 my-6">
                        <div className="flex justify-between"><span className="text-slate-400">Condomínio:</span> <span className="text-right">{config.predioNome}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Unidade:</span> <span className="text-right text-sm text-[#1e293b] font-black">Apto {unidade.numero}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Data Pagto:</span> <span className="text-right">{pagamento.data}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Referência:</span> <span className="text-right">{pagamento.mes}/{pagamento.ano}</span></div>
                        <div className="flex justify-between mt-4 pt-4 border-t border-slate-100 items-end">
                            <span className="text-slate-400 uppercase">Valor Pago</span>
                            <span className="text-2xl font-black text-green-600">{fmt(pagamento.valor)}</span>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg text-center break-all">
                        <p className="text-[8px] text-slate-400 uppercase tracking-widest mb-1">Chave de Autenticidade</p>
                        <p className="text-xs font-black text-slate-700">{pagamento.hash_recibo || 'GERADO-MANUALMENTE'}</p>
                    </div>
                </div>
                <div className="flex gap-2 mt-4 flex-col sm:flex-row">
                    <div className="flex gap-2 w-full">
                        <button onClick={copiarImagem} disabled={gerando} className="flex-1 bg-white text-slate-600 py-3 rounded-xl font-black text-[10px] hover:bg-slate-100 shadow-lg flex justify-center items-center gap-1 transition disabled:opacity-50"><LucideIcons.Copy size={14}/> COPIAR</button>
                        <button onClick={baixarImagem} disabled={gerando} className="flex-1 bg-white text-slate-600 py-3 rounded-xl font-black text-[10px] hover:bg-slate-100 shadow-lg flex justify-center items-center gap-1 transition disabled:opacity-50"><LucideIcons.Download size={14}/> BAIXAR</button>
                    </div>
                    <button onClick={() => enviarWhatsApp(pagamento, unidade)} className="w-full sm:w-auto bg-[#84cc16] text-[#1e293b] px-4 py-3 rounded-xl font-black text-[10px] hover:bg-[#a3e635] shadow-lg flex justify-center items-center gap-2 transition"><LucideIcons.Share2 size={16}/> WHATSAPP</button>
                </div>
            </div>
        </div>
    );
}

function ModalDespesa({ supabase, categorias, onClose, onSave, despesaParaEditar = null, showToast }) {
    const isEdit = !!despesaParaEditar;
    const [form, setForm] = useState(despesaParaEditar || { descricao: '', valor: '', data: new Date().toISOString().split('T')[0], categoria: categorias[0], pago: true, repetir: false, url_comprovante: '' });
    const [loadingUpload, setLoadingUpload] = useState(false);

    const handleUpload = async (e) => {
        try {
            setLoadingUpload(true);
            const file = e.target.files[0];
            if(!file) return;
            const nome = `desp_${Date.now()}.${file.name.split('.').pop()}`;
            // PROTEÇÃO ANTI-404
            const { error } = await supabase.storage.from('comprovantes').upload(nome, file);
            if (error) { showToast("Falha no upload: " + error.message, "error"); return; }
            const { data } = supabase.storage.from('comprovantes').getPublicUrl(nome);
            setForm({...form, url_comprovante: data.publicUrl});
        } catch(err) { console.error(err); showToast("Erro inesperado", "error"); } finally { setLoadingUpload(false); }
    };

    return (
        <div className="fixed inset-0 bg-[#1e293b]/90 z-[9000] flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm">
            <div className="bg-white rounded-t-[32px] sm:rounded-[32px] w-full max-w-md p-6 shadow-2xl animate-in slide-in-from-bottom-10 flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center mb-6 border-b pb-4"><h3 className="font-black text-xl text-slate-800 flex items-center gap-2"><ArrowDownCircle className="text-orange-500"/> {isEdit ? 'Editar Conta' : 'Lançar Conta'}</h3><button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><X size={20}/></button></div>
                <div className="overflow-y-auto pr-2 space-y-4 mb-4">
                    <label className="block"><span className="text-[10px] font-black text-slate-400 uppercase">Descrição</span><input value={form.descricao} onChange={e=>setForm({...form, descricao:e.target.value})} className="w-full border p-3 rounded-xl font-bold outline-none focus:border-orange-500" placeholder="Ex: Conta de Luz"/></label>
                    <div className="flex gap-3">
                        <label className="block flex-1"><span className="text-[10px] font-black text-slate-400 uppercase">Valor (R$)</span><input type="number" value={form.valor} onChange={e=>setForm({...form, valor:Number(e.target.value)})} className="w-full border p-3 rounded-xl font-black text-orange-600 outline-none focus:border-orange-500"/></label>
                        <label className="block flex-1"><span className="text-[10px] font-black text-slate-400 uppercase">Vencimento</span><input type="date" value={form.data} onChange={e=>setForm({...form, data:e.target.value})} className="w-full border p-3 rounded-xl font-bold outline-none focus:border-orange-500"/></label>
                    </div>
                    <label className="block"><span className="text-[10px] font-black text-slate-400 uppercase">Categoria</span><select value={form.categoria} onChange={e=>setForm({...form, categoria:e.target.value})} className="w-full border p-3 rounded-xl font-bold bg-white outline-none focus:border-orange-500">{categorias.map(c=><option key={c} value={c}>{c}</option>)}</select></label>
                    
                    <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200">
                        <label className="cursor-pointer text-xs font-bold text-slate-500 flex items-center justify-center gap-2 hover:text-orange-500 transition">
                            {loadingUpload ? <RefreshCw className="animate-spin text-slate-400" size={16}/> : (form.url_comprovante ? <CheckCircle className="text-green-500" size={16}/> : <Upload className="text-slate-400" size={16}/>)}
                            {form.url_comprovante ? 'Nota Fiscal Anexada' : 'Anexar Nota/Boleto'}
                            <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleUpload}/>
                        </label>
                    </div>

                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-3 rounded-xl flex-1 border"><input type="checkbox" checked={form.pago} onChange={e=>setForm({...form, pago:e.target.checked})} className="accent-orange-500 w-4 h-4"/><span className="text-xs font-bold text-slate-700">Conta Paga</span></label>
                        {!isEdit && <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-3 rounded-xl flex-1 border"><input type="checkbox" checked={form.repetir} onChange={e=>setForm({...form, repetir:e.target.checked})} className="accent-orange-500 w-4 h-4"/><span className="text-xs font-bold text-slate-700">Lançar fixo</span></label>}
                    </div>
                </div>
                <button onClick={() => onSave(form, form.repetir)} className="w-full py-4 text-white font-black bg-orange-500 rounded-xl hover:bg-orange-600 shadow-lg">{isEdit ? 'SALVAR ALTERAÇÕES' : 'SALVAR DESPESA'}</button>
            </div>
        </div>
    );
}

function ModalEditarUnidade({ u, onClose, onSave, ativarModoMorador, config, cId }) {
    const [form, setForm] = useState(u);
    const linkAcesso = `${window.location.origin}?invite=${u.numero}&c=${cId}`;
    return (
        <div className="fixed inset-0 bg-[#1e293b]/90 z-[9000] flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm">
            <div className="bg-white rounded-t-[32px] sm:rounded-[32px] w-full max-w-md p-6 shadow-2xl animate-in slide-in-from-bottom-10 flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center mb-6 border-b pb-4"><h3 className="font-black text-xl text-slate-800">Editar Apto {u.numero}</h3><button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><X size={20}/></button></div>
                <div className="overflow-y-auto pr-2 space-y-4 mb-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-3">Dados do Proprietário</p>
                        <input value={form.proprietario?.nome || ''} onChange={e=>setForm({...form, proprietario:{...form.proprietario, nome:e.target.value}})} className="w-full border p-3 rounded-xl font-bold mb-2 text-sm" placeholder="Nome Completo"/>
                        <input value={maskPhone(form.proprietario?.telefone || '')} onChange={e=>setForm({...form, proprietario:{...form.proprietario, telefone:e.target.value}})} className="w-full border p-3 rounded-xl font-bold text-sm" placeholder="WhatsApp (11) 99999-9999"/>
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer bg-slate-100 p-4 rounded-xl border border-slate-200"><input type="checkbox" checked={form.mora_proprietario !== false} onChange={e=>setForm({...form, mora_proprietario:e.target.checked})} className="accent-[#84cc16] w-5 h-5"/><span className="text-sm font-bold text-slate-700">Proprietário mora no imóvel</span></label>
                    {form.mora_proprietario === false && (
                        <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                            <p className="text-[10px] font-black text-orange-400 uppercase mb-3">Dados do Inquilino</p>
                            <input value={form.inquilino?.nome || ''} onChange={e=>setForm({...form, inquilino:{...form.inquilino, nome:e.target.value}})} className="w-full border p-3 rounded-xl font-bold mb-2 text-sm" placeholder="Nome do Inquilino"/>
                            <input value={maskPhone(form.inquilino?.telefone || '')} onChange={e=>setForm({...form, inquilino:{...form.inquilino, telefone:e.target.value}})} className="w-full border p-3 rounded-xl font-bold text-sm" placeholder="WhatsApp (11) 99999-9999"/>
                        </div>
                    )}

                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
                        <p className="text-[10px] font-black text-blue-500 uppercase mb-2 flex items-center gap-1"><LinkIcon size={12}/> Link de Acesso do Morador</p>
                        <div className="flex gap-2">
                            <input readOnly value={linkAcesso} className="w-full bg-white border border-blue-200 p-2 rounded-lg text-xs text-slate-500"/>
                            <button onClick={() => { navigator.clipboard.writeText(linkAcesso); alert("Link copiado!"); }} className="bg-blue-500 text-white p-2 rounded-lg"><Copy size={16}/></button>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-4 border-t shrink-0">
                    <button onClick={ativarModoMorador} className="col-span-2 py-3 text-slate-500 font-bold bg-slate-100 rounded-xl hover:bg-slate-200 text-xs flex items-center justify-center gap-2"><Smartphone size={14}/> SIMULAR VISÃO DESTE MORADOR</button>
                    <button onClick={onClose} className="py-4 text-slate-500 font-bold bg-white border border-slate-200 rounded-xl hover:bg-slate-50">Cancelar</button>
                    <button onClick={() => onSave(form)} className="py-4 text-white font-black bg-[#1e293b] rounded-xl hover:bg-black shadow-lg">Salvar</button>
                </div>
            </div>
        </div>
    );
}

function ModalRelatorio({ receita, despesa, saldo, despesas, pagamentos, unidades, mes, ano, onClose, fmt, exportarCSV, config }) {
    const [gerando, setGerando] = useState(false);

    const totalPagos = unidades.filter(u => {
        const pgs = pagamentos.filter(p => p.unidade_id === u.id);
        const tPago = pgs.reduce((a, p) => a + Number(p.valor), 0);
        return tPago > 0;
    }).length;
    const totalPendentes = unidades.length - totalPagos;

    const baixarImagem = async () => {
        const elemento = document.getElementById('relatorio-pdf');
        if (!elemento) return;
        setGerando(true);
        try {
            const canvas = await html2canvas(elemento, { scale: 3, backgroundColor: '#f8fafc', useCORS: true });
            const dataUrl = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = `Prestacao_Contas_${mes}_${ano}.png`;
            a.click();
        } catch(err) { console.error(err); } finally { setGerando(false); }
    };

    const copiarImagem = async () => {
        const elemento = document.getElementById('relatorio-pdf');
        if (!elemento) return;
        setGerando(true);
        try {
            const canvas = await html2canvas(elemento, { scale: 3, backgroundColor: '#f8fafc', useCORS: true });
            canvas.toBlob(async (blob) => {
                try {
                    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                    alert('Infográfico copiado! É só colar no WhatsApp.');
                } catch(e) { alert('Seu navegador bloqueou a cópia direta. Use o botão de baixar.'); }
            }, 'image/png');
        } catch(err) { console.error(err); } finally { setGerando(false); }
    };

    return (
        <div className="fixed inset-0 bg-[#1e293b]/95 z-[9500] flex items-center justify-center p-2 sm:p-6 backdrop-blur-md">
            <div className="w-full max-w-4xl relative animate-in zoom-in duration-300 max-h-[95vh] flex flex-col">
                <button onClick={onClose} className="absolute -top-10 right-0 text-white hover:text-red-400 transition"><LucideIcons.X size={32}/></button>
                
                <div className="bg-white rounded-2xl shadow-2xl relative overflow-auto font-sans flex flex-col border border-slate-200 w-full">
                    {/* ENVOLTÓRIO QUE FORÇA A LARGURA DE INFOGRÁFICO MESMO NO CELULAR */}
                    <div id="relatorio-pdf" className="bg-[#f8fafc] p-8 relative shrink-0 min-w-[700px] w-full mx-auto text-slate-800">
                        
                        {/* HEADER INFOGRÁFICO */}
                        <div className="flex justify-between items-center bg-[#1e293b] text-white p-6 rounded-2xl mb-6 shadow-xl relative overflow-hidden">
                            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white/10 to-transparent"></div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Demonstrativo Financeiro Oficial</p>
                                <h2 className="text-2xl font-black uppercase tracking-tight">{config?.predioNome || 'Residencial Visconde'}</h2>
                                <p className="text-sm font-bold text-[#84cc16] uppercase mt-1 tracking-widest">{mes} / {ano}</p>
                            </div>
                            <div className="text-right flex flex-col items-end z-10">
                                <Logo variant="full" width="w-32" className="brightness-0 invert opacity-90 mb-3"/>
                                <div className="inline-flex items-center gap-1 bg-[#84cc16]/20 px-2.5 py-1 rounded text-[9px] font-black uppercase border border-[#84cc16]/30 text-[#a3e635]">
                                    <LucideIcons.ShieldCheck size={12}/> Documento Autenticado
                                </div>
                            </div>
                        </div>

                        {/* KPIS HEADER */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-green-50 p-4 rounded-[16px] border border-green-100 flex flex-col justify-center relative overflow-hidden">
                                <LucideIcons.TrendingUp size={40} className="absolute -right-2 -bottom-2 text-green-200 opacity-50"/>
                                <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1 z-10">Arrecadação</p>
                                <p className="text-2xl font-black text-green-700 tracking-tight z-10">{fmt(receita)}</p>
                            </div>
                            <div className="bg-red-50 p-4 rounded-[16px] border border-red-100 flex flex-col justify-center relative overflow-hidden">
                                <LucideIcons.TrendingDown size={40} className="absolute -right-2 -bottom-2 text-red-200 opacity-50"/>
                                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1 z-10">Despesas</p>
                                <p className="text-2xl font-black text-red-700 tracking-tight z-10">-{fmt(despesa)}</p>
                            </div>
                            <div className="bg-[#f1f5f9] p-4 rounded-[16px] border border-slate-200 flex flex-col justify-center relative overflow-hidden shadow-inner">
                                <LucideIcons.Wallet size={40} className="absolute -right-2 -bottom-2 text-blue-200 opacity-50"/>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 z-10">Saldo Final em Caixa</p>
                                <p className="text-2xl font-black text-[#1e293b] tracking-tight z-10">{fmt(saldo)}</p>
                            </div>
                        </div>

                        {/* 2-COL RATIO LAYOUT */}
                        <div className="grid grid-cols-2 gap-8 items-start">
                            
                            {/* COL LEFT: RECEITAS */}
                            <div>
                                <h3 className="text-[11px] font-black text-white bg-slate-800 py-2 px-4 rounded-t-xl uppercase tracking-widest flex items-center gap-2 shadow-sm">
                                    <LucideIcons.ArrowDownCircle size={14} className="text-green-400"/> Entradas por Unidade
                                </h3>
                                <div className="border-x border-b border-slate-200 rounded-b-xl p-3 bg-white shadow-sm">
                                    <div className="space-y-1">
                                        {unidades.map(u => {
                                            const pgs = pagamentos.filter(p => p.unidade_id === u.id);
                                            const tPago = pgs.reduce((a, p) => a + Number(p.valor), 0);
                                            const inquilino = u.inquilino?.nome ? String(u.inquilino.nome) : '';
                                            const proprietario = u.proprietario?.nome ? String(u.proprietario.nome) : '';
                                            const isProprietario = u.mora_proprietario !== false;
                                            
                                            let morador = '';
                                            if (isProprietario && proprietario) morador = proprietario;
                                            else if (!isProprietario && inquilino) morador = inquilino;
                                            else if (proprietario) morador = proprietario;
                                            
                                            const primeiroNome = morador.split(' ')[0];
                                            
                                            return (
                                                <div key={u.id} className="flex justify-between items-center py-1.5 px-2 border-b border-slate-50 last:border-0 hover:bg-slate-50 rounded transition-colors group">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-black text-xs text-slate-700 w-12">AP {u.numero}</span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase truncate max-w-[120px]">{primeiroNome}</span>
                                                    </div>
                                                    {tPago > 0 ? 
                                                        <span className="font-black text-green-600 text-xs">{fmt(tPago)}</span> : 
                                                        <span className="font-black text-slate-300 text-[9px] uppercase tracking-widest">Pendente</span>
                                                    }
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* COL RIGHT: DESPESAS E INADIMPLÊNCIA */}
                            <div>
                                <h3 className="text-[11px] font-black text-white bg-slate-800 py-2 px-4 rounded-t-xl uppercase tracking-widest flex items-center gap-2 shadow-sm">
                                    <LucideIcons.ArrowUpCircle size={14} className="text-red-400"/> Lista de Despesas
                                </h3>
                                <div className="border-x border-b border-slate-200 rounded-b-xl p-3 bg-white shadow-sm">
                                    <div className="space-y-1">
                                        {despesas.map(d => (
                                            <div key={d.id} className="flex justify-between items-center py-1.5 px-2 border-b border-slate-50 last:border-0 hover:bg-slate-50 rounded transition-colors group">
                                                <div className="flex flex-col pr-2">
                                                    <span className="font-bold text-xs text-slate-700 leading-tight">{d.descricao}</span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{d.categoria}</span>
                                                </div>
                                                <span className="font-black text-red-500 text-xs whitespace-nowrap">-{fmt(d.valor)}</span>
                                            </div>
                                        ))}
                                        {despesas.length === 0 && <p className="text-xs text-center text-slate-400 py-4 italic font-medium">Nenhuma despesa no período.</p>}
                                    </div>
                                </div>

                                {/* RESUMO DE INADIMPLÊNCIA IN-LINE */}
                                <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-inner">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 text-center flex justify-center items-center gap-1">
                                        <LucideIcons.PieChart size={12}/> Resumo de Arrecadação
                                    </p>
                                    <div className="flex justify-around items-center">
                                        <div className="text-center bg-white px-6 py-2 rounded-lg border border-slate-100 shadow-sm w-28">
                                            <p className="text-2xl font-black text-green-600">{totalPagos}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">Pagos</p>
                                        </div>
                                        <div className="text-center bg-white px-6 py-2 rounded-lg border border-slate-100 shadow-sm w-28">
                                            <p className="text-2xl font-black text-slate-700">{totalPendentes}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">Pendentes</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className="text-center pt-6 mt-6 border-t border-slate-200">
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest flex items-center justify-center gap-2">
                                <LucideIcons.Building size={10}/> Documento Autenticado pelo Ecossistema CondoLeve • Gerado em: {new Date().toLocaleString('pt-BR')}
                            </p>
                        </div>

                    </div>
                </div>

                {/* Botoes Externos */}
                <div className="bg-white p-4 border-t border-slate-200 shrink-0 flex flex-col sm:flex-row gap-3 rounded-b-2xl">
                    <div className="flex gap-2 w-full">
                        <button onClick={copiarImagem} disabled={gerando} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 shadow-sm flex justify-center items-center gap-2 transition disabled:opacity-50">
                            {gerando ? <LucideIcons.RefreshCw size={16} className="animate-spin"/> : <LucideIcons.Copy size={16}/>} 
                            Copiar
                        </button>
                        <button onClick={baixarImagem} disabled={gerando} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 shadow-sm flex justify-center items-center gap-2 transition disabled:opacity-50">
                            {gerando ? <LucideIcons.RefreshCw size={16} className="animate-spin"/> : <LucideIcons.Download size={16}/>} 
                            Baixar
                        </button>
                    </div>
                    <button onClick={exportarCSV} className="w-full sm:w-auto bg-[#1e293b] text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black shadow-lg flex justify-center items-center gap-2 transition">
                        <LucideIcons.FileSpreadsheet size={16}/> Exportar Excel
                    </button>
                </div>
            </div>
        </div>
    );
}

function ModalManutencao({ lista, onClose, onToggle, onDelete }) {
    return (
        <div className="fixed inset-0 bg-[#1e293b]/90 z-[9000] flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm">
            <div className="bg-white rounded-t-[32px] sm:rounded-[32px] w-full max-w-md p-6 shadow-2xl animate-in slide-in-from-bottom-10 max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-6 border-b pb-4"><h3 className="font-black text-xl text-slate-800 flex items-center gap-2"><Wrench className="text-slate-500"/> Manutenção</h3><button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><X size={20}/></button></div>
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 pb-4">
                    {lista.map(z => (
                        <div key={z.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3">
                            <button onClick={() => onToggle(z.id, !z.concluido)} className={`shrink-0 mt-0.5 ${z.concluido ? 'text-green-500' : 'text-slate-300'}`}>{z.concluido ? <CheckCircle size={24}/> : <div className="w-6 h-6 border-2 border-slate-300 rounded-full"></div>}</button>
                            <div className="flex-1">
                                <p className={`text-sm font-bold ${z.concluido ? 'line-through text-slate-400' : 'text-slate-800'}`}>{z.item}</p>
                                <div className="flex gap-2 mt-2 items-center">
                                    <span className="text-[9px] font-black text-slate-400 uppercase bg-slate-200/50 px-2 py-0.5 rounded">{z.data}</span>
                                    {z.relator && <span className="text-[9px] font-black text-orange-500 uppercase bg-orange-50 px-2 py-0.5 rounded border border-orange-100">Aberto por: {z.relator}</span>}
                                    {z.url_foto && <a href={z.url_foto} target="_blank" rel="noopener noreferrer" className="text-[9px] font-black text-blue-500 uppercase flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded border border-blue-100"><ImageIcon size={10}/> Ver Foto</a>}
                                </div>
                            </div>
                            <button onClick={() => onDelete(z.id)} className="text-slate-300 hover:text-red-500 p-2"><Trash2 size={16}/></button>
                        </div>
                    ))}
                    {lista.length === 0 && <EmptyState icon={CheckSquare} title="Tudo OK!" desc="Nenhuma manutenção pendente." />}
                </div>
            </div>
        </div>
    );
}

function ModalAvisos({ lista, onClose, onSave, onDelete }) {
    const [form, setForm] = useState({ titulo: '', mensagem: '', tipo: 'Aviso', data: new Date().toLocaleDateString('pt-BR') });
    return (
        <div className="fixed inset-0 bg-[#1e293b]/90 z-[9000] flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm">
            <div className="bg-white rounded-t-[32px] sm:rounded-[32px] w-full max-w-md p-6 shadow-2xl animate-in slide-in-from-bottom-10 max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-6 border-b pb-4"><h3 className="font-black text-xl text-slate-800 flex items-center gap-2"><Megaphone className="text-orange-500"/> Mural de Avisos</h3><button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><X size={20}/></button></div>
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4">
                    <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 space-y-3">
                        <input value={form.titulo} onChange={e=>setForm({...form, titulo:e.target.value})} className="w-full border-none p-3 rounded-xl font-black text-sm outline-none" placeholder="Título do Aviso"/>
                        <textarea value={form.mensagem} onChange={e=>setForm({...form, mensagem:e.target.value})} className="w-full border-none p-3 rounded-xl font-bold text-xs outline-none h-20" placeholder="Mensagem para os moradores..."/>
                        <div className="flex gap-2">
                            <select value={form.tipo} onChange={e=>setForm({...form, tipo:e.target.value})} className="flex-1 border-none p-3 rounded-xl font-bold text-xs outline-none text-slate-600"><option value="Aviso">Aviso Comum</option><option value="Urgente">🚨 Urgente</option><option value="Regra">📜 Regra/Norma</option></select>
                            <button onClick={() => { if(form.titulo && form.mensagem) { onSave(form); setForm({titulo:'', mensagem:'', tipo:'Aviso', data: new Date().toLocaleDateString('pt-BR')}); } }} className="bg-orange-500 text-white px-4 rounded-xl font-black text-xs hover:bg-orange-600 transition"><Send size={16}/></button>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {lista.map(a => (
                            <div key={a.id} className="p-4 bg-white border border-slate-200 rounded-2xl relative shadow-sm">
                                <button onClick={() => onDelete(a.id)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 p-2"><Trash2 size={14}/></button>
                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded mb-2 inline-block ${a.tipo==='Urgente'?'bg-red-100 text-red-600':(a.tipo==='Regra'?'bg-purple-100 text-purple-600':'bg-blue-100 text-blue-600')}`}>{a.tipo}</span>
                                <p className="font-black text-slate-800 text-sm">{a.titulo}</p>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{a.mensagem}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ModalEnquete({ lista, onClose, onSave, onDelete, onEncerrar, unidadesTotal }) {
    const [form, setForm] = useState({ titulo: '', descricao: '', ativa: true, opcoes: { sim: 0, nao: 0 } });
    return (
        <div className="fixed inset-0 bg-[#1e293b]/90 z-[9000] flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm">
            <div className="bg-white rounded-t-[32px] sm:rounded-[32px] w-full max-w-md p-6 shadow-2xl animate-in slide-in-from-bottom-10 max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-6 border-b pb-4"><h3 className="font-black text-xl text-slate-800 flex items-center gap-2"><Vote className="text-blue-500"/> Enquetes</h3><button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><X size={20}/></button></div>
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4">
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 space-y-3">
                        <input value={form.titulo} onChange={e=>setForm({...form, titulo:e.target.value})} className="w-full border-none p-3 rounded-xl font-black text-sm outline-none" placeholder="Pergunta da Enquete?"/>
                        <button onClick={() => { if(form.titulo) { onSave(form); setForm({titulo:'', descricao:'', ativa:true, opcoes:{sim:0,nao:0}}); } }} className="w-full bg-blue-500 text-white py-3 rounded-xl font-black text-xs hover:bg-blue-600 transition flex items-center justify-center gap-2"><PlusCircle size={14}/> INICIAR VOTAÇÃO (SIM / NÃO)</button>
                    </div>
                    <div className="space-y-3">
                        {lista.map(e => {
                            const total = (e.opcoes?.sim||0) + (e.opcoes?.nao||0);
                            return (
                            <div key={e.id} className="p-4 bg-white border border-slate-200 rounded-2xl relative shadow-sm">
                                <button onClick={() => onDelete(e.id)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 p-1" title="Apagar Enquete"><Trash2 size={16}/></button>
                                {e.ativa && <button onClick={() => onEncerrar(e.id)} className="absolute top-2 right-9 text-slate-300 hover:text-orange-500 p-1" title="Encerrar Votação"><CheckCircle size={16}/></button>}
                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded mb-2 inline-block ${e.ativa?'bg-green-100 text-green-600':'bg-slate-100 text-slate-500'}`}>{e.ativa ? 'ABERTA' : 'ENCERRADA'}</span>
                                <p className="font-black text-slate-800 text-sm mb-3 pr-6">{e.titulo}</p>
                                <div className="flex gap-2">
                                    <div className="flex-1 bg-green-50 p-2 rounded-lg text-center"><p className="text-[10px] font-bold text-green-600">SIM</p><p className="font-black text-green-700">{e.opcoes?.sim||0}</p></div>
                                    <div className="flex-1 bg-red-50 p-2 rounded-lg text-center"><p className="text-[10px] font-bold text-red-600">NÃO</p><p className="font-black text-red-700">{e.opcoes?.nao||0}</p></div>
                                </div>
                            </div>
                        )})}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ModalTelefonesUteis({ config, setConfig, onClose, setPrintMode }) {
    const [lista, setLista] = useState(config.telefonesUteis || INFO_UTEIS_PADRAO);
    return (
        <div className="fixed inset-0 bg-[#1e293b]/90 z-[9000] flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm">
            <div className="bg-white rounded-t-[32px] sm:rounded-[32px] w-full max-w-md p-6 shadow-2xl animate-in slide-in-from-bottom-10 max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-6 border-b pb-4"><h3 className="font-black text-xl text-slate-800 flex items-center gap-2"><Contact className="text-teal-500"/> Telefones & Info</h3><button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><X size={20}/></button></div>
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 pb-4">
                    {lista.map((t, i) => (
                        <div key={t.id || i} className="flex gap-2 items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <input value={t.nome} onChange={e => { const nv = [...lista]; nv[i].nome = e.target.value; setLista(nv); }} className="flex-1 bg-transparent font-black text-sm outline-none text-slate-700" placeholder="Nome/Serviço"/>
                            <input value={t.numero} onChange={e => { const nv = [...lista]; nv[i].numero = e.target.value; setLista(nv); }} className="flex-1 bg-transparent font-bold text-xs outline-none text-slate-500 text-right" placeholder="Número/Senha"/>
                            <button onClick={() => setLista(lista.filter((_, idx) => idx !== i))} className="text-slate-300 hover:text-red-500 p-1"><X size={16}/></button>
                        </div>
                    ))}
                    <button onClick={() => setLista([...lista, {id: generateId(), nome: '', numero: ''}])} className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-50 flex justify-center items-center gap-2"><PlusCircle size={14}/> ADICIONAR LINHA</button>
                </div>
                <div className="pt-4 border-t flex flex-col gap-2 shrink-0">
                    <button onClick={() => { setConfig({...config, telefonesUteis: lista}); onClose(); }} className="w-full bg-[#1e293b] text-white py-4 rounded-xl font-black text-xs hover:bg-black transition shadow-lg">SALVAR INFORMAÇÕES</button>
                    <button onClick={() => { onClose(); setPrintMode('cartaz'); }} className="w-full bg-slate-100 text-slate-600 py-3 rounded-xl font-black text-[10px] hover:bg-slate-200 transition flex items-center justify-center gap-2"><Printer size={14}/> IMPRIMIR CARTAZ P/ ELEVADOR</button>
                </div>
            </div>
        </div>
    );
}

function ModalFilaAprovacao({ fila, onClose, processarAprovacao }) {
    return (
        <div className="fixed inset-0 bg-[#1e293b]/90 z-[9000] flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm">
            <div className="bg-white rounded-t-[32px] sm:rounded-[32px] w-full max-w-md p-6 shadow-2xl animate-in slide-in-from-bottom-10 max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-6 border-b pb-4"><h3 className="font-black text-xl text-slate-800 flex items-center gap-2"><UserPlus className="text-purple-500"/> Novos Moradores</h3><button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><X size={20}/></button></div>
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 pb-4">
                    {fila && fila.length > 0 ? fila.map(f => (
                        <div key={f.id} className="bg-purple-50 border border-purple-100 p-4 rounded-2xl flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <div className="bg-white text-purple-600 w-12 h-12 rounded-xl font-black flex items-center justify-center text-lg shadow-sm border border-purple-100 shrink-0">{f.numero}</div>
                                <div><p className="font-black text-slate-800 text-sm">{f.email}</p><p className="text-[10px] font-bold text-slate-500 uppercase">Solicitou em {f.data}</p></div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => processarAprovacao(f, false)} className="flex-1 py-2 bg-white text-red-500 border border-red-200 rounded-lg text-[10px] font-black hover:bg-red-50 transition">REJEITAR</button>
                                <button onClick={() => processarAprovacao(f, true)} className="flex-1 py-2 bg-purple-600 text-white rounded-lg text-[10px] font-black hover:bg-purple-700 transition shadow-md">APROVAR ACESSO</button>
                            </div>
                        </div>
                    )) : <EmptyState icon={UserCheck} title="Nenhum Pedido" desc="Todos os moradores já foram aprovados." />}
                </div>
            </div>
        </div>
    );
}

// --- MODAL CONFIGURAÇÃO (SÍNDICO) ---
function ModalConfiguracoes({ config, setConfig, onClose, triggerConfirm, resetar, showToast, exportarBackup, supabase }) { 
    const [local, setLocal] = useState({...config}); 
    const [activeTab, setActiveTab] = useState('geral'); 
    const [bloqueado, setBloqueado] = useState(true); 
    const [novaSenha, setNovaSenha] = useState('');
    const [loadingSenha, setLoadingSenha] = useState(false);
    
    const alterarSenha = async () => {
        if (novaSenha.length < 6) return showToast("A senha deve ter pelo menos 6 caracteres.", "error");
        setLoadingSenha(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: novaSenha });
            if (error) throw error;
            showToast("Senha alterada com sucesso!");
            setNovaSenha('');
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setLoadingSenha(false);
        }
    };

    return ( 
        <div className="fixed inset-0 bg-[#1e293b]/90 z-[9000] flex items-center justify-center p-4 backdrop-blur-sm text-left">
            <div className="bg-white rounded-[32px] w-full max-w-2xl p-0 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in duration-300">
                <div className="bg-[#1e293b] p-6 text-white text-center relative">
                    <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/10 rounded-full hover:bg-white/20 transition"><X size={20}/></button>
                    <h3 className="font-black text-xl tracking-tighter mb-4">Ajustes & Sistema</h3>
                    <div className="flex gap-1 justify-center bg-black/20 p-1 rounded-xl overflow-x-auto">
                        <button onClick={() => setActiveTab('geral')} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase ${activeTab === 'geral' ? 'bg-[#84cc16] text-[#1e293b]' : 'text-slate-400'}`}>Condomínio</button>
                        <button onClick={() => setActiveTab('perfil')} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase ${activeTab === 'perfil' ? 'bg-[#84cc16] text-[#1e293b]' : 'text-slate-400'}`}>Meu Perfil</button>
                        <button onClick={() => setActiveTab('sistema')} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase ${activeTab === 'sistema' ? 'bg-[#84cc16] text-[#1e293b]' : 'text-slate-400'}`}>Sistema & Dados</button>
                    </div>
                </div>
                <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-white">
                    {activeTab === 'geral' && (
                        <div className="space-y-6">
                            <div className="bg-slate-50 p-5 rounded-2xl border">
                                <button onClick={() => setBloqueado(!bloqueado)} className="mb-4 text-[9px] font-black border px-3 py-1.5 rounded-lg bg-white shadow-sm hover:bg-slate-100 transition flex items-center gap-2"><LockKeyhole size={12}/> EDITAR DADOS BASE</button>
                                <div className={`space-y-4 ${bloqueado ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <label className="block"><span className="text-[10px] font-black text-slate-400 uppercase">Nome do Prédio</span><input value={local.predioNome} onChange={e=>setLocal({...local, predioNome:e.target.value})} className="w-full border p-3 rounded-xl"/></label>
                                    <label className="block"><span className="text-[10px] font-black text-slate-400 uppercase">Mensalidade (R$)</span><input type="number" value={local.valorCondominio} onChange={e=>setLocal({...local, valorCondominio:Number(e.target.value)})} className="w-full border p-3 rounded-xl"/></label>
                                    <label className="block"><span className="text-[10px] font-black text-slate-400 uppercase">Chave PIX Oficial</span><input value={local.chavePix} onChange={e=>setLocal({...local, chavePix:e.target.value})} className="w-full border p-3 rounded-xl"/></label>
                                    <label className="block"><span className="text-[10px] font-black text-slate-400 uppercase">Início Operação (Mês/Ano)</span><input type="month" value={local.inicioOperacao || ''} onChange={e=>setLocal({...local, inicioOperacao:e.target.value})} className="w-full border p-3 rounded-xl text-sm font-bold"/></label>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'perfil' && (
                        <div className="space-y-4">
                            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                                <h4 className="font-black text-slate-800 text-sm mb-4 flex items-center gap-2"><KeyRound size={16} className="text-orange-500"/> Alterar Minha Senha</h4>
                                <label className="block mb-3">
                                    <span className="text-[10px] font-black text-slate-400 uppercase">Nova Senha</span>
                                    <input type="password" value={novaSenha} onChange={e=>setNovaSenha(e.target.value)} className="w-full border border-slate-200 p-3 rounded-xl text-sm font-bold outline-none focus:border-[#84cc16] mt-1" placeholder="Mínimo de 6 caracteres"/>
                                </label>
                                <button onClick={alterarSenha} disabled={loadingSenha || novaSenha.length < 6} className="bg-[#1e293b] text-white py-3 px-6 rounded-xl font-black text-xs hover:bg-black transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                                    {loadingSenha ? <RefreshCw className="animate-spin" size={14}/> : <Save size={14}/>} SALVAR NOVA SENHA
                                </button>
                            </div>
                        </div>
                    )}
                    {activeTab === 'sistema' && (
                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl text-left">
                                <h4 className="text-blue-800 font-black text-sm mb-2 flex items-center gap-2"><Database size={16}/> Cópia de Segurança</h4>
                                <p className="text-xs text-blue-600 mb-4 font-medium">Baixe um arquivo JSON com todos os dados atuais do seu condomínio (apartamentos, transações, avisos) para segurança externa.</p>
                                <button onClick={exportarBackup} className="w-full bg-blue-500 text-white py-3 rounded-xl font-black text-xs shadow-lg hover:bg-blue-600 transition flex items-center justify-center gap-2"><Download size={14}/> EXPORTAR BACKUP</button>
                            </div>

                            <div className="pt-6 mt-6 border-t border-slate-100 text-center">
                                <h4 className="text-red-600 font-black text-xs mb-2 uppercase">Zona de Perigo</h4>
                                <button onClick={() => triggerConfirm({ titulo: "Resetar Tudo?", texto: "Isso apagará TODOS os dados do prédio irrevogavelmente, não tem como recuperar.", onConfirm: () => { resetar(); triggerConfirm(null); } })} className="w-full py-4 bg-red-50 text-red-500 font-black text-xs hover:bg-red-100 rounded-xl border border-red-200 transition">LIMPAR CONDOMÍNIO (RESET TOTAL)</button>
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-6 bg-slate-50 border-t flex gap-3 shrink-0">
                    <button onClick={onClose} className="flex-1 py-4 text-slate-400 font-bold text-xs uppercase hover:text-slate-600 transition">Cancelar</button>
                    {activeTab === 'geral' && (
                        <button onClick={() => { setConfig(local); onClose(); }} className="flex-1 bg-[#84cc16] text-[#1e293b] rounded-2xl font-black text-xs shadow-xl active:scale-95">SALVAR MUDANÇAS</button>
                    )}
                </div>
            </div>
        </div>
    ); 
}