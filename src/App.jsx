import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Download, Edit, Trash2, User, Home, Calendar, DollarSign, 
  CheckCircle, XCircle, Phone, FileText, Settings, MessageCircle, 
  ExternalLink, Wallet, ArrowDownCircle, ArrowUpCircle, 
  PieChart, PlusCircle, TrendingUp, TrendingDown, Printer, Users,
  AlertTriangle, Clock, History, X, Copy,
  Database, Upload, Cloud, Lock, Unlock, 
  Key, Megaphone, Wrench, Hammer, Star, Check, BarChart3, ArrowRight, Pencil, Smartphone, Sparkles, ListPlus, Eye, CalendarDays, Link as LinkIcon, Save, RefreshCw, WifiOff, LogOut, Mail, RotateCcw
} from 'lucide-react';

// --- CONFIGURAÇÃO SUPABASE ---
const SUPABASE_URL = "https://jtoubtxumtfwrolxrbpf.supabase.co"; 
const SUPABASE_KEY = "sb_publishable_jRaZSrBV1Q75Ftj7OVd_Jg_tozzOju3"; 
const APP_VERSION = "3.2.2-stable";

// --- UTILITÁRIOS SEGUROS ---
const safeStr = (val) => val ? String(val) : "";
const safeNum = (val) => Number(val) || 0;

const copiarTextoSeguro = (texto) => {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(texto)
      .then(() => { /* Feedback silencioso */ })
      .catch(() => copiarTextoFallback(texto));
  } else { copiarTextoFallback(texto); }
};

const copiarTextoFallback = (texto) => {
  const textArea = document.createElement("textarea");
  textArea.value = texto;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand('copy');
  document.body.removeChild(textArea);
};

const formatarMoeda = (val) => safeNum(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// --- COMPONENTES VISUAIS ---
const Logo = ({ className = "", dark = false }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <div className="relative text-left">
      <svg width="36" height="36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
         <rect x="20" y="40" width="20" height="50" rx="2" fill={dark ? "#fff" : "#1e293b"} />
         <rect x="45" y="25" width="20" height="65" rx="2" fill={dark ? "#a3e635" : "#84cc16"} />
         <rect x="70" y="50" width="20" height="40" rx="2" fill={dark ? "#cbd5e1" : "#475569"} />
         <path d="M10 90 L90 90" stroke={dark ? "#fff" : "#1e293b"} strokeWidth="4" strokeLinecap="round"/>
         <path d="M45 25 L55 15 L65 25" stroke={dark ? "#a3e635" : "#84cc16"} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
    <div className="flex flex-col leading-none text-left">
        <span className={`font-black text-2xl tracking-tighter ${dark ? 'text-white' : 'text-[#1e293b]'}`}>
        Condo<span className="text-[#84cc16]">Leve</span>
        </span>
        <span className={`text-[8px] uppercase font-bold tracking-[0.2em] ${dark ? 'text-blue-200' : 'text-slate-400'}`}>Cloud v3.2.2</span>
    </div>
  </div>
);

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 ${className}`}>{children}</div>
);

const Badge = ({ children, color = "slate" }) => {
  const colors = {
    green: "bg-green-100 text-green-700 border-green-200",
    red: "bg-red-100 text-red-700 border-red-200",
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    orange: "bg-orange-100 text-orange-700 border-orange-200",
    slate: "bg-slate-50 text-slate-500 border-slate-200",
    yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",
    black: "bg-slate-800 text-white border-slate-900",
  };
  return <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-md border ${colors[color] || colors.slate}`}>{children}</span>;
};

// --- DADOS CONSTANTES ---
const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const CATEGORIAS_DESPESA = ['Água', 'Luz', 'Limpeza', 'Manutenção', 'Jardinagem', 'Administrativo', 'Outros'];

// --- APP PRINCIPAL COM AUTH ---
export default function App() {
  const [supabase, setSupabase] = useState(null);
  const [session, setSession] = useState(null);
  const [libLoaded, setLibLoaded] = useState(false);

  useEffect(() => {
    if (window.supabase) { setLibLoaded(true); return; }
    const script = document.createElement('script');
    script.src = "https://unpkg.com/@supabase/supabase-js@2/dist/umd/supabase.js";
    script.async = true;
    script.onload = () => setLibLoaded(true);
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (libLoaded && !supabase && SUPABASE_URL.includes("http")) {
      const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      setSupabase(client);
      client.auth.getSession().then(({ data: { session } }) => setSession(session));
      const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => setSession(session));
      return () => subscription.unsubscribe();
    }
  }, [libLoaded]);

  if (!libLoaded) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><RefreshCw className="animate-spin text-[#84cc16]"/></div>;

  return !session ? <TelaLogin supabase={supabase} /> : <SistemaCondominio supabase={supabase} session={session} />;
}

