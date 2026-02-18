import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Download, Edit, Trash2, User, Home, Calendar, DollarSign, 
  CheckCircle, XCircle, Phone, FileText, Settings, MessageCircle, 
  ExternalLink, Wallet, ArrowDownCircle, ArrowUpCircle, 
  PieChart, PlusCircle, TrendingUp, TrendingDown, Printer, Users,
  AlertTriangle, Clock, History, X, Copy,
  Database, Upload, Cloud, Lock, Unlock, 
  Key, Megaphone, Wrench, Hammer, Star, Check, BarChart3, ArrowRight, 
  Pencil, Smartphone, Sparkles, ListPlus, Eye, EyeOff, CalendarDays, 
  Link as LinkIcon, Save, RefreshCw, WifiOff, LogOut, Mail, RotateCcw, 
  Search, CheckSquare, Square, Crown, FileSpreadsheet, ShieldCheck, 
  LockKeyhole, PlayCircle, Repeat, Paperclip, Image as ImageIcon, 
  ThumbsUp, Calculator, UserPlus, LogIn, LogOut as LogOutIcon, 
  AlertOctagon, FileCheck, Droplets, Zap, Leaf, PaintBucket, 
  Construction, Shield, HelpCircle, Tags, Menu, Grid, Share2, FileBarChart,
  Target, Activity, Bell, BellRing, Smartphone as MobileIcon, MoreHorizontal,
  Vote, Send, Gift, Coffee, UserCheck, UserX, Link2, Layout
} from 'lucide-react';

// --- CONFIGURAÇÃO SUPABASE ---
const SUPABASE_URL = "https://jtoubtxumtfwrolxrbpf.supabase.co"; 
const SUPABASE_KEY = "sb_publishable_jRaZSrBV1Q75Ftj7OVd_Jg_tozzOju3"; 
const APP_VERSION = "4.1.5-final";

// --- URLS DOS LOGOS ---
const LOGO_ICON = "https://res.cloudinary.com/dgt5d9xfq/image/upload/v1771271522/CondoLeve_logo_compacto_cizyld.png";
const LOGO_SIMPLE = "https://res.cloudinary.com/dgt5d9xfq/image/upload/v1771271358/CondoLeve_logo_sem_slogan_skb3zu.png";
const LOGO_FULL = "https://res.cloudinary.com/dgt5d9xfq/image/upload/v1771267774/CondoLeve_logo_com_slogan_qfgedb.png";

const CHART_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#f43f5e', '#84cc16'];

const safeStr = (val) => val ? String(val) : "";
const safeNum = (val) => Number(val) || 0;
const formatarMoeda = (val) => safeNum(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const MENSAGEM_COBRANCA_PADRAO = `Olá {nome}, referente ao Apto {apto}.\n\nConstam as seguintes pendências:\n{lista}\n\n*Total: {total}*\n\nChave PIX: {pix}`;

// --- META TAGS INJECTOR ---
const useMetaTags = (config) => {
  useEffect(() => {
    if (!config.predioNome) return;
    const title = `${config.predioNome} - App do Condomínio`;
    const desc = "Gestão financeira e comunicados do seu condomínio de forma simples e transparente.";
    document.title = title;
    
    const setMeta = (name, content, attr = 'name') => {
      let element = document.querySelector(`meta[${attr}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    setMeta('description', desc);
    setMeta('og:title', title, 'property');
    setMeta('og:description', desc, 'property');
    setMeta('og:image', LOGO_FULL, 'property');
    setMeta('og:type', 'website', 'property');
    setMeta('theme-color', '#1e293b');
  }, [config.predioNome]);
};

const getIconeCategoria = (categoria) => {
  const cat = safeStr(categoria).toLowerCase();
  if (cat.includes('água') || cat.includes('agua')) return <Droplets size={16} className="text-blue-500"/>;
  if (cat.includes('luz') || cat.includes('energia')) return <Zap size={16} className="text-yellow-500"/>;
  if (cat.includes('jardin')) return <Leaf size={16} className="text-green-500"/>;
  if (cat.includes('limpeza')) return <Sparkles size={16} className="text-purple-500"/>;
  if (cat.includes('manuten')) return <Wrench size={16} className="text-slate-500"/>;
  if (cat.includes('obra')) return <PaintBucket size={16} className="text-orange-500"/>;
  if (cat.includes('seguro')) return <Shield size={16} className="text-red-500"/>;
  if (cat.includes('elevador')) return <ArrowUpCircle size={16} className="text-indigo-500"/>;
  if (cat.includes('internet')) return <Cloud size={16} className="text-cyan-500"/>;
  if (cat.includes('admin')) return <User size={16} className="text-slate-700"/>;
  return <Tags size={16} className="text-slate-400"/>;
};

const Logo = ({ className = "", variant = "simple", width }) => {
    let src = LOGO_SIMPLE;
    let defaultWidth = "w-32";
    if (variant === 'icon') { src = LOGO_ICON; defaultWidth = "w-10"; } 
    else if (variant === 'full') { src = LOGO_FULL; defaultWidth = "w-48"; }
    return <img src={src} alt="CondoLeve" className={`object-contain ${width || defaultWidth} ${className}`} />;
};

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 ${className}`}>{children}</div>
);

const EmptyState = ({ icon: Icon, title, desc, action, label }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center px-4 bg-white rounded-3xl border-2 border-dashed border-slate-100">
        <div className="bg-slate-50 p-4 rounded-full mb-4 text-slate-300"><Icon size={32}/></div>
        <h3 className="font-black text-slate-700 text-sm mb-1">{title}</h3>
        <p className="text-xs text-slate-400 max-w-[200px] mb-6 leading-relaxed">{desc}</p>
        {action && <button onClick={action} className="bg-[#1e293b] text-white px-6 py-3 rounded-xl font-black text-xs shadow-lg hover:bg-black transition">{label}</button>}
    </div>
);

const ToastContainer = ({ toasts, removeToast }) => (
  <div className="fixed top-4 left-0 right-0 z-[9999] flex flex-col items-center gap-2 pointer-events-none px-4">
    {toasts.map(t => (
      <div key={t.id} className={`pointer-events-auto animate-in slide-in-from-top-2 fade-in duration-300 shadow-2xl rounded-2xl px-6 py-4 flex items-center gap-3 min-w-[300px] max-w-sm border ${t.type === 'error' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-[#1e293b] border-slate-800 text-white'}`}>
        {t.type === 'error' ? <XCircle size={20}/> : <CheckCircle size={20} className="text-[#84cc16]"/>}
        <span className="font-bold text-xs flex-1 text-left">{t.msg}</span>
        <button onClick={() => removeToast(t.id)}><X size={14} className="opacity-50 hover:opacity-100"/></button>
      </div>
    ))}
  </div>
);

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const CATEGORIAS_PADRAO = ['Água', 'Luz', 'Limpeza', 'Manutenção', 'Jardinagem', 'Administrativo', 'Outros', 'Fundo de Reserva'];

export default function App() {
  const [supabase, setSupabase] = useState(null);
  const [session, setSession] = useState(null);
  const [libLoaded, setLibLoaded] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [inviteCode, setInviteCode] = useState(null);

  const showToast = (msg, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

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
      
      const params = new URLSearchParams(window.location.search);
      const invite = params.get('invite');
      if (invite) {
          setInviteCode(invite);
      }

      client.auth.getSession().then(({ data: { session } }) => setSession(session));
      const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => setSession(session));
      return () => subscription.unsubscribe();
    }
  }, [libLoaded]);

  if (!libLoaded) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><RefreshCw className="animate-spin text-[#84cc16]"/></div>;

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
      {!session ? 
        <TelaLogin supabase={supabase} showToast={showToast} inviteCode={inviteCode} /> : 
        <SistemaCondominio supabase={supabase} session={session} showToast={showToast} inviteCode={inviteCode} setInviteCode={setInviteCode} />
      }
    </>
  );
}

function TelaLogin({ supabase, showToast, inviteCode }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [modoCadastro, setModoCadastro] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = modoCadastro 
        ? await supabase.auth.signUp({ email, password: senha })
        : await supabase.auth.signInWithPassword({ email, password: senha });
      if (error) throw error;
      if (modoCadastro) showToast('Conta criada! Verifique seu e-mail.');
    } catch (error) { showToast(error.message || "Erro de autenticação", 'error'); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
       <div className="bg-white p-8 rounded-[40px] shadow-2xl w-full max-w-sm text-center">
          <div className="flex justify-center mb-6">
            <Logo variant="simple" width="w-48" />
          </div>
          
          {inviteCode && (
             <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl mb-6 animate-in zoom-in duration-300">
                 <p className="text-[10px] font-black uppercase text-blue-500 tracking-widest mb-1">Convite Especial</p>
                 <p className="text-sm font-bold text-blue-800">Você foi convidado para o <br/>Apto {inviteCode}</p>
                 <p className="text-[10px] text-blue-400 mt-1">Crie sua conta ou entre para vincular.</p>
             </div>
          )}

          <h2 className="text-2xl font-black text-[#1e293b] mb-2">{modoCadastro ? 'Criar Conta' : 'Bem-vindo'}</h2>
          <p className="text-slate-400 text-xs font-medium mb-8">Gerencie seu condomínio de forma simples.</p>
          <form onSubmit={handleLogin} className="space-y-4 text-left">
             <div><label className="text-[10px] font-black uppercase text-slate-400 ml-2">E-mail</label><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="w-full border-2 border-slate-100 p-4 rounded-2xl font-bold text-sm outline-none focus:border-[#84cc16] transition"/></div>
             <div><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Senha</label><input type="password" required value={senha} onChange={e=>setSenha(e.target.value)} className="w-full border-2 border-slate-100 p-4 rounded-2xl font-bold text-sm outline-none focus:border-[#84cc16] transition"/></div>
             <button disabled={loading} className="w-full bg-[#1e293b] text-white py-4 rounded-2xl font-black shadow-xl hover:bg-black transition active:scale-95 disabled:opacity-50">{loading ? <RefreshCw className="animate-spin mx-auto"/> : (modoCadastro ? 'CADASTRAR' : 'ENTRAR')}</button>
          </form>
          <button onClick={() => setModoCadastro(!modoCadastro)} className="mt-6 text-xs font-bold text-slate-400 hover:text-[#84cc16] transition">{modoCadastro ? 'Já tenho conta' : 'Criar uma conta nova'}</button>
       </div>
    </div>
  );
}