// --- TELA DE LOGIN ---
function TelaLogin({ supabase }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [modoCadastro, setModoCadastro] = useState(false);
  const [msg, setMsg] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg(null);
    try {
      const { error } = modoCadastro 
        ? await supabase.auth.signUp({ email, password: senha })
        : await supabase.auth.signInWithPassword({ email, password: senha });
      if (error) throw error;
      if (modoCadastro) setMsg({tipo: 'success', text: 'Conta criada! Verifique seu e-mail.'});
    } catch (error) { setMsg({tipo: 'error', text: error.message || "Erro de autenticação"}); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
       <div className="bg-white p-8 rounded-[40px] shadow-2xl w-full max-w-sm text-center">
          <Logo className="justify-center mb-8 scale-110" />
          <h2 className="text-2xl font-black text-[#1e293b] mb-2">{modoCadastro ? 'Criar Conta' : 'Bem-vindo'}</h2>
          <p className="text-slate-400 text-xs font-medium mb-8">Gerencie seu condomínio de forma simples.</p>
          {msg && <div className={`p-4 rounded-xl text-xs font-bold mb-6 ${msg.tipo === 'error' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>{msg.text}</div>}
          <form onSubmit={handleLogin} className="space-y-4 text-left">
             <div><label className="text-[10px] font-black uppercase text-slate-400 ml-2">E-mail</label><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="w-full border-2 border-slate-100 p-4 rounded-2xl font-bold text-sm outline-none focus:border-[#84cc16] transition"/></div>
             <div><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Senha</label><input type="password" required value={senha} onChange={e=>setSenha(e.target.value)} className="w-full border-2 border-slate-100 p-4 rounded-2xl font-bold text-sm outline-none focus:border-[#84cc16] transition"/></div>
             <button disabled={loading} className="w-full bg-[#1e293b] text-white py-4 rounded-2xl font-black shadow-xl hover:bg-black transition active:scale-95 disabled:opacity-50">{loading ? <RefreshCw className="animate-spin mx-auto"/> : (modoCadastro ? 'CADASTRAR' : 'ENTRAR')}</button>
          </form>
          <button onClick={() => {setModoCadastro(!modoCadastro); setMsg(null);}} className="mt-6 text-xs font-bold text-slate-400 hover:text-[#84cc16] transition">{modoCadastro ? 'Já tenho conta' : 'Criar uma conta nova'}</button>
       </div>
    </div>
  );
}

// --- SISTEMA PRINCIPAL ---
function SistemaCondominio({ supabase, session }) {
  const [loading, setLoading] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState('receitas');
  const [statusSync, setStatusSync] = useState('idle'); 
  const [unidades, setUnidades] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [patrimonio, setPatrimonio] = useState([]);
  const [config, setConfig] = useState({ valorCondominio: 200, sindicaNome: 'Síndico(a)', predioNome: '', chavePix: '', saldoInicial: 0, inicioOperacao: '', diaVencimento: 10, linkGrupo: '' });
  const [mesAtual, setMesAtual] = useState(MESES[new Date().getMonth()]);
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());
  const timeoutRef = useRef(null);

  // --- CARREGAMENTO ---
  useEffect(() => {
      async function carregarDados() {
          if (!supabase || !session) return;
          setLoading(true);
          try {
              const { data, error } = await supabase.from('app_dados').select('*');
              if (error) throw error;
              if (data) {
                  const u = data.find(x => x.chave === 'condo_u'); const d = data.find(x => x.chave === 'condo_d');
                  const p = data.find(x => x.chave === 'condo_p'); const c = data.find(x => x.chave === 'condo_c');
                  if (u) setUnidades(u.valor); if (d) setDespesas(d.valor); if (p) setPatrimonio(p.valor); if (c) setConfig(c.valor);
              }
          } catch (e) { console.error(e); } finally { setLoading(false); }
      }
      carregarDados();
  }, [supabase, session]);

  // --- SALVAMENTO ---
  const salvarDados = async () => {
      if (!supabase || !session) return;
      setStatusSync('saving');
      try {
          const updates = [
              { chave: 'condo_u', valor: unidades, user_id: session.user.id },
              { chave: 'condo_d', valor: despesas, user_id: session.user.id },
              { chave: 'condo_p', valor: patrimonio, user_id: session.user.id },
              { chave: 'condo_c', valor: config, user_id: session.user.id }
          ];
          await supabase.from('app_dados').upsert(updates, { onConflict: 'user_id, chave' });
          setStatusSync('saved');
          setTimeout(() => setStatusSync('idle'), 2000);
      } catch (e) { setStatusSync('error'); }
  };
  useEffect(() => { if(!loading) { if (timeoutRef.current) clearTimeout(timeoutRef.current); timeoutRef.current = setTimeout(salvarDados, 1000); } }, [unidades, despesas, patrimonio, config]);

  // --- MODAIS ---
  const [modalPagamento, setModalPagamento] = useState(null);
  const [modalDetalhesUnidade, setModalDetalhesUnidade] = useState(null); 
  const [modalDetalhesInad, setModalDetalhesInad] = useState(null); 
  const [modalEditar, setModalEditar] = useState(null);
  const [modalConfig, setModalConfig] = useState(false); 
  const [modalNovaDespesa, setModalNovaDespesa] = useState(false);
  const [modalEditarDespesa, setModalEditarDespesa] = useState(null);
  const [modalRelatorio, setModalRelatorio] = useState(false);
  const [modalRecibo, setModalRecibo] = useState(null);
  const [modalZeladoria, setModalZeladoria] = useState(false); 
  const [showWizard, setShowWizard] = useState(false); 
  const [confirmarReset, setConfirmarReset] = useState(false);

  useEffect(() => { if (!loading && unidades.length === 0 && despesas.length === 0) setShowWizard(true); }, [loading, unidades, despesas]);

  // --- REGRAS DE NEGÓCIO (RESTAURADAS) ---
  const chaveAtual = `${mesAtual}-${anoAtual}`;
  const getPagamentosMes = (unidade, chave) => { const dados = unidade.status ? unidade.status[chave] : null; return dados ? (Array.isArray(dados) ? dados : [dados]) : []; };
  const calcularTotalPago = (pagamentos) => pagamentos.reduce((acc, p) => acc + safeNum(p.valor), 0);

  const adicionarPagamento = (unidadeId, valor, data) => {
    setUnidades(prev => prev.map(u => {
        if (u.id !== unidadeId) return u;
        const currentPags = getPagamentosMes(u, chaveAtual);
        return { ...u, status: { ...(u.status || {}), [chaveAtual]: [...currentPags, { id: Date.now(), valor, data }] } };
    }));
  };

  const removerPagamento = (unidadeId, pagamentoId, chave) => {
      setUnidades(prev => prev.map(u => {
          if(u.id !== unidadeId) return u;
          const newPags = getPagamentosMes(u, chave).filter(p => p.id !== pagamentoId);
          const novoStatus = { ...(u.status || {}) };
          if (newPags.length === 0) delete novoStatus[chave]; else novoStatus[chave] = newPags;
          return { ...u, status: novoStatus };
      }));
  };

  const exportarBackup = () => {
    const nomeArquivo = `Backup_CondoLeve_${new Date().toISOString().slice(0,10)}.json`;
    const dados = { unidades, despesas, patrimonio, config, versao: APP_VERSION };
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([JSON.stringify(dados)], { type: 'application/json' }));
    link.download = nomeArquivo;
    link.click();
    alert("Backup salvo!");
  };

  const importarBackup = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const dados = JSON.parse(event.target.result);
        if (dados.unidades) setUnidades(dados.unidades); if (dados.despesas) setDespesas(dados.despesas); if (dados.patrimonio) setPatrimonio(dados.patrimonio || []); if (dados.config) setConfig(dados.config);
        alert("Dados restaurados!");
      } catch (error) { alert("Arquivo inválido."); }
    };
    reader.readAsText(file);
  };

  const enviarCobranca = (u, dividas) => {
    const morador = u.moraProprietario ? u.proprietario : (u.inquilino?.nome ? u.inquilino : u.proprietario);
    if (!morador?.telefone) return alert("Cadastre o telefone do morador para enviar a cobrança.");
    const total = dividas.reduce((acc, d) => acc + d.valor, 0);
    let msg = `Olá ${safeStr(morador.nome)}, referente à unidade ${safeStr(u.numero)}.\n\nConstam as seguintes pendências:\n${dividas.map(d=>`- ${d.mes}/${d.ano}: ${formatarMoeda(d.valor)}`).join('\n')}\n\n*Total: ${formatarMoeda(total)}*\n\nChave PIX: ${safeStr(config.chavePix)}`;
    window.open(`https://wa.me/55${safeStr(morador.telefone).replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const copiarDespesasAnteriores = () => {
    const idx = MESES.indexOf(mesAtual);
    let mAnt = '', aAnt = 0;
    if(idx > 0) { mAnt = MESES[idx-1]; aAnt = anoAtual; } else { mAnt = MESES[11]; aAnt = anoAtual-1; }
    const despesasAnteriores = despesas.filter(d => d.mes === mAnt && d.ano === aAnt);
    if(despesasAnteriores.length === 0) return alert(`Nenhuma despesa encontrada em ${mAnt}/${aAnt} para copiar.`);
    const novasDespesas = despesasAnteriores.map(d => ({ ...d, id: Date.now() + Math.random(), mes: mesAtual, ano: anoAtual, data: `01/${String(idx+1).padStart(2,'0')}/${anoAtual}` }));
    setDespesas(prev => [...prev, ...novasDespesas]);
    alert(`${novasDespesas.length} contas copiadas!`);
  };

  const executarReinicializacao = async () => {
      try {
          setLoading(true);
          const { error } = await supabase.from('app_dados').delete().eq('user_id', session.user.id);
          if (error) throw error;
          setUnidades([]); setDespesas([]); setPatrimonio([]);
          setConfig({ valorCondominio: 200, sindicaNome: '', predioNome: '', chavePix: '', saldoInicial: 0, inicioOperacao: '', diaVencimento: 10, linkGrupo: '' });
          setModalConfig(false); setConfirmarReset(false); setShowWizard(true);
      } catch(e) { console.error("Erro ao reiniciar:", e); } finally { setLoading(false); }
  };

  // --- CÁLCULOS FINANCEIROS ---
  const getMesAnoValor = (mes, ano) => ano * 12 + MESES.indexOf(mes);
  const calcularInicioOperacao = useMemo(() => {
    let minVal = Infinity; let minDateStr = "";
    despesas.forEach(d => { const val = getMesAnoValor(d.mes, d.ano); if (val < minVal) { minVal = val; minDateStr = `${d.ano}-${String(MESES.indexOf(d.mes)+1).padStart(2,'0')}-01`; } });
    unidades.forEach(u => { Object.keys(u.status || {}).forEach(k => { const [m, a] = k.split('-'); const val = getMesAnoValor(m, parseInt(a)); if (val < minVal) { minVal = val; minDateStr = `${a}-${String(MESES.indexOf(m)+1).padStart(2,'0')}-01`; } }); });
    const dataManual = config.inicioOperacao ? config.inicioOperacao : null;
    let valManual = Infinity; if (dataManual) { const [y, m, d] = dataManual.split('-').map(Number); valManual = y * 12 + (m - 1); }
    if (valManual < minVal) return dataManual; if (minDateStr) return minDateStr; return `${new Date().getFullYear()}-01-01`; 
  }, [despesas, unidades, config.inicioOperacao]);

  const { receitaMes, gastoMes, despesasFiltradas, inadimplentes, saldoAteMomento, historicoGrafico } = useMemo(() => {
      const pgs = unidades.filter(u => getPagamentosMes(u, chaveAtual).length > 0);
      const rec = pgs.reduce((acc, u) => acc + calcularTotalPago(getPagamentosMes(u, chaveAtual)), 0);
      const dps = despesas.filter(d => d.mes === mesAtual && d.ano === anoAtual);
      const gas = dps.reduce((acc, d) => acc + safeNum(d.valor), 0);
      
      const hoje = new Date(); const diaVencimento = safeNum(config.diaVencimento) || 10;
      const [iniY, iniM] = calcularInicioOperacao.split('-').map(Number);
      const inicioOperacaoVal = iniY * 12 + (iniM - 1);
      const mesAtualVal = getMesAnoValor(MESES[hoje.getMonth()], hoje.getFullYear());

      let listaInad = [];
      unidades.forEach(u => {
        let pendente = []; let total = 0; 
        for (let i = 12; i >= 0; i--) {
           const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
           const m = MESES[d.getMonth()]; const y = d.getFullYear();
           const valAtual = getMesAnoValor(m, y);
           if (valAtual >= inicioOperacaoVal && (valAtual < mesAtualVal || (valAtual === mesAtualVal && hoje.getDate() > diaVencimento))) {
              const totalPago = calcularTotalPago(getPagamentosMes(u, `${m}-${y}`));
              const valorDevido = safeNum(config.valorCondominio);
              if (totalPago < valorDevido) { pendente.push({ mes: m, ano: y, valor: valorDevido - totalPago }); total += (valorDevido - totalPago); }
           }
        }
        if(pendente.length > 0) listaInad.push({ unidade: u, meses: pendente, total });
      });

      const corteAtual = getMesAnoValor(mesAtual, anoAtual);
      let recHist = 0; let despHist = 0;
      
      // Histórico para o Gráfico (Últimos 6 meses)
      const historico = [];
      for (let i = 5; i >= 0; i--) {
          const d = new Date(); d.setMonth(d.getMonth() - i);
          const mNome = MESES[d.getMonth()]; const yNum = d.getFullYear();
          const corte = getMesAnoValor(mNome, yNum);
          if (corte >= inicioOperacaoVal) {
             let r = 0; let g = 0;
             unidades.forEach(u => { const p = u.status?.[`${mNome}-${yNum}`]; if(p) r += Array.isArray(p) ? p.reduce((s,x)=>s+x.valor,0) : p.valor; });
             despesas.forEach(x => { if(x.mes === mNome && x.ano === yNum) g += x.valor; });
             historico.push({ mes: mNome.substr(0,3), receita: r, despesa: g });
          }
      }

      unidades.forEach(u => { Object.keys(u.status || {}).forEach(k => { const [m, a] = k.split('-'); if (getMesAnoValor(m, parseInt(a)) >= inicioOperacaoVal && getMesAnoValor(m, parseInt(a)) <= corteAtual) recHist += calcularTotalPago(getPagamentosMes(u, k)); }); });
      despesas.forEach(d => { if (getMesAnoValor(d.mes, d.ano) >= inicioOperacaoVal && getMesAnoValor(d.mes, d.ano) <= corteAtual) despHist += safeNum(d.valor); });

      return { receitaMes: rec, gastoMes: gas, despesasFiltradas: dps, inadimplentes: listaInad, saldoAteMomento: safeNum(config.saldoInicial) + recHist - despHist, historicoGrafico: historico };
  }, [unidades, despesas, chaveAtual, config.saldoInicial, config.valorCondominio, calcularInicioOperacao, config.diaVencimento, mesAtual, anoAtual]);

  const saldoGeral = useMemo(() => {
      const [iniY, iniM] = calcularInicioOperacao.split('-').map(Number); const corteInicio = iniY * 12 + (iniM - 1);
      const totalRec = unidades.reduce((acc, u) => acc + Object.keys(u.status || {}).reduce((s, k) => { const [m, a] = k.split('-'); return getMesAnoValor(m, parseInt(a)) >= corteInicio ? s + calcularTotalPago(getPagamentosMes(u, k)) : s; }, 0), 0);
      const totalDesp = despesas.reduce((acc, d) => getMesAnoValor(d.mes, d.ano) >= corteInicio ? acc + safeNum(d.valor) : acc, 0);
      return safeNum(config.saldoInicial) + totalRec - totalDesp;
  }, [unidades, despesas, config.saldoInicial, calcularInicioOperacao]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><RefreshCw className="animate-spin text-[#84cc16]"/><p className="ml-4 font-black text-[#1e293b]">Carregando...</p></div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-28 print:bg-white print:pb-0">
      <style>{`@media print { .no-print { display: none !important; } .print-area { display: block !important; position: absolute; top:0; left:0; width:100%; height:100%; z-index:9999; background:white; } }`}</style>
      
      {showWizard && <SetupWizard config={config} setConfig={setConfig} setUnidades={setUnidades} onDemo={() => { 
          const ano = new Date().getFullYear();
          setUnidades([{ id: '101', numero: '101', proprietario: {nome: 'Carlos'}, moraProprietario: true, status: {} }]);
          setConfig({...config, predioNome: 'Demo', sindicaNome: 'Teste', valorCondominio: 250, inicioOperacao: `${ano}-01-01`, saldoInicial: 500});
          setShowWizard(false); 
      }} onComplete={() => setShowWizard(false)} importarBackup={importarBackup} />}

      <div className="bg-[#1e293b] text-white py-3 px-4 flex justify-between items-center sticky top-0 z-40 no-print border-b border-white/5 shadow-xl">
        <div className="flex gap-2 items-center">
           <div className="bg-[#84cc16] p-1.5 rounded-lg"><Home size={14} className="text-[#1e293b]"/></div>
           <span className="font-bold text-xs truncate max-w-[150px]">{safeStr(config.predioNome || "CondoLeve")}</span>
        </div>
        <div className="flex gap-2 items-center">
          <div className="mr-2">{statusSync === 'saving' && <RefreshCw size={14} className="animate-spin text-yellow-400"/>}{statusSync === 'saved' && <Cloud size={14} className="text-[#84cc16]"/>}{statusSync === 'error' && <WifiOff size={14} className="text-red-500"/>}</div>
          <button onClick={() => setModalConfig(true)} className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition"><Settings size={16}/></button>
          <button onClick={() => supabase.auth.signOut()} className="bg-red-500/20 hover:bg-red-500/40 p-2 rounded-xl transition text-red-200"><LogOut size={16}/></button>
        </div>
      </div>

      <header className="bg-[#1e293b] text-white pt-6 px-6 pb-12 no-print relative overflow-hidden text-center">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4"><Logo dark /></div>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/5 backdrop-blur-md p-2 rounded-2xl flex items-center justify-between border border-white/10 w-full max-w-xs mx-auto mb-4">
             <button onClick={() => { const idx = MESES.indexOf(mesAtual); if(idx > 0) setMesAtual(MESES[idx-1]); else { setAnoAtual(anoAtual-1); setMesAtual(MESES[11]); } }} className="p-3 hover:bg-white/10 rounded-xl transition"><TrendingDown className="rotate-90 w-4 h-4 text-[#84cc16]"/></button>
             <div><span className="font-black text-xl tracking-tight uppercase">{safeStr(mesAtual)}</span><p className="text-[9px] font-bold text-slate-400 tracking-widest leading-none mt-1">{safeStr(anoAtual)}</p></div>
             <button onClick={() => { const idx = MESES.indexOf(mesAtual); if(idx < 11) setMesAtual(MESES[idx+1]); else { setAnoAtual(anoAtual+1); setMesAtual(MESES[0]); } }} className="p-3 hover:bg-white/10 rounded-xl transition"><TrendingUp className="rotate-90 w-4 h-4 text-[#84cc16]"/></button>
          </div>
          <div className="flex gap-8 justify-center mt-2">
             <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Entradas</p><p className="font-black text-green-400">{formatarMoeda(receitaMes)}</p></div>
             <div className="h-10 w-px bg-white/10"></div>
             <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Saídas</p><p className="font-black text-red-400">-{formatarMoeda(gastoMes)}</p></div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 -mt-8 relative z-10 no-print">
        {abaAtiva === 'receitas' && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="grid gap-3">
              {unidades.map(u => {
                const valorDevido = safeNum(config.valorCondominio);
                const pags = getPagamentosMes(u, chaveAtual);
                const totalPago = calcularTotalPago(pags);
                const isPago = totalPago >= valorDevido;
                const isParcial = totalPago > 0 && totalPago < valorDevido;
                return (
                  <Card key={u.id} className={`p-4 border-l-[6px] transition-all hover:shadow-md ${isPago ? 'border-l-[#84cc16]' : (isParcial ? 'border-l-yellow-400' : 'border-l-slate-200')}`}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex gap-4 items-center text-left">
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl font-black flex items-center justify-center text-slate-400 text-lg border border-slate-100">{safeStr(u.numero)}</div>
                        <div>
                          <p className="font-black text-slate-800 flex items-center gap-2">{safeStr(u.moraProprietario ? (u.proprietario?.nome || "Proprietário") : (u.inquilino?.nome || "Morador"))} <button onClick={() => setModalEditar(u)} className="text-slate-300 hover:text-blue-500"><Pencil size={12}/></button></p>
                          <div className="mt-1">{totalPago > 0 ? <span className={`text-[10px] font-black uppercase tracking-tighter flex items-center gap-1 ${isPago ? 'text-[#84cc16]' : 'text-yellow-600'}`}><CheckCircle size={10}/> {isPago ? 'PAGO' : 'PARCIAL'} • {formatarMoeda(totalPago)}</span> : <span className="text-[10px] font-black text-slate-400 tracking-wide uppercase">PENDENTE • {formatarMoeda(valorDevido)}</span>}</div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                          {totalPago > 0 ? <button onClick={() => setModalDetalhesUnidade({ u, mes: mesAtual, ano: anoAtual, pags, totalPago, valorDevido })} className="text-[10px] bg-slate-100 text-slate-600 font-black px-4 py-2 rounded-xl hover:bg-slate-200 flex items-center gap-2"><Eye size={12}/> DETALHES</button> : <button onClick={() => setModalPagamento({ unidadeId: u.id, valorSugerido: valorDevido })} className="bg-[#1e293b] text-white text-[10px] font-black px-6 py-3 rounded-2xl shadow-lg active:scale-95 transition">RECEBER</button>}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {abaAtiva === 'despesas' && (
          <div className="space-y-4 animate-in fade-in duration-500">
             <Card className="p-6 bg-white border-l-[6px] border-l-red-500 shadow-xl flex justify-between items-center text-left"><div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total de Gastos</p><p className="text-3xl font-black text-red-600">{formatarMoeda(gastoMes)}</p></div><button onClick={() => setModalNovaDespesa(true)} className="bg-red-500 text-white px-5 py-4 rounded-2xl font-black text-xs shadow-lg flex items-center gap-2 hover:bg-red-600 transition"><PlusCircle size={18}/> LANÇAR CONTA</button></Card>
             {despesasFiltradas.length === 0 && <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-slate-200 px-8 text-center"><p className="text-slate-400 font-bold mb-4">Nenhuma conta lançada.</p><button onClick={copiarDespesasAnteriores} className="text-[#1e293b] font-black text-sm flex items-center justify-center gap-2 mx-auto bg-slate-100 px-6 py-3 rounded-2xl hover:bg-slate-200 transition"><Copy size={16}/> Reutilizar do mês anterior</button></div>}
             <div className="grid gap-2">{despesasFiltradas.map(d => (<Card key={d.id} className="p-4 flex justify-between items-center text-left"><div><p className="font-black text-slate-800">{safeStr(d.descricao)}</p><div className="flex gap-2 mt-1"><Badge color={d.categoria === 'Luz' ? 'orange' : 'slate'}>{safeStr(d.categoria)}</Badge><span className="text-[10px] font-bold text-slate-400 self-center">{safeStr(d.data)}</span></div></div><div className="flex items-center gap-4"><p className="font-black text-red-600">-{formatarMoeda(d.valor)}</p><div className="flex gap-1"><button onClick={() => setModalEditarDespesa(d)} className="p-2 text-slate-300 hover:text-blue-500"><Edit size={16}/></button><button onClick={() => { if(confirm("Apagar conta?")) setDespesas(despesas.filter(x=>x.id!==d.id)) }} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={16}/></button></div></div></Card>))}</div>
          </div>
        )}

        {abaAtiva === 'caixa' && (
          <div className="space-y-6 animate-in fade-in duration-500 text-left">
             <section>
                 <div className="bg-[#1e293b] text-white p-10 rounded-[32px] shadow-2xl relative overflow-hidden mb-6">
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none transform translate-x-1/4 -translate-y-1/4"><Wallet size={200}/></div>
                    <div className="relative z-10"><p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Saldo em Caixa</p><h2 className="text-5xl font-black mb-10 tracking-tighter">{formatarMoeda(saldoGeral)}</h2><div className="mb-10 pt-4 border-t border-white/10"><p className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1"><History size={10}/> Saldo acumulado até {safeStr(mesAtual)}/{safeStr(anoAtual)}</p><p className="text-xl font-bold text-[#84cc16] tracking-tight">{formatarMoeda(saldoAteMomento)}</p></div><div className="grid grid-cols-2 gap-4"><button onClick={() => setModalRelatorio(true)} className="bg-[#84cc16] text-[#1e293b] py-4 rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-2 hover:bg-[#a3e635]"><FileText size={18}/> GERAR PDF</button><button onClick={() => setModalZeladoria(true)} className="bg-white/10 py-4 rounded-2xl font-black text-sm border border-white/20 flex items-center justify-center gap-2 hover:bg-white/20"><Hammer size={18} className="text-[#84cc16]"/> ZELADORIA</button></div></div>
                 </div>
                 {/* GRÁFICO CSS SIMPLES */}
                 {historicoGrafico.length > 0 && (
                     <Card className="p-6">
                         <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-6">Últimos 6 Meses</h3>
                         <div className="flex justify-between items-end gap-2 h-40">
                             {historicoGrafico.map((h, i) => {
                                 const maxVal = Math.max(...historicoGrafico.map(x=>Math.max(x.receita, x.despesa))) || 1;
                                 const hRec = Math.max((h.receita / maxVal) * 100, 5);
                                 const hDesp = Math.max((h.despesa / maxVal) * 100, 5);
                                 return (
                                     <div key={i} className="flex flex-col items-center flex-1 group relative">
                                         <div className="flex gap-1 items-end w-full justify-center h-full">
                                            <div style={{height: `${hRec}%`}} className="w-2 bg-green-400 rounded-t-sm transition-all group-hover:bg-green-500 relative"><div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 text-[9px] font-bold text-green-600 opacity-0 group-hover:opacity-100 transition whitespace-nowrap bg-green-100 px-1 rounded">{formatarMoeda(h.receita)}</div></div>
                                            <div style={{height: `${hDesp}%`}} className="w-2 bg-red-400 rounded-t-sm transition-all group-hover:bg-red-500 relative"><div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 text-[9px] font-bold text-red-600 opacity-0 group-hover:opacity-100 transition whitespace-nowrap bg-red-100 px-1 rounded">{formatarMoeda(h.despesa)}</div></div>
                                         </div>
                                         <span className="text-[9px] font-bold text-slate-400 mt-2 uppercase">{h.mes}</span>
                                     </div>
                                 )
                             })}
                         </div>
                     </Card>
                 )}
             </section>
          </div>
        )}

        {abaAtiva === 'cobrancas' && (
           <div className="space-y-4 animate-in slide-in-from-bottom-4 text-left">
              <div className="bg-[#1e293b] p-6 rounded-3xl shadow-xl flex justify-between items-center border border-white/5"><div><h3 className="font-black text-white text-sm uppercase tracking-widest">Inadimplência</h3><p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Total acumulado em atraso</p></div><div className="text-right text-3xl font-black text-red-400">{formatarMoeda(inadimplentes.reduce((acc, i) => acc + i.total, 0))}</div></div>
              <div className="grid gap-3">{inadimplentes.map(item => (<Card key={item.unidade.id} className="border-l-4 border-l-red-500 p-4 flex justify-between items-center transition-all hover:translate-x-1"><div className="flex gap-4 items-center"><div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl font-black flex items-center justify-center text-sm">{safeStr(item.unidade.numero)}</div><div><div className="font-black text-slate-800">{safeStr(item.unidade.proprietario?.nome) || "Morador"}</div><div className="text-xs font-bold text-red-500 mt-0.5 uppercase tracking-tighter">{formatarMoeda(item.total)} • {item.meses.length} meses</div></div></div><div className="flex gap-2"><button onClick={() => setModalDetalhesInad(item)} className="bg-red-50 text-red-600 px-4 py-3 rounded-2xl text-xs font-black flex items-center gap-2"><Eye size={16}/></button><button onClick={() => enviarCobranca(item.unidade, item.meses)} className="bg-[#84cc16] text-[#1e293b] px-4 py-3 rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg active:scale-90"><MessageCircle size={16}/> COBRAR</button></div></Card>))}</div>
           </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 border-t border-slate-100 px-6 py-4 flex justify-around items-end z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] no-print pb-10 backdrop-blur-xl">
         <NavBtn active={abaAtiva === 'receitas'} onClick={() => setAbaAtiva('receitas')} icon={<ArrowUpCircle size={24}/>} label="Receitas" />
         <NavBtn active={abaAtiva === 'despesas'} onClick={() => setAbaAtiva('despesas')} icon={<ArrowDownCircle size={24}/>} label="Despesas" />
         <div className="px-1"></div>
         <NavBtn active={abaAtiva === 'cobrancas'} onClick={() => setAbaAtiva('cobrancas')} icon={<AlertTriangle size={24}/>} label="Cobrança" />
         <NavBtn active={abaAtiva === 'caixa'} onClick={() => setAbaAtiva('caixa')} icon={<PieChart size={24}/>} label="O Caixa" />
      </nav>

      {modalPagamento && <ModalReceber valorSugerido={modalPagamento.valorSugerido} onCancel={() => setModalPagamento(null)} onConfirm={(v,d) => { adicionarPagamento(modalPagamento.unidadeId, v, d); setModalPagamento(null); }} />}
      {modalDetalhesUnidade && <ModalDetalhesUnidade dados={modalDetalhesUnidade} sindica={config.sindicaNome} chavePix={config.chavePix} onAdd={(v,d) => { adicionarPagamento(modalDetalhesUnidade.u.id, v, d); setModalDetalhesUnidade(null); }} onDelete={(pid) => { removerPagamento(modalDetalhesUnidade.u.id, pid, `${modalDetalhesUnidade.mes}-${modalDetalhesUnidade.ano}`); setModalDetalhesUnidade(null); }} onClose={() => setModalDetalhesUnidade(null)} />}
      {modalDetalhesInad && <ModalDetalhesInadimplencia dados={modalDetalhesInad} onClose={() => setModalDetalhesInad(null)} />}
      {modalConfig && <ModalConfiguracoes config={config} setConfig={setConfig} onClose={() => setModalConfig(false)} aoClicarReset={() => setConfirmarReset(true)} exportarBackup={exportarBackup} importarBackup={importarBackup} calcularInicioOperacao={calcularInicioOperacao} />}
      {modalNovaDespesa && <ModalDespesa onClose={() => setModalNovaDespesa(false)} onSave={(d) => { setDespesas([...despesas, {...d, id: Date.now(), mes: mesAtual, ano: anoAtual}]); setModalNovaDespesa(false); }} />}
      {modalEditarDespesa && <ModalDespesa despesaParaEditar={modalEditarDespesa} onClose={() => setModalEditarDespesa(null)} onSave={(d) => { setDespesas(despesas.map(item => item.id === modalEditarDespesa.id ? { ...d, id: item.id, mes: item.mes, ano: item.ano } : item)); setModalEditarDespesa(null); }} />}
      {modalEditar && <ModalEditarUnidade u={modalEditar} onClose={() => setModalEditar(null)} onSave={(novo) => { setUnidades(unidades.map(x => x.id === novo.id ? novo : x)); setModalEditar(null); }} />}
      {modalRecibo && <ModalRecibo dados={modalRecibo} onClose={() => setModalRecibo(null)} />}
      {modalZeladoria && <ModalZeladoria patrimonio={patrimonio} setPatrimonio={setPatrimonio} onClose={() => setModalZeladoria(false)} />}
      {modalRelatorio && <ModalRelatorioCompleto mes={mesAtual} ano={anoAtual} receita={receitaMes} gasto={gastoMes} pagamentos={unidades.filter(u => getPagamentosMes(u, chaveAtual).length > 0)} despesas={despesasFiltradas} sindica={config.sindicaNome} unidades={unidades} onClose={() => setModalRelatorio(false)} config={config} />}
      
      {confirmarReset && (
        <div className="fixed inset-0 bg-[#1e293b]/95 z-[300] flex items-center justify-center p-6 backdrop-blur-md">
           <div className="bg-white p-10 rounded-[40px] max-w-sm text-center shadow-2xl animate-in zoom-in duration-300">
              <div className="bg-red-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-red-600"><AlertTriangle size={40}/></div>
              <h3 className="font-black text-2xl text-[#1e293b] mb-4 tracking-tighter">Apagar Tudo?</h3>
              <p className="text-slate-500 mb-8 font-medium">Esta ação é irreversível. Todos os dados do seu condomínio serão excluídos permanentemente.</p>
              <div className="flex flex-col gap-3">
                 <button onClick={executarReinicializacao} className="bg-red-500 text-white w-full py-5 rounded-2xl font-black shadow-xl transition active:scale-95 uppercase tracking-widest text-xs">Sim, apagar permanentemente</button>
                 <button onClick={() => setConfirmarReset(false)} className="text-slate-400 font-black text-xs uppercase tracking-widest py-3 hover:text-[#1e293b]">Cancelar</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

// --- AUXILIARES (WIZARD & MODAIS) ---

function SetupWizard({ config, setConfig, setUnidades, onDemo, onComplete, importarBackup }) {
    const [step, setStep] = useState(1);
    const [local, setLocal] = useState({...config});
    const [lista, setLista] = useState('');
    return (
        <div className="fixed inset-0 bg-white z-[200] flex flex-col p-8 font-sans text-left overflow-y-auto">
            <div className="max-w-md mx-auto w-full">
                <Logo className="mb-10" />
                <div className="flex gap-2 mb-10">{[1,2,3,4].map(i => <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-[#1e293b]' : 'bg-slate-100'}`}></div>)}</div>
                {step === 1 && (<div className="animate-in slide-in-from-bottom-4 duration-500"><h2 className="text-3xl font-black text-slate-900 mb-2 leading-tight">Configurar Prédio 🏢</h2><p className="text-slate-500 mb-10 font-medium">Informações básicas do condomínio.</p><div className="space-y-6"><label className="block"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome do Condomínio</span><input value={local.predioNome || ""} onChange={e=>setLocal({...local, predioNome:e.target.value})} placeholder="Ex: Residencial Solar" className="w-full border-2 border-slate-100 p-4 rounded-2xl font-black focus:border-[#84cc16] outline-none transition-all"/></label><label className="block"><span className="text-[10px] font-black text-slate-400 uppercase">Seu Nome (Síndico)</span><input value={local.sindicaNome || ""} onChange={e=>setLocal({...local, sindicaNome:e.target.value})} placeholder="Ex: Maria Clara" className="w-full border-2 border-slate-100 p-4 rounded-2xl font-black focus:border-[#84cc16] outline-none transition-all"/></label></div></div>)}
                {step === 2 && (<div className="animate-in slide-in-from-right-4 duration-500"><h2 className="text-3xl font-black text-slate-900 mb-2 leading-tight">Valores e PIX 💰</h2><p className="text-slate-500 mb-10 font-medium">Como seus moradores devem pagar?</p><div className="space-y-6"><label className="block"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Condomínio Mensal</span><input type="number" value={safeNum(local.valorCondominio)} onChange={e=>setLocal({...local, valorCondominio:Number(e.target.value)})} className="w-full border-2 border-slate-100 p-4 rounded-2xl font-black text-green-600 focus:border-[#84cc16] outline-none"/></label><label className="block"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chave PIX</span><input value={local.chavePix || ""} onChange={e=>setLocal({...local, chavePix:e.target.value})} placeholder="E-mail, CPF ou Aleatória" className="w-full border-2 border-slate-100 p-4 rounded-2xl font-black focus:border-[#84cc16] outline-none"/></label></div></div>)}
                {step === 3 && (<div className="animate-in slide-in-from-right-4 duration-500"><h2 className="text-3xl font-black text-slate-900 mb-2 leading-tight">Finanças Iniciais 🏦</h2><p className="text-slate-500 mb-10 font-medium">Vamos definir o ponto de partida do caixa.</p><div className="space-y-6"><label className="block"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mês de Referência</span><p className="text-[10px] text-slate-400 mb-2 font-medium">A partir de qual mês vamos controlar?</p><input type="month" value={local.mesInicio || new Date().toISOString().slice(0, 7)} onChange={e => {const val = e.target.value; setLocal({...local, mesInicio: val, inicioOperacao: `${val}-01`});}} className="w-full border-2 border-slate-100 p-4 rounded-2xl font-black focus:border-[#84cc16] outline-none"/></label><label className="block"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saldo em Caixa (R$)</span><p className="text-[10px] text-slate-400 mb-2 font-medium">Quanto havia na conta no dia 01 desse mês?</p><input type="number" value={safeNum(local.saldoInicial)} onChange={e=>setLocal({...local, saldoInicial:Number(e.target.value)})} className="w-full border-2 border-slate-100 p-4 rounded-2xl font-black text-green-600 focus:border-[#84cc16] outline-none"/></label></div></div>)}
                {step === 4 && (<div className="animate-in slide-in-from-right-4 duration-500"><h2 className="text-3xl font-black text-slate-900 mb-2 leading-tight">Unidades 🏠</h2><p className="text-slate-500 mb-10 font-medium">Ex: 101, 102, 201, 202...</p><textarea value={lista} onChange={e=>setLista(e.target.value)} placeholder="Digite os números separados por vírgula" className="w-full border-2 border-slate-100 p-4 rounded-2xl font-black h-40 focus:border-[#84cc16] outline-none resize-none transition-all"/></div>)}
                <div className="mt-10 flex flex-col gap-4">
                    <button onClick={() => { if (step < 4) setStep(step + 1); else { const ids = lista.split(',').map(n => n.trim()).filter(n => n); if (ids.length === 0) return alert("Cadastre unidades."); setUnidades(ids.map(n => ({ id: n, numero: n, proprietario: {nome:'', telefone:''}, moraProprietario: true, status: {} }))); setConfig(local); onComplete(); } }} className="w-full bg-[#1e293b] text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-2xl transition active:scale-95">{step === 4 ? 'FINALIZAR SETUP' : 'PRÓXIMO'} <ArrowRight size={20}/></button>
                    {step === 1 && (<div className="space-y-2"><button onClick={onDemo} className="w-full text-sm font-black text-[#84cc16] py-3 flex items-center justify-center gap-2 hover:bg-slate-50 rounded-xl transition uppercase tracking-tighter"><Sparkles size={16}/> Gerar dados de teste</button><label className="w-full text-xs font-bold text-slate-400 py-3 flex items-center justify-center gap-2 cursor-pointer border-t border-slate-100"><Download size={12}/> RESTAURAR BACKUP (.JSON)<input type="file" accept=".json" onChange={importarBackup} className="hidden"/></label></div>)}
                </div>
            </div>
        </div>
    );
}

function ModalConfiguracoes({ config, setConfig, onClose, aoClicarReset, exportarBackup, importarBackup, calcularInicioOperacao }) {
  const [bloqueado, setBloqueado] = useState(true);
  const [local, setLocal] = useState({...config});
  return (
    <div className="fixed inset-0 bg-[#1e293b]/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm text-left">
       <div className="bg-white rounded-[32px] w-full max-w-sm p-8 shadow-2xl max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center mb-6"><h3 className="font-black text-2xl text-slate-900 tracking-tighter">Ajustes</h3><button onClick={() => setBloqueado(!bloqueado)} className={`p-3 rounded-2xl transition-all ${bloqueado ? 'bg-slate-100 text-slate-400' : 'bg-red-50 text-red-500'}`}>{bloqueado ? <Lock size={20}/> : <Unlock size={20}/>}</button></div>
          <div className="flex-1 overflow-y-auto space-y-6">
             <label className="block"><span className="text-[10px] font-black text-slate-400 uppercase">Nome do Prédio</span><input disabled={bloqueado} value={safeStr(local.predioNome)} onChange={e=>setLocal({...local, predioNome:e.target.value})} className="w-full border-2 border-slate-100 p-3 rounded-xl font-bold disabled:bg-slate-50 outline-none focus:border-[#84cc16]"/></label>
             <label className="block"><span className="text-[10px] font-black text-slate-400 uppercase">Responsável</span><input disabled={bloqueado} value={safeStr(local.sindicaNome)} onChange={e=>setLocal({...local, sindicaNome:e.target.value})} className="w-full border-2 border-slate-100 p-3 rounded-xl font-bold disabled:bg-slate-50 outline-none focus:border-[#84cc16]"/></label>
             <div className="grid grid-cols-2 gap-3">
                 <label className="block"><span className="text-[10px] font-black text-slate-400 uppercase">Valor Mensal</span><input type="number" disabled={bloqueado} value={safeNum(local.valorCondominio)} onChange={e=>setLocal({...local, valorCondominio:Number(e.target.value)})} className="w-full border-2 border-slate-100 p-3 rounded-xl font-bold disabled:bg-slate-50 outline-none focus:border-[#84cc16]"/></label>
                 <label className="block"><span className="text-[10px] font-black text-slate-400 uppercase">Dia Venc.</span><input type="number" max="31" min="1" disabled={bloqueado} value={safeNum(local.diaVencimento)} onChange={e=>setLocal({...local, diaVencimento:Number(e.target.value)})} className="w-full border-2 border-slate-100 p-3 rounded-xl font-bold disabled:bg-slate-50 outline-none focus:border-[#84cc16]"/></label>
             </div>
             <label className="block"><span className="text-[10px] font-black text-slate-400 uppercase">Chave PIX</span><input disabled={bloqueado} value={safeStr(local.chavePix)} onChange={e=>setLocal({...local, chavePix:e.target.value})} className="w-full border-2 border-slate-100 p-3 rounded-xl font-bold disabled:bg-slate-50 outline-none focus:border-[#84cc16]"/></label>
             <label className="block"><span className="text-[10px] font-black text-slate-400 uppercase">Saldo Inicial</span><input type="number" disabled={bloqueado} value={safeNum(local.saldoInicial)} onChange={e=>setLocal({...local, saldoInicial:Number(e.target.value)})} className="w-full border-2 border-slate-100 p-3 rounded-xl font-bold disabled:bg-slate-50 outline-none focus:border-[#84cc16]"/></label>
             <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-[10px]"><p className="font-black text-slate-400 uppercase mb-2">Início da Operação</p><div className="flex items-center justify-between"><span className="font-bold text-slate-700">{calcularInicioOperacao.split('-').reverse().join('/')}</span>{!bloqueado && <input type="date" value={safeStr(local.inicioOperacao)} onChange={e=>setLocal({...local, inicioOperacao:e.target.value})} className="border p-1 rounded font-bold"/>}</div></div>
             <div className="pt-6 border-t border-slate-100 space-y-3"><button onClick={exportarBackup} className="bg-[#1e293b] text-white w-full py-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg hover:bg-black transition"><Download size={16}/> BAIXAR BACKUP</button><label className="bg-slate-50 w-full py-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer border-2 border-dashed border-slate-200 text-slate-500 transition hover:bg-slate-100"><Upload size={16}/> RESTAURAR DADOS<input type="file" accept=".json" onChange={importarBackup} className="hidden" /></label></div>
             <div className="pt-4 border-t border-slate-100"><button onClick={aoClicarReset} className="w-full py-4 text-red-500 font-black text-xs uppercase flex items-center justify-center gap-2 hover:bg-red-50 rounded-xl transition"><RotateCcw size={16}/> Reiniciar Configuração (Reset)</button></div>
          </div>
          <div className="mt-8 flex gap-3"><button onClick={onClose} className="flex-1 py-4 text-slate-400 font-bold text-xs uppercase">Fechar</button>{!bloqueado && <button onClick={() => { setConfig(local); onClose(); }} className="flex-1 bg-[#84cc16] text-[#1e293b] rounded-2xl font-black text-xs shadow-xl">SALVAR</button>}</div>
       </div>
    </div>
  );
}

function ModalReceber({ valorSugerido, onCancel, onConfirm }) { return <div className="fixed inset-0 bg-[#1e293b]/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm text-left"><div className="bg-white rounded-3xl w-full max-w-xs p-8 shadow-2xl"><h3 className="font-black text-slate-900 text-xl mb-6">Receber Pagamento</h3><div className="space-y-5"><label className="block"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor Recebido</span><input type="number" defaultValue={valorSugerido} id="valPag" className="w-full border-2 border-slate-100 p-4 rounded-2xl font-black text-green-600 outline-none focus:border-[#84cc16]" /></label><label className="block"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</span><input type="date" defaultValue={new Date().toISOString().split('T')[0]} id="datPag" className="w-full border-2 border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-[#84cc16]" /></label><div className="flex gap-3 pt-4"><button onClick={onCancel} className="flex-1 text-slate-400 font-black text-xs uppercase">Cancelar</button><button onClick={() => onConfirm(Number(document.getElementById('valPag').value), document.getElementById('datPag').value.split('-').reverse().join('/'))} className="flex-2 bg-[#84cc16] text-[#1e293b] py-4 rounded-2xl font-black shadow-lg flex-1">Confirmar</button></div></div></div></div>; }
function ModalDetalhesUnidade({ dados, sindica, chavePix, onAdd, onDelete, onClose }) { const [novoValor, setNovoValor] = useState(''); const [novaData, setNovaData] = useState(new Date().toISOString().split('T')[0]); const [modoRecibo, setModoRecibo] = useState(false); if(modoRecibo) return <ModalRecibo dados={{nome: dados.u.moraProprietario ? dados.u.proprietario?.nome : dados.u.inquilino?.nome, valor: dados.totalPago, mes: dados.mes, ano: dados.ano, sindica }} onClose={() => setModoRecibo(false)} />; return <div className="fixed inset-0 bg-[#1e293b]/90 z-[100] flex items-center justify-center p-4 backdrop-blur-sm text-left"><div className="bg-white rounded-[32px] w-full max-w-sm p-8 shadow-2xl"><div className="flex justify-between items-center mb-6"><div><h3 className="font-black text-xl text-slate-900 tracking-tighter">Extrato {dados.u.numero}</h3><p className="text-xs font-bold text-slate-400 uppercase">{dados.mes}/{dados.ano}</p></div><button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100"><X size={24}/></button></div><div className="space-y-4 mb-6 max-h-48 overflow-y-auto">{dados.pags.map(p => (<div key={p.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100"><div><p className="font-black text-slate-700 text-sm">{formatarMoeda(p.valor)}</p><p className="text-[10px] text-slate-400 font-bold uppercase">Pago em {p.data}</p></div><button onClick={() => onDelete(p.id)} className="text-red-300 hover:text-red-500 p-2"><Trash2 size={16}/></button></div>))}{dados.pags.length === 0 && <p className="text-center text-slate-400 text-xs italic">Nenhum pagamento.</p>}</div><div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6"><div className="flex justify-between items-center mb-1"><span className="text-[10px] font-black text-slate-400 uppercase">Total Pago</span><span className="font-black text-[#84cc16]">{formatarMoeda(dados.totalPago)}</span></div><div className="flex justify-between items-center"><span className="text-[10px] font-black text-slate-400 uppercase">Valor Devido</span><span className="font-bold text-slate-600 text-xs">{formatarMoeda(dados.valorDevido)}</span></div></div><button onClick={() => setModoRecibo(true)} className="w-full bg-slate-100 text-slate-600 py-3 rounded-xl font-black text-xs mb-4 flex items-center justify-center gap-2 hover:bg-slate-200 transition"><FileText size={16}/> GERAR RECIBO TOTAL</button><div className="pt-6 border-t border-slate-100"><p className="text-[10px] font-black text-slate-400 uppercase mb-2">Adicionar Pagamento</p><div className="flex gap-2"><input type="number" placeholder="Valor" value={novoValor} onChange={e=>setNovoValor(e.target.value)} className="w-1/3 border-2 border-slate-100 p-3 rounded-xl font-bold text-sm outline-none focus:border-[#84cc16]"/><input type="date" value={novaData} onChange={e=>setNovaData(e.target.value)} className="w-1/3 border-2 border-slate-100 p-3 rounded-xl font-bold text-xs outline-none focus:border-[#84cc16]"/><button onClick={() => {if(novoValor) onAdd(Number(novoValor), novaData.split('-').reverse().join('/'))}} className="flex-1 bg-[#1e293b] text-white rounded-xl font-black text-xs shadow-lg"><PlusCircle size={16} className="mx-auto"/></button></div></div></div></div>; }
function ModalDetalhesInadimplencia({ dados, onClose }) { return <div className="fixed inset-0 bg-[#1e293b]/90 z-[100] flex items-center justify-center p-4 backdrop-blur-sm text-left"><div className="bg-white rounded-[32px] w-full max-w-sm p-8 shadow-2xl"><div className="flex justify-between items-center mb-6"><h3 className="font-black text-xl text-slate-900 tracking-tighter">Detalhes da Dívida</h3><button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100"><X size={24}/></button></div><div className="bg-red-50 p-4 rounded-2xl border border-red-100 mb-6 text-center"><p className="text-[10px] font-black text-red-400 uppercase mb-1">Total em Atraso</p><p className="text-3xl font-black text-red-600">{formatarMoeda(dados.total)}</p></div><div className="space-y-3 max-h-60 overflow-y-auto">{dados.meses.map((m, idx) => (<div key={idx} className="flex justify-between items-center border-b border-slate-50 pb-2"><span className="font-black text-slate-700 text-sm">{m.mes}/{m.ano}</span><span className="font-bold text-red-500 text-sm">{formatarMoeda(m.valor)}</span></div>))}</div><button onClick={onClose} className="w-full mt-6 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200">Fechar</button></div></div>; }
function ModalRecibo({ dados, onClose }) { const [texto, setTexto] = useState(`🧾 RECIBO CONDOLEVE\nRecebido de: ${safeStr(dados.nome)}\nValor: ${formatarMoeda(dados.valor)}\nRef: ${safeStr(dados.mes)}/${safeStr(dados.ano)}`); return <div className="fixed inset-0 bg-black/80 z-[150] flex items-center justify-center p-0 md:p-6 print-area backdrop-blur-md text-left text-center"><div className="bg-white w-full h-full md:h-auto md:max-w-md md:rounded-[40px] shadow-2xl flex flex-col relative overflow-hidden"><div className="p-4 border-b flex justify-between items-center bg-slate-50 no-print sticky top-0"><h3 className="font-black text-xs uppercase text-slate-400 tracking-widest">Recibo Digital</h3><button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200"><X size={20}/></button></div><div className="p-10 overflow-y-auto"><div className="border-4 border-slate-900 p-8 rounded-[32px] text-center bg-white relative"><div className="bg-[#84cc16] text-[#1e293b] absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-2 rounded-full font-black text-sm shadow-lg tracking-widest uppercase">CONDOLEVE</div><h2 className="text-3xl font-black uppercase tracking-[0.3em] mb-6 mt-4 text-center">RECIBO</h2><div className="text-left space-y-6 text-sm"><div><span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">RECEBEMOS DE</span><p className="font-black text-slate-900 text-xl tracking-tight text-left">{safeStr(dados.nome)}</p></div><div><span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">VALOR</span><p className="text-3xl font-black text-green-700 text-left">{formatarMoeda(dados.valor)}</p></div><div><span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">REFERENTE A</span><p className="font-bold text-slate-600 text-left">Condomínio {safeStr(dados.mes)}/{safeStr(dados.ano)}</p></div><div className="pt-10 text-center border-t border-slate-100"><p className="font-black text-slate-900 text-lg text-center">{safeStr(dados.sindica)}</p><p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] text-center">ADMINISTRAÇÃO</p></div></div></div><div className="mt-8 no-print text-left"><p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Mensagem WhatsApp</p><textarea className="w-full border p-3 rounded-xl text-xs h-24 focus:border-[#84cc16] outline-none resize-none" value={texto} onChange={e=>setTexto(e.target.value)}/></div><button onClick={onClose} className="w-full mt-4 bg-slate-100 text-slate-500 py-3 rounded-xl font-black text-xs no-print hover:bg-slate-200">VOLTAR / FECHAR</button></div><div className="p-6 bg-slate-50 border-t flex justify-end gap-3 no-print sticky bottom-0"><button onClick={() => copiarTextoSeguro(texto)} className="bg-green-100 text-green-700 px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition hover:bg-green-200"><Copy size={14}/> COPIAR</button><button onClick={() => window.print()} className="bg-[#1e293b] text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl flex-1 justify-center transition active:scale-95"><Printer size={18}/> IMPRIMIR</button></div></div></div>; }
function ModalDespesa({ onClose, onSave, despesaParaEditar = null }) { const [desc, setDesc] = useState(despesaParaEditar ? despesaParaEditar.descricao : ''); const [val, setVal] = useState(despesaParaEditar ? despesaParaEditar.valor : ''); const [cat, setCat] = useState(despesaParaEditar ? despesaParaEditar.categoria : 'Outros'); const [data, setData] = useState(despesaParaEditar ? despesaParaEditar.data.split('/').reverse().join('-') : new Date().toISOString().split('T')[0]); return <div className="fixed inset-0 bg-[#1e293b]/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm text-left"><div className="bg-white rounded-[32px] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in duration-300"><h3 className="font-black text-red-600 text-xl mb-6 flex items-center gap-2 tracking-tighter"><ArrowDownCircle/> {despesaParaEditar ? 'Editar' : 'Lançar'} Despesa</h3><div className="space-y-4"><label className="block text-left"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">O que foi pago?</span><input placeholder="Ex: Manutenção Portão" value={desc} className="w-full border-2 border-slate-100 p-4 rounded-2xl font-black outline-none focus:border-red-400 transition-all" onChange={e=>setDesc(e.target.value)}/></label><div className="flex gap-3 text-left"><label className="w-1/2 block text-left"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Valor</span><input type="number" placeholder="0,00" value={val} className="w-full border-2 border-slate-100 p-4 rounded-2xl font-black text-red-600 outline-none focus:border-red-400" onChange={e=>setVal(e.target.value)}/></label><label className="w-1/2 block text-left"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Data</span><input type="date" value={data} className="w-full border-2 border-slate-100 p-4 rounded-2xl font-bold text-xs outline-none" onChange={e=>setData(e.target.value)}/></label></div><label className="block text-left"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Categoria</span><select className="w-full border-2 border-slate-100 p-4 rounded-2xl bg-white font-black outline-none focus:border-red-400" onChange={e=>setCat(e.target.value)} value={cat}>{CATEGORIAS_DESPESA.map(c=><option key={c} value={c}>{c}</option>)}</select></label><div className="flex gap-2 pt-6"><button onClick={onClose} className="flex-1 py-4 text-slate-400 font-bold text-xs uppercase">Cancelar</button><button onClick={() => { if(desc && val) onSave({descricao:desc, valor:Number(val), categoria:cat, data:data.split('-').reverse().join('/')}) }} className="flex-2 bg-red-500 text-white py-4 rounded-2xl font-black shadow-xl flex-1 transition active:scale-95">SALVAR</button></div></div></div></div>; }
function ModalEditarUnidade({ u, onClose, onSave }) { const [dados, setDados] = useState({...u}); const up = (field, val, isProp) => { if(isProp) setDados({...dados, proprietario:{...(dados.proprietario || {}), [field]:val}}); else setDados({...dados, inquilino:{...(dados.inquilino || {}), [field]:val}}); }; return <div className="fixed inset-0 bg-[#1e293b]/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm text-left"><div className="bg-white rounded-[32px] w-full max-w-sm p-8 shadow-2xl"><h3 className="font-black text-2xl mb-6 tracking-tighter text-slate-900 text-left">Unidade {safeStr(u.numero)}</h3><div className="space-y-6"><div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 text-left"><p className="text-[10px] font-black text-[#1e293b] uppercase mb-3 tracking-widest opacity-50 text-left">Dono da Unidade</p><input placeholder="Nome" value={safeStr(dados.proprietario?.nome)} onChange={e=>up('nome', e.target.value, true)} className="w-full border p-3 rounded-xl font-bold text-sm mb-3 outline-none focus:border-[#84cc16]"/><input placeholder="WhatsApp" value={safeStr(dados.proprietario?.telefone)} onChange={e=>up('telefone', e.target.value, true)} className="w-full border p-3 rounded-xl font-bold text-sm outline-none focus:border-[#84cc16]"/></div><label className="flex items-center gap-3 p-4 border-2 rounded-2xl bg-[#84cc16]/5 cursor-pointer border-[#84cc16]/20 transition hover:bg-[#84cc16]/10 text-left"><input type="checkbox" checked={dados.moraProprietario} onChange={e=>setDados({...dados, moraProprietario:e.target.checked})} className="w-6 h-6 rounded-md"/> <span className="text-xs font-black text-[#1e293b] uppercase tracking-tighter text-left">Residência Própria?</span></label>{!dados.moraProprietario && (<div className="bg-orange-50/50 p-5 rounded-3xl border border-orange-100 animate-in slide-in-from-top-2 text-left"><p className="text-[10px] font-black text-orange-600 uppercase mb-3 tracking-widest opacity-60 text-left">Morador / Inquilino</p><input placeholder="Nome" value={safeStr(dados.inquilino?.nome)} onChange={e=>up('nome', e.target.value, false)} className="w-full border p-3 rounded-xl font-bold text-sm mb-3 outline-none"/><input placeholder="Telefone" value={safeStr(dados.inquilino?.telefone)} onChange={e=>up('telefone', e.target.value, false)} className="w-full border p-3 rounded-xl font-bold text-sm outline-none"/></div>)}<div className="flex gap-3 pt-4"><button onClick={onClose} className="flex-1 text-slate-400 font-black text-xs uppercase">Cancelar</button><button onClick={() => onSave(dados)} className="flex-1 bg-[#1e293b] text-white py-4 rounded-2xl font-black shadow-xl transition active:scale-95">SALVAR</button></div></div></div></div>; }
function ModalRelatorioCompleto({ mes, ano, receita, gasto, pagamentos, despesas, sindica, unidades, onClose, config }) { const gerarResumoZap = () => { const saldo = receita - gasto; const emojiSaldo = saldo >= 0 ? "✅" : "🔻"; const txt = `📊 *PRESTAÇÃO DE CONTAS - ${mes}/${ano}*\n\n💰 *Receitas:* ${formatarMoeda(receita)}\n💸 *Despesas:* ${formatarMoeda(gasto)}\n────────────────\n${emojiSaldo} *SALDO DO MÊS:* ${formatarMoeda(saldo)}\n\nAtt, ${sindica}`; copiarTextoSeguro(txt); }; const listaUnificada = useMemo(() => { return unidades.map(u => { const pags = Array.isArray(u.status[`${mes}-${ano}`]) ? u.status[`${mes}-${ano}`] : (u.status[`${mes}-${ano}`] ? [u.status[`${mes}-${ano}`]] : []); const totalPago = pags.reduce((acc, p) => acc + safeNum(p.valor), 0); const valorDevido = safeNum(config.valorCondominio); const pendente = valorDevido - totalPago; let status = 'pago'; if (totalPago === 0) status = 'pendente'; else if (totalPago < valorDevido) status = 'parcial'; return { ...u, totalPago, pendente, status }; }).sort((a,b) => { if (a.status === 'pendente' && b.status !== 'pendente') return -1; if (a.status !== 'pendente' && b.status === 'pendente') return 1; return 0; }); }, [unidades, mes, ano, config]); return <div className="fixed inset-0 bg-[#1e293b]/90 z-[100] flex items-center justify-center p-0 md:p-6 print-area backdrop-blur-md text-left text-center"><div className="bg-white w-full h-full md:h-auto md:max-h-[95vh] md:max-w-3xl md:rounded-[40px] shadow-2xl overflow-y-auto flex flex-col relative"><div className="p-6 border-b flex justify-between items-center bg-slate-50 no-print sticky top-0 z-10 text-left"><h3 className="font-black text-xs uppercase text-slate-400 tracking-[0.3em]">Prestação de Contas</h3><button onClick={onClose} className="p-3 bg-white rounded-full shadow-sm"><X size={20}/></button></div><div className="p-12"><Logo className="justify-center mb-8" /><h1 className="text-4xl font-black uppercase mb-2 tracking-tight text-center">Fechamento do Mês</h1><p className="font-bold text-slate-400 mb-12 uppercase tracking-[0.4em] text-xs text-center">{safeStr(mes)} de {safeStr(ano)}</p><div className="grid grid-cols-3 gap-6 mb-12"><div className="p-6 bg-green-50 rounded-3xl border border-green-100 flex flex-col items-center"><span className="text-[9px] font-black uppercase text-green-800 mb-2 tracking-widest text-center">Receitas</span><span className="font-black text-xl text-green-700">{formatarMoeda(receita)}</span></div><div className="p-6 bg-red-50 rounded-3xl border border-red-100 flex flex-col items-center"><span className="text-[9px] font-black uppercase text-red-800 mb-2 tracking-widest text-center">Despesas</span><span className="font-black text-xl text-red-700">-{formatarMoeda(gasto)}</span></div><div className="p-6 bg-[#1e293b] rounded-3xl flex flex-col items-center shadow-xl"><span className="text-[9px] font-black uppercase text-white/50 mb-2 tracking-widest text-center">Saldo Mês</span><span className={`font-black text-xl ${(receita-gasto)>=0?'text-[#84cc16]':'text-red-400'}`}>{formatarMoeda(receita-gasto)}</span></div></div><div className="text-left space-y-8 mb-10 text-left text-left"><h4 className="font-black text-slate-400 uppercase text-[10px] border-b tracking-[0.5em] pb-2">Saídas (Despesas)</h4><div className="space-y-4">{despesas.length > 0 ? despesas.map(d => (<div key={d.id} className="flex justify-between text-sm py-3 border-b border-slate-50"><span className="font-black text-slate-800 tracking-tight text-left">{safeStr(d.descricao)}</span><span className="font-black text-red-600">-{formatarMoeda(d.valor)}</span></div>)) : <p className="text-slate-400 text-xs italic">Nenhuma despesa.</p>}</div></div><div className="text-left space-y-8 mb-10 text-left text-left"><h4 className="font-black text-slate-400 uppercase text-[10px] border-b tracking-[0.5em] pb-2">Situação das Unidades</h4><div className="space-y-4">{listaUnificada.map(u => (<div key={u.id} className="flex justify-between text-sm py-3 border-b border-slate-50 items-center"><span className="font-black text-slate-800 tracking-tight">Unidade {safeStr(u.numero)}</span>{u.status === 'pago' ? <span className="font-black text-green-600 text-xs bg-green-50 px-2 py-1 rounded-lg uppercase">Pago</span> : <span className="font-black text-red-500 text-xs bg-red-50 px-2 py-1 rounded-lg uppercase">Pendente</span>}</div>))}</div></div><div className="mt-20 pt-10 border-t border-slate-100 text-center"><p className="font-black text-xl text-[#1e293b] text-center">{safeStr(sindica)}</p><p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em] mt-2 text-center">Administração</p></div></div><div className="p-6 bg-slate-50 border-t flex justify-end gap-4 no-print sticky bottom-0"><button onClick={gerarResumoZap} className="bg-green-600 text-white px-8 py-5 rounded-2xl font-black text-sm shadow-xl flex items-center gap-3 hover:bg-green-700 transition flex-1 justify-center"><MessageCircle size={20}/> GRUPO WHATSAPP</button><button onClick={() => window.print()} className="bg-[#1e293b] text-white px-8 py-5 rounded-2xl font-black text-sm flex items-center gap-3 shadow-xl hover:bg-black transition flex-1 justify-center"><Printer size={20}/> PDF</button></div></div></div>; }
function NavBtn({ active, onClick, icon, label }) { return <button onClick={onClick} className={`flex-1 flex flex-col items-center gap-1 transition-all py-1 ${active ? 'text-[#1e293b]' : 'text-slate-300'}`}><div className={`p-2 rounded-2xl transition-all ${active ? 'bg-[#84cc16] shadow-lg shadow-green-500/20 scale-110 -translate-y-2' : ''}`}>{icon}</div><span className="text-[9px] font-black uppercase tracking-widest">{safeStr(label)}</span></button>; }
function ModalZeladoria({ patrimonio, setPatrimonio, onClose }) { const [item, setItem] = useState(''); const [data, setData] = useState(''); return <div className="fixed inset-0 bg-[#1e293b]/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm text-left"><div className="bg-white rounded-[32px] w-full max-w-sm p-8 shadow-2xl h-[550px] flex flex-col"><div className="flex justify-between items-center mb-6 border-b pb-4 text-left"><h3 className="font-black text-2xl text-[#1e293b] flex items-center gap-3 tracking-tighter"><Hammer className="text-[#84cc16]" size={24}/> Zeladoria</h3><button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100"><X size={24}/></button></div><div className="flex-1 overflow-y-auto space-y-4">{patrimonio.map(p => (<div key={p.id} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100"><div><p className="font-black text-slate-800 text-sm text-left">{safeStr(p.item)}</p><p className="text-[10px] text-orange-600 font-black tracking-widest mt-1 uppercase text-left">Vence em: {safeStr(p.data).split('-').reverse().join('/')}</p></div><button onClick={() => setPatrimonio(patrimonio.filter(x=>x.id!==p.id))} className="text-slate-300 hover:text-red-500 transition"><Trash2 size={18}/></button></div>))}</div><div className="mt-6 pt-6 border-t space-y-4 text-left"><input placeholder="Ex: Extintores, Seguro..." value={item} onChange={e=>setItem(e.target.value)} className="w-full border-2 border-slate-100 p-4 rounded-2xl font-black outline-none focus:border-[#84cc16]"/><div className="flex gap-3"><input type="date" value={data} onChange={e=>setData(e.target.value)} className="flex-1 border-2 border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-[#84cc16]"/><button onClick={() => { if(item && data) { setPatrimonio([...patrimonio, {id: Date.now(), item, data}]); setItem(''); setData(''); } }} className="bg-[#84cc16] text-[#1e293b] px-6 rounded-2xl font-black shadow-lg transition active:scale-95">ADD</button></div></div></div></div>; }