function SistemaCondominio({ supabase, session, showToast, inviteCode, setInviteCode }) {
  const [loading, setLoading] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState('receitas');
  const [statusSync, setStatusSync] = useState('idle'); 
  const [unidades, setUnidades] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [patrimonio, setPatrimonio] = useState([]);
  const [avisos, setAvisos] = useState([]);
  const [enquetes, setEnquetes] = useState([]); 
  
  const [config, setConfig] = useState({ 
    valorCondominio: 200, 
    sindicaNome: 'Síndico(a)', 
    predioNome: '', 
    chavePix: '', 
    saldoInicial: 0, 
    inicioOperacao: '', 
    diaVencimento: 10, 
    linkGrupo: '', 
    dataInicioTeste: null, 
    tipoPlano: 'free', 
    mensagemCobranca: MENSAGEM_COBRANCA_PADRAO,
    categorias: CATEGORIAS_PADRAO,
    multaAtraso: 2, 
    jurosMensal: 1, 
    telefoneSindico: ''
  });
  
  const [mesAtual, setMesAtual] = useState(MESES[new Date().getMonth()]);
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());
  const [busca, setBusca] = useState('');
  const [modoPrivacidade, setModoPrivacidade] = useState(false);
  const [modalUpgrade, setModalUpgrade] = useState(false); 
  const [modoMorador, setModoMorador] = useState(false);
  const [unidadeMorador, setUnidadeMorador] = useState(null);
  const timeoutRef = useRef(null);
  const [processandoConvite, setProcessandoConvite] = useState(false);

  useMetaTags(config);

  // --- PROCESSAMENTO DO CONVITE ---
  useEffect(() => {
    const processarConvite = async () => {
        if (inviteCode && unidades.length > 0 && !processandoConvite) {
            setProcessandoConvite(true);
            const unidadeAlvo = unidades.find(u => u.numero === inviteCode);
            
            if (unidadeAlvo) {
                const novasUnidades = unidades.map(u => {
                    if (u.numero === inviteCode) {
                        return { ...u, linked_user_id: session.user.id };
                    }
                    return u;
                });
                setUnidades(novasUnidades);
                showToast(`Sucesso! Você foi vinculado ao Apto ${inviteCode}.`);
                window.history.replaceState({}, document.title, window.location.pathname);
                setInviteCode(null);
                const uAtualizada = novasUnidades.find(u => u.numero === inviteCode);
                setUnidadeMorador(uAtualizada);
                setModoMorador(true);
            } else {
                showToast('Link de convite inválido ou unidade não encontrada.', 'error');
                setInviteCode(null);
            }
            setProcessandoConvite(false);
        }
    };
    if (!inviteCode && unidades.length > 0 && !modoMorador && !loading) {
        // Auto-login se necessário
    }
    processarConvite();
  }, [inviteCode, unidades, session, processandoConvite]);

  const diasTesteTotal = 60;
  const diasRestantes = useMemo(() => {
    if (config.tipoPlano !== 'starter_trial' || !config.dataInicioTeste) return 0;
    const inicio = new Date(config.dataInicioTeste);
    const agora = new Date();
    const diff = Math.ceil((agora - inicio) / (1000 * 60 * 60 * 24));
    return Math.max(0, diasTesteTotal - diff);
  }, [config.dataInicioTeste, config.tipoPlano]);
  const planoAtivo = config.tipoPlano || 'free'; 

  // --- COPY FIX ROBUSTO ---
  const copiarTexto = (txt) => {
    const fallbackCopy = (text) => {
       const textArea = document.createElement("textarea");
       textArea.value = text;
       textArea.style.position = "fixed"; 
       document.body.appendChild(textArea);
       textArea.focus();
       textArea.select();
       try {
         document.execCommand('copy');
         showToast('Copiado!');
       } catch (err) {
         console.error('Fallback copy failed', err);
         showToast('Erro ao copiar.', 'error');
       }
       document.body.removeChild(textArea);
    };

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(txt)
          .then(() => showToast('Copiado!'))
          .catch(() => fallbackCopy(txt));
    } else {
        fallbackCopy(txt);
    }
  };

  const gerarCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Tipo,Descricao,Categoria/Unidade,Valor,Data,Status\n";
    unidades.forEach(u => {
        if(u.status) {
            Object.keys(u.status).forEach(mesAno => {
                const pags = Array.isArray(u.status[mesAno]) ? u.status[mesAno] : [u.status[mesAno]];
                pags.forEach(p => {
                     if(p && p.valor) {
                        const linha = `Receita,Apto ${u.numero},${u.proprietario?.nome || 'Morador'},"${p.valor.toFixed(2).replace('.', ',')}","${p.data || mesAno}",Pago`;
                        csvContent += linha + "\n";
                     }
                });
            });
        }
    });
    despesas.forEach(d => {
        const linha = `Despesa,"${d.descricao}",${d.categoria},"-${d.valor.toFixed(2).replace('.', ',')}","${d.data}",${d.pago !== false ? 'Pago' : 'Pendente'}`;
        csvContent += linha + "\n";
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `financeiro_condoleve_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    showToast("Planilha Excel (CSV) gerada!");
  };

  const exportarBackup = () => {
    try {
        const dadosBackup = { unidades, despesas, patrimonio, config, avisos, enquetes, dataBackup: new Date() };
        const blob = new Blob([JSON.stringify(dadosBackup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-condoleve-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Backup gerado com sucesso!');
    } catch (error) {
        showToast('Erro ao gerar backup', 'error');
        console.error(error);
    }
  };

  const importarBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const backup = JSON.parse(e.target.result);
        if (backup.unidades) setUnidades(backup.unidades);
        if (backup.despesas) setDespesas(backup.despesas);
        if (backup.patrimonio) setPatrimonio(backup.patrimonio);
        if (backup.config) setConfig(backup.config);
        if (backup.avisos) setAvisos(backup.avisos);
        if (backup.enquetes) setEnquetes(backup.enquetes);
        showToast('Dados restaurados com sucesso!');
        setModalConfig(false);
      } catch (err) {
        showToast('Erro ao ler arquivo de backup.', 'error');
      }
    };
    reader.readAsText(file);
  };

  const fmt = (val) => modoPrivacidade ? 'R$ •••••' : formatarMoeda(val);
  const togglePrivacidade = () => { if (planoAtivo === 'free') { setModalUpgrade(true); } else { setModoPrivacidade(!modoPrivacidade); } };
  const ativarTrialStarter = () => { setConfig(prev => ({ ...prev, tipoPlano: 'starter_trial', dataInicioTeste: new Date().toISOString() })); setModalUpgrade(false); showToast("Teste ativado!"); };

  const ativarModoMorador = (unidade) => {
    setUnidadeMorador(unidade);
    setModoMorador(true);
    showToast(`Visualizando como morador do ${unidade.numero}`);
    setModalEditar(null);
  };

  useEffect(() => {
      async function carregarDados() {
          if (!supabase || !session) return;
          setLoading(true);
          try {
              const { data, error } = await supabase.from('app_dados').select('*');
              if (error) throw error;
              let fetchedConfig = { valorCondominio: 200, sindicaNome: 'Síndico(a)', predioNome: '', chavePix: '', saldoInicial: 0, inicioOperacao: '', diaVencimento: 10, linkGrupo: '', dataInicioTeste: null, tipoPlano: 'free', mensagemCobranca: MENSAGEM_COBRANCA_PADRAO, categorias: CATEGORIAS_PADRAO, multaAtraso: 2, jurosMensal: 1, telefoneSindico: '' };
              if (data) {
                  const u = data.find(x => x.chave === 'condo_u'); const d = data.find(x => x.chave === 'condo_d');
                  const p = data.find(x => x.chave === 'condo_p'); const c = data.find(x => x.chave === 'condo_c');
                  const a = data.find(x => x.chave === 'condo_a'); const e = data.find(x => x.chave === 'condo_e');
                  if (u) setUnidades(u.valor); if (d) setDespesas(d.valor); if (p) setPatrimonio(p.valor); 
                  if (c) fetchedConfig = { ...fetchedConfig, ...c.valor };
                  if (a) setAvisos(a.valor);
                  if (e) setEnquetes(e.valor);
              }
              setConfig(fetchedConfig);
          } catch (e) { console.error(e); } finally { setLoading(false); }
      }
      carregarDados();
  }, [supabase, session]);

  const salvarDados = async () => {
      if (!supabase || !session) return;
      setStatusSync('saving');
      try {
          const updates = [
              { chave: 'condo_u', valor: unidades, user_id: session.user.id },
              { chave: 'condo_d', valor: despesas, user_id: session.user.id },
              { chave: 'condo_p', valor: patrimonio, user_id: session.user.id },
              { chave: 'condo_c', valor: config, user_id: session.user.id },
              { chave: 'condo_a', valor: avisos, user_id: session.user.id },
              { chave: 'condo_e', valor: enquetes, user_id: session.user.id },
          ];
          await supabase.from('app_dados').upsert(updates, { onConflict: 'user_id, chave' });
          setStatusSync('saved');
          setTimeout(() => setStatusSync('idle'), 2000);
      } catch (e) { setStatusSync('error'); }
  };
  useEffect(() => { if(!loading) { if (timeoutRef.current) clearTimeout(timeoutRef.current); timeoutRef.current = setTimeout(salvarDados, 1000); } }, [unidades, despesas, patrimonio, config, avisos, enquetes]);

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
  const [modalAvisos, setModalAvisos] = useState(false);
  const [modalEnquete, setModalEnquete] = useState(false); 
  const [modalInstalar, setModalInstalar] = useState(false); 
  const [showWizard, setShowWizard] = useState(false); 
  const [confirmarReset, setConfirmarReset] = useState(false);

  useEffect(() => { if (!loading && unidades.length === 0 && despesas.length === 0) setShowWizard(true); }, [loading, unidades, despesas]);

  const chaveAtual = `${mesAtual}-${anoAtual}`;
  const getPagamentosMes = (unidade, chave) => { const dados = unidade.status ? unidade.status[chave] : null; return dados ? (Array.isArray(dados) ? dados : [dados]) : []; };
  const calcularTotalPago = (pagamentos) => pagamentos.reduce((acc, p) => acc + safeNum(p.valor), 0);

  const adicionarPagamento = (unidadeId, valor, data) => {
    setUnidades(prev => prev.map(u => {
        if (u.id !== unidadeId) return u;
        const currentPags = getPagamentosMes(u, chaveAtual);
        return { ...u, status: { ...(u.status || {}), [chaveAtual]: [...currentPags, { id: Date.now(), valor, data }] } };
    }));
    showToast(`Pagamento de ${fmt(valor)} registrado!`);
  };

  const removerPagamento = (unidadeId, pagamentoId, chave) => {
      setUnidades(prev => prev.map(u => {
          if(u.id !== unidadeId) return u;
          const newPags = getPagamentosMes(u, chave).filter(p => p.id !== pagamentoId);
          const novoStatus = { ...(u.status || {}) };
          if (newPags.length === 0) delete novoStatus[chave]; else novoStatus[chave] = newPags;
          return { ...u, status: novoStatus };
      }));
      showToast('Pagamento removido.');
  };

  const enviarCobranca = (u, dividas, totalCalc = 0) => {
    const morador = u.moraProprietario ? u.proprietario : (u.inquilino?.nome ? u.inquilino : u.proprietario);
    if (!morador?.telefone) return showToast("Cadastre o telefone para cobrar.", 'error');
    
    const total = totalCalc > 0 ? totalCalc : dividas.reduce((acc, d) => acc + d.valor, 0);
    const nome = safeStr(morador.nome).split(' ')[0];
    const listaMeses = dividas.map(d=>`- ${d.mes}/${d.ano}: ${formatarMoeda(d.valor)}`).join('\n');
    let msgTemplate = config.mensagemCobranca || MENSAGEM_COBRANCA_PADRAO;
    if (planoAtivo === 'free') msgTemplate = MENSAGEM_COBRANCA_PADRAO;
    if (totalCalc > 0) msgTemplate += `\n\n*(Valor atualizado com juros/multa)*`;
    msgTemplate = msgTemplate.replace(/{nome}/g, nome);
    msgTemplate = msgTemplate.replace(/{total}/g, formatarMoeda(total));
    msgTemplate = msgTemplate.replace(/{lista}/g, listaMeses);
    msgTemplate = msgTemplate.replace(/{pix}/g, safeStr(config.chavePix));
    msgTemplate = msgTemplate.replace(/{apto}/g, safeStr(u.numero));
    window.open(`https://wa.me/55${safeStr(morador.telefone).replace(/\D/g, '')}?text=${encodeURIComponent(msgTemplate)}`, '_blank');
  };

  const copiarDespesasAnteriores = () => {
    const idx = MESES.indexOf(mesAtual);
    let mAnt = '', aAnt = 0;
    if(idx > 0) { mAnt = MESES[idx-1]; aAnt = anoAtual; } else { mAnt = MESES[11]; aAnt = anoAtual-1; }
    const despesasAnteriores = despesas.filter(d => d.mes === mAnt && d.ano === aAnt);
    if(despesasAnteriores.length === 0) return showToast(`Nada encontrado em ${mAnt}/${aAnt}.`, 'error');
    const novasDespesas = despesasAnteriores.map(d => ({ ...d, id: Date.now() + Math.random(), mes: mesAtual, ano: anoAtual, data: `01/${String(idx+1).padStart(2,'0')}/${anoAtual}`, pago: true }));
    setDespesas(prev => [...prev, ...novasDespesas]);
    showToast(`${novasDespesas.length} contas copiadas!`);
  };

  const executarReinicializacao = async () => {
      try {
          setLoading(true);
          const { error } = await supabase.from('app_dados').delete().eq('user_id', session.user.id);
          if (error) throw error;
          setUnidades([]); setDespesas([]); setPatrimonio([]); setAvisos([]); setEnquetes([]);
          setConfig({ valorCondominio: 200, sindicaNome: '', predioNome: '', chavePix: '', saldoInicial: 0, inicioOperacao: '', diaVencimento: 10, linkGrupo: '', tipoPlano: 'free', mensagemCobranca: MENSAGEM_COBRANCA_PADRAO, categorias: CATEGORIAS_PADRAO, multaAtraso: 2, jurosMensal: 1, telefoneSindico: '' });
          setModalConfig(false); setConfirmarReset(false); setShowWizard(true); showToast('App reiniciado!');
      } catch(e) { console.error("Erro ao reiniciar:", e); } finally { setLoading(false); }
  };

  const getMesAnoValor = (mes, ano) => ano * 12 + MESES.indexOf(mes);
  
  const calcularInicioOperacao = useMemo(() => {
    let minVal = Infinity; let minDateStr = "";
    despesas.forEach(d => { const val = getMesAnoValor(d.mes, d.ano); if (val < minVal) { minVal = val; minDateStr = `${d.ano}-${String(MESES.indexOf(d.mes)+1).padStart(2,'0')}-01`; } });
    unidades.forEach(u => { Object.keys(u.status || {}).forEach(k => { const [m, a] = k.split('-'); const val = getMesAnoValor(m, parseInt(a)); if (val < minVal) { minVal = val; minDateStr = `${a}-${String(MESES.indexOf(m)+1).padStart(2,'0')}-01`; } }); });
    const dataManual = config.inicioOperacao ? config.inicioOperacao : null;
    let valManual = Infinity; if (dataManual) { const [y, m, d] = dataManual.split('-').map(Number); valManual = y * 12 + (m - 1); }
    if (valManual < minVal) return dataManual; if (minDateStr) return minDateStr; return `${new Date().getFullYear()}-01-01`; 
  }, [despesas, unidades, config.inicioOperacao]);

  const { receitaMes, gastoMes, despesasFiltradas, inadimplentes, saldoAteMomento, historicoGrafico, gastosPorCategoria, metricasMes } = useMemo(() => {
      const pgs = unidades.filter(u => getPagamentosMes(u, chaveAtual).length > 0);
      const rec = pgs.reduce((acc, u) => acc + calcularTotalPago(getPagamentosMes(u, chaveAtual)), 0);
      const dps = despesas.filter(d => d.mes === mesAtual && d.ano === anoAtual);
      const gas = dps.reduce((acc, d) => acc + safeNum(d.valor), 0);
      
      const catMap = {};
      dps.forEach(d => { const cat = d.categoria || 'Outros'; catMap[cat] = (catMap[cat] || 0) + safeNum(d.valor); });
      const categoriasChart = Object.keys(catMap).map(c => ({ name: c, value: catMap[c] })).sort((a,b) => b.value - a.value);

      const maiorDespesa = dps.reduce((max, d) => d.valor > max.valor ? d : max, { valor: 0, descricao: '-' });
      
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
      const historico = [];
      let somaGastosHistorico = 0;
      let countMeses = 0;

      for (let i = 5; i >= 0; i--) {
          const d = new Date(); d.setMonth(d.getMonth() - i);
          const mNome = MESES[d.getMonth()]; const yNum = d.getFullYear();
          const corte = getMesAnoValor(mNome, yNum);
          let r = 0; let g = 0;
          if (corte >= inicioOperacaoVal) {
             unidades.forEach(u => { const p = u.status?.[`${mNome}-${yNum}`]; if(p) r += Array.isArray(p) ? p.reduce((s,x)=>s+x.valor,0) : p.valor; });
             despesas.forEach(x => { if(x.mes === mNome && x.ano === yNum && (x.pago !== false)) g += x.valor; });
             somaGastosHistorico += g;
             countMeses++;
          }
          historico.push({ mes: mNome.substr(0,3), receita: r, despesa: g });
      }
      const mediaGasto = countMeses > 0 ? somaGastosHistorico / countMeses : 0;

      unidades.forEach(u => { Object.keys(u.status || {}).forEach(k => { const [m, a] = k.split('-'); if (getMesAnoValor(m, parseInt(a)) >= inicioOperacaoVal && getMesAnoValor(m, parseInt(a)) <= corteAtual) recHist += calcularTotalPago(getPagamentosMes(u, k)); }); });
      despesas.forEach(d => { if (getMesAnoValor(d.mes, d.ano) >= inicioOperacaoVal && getMesAnoValor(d.mes, d.ano) <= corteAtual && (d.pago !== false)) despHist += safeNum(d.valor); });
      
      return { receitaMes: rec, gastoMes: gas, despesasFiltradas: dps, inadimplentes: listaInad, saldoAteMomento: safeNum(config.saldoInicial) + recHist - despHist, historicoGrafico: historico, gastosPorCategoria: categoriasChart, metricasMes: { maiorDespesa, mediaGasto } };
  }, [unidades, despesas, chaveAtual, config.saldoInicial, config.valorCondominio, calcularInicioOperacao, config.diaVencimento, mesAtual, anoAtual]);

  const saldoGeral = useMemo(() => { return safeNum(config.saldoInicial) + receitaMes - gastoMes; }, [receitaMes, gastoMes, config.saldoInicial]);

  const unidadesFiltradas = useMemo(() => {
    if (!busca) return unidades;
    const b = busca.toLowerCase();
    return unidades.filter(u => u.numero.toLowerCase().includes(b) || u.proprietario?.nome?.toLowerCase().includes(b) || u.inquilino?.nome?.toLowerCase().includes(b));
  }, [unidades, busca]);

  const toggleDespesaPaga = (despesa) => {
    const novoStatus = despesa.pago === false ? true : false;
    setDespesas(despesas.map(d => d.id === despesa.id ? { ...d, pago: novoStatus } : d));
  };

  const generateConicGradient = (data, total) => {
    if(total === 0) return 'conic-gradient(#f1f5f9 0% 100%)';
    let gradient = 'conic-gradient(';
    let start = 0;
    data.forEach((item, index) => {
        const percentage = (item.value / total) * 100;
        const color = CHART_COLORS[index % CHART_COLORS.length];
        const end = start + percentage;
        gradient += `${color} ${start}% ${end}%, `;
        start = end;
    });
    return gradient.slice(0, -2) + ')';
  };

  const compartilharApp = () => {
    const url = window.location.origin;
    const msg = `🏢 *${config.predioNome}*\n\nVizinhos, acessem o novo app do nosso condomínio.\n\n🔗 ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><RefreshCw className="animate-spin text-[#84cc16]"/><p className="ml-4 font-black text-[#1e293b]">Carregando...</p></div>;

  // --- MODO MORADOR RENDER ---
  if (modoMorador && unidadeMorador) {
    return <ModoMorador 
              unidade={unidadeMorador} 
              config={config} 
              onExit={() => setModoMorador(false)} 
              mesAtual={mesAtual} 
              anoAtual={anoAtual} 
              getPagamentosMes={getPagamentosMes} 
              calcularTotalPago={calcularTotalPago} 
              fmt={fmt} 
              unidades={unidades} 
              avisos={avisos}
              enquetes={enquetes}
              setEnquetes={setEnquetes}
              patrimonio={patrimonio}
              setModalRecibo={setModalRecibo}
              showToast={showToast}
              copiarTexto={copiarTexto}
            />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-28 print:bg-white print:pb-0">
      <style>{`@media print { .no-print { display: none !important; } .print-area { display: block !important; position: absolute; top:0; left:0; width:100%; height:100%; z-index:9999; background:white; } }`}</style>
      
      {showWizard && <SetupWizard config={config} setConfig={setConfig} setUnidades={setUnidades} onDemo={() => { 
          const ano = new Date().getFullYear();
          setUnidades([{ id: '101', numero: '101', proprietario: {nome: 'Carlos'}, moraProprietario: true, status: {} }]);
          setConfig({...config, predioNome: 'Demo', sindicaNome: 'Teste', valorCondominio: 250, inicioOperacao: `${ano}-01-01`, saldoInicial: 500});
          setShowWizard(false); 
      }} onComplete={() => setShowWizard(false)} importarBackup={importarBackup} />}

      {planoAtivo === 'starter_trial' && diasRestantes > 0 && <div className="bg-[#84cc16] text-[#1e293b] text-[10px] font-black text-center py-1 no-print cursor-pointer hover:bg-[#a3e635] transition" onClick={() => setModalUpgrade(true)}>💎 VOCÊ ESTÁ TESTANDO O PLANO STARTER • RESTAM {diasRestantes} DIAS</div>}
      {config.tipoPlano === 'starter_trial' && diasRestantes <= 0 && <div className="bg-red-500 text-white text-[10px] font-black text-center py-1 no-print cursor-pointer hover:bg-red-600 transition" onClick={() => setModalUpgrade(true)}>⚠️ SEU TESTE ACABOU. CLIQUE PARA ASSINAR.</div>}

      <div className="bg-[#1e293b] text-white py-3 px-4 flex justify-between items-center sticky top-0 z-40 no-print border-b border-white/5 shadow-xl">
        <div className="flex gap-3 items-center">
           <div className="bg-white p-1 rounded-lg shadow-sm"><Logo variant="icon" width="w-8" /></div>
           <div><span className="font-black text-sm truncate max-w-[180px] block leading-tight tracking-tight">{safeStr(config.predioNome || "CondoLeve")}</span><span className="text-[10px] text-slate-400 font-bold opacity-80">{safeStr(config.sindicaNome).split(' ')[0]}</span></div>
        </div>
        <div className="flex gap-2 items-center">
          <button onClick={() => setModalInstalar(true)} className="bg-white/10 hover:bg-[#84cc16] hover:text-[#1e293b] p-2 rounded-xl transition flex items-center gap-2 text-slate-300"><MobileIcon size={18}/><span className="text-[9px] font-black uppercase hidden sm:inline-block">Instalar</span></button>
          <div className="mr-2">{statusSync === 'saving' && <RefreshCw size={14} className="animate-spin text-yellow-400"/>}{statusSync === 'saved' && <Cloud size={14} className="text-[#84cc16]"/>}{statusSync === 'error' && <WifiOff size={14} className="text-red-500"/>}</div>
          <button onClick={() => setModalConfig(true)} className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition flex items-center gap-2"><Settings size={18}/><span className="text-[9px] text-slate-400 font-mono hidden sm:inline-block border-l border-white/20 pl-2 ml-1">v{APP_VERSION}</span></button>
          <button onClick={() => supabase.auth.signOut()} className="bg-red-500/20 hover:bg-red-500/40 p-2 rounded-xl transition text-red-200"><LogOutIcon size={18}/></button>
        </div>
      </div>

      <header className="bg-[#1e293b] text-white pt-6 px-6 pb-12 no-print relative overflow-hidden text-center">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transform translate-x-1/4 -translate-y-1/4"><Logo variant="icon" width="w-64" /></div>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/5 backdrop-blur-md p-2 rounded-2xl flex items-center justify-between border border-white/10 w-full max-w-xs mx-auto mb-4">
             <button onClick={() => { const idx = MESES.indexOf(mesAtual); if(idx > 0) setMesAtual(MESES[idx-1]); else { setAnoAtual(anoAtual-1); setMesAtual(MESES[11]); } }} className="p-3 hover:bg-white/10 rounded-xl transition"><TrendingDown className="rotate-90 w-4 h-4 text-[#84cc16]"/></button>
             <div><span className="font-black text-xl tracking-tight uppercase">{safeStr(mesAtual)}</span><p className="text-[9px] font-bold text-slate-400 tracking-widest leading-none mt-1">{safeStr(anoAtual)}</p></div>
             <button onClick={() => { const idx = MESES.indexOf(mesAtual); if(idx < 11) setMesAtual(MESES[idx+1]); else { setAnoAtual(anoAtual+1); setMesAtual(MESES[0]); } }} className="p-3 hover:bg-white/10 rounded-xl transition"><TrendingUp className="rotate-90 w-4 h-4 text-[#84cc16]"/></button>
          </div>
          <div className="flex gap-6 justify-center mt-2 items-center relative">
             <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Entradas</p><p className="font-black text-green-400">{fmt(receitaMes)}</p></div>
             <div className="h-10 w-px bg-white/10"></div>
             <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Saídas</p><p className="font-black text-red-400">-{fmt(gastoMes)}</p></div>
             <div className="relative ml-2"><button onClick={togglePrivacidade} className={`p-2 rounded-full transition ${modoPrivacidade ? 'bg-[#84cc16] text-[#1e293b]' : 'bg-white/10 text-slate-400 hover:bg-white/20'}`}>{modoPrivacidade ? <EyeOff size={16}/> : <Eye size={16}/>}</button></div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 -mt-8 relative z-10 no-print">
        {abaAtiva === 'receitas' && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 mb-2">
               <div className="flex items-center gap-2 mb-2">
                   <Search size={18} className="text-slate-400 ml-2"/>
                   <input placeholder="Buscar Apto ou Morador..." value={busca} onChange={e=>setBusca(e.target.value)} className="w-full p-2 outline-none font-bold text-sm text-slate-700 placeholder:text-slate-300"/>
                   {busca && <button onClick={()=>setBusca('')} className="p-2"><X size={14} className="text-slate-400"/></button>}
               </div>
            </div>

            <div className="grid gap-3">
              {unidadesFiltradas.length > 0 ? unidadesFiltradas.map(u => {
                const valorDevido = safeNum(config.valorCondominio);
                const pags = getPagamentosMes(u, chaveAtual);
                const totalPago = calcularTotalPago(pags);
                const isPago = totalPago >= valorDevido;
                const isParcial = totalPago > 0 && totalPago < valorDevido;
                const hasUser = !!u.linked_user_id;

                return (
                  <Card key={u.id} className={`p-4 border-l-[6px] transition-all hover:shadow-md ${isPago ? 'border-l-[#84cc16]' : (isParcial ? 'border-l-yellow-400' : 'border-l-slate-200')}`}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex gap-4 items-center text-left">
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl font-black flex items-center justify-center text-slate-400 text-lg border border-slate-100 relative">
                            {safeStr(u.numero)}
                            {hasUser && <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" title="Usuário Vinculado"></div>}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 flex items-center gap-2">{safeStr(u.moraProprietario ? (u.proprietario?.nome || "Proprietário") : (u.inquilino?.nome || "Morador"))} <button onClick={() => setModalEditar(u)} className="text-slate-300 hover:text-blue-500"><Pencil size={12}/></button></p>
                          <div className="mt-1">{totalPago > 0 ? <span className={`text-[10px] font-black uppercase tracking-tighter flex items-center gap-1 ${isPago ? 'text-[#84cc16]' : 'text-yellow-600'}`}><CheckCircle size={10}/> {isPago ? 'PAGO' : 'PARCIAL'} • {fmt(totalPago)}</span> : <span className="text-[10px] font-black text-slate-400 tracking-wide uppercase">PENDENTE • {fmt(valorDevido)}</span>}</div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                          {totalPago > 0 ? <button onClick={() => setModalDetalhesUnidade({ u, mes: mesAtual, ano: anoAtual, pags, totalPago, valorDevido })} className="text-[10px] bg-slate-100 text-slate-600 font-black px-4 py-2 rounded-xl hover:bg-slate-200 flex items-center gap-2"><Eye size={12}/> DETALHES</button> : <button onClick={() => setModalPagamento({ unidadeId: u.id, valorSugerido: valorDevido })} className="bg-[#1e293b] text-white text-[10px] font-black px-6 py-3 rounded-2xl shadow-lg active:scale-95 transition">RECEBER</button>}
                      </div>
                    </div>
                  </Card>
                );
              }) : <EmptyState icon={Home} title="Nenhum Apartamento" desc="Você ainda não cadastrou nenhuma unidade no condomínio." />}
            </div>
          </div>
        )}

        {abaAtiva === 'despesas' && (
          <div className="space-y-4 animate-in fade-in duration-500">
             <Card className="p-6 bg-white border-l-[6px] border-l-red-500 shadow-xl flex justify-between items-center text-left"><div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total de Gastos</p><p className="text-3xl font-black text-red-600">{fmt(gastoMes)}</p></div><button onClick={() => setModalNovaDespesa(true)} className="bg-red-500 text-white px-5 py-4 rounded-2xl font-black text-xs shadow-lg flex items-center gap-2 hover:bg-red-600 transition"><PlusCircle size={18}/> LANÇAR CONTA</button></Card>
             {despesasFiltradas.length === 0 && (
                <div className="mt-4">
                     <EmptyState 
                        icon={ArrowDownCircle} 
                        title="Tudo tranquilo por aqui" 
                        desc={`Nenhuma despesa lançada em ${mesAtual}. Toque abaixo para começar.`} 
                        action={() => setModalNovaDespesa(true)}
                        label="Lançar Primeira Conta"
                     />
                     <div className="mt-4 text-center">
                        <button onClick={copiarDespesasAnteriores} className="text-slate-400 font-bold text-xs hover:text-slate-600 flex items-center justify-center gap-2 mx-auto"><Copy size={12}/> Copiar do mês anterior</button>
                     </div>
                </div>
             )}
             <div className="grid gap-2">{despesasFiltradas.map(d => {
               const isPago = d.pago !== false;
               return (
                 <Card key={d.id} className={`p-4 flex flex-col sm:flex-row justify-between items-center text-left border-l-4 ${isPago ? 'border-l-green-500' : 'border-l-orange-400 bg-orange-50/10'}`}>
                   <div className="w-full sm:w-auto">
                     <p className={`font-black flex items-center gap-2 text-slate-800`}>
                        {safeStr(d.descricao)}
                        {d.url_comprovante && <a href={d.url_comprovante} target="_blank" rel="noopener noreferrer" className="bg-slate-100 text-slate-500 p-1 rounded-md hover:bg-blue-100 hover:text-blue-600 transition" title="Ver Comprovante"><Paperclip size={12}/></a>}
                     </p>
                     <div className="flex gap-2 mt-1">
                        <div className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                             {getIconeCategoria(d.categoria)}
                             <span className="text-[9px] uppercase font-black text-slate-500">{safeStr(d.categoria)}</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 self-center">{safeStr(d.data)}</span>
                     </div>
                   </div>
                   <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end mt-4 sm:mt-0">
                     <div className="text-right mr-2">
                       <p className={`font-black ${isPago ? 'text-slate-800' : 'text-orange-500'}`}>-{fmt(d.valor)}</p>
                       <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${isPago ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-600'}`}>
                           {isPago ? 'PAGO' : 'PENDENTE'}
                       </span>
                     </div>
                     <div className="flex gap-1 items-center">
                       <button onClick={() => toggleDespesaPaga(d)} className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition flex items-center gap-1 shadow-sm ${isPago ? 'bg-slate-100 text-slate-400 hover:bg-slate-200' : 'bg-green-500 text-white hover:bg-green-600'}`}>{isPago ? <RotateCcw size={12}/> : <Check size={12}/>} {isPago ? 'DESFAZER' : 'PAGAR'}</button>
                       <button onClick={() => setModalEditarDespesa(d)} className="p-2 text-slate-300 hover:text-blue-500"><Edit size={16}/></button>
                       <button onClick={() => { if(confirm("Apagar conta?")) { setDespesas(despesas.filter(x=>x.id!==d.id)); showToast("Conta apagada."); } }} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>
                     </div>
                   </div>
                 </Card>
               );
             })}</div>
          </div>
        )}

        {abaAtiva === 'caixa' && (
          <div className="space-y-6 animate-in fade-in duration-500 text-left">
             <div className="bg-[#1e293b] text-white p-8 rounded-[32px] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none transform translate-x-1/4 -translate-y-1/4"><Wallet size={200}/></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-end gap-6">
                    <div>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Saldo em Caixa</p>
                        <h2 className="text-4xl sm:text-5xl font-black mb-4 tracking-tighter">{fmt(saldoGeral)}</h2>
                        <div className="pt-4 border-t border-white/10 flex items-center gap-2">
                           <History size={12} className="text-slate-400"/> 
                           <span className="text-[10px] text-slate-400 uppercase font-bold">Acumulado até {safeStr(mesAtual)}/{safeStr(anoAtual)}:</span>
                           <span className="text-sm font-bold text-[#84cc16] tracking-tight">{fmt(saldoAteMomento)}</span>
                        </div>
                    </div>
                    <button onClick={() => setModalRelatorio(true)} className="bg-[#84cc16] text-[#1e293b] py-3 px-6 rounded-2xl font-black text-xs shadow-xl flex items-center justify-center gap-2 hover:bg-[#a3e635] transition w-full md:w-auto">
                        <FileBarChart size={18}/> PRESTAÇÃO DE CONTAS
                    </button>
                </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Card className="p-6">
                     <div className="flex justify-between items-center mb-6">
                         <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><PieChart size={14}/> Gastos do Mês</h3>
                         <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded font-bold">{fmt(gastoMes)}</span>
                     </div>
                     <div className="flex flex-col sm:flex-row items-center gap-6">
                         <div className="relative w-40 h-40 rounded-full shrink-0" style={{ background: generateConicGradient(gastosPorCategoria, gastoMes) }}>
                             <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center flex-col">
                                 <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
                                 <span className="text-sm font-black text-slate-800">{fmt(gastoMes)}</span>
                             </div>
                         </div>
                         <div className="flex-1 w-full space-y-2 max-h-40 overflow-y-auto pr-1">
                             {gastosPorCategoria.length > 0 ? gastosPorCategoria.map((cat, i) => (
                                 <div key={i} className="flex items-center justify-between text-xs">
                                     <div className="flex items-center gap-2">
                                         <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}></div>
                                         <span className="font-bold text-slate-600 truncate max-w-[100px]">{cat.name}</span>
                                     </div>
                                     <span className="font-bold text-slate-400">{((cat.value / (gastoMes || 1)) * 100).toFixed(0)}%</span>
                                 </div>
                             )) : <p className="text-center text-slate-300 text-xs italic">Sem dados.</p>}
                         </div>
                     </div>
                 </Card>

                 <Card className="p-6">
                     <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-6 flex items-center gap-2"><BarChart3 size={14}/> Evolução (6 Meses)</h3>
                     <div className="flex justify-between items-end gap-2 h-40">
                         {historicoGrafico.map((h, i) => {
                             const maxVal = Math.max(...historicoGrafico.map(x=>Math.max(x.receita, x.despesa))) || 1;
                             const hRec = Math.max((h.receita / maxVal) * 100, 5);
                             const hDesp = Math.max((h.despesa / maxVal) * 100, 5);
                             const saldoPositivo = h.receita >= h.despesa;
                             return (
                                 <div key={i} className="flex flex-col items-center flex-1 group relative h-full justify-end">
                                     <div className="flex gap-1 items-end w-full justify-center h-full bg-slate-50/50 rounded-lg pb-0 relative px-0.5">
                                        <div style={{height: `${hRec}%`}} className="w-full bg-green-400 rounded-t-sm transition-all group-hover:bg-green-500 relative cursor-pointer shadow-sm"></div>
                                        <div style={{height: `${hDesp}%`}} className="w-full bg-red-400 rounded-t-sm transition-all group-hover:bg-red-500 relative cursor-pointer shadow-sm"></div>
                                     </div>
                                     <span className="text-[9px] font-bold text-slate-400 mt-2 uppercase">{h.mes}</span>
                                     <div className={`w-1 h-1 rounded-full mt-1 ${saldoPositivo ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                 </div>
                             )
                         })}
                     </div>
                 </Card>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                 <Card className="p-4 border-l-4 border-purple-500 flex items-center justify-between">
                     <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Média de Gastos</p><p className="text-lg font-black text-slate-700">{fmt(metricasMes.mediaGasto)}</p></div><div className="bg-purple-50 p-2 rounded-xl text-purple-500"><Activity size={20}/></div>
                 </Card>
                 <Card className="p-4 border-l-4 border-orange-500 flex items-center justify-between">
                     <div className="overflow-hidden"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Maior Conta do Mês</p><p className="text-lg font-black text-slate-700 truncate">{fmt(metricasMes.maiorDespesa.valor)}</p><p className="text-[9px] font-bold text-orange-400 truncate">{safeStr(metricasMes.maiorDespesa.descricao)}</p></div><div className="bg-orange-50 p-2 rounded-xl text-orange-500"><Target size={20}/></div>
                 </Card>
             </div>
          </div>
        )}

        {abaAtiva === 'cobrancas' && (
           <div className="space-y-4 animate-in slide-in-from-bottom-4 text-left">
              <div className="bg-[#1e293b] p-6 rounded-3xl shadow-xl flex justify-between items-center border border-white/5"><div><h3 className="font-black text-white text-sm uppercase tracking-widest">Inadimplência</h3><p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Total acumulado em atraso</p></div><div className="text-right text-3xl font-black text-red-400">{fmt(inadimplentes.reduce((acc, i) => acc + i.total, 0))}</div></div>
              <div className="grid gap-3">{inadimplentes.map(item => (<Card key={item.unidade.id} className="border-l-4 border-l-red-500 p-4 flex justify-between items-center transition-all hover:translate-x-1"><div className="flex gap-4 items-center"><div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl font-black flex items-center justify-center text-sm">{safeStr(item.unidade.numero)}</div><div><div className="font-black text-slate-800">{safeStr(item.unidade.proprietario?.nome) || "Morador"}</div><div className="text-xs font-bold text-red-500 mt-0.5 uppercase tracking-tighter">{fmt(item.total)} • {item.meses.length} meses</div></div></div><div className="flex gap-2"><button onClick={() => setModalDetalhesInad(item)} className="bg-red-50 text-red-600 px-4 py-3 rounded-2xl text-xs font-black flex items-center gap-2"><Eye size={16}/></button><button onClick={() => enviarCobranca(item.unidade, item.meses)} className="bg-[#84cc16] text-[#1e293b] px-4 py-3 rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg active:scale-90"><MessageCircle size={16}/> COBRAR</button></div></Card>))}
              {inadimplentes.length === 0 && <EmptyState icon={CheckCircle} title="Zero Inadimplência" desc="Parabéns! Todos os moradores estão em dia." />}
              </div>
           </div>
        )}

        {abaAtiva === 'mais' && (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="bg-[#1e293b] p-6 rounded-b-[40px] text-center shadow-lg -mt-4 pb-10 mb-2">
                    <div className="flex justify-center mb-2"><Logo variant="full" width="w-48" className="brightness-0 invert opacity-90" /></div>
                    <p className="text-slate-400 text-xs font-medium mt-0">Ferramentas e Utilitários</p>
                </div>
                <div className="grid grid-cols-2 gap-4 px-2">
                    <button onClick={compartilharApp} className="col-span-2 bg-[#84cc16] p-4 rounded-3xl shadow-lg border border-green-400 flex flex-row items-center justify-center gap-4 hover:bg-[#a3e635] transition group relative overflow-hidden">
                        <div className="bg-white/20 text-[#1e293b] p-3 rounded-2xl"><Share2 size={24}/></div>
                        <div className="text-left"><span className="font-black text-[#1e293b] text-sm uppercase tracking-widest block">Convidar Vizinhos</span><span className="text-[10px] font-bold text-[#1e293b]/70 block">Enviar link do App no WhatsApp</span></div>
                    </button>
                    <button onClick={() => setModalZeladoria(true)} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 hover:shadow-md transition"><div className="bg-slate-50 text-slate-600 p-4 rounded-2xl"><Hammer size={28}/></div><span className="font-black text-slate-700 text-xs uppercase tracking-widest flex items-center gap-1">Zeladoria</span></button>
                    <button onClick={() => setModalAvisos(true)} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 hover:shadow-md transition"><div className="bg-orange-50 text-orange-500 p-4 rounded-2xl"><Megaphone size={28}/></div><span className="font-black text-slate-700 text-xs uppercase tracking-widest flex items-center gap-1">Mural de Avisos</span></button>
                    <button onClick={() => setModalEnquete(true)} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 hover:shadow-md transition"><div className="bg-blue-50 text-blue-500 p-4 rounded-2xl"><Vote size={28}/></div><span className="font-black text-slate-700 text-xs uppercase tracking-widest flex items-center gap-1">Enquetes</span></button>
                    <button onClick={() => setModalConfig(true)} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 hover:shadow-md transition"><div className="bg-slate-50 text-slate-600 p-4 rounded-2xl"><Settings size={28}/></div><span className="font-black text-slate-700 text-xs uppercase tracking-widest">Configuração</span></button>
                </div>
            </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 border-t border-slate-100 px-2 py-4 flex justify-around items-end z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] no-print pb-10 backdrop-blur-xl">
         <NavBtn active={abaAtiva === 'receitas'} onClick={() => setAbaAtiva('receitas')} icon={<ArrowUpCircle size={24}/>} label="Receitas" />
         <NavBtn active={abaAtiva === 'despesas'} onClick={() => setAbaAtiva('despesas')} icon={<ArrowDownCircle size={24}/>} label="Despesas" />
         <NavBtn active={abaAtiva === 'cobrancas'} onClick={() => setAbaAtiva('cobrancas')} icon={<AlertTriangle size={24}/>} label="Cobrança" />
         <NavBtn active={abaAtiva === 'caixa'} onClick={() => setAbaAtiva('caixa')} icon={<PieChart size={24}/>} label="Dashboard" />
         <NavBtn active={abaAtiva === 'mais'} onClick={() => setAbaAtiva('mais')} icon={<Grid size={24}/>} label="Ferramentas" />
      </nav>

      {/* MODAIS COMPLETO */}
      {modalPagamento && <ModalReceber valorSugerido={modalPagamento.valorSugerido} onCancel={() => setModalPagamento(null)} onConfirm={(v,d) => { adicionarPagamento(modalPagamento.unidadeId, v, d); setModalPagamento(null); }} />}
      {modalDetalhesUnidade && <ModalDetalhesUnidade dados={modalDetalhesUnidade} sindica={config.sindicaNome} chavePix={config.chavePix} onAdd={(v,d) => { adicionarPagamento(modalDetalhesUnidade.u.id, v, d); setModalDetalhesUnidade(null); }} onDelete={(pid) => { removerPagamento(modalDetalhesUnidade.u.id, pid, `${modalDetalhesUnidade.mes}-${modalDetalhesUnidade.ano}`); setModalDetalhesUnidade(null); }} onClose={() => setModalDetalhesUnidade(null)} copiarTexto={copiarTexto} fmt={fmt} />}
      {modalDetalhesInad && <ModalDetalhesInadimplencia dados={modalDetalhesInad} onClose={() => setModalDetalhesInad(null)} fmt={fmt} enviarCobranca={enviarCobranca} config={config} />}
      {modalConfig && <ModalConfiguracoes config={config} setConfig={setConfig} onClose={() => setModalConfig(false)} aoClicarReset={() => setConfirmarReset(true)} exportarBackup={exportarBackup} importarBackup={importarBackup} calcularInicioOperacao={calcularInicioOperacao} />}
      {modalNovaDespesa && <ModalDespesa supabase={supabase} planoAtual={planoAtivo} categorias={config.categorias} abrirUpgrade={() => setModalUpgrade(true)} onClose={() => setModalNovaDespesa(false)} onSave={(d, repetir) => { 
          const novasDespesas = [];
          const [ano, mes, dia] = d.data.split('-').map(Number);
          if (repetir) {
             const [y, m, day] = d.data.split('-');
             const mesNome = MESES[parseInt(m)-1];
             novasDespesas.push({ ...d, id: Date.now(), mes: mesNome, ano: parseInt(y), data: d.data.split('-').reverse().join('/') });
             for (let m = mes + 1; m <= 12; m++) {
                 const dataFormatada = `${String(dia).padStart(2,'0')}/${String(m).padStart(2,'0')}/${ano}`;
                 novasDespesas.push({ ...d, data: dataFormatada, mes: MESES[m-1], ano: ano, id: Date.now() + Math.random(), pago: false });
             }
             setDespesas(prev => [...prev, ...novasDespesas]);
             showToast(`Conta e previsões até Dezembro criadas!`);
          } else {
             const [y, m, day] = d.data.split('-');
             const mesNome = MESES[parseInt(m)-1];
             setDespesas(prev => [...prev, { ...d, id: Date.now(), mes: mesNome, ano: parseInt(y), data: d.data.split('-').reverse().join('/') }]);
             showToast('Conta lançada!');
          }
          setModalNovaDespesa(false); 
      }} />}
      {modalEditarDespesa && <ModalDespesa supabase={supabase} planoAtual={planoAtivo} categorias={config.categorias} abrirUpgrade={() => setModalUpgrade(true)} despesaParaEditar={modalEditarDespesa} onClose={() => setModalEditarDespesa(null)} onSave={(d) => { setDespesas(despesas.map(item => item.id === modalEditarDespesa.id ? { ...d, id: item.id, mes: item.mes, ano: item.ano } : item)); setModalEditarDespesa(null); showToast('Conta atualizada!'); }} />}
      {modalEditar && <ModalEditarUnidade u={modalEditar} onClose={() => setModalEditar(null)} onSave={(novo) => { setUnidades(unidades.map(x => x.id === novo.id ? novo : x)); setModalEditar(null); showToast('Unidade salva!'); }} ativarModoMorador={() => ativarModoMorador(modalEditar)} showToast={showToast} config={config} copiarTexto={copiarTexto} />}
      {modalRecibo && <ModalRecibo dados={modalRecibo} onClose={() => setModalRecibo(null)} copiarTexto={copiarTexto} />}
      {modalZeladoria && <ModalZeladoria patrimonio={patrimonio} setPatrimonio={setPatrimonio} onClose={() => setModalZeladoria(false)} showToast={showToast} />}
      {modalAvisos && <ModalAvisos avisos={avisos} setAvisos={setAvisos} onClose={() => setModalAvisos(false)} showToast={showToast} />}
      {modalEnquete && <ModalNovaEnquete enquetes={enquetes} setEnquetes={setEnquetes} onClose={() => setModalEnquete(false)} showToast={showToast} />}
      {modalInstalar && <ModalInstalarApp onClose={() => setModalInstalar(false)} />}
      {modalRelatorio && <ModalRelatorioCompleto mes={mesAtual} ano={anoAtual} receita={receitaMes} gasto={gastoMes} pagamentos={unidades.filter(u => getPagamentosMes(u, chaveAtual).length > 0)} despesas={despesasFiltradas} sindica={config.sindicaNome} unidades={unidades} onClose={() => setModalRelatorio(false)} config={config} copiarTexto={copiarTexto} abrirModalUpgrade={() => setModalUpgrade(true)} gerarCSV={gerarCSV} />}
      {modalUpgrade && <ModalUpgrade onClose={() => setModalUpgrade(false)} planoAtual={planoAtivo} ativarTrialStarter={ativarTrialStarter} />}
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

// --- MODO MORADOR ATUALIZADO (UX LIMPA) ---
function ModoMorador({ unidade, config, onExit, mesAtual, anoAtual, getPagamentosMes, calcularTotalPago, fmt, unidades, avisos, setModalRecibo, enquetes, setEnquetes, patrimonio, showToast, copiarTexto }) {
  const [modalVerTudo, setModalVerTudo] = useState(null); 
  const [activeTab, setActiveTab] = useState('mural');
  const [mostrarHistoricoMural, setMostrarHistoricoMural] = useState(false);
  const [mostrarHistoricoZeladoria, setMostrarHistoricoZeladoria] = useState(false);
  const [mostrarHistoricoEnquetes, setMostrarHistoricoEnquetes] = useState(false);

  const pags = getPagamentosMes(unidade, `${mesAtual}-${anoAtual}`);
  const totalPago = calcularTotalPago(pags);
  const valorDevido = safeNum(config.valorCondominio);
  const isPago = totalPago >= valorDevido;

  // FILTROS INTELIGENTES & COUNTERS
  const hoje = new Date();
  const trintaDiasAtras = new Date(hoje.setDate(hoje.getDate() - 30));

  const avisosRecentes = (avisos || []).filter(a => {
      const partes = a.data.split('/');
      const dataAviso = new Date(partes[2], partes[1]-1, partes[0]);
      return dataAviso >= trintaDiasAtras;
  });
  const avisosAntigos = (avisos || []).filter(a => !avisosRecentes.includes(a));

  const enquetesAtivas = enquetes ? enquetes.filter(e => e.ativa) : [];
  const enquetesEncerradas = enquetes ? enquetes.filter(e => !e.ativa) : [];

  const obrasPendentes = (patrimonio || []).filter(p => !p.concluido);
  const obrasConcluidas = (patrimonio || []).filter(p => p.concluido);

  const countMural = avisosRecentes.length;
  const countEnquete = enquetesAtivas.length;
  const countZeladoria = obrasPendentes.length;

  const enviarComprovante = () => {
    const msg = `Olá! Segue comprovante do Apto ${unidade.numero}.\nReferente a: ${mesAtual}/${anoAtual}.\n(Anexe a foto abaixo)`;
    window.open(`https://wa.me/55${safeStr(config.telefoneSindico || '34999358189').replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const votar = (enqueteId, opcaoId) => {
    const enquete = enquetes.find(e => e.id === enqueteId);
    if (enquete.opcoes.some(op => op.votos.includes(unidade.id))) return showToast('Você já votou.', 'error');
    setEnquetes(enquetes.map(e => e.id !== enqueteId ? e : { ...e, opcoes: e.opcoes.map(op => op.id !== opcaoId ? op : { ...op, votos: [...op.votos, unidade.id] }) }));
    showToast('Voto registrado!');
  };

  // Lógica para listar TODOS os recibos, inclusive mês atual se pago
  const listaRecibos = useMemo(() => {
     let lista = [];
     const mesesCheck = [];
     const hoje = new Date();
     // Gera ultimos 12 meses
     for(let i=0; i<12; i++) {
        const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        mesesCheck.push({ m: MESES[d.getMonth()], a: d.getFullYear() });
     }
     mesesCheck.forEach(({m, a}) => {
        const p = getPagamentosMes(unidade, `${m}-${a}`);
        const tot = calcularTotalPago(p);
        if(tot > 0) lista.push({ mes: m, ano: a, valor: tot });
     });
     return lista;
  }, [unidade, unidades]); 

  const TabButton = ({ id, label, icon: Icon, count }) => (
      <button onClick={() => setActiveTab(id)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition flex flex-col items-center gap-1 relative ${activeTab === id ? 'bg-[#1e293b] text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}`}>
          <Icon size={18} className={activeTab === id ? 'text-[#84cc16]' : 'text-slate-300'}/>
          {label}
          {count > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold shadow-sm">{count}</span>}
      </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-10">
       <div className="bg-[#1e293b] text-white p-6 pb-12 rounded-b-[40px] shadow-2xl mb-8 relative">
          <button onClick={onExit} className="absolute top-4 right-4 bg-white/10 text-white p-2 rounded-full hover:bg-white/20 text-xs font-bold flex items-center gap-2"><LogOutIcon size={14}/> Sair</button>
          <div className="mb-6 scale-90 origin-top-left"><Logo variant="simple" className="brightness-0 invert" width="w-40" /></div>
          <h2 className="text-3xl font-black mb-1">Olá, {safeStr(unidade.proprietario?.nome).split(' ')[0] || 'Vizinho'}!</h2>
          <p className="text-slate-400 text-sm font-medium">Apto {safeStr(unidade.numero)} • {safeStr(config.predioNome)}</p>
       </div>
       
       <div className="px-6 -mt-16 relative z-10 space-y-4">
          
          <Card className="p-6 text-center border-t-4 border-t-[#84cc16]">
             <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Fatura de {mesAtual}</p>
             {isPago ? (
                <div className="py-2 animate-in zoom-in duration-300">
                   <CheckCircle size={40} className="text-[#84cc16] mx-auto mb-2"/>
                   <p className="text-xl font-black text-[#1e293b]">Tudo pago!</p>
                   <p className="text-xs text-slate-400 mt-1">Obrigado por contribuir.</p>
                </div>
             ) : (
                <div className="py-2">
                   <p className="text-4xl font-black text-[#1e293b] mb-4">{fmt(valorDevido)}</p>
                   <button className="w-full bg-[#1e293b] text-white py-4 rounded-xl font-black shadow-lg flex items-center justify-center gap-2 active:scale-95 transition" onClick={() => copiarTexto(config.chavePix)}>
                      <Copy size={16}/> COPIAR PIX
                   </button>
                   <button className="w-full mt-2 bg-green-50 text-green-700 border border-green-200 py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 hover:bg-green-100 transition" onClick={enviarComprovante}>
                      <MessageCircle size={16}/> ENVIAR COMPROVANTE
                   </button>
                </div>
             )}
          </Card>
          
          <div className="grid grid-cols-2 gap-3 mt-4">
             <button onClick={() => setModalVerTudo('pagamentos')} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 font-bold text-xs text-slate-600 flex flex-col items-center gap-2 hover:bg-slate-50"><FileText size={24} className="text-slate-400"/> Meus Recibos</button>
             <button onClick={() => window.open(`https://wa.me/55${safeStr(config.telefoneSindico || '34999358189')}?text=Olá, sou morador do Apto ${unidade.numero}`, '_blank')} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 font-bold text-xs text-slate-600 flex flex-col items-center gap-2 hover:bg-slate-50"><Phone size={24} className="text-slate-400"/> Falar com Síndico</button>
          </div>

          <div className="mt-8">
              <div className="flex gap-2 mb-4">
                  <TabButton id="mural" label="Mural" icon={Megaphone} count={countMural} />
                  <TabButton id="enquetes" label="Votação" icon={Vote} count={countEnquete} />
                  <TabButton id="zeladoria" label="Manutenção" icon={Hammer} count={countZeladoria} />
              </div>

              {activeTab === 'mural' && (
                 <div className="space-y-4 animate-in slide-in-from-right-4">
                    {avisosRecentes.length > 0 ? avisosRecentes.map(a => (
                        <div key={a.id} className={`p-4 rounded-2xl border mb-3 ${a.tipo === 'urgente' ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-100 shadow-sm'}`}>
                            <div className="flex justify-between mb-1">
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${a.tipo === 'urgente' ? 'bg-orange-200 text-orange-800' : 'bg-blue-100 text-blue-600'}`}>{a.tipo === 'urgente' ? 'URGENTE' : 'NOVO'}</span>
                                <span className="text-[10px] text-slate-400">{a.data}</span>
                            </div>
                            <h4 className="font-black text-sm text-slate-800 mb-1">{a.titulo}</h4>
                            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{a.mensagem}</p>
                        </div>
                    )) : <EmptyState icon={Bell} title="Sem Novidades" desc="Nenhum comunicado recente." />}
                    
                    {avisosAntigos.length > 0 && (
                        <div className="text-center pt-2">
                            <button onClick={() => setMostrarHistoricoMural(!mostrarHistoricoMural)} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600">
                                {mostrarHistoricoMural ? 'Ocultar Antigos' : 'Ver Comunicados Antigos'}
                            </button>
                        </div>
                    )}

                    {mostrarHistoricoMural && avisosAntigos.map(a => (
                        <div key={a.id} className="p-4 rounded-2xl border bg-slate-50 border-slate-100 opacity-70">
                             <div className="flex justify-between mb-1">
                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-500">ARQUIVADO</span>
                                <span className="text-[10px] text-slate-400">{a.data}</span>
                            </div>
                            <h4 className="font-bold text-xs text-slate-600 mb-1">{a.titulo}</h4>
                            <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2">{a.mensagem}</p>
                        </div>
                    ))}
                 </div>
              )}

              {activeTab === 'enquetes' && (
                 <div className="space-y-4 animate-in slide-in-from-right-4">
                    {enquetesAtivas.length > 0 ? enquetesAtivas.map(enquete => (
                      <div key={enquete.id} className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg relative overflow-hidden">
                          <div className="flex justify-between items-center mb-3">
                              <h4 className="font-black text-sm flex items-center gap-2"><Vote size={16}/> Votação Aberta</h4>
                          </div>
                          <p className="font-bold text-sm mb-4 leading-tight">{enquete.titulo}</p>
                          <div className="space-y-2">
                              {enquete.opcoes.map(op => {
                                  const jaVotou = enquete.opcoes.some(o => o.votos.includes(unidade.id));
                                  const meuVoto = op.votos.includes(unidade.id);
                                  const totalVotos = enquete.opcoes.reduce((acc, curr) => acc + curr.votos.length, 0);
                                  const percentual = totalVotos > 0 ? Math.round((op.votos.length / totalVotos) * 100) : 0;
                                  return (
                                      <button key={op.id} onClick={() => votar(enquete.id, op.id)} disabled={jaVotou} className={`w-full text-left p-3 rounded-xl text-xs font-bold transition relative overflow-hidden ${meuVoto ? 'bg-white text-blue-600 ring-2 ring-white' : 'bg-blue-700/50 text-blue-100'}`}>
                                          <div className="relative z-10 flex justify-between"><span>{op.texto} {meuVoto && '(Seu Voto)'}</span>{jaVotou && <span>{percentual}%</span>}</div>
                                          {jaVotou && <div className="absolute left-0 top-0 bottom-0 bg-blue-500/30 z-0" style={{width: `${percentual}%`}}></div>}
                                      </button>
                                  );
                              })}
                          </div>
                      </div>
                    )) : <EmptyState icon={Vote} title="Sem Votações" desc="Não há enquetes ativas no momento." />}

                    {enquetesEncerradas.length > 0 && (
                        <div className="text-center pt-2">
                            <button onClick={() => setMostrarHistoricoEnquetes(!mostrarHistoricoEnquetes)} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600">
                                {mostrarHistoricoEnquetes ? 'Ocultar Encerradas' : 'Ver Votações Encerradas'}
                            </button>
                        </div>
                    )}

                    {mostrarHistoricoEnquetes && enquetesEncerradas.map(e => (
                        <div key={e.id} className="p-4 rounded-2xl border bg-slate-50 border-slate-100 opacity-80">
                            <div className="flex justify-between mb-1">
                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-500">ENCERRADA</span>
                                <span className="text-[10px] text-slate-400">{e.data}</span>
                            </div>
                            <h4 className="font-bold text-xs text-slate-600 mb-2">{e.titulo}</h4>
                            <div className="space-y-1">
                                {e.opcoes.map(op => (
                                    <div key={op.id} className="flex justify-between text-[10px] text-slate-500 bg-white p-2 rounded border border-slate-100">
                                        <span>{op.texto}</span>
                                        <span className="font-bold">{op.votos.length} votos</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                 </div>
              )}

              {activeTab === 'zeladoria' && (
                  <div className="space-y-4 animate-in slide-in-from-right-4">
                      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                          {obrasPendentes.length > 0 ? obrasPendentes.map(p => (
                              <div key={p.id} className="flex items-center gap-3 border-b border-slate-50 last:border-0 pb-2 last:pb-0">
                                  <Square size={16} className="text-slate-300"/>
                                  <div>
                                      <p className="font-bold text-xs text-slate-700">{p.item}</p>
                                      <p className="text-[10px] text-orange-500 font-medium">Previsto: {p.data.split('-').reverse().join('/')}</p>
                                  </div>
                              </div>
                          )) : <p className="text-center text-xs text-slate-400 italic">Nenhuma manutenção pendente.</p>}
                      </div>

                      {obrasConcluidas.length > 0 && (
                        <div className="text-center pt-2">
                            <button onClick={() => setMostrarHistoricoZeladoria(!mostrarHistoricoZeladoria)} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600">
                                {mostrarHistoricoZeladoria ? 'Ocultar Concluídas' : 'Ver Tarefas Concluídas'}
                            </button>
                        </div>
                      )}

                      {mostrarHistoricoZeladoria && (
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3 opacity-70">
                              {obrasConcluidas.map(p => (
                                  <div key={p.id} className="flex items-center gap-3 border-b border-slate-100 last:border-0 pb-2 last:pb-0">
                                      <CheckSquare size={16} className="text-green-500"/>
                                      <div>
                                          <p className="font-bold text-xs text-slate-500 line-through">{p.item}</p>
                                          <p className="text-[10px] text-slate-400 font-medium">Concluído</p>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              )}
          </div>
       </div>

       {modalVerTudo && (
           <div className="fixed inset-0 bg-[#1e293b]/90 z-[200] flex items-center justify-center p-4 backdrop-blur-md">
               <div className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl h-[80vh] flex flex-col">
                   <div className="flex justify-between items-center mb-6">
                       <h3 className="font-black text-lg text-[#1e293b]">
                           {modalVerTudo === 'pagamentos' && 'Meus Recibos'}
                       </h3>
                       <button onClick={() => setModalVerTudo(null)}><X size={20}/></button>
                   </div>
                   
                   <div className="flex-1 overflow-y-auto space-y-3">
                       {modalVerTudo === 'pagamentos' && (
                          listaRecibos.length > 0 ? listaRecibos.map((rec, idx) => (
                             <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div>
                                   <p className="font-black text-slate-700 text-sm">Condomínio {rec.mes}</p>
                                   <p className="text-[10px] text-slate-400">{rec.ano}</p>
                                </div>
                                <button onClick={() => setModalRecibo({ nome: unidade.proprietario?.nome, valor: rec.valor, mes: rec.mes, ano: rec.ano, sindica: config.sindicaNome })} className="bg-green-100 text-green-700 px-3 py-2 rounded-lg text-[10px] font-black flex items-center gap-1 hover:bg-green-200">
                                   <FileCheck size={14}/> RECIBO
                                </button>
                             </div>
                          )) : <EmptyState icon={FileText} title="Sem Recibos" desc="Nenhum pagamento registrado nos últimos 12 meses." />
                       )}
                   </div>
               </div>
           </div>
       )}
    </div>
  )
}

function SetupWizard({ config, setConfig, setUnidades, onDemo, onComplete, importarBackup }) {
    const [step, setStep] = useState(1);
    const [local, setLocal] = useState({...config});
    const [lista, setLista] = useState('');
    return (
        <div className="fixed inset-0 bg-white z-[200] flex flex-col p-8 font-sans text-left overflow-y-auto">
            <div className="max-w-md mx-auto w-full">
                <div className="mb-10"><Logo variant="simple" width="w-48" /></div>
                <div className="flex gap-2 mb-10">{[1,2,3,4].map(i => <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-[#1e293b]' : 'bg-slate-100'}`}></div>)}</div>
                {step === 1 && (<div className="animate-in slide-in-from-bottom-4 duration-500"><h2 className="text-3xl font-black text-slate-900 mb-2 leading-tight">Configurar Prédio 🏢</h2><p className="text-slate-500 mb-10 font-medium">Informações básicas do condomínio.</p><div className="space-y-6"><label className="block"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome do Condomínio</span><input value={local.predioNome || ""} onChange={e=>setLocal({...local, predioNome:e.target.value})} placeholder="Ex: Residencial Solar" className="w-full border-2 border-slate-100 p-4 rounded-2xl font-black focus:border-[#84cc16] outline-none transition-all"/></label><label className="block"><span className="text-[10px] font-black text-slate-400 uppercase">Seu Nome (Síndico)</span><input value={local.sindicaNome || ""} onChange={e=>setLocal({...local, sindicaNome:e.target.value})} placeholder="Ex: Maria Clara" className="w-full border-2 border-slate-100 p-4 rounded-2xl font-black focus:border-[#84cc16] outline-none transition-all"/></label></div></div>)}
                {step === 2 && (<div className="animate-in slide-in-from-right-4 duration-500"><h2 className="text-3xl font-black text-slate-900 mb-2 leading-tight">Valores e PIX 💰</h2><p className="text-slate-500 mb-10 font-medium">Como seus moradores devem pagar?</p><div className="space-y-6"><label className="block"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Condomínio Mensal</span><input type="number" value={safeNum(local.valorCondominio)} onChange={e=>setLocal({...local, valorCondominio:Number(e.target.value)})} className="w-full border-2 border-slate-100 p-4 rounded-2xl font-black text-green-600 focus:border-[#84cc16] outline-none"/></label><label className="block"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chave PIX</span><input value={local.chavePix || ""} onChange={e=>setLocal({...local, chavePix:e.target.value})} placeholder="E-mail, CPF ou Aleatória" className="w-full border-2 border-slate-100 p-4 rounded-2xl font-black focus:border-[#84cc16] outline-none"/></label></div></div>)}
                {step === 3 && (<div className="animate-in slide-in-from-right-4 duration-500"><h2 className="text-3xl font-black text-slate-900 mb-2 leading-tight">Finanças Iniciais 🏦</h2><p className="text-slate-500 mb-10 font-medium">Vamos definir o ponto de partida do caixa.</p><div className="space-y-6"><label className="block"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mês de Referência</span><p className="text-[10px] text-slate-400 mb-2 font-medium">A partir de qual mês vamos controlar?</p><input type="month" value={local.mesInicio || new Date().toISOString().slice(0, 7)} onChange={e => {const val = e.target.value; setLocal({...local, mesInicio: val, inicioOperacao: `${val}-01`});}} className="w-full border-2 border-slate-100 p-4 rounded-2xl font-black focus:border-[#84cc16] outline-none"/></label><label className="block"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saldo em Caixa (R$)</span><p className="text-[10px] text-slate-400 mb-2 font-medium">Quanto havia na conta no dia 01 desse mês?</p><input type="number" value={safeNum(local.saldoInicial)} onChange={e=>setLocal({...local, saldoInicial:Number(e.target.value)})} className="w-full border-2 border-slate-100 p-4 rounded-2xl font-black text-green-600 focus:border-[#84cc16] outline-none"/></label></div></div>)}
                {step === 4 && (<div className="animate-in slide-in-from-right-4 duration-500"><h2 className="text-3xl font-black text-slate-900 mb-2 leading-tight">Apartamentos 🏠</h2><p className="text-slate-500 mb-10 font-medium">Ex: 101, 102, 201, 202...</p><textarea value={lista} onChange={e=>setLista(e.target.value)} placeholder="Digite os números separados por vírgula" className="w-full border-2 border-slate-100 p-4 rounded-2xl font-black h-40 focus:border-[#84cc16] outline-none resize-none transition-all"/></div>)}
                <div className="mt-10 flex flex-col gap-4">
                    <button onClick={() => { if (step < 4) setStep(step + 1); else { const ids = lista.split(',').map(n => n.trim()).filter(n => n); if (ids.length === 0) return alert("Cadastre unidades."); setUnidades(ids.map(n => ({ id: n, numero: n, proprietario: {nome:'', telefone:''}, moraProprietario: true, status: {} }))); setConfig(local); onComplete(); } }} className="w-full bg-[#1e293b] text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-2xl transition active:scale-95">{step === 4 ? 'FINALIZAR SETUP' : 'PRÓXIMO'} <ArrowRight size={20}/></button>
                    {step === 1 && (<div className="space-y-2"><button onClick={onDemo} className="w-full text-sm font-black text-[#84cc16] py-3 flex items-center justify-center gap-2 hover:bg-slate-50 rounded-xl transition uppercase tracking-tighter"><Sparkles size={16}/> Gerar dados de teste</button><label className="w-full text-xs font-bold text-slate-400 py-3 flex items-center justify-center gap-2 cursor-pointer border-t border-slate-100"><Download size={12}/> RESTAURAR BACKUP (.JSON)<input type="file" accept=".json" onChange={importarBackup} className="hidden"/></label></div>)}
                </div>
            </div>
        </div>
    );
}

function ModalConfiguracoes({ config, setConfig, onClose, aoClicarReset, exportarBackup, importarBackup, calcularInicioOperacao }) {
  const [activeTab, setActiveTab] = useState('geral');
  const [local, setLocal] = useState({...config});
  const [novaCat, setNovaCat] = useState('');
  const [editandoMsg, setEditandoMsg] = useState(false);
  const [editandoGeral, setEditandoGeral] = useState(false);
  const [editandoFin, setEditandoFin] = useState(false);
  const [editandoSis, setEditandoSis] = useState(false);

  const categorias = local.categorias || CATEGORIAS_PADRAO;
  const addCategoria = () => { if(!novaCat) return; setLocal(prev => ({ ...prev, categorias: [...(prev.categorias || CATEGORIAS_PADRAO), novaCat] })); setNovaCat(''); };
  const removeCategoria = (cat) => { setLocal(prev => ({ ...prev, categorias: prev.categorias.filter(c => c !== cat) })); };
  const restaurarMensagem = () => { setLocal(prev => ({...prev, mensagemCobranca: MENSAGEM_COBRANCA_PADRAO})); }
  const isStarter = config.tipoPlano === 'starter_trial' || config.tipoPlano === 'starter' || config.tipoPlano === 'pro';

  return (
    <div className="fixed inset-0 bg-[#1e293b]/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm text-left">
       <div className="bg-white rounded-[32px] w-full max-w-2xl p-0 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
          <div className="bg-[#1e293b] p-6 text-white text-center">
             <h3 className="font-black text-xl tracking-tighter mb-4">Ajustes & Configuração</h3>
             <div className="flex gap-1 justify-center bg-black/20 p-1 rounded-xl overflow-x-auto">
                <button onClick={() => setActiveTab('geral')} className={`flex-1 min-w-[80px] py-2 rounded-lg text-[10px] font-black uppercase transition ${activeTab === 'geral' ? 'bg-[#84cc16] text-[#1e293b]' : 'text-slate-400 hover:text-white'}`}>🏢 Geral</button>
                <button onClick={() => setActiveTab('financeiro')} className={`flex-1 min-w-[80px] py-2 rounded-lg text-[10px] font-black uppercase transition ${activeTab === 'financeiro' ? 'bg-[#84cc16] text-[#1e293b]' : 'text-slate-400 hover:text-white'}`}>💰 Financeiro</button>
                <button onClick={() => setActiveTab('categorias')} className={`flex-1 min-w-[80px] py-2 rounded-lg text-[10px] font-black uppercase transition ${activeTab === 'categorias' ? 'bg-[#84cc16] text-[#1e293b]' : 'text-slate-400 hover:text-white'}`}>🏷️ Categorias</button>
                <button onClick={() => setActiveTab('sistema')} className={`flex-1 min-w-[80px] py-2 rounded-lg text-[10px] font-black uppercase transition ${activeTab === 'sistema' ? 'bg-[#84cc16] text-[#1e293b]' : 'text-slate-400 hover:text-white'}`}>⚙️ Sistema</button>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
             {activeTab === 'geral' && (
                 <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 relative overflow-hidden">
                        <div className="flex justify-between items-center mb-3 border-b border-slate-200 pb-2">
                            <span className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1"><Home size={14}/> Dados do Prédio</span>
                            <button onClick={() => setEditandoGeral(!editandoGeral)} className={`text-[9px] font-black border px-2 py-1 rounded flex items-center gap-1 transition ${editandoGeral ? 'bg-white border-red-200 text-red-500' : 'bg-slate-200 border-slate-300 text-slate-500'}`}>
                                {editandoGeral ? <Unlock size={10}/> : <Lock size={10}/>} {editandoGeral ? 'BLOQUEAR' : 'EDITAR'}
                            </button>
                        </div>
                        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity ${editandoGeral ? 'opacity-100' : 'opacity-60 pointer-events-none'}`}>
                            <label className="block"><span className="text-[10px] font-black text-slate-400 uppercase">Nome do Prédio</span><input disabled={!editandoGeral} value={safeStr(local.predioNome)} onChange={e=>setLocal({...local, predioNome:e.target.value})} className="w-full border-2 border-slate-100 p-3 rounded-xl font-bold outline-none focus:border-[#84cc16] bg-white"/></label>
                            <label className="block"><span className="text-[10px] font-black text-slate-400 uppercase">Síndico Responsável</span><input disabled={!editandoGeral} value={safeStr(local.sindicaNome)} onChange={e=>setLocal({...local, sindicaNome:e.target.value})} className="w-full border-2 border-slate-100 p-3 rounded-xl font-bold outline-none focus:border-[#84cc16] bg-white"/></label>
                            <label className="block md:col-span-2"><span className="text-[10px] font-black text-slate-400 uppercase">WhatsApp do Síndico</span><p className="text-[9px] text-slate-400 mb-1">Para receber comprovantes.</p><input disabled={!editandoGeral} placeholder="34999998888" value={safeStr(local.telefoneSindico)} onChange={e=>setLocal({...local, telefoneSindico:e.target.value})} className="w-full border-2 border-slate-100 p-3 rounded-xl font-bold outline-none focus:border-[#84cc16] bg-white"/></label>
                        </div>
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 relative overflow-hidden mt-4">
                        <div className="flex justify-between items-center mb-3 border-b border-purple-200 pb-2">
                            <span className="text-[10px] font-black text-purple-600 uppercase flex items-center gap-1"><MessageCircle size={14}/> Mensagem de Cobrança</span>
                            <div className="flex gap-2">
                                <button onClick={restaurarMensagem} className="text-[9px] font-bold text-slate-400 hover:text-purple-600 uppercase">Restaurar Padrão</button>
                                <button onClick={() => setEditandoMsg(!editandoMsg)} className="text-[9px] font-black bg-white border border-purple-200 px-2 py-1 rounded text-purple-700 hover:bg-purple-100 flex items-center gap-1">
                                    {editandoMsg ? <Unlock size={10}/> : <Lock size={10}/>} {editandoMsg ? 'BLOQUEAR' : 'EDITAR'}
                                </button>
                            </div>
                        </div>
                        <textarea disabled={!isStarter || !editandoMsg} value={local.mensagemCobranca || MENSAGEM_COBRANCA_PADRAO} onChange={e=>setLocal({...local, mensagemCobranca:e.target.value})} placeholder={isStarter ? "Digite sua mensagem personalizada..." : "Recurso disponível no plano Starter."} className={`w-full border-2 p-3 rounded-xl font-medium text-xs h-32 outline-none resize-none transition-all ${editandoMsg ? 'border-purple-300 bg-white focus:border-purple-500' : 'border-purple-100 bg-purple-100/30 text-slate-500'}`}/>
                        {isStarter && (
                            <div className="mt-2 bg-white/50 p-2 rounded-lg border border-purple-100">
                                <p className="text-[9px] font-black text-purple-400 uppercase mb-1">Tags Disponíveis (Clique para copiar)</p>
                                <div className="flex flex-wrap gap-1">
                                    {['{nome}', '{apto}', '{total}', '{lista}', '{pix}'].map(tag => (
                                        <span key={tag} className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-purple-100 text-slate-600">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {!isStarter && (<div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10"><span className="bg-purple-600 text-white text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-lg"><Lock size={10}/> STARTER</span></div>)}
                    </div>
                 </div>
             )}

             {activeTab === 'financeiro' && (
                 <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 relative overflow-hidden">
                        <div className="flex justify-between items-center mb-3 border-b border-slate-200 pb-2">
                            <span className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1"><DollarSign size={14}/> Parâmetros Financeiros</span>
                            <button onClick={() => setEditandoFin(!editandoFin)} className={`text-[9px] font-black border px-2 py-1 rounded flex items-center gap-1 transition ${editandoFin ? 'bg-white border-red-200 text-red-500' : 'bg-slate-200 border-slate-300 text-slate-500'}`}>
                                {editandoFin ? <Unlock size={10}/> : <Lock size={10}/>} {editandoFin ? 'BLOQUEAR' : 'EDITAR'}
                            </button>
                        </div>
                        <div className={`space-y-4 transition-opacity ${editandoFin ? 'opacity-100' : 'opacity-60 pointer-events-none'}`}>
                            <div className="grid grid-cols-2 gap-4">
                                <label className="block"><span className="text-[10px] font-black text-slate-400 uppercase">Valor Condomínio</span><input disabled={!editandoFin} type="number" value={safeNum(local.valorCondominio)} onChange={e=>setLocal({...local, valorCondominio:Number(e.target.value)})} className="w-full border-2 border-slate-100 p-3 rounded-xl font-bold outline-none focus:border-[#84cc16] text-green-600 bg-white"/></label>
                                <label className="block"><span className="text-[10px] font-black text-slate-400 uppercase">Dia Vencimento</span><input disabled={!editandoFin} type="number" max="31" min="1" value={safeNum(local.diaVencimento)} onChange={e=>setLocal({...local, diaVencimento:Number(e.target.value)})} className="w-full border-2 border-slate-100 p-3 rounded-xl font-bold outline-none focus:border-[#84cc16] bg-white"/></label>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="block"><span className="text-[10px] font-black text-slate-400 uppercase">Chave PIX</span><input disabled={!editandoFin} value={safeStr(local.chavePix)} onChange={e=>setLocal({...local, chavePix:e.target.value})} className="w-full border-2 border-slate-100 p-3 rounded-xl font-bold outline-none focus:border-[#84cc16] bg-white"/></label>
                                <label className="block"><span className="text-[10px] font-black text-slate-400 uppercase">Saldo Inicial do Caixa</span><input disabled={!editandoFin} type="number" value={safeNum(local.saldoInicial)} onChange={e=>setLocal({...local, saldoInicial:Number(e.target.value)})} className="w-full border-2 border-slate-100 p-3 rounded-xl font-bold outline-none focus:border-[#84cc16] text-slate-600 bg-white"/></label>
                            </div>
                            <div className="bg-red-50 p-4 rounded-xl border border-red-100 mt-4">
                                <p className="text-[10px] font-black text-red-400 uppercase mb-3 flex items-center gap-1"><AlertTriangle size={10}/> Configuração de Atraso</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <label className="block"><span className="text-[9px] font-bold text-red-300 uppercase">Multa (%)</span><input disabled={!editandoFin} type="number" value={safeNum(local.multaAtraso || 2)} onChange={e=>setLocal({...local, multaAtraso:Number(e.target.value)})} className="w-full bg-white border border-red-100 p-2 rounded-lg font-bold outline-none focus:border-red-300 text-red-600 text-sm"/></label>
                                    <label className="block"><span className="text-[9px] font-bold text-red-300 uppercase">Juros Mensal (%)</span><input disabled={!editandoFin} type="number" value={safeNum(local.jurosMensal || 1)} onChange={e=>setLocal({...local, jurosMensal:Number(e.target.value)})} className="w-full bg-white border border-red-100 p-2 rounded-lg font-bold outline-none focus:border-red-300 text-red-600 text-sm"/></label>
                                </div>
                            </div>
                        </div>
                    </div>
                 </div>
             )}

             {activeTab === 'categorias' && (
                 <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                    <div className="flex gap-2 mb-4">
                        <input placeholder="Nova Categoria (ex: Piscina)" value={novaCat} onChange={e=>setNovaCat(e.target.value)} className="flex-1 border-2 border-slate-100 p-3 rounded-xl font-bold text-xs outline-none focus:border-[#84cc16]"/>
                        <button onClick={addCategoria} className="bg-[#1e293b] text-white p-3 rounded-xl"><PlusCircle size={20}/></button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                        {categorias.map((cat, i) => (
                            <div key={i} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    {getIconeCategoria(cat)}
                                    <span className="text-xs font-bold text-slate-600 truncate">{cat}</span>
                                </div>
                                <button onClick={() => removeCategoria(cat)} className="text-slate-300 hover:text-red-500 shrink-0"><Trash2 size={14}/></button>
                            </div>
                        ))}
                    </div>
                    <p className="text-[10px] text-slate-400 text-center mt-2">Os ícones são atribuídos automaticamente.</p>
                 </div>
             )}

             {activeTab === 'sistema' && (
                 <div className="space-y-4 animate-in fade-in slide-in-from-right-4 relative">
                     <div className="flex justify-between items-center mb-3 border-b border-slate-200 pb-2">
                        <span className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1"><Settings size={14}/> Preferências do Sistema</span>
                        <button onClick={() => setEditandoSis(!editandoSis)} className={`text-[9px] font-black border px-2 py-1 rounded flex items-center gap-1 transition ${editandoSis ? 'bg-white border-red-200 text-red-500' : 'bg-slate-200 border-slate-300 text-slate-500'}`}>
                            {editandoSis ? <Unlock size={10}/> : <Lock size={10}/>} {editandoSis ? 'BLOQUEAR' : 'EDITAR'}
                        </button>
                     </div>
                     <div className={`transition-opacity ${editandoSis ? 'opacity-100' : 'opacity-60 pointer-events-none'}`}>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-[10px] mb-4">
                            <p className="font-black text-slate-400 uppercase mb-2">Início da Operação</p>
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-700">{calcularInicioOperacao.split('-').reverse().join('/')}</span>
                                <input type="date" disabled={!editandoSis} value={safeStr(local.inicioOperacao)} onChange={e=>setLocal({...local,inicioOperacao:e.target.value})} className="border p-1 rounded font-bold bg-white"/>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <button onClick={exportarBackup} disabled={!editandoSis} className="bg-[#1e293b] text-white w-full py-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg hover:bg-black transition"><Download size={16}/> BAIXAR BACKUP</button>
                            <label className={`bg-slate-50 w-full py-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer border-2 border-dashed border-slate-200 text-slate-500 transition hover:bg-slate-100 ${!editandoSis ? 'pointer-events-none' : ''}`}><Upload size={16}/> RESTAURAR DADOS<input type="file" accept=".json" onChange={importarBackup} className="hidden" disabled={!editandoSis}/></label>
                            <button onClick={() => window.open('https://wa.me/5534999358189', '_blank')} className="bg-green-100 text-green-700 w-full py-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-green-200 transition"><HelpCircle size={16}/> SUPORTE WHATSAPP</button>
                        </div>
                        <div className="pt-4 border-t border-slate-100 mt-4">
                            <button onClick={aoClicarReset} disabled={!editandoSis} className="w-full py-4 text-red-500 font-black text-xs uppercase flex items-center justify-center gap-2 hover:bg-red-50 rounded-xl transition"><RotateCcw size={16}/> Reiniciar Configuração (Reset)</button>
                        </div>
                     </div>
                 </div>
             )}
          </div>
          <div className="p-6 bg-slate-50 border-t flex gap-3 shrink-0">
              <button onClick={onClose} className="flex-1 py-4 text-slate-400 font-bold text-xs uppercase hover:text-slate-600">Cancelar</button>
              <button onClick={() => { setConfig(local); onClose(); }} className="flex-1 bg-[#84cc16] text-[#1e293b] rounded-2xl font-black text-xs shadow-xl hover:bg-[#a3e635] transition">SALVAR ALTERAÇÕES</button>
          </div>
       </div>
    </div>
  );
}

function ModalReceber({ valorSugerido, onCancel, onConfirm }) { return <div className="fixed inset-0 bg-[#1e293b]/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm text-left"><div className="bg-white rounded-3xl w-full max-w-xs p-8 shadow-2xl"><h3 className="font-black text-slate-900 text-xl mb-6">Receber Pagamento</h3><div className="space-y-5"><label className="block"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor Recebido</span><input type="number" defaultValue={valorSugerido} id="valPag" className="w-full border-2 border-slate-100 p-4 rounded-2xl font-black text-green-600 outline-none focus:border-[#84cc16]" /></label><label className="block"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</span><input type="date" defaultValue={new Date().toISOString().split('T')[0]} id="datPag" className="w-full border-2 border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-[#84cc16]" /></label><div className="flex gap-3 pt-4"><button onClick={onCancel} className="flex-1 text-slate-400 font-black text-xs uppercase">Cancelar</button><button onClick={() => onConfirm(Number(document.getElementById('valPag').value), document.getElementById('datPag').value.split('-').reverse().join('/'))} className="flex-2 bg-[#84cc16] text-[#1e293b] py-4 rounded-2xl font-black shadow-lg flex-1">Confirmar</button></div></div></div></div>; }

function ModalDetalhesUnidade({ dados, sindica, chavePix, onAdd, onDelete, onClose, copiarTexto, fmt }) { 
    const [novoValor, setNovoValor] = useState(''); const [novaData, setNovaData] = useState(new Date().toISOString().split('T')[0]); const [modoRecibo, setModoRecibo] = useState(false); if(modoRecibo) return <ModalRecibo dados={{nome: dados.u.moraProprietario ? dados.u.proprietario?.nome : dados.u.inquilino?.nome, valor: dados.totalPago, mes: dados.mes, ano: dados.ano, sindica }} onClose={() => setModoRecibo(false)} copiarTexto={copiarTexto} />; 
    return <div className="fixed inset-0 bg-[#1e293b]/90 z-[100] flex items-center justify-center p-4 backdrop-blur-sm text-left"><div className="bg-white rounded-[32px] w-full max-w-sm p-8 shadow-2xl"><div className="flex justify-between items-center mb-6"><div><h3 className="font-black text-xl text-slate-900 tracking-tighter">Extrato Apto {dados.u.numero}</h3><p className="text-xs font-bold text-slate-400 uppercase">{dados.mes}/{dados.ano}</p></div><button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100"><X size={24}/></button></div><div className="space-y-4 mb-6 max-h-48 overflow-y-auto">{dados.pags.map(p => (<div key={p.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100"><div><p className="font-black text-slate-700 text-sm">{fmt(p.valor)}</p><p className="text-[10px] text-slate-400 font-bold uppercase">Pago em {p.data}</p></div><button onClick={() => onDelete(p.id)} className="text-red-300 hover:text-red-500 p-2"><Trash2 size={16}/></button></div>))}{dados.pags.length === 0 && <p className="text-center text-slate-400 text-xs italic">Nenhum pagamento.</p>}</div><div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6"><div className="flex justify-between items-center mb-1"><span className="text-[10px] font-black text-slate-400 uppercase">Total Pago</span><span className="font-black text-[#84cc16]">{fmt(dados.totalPago)}</span></div><div className="flex justify-between items-center"><span className="text-[10px] font-black text-slate-400 uppercase">Valor Devido</span><span className="font-bold text-slate-600 text-xs">{fmt(dados.valorDevido)}</span></div></div><button onClick={() => setModoRecibo(true)} className="w-full bg-slate-100 text-slate-600 py-3 rounded-xl font-black text-xs mb-4 flex items-center justify-center gap-2 hover:bg-slate-200 transition"><FileText size={16}/> GERAR RECIBO TOTAL</button><div className="pt-6 border-t border-slate-100"><p className="text-[10px] font-black text-slate-400 uppercase mb-2">Adicionar Pagamento</p><div className="flex gap-2"><input type="number" placeholder="Valor" value={novoValor} onChange={e=>setNovoValor(e.target.value)} className="w-1/3 border-2 border-slate-100 p-3 rounded-xl font-bold text-sm outline-none focus:border-[#84cc16]"/><input type="date" value={novaData} onChange={e=>setNovaData(e.target.value)} className="w-1/3 border-2 border-slate-100 p-3 rounded-xl font-bold text-xs outline-none focus:border-[#84cc16]"/><button onClick={() => {if(novoValor) onAdd(Number(novoValor), novaData.split('-').reverse().join('/'))}} className="flex-1 bg-[#1e293b] text-white rounded-xl font-black text-xs shadow-lg"><PlusCircle size={16} className="mx-auto"/></button></div></div></div></div>; 
}

function ModalDetalhesInadimplencia({ dados, onClose, fmt, enviarCobranca, config }) { 
    const [comJuros, setComJuros] = useState(false);
    const totalComJuros = useMemo(() => {
        const taxaMulta = (config.multaAtraso || 2) / 100;
        const taxaJuros = (config.jurosMensal || 1) / 100;
        return dados.meses.reduce((acc, m) => {
           const juros = (m.valor * taxaMulta) + (m.valor * taxaJuros); 
           return acc + m.valor + juros;
        }, 0);
    }, [dados, config]);
    return <div className="fixed inset-0 bg-[#1e293b]/90 z-[100] flex items-center justify-center p-4 backdrop-blur-sm text-left"><div className="bg-white rounded-[32px] w-full max-w-sm p-8 shadow-2xl"><div className="flex justify-between items-center mb-6"><h3 className="font-black text-xl text-slate-900 tracking-tighter">Detalhes da Dívida</h3><button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100"><X size={24}/></button></div><div className="bg-red-50 p-4 rounded-2xl border border-red-100 mb-6 text-center relative overflow-hidden transition-all"><p className="text-[10px] font-black text-red-400 uppercase mb-1">{comJuros ? `Total c/ Multa (${config.multaAtraso}%) + Juros (${config.jurosMensal}%)` : 'Valor Original'}</p><p className="text-3xl font-black text-red-600 transition-all">{fmt(comJuros ? totalComJuros : dados.total)}</p>{comJuros && <span className="absolute top-2 right-2 text-[8px] font-black bg-red-200 text-red-700 px-1.5 py-0.5 rounded">SIMULADO</span>}</div><div className="flex gap-2 mb-4"><button onClick={() => setComJuros(!comJuros)} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 transition ${comJuros ? 'bg-[#1e293b] text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}><Calculator size={14}/> {comJuros ? 'Remover Juros' : 'Calcular Juros'}</button></div><div className="space-y-3 max-h-60 overflow-y-auto">{dados.meses.map((m, idx) => (<div key={idx} className="flex justify-between items-center border-b border-slate-50 pb-2"><span className="font-black text-slate-700 text-sm">{m.mes}/{m.ano}</span><span className="font-bold text-red-500 text-sm">{fmt(m.valor)}</span></div>))}</div><div className="mt-6 flex gap-3"><button onClick={onClose} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200">Fechar</button><button onClick={() => enviarCobranca(dados.unidade, dados.meses, comJuros ? totalComJuros : 0)} className="flex-1 bg-green-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 hover:bg-green-600 transition active:scale-95"><MessageCircle size={16}/> {comJuros ? 'COBRAR C/ JUROS' : 'COBRAR'}</button></div></div></div>; 
}

function ModalRecibo({ dados, onClose, copiarTexto }) { const [texto, setTexto] = useState(`🧾 RECIBO CONDOLEVE\nRecebido de: ${safeStr(dados.nome)}\nValor: ${formatarMoeda(dados.valor)}\nRef: ${safeStr(dados.mes)}/${safeStr(dados.ano)}`); return <div className="fixed inset-0 bg-black/80 z-[150] flex items-center justify-center p-0 md:p-6 print-area backdrop-blur-md text-left text-center"><div className="bg-white w-full h-full md:h-auto md:max-w-md md:rounded-[40px] shadow-2xl flex flex-col relative overflow-hidden"><div className="p-4 border-b flex justify-between items-center bg-slate-50 no-print sticky top-0"><h3 className="font-black text-xs uppercase text-slate-400 tracking-widest">Recibo Digital</h3><button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200"><X size={20}/></button></div><div className="p-10 overflow-y-auto"><div className="border-4 border-slate-900 p-8 rounded-[32px] text-center bg-white relative"><div className="bg-[#84cc16] text-[#1e293b] absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-2 rounded-full font-black text-sm shadow-lg tracking-widest uppercase">CONDOLEVE</div><h2 className="text-3xl font-black uppercase tracking-[0.3em] mb-6 mt-4 text-center">RECIBO</h2><div className="text-left space-y-6 text-sm"><div><span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">RECEBEMOS DE</span><p className="font-black text-slate-900 text-xl tracking-tight text-left">{safeStr(dados.nome)}</p></div><div><span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">VALOR</span><p className="text-3xl font-black text-green-700 text-left">{formatarMoeda(dados.valor)}</p></div><div><span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">REFERENTE A</span><p className="font-bold text-slate-600 text-left">Condomínio {safeStr(dados.mes)}/{safeStr(dados.ano)}</p></div><div className="pt-10 text-center border-t border-slate-100"><p className="font-black text-slate-900 text-lg text-center">{safeStr(dados.sindica)}</p><p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] text-center">ADMINISTRAÇÃO</p></div></div></div><div className="mt-8 no-print text-left"><p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Mensagem WhatsApp</p><textarea className="w-full border p-3 rounded-xl text-xs h-24 focus:border-[#84cc16] outline-none resize-none" value={texto} onChange={e=>setTexto(e.target.value)}/></div><button onClick={onClose} className="w-full mt-4 bg-slate-100 text-slate-500 py-3 rounded-xl font-black text-xs no-print hover:bg-slate-200">VOLTAR / FECHAR</button></div><div className="p-6 bg-slate-50 border-t flex justify-end gap-3 no-print sticky bottom-0"><button onClick={() => copiarTexto(texto)} className="bg-green-100 text-green-700 px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition hover:bg-green-200"><Copy size={14}/> COPIAR</button><button onClick={() => window.print()} className="bg-[#1e293b] text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl flex-1 justify-center transition active:scale-95"><Printer size={18}/> IMPRIMIR</button></div></div></div>; }

function ModalDespesa({ supabase, onClose, onSave, despesaParaEditar = null, planoAtual, abrirUpgrade, categorias }) { 
    const hojeYMD = new Date().toISOString().split('T')[0];
    const [desc, setDesc] = useState(despesaParaEditar ? despesaParaEditar.descricao : ''); 
    const [val, setVal] = useState(despesaParaEditar ? despesaParaEditar.valor : ''); 
    const [cat, setCat] = useState(despesaParaEditar ? despesaParaEditar.categoria : (categorias[0] || 'Outros')); 
    const [data, setData] = useState(despesaParaEditar ? despesaParaEditar.data.split('/').reverse().join('-') : hojeYMD); 
    const [repetir, setRepetir] = useState(false);
    const [pago, setPago] = useState(() => {
        if (despesaParaEditar) return despesaParaEditar.pago !== false;
        return hojeYMD >= (despesaParaEditar ? despesaParaEditar.data.split('/').reverse().join('-') : hojeYMD);
    });
    useEffect(() => { if (!despesaParaEditar) { setPago(data <= hojeYMD); } }, [data, despesaParaEditar]);
    
    const [uploading, setUploading] = useState(false);
    const [arquivoUrl, setArquivoUrl] = useState(despesaParaEditar ? despesaParaEditar.url_comprovante : '');
    const isFree = planoAtual === 'free';
    const handleUpload = async (event) => {
        if (isFree) return; 
        try {
            setUploading(true);
            const file = event.target.files[0];
            if (!file) return;
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from('comprovantes').upload(fileName, file);
            if (uploadError) throw uploadError;
            const { data } = supabase.storage.from('comprovantes').getPublicUrl(fileName);
            setArquivoUrl(data.publicUrl);
        } catch (error) { alert('Erro no upload: ' + error.message); } finally { setUploading(false); }
    };
    return <div className="fixed inset-0 bg-[#1e293b]/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm text-left"><div className="bg-white rounded-[32px] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in duration-300"><h3 className="font-black text-red-600 text-xl mb-6 flex items-center gap-2 tracking-tighter"><ArrowDownCircle/> {despesaParaEditar ? 'Editar' : 'Lançar'} Despesa</h3><div className="space-y-4"><label className="block text-left"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">O que foi pago?</span><input placeholder="Ex: Manutenção Portão" value={desc} className="w-full border-2 border-slate-100 p-4 rounded-2xl font-black outline-none focus:border-red-400 transition-all" onChange={e=>setDesc(e.target.value)}/></label><div className="flex gap-3 text-left"><label className="w-1/2 block text-left"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Valor</span><input type="number" placeholder="0,00" value={val} className="w-full border-2 border-slate-100 p-4 rounded-2xl font-black text-red-600 outline-none focus:border-red-400" onChange={e=>setVal(e.target.value)}/></label><label className="w-1/2 block text-left"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Data</span><input type="date" value={data} className="w-full border-2 border-slate-100 p-4 rounded-2xl font-bold text-xs outline-none" onChange={e=>setData(e.target.value)}/></label></div><label className="block text-left"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Categoria</span><select className="w-full border-2 border-slate-100 p-4 rounded-2xl bg-white font-black outline-none focus:border-red-400" onChange={e=>setCat(e.target.value)} value={cat}>{categorias.map(c=><option key={c} value={c}>{c}</option>)}</select></label>
    <div className="flex gap-2"><button onClick={() => setPago(true)} className={`flex-1 py-3 rounded-xl border-2 font-black text-xs uppercase flex items-center justify-center gap-2 transition ${pago ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-100 text-slate-300'}`}><CheckCircle size={16}/> PAGO</button><button onClick={() => setPago(false)} className={`flex-1 py-3 rounded-xl border-2 font-black text-xs uppercase flex items-center justify-center gap-2 transition ${!pago ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-100 text-slate-300'}`}><Clock size={16}/> PENDENTE</button></div>
    <div className={`border-2 border-dashed rounded-2xl p-4 text-center transition relative ${isFree ? 'border-slate-200 bg-slate-50 opacity-80' : 'border-slate-200 hover:bg-slate-50'}`}>{isFree && (<div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-[1px] rounded-2xl cursor-pointer" onClick={abrirUpgrade}><div className="bg-[#1e293b] text-white px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"><Lock size={10} /> Recurso Starter</div></div>)}{uploading ? <RefreshCw className="animate-spin mx-auto text-slate-400"/> : (<><input type="file" onChange={handleUpload} accept="image/*,application/pdf" className="absolute inset-0 opacity-0 cursor-pointer" disabled={uploading || isFree} /><div className="flex flex-col items-center gap-1">{arquivoUrl ? <CheckCircle className="text-green-500" size={24}/> : <Upload className="text-slate-300" size={24}/>}<span className="text-[10px] font-bold text-slate-400 uppercase">{arquivoUrl ? 'Comprovante Anexado!' : 'Anexar Comprovante / Foto'}</span>{arquivoUrl && <span className="text-[9px] text-green-600 font-bold">Clique para alterar</span>}</div></>)}</div>
    {!despesaParaEditar && (<label className="flex items-center gap-3 p-4 border-2 rounded-2xl bg-slate-50 cursor-pointer hover:bg-slate-100 transition text-left"><input type="checkbox" checked={repetir} onChange={e=>setRepetir(e.target.checked)} className="w-5 h-5 rounded-md accent-red-500"/><div><span className="text-[10px] font-black text-slate-800 uppercase tracking-tighter block">Repetir mensalmente</span><span className="text-[9px] font-medium text-slate-400">Gera cópias (pendentes) até Dezembro</span></div></label>)}<div className="flex gap-2 pt-6"><button onClick={onClose} className="flex-1 py-4 text-slate-400 font-bold text-xs uppercase">Cancelar</button><button onClick={() => { if(desc && val) onSave({descricao:desc, valor:Number(val), categoria:cat, data, url_comprovante: arquivoUrl, pago}, repetir) }} className="flex-2 bg-red-500 text-white py-4 rounded-2xl font-black shadow-xl flex-1 transition active:scale-95">SALVAR</button></div></div></div></div>; 
}

function ModalRelatorioCompleto({ mes, ano, receita, gasto, pagamentos, despesas, sindica, unidades, onClose, config, copiarTexto, abrirModalUpgrade, gerarCSV }) { 
    const gerarResumoZap = () => { 
        const saldo = receita - gasto; 
        const emojiSaldo = saldo >= 0 ? "🟢" : "🔴"; 
        const listaPagos = unidades.filter(u => unidades.find(x => x.id === u.id)?.status?.[`${mes}-${ano}`]).map(u => `✓ Apto ${u.numero}`).slice(0, 10).join('\n');
        const maisPagos = unidades.filter(u => unidades.find(x => x.id === u.id)?.status?.[`${mes}-${ano}`]).length > 10 ? `\n... e mais ${unidades.filter(u => unidades.find(x => x.id === u.id)?.status?.[`${mes}-${ano}`]).length - 10} unidades.` : '';
        const txt = `🏢 *PRESTAÇÃO DE CONTAS - ${config.predioNome}*\n🗓️ Período: *${mes}/${ano}*\n────────────────\n💰 *RECEITAS* (Entradas)\n${formatarMoeda(receita)}\n\n💸 *DESPESAS* (Saídas)\n${formatarMoeda(gasto)}\n\n${emojiSaldo} *SALDO DO MÊS*\n*${formatarMoeda(saldo)}*\n────────────────\n📊 *RESUMO DO CAIXA*\nAnterior: ${formatarMoeda(config.saldoInicial)}\n*Atual: ${formatarMoeda(safeNum(config.saldoInicial) + saldo)}*\n────────────────\n🤝 *QUEM JÁ PAGOU:*\n${listaPagos || '(Ninguém ainda)'}${maisPagos}\n\n_Gerado pelo App CondoLeve_`; 
        copiarTexto(txt); 
    }; 
    const listaUnificada = useMemo(() => { return unidades.map(u => { const pags = Array.isArray(u.status[`${mes}-${ano}`]) ? u.status[`${mes}-${ano}`] : (u.status[`${mes}-${ano}`] ? [u.status[`${mes}-${ano}`]] : []); const totalPago = pags.reduce((acc, p) => acc + safeNum(p.valor), 0); const valorDevido = safeNum(config.valorCondominio); const pendente = valorDevido - totalPago; let status = 'pago'; if (totalPago === 0) status = 'pendente'; else if (totalPago < valorDevido) status = 'parcial'; return { ...u, totalPago, pendente, status }; }).sort((a,b) => { if (a.status === 'pendente' && b.status !== 'pendente') return -1; if (a.status !== 'pendente' && b.status === 'pendente') return 1; return 0; }); }, [unidades, mes, ano, config]); 
    const entradasDetalhadas = useMemo(() => { return listaUnificada.map(u => { const pags = Array.isArray(u.status[`${mes}-${ano}`]) ? u.status[`${mes}-${ano}`] : (u.status[`${mes}-${ano}`] ? [u.status[`${mes}-${ano}`]] : []); const dataPagamento = pags.length > 0 ? pags[pags.length-1].data : null; return { id: u.id, unidade: u.numero, status: u.status, valor: u.totalPago > 0 ? u.totalPago : 0, data: dataPagamento }; }); }, [listaUnificada, mes, ano]);

    return (
        <div className="fixed inset-0 bg-[#1e293b]/90 z-[100] flex items-center justify-center p-0 md:p-6 print-area backdrop-blur-md text-left text-center">
            <div className="bg-white w-full h-full md:h-auto md:max-h-[90vh] md:max-w-2xl md:rounded-[32px] shadow-2xl overflow-y-auto flex flex-col relative border-4 border-[#1e293b]">
                <div className="p-5 border-b flex justify-between items-center bg-slate-50 no-print sticky top-0 z-10 text-left">
                    <h3 className="font-black text-xs uppercase text-slate-400 tracking-widest">Prestação de Contas</h3>
                    <button onClick={onClose} className="p-2 bg-white rounded-full shadow-sm hover:bg-slate-200"><X size={18}/></button>
                </div>
                <div className="p-8 md:p-12 bg-white flex-1 relative print:p-0 print:overflow-visible">
                    <div className="flex justify-between items-center mb-8 border-b pb-6">
                        <Logo variant="full" width="w-40" />
                        <div className="text-right">
                            <h1 className="text-2xl font-black uppercase tracking-tight text-[#1e293b]">{safeStr(mes)}/{safeStr(ano)}</h1>
                            <p className="font-bold text-slate-400 text-xs uppercase tracking-widest">Relatório Mensal</p>
                        </div>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 grid grid-cols-3 divide-x divide-slate-200 mb-8 shadow-sm">
                        <div className="text-center px-2"><span className="text-[10px] font-black uppercase text-slate-400 block mb-2">Total Recebido</span><span className="font-black text-lg text-green-600 block">{formatarMoeda(receita)}</span></div>
                        <div className="text-center px-2"><span className="text-[10px] font-black uppercase text-slate-400 block mb-2">Total Gasto</span><span className="font-black text-lg text-red-500 block">-{formatarMoeda(gasto)}</span></div>
                        <div className="text-center px-2"><span className="text-[10px] font-black uppercase text-slate-400 block mb-2">Balanço</span><span className={`font-black text-lg block ${(receita-gasto)>=0?'text-[#1e293b]':'text-red-600'}`}>{formatarMoeda(receita-gasto)}</span></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                        <div>
                            <h4 className="font-black text-[#1e293b] uppercase text-xs border-b pb-2 mb-4 tracking-widest flex items-center gap-2"><ArrowDownCircle size={14}/> 1. Saídas (Gastos)</h4>
                            <div className="space-y-2">
                                {despesas.length > 0 ? despesas.map(d => (
                                    <div key={d.id} className="flex justify-between text-xs items-center p-2 hover:bg-slate-50 rounded-lg transition border-b border-dashed border-slate-100">
                                        <div><span className="font-bold text-slate-700 block">{safeStr(d.descricao)}</span><span className="text-[9px] text-slate-400 uppercase font-bold bg-slate-100 px-1 rounded">{d.categoria}</span></div>
                                        <span className="font-bold text-red-500">-{formatarMoeda(d.valor)}</span>
                                    </div>
                                )) : <p className="text-slate-300 text-xs italic py-2">Sem gastos registrados.</p>}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-black text-[#1e293b] uppercase text-xs border-b pb-2 mb-4 tracking-widest flex items-center gap-2"><ArrowUpCircle size={14}/> 2. Entradas (Aptos)</h4>
                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                                {entradasDetalhadas.map((u) => (
                                    <div key={u.id} className="flex justify-between text-xs items-center p-2 hover:bg-slate-50 rounded-lg transition border-b border-dashed border-slate-100">
                                        <div><span className="font-bold text-slate-700 block">Apto {safeStr(u.unidade)}</span>{u.status === 'pago' ? (<span className="text-[9px] text-green-600 uppercase font-bold flex items-center gap-1"><Check size={8}/> Pago em {u.data}</span>) : (<span className="text-[9px] text-red-400 uppercase font-bold flex items-center gap-1"><X size={8}/> Pendente</span>)}</div>
                                        <span className={`font-bold ${u.status === 'pago' ? 'text-green-600' : 'text-slate-300'}`}>{u.status === 'pago' ? `+${formatarMoeda(u.valor)}` : 'R$ 0,00'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="md:col-span-2 mt-4">
                            <h4 className="font-black text-[#1e293b] uppercase text-xs border-b pb-2 mb-4 tracking-widest flex items-center gap-2"><Home size={14}/> 3. Mapa Visual</h4>
                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                                {listaUnificada.map(u => (
                                    <div key={u.id} className={`flex flex-col justify-center items-center p-2 rounded-lg border text-center ${u.status === 'pago' ? 'bg-green-50/50 border-green-100' : 'bg-white border-slate-100'}`} title={u.status === 'pago' ? 'Pago' : 'Pendente'}>
                                        <span className="font-bold text-slate-700 text-[10px]">{safeStr(u.numero)}</span>
                                        {u.status === 'pago' ? <div className="w-2 h-2 rounded-full bg-green-500 mt-1"></div> : <div className="w-2 h-2 rounded-full bg-red-400 mt-1"></div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="mt-12 pt-6 border-t border-dashed border-slate-200 text-center">
                        <button onClick={gerarCSV} className="w-full bg-green-50 py-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 text-green-700 mb-4 hover:bg-green-100 border border-green-100 transition no-print"><FileSpreadsheet size={16} /> BAIXAR RELATÓRIO EXCEL (CSV)</button>
                        <p className="font-black text-base text-[#1e293b]">{safeStr(sindica)}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Administração do Condomínio</p>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 border-t flex gap-3 no-print sticky bottom-0 rounded-b-[30px]">
                    <button onClick={gerarResumoZap} className="bg-green-600 text-white py-4 rounded-2xl font-black text-xs shadow-lg flex items-center justify-center gap-2 hover:bg-green-700 transition flex-1 transform active:scale-95"><MessageCircle size={18}/> COPIAR RESUMO (ZAP)</button>
                    <button onClick={() => window.print()} className="bg-[#1e293b] text-white py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg hover:bg-black transition flex-1 transform active:scale-95"><Printer size={18}/> IMPRIMIR / PDF</button>
                </div>
            </div>
        </div>
    );
}

function ModalZeladoria({ patrimonio, setPatrimonio, onClose, showToast }) { 
  const [item, setItem] = useState(''); const [data, setData] = useState(''); 
  const toggleConcluido = (id) => { setPatrimonio(patrimonio.map(p => p.id === id ? { ...p, concluido: !p.concluido } : p)); };
  return <div className="fixed inset-0 bg-[#1e293b]/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm text-left"><div className="bg-white rounded-[32px] w-full max-w-lg p-8 shadow-2xl h-[600px] flex flex-col"><div className="flex justify-between items-center mb-6 border-b pb-4 text-left"><h3 className="font-black text-2xl text-[#1e293b] flex items-center gap-3 tracking-tighter"><Hammer className="text-[#84cc16]" size={24}/> Zeladoria</h3><button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100"><X size={24}/></button></div><div className="bg-blue-50 border border-blue-100 p-3 rounded-xl mb-4 text-[10px] text-blue-700 font-bold">As tarefas adicionadas ficam visíveis para todos os moradores no painel "Manutenção".</div><div className="flex-1 overflow-y-auto space-y-4">{patrimonio.map(p => (<div key={p.id} className={`flex justify-between items-center p-4 rounded-2xl border transition-all ${p.concluido ? 'bg-green-50 border-green-100 opacity-60' : 'bg-slate-50 border-slate-100'}`}><div className="flex items-center gap-3"><button onClick={() => toggleConcluido(p.id)} className={`transition ${p.concluido ? 'text-green-500' : 'text-slate-300 hover:text-slate-400'}`}>{p.concluido ? <CheckSquare size={24} /> : <Square size={24} />}</button><div><p className={`font-black text-sm text-left ${p.concluido ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{safeStr(p.item)}</p><p className="text-[10px] text-orange-600 font-black tracking-widest mt-1 uppercase text-left">Vence em: {safeStr(p.data).split('-').reverse().join('/')}</p></div></div><button onClick={() => { if(confirm("Remover esta tarefa?")) { const novaLista = patrimonio.filter(x => x.id !== p.id); setPatrimonio(novaLista); showToast('Item removido.'); }}} className="text-slate-300 hover:text-red-500 transition"><Trash2 size={18}/></button></div>))}{patrimonio.length === 0 && <EmptyState icon={CheckCircle} title="Tudo Limpo" desc="Não há tarefas de manutenção pendentes no momento." />}</div><div className="mt-6 pt-6 border-t space-y-4 text-left"><input placeholder="Ex: Extintores, Seguro..." value={item} onChange={e=>setItem(e.target.value)} className="w-full border-2 border-slate-100 p-4 rounded-2xl font-black outline-none focus:border-[#84cc16]"/><div className="flex gap-3"><input type="date" value={data} onChange={e=>setData(e.target.value)} className="flex-1 border-2 border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-[#84cc16]"/><button onClick={() => { if(item && data) { setPatrimonio([...patrimonio, {id: Date.now(), item, data, concluido: false}]); setItem(''); setData(''); showToast('Tarefa adicionada!'); } }} className="bg-[#84cc16] text-[#1e293b] px-6 rounded-2xl font-black shadow-lg transition active:scale-95">ADD</button></div></div></div></div>; 
}

function ModalAvisos({ avisos, setAvisos, onClose, showToast }) {
    const [titulo, setTitulo] = useState(''); const [msg, setMsg] = useState(''); const [tipo, setTipo] = useState('normal'); 
    const postarAviso = () => { if (!titulo || !msg) return showToast('Preencha título e mensagem.', 'error'); const novoAviso = { id: Date.now(), titulo, mensagem: msg, tipo, data: new Date().toLocaleDateString('pt-BR') }; setAvisos([novoAviso, ...(avisos || [])]); setTitulo(''); setMsg(''); showToast('Aviso publicado!'); };
    const apagarAviso = (id) => { if(confirm("Apagar este comunicado?")) { const novaLista = avisos.filter(a => a.id !== id); setAvisos(novaLista); showToast('Aviso removido.'); } };
    const compartilharWhatsApp = (aviso) => { const textoZap = `📢 *COMUNICADO CONDOLEVE*\n\n*${aviso.titulo}*\n\n${aviso.mensagem}\n\n_Acesse o app para mais detalhes._`; window.open(`https://wa.me/?text=${encodeURIComponent(textoZap)}`, '_blank'); };
    return <div className="fixed inset-0 bg-[#1e293b]/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm text-left"><div className="bg-white rounded-[32px] w-full max-w-lg p-8 shadow-2xl h-[700px] flex flex-col"><div className="flex justify-between items-center mb-6 border-b pb-4"><h3 className="font-black text-2xl text-[#1e293b] flex items-center gap-3 tracking-tighter"><Megaphone className="text-orange-500" size={24}/> Mural</h3><button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100"><X size={24}/></button></div><div className="bg-orange-50 border border-orange-100 p-3 rounded-xl mb-4 text-[10px] text-orange-700 font-bold">Os comunicados recentes (últimos 30 dias) ficam em destaque no app dos moradores. Os antigos vão para o histórico.</div><div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">{avisos && avisos.length > 0 ? avisos.map(a => (<div key={a.id} className={`p-4 rounded-2xl border relative group ${a.tipo === 'urgente' ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-100'}`}><div className="flex justify-between items-start mb-2"><span className={`text-[9px] font-black uppercase px-2 py-1 rounded ${a.tipo === 'urgente' ? 'bg-orange-200 text-orange-800' : 'bg-blue-200 text-blue-800'}`}>{a.tipo === 'urgente' ? 'URGENTE' : 'INFO'}</span><span className="text-[10px] font-bold opacity-50">{a.data}</span></div><h4 className="font-black text-sm text-slate-800 mb-1">{a.titulo}</h4><p className="text-xs text-slate-600 leading-relaxed mb-3 whitespace-pre-wrap">{a.mensagem}</p><button onClick={() => compartilharWhatsApp(a)} className="w-full bg-white border border-slate-200 rounded-xl py-2 text-[10px] font-black text-slate-600 flex items-center justify-center gap-2 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition"><MessageCircle size={14}/> ENVIAR NO GRUPO</button><button onClick={() => apagarAviso(a.id)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 p-1 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition"><Trash2 size={12}/></button></div>)) : (<EmptyState icon={BellRing} title="Sem Avisos" desc="O mural está vazio. Publique o primeiro comunicado." />)}</div><div className="pt-4 border-t space-y-3"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Novo Comunicado</p><input placeholder="Título (Ex: Manutenção Elevador)" value={titulo} onChange={e=>setTitulo(e.target.value)} className="w-full border-2 border-slate-100 p-3 rounded-xl font-bold text-sm outline-none focus:border-orange-400"/><textarea placeholder="Mensagem detalhada..." value={msg} onChange={e=>setMsg(e.target.value)} className="w-full border-2 border-slate-100 p-3 rounded-xl font-medium text-xs h-20 outline-none resize-none focus:border-orange-400"/><div className="flex gap-2"><div className="flex bg-slate-100 p-1 rounded-xl"><button onClick={()=>setTipo('normal')} className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase transition ${tipo === 'normal' ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}>Normal</button><button onClick={()=>setTipo('urgente')} className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase transition ${tipo === 'urgente' ? 'bg-white shadow text-orange-600' : 'text-slate-400'}`}>Urgente</button></div><button onClick={postarAviso} className="flex-1 bg-[#1e293b] text-white rounded-xl font-black text-xs shadow-lg hover:bg-black transition active:scale-95">PUBLICAR</button></div></div></div></div>;
}

function ModalNovaEnquete({ enquetes, setEnquetes, onClose, showToast }) {
    const [pergunta, setPergunta] = useState(''); const [op1, setOp1] = useState(''); const [op2, setOp2] = useState('');
    
    // Admin functions
    const criarEnquete = () => { 
        if (!pergunta || !op1 || !op2) return showToast('Preencha a pergunta e pelo menos 2 opções.', 'error'); 
        // Desativa anteriores
        const listaAtualizada = (enquetes || []).map(e => ({...e, ativa: false}));
        const nova = { id: Date.now(), titulo: pergunta, ativa: true, data: new Date().toLocaleDateString('pt-BR'), opcoes: [{ id: 1, texto: op1, votos: [] }, { id: 2, texto: op2, votos: [] }] }; 
        setEnquetes([nova, ...listaAtualizada]); 
        showToast('Enquete iniciada!'); 
        onClose(); 
    };
    
    const encerrarEnquete = (id) => { 
        if(confirm("Encerrar esta votação? Os moradores não poderão mais votar.")) { 
            const novaLista = enquetes.map(e => e.id === id ? { ...e, ativa: false } : e);
            setEnquetes(novaLista); 
            showToast('Enquete encerrada.'); 
        } 
    };
    
    const apagarEnquete = (id) => { 
        if(confirm("Apagar histórico desta enquete?")) { 
            const novaLista = enquetes.filter(e => e.id !== id);
            setEnquetes(novaLista); 
        } 
    };
    
    const ativa = enquetes && enquetes.find(e => e.ativa);
    
    return <div className="fixed inset-0 bg-[#1e293b]/90 z-[200] flex items-center justify-center p-4 backdrop-blur-md"><div className="bg-white rounded-[32px] w-full max-w-lg p-8 shadow-2xl h-[700px] flex flex-col"><div className="flex justify-between items-center mb-6 border-b pb-4"><h3 className="font-black text-2xl text-[#1e293b] flex items-center gap-3 tracking-tighter"><Vote className="text-blue-500" size={24}/> Gestão de Enquetes</h3><button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100"><X size={24}/></button></div>
    
    <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl mb-4 text-[10px] text-blue-700 font-bold">Apenas uma enquete pode ficar ativa por vez. Ao criar uma nova, a anterior é encerrada automaticamente.</div>

    {ativa ? (<div className="bg-white border-2 border-blue-500 p-6 rounded-2xl text-center mb-6 shadow-xl relative overflow-hidden"><div className="absolute top-0 left-0 right-0 bg-blue-500 text-white text-[10px] font-black uppercase py-1">Em Andamento</div><h4 className="font-black text-lg text-blue-900 mb-4 leading-tight mt-4">{ativa.titulo}</h4><div className="space-y-2 mb-6">{ativa.opcoes.map(op => (<div key={op.id} className="flex justify-between text-xs font-bold text-blue-700 bg-blue-50 p-3 rounded-xl"><span>{op.texto}</span><span>{op.votos.length} votos</span></div>))}</div><button onClick={() => encerrarEnquete(ativa.id)} className="w-full bg-red-100 text-red-600 py-3 rounded-xl font-black text-xs hover:bg-red-200 transition">ENCERRAR VOTAÇÃO</button></div>) : (<div className="space-y-4 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nova Votação</p><input placeholder="Pergunta (Ex: Pintar o prédio de Cinza?)" value={pergunta} onChange={e=>setPergunta(e.target.value)} className="w-full border-2 border-slate-100 p-3 rounded-xl font-bold text-sm outline-none focus:border-blue-400"/><div className="grid grid-cols-2 gap-2"><input placeholder="Opção 1 (Sim)" value={op1} onChange={e=>setOp1(e.target.value)} className="w-full border-2 border-slate-100 p-3 rounded-xl font-bold text-xs outline-none focus:border-blue-400"/><input placeholder="Opção 2 (Não)" value={op2} onChange={e=>setOp2(e.target.value)} className="w-full border-2 border-slate-100 p-3 rounded-xl font-bold text-xs outline-none focus:border-blue-400"/></div><button onClick={criarEnquete} className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-xs shadow-lg hover:bg-blue-700 transition">INICIAR VOTAÇÃO</button></div>)}<div className="flex-1 overflow-y-auto border-t pt-4"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Histórico</p>{enquetes && enquetes.filter(e => !e.ativa).map(e => (<div key={e.id} className="flex justify-between items-center p-3 border-b border-slate-100 last:border-0"><div><p className="font-bold text-xs text-slate-600">{e.titulo}</p><p className="text-[10px] text-slate-400">{e.data} • Encerrada • {e.opcoes.reduce((a,b)=>a+b.votos.length,0)} votos</p></div><button onClick={() => apagarEnquete(e.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={14}/></button></div>))}{(!enquetes || enquetes.filter(e => !e.ativa).length === 0) && <p className="text-center text-xs italic text-slate-300 mt-4">Sem histórico.</p>}</div></div></div>;
}

function ModalEditarUnidade({ u, onClose, onSave, ativarModoMorador, showToast, config, copiarTexto }) { 
    const [dados, setDados] = useState({...u}); 
    const up = (field, val, isProp) => { if(isProp) setDados({...dados, proprietario:{...(dados.proprietario || {}), [field]:val}}); else setDados({...dados, inquilino:{...(dados.inquilino || {}), [field]:val}}); };
    const gerarLinkConvite = () => {
        const urlBase = window.location.origin + window.location.pathname;
        const link = `${urlBase}?invite=${u.numero}`;
        const msg = `🏢 *${config.predioNome}*\n\nOlá! Segue seu link de acesso exclusivo para o *Apto ${u.numero}*.\n\n🔗 Clique para entrar: ${link}`;
        copiarTexto(msg);
        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
        showToast('Link de convite gerado e copiado!');
    };
    const desvincularUsuario = () => { if(confirm("Tem certeza? O morador perderá o acesso ao aplicativo imediatamente.")) { onSave({ ...dados, linked_user_id: null }); showToast("Usuário desvinculado."); onClose(); } };
    const limparDados = () => { if(confirm("Isso apagará nome, telefone e removerá o acesso do usuário atual. Confirmar troca de morador?")) { onSave({ ...dados, proprietario: { nome: '', telefone: '' }, inquilino: { nome: '', telefone: '' }, linked_user_id: null }); showToast("Dados limpos para novo morador."); onClose(); } };
    return (
        <div className="fixed inset-0 bg-[#1e293b]/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm text-left">
            <div className="bg-white rounded-[32px] w-full max-w-sm p-8 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black text-2xl tracking-tighter text-slate-900 text-left">Apto {safeStr(u.numero)}</h3>
                    {dados.linked_user_id ? ( <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-1 rounded-full flex items-center gap-1 uppercase"><UserCheck size={10}/> Vinculado</span> ) : ( <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-1 rounded-full flex items-center gap-1 uppercase"><UserX size={10}/> Aguardando</span> )}
                </div>
                <div className="mb-6">
                    {!dados.linked_user_id ? ( <button onClick={gerarLinkConvite} className="w-full bg-[#84cc16] text-[#1e293b] py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-lg hover:bg-[#a3e635] transition"><Link2 size={16}/> ENVIAR CONVITE (WHATSAPP)</button> ) : ( <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex justify-between items-center"><span className="text-xs font-bold text-slate-500">Acesso Habilitado</span><button onClick={desvincularUsuario} className="text-[10px] font-black text-red-500 border border-red-200 bg-white px-2 py-1 rounded hover:bg-red-50">DESVINCULAR</button></div> )}
                </div>
                <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left">
                        <p className="text-[10px] font-black text-[#1e293b] uppercase mb-2 tracking-widest opacity-50 text-left">Dados do Proprietário</p>
                        <input placeholder="Nome" value={safeStr(dados.proprietario?.nome)} onChange={e=>up('nome', e.target.value, true)} className="w-full border p-2 rounded-lg font-bold text-sm mb-2 outline-none focus:border-[#84cc16]"/>
                        <input placeholder="WhatsApp" value={safeStr(dados.proprietario?.telefone)} onChange={e=>up('telefone', e.target.value, true)} className="w-full border p-2 rounded-lg font-bold text-sm outline-none focus:border-[#84cc16]"/>
                    </div>
                    <button onClick={ativarModoMorador} className="w-full py-3 bg-blue-50 text-blue-600 rounded-xl font-black text-xs flex items-center justify-center gap-2 hover:bg-blue-100 transition"><Eye size={16}/> Ver como Morador</button>
                    <div className="flex gap-3 pt-2">
                        <button onClick={limparDados} className="flex-1 text-red-400 font-black text-[10px] uppercase hover:text-red-600 border border-red-100 rounded-xl hover:bg-red-50">Troca de Morador</button>
                        <button onClick={() => onSave(dados)} className="flex-1 bg-[#1e293b] text-white py-4 rounded-2xl font-black shadow-xl transition active:scale-95">SALVAR</button>
                    </div>
                </div>
                <button onClick={onClose} className="w-full mt-4 text-slate-400 font-bold text-xs uppercase">Cancelar</button>
            </div>
        </div>
    ); 
}

function NavBtn({ active, onClick, icon, label }) { return <button onClick={onClick} className={`flex-1 flex flex-col items-center gap-1 transition-all py-1 ${active ? 'text-[#1e293b]' : 'text-slate-300'}`}><div className={`p-2 rounded-2xl transition-all ${active ? 'bg-[#84cc16] shadow-lg shadow-green-500/20 scale-110 -translate-y-2' : ''}`}>{icon}</div><span className="text-[9px] font-black uppercase tracking-widest">{safeStr(label)}</span></button>; }