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
  Vote, Send, Gift, Coffee, UserCheck, UserX, Link2, Layout, Share,
  Camera, ArrowLeft, Image as ImageSimple
} from 'lucide-react';

// --- CONFIGURAÇÃO SUPABASE ---
const SUPABASE_URL = "https://jtoubtxumtfwrolxrbpf.supabase.co"; 
const SUPABASE_KEY = "sb_publishable_jRaZSrBV1Q75Ftj7OVd_Jg_tozzOju3"; 
const APP_VERSION = "5.8.0-camera-fix";

// --- URLS DOS LOGOS ---
const LOGO_ICON = "https://res.cloudinary.com/dgt5d9xfq/image/upload/v1771380642/logo_compacta_sem_fundo_q97itc.png";
const LOGO_SIMPLE = "https://res.cloudinary.com/dgt5d9xfq/image/upload/v1771271358/CondoLeve_logo_sem_slogan_skb3zu.png";
const LOGO_FULL = "https://res.cloudinary.com/dgt5d9xfq/image/upload/v1771267774/CondoLeve_logo_com_slogan_qfgedb.png";

const CHART_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#f43f5e', '#84cc16'];
const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const CATEGORIAS_PADRAO = ['Água', 'Luz', 'Limpeza', 'Manutenção', 'Jardinagem', 'Administrativo', 'Outros', 'Fundo de Reserva'];

// --- HELPERS ---
const safeStr = (val) => val ? String(val) : "";
const safeNum = (val) => Number(val) || 0;
const formatarMoeda = (val) => safeNum(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const generateId = () => crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + Math.random().toString().slice(2);

const useMetaTags = (config) => {
  useEffect(() => {
    if (!config.predioNome) return;
    document.title = `${config.predioNome} - App do Condomínio`;
  }, [config.predioNome]);
};

const getIconeCategoria = (categoria) => {
  const cat = safeStr(categoria).toLowerCase();
  if (cat.includes('água') || cat.includes('agua')) return <Droplets size={16} className="text-blue-500"/>;
  if (cat.includes('luz') || cat.includes('energia')) return <Zap size={16} className="text-yellow-500"/>;
  if (cat.includes('jardin')) return <Leaf size={16} className="text-green-500"/>;
  if (cat.includes('limpeza')) return <Sparkles size={16} className="text-purple-500"/>;
  if (cat.includes('manuten')) return <Wrench size={16} className="text-slate-500"/>;
  return <Tags size={16} className="text-slate-400"/>;
};

// --- COMPONENTES UI BÁSICOS ---
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
  <div className="fixed top-4 left-0 right-0 z-[10050] flex flex-col items-center gap-2 pointer-events-none px-4">
    {toasts.map(t => (
      <div key={t.id} className={`pointer-events-auto animate-in slide-in-from-top-2 fade-in duration-300 shadow-2xl rounded-2xl px-6 py-4 flex items-center gap-3 min-w-[300px] max-w-sm border ${t.type === 'error' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-[#1e293b] border-slate-800 text-white'}`}>
        {t.type === 'error' ? <XCircle size={20}/> : <CheckCircle size={20} className="text-[#84cc16]"/>}
        <span className="font-bold text-xs flex-1 text-left">{safeStr(t.msg)}</span>
        <button onClick={() => removeToast(t.id)}><X size={14} className="opacity-50 hover:opacity-100"/></button>
      </div>
    ))}
  </div>
);

// Componente de Botão de Navegação
const NavBtn = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition ${active ? 'text-[#84cc16] scale-110' : 'text-slate-400 hover:text-slate-600'}`}>
      {icon}
      <span className="text-[10px] font-black uppercase tracking-wide">{label}</span>
  </button>
);

export default function App() {
  const [supabase, setSupabase] = useState(null);
  const [session, setSession] = useState(null);
  const [libLoaded, setLibLoaded] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [inviteCode, setInviteCode] = useState(null);

  const showToast = (msg, type = 'success') => {
    const id = generateId(); 
    setToasts(prev => [...prev, { id, msg: String(msg), type }]);
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
      if (params.get('invite')) setInviteCode(params.get('invite'));
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

  const handleRecuperarSenha = async () => {
    if(!email) return showToast("Digite seu e-mail primeiro.", "error");
    setLoading(true);
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.href });
        if(error) throw error;
        showToast("E-mail de recuperação enviado!");
    } catch (e) { showToast(e.message, "error"); } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
       <div className="bg-white p-8 rounded-[40px] shadow-2xl w-full max-w-sm text-center">
          <div className="flex justify-center mb-6"><Logo variant="simple" width="w-48" /></div>
          {inviteCode && (<div className="bg-blue-50 border border-blue-200 p-3 rounded-xl mb-6"><p className="text-[10px] font-black uppercase text-blue-500 tracking-widest mb-1">Convite Especial</p><p className="text-sm font-bold text-blue-800">Você foi convidado para o <br/>Apto {inviteCode}</p></div>)}
          <h2 className="text-2xl font-black text-[#1e293b] mb-2">{modoCadastro ? 'Criar Conta' : 'Bem-vindo'}</h2>
          <form onSubmit={handleLogin} className="space-y-4 text-left mt-8">
             <div><label className="text-[10px] font-black uppercase text-slate-400 ml-2">E-mail</label><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="w-full border-2 border-slate-100 p-4 rounded-2xl font-bold text-sm outline-none focus:border-[#84cc16] transition"/></div>
             <div><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Senha</label><input type="password" required value={senha} onChange={e=>setSenha(e.target.value)} className="w-full border-2 border-slate-100 p-4 rounded-2xl font-bold text-sm outline-none focus:border-[#84cc16] transition"/></div>
             {!modoCadastro && <div className="text-right"><button type="button" onClick={handleRecuperarSenha} className="text-[10px] font-bold text-slate-400 hover:text-[#1e293b]">Esqueci minha senha</button></div>}
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
  
  // Dados
  const [unidades, setUnidades] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [pagamentos, setPagamentos] = useState([]);
  const [patrimonio, setPatrimonio] = useState([]);
  const [avisos, setAvisos] = useState([]);
  const [enquetes, setEnquetes] = useState([]); 
  
  const [config, setConfig] = useState({ 
    valorCondominio: 200, sindicaNome: 'Síndico(a)', predioNome: '', chavePix: '', 
    saldoInicial: 0, inicioOperacao: '', diaVencimento: 10, linkGrupo: '', 
    tipoPlano: 'free', categorias: CATEGORIAS_PADRAO, multaAtraso: 2, jurosMensal: 1, telefoneSindico: ''
  });
  
  const [mesAtual, setMesAtual] = useState(MESES[new Date().getMonth()]);
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());
  const [busca, setBusca] = useState('');
  const [modoPrivacidade, setModoPrivacidade] = useState(false);
  
  // Modais
  const [modalUpgrade, setModalUpgrade] = useState(false); 
  const [modalPagamento, setModalPagamento] = useState(null);
  const [modalDetalhesUnidade, setModalDetalhesUnidade] = useState(null); 
  const [modalEditar, setModalEditar] = useState(null);
  const [modalConfig, setModalConfig] = useState(false); 
  const [modalNovaDespesa, setModalNovaDespesa] = useState(false);
  const [modalEditarDespesa, setModalEditarDespesa] = useState(null);
  const [modalRelatorio, setModalRelatorio] = useState(false);
  const [modalZeladoria, setModalZeladoria] = useState(false); 
  const [modalAvisos, setModalAvisos] = useState(false);
  const [modalEnquete, setModalEnquete] = useState(false); 
  const [modalInstalar, setModalInstalar] = useState(false); 
  const [showWizard, setShowWizard] = useState(false); 
  const [confirmacao, setConfirmacao] = useState(null);

  const [modoMorador, setModoMorador] = useState(false);
  const [unidadeMorador, setUnidadeMorador] = useState(null);

  useMetaTags(config);

  const carregarDados = async () => {
      setLoading(true);
      try {
          const [resUnidades, resPagamentos, resDespesas, resAvisos, resZeladoria, resEnquetes, resConfig] = await Promise.all([
              supabase.from('unidades').select('*').eq('user_id', session.user.id),
              supabase.from('pagamentos').select('*').eq('user_id', session.user.id),
              supabase.from('despesas').select('*').eq('user_id', session.user.id),
              supabase.from('avisos').select('*').eq('user_id', session.user.id),
              supabase.from('zeladoria').select('*').eq('user_id', session.user.id),
              supabase.from('enquetes').select('*').eq('user_id', session.user.id),
              supabase.from('config_geral').select('*').eq('user_id', session.user.id).maybeSingle()
          ]);

          if (resUnidades.data) setUnidades(resUnidades.data);
          if (resPagamentos.data) setPagamentos(resPagamentos.data);
          if (resDespesas.data) setDespesas(resDespesas.data);
          if (resAvisos.data) setAvisos(resAvisos.data);
          if (resZeladoria.data) setPatrimonio(resZeladoria.data);
          if (resEnquetes.data) setEnquetes(resEnquetes.data);
          if (resConfig.data) setConfig({ ...config, ...resConfig.data.dados });

          if ((!resUnidades.data || resUnidades.data.length === 0)) {
               const temConfig = resConfig.data;
               if (!temConfig) setShowWizard(true);
          }
      } catch (error) { console.error(error); showToast("Erro de conexão.", 'error'); } finally { setLoading(false); }
  };

  useEffect(() => { if (session) carregarDados(); }, [session]);

  // --- NOVA ESTRUTURA UNIFICADA DE DADOS E BACKUP ---
  const gerarDadosFake = async () => {
    try {
        setLoading(true);
        // Limpar dados anteriores para evitar conflitos no demo
        await resetarSistema(true); 

        const demoUnits = [];
        for (let i = 1; i <= 6; i++) {
            demoUnits.push({ user_id: session.user.id, numero: `${100 + i}`, proprietario: { nome: `Morador ${i}`, telefone: '34999998888' }, inquilino: {}, mora_proprietario: true });
        }
        const { data: unitsData, error: uErr } = await supabase.from('unidades').insert(demoUnits).select();
        if(uErr) throw uErr;
        setUnidades(unitsData);

        const pagamentosDemo = [];
        const mesesParaTras = 4;
        for (let i = 0; i < mesesParaTras; i++) {
            const d = new Date(); d.setMonth(d.getMonth() - i);
            const mesNome = MESES[d.getMonth()];
            const anoNum = d.getFullYear();
            for(let j=0; j<3; j++) {
                if(unitsData[j]) pagamentosDemo.push({ user_id: session.user.id, unidade_id: unitsData[j].id, valor: 250, data: `10/${d.getMonth()+1}/${anoNum}`, mes: mesNome, ano: anoNum });
            }
        }
        const { data: pagsData } = await supabase.from('pagamentos').insert(pagamentosDemo).select();
        if(pagsData) setPagamentos(pagsData);

        const demoDespesas = [
            { user_id: session.user.id, descricao: 'Energia', valor: 350.50, categoria: 'Luz', data: `05/${new Date().getMonth()+1}/${new Date().getFullYear()}`, mes: MESES[new Date().getMonth()], ano: new Date().getFullYear(), pago: true },
        ];
        const { data: dData } = await supabase.from('despesas').insert(demoDespesas).select();
        if(dData) setDespesas(dData);

        const novaConfig = { ...config, predioNome: 'Residencial Demo', sindicaNome: 'Síndico Teste', valorCondominio: 250, telefoneSindico: '11999999999' };
        setConfig(novaConfig);
        await supabase.from('config_geral').upsert({ user_id: session.user.id, dados: novaConfig });

        showToast("Dados de demonstração gerados!");
        setShowWizard(false);
    } catch (e) { showToast("Erro ao gerar demo: " + e.message, 'error'); } finally { setLoading(false); }
  };

  const exportarBackup = () => {
      // Exporta o estado atual, que deve refletir o BD se carregarDados foi chamado.
      const dadosCompletos = {
          unidades, despesas, pagamentos, avisos, zeladoria: patrimonio, enquetes, config
      };
      const blob = new Blob([JSON.stringify(dadosCompletos, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup_condoleve_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      showToast("Backup baixado!");
  };

  const importarBackup = async (e) => {
      const file = e.target.files[0];
      if(!file) return;
      const reader = new FileReader();
      reader.onload = async (evt) => {
          try {
              setLoading(true);
              const json = JSON.parse(evt.target.result);
              // Limpar tudo antes com segurança
              await resetarSistema(true);

              // Restaurar Config
              if(json.config) {
                  setConfig(json.config);
                  await supabase.from('config_geral').upsert({ user_id: session.user.id, dados: json.config });
              }
              
              // Passo 1: Unidades
              let mapaUnidades = {};
              if(json.unidades?.length) {
                  // Inserir unidades uma a uma para recuperar os IDs novos
                  for (const u of json.unidades) {
                      const { data } = await supabase.from('unidades').insert({...u, user_id: session.user.id, id: undefined}).select().single();
                      if(data) mapaUnidades[u.id] = data.id; // Mapeia ID antigo -> ID novo
                  }
              }
              
              // Passo 2: Pagamentos (usando mapa para manter vínculo)
              if(json.pagamentos?.length) {
                  const pags = json.pagamentos.map(p => ({
                      ...p, 
                      user_id: session.user.id, 
                      id: undefined, 
                      unidade_id: mapaUnidades[p.unidade_id] // Atualiza fk
                  })).filter(p => p.unidade_id);
                  if(pags.length) await supabase.from('pagamentos').insert(pags);
              }

              // Outras tabelas independentes
              const independentes = [
                  { nome: 'despesas', dados: json.despesas },
                  { nome: 'avisos', dados: json.avisos },
                  { nome: 'zeladoria', dados: json.zeladoria || json.patrimonio }, 
                  { nome: 'enquetes', dados: json.enquetes }
              ];

              for (const tab of independentes) {
                  if(tab.dados?.length) {
                      const dadosClean = tab.dados.map(d => ({...d, user_id: session.user.id, id: undefined }));
                      await supabase.from(tab.nome).insert(dadosClean);
                  }
              }

              showToast("Backup restaurado com sucesso!");
              await carregarDados(); // Recarrega do BD para garantir sincronia
              setModalConfig(false);

          } catch(err) { showToast("Erro ao restaurar: " + err.message, 'error'); } finally { setLoading(false); }
      };
      reader.readAsText(file);
  };

  const resetarSistema = async (silent = false) => {
      setLoading(true);
      try {
          // Ordem de deleção importa para integridade referencial
          // 1. Dependentes
          await supabase.from('pagamentos').delete().eq('user_id', session.user.id);
          
          // 2. Independentes
          await Promise.all([
              supabase.from('despesas').delete().eq('user_id', session.user.id),
              supabase.from('avisos').delete().eq('user_id', session.user.id),
              supabase.from('zeladoria').delete().eq('user_id', session.user.id),
              supabase.from('enquetes').delete().eq('user_id', session.user.id),
              supabase.from('config_geral').delete().eq('user_id', session.user.id)
          ]);

          // 3. Pai de Dependentes
          await supabase.from('unidades').delete().eq('user_id', session.user.id);
          
          setUnidades([]); setDespesas([]); setPagamentos([]); setAvisos([]); setPatrimonio([]); setEnquetes([]);
          
          if(!silent) {
              showToast("Sistema resetado.");
              setModalConfig(false);
              setShowWizard(true);
          }
      } catch(e) { 
          if(!silent) showToast("Erro ao resetar: " + e.message, 'error'); 
      } finally { 
          setLoading(false); 
      }
  };

  const adicionarPagamento = async (unidadeId, valor, data, urlComprovante) => {
      const novo = { user_id: session.user.id, unidade_id: unidadeId, valor, data, mes: mesAtual, ano: anoAtual, url_comprovante: urlComprovante };
      const { data: dbData, error } = await supabase.from('pagamentos').insert(novo).select().single();
      if (error) { showToast('Erro', 'error'); } 
      else { setPagamentos(prev => [...prev, dbData]); showToast(`Pagamento registrado!`); }
  };

  const removerPagamento = async (pagamentoId) => {
      setPagamentos(prev => prev.filter(p => p.id !== pagamentoId)); 
      await supabase.from('pagamentos').delete().eq('id', pagamentoId);
      showToast('Pagamento removido.');
  };

  const salvarNovaDespesa = async (despesaData, repetir) => {
      const baseDespesa = { ...despesaData, user_id: session.user.id };
      const [y, m, day] = baseDespesa.data.split('-');
      const ano = parseInt(y);
      const despesasParaInserir = [{ ...baseDespesa, mes: MESES[parseInt(m)-1], ano, data: baseDespesa.data.split('-').reverse().join('/') }];
      if (repetir) {
           const [anoInt, mesInt, diaInt] = baseDespesa.data.split('-').map(Number);
           for (let i = mesInt + 1; i <= 12; i++) {
                despesasParaInserir.push({ ...baseDespesa, mes: MESES[i-1], ano: anoInt, data: `${String(diaInt).padStart(2,'0')}/${String(i).padStart(2,'0')}/${anoInt}`, pago: false });
           }
      }
      const { data: inserted, error } = await supabase.from('despesas').insert(despesasParaInserir).select();
      if (error) { showToast('Erro ao salvar', 'error'); } 
      else { setDespesas(prev => [...prev, ...inserted]); showToast('Despesa lançada!'); setModalNovaDespesa(false); }
  };

  const editarDespesa = async (d) => {
     setDespesas(prev => prev.map(x => x.id === d.id ? { ...x, ...d } : x));
     await supabase.from('despesas').update(d).eq('id', d.id);
     showToast('Despesa atualizada');
  };

  const salvarConfig = async (novaConfig) => {
     setConfig(novaConfig);
     await supabase.from('config_geral').upsert({ user_id: session.user.id, dados: novaConfig }, { onConflict: 'user_id' });
     showToast('Configurações salvas');
  };

  const getPagamentosMes = (unidade, chave) => { 
      const [mes, ano] = chave.split('-');
      return pagamentos.filter(p => p.unidade_id === unidade.id && p.mes === mes && String(p.ano) === String(ano));
  };
  const calcularTotalPago = (pags) => pags.reduce((acc, p) => acc + safeNum(p.valor), 0);
  const fmt = (val) => modoPrivacidade ? 'R$ •••••' : formatarMoeda(val);

  const unidadesFiltradas = useMemo(() => {
    if (!busca) return unidades;
    const b = busca.toLowerCase();
    return unidades.filter(u => u.numero.toLowerCase().includes(b) || u.proprietario?.nome?.toLowerCase().includes(b) || u.inquilino?.nome?.toLowerCase().includes(b));
  }, [unidades, busca]);
  
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

  const copiarTexto = (txt) => { navigator.clipboard.writeText(txt).then(() => showToast('Copiado!')).catch(() => showToast('Erro')); };
  const chaveAtual = `${mesAtual}-${anoAtual}`;
  
  const { receitaMes, gastoMes, despesasFiltradas, gastosPorCategoria, saldoAteMomento, historicoGrafico } = useMemo(() => {
      const pgs = unidades.filter(u => getPagamentosMes(u, chaveAtual).length > 0);
      const rec = pgs.reduce((acc, u) => acc + calcularTotalPago(getPagamentosMes(u, chaveAtual)), 0);
      
      const dps = despesas.filter(d => d.mes === mesAtual && String(d.ano) === String(anoAtual));
      const gas = dps.reduce((acc, d) => acc + safeNum(d.valor), 0);
      
      const catMap = {}; dps.forEach(d => { const cat = d.categoria || 'Outros'; catMap[cat] = (catMap[cat] || 0) + safeNum(d.valor); });
      const categoriasChart = Object.keys(catMap).map(c => ({ name: c, value: catMap[c] })).sort((a,b) => b.value - a.value);
      
      const totalEntradas = pagamentos.reduce((acc, p) => acc + Number(p.valor), 0);
      const totalSaidas = despesas.filter(d => d.pago).reduce((acc, d) => acc + Number(d.valor), 0);
      const saldoTotal = safeNum(config.saldoInicial) + totalEntradas - totalSaidas;
      
      const historico = [];
      // Gráfico de 6 meses - Lógica Fixada
      for (let i = 5; i >= 0; i--) {
          const d = new Date(); 
          d.setMonth(d.getMonth() - i);
          const mNome = MESES[d.getMonth()]; 
          const yNum = d.getFullYear();
          
          // Filtros robustos
          const r = pagamentos
            .filter(p => p.mes === mNome && String(p.ano) === String(yNum))
            .reduce((sum, p) => sum + Number(p.valor), 0);
          
          const g = despesas
            .filter(x => x.mes === mNome && String(x.ano) === String(yNum) && (x.pago !== false))
            .reduce((sum, x) => sum + Number(x.valor), 0);
          
          historico.push({ mes: mNome.substr(0,3), receita: r, despesa: g });
      }
      return { receitaMes: rec, gastoMes: gas, despesasFiltradas: dps, gastosPorCategoria: categoriasChart, saldoAteMomento: saldoTotal, historicoGrafico: historico };
  }, [unidades, despesas, pagamentos, chaveAtual, config]);

  if (loading && unidades.length === 0 && pagamentos.length === 0) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><RefreshCw className="animate-spin text-[#84cc16]"/><p className="ml-4 font-black text-[#1e293b]">Carregando Dados...</p></div>;
  if (modoMorador && unidadeMorador) return <ModoMorador unidade={unidadeMorador} config={config} onExit={() => setModoMorador(false)} mesAtual={mesAtual} anoAtual={anoAtual} getPagamentosMes={getPagamentosMes} calcularTotalPago={calcularTotalPago} fmt={fmt} unidades={unidades} avisos={avisos} enquetes={enquetes} patrimonio={patrimonio} showToast={showToast} copiarTexto={copiarTexto} supabase={supabase} />;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-28 print:bg-white print:pb-0">
       <style>{`@media print { .no-print { display: none !important; } .print-area { display: block !important; position: absolute; top:0; left:0; width:100%; height:100%; z-index:9999; background:white; } }`}</style>
       {showWizard && <SetupWizard config={config} setConfig={setConfig} setUnidades={setUnidades} onDemo={gerarDadosFake} onComplete={async () => { setShowWizard(false); await salvarConfig(config); }} supabase={supabase} session={session} />}
       <div className="bg-[#1e293b] text-white py-3 px-4 flex justify-between items-center sticky top-0 z-40 no-print border-b border-white/5 shadow-xl">
         <div className="flex gap-3 items-center"><div className="bg-white p-1 rounded-lg shadow-sm"><Logo variant="icon" width="w-8" /></div><div><span className="font-black text-sm truncate max-w-[180px] block leading-tight tracking-tight">{safeStr(config.predioNome || "CondoLeve")}</span><span className="text-[10px] text-slate-400 font-bold opacity-80">{safeStr(config.sindicaNome).split(' ')[0]}</span></div></div>
         <div className="flex gap-2 items-center"><button onClick={() => setModalConfig(true)} className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition flex items-center gap-2"><Settings size={18}/><span className="text-[9px] text-slate-400 font-mono hidden sm:inline-block border-l border-white/20 pl-2 ml-1">v{APP_VERSION}</span></button><button onClick={() => supabase.auth.signOut()} className="bg-red-500/20 hover:bg-red-500/40 p-2 rounded-xl transition text-red-200"><LogOutIcon size={18}/></button></div>
       </div>
       <header className="bg-[#1e293b] text-white pt-6 px-6 pb-12 no-print relative overflow-hidden text-center">
         <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transform translate-x-1/4 -translate-y-1/4"><Logo variant="icon" width="w-64" /></div>
         <div className="max-w-4xl mx-auto"><div className="bg-white/5 backdrop-blur-md p-2 rounded-2xl flex items-center justify-between border border-white/10 w-full max-w-xs mx-auto mb-4"><button onClick={() => { const idx = MESES.indexOf(mesAtual); if(idx > 0) setMesAtual(MESES[idx-1]); else { setAnoAtual(anoAtual-1); setMesAtual(MESES[11]); } }} className="p-3 hover:bg-white/10 rounded-xl transition"><TrendingDown className="rotate-90 w-4 h-4 text-[#84cc16]"/></button><div><span className="font-black text-xl tracking-tight uppercase">{safeStr(mesAtual)}</span><p className="text-[9px] font-bold text-slate-400 tracking-widest leading-none mt-1">{safeStr(anoAtual)}</p></div><button onClick={() => { const idx = MESES.indexOf(mesAtual); if(idx < 11) setMesAtual(MESES[idx+1]); else { setAnoAtual(anoAtual+1); setMesAtual(MESES[0]); } }} className="p-3 hover:bg-white/10 rounded-xl transition"><TrendingUp className="rotate-90 w-4 h-4 text-[#84cc16]"/></button></div><div className="flex gap-6 justify-center mt-2 items-center relative"><div><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Entradas</p><p className="font-black text-green-400">{fmt(receitaMes)}</p></div><div className="h-10 w-px bg-white/10"></div><div><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Saídas</p><p className="font-black text-red-400">-{fmt(gastoMes)}</p></div><div className="relative ml-2"><button onClick={() => setModoPrivacidade(!modoPrivacidade)} className={`p-2 rounded-full transition ${modoPrivacidade ? 'bg-[#84cc16] text-[#1e293b]' : 'bg-white/10 text-slate-400 hover:bg-white/20'}`}>{modoPrivacidade ? <EyeOff size={16}/> : <Eye size={16}/>}</button></div></div></div>
       </header>
       <main className="max-w-4xl mx-auto p-4 -mt-8 relative z-10 no-print">
         {abaAtiva === 'receitas' && (<div className="space-y-4 animate-in fade-in duration-500"><div className="grid gap-3">{unidadesFiltradas.length > 0 ? unidadesFiltradas.map(u => { const valorDevido = safeNum(config.valorCondominio); const pags = getPagamentosMes(u, chaveAtual); const totalPago = calcularTotalPago(pags); const isPago = totalPago >= valorDevido; const isParcial = totalPago > 0 && totalPago < valorDevido; return (<Card key={u.id} className={`p-4 border-l-[6px] transition-all hover:shadow-md ${isPago ? 'border-l-[#84cc16]' : (isParcial ? 'border-l-yellow-400' : 'border-l-slate-200')}`}><div className="flex items-center justify-between gap-4"><div className="flex gap-4 items-center text-left"><div className="w-14 h-14 bg-slate-50 rounded-2xl font-black flex items-center justify-center text-slate-400 text-lg border border-slate-100 relative">{safeStr(u.numero)}{u.linked_user_id && <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>}</div><div><p className="font-black text-slate-800 flex items-center gap-2">{safeStr(u.mora_proprietario ? (u.proprietario?.nome || "Proprietário") : (u.inquilino?.nome || "Morador"))} <button onClick={() => setModalEditar(u)} className="text-slate-300 hover:text-blue-500"><Pencil size={12}/></button></p><div className="mt-1">{totalPago > 0 ? <span className={`text-[10px] font-black uppercase tracking-tighter flex items-center gap-1 ${isPago ? 'text-[#84cc16]' : 'text-yellow-600'}`}><CheckCircle size={10}/> {isPago ? 'PAGO' : 'PARCIAL'} • {fmt(totalPago)}</span> : <span className="text-[10px] font-black text-slate-400 tracking-wide uppercase">PENDENTE • {fmt(valorDevido)}</span>}</div></div></div><div className="flex flex-col items-end gap-2">{totalPago > 0 ? <button onClick={() => setModalDetalhesUnidade({ u, mes: mesAtual, ano: anoAtual, pags, totalPago, valorDevido })} className="text-[10px] bg-slate-100 text-slate-600 font-black px-4 py-2 rounded-xl hover:bg-slate-200 flex items-center gap-2"><Eye size={12}/> DETALHES</button> : <button onClick={() => setModalPagamento({ unidadeId: u.id, valorSugerido: valorDevido })} className="bg-[#1e293b] text-white text-[10px] font-black px-6 py-3 rounded-2xl shadow-lg active:scale-95 transition">RECEBER</button>}</div></div></Card>); }) : <EmptyState icon={Home} title="Nenhum Apartamento" desc="Você ainda não cadastrou nenhuma unidade." />}</div></div>)}
         {abaAtiva === 'despesas' && (<div className="space-y-4 animate-in fade-in duration-500"><Card className="p-6 bg-white border-l-[6px] border-l-red-500 shadow-xl flex justify-between items-center text-left"><div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total de Gastos</p><p className="text-3xl font-black text-red-600">{fmt(gastoMes)}</p></div><button onClick={() => setModalNovaDespesa(true)} className="bg-red-500 text-white px-5 py-4 rounded-2xl font-black text-xs shadow-lg flex items-center gap-2 hover:bg-red-600 transition"><PlusCircle size={18}/> LANÇAR CONTA</button></Card>{despesasFiltradas.length === 0 && (<div className="mt-4"><EmptyState icon={ArrowDownCircle} title="Tudo tranquilo por aqui" desc={`Nenhuma despesa lançada em ${mesAtual}.`} action={() => setModalNovaDespesa(true)} label="Lançar Conta"/></div>)}<div className="grid gap-2">{despesasFiltradas.map(d => { const isPago = d.pago !== false; return (<Card key={d.id} className={`p-4 flex flex-col sm:flex-row justify-between items-center text-left border-l-4 ${isPago ? 'border-l-green-500' : 'border-l-orange-400 bg-orange-50/10'}`}><div className="w-full sm:w-auto"><p className={`font-black flex items-center gap-2 text-slate-800`}>{safeStr(d.descricao)}{d.url_comprovante && <a href={d.url_comprovante} target="_blank" rel="noopener noreferrer" className="bg-slate-100 text-slate-500 p-1 rounded-md hover:bg-blue-100 hover:text-blue-600 transition"><Paperclip size={12}/></a>}</p><div className="flex gap-2 mt-1"><div className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">{getIconeCategoria(d.categoria)}<span className="text-[9px] uppercase font-black text-slate-500">{safeStr(d.categoria)}</span></div><span className="text-[10px] font-bold text-slate-400 self-center">{safeStr(d.data)}</span></div></div><div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end mt-4 sm:mt-0"><div className="text-right mr-2"><p className={`font-black ${isPago ? 'text-slate-800' : 'text-orange-500'}`}>-{fmt(d.valor)}</p><span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${isPago ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-600'}`}>{isPago ? 'PAGO' : 'PENDENTE'}</span></div><div className="flex gap-1 items-center"><button onClick={() => editarDespesa({...d, pago: !isPago})} className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase transition flex items-center gap-1 shadow-sm ${isPago ? 'bg-slate-100 text-slate-400 hover:bg-slate-200' : 'bg-green-500 text-white hover:bg-green-600'}`}>{isPago ? <RotateCcw size={12}/> : <Check size={12}/>} {isPago ? 'DESFAZER' : 'PAGAR'}</button><button onClick={() => setModalEditarDespesa(d)} className="p-2 text-slate-300 hover:text-blue-500"><Edit size={16}/></button><button onClick={() => setConfirmacao({ titulo: "Apagar Conta?", texto: "Tem certeza que deseja apagar este lançamento?", onConfirm: () => { supabase.from('despesas').delete().eq('id', d.id).then(()=>setDespesas(despesas.filter(x=>x.id!==d.id))); setConfirmacao(null); } })} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={16}/></button></div></div></Card>); })}</div></div>)}
         {abaAtiva === 'caixa' && (<div className="space-y-6 animate-in fade-in duration-500 text-left"><div className="bg-[#1e293b] text-white p-8 rounded-[32px] shadow-2xl relative overflow-hidden"><div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none transform translate-x-1/4 -translate-y-1/4"><Wallet size={200}/></div><div className="relative z-10 flex flex-col md:flex-row justify-between md:items-end gap-6"><div><p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Saldo em Caixa</p><h2 className="text-4xl sm:text-5xl font-black mb-4 tracking-tighter">{fmt(saldoAteMomento)}</h2><div className="pt-4 border-t border-white/10 flex items-center gap-2"><History size={12} className="text-slate-400"/> <span className="text-[10px] text-slate-400 uppercase font-bold">Acumulado até {safeStr(mesAtual)}/{safeStr(anoAtual)}</span></div></div><button onClick={() => setModalRelatorio(true)} className="bg-[#84cc16] text-[#1e293b] py-3 px-6 rounded-2xl font-black text-xs shadow-xl flex items-center justify-center gap-2 hover:bg-[#a3e635] transition w-full md:w-auto"><FileBarChart size={18}/> PRESTAÇÃO DE CONTAS</button></div></div><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><Card className="p-6"><div className="flex justify-between items-center mb-6"><h3 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><BarChart3 size={14}/> Fluxo de Caixa (6 Meses)</h3></div><div className="flex items-end gap-2 h-40">{historicoGrafico.map((h, i) => { const maxVal = Math.max(...historicoGrafico.map(x=>Math.max(x.receita, x.despesa))) || 1; return (<div key={i} className="flex-1 flex flex-col justify-end items-center gap-1 group relative"><div className="w-full bg-slate-50 rounded-lg relative flex items-end justify-center overflow-hidden gap-1 px-0.5" style={{height: '100%'}}><div className="flex-1 bg-red-400 rounded-t-sm" style={{height: `${(h.despesa / maxVal) * 100}%`}}></div><div className="flex-1 bg-[#84cc16] rounded-t-sm" style={{height: `${(h.receita / maxVal) * 100}%`}}></div></div><span className="text-[9px] font-bold text-slate-400 uppercase">{h.mes}</span><div className="absolute bottom-full mb-1 hidden group-hover:block bg-[#1e293b] text-white text-[9px] p-2 rounded shadow-lg z-10 whitespace-nowrap text-left"><p className="text-green-300">Ent: {fmt(h.receita)}</p><p className="text-red-300">Sai: {fmt(h.despesa)}</p></div></div>)})}</div></Card><Card className="p-6"><div className="flex justify-between items-center mb-6"><h3 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><PieChart size={14}/> Gastos do Mês</h3><span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded font-bold">{fmt(gastoMes)}</span></div><div className="flex flex-col sm:flex-row items-center gap-6"><div className="relative w-40 h-40 rounded-full shrink-0" style={{ background: generateConicGradient(gastosPorCategoria, gastoMes) }}><div className="absolute inset-4 bg-white rounded-full flex items-center justify-center flex-col"><span className="text-[10px] font-bold text-slate-400 uppercase">Total</span><span className="text-sm font-black text-slate-800">{fmt(gastoMes)}</span></div></div><div className="flex-1 w-full space-y-2 max-h-40 overflow-y-auto pr-1">{gastosPorCategoria.length > 0 ? gastosPorCategoria.map((cat, i) => (<div key={i} className="flex items-center justify-between text-xs"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}></div><span className="font-bold text-slate-600 truncate max-w-[100px]">{cat.name}</span></div><span className="font-bold text-slate-400">{((cat.value / (gastoMes || 1)) * 100).toFixed(0)}%</span></div>)) : <p className="text-center text-slate-300 text-xs italic">Sem dados.</p>}</div></div></Card></div></div>)}
         {abaAtiva === 'mais' && (<div className="space-y-6 animate-in fade-in duration-500"><div className="bg-[#1e293b] p-6 rounded-b-[40px] text-center shadow-lg -mt-4 pb-10 mb-2"><div className="flex justify-center mb-2"><Logo variant="full" width="w-48" className="brightness-0 invert opacity-90" /></div><p className="text-slate-400 text-xs font-medium mt-0">Ferramentas e Utilitários</p></div><div className="grid grid-cols-2 gap-4 px-2"><button onClick={() => setModalZeladoria(true)} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 hover:shadow-md transition"><div className="bg-slate-50 text-slate-600 p-4 rounded-2xl"><Hammer size={28}/></div><span className="font-black text-slate-700 text-xs uppercase tracking-widest flex items-center gap-1">Zeladoria</span></button><button onClick={() => setModalAvisos(true)} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 hover:shadow-md transition"><div className="bg-orange-50 text-orange-500 p-4 rounded-2xl"><Megaphone size={28}/></div><span className="font-black text-slate-700 text-xs uppercase tracking-widest flex items-center gap-1">Mural de Avisos</span></button><button onClick={() => setModalEnquete(true)} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 hover:shadow-md transition"><div className="bg-blue-50 text-blue-500 p-4 rounded-2xl"><Vote size={28}/></div><span className="font-black text-slate-700 text-xs uppercase tracking-widest flex items-center gap-1">Enquetes</span></button><button onClick={() => setModalConfig(true)} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 hover:shadow-md transition"><div className="bg-slate-50 text-slate-600 p-4 rounded-2xl"><Settings size={28}/></div><span className="font-black text-slate-700 text-xs uppercase tracking-widest">Configuração</span></button></div></div>)}
       </main>
       <nav className="fixed bottom-0 left-0 right-0 bg-white/80 border-t border-slate-100 px-2 py-4 flex justify-around items-end z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] no-print pb-10 backdrop-blur-xl">
          <NavBtn active={abaAtiva === 'receitas'} onClick={() => setAbaAtiva('receitas')} icon={<ArrowUpCircle size={24}/>} label="Receitas" />
          <NavBtn active={abaAtiva === 'despesas'} onClick={() => setAbaAtiva('despesas')} icon={<ArrowDownCircle size={24}/>} label="Despesas" />
          <NavBtn active={abaAtiva === 'caixa'} onClick={() => setAbaAtiva('caixa')} icon={<PieChart size={24}/>} label="Dashboard" />
          <NavBtn active={abaAtiva === 'mais'} onClick={() => setAbaAtiva('mais')} icon={<Grid size={24}/>} label="Ferramentas" />
       </nav>
      {confirmacao && <ModalConfirmacao data={confirmacao} onClose={() => setConfirmacao(null)} />}
      {modalPagamento && <ModalReceber valorSugerido={modalPagamento.valorSugerido} onCancel={() => setModalPagamento(null)} onConfirm={(v,d,url) => { adicionarPagamento(modalPagamento.unidadeId, v, d, url); setModalPagamento(null); }} supabase={supabase} />}
      {modalDetalhesUnidade && <ModalDetalhesUnidade dados={modalDetalhesUnidade} sindica={config.sindicaNome} chavePix={config.chavePix} onAdd={(v,d,url) => { adicionarPagamento(modalDetalhesUnidade.u.id, v, d, url); setModalDetalhesUnidade(null); }} onDelete={(pid) => { removerPagamento(pid); setModalDetalhesUnidade(null); }} onClose={() => setModalDetalhesUnidade(null)} copiarTexto={copiarTexto} fmt={fmt} supabase={supabase} />}
      {modalNovaDespesa && <ModalDespesa supabase={supabase} planoAtual={config.tipoPlano} categorias={config.categorias} abrirConfig={() => {setModalNovaDespesa(false); setModalConfig(true);}} onClose={() => setModalNovaDespesa(false)} onSave={salvarNovaDespesa} triggerConfirm={setConfirmacao} />}
      {modalEditarDespesa && <ModalDespesa supabase={supabase} planoAtual={config.tipoPlano} categorias={config.categorias} abrirConfig={() => {setModalEditarDespesa(null); setModalConfig(true);}} despesaParaEditar={modalEditarDespesa} onClose={() => setModalEditarDespesa(null)} onSave={(d) => { editarDespesa({...d, id: modalEditarDespesa.id}); setModalEditarDespesa(null); }} triggerConfirm={setConfirmacao} />}
      {modalEditar && <ModalEditarUnidade u={modalEditar} onClose={() => setModalEditar(null)} onSave={(novo) => { supabase.from('unidades').update(novo).eq('id',novo.id).then(()=>{ setUnidades(unidades.map(x=>x.id===novo.id?novo:x)); setModalEditar(null); showToast("Unidade salva!"); }); }} ativarModoMorador={() => { setUnidadeMorador(modalEditar); setModoMorador(true); setModalEditar(null); }} showToast={showToast} config={config} copiarTexto={copiarTexto} setConfirmacao={setConfirmacao} />}
      {modalConfig && <ModalConfiguracoes config={config} setConfig={setConfig} despesas={despesas} onClose={() => setModalConfig(false)} triggerConfirm={setConfirmacao} exportarBackup={exportarBackup} importarBackup={importarBackup} resetar={resetarSistema} showToast={showToast} />}
      {modalInstalar && <ModalInstalar onClose={() => setModalInstalar(false)} />}
      {modalRelatorio && <ModalRelatorio receita={receitaMes} despesa={gastoMes} saldo={saldoAteMomento} despesas={despesasFiltradas} unidades={unidades} pagamentos={pagamentos} mes={mesAtual} ano={anoAtual} config={config} onClose={() => setModalRelatorio(false)} fmt={fmt} />}
      {modalZeladoria && <ModalZeladoria lista={patrimonio} onClose={() => setModalZeladoria(false)} onSave={async (item) => { const {data, error} = await supabase.from('zeladoria').insert({...item, user_id:session.user.id}).select().single(); if(!error) setPatrimonio([...patrimonio, data]); }} onDelete={async (id) => { await supabase.from('zeladoria').delete().eq('id',id); setPatrimonio(patrimonio.filter(p=>p.id!==id)); }} />}
      {modalAvisos && <ModalAvisos lista={avisos} onClose={() => setModalAvisos(false)} onSave={async (item) => { const {data, error} = await supabase.from('avisos').insert({...item, user_id:session.user.id}).select().single(); if(!error) setAvisos([data, ...avisos]); }} onDelete={async (id) => { await supabase.from('avisos').delete().eq('id',id); setAvisos(avisos.filter(a=>a.id!==id)); }} />}
      {modalEnquete && <ModalEnquete lista={enquetes} onClose={() => setModalEnquete(false)} onSave={async (item) => { const {data, error} = await supabase.from('enquetes').insert({...item, user_id:session.user.id}).select().single(); if(!error) setEnquetes([data, ...enquetes]); }} />}
    </div>
  );
}

// --- MODO MORADOR COM ABAS (CORRIGIDO) ---
function ModoMorador({ unidade, config, onExit, mesAtual, anoAtual, getPagamentosMes, calcularTotalPago, fmt, unidades, avisos, enquetes, patrimonio, showToast, copiarTexto, supabase }) {
  const [activeTab, setActiveTab] = useState('mural');
  const [historyMode, setHistoryMode] = useState(false); // Toggle History
  
  const pags = getPagamentosMes(unidade, `${mesAtual}-${anoAtual}`);
  const totalPago = calcularTotalPago(pags);
  const valorDevido = safeNum(config.valorCondominio);
  const isPago = totalPago >= valorDevido;
  const valorRestante = Math.max(0, valorDevido - totalPago);

  const filterActive = (list, type) => {
     if(!list) return [];
     if(type === 'aviso') return list.filter(a => { const d = new Date(a.data.split('/').reverse().join('-')); const diff = (new Date() - d) / (1000 * 3600 * 24); return historyMode ? diff > 30 : diff <= 30; });
     if(type === 'enquete') return list.filter(e => historyMode ? !e.ativa : e.ativa);
     if(type === 'zeladoria') return list.filter(z => historyMode ? z.concluido : !z.concluido);
     return list;
  }
  const avisosShow = filterActive(avisos, 'aviso');
  const enquetesShow = filterActive(enquetes, 'enquete');
  const zelaShow = filterActive(patrimonio, 'zeladoria');

  const Badge = ({ count }) => count > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold shadow-sm">{count}</span>;
  const TabBtn = ({ id, icon: Icon, label, count }) => <button onClick={() => {setActiveTab(id); setHistoryMode(false);}} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition flex flex-col items-center gap-1 relative ${activeTab === id ? 'bg-[#1e293b] text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}`}><Icon size={18} className={activeTab === id ? 'text-[#84cc16]' : 'text-slate-300'}/>{label}<Badge count={count}/></button>;
  
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-10">
       <div className="bg-[#1e293b] text-white p-6 pb-12 rounded-b-[40px] shadow-2xl mb-8 relative"><button onClick={onExit} className="absolute top-4 right-4 bg-white/10 text-white p-2 rounded-full hover:bg-white/20 text-xs font-bold flex items-center gap-2"><LogOutIcon size={14}/> Sair</button><div className="mb-6 scale-90 origin-top-left"><Logo variant="simple" className="brightness-0 invert" width="w-40" /></div><h2 className="text-3xl font-black mb-1">Olá, {safeStr(unidade.proprietario?.nome).split(' ')[0] || 'Vizinho'}!</h2><p className="text-slate-400 text-sm font-medium">Apto {safeStr(unidade.numero)} • {safeStr(config.predioNome)}</p></div>
       <div className="px-6 -mt-16 relative z-10 space-y-4">
          <Card className="p-6 text-center border-t-4 border-t-[#84cc16]">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Fatura de {mesAtual}</p>
              {isPago ? (<div className="py-2 animate-in zoom-in duration-300"><CheckCircle size={40} className="text-[#84cc16] mx-auto mb-2"/><p className="text-xl font-black text-[#1e293b]">Tudo pago!</p></div>) : (
                  <div className="py-2">
                      <p className="text-4xl font-black text-[#1e293b] mb-1">{fmt(valorRestante)}</p>
                      {totalPago > 0 && <p className="text-xs text-slate-400 font-bold mb-4">Restante a pagar (Total: {fmt(valorDevido)})</p>}
                      <button className="w-full bg-[#1e293b] text-white py-4 rounded-xl font-black shadow-lg flex items-center justify-center gap-2 active:scale-95 transition" onClick={() => copiarTexto(config.chavePix)}><Copy size={16}/> COPIAR PIX ({fmt(valorRestante)})</button>
                  </div>
              )}
          </Card>
          <div className="grid grid-cols-2 gap-3 mt-4"><button onClick={() => window.open(`https://wa.me/55${safeStr(config.telefoneSindico || '').replace(/\D/g,'')}?text=Olá, sou morador do Apto ${unidade.numero}`, '_blank')} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 font-bold text-xs text-slate-600 flex flex-col items-center gap-2 hover:bg-slate-50 col-span-2"><Phone size={24} className="text-slate-400"/> Falar com Síndico</button></div>
          <div className="mt-8">
             <div className="flex gap-2 mb-4"><TabBtn id="mural" icon={Megaphone} label="Mural" count={filterActive(avisos, 'aviso').length}/><TabBtn id="vote" icon={Vote} label="Votação" count={filterActive(enquetes, 'enquete').length}/><TabBtn id="manut" icon={Hammer} label="Manutenção" count={filterActive(patrimonio, 'zeladoria').length}/></div>
             
             <div className="bg-slate-200 p-1 rounded-xl flex mb-4">
                <button onClick={() => setHistoryMode(false)} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition ${!historyMode ? 'bg-white shadow text-[#1e293b]' : 'text-slate-500'}`}>Em Aberto</button>
                <button onClick={() => setHistoryMode(true)} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition ${historyMode ? 'bg-white shadow text-[#1e293b]' : 'text-slate-500'}`}>Histórico</button>
             </div>
             
             {activeTab === 'mural' && <div className="space-y-4">{avisosShow.map(a => (<div key={a.id} className="p-4 rounded-2xl border bg-white border-slate-100 shadow-sm"><div className="flex justify-between mb-1"><span className="text-[9px] font-black uppercase text-blue-500 bg-blue-50 px-2 rounded">AVISO</span><span className="text-[9px] text-slate-400">{a.data}</span></div><h4 className="font-black text-sm text-slate-800 mb-1">{a.titulo}</h4><p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{a.mensagem}</p></div>))} {avisosShow.length===0 && <EmptyState icon={Bell} title={historyMode ? "Histórico Vazio" : "Sem Avisos Recentes"} desc=""/>}</div>}
             
             {activeTab === 'vote' && <div className="space-y-4">{enquetesShow.map(e => (<div key={e.id} className="p-4 rounded-2xl border bg-white border-slate-100 shadow-sm"><h4 className="font-black text-sm text-slate-800 mb-2">{e.titulo}</h4><p className="text-xs text-slate-400 mb-2">{historyMode ? 'Encerrada' : 'Aberta'}</p></div>))} {enquetesShow.length===0 && <EmptyState icon={Vote} title="Nenhuma Votação" desc=""/>}</div>}
             
             {activeTab === 'manut' && <div className="space-y-4">
                 {zelaShow.map(z => (
                     <div key={z.id} className="p-4 rounded-2xl border bg-white border-slate-100 shadow-sm flex items-center gap-3">
                         {z.concluido ? <CheckSquare size={18} className="text-green-500"/> : <Square size={18} className="text-slate-300"/>}
                         <span className={`text-xs font-bold ${z.concluido ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{z.item}</span>
                     </div>
                 ))} 
                 {zelaShow.length === 0 && <EmptyState icon={Hammer} title="Tudo em Ordem" desc=""/>}
             </div>}
          </div>
       </div>
    </div>
  )
}

function ModalConfirmacao({ data, onClose }) { 
    if (!data) return null; 
    return <div className="fixed inset-0 bg-[#1e293b]/90 z-[10000] flex items-center justify-center p-6 backdrop-blur-md animate-in fade-in duration-200"><div className="bg-white p-8 rounded-[32px] max-w-sm w-full text-center shadow-2xl animate-in zoom-in duration-300"><div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500"><AlertTriangle size={32}/></div><h3 className="font-black text-xl text-[#1e293b] mb-2">{data.titulo}</h3><p className="text-sm text-slate-500 mb-8 font-medium leading-relaxed">{data.texto}</p><div className="flex gap-3"><button onClick={onClose} className="flex-1 py-3 text-slate-400 font-bold text-xs uppercase hover:text-slate-600 transition">Cancelar</button><button onClick={data.onConfirm} className="flex-1 bg-red-500 text-white py-3 rounded-xl font-black text-xs uppercase shadow-lg hover:bg-red-600 transition active:scale-95">Confirmar</button></div></div></div>; 
}

// --- WIZARD COM GERADOR DE APARTAMENTOS ---
function SetupWizard({ config, setConfig, setUnidades, onDemo, onComplete, supabase, session }) {
    const [step, setStep] = useState(1);
    const [local, setLocal] = useState({...config});
    const [blocos, setBlocos] = useState('');
    const [andares, setAndares] = useState('');
    const [aptosPorAndar, setAptosPorAndar] = useState('');
    const [listaGerada, setListaGerada] = useState([]);
    const [saving, setSaving] = useState(false);
    const [usarZero, setUsarZero] = useState(true); // Estilo 101 ou 11

    const gerarApartamentos = () => {
        if(!blocos && (!andares || !aptosPorAndar)) return;
        
        let novaLista = [];
        // Se só tiver blocos e sem andares (ex: casas)
        const listaBlocos = blocos ? blocos.split(',').map(b => b.trim()).filter(b=>b) : [''];
        
        if (andares && aptosPorAndar) {
            const numAndares = parseInt(andares);
            const numAptos = parseInt(aptosPorAndar);
            listaBlocos.forEach(bloco => {
                for(let i=1; i<=numAndares; i++) {
                    for(let j=1; j<=numAptos; j++) {
                        const numero = usarZero ? `${i}0${j}` : `${i}${j}`;
                        const nomeFinal = bloco ? `${bloco}-${numero}` : numero;
                        novaLista.push(nomeFinal);
                    }
                }
            });
        } else if (listaBlocos.length > 0) {
            // Apenas blocos (ex: Casas)
            novaLista = listaBlocos;
        }

        setListaGerada(prev => [...new Set([...prev, ...novaLista])]); 
    };

    const handleSave = async () => {
        setSaving(true);
        if (listaGerada.length === 0 && step === 4) { alert("Gere os apartamentos primeiro."); setSaving(false); return; }
        try {
            await supabase.from('config_geral').upsert({ user_id: session.user.id, dados: local });
            const unitsToInsert = listaGerada.map(n => ({ user_id: session.user.id, numero: n, proprietario: {}, inquilino: {}, mora_proprietario: true }));
            if(unitsToInsert.length > 0) {
               const { data: insertedUnits } = await supabase.from('unidades').insert(unitsToInsert).select();
               if(insertedUnits) setUnidades(insertedUnits);
            }
            setConfig(local); onComplete();
        } catch (e) { alert("Erro ao salvar: " + e.message); } finally { setSaving(false); }
    }
    
    // Validação passo a passo
    const nextStep = () => {
        if(step === 1 && (!local.predioNome || !local.sindicaNome || !local.telefoneSindico)) return alert("Preencha todos os campos obrigatórios.");
        if(step === 2 && (!local.valorCondominio)) return alert("Defina o valor do condomínio.");
        if (step < 4) setStep(step + 1); else handleSave();
    };

    const prevStep = () => {
        if(step > 1) setStep(step - 1);
    }

    return (
        <div className="fixed inset-0 bg-white z-[10010] flex flex-col p-8 font-sans text-left overflow-y-auto">
            <div className="max-w-md mx-auto w-full">
                <div className="mb-10 flex justify-between items-center">
                    <Logo variant="simple" width="w-48" />
                    {step > 1 && <button onClick={prevStep} className="bg-slate-100 p-2 rounded-full text-slate-500 hover:bg-slate-200"><ArrowLeft size={20}/></button>}
                </div>
                <div className="flex gap-2 mb-10">{[1,2,3,4].map(i => <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-[#1e293b]' : 'bg-slate-100'}`}></div>)}</div>
                {step === 1 && (<div><h2 className="text-3xl font-black text-slate-900 mb-2 leading-tight">Configurar Prédio 🏢</h2><p className="text-slate-500 mb-10 font-medium">Informações básicas do condomínio.</p><div className="space-y-6"><label className="block"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome do Condomínio</span><input value={local.predioNome || ""} onChange={e=>setLocal({...local, predioNome:e.target.value})} placeholder="Ex: Residencial Solar" className="w-full border-2 border-slate-100 p-4 rounded-2xl font-black focus:border-[#84cc16] outline-none transition-all"/></label><label className="block"><span className="text-[10px] font-black text-slate-400 uppercase">Seu Nome (Síndico)</span><input value={local.sindicaNome || ""} onChange={e=>setLocal({...local, sindicaNome:e.target.value})} placeholder="Ex: Maria Clara" className="w-full border-2 border-slate-100 p-4 rounded-2xl font-black focus:border-[#84cc16] outline-none transition-all"/></label><label className="block"><span className="text-[10px] font-black text-slate-400 uppercase">WhatsApp do Síndico (Obrigatório)</span><input value={local.telefoneSindico || ""} onChange={e=>setLocal({...local, telefoneSindico:e.target.value})} placeholder="Ex: 11999999999" className="w-full border-2 border-slate-100 p-4 rounded-2xl font-black focus:border-[#84cc16] outline-none transition-all"/></label></div></div>)}
                {step === 2 && (<div><h2 className="text-3xl font-black text-slate-900 mb-2 leading-tight">Valores e PIX 💰</h2><p className="text-slate-500 mb-10 font-medium">Como seus moradores devem pagar?</p><div className="space-y-6"><label className="block"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Condomínio Mensal</span><input type="number" value={safeNum(local.valorCondominio)} onChange={e=>setLocal({...local, valorCondominio:Number(e.target.value)})} className="w-full border-2 border-slate-100 p-4 rounded-2xl font-black text-green-600 focus:border-[#84cc16] outline-none"/></label><label className="block"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chave PIX</span><input value={local.chavePix || ""} onChange={e=>setLocal({...local, chavePix:e.target.value})} placeholder="E-mail, CPF ou Aleatória" className="w-full border-2 border-slate-100 p-4 rounded-2xl font-black focus:border-[#84cc16] outline-none"/></label></div></div>)}
                {step === 3 && (<div><h2 className="text-3xl font-black text-slate-900 mb-2 leading-tight">Finanças Iniciais 🏦</h2><p className="text-slate-500 mb-10 font-medium">Vamos definir o ponto de partida.</p><div className="space-y-6"><label className="block"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mês de Início</span><input type="month" value={local.inicioOperacao ? local.inicioOperacao.substring(0,7) : new Date().toISOString().slice(0, 7)} onChange={e => setLocal({...local, inicioOperacao: `${e.target.value}-01`})} className="w-full border-2 border-slate-100 p-4 rounded-2xl font-black focus:border-[#84cc16] outline-none"/></label><label className="block"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saldo Atual em Caixa (R$)</span><input type="number" value={safeNum(local.saldoInicial)} onChange={e=>setLocal({...local, saldoInicial:Number(e.target.value)})} className="w-full border-2 border-slate-100 p-4 rounded-2xl font-black text-green-600 focus:border-[#84cc16] outline-none"/></label></div></div>)}
                {step === 4 && (<div><h2 className="text-3xl font-black text-slate-900 mb-2 leading-tight">Gerador de Aptos 🏠</h2><p className="text-slate-500 mb-6 font-medium">Gere os números automaticamente.</p><div className="bg-slate-50 p-4 rounded-2xl border mb-6"><div className="grid grid-cols-3 gap-2 mb-4"><input placeholder="Blocos (A,B)" value={blocos} onChange={e=>setBlocos(e.target.value)} className="p-2 border rounded-lg text-xs font-bold"/><input placeholder="Andares (ex: 5)" type="number" value={andares} onChange={e=>setAndares(e.target.value)} className="p-2 border rounded-lg text-xs font-bold"/><input placeholder="Aptos/Andar" type="number" value={aptosPorAndar} onChange={e=>setAptosPorAndar(e.target.value)} className="p-2 border rounded-lg text-xs font-bold"/></div><div className="flex items-center gap-4 mb-4"><label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer"><input type="radio" checked={usarZero} onChange={()=>setUsarZero(true)} className="accent-[#1e293b]"/> Estilo: 101, 102...</label><label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer"><input type="radio" checked={!usarZero} onChange={()=>setUsarZero(false)} className="accent-[#1e293b]"/> Estilo: 11, 12...</label></div><button onClick={gerarApartamentos} className="w-full bg-[#1e293b] text-white py-2 rounded-lg font-black text-xs uppercase">Gerar Lista</button></div><div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">{listaGerada.map((a,i) => (<div key={i} className="bg-white border px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">{a} <button onClick={()=>setListaGerada(listaGerada.filter(x=>x!==a))} className="text-red-500"><X size={12}/></button></div>))} {listaGerada.length===0 && <p className="text-slate-400 text-xs italic">Lista vazia.</p>}</div></div>)}
                <div className="mt-10 flex flex-col gap-4"><button disabled={saving} onClick={nextStep} className="w-full bg-[#1e293b] text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-2xl transition active:scale-95 disabled:opacity-50">{saving ? <RefreshCw className="animate-spin"/> : (step === 4 ? 'FINALIZAR SETUP' : 'PRÓXIMO')} <ArrowRight size={20}/></button>{step === 1 && <button onClick={onDemo} className="w-full text-sm font-black text-[#84cc16] py-3 flex items-center justify-center gap-2 hover:bg-slate-50 rounded-xl transition uppercase tracking-tighter"><Sparkles size={16}/> Gerar dados de teste</button>}</div>
            </div>
        </div>
    );
}

function ModalConfiguracoes({ config, setConfig, onClose, triggerConfirm, resetar, despesas, showToast, exportarBackup, importarBackup }) {
  const [local, setLocal] = useState({...config});
  const [activeTab, setActiveTab] = useState('geral');
  const [bloqueado, setBloqueado] = useState(true);
  const [novaCat, setNovaCat] = useState('');

  return (
    <div className="fixed inset-0 bg-[#1e293b]/80 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm text-left">
       <div className="bg-white rounded-[32px] w-full max-w-2xl p-0 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
          <div className="bg-[#1e293b] p-6 text-white text-center"><h3 className="font-black text-xl tracking-tighter mb-4">Ajustes & Configuração</h3><div className="flex gap-1 justify-center bg-black/20 p-1 rounded-xl overflow-x-auto"><button onClick={() => setActiveTab('geral')} className={`flex-1 min-w-[80px] py-2 rounded-lg text-[10px] font-black uppercase transition ${activeTab === 'geral' ? 'bg-[#84cc16] text-[#1e293b]' : 'text-slate-400 hover:text-white'}`}>🏢 Geral</button><button onClick={() => setActiveTab('cats')} className={`flex-1 min-w-[80px] py-2 rounded-lg text-[10px] font-black uppercase transition ${activeTab === 'cats' ? 'bg-[#84cc16] text-[#1e293b]' : 'text-slate-400 hover:text-white'}`}>🏷️ Categorias</button><button onClick={() => setActiveTab('sistema')} className={`flex-1 min-w-[80px] py-2 rounded-lg text-[10px] font-black uppercase transition ${activeTab === 'sistema' ? 'bg-[#84cc16] text-[#1e293b]' : 'text-slate-400 hover:text-white'}`}>⚙️ Sistema</button></div></div>
          <div className="p-6 overflow-y-auto flex-1">
              {activeTab === 'geral' && (<div className="space-y-4"><div className="flex justify-between items-center mb-3 border-b pb-2"><span className="text-[10px] font-black uppercase text-slate-500">Dados do Prédio</span><button onClick={() => setBloqueado(!bloqueado)} className={`text-[9px] font-black border px-2 py-1 rounded flex items-center gap-1 ${bloqueado ? 'bg-slate-100 text-slate-500' : 'bg-white border-red-200 text-red-500'}`}>{bloqueado ? <Lock size={10}/> : <Unlock size={10}/>} {bloqueado ? 'BLOQUEADO' : 'EDITANDO'}</button></div><div className={`space-y-4 ${bloqueado ? 'opacity-50 pointer-events-none' : ''}`}><label className="block"><span className="text-[10px] font-black text-slate-400 uppercase">Nome Prédio</span><input value={local.predioNome} onChange={e=>setLocal({...local, predioNome:e.target.value})} className="w-full border-2 border-slate-100 p-3 rounded-xl font-bold outline-none"/></label><div className="grid grid-cols-2 gap-4"><label className="block"><span className="text-[10px] font-black text-slate-400 uppercase">Valor Cond.</span><input type="number" value={local.valorCondominio} onChange={e=>setLocal({...local, valorCondominio:Number(e.target.value)})} className="w-full border-2 border-slate-100 p-3 rounded-xl font-bold outline-none"/></label><label className="block"><span className="text-[10px] font-black text-slate-400 uppercase">Dia Venc.</span><input type="number" value={local.diaVencimento} onChange={e=>setLocal({...local, diaVencimento:Number(e.target.value)})} className="w-full border-2 border-slate-100 p-3 rounded-xl font-bold outline-none"/></label></div><label className="block"><span className="text-[10px] font-black text-slate-400 uppercase">WhatsApp Síndico</span><input value={local.telefoneSindico} onChange={e=>setLocal({...local, telefoneSindico:e.target.value})} className="w-full border-2 border-slate-100 p-3 rounded-xl font-bold outline-none"/></label><label className="block"><span className="text-[10px] font-black text-slate-400 uppercase">Chave Pix</span><input value={local.chavePix} onChange={e=>setLocal({...local, chavePix:e.target.value})} className="w-full border-2 border-slate-100 p-3 rounded-xl font-bold outline-none"/></label></div></div>)}
              {activeTab === 'cats' && (<div className="space-y-4"><p className="text-xs text-slate-500 mb-2">Adicione ou remova categorias de despesas.</p><div className="flex gap-2"><input value={novaCat} onChange={e=>setNovaCat(e.target.value)} placeholder="Nova Categoria..." className="flex-1 border-2 border-slate-100 p-3 rounded-xl text-sm font-bold outline-none"/><button onClick={() => {if(novaCat) { setLocal({...local, categorias: [...local.categorias, novaCat]}); setNovaCat(''); }}} className="bg-[#84cc16] text-[#1e293b] p-3 rounded-xl font-black"><PlusCircle size={18}/></button></div><div className="flex flex-wrap gap-2">{local.categorias.map(c => <span key={c} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-2">{c} <button onClick={() => {if (CATEGORIAS_PADRAO.includes(c)) { showToast(`"${c}" é padrão do sistema.`, 'error'); return; } const emUso = despesas.some(d => d.categoria === c); if(emUso) { showToast(`Categoria "${c}" em uso!`, 'error'); return; } setLocal({...local, categorias: local.categorias.filter(x => x !== c)})}} className="text-red-400 hover:text-red-600"><X size={12}/></button></span>)}</div></div>)}
              {activeTab === 'sistema' && (<div className="space-y-4"><div className="flex justify-between items-center mb-3 border-b pb-2"><span className="text-[10px] font-black uppercase text-slate-500">Backup & Reset</span></div>
                  <div className="grid grid-cols-2 gap-4">
                      <button onClick={exportarBackup} className="bg-blue-50 text-blue-600 p-4 rounded-2xl font-bold text-xs flex flex-col items-center gap-2 hover:bg-blue-100"><Download size={24}/> Baixar Backup (JSON)</button>
                      <label className="bg-green-50 text-green-600 p-4 rounded-2xl font-bold text-xs flex flex-col items-center gap-2 hover:bg-green-100 cursor-pointer"><Upload size={24}/> Restaurar Backup <input type="file" onChange={importarBackup} className="hidden" accept=".json"/></label>
                  </div>
                  <div className="pt-4 border-t border-slate-100"><button onClick={() => triggerConfirm({ titulo: "Resetar Tudo?", texto: "Isso apagará TODOS os dados atuais. Irreversível.", onConfirm: () => { resetar(); triggerConfirm(null); } })} className="w-full py-4 text-red-500 font-black text-xs uppercase flex items-center justify-center gap-2 hover:bg-red-50 rounded-xl transition"><RotateCcw size={16}/> Reiniciar Configuração (Reset)</button></div></div>)}
          </div>
          <div className="p-6 bg-slate-50 border-t flex gap-3 shrink-0"><button onClick={onClose} className="flex-1 py-4 text-slate-400 font-bold text-xs uppercase">Cancelar</button><button onClick={() => { setConfig(local); onClose(); }} className="flex-1 bg-[#84cc16] text-[#1e293b] rounded-2xl font-black text-xs shadow-xl">SALVAR</button></div>
       </div>
    </div>
  );
}

function ModalReceber({ valorSugerido, onCancel, onConfirm, supabase }) { 
    const [uploading, setUploading] = useState(false);
    const [url, setUrl] = useState('');
    const handleUpload = async (e) => {
        try { setUploading(true); const file = e.target.files[0]; if(!file) return; const ext = file.name.split('.').pop(); const name = `${Date.now()}.${ext}`; await supabase.storage.from('comprovantes').upload(name, file); const {data} = supabase.storage.from('comprovantes').getPublicUrl(name); setUrl(data.publicUrl); } catch(err){console.error(err)} finally {setUploading(false)}
    }
    return <div className="fixed inset-0 bg-[#1e293b]/80 z-[10000] flex items-center justify-center p-4 backdrop-blur-sm text-left"><div className="bg-white rounded-3xl w-full max-w-xs p-8 shadow-2xl"><h3 className="font-black text-slate-900 text-xl mb-6">Receber Pagamento</h3><div className="space-y-5"><label className="block"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor Recebido</span><input type="number" defaultValue={valorSugerido} id="valPag" className="w-full border-2 border-slate-100 p-4 rounded-2xl font-black text-green-600 outline-none focus:border-[#84cc16]" /></label><label className="block"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</span><input type="date" defaultValue={new Date().toISOString().split('T')[0]} id="datPag" className="w-full border-2 border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-[#84cc16]" /></label>
    
    <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col items-center justify-center gap-2 p-4 border border-slate-200 rounded-2xl hover:bg-slate-50 cursor-pointer">
            <Camera className="text-slate-400"/>
            <span className="text-[10px] font-black uppercase text-slate-500">Tirar Foto</span>
            <input type="file" capture="environment" accept="image/*" onChange={handleUpload} className="hidden"/>
        </label>
        <label className="flex flex-col items-center justify-center gap-2 p-4 border border-slate-200 rounded-2xl hover:bg-slate-50 cursor-pointer">
            <ImageSimple className="text-slate-400"/>
            <span className="text-[10px] font-black uppercase text-slate-500">Galeria</span>
            <input type="file" accept="image/*,application/pdf" onChange={handleUpload} className="hidden"/>
        </label>
    </div>
    {url && <div className="text-center text-xs font-bold text-green-600 bg-green-50 p-2 rounded-lg flex items-center justify-center gap-2"><CheckCircle size={14}/> Comprovante Anexado!</div>}
    {uploading && <div className="text-center"><RefreshCw className="animate-spin inline text-slate-400"/></div>}

    <div className="flex gap-3 pt-4"><button onClick={onCancel} className="flex-1 text-slate-400 font-black text-xs uppercase">Cancelar</button><button onClick={() => onConfirm(Number(document.getElementById('valPag').value), document.getElementById('datPag').value.split('-').reverse().join('/'), url)} className="flex-2 bg-[#84cc16] text-[#1e293b] py-4 rounded-2xl font-black shadow-lg flex-1">Confirmar</button></div></div></div></div>; 
}

function ModalDetalhesUnidade({ dados, sindica, chavePix, onAdd, onDelete, onClose, copiarTexto, fmt, supabase }) { 
    const [novoValor, setNovoValor] = useState(''); const [novaData, setNovaData] = useState(new Date().toISOString().split('T')[0]); const [url, setUrl] = useState('');
    const handleUpload = async (e) => { const file = e.target.files[0]; if(!file) return; const name = `${Date.now()}.${file.name.split('.').pop()}`; await supabase.storage.from('comprovantes').upload(name, file); const {data} = supabase.storage.from('comprovantes').getPublicUrl(name); setUrl(data.publicUrl); }
    return <div className="fixed inset-0 bg-[#1e293b]/90 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm text-left"><div className="bg-white rounded-[32px] w-full max-w-sm p-8 shadow-2xl"><div className="flex justify-between items-center mb-6"><div><h3 className="font-black text-xl text-slate-900 tracking-tighter">Extrato Apto {dados.u.numero}</h3><p className="text-xs font-bold text-slate-400 uppercase">{dados.mes}/{dados.ano}</p></div><button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100"><X size={24}/></button></div><div className="space-y-4 mb-6 max-h-48 overflow-y-auto">{dados.pags.map(p => (<div key={p.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100"><div><p className="font-black text-slate-700 text-sm flex items-center gap-2">{fmt(p.valor)} {p.url_comprovante && <a href={p.url_comprovante} target="_blank" className="text-blue-500"><Paperclip size={12}/></a>}</p><p className="text-[10px] text-slate-400 font-bold uppercase">Pago em {p.data}</p></div><button onClick={() => onDelete(p.id)} className="text-red-300 hover:text-red-500 p-2"><Trash2 size={16}/></button></div>))}{dados.pags.length === 0 && <p className="text-center text-slate-400 text-xs italic">Nenhum pagamento.</p>}</div><div className="pt-6 border-t border-slate-100"><p className="text-[10px] font-black text-slate-400 uppercase mb-2">Adicionar Pagamento</p><div className="flex gap-2 mb-2"><input type="number" placeholder="Valor" value={novoValor} onChange={e=>setNovoValor(e.target.value)} className="w-1/2 border-2 border-slate-100 p-3 rounded-xl font-bold text-sm outline-none"/><input type="date" value={novaData} onChange={e=>setNovaData(e.target.value)} className="w-1/2 border-2 border-slate-100 p-3 rounded-xl font-bold text-xs outline-none"/></div><label className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400 mb-2 cursor-pointer">{url ? 'Comprovante OK' : 'Anexar Foto'}<input type="file" onChange={handleUpload} className="hidden"/></label><button onClick={() => {if(novoValor) onAdd(Number(novoValor), novaData.split('-').reverse().join('/'), url)}} className="w-full bg-[#1e293b] text-white py-3 rounded-xl font-black text-xs shadow-lg"><PlusCircle size={16} className="mx-auto"/></button></div></div></div>; 
}

function ModalDespesa({ supabase, onClose, onSave, despesaParaEditar = null, planoAtual, abrirConfig, categorias, triggerConfirm }) { 
    const hojeYMD = new Date().toISOString().split('T')[0];
    const [desc, setDesc] = useState(despesaParaEditar ? despesaParaEditar.descricao : ''); 
    const [val, setVal] = useState(despesaParaEditar ? despesaParaEditar.valor : ''); 
    const [cat, setCat] = useState(despesaParaEditar ? despesaParaEditar.categoria : (categorias[0] || 'Outros')); 
    const [data, setData] = useState(despesaParaEditar ? despesaParaEditar.data.split('/').reverse().join('-') : hojeYMD); 
    const [pago, setPago] = useState(despesaParaEditar ? despesaParaEditar.pago : false);
    const [url, setUrl] = useState(despesaParaEditar ? despesaParaEditar.url_comprovante : '');
    const [repetir, setRepetir] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (event) => {
        try {
            setUploading(true);
            const file = event.target.files[0];
            if (!file) return;
            const fileName = `${Date.now()}.${file.name.split('.').pop()}`;
            await supabase.storage.from('comprovantes').upload(fileName, file);
            const { data } = supabase.storage.from('comprovantes').getPublicUrl(fileName);
            setUrl(data.publicUrl);
        } catch (error) { console.error(error); } finally { setUploading(false); }
    };

    const tentarSalvar = () => {
        if(!desc || !val) return;
        const saveAction = () => onSave({descricao:desc, valor:Number(val), categoria:cat, data, pago, url_comprovante: url}, repetir);
        if(!url && pago) { triggerConfirm({ titulo: "Sem Comprovante", texto: "Salvar sem link de comprovante?", onConfirm: () => { saveAction(); triggerConfirm(null); } }); } else { saveAction(); }
    };

    return <div className="fixed inset-0 bg-[#1e293b]/80 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm text-left"><div className="bg-white rounded-[32px] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in duration-300"><h3 className="font-black text-red-600 text-xl mb-6 flex items-center gap-2 tracking-tighter"><ArrowDownCircle/> {despesaParaEditar ? 'Editar' : 'Lançar'} Despesa</h3><div className="space-y-4"><label className="block text-left"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">O que foi pago?</span><input placeholder="Ex: Manutenção Portão" value={desc} className="w-full border-2 border-slate-100 p-4 rounded-2xl font-black outline-none focus:border-red-400 transition-all" onChange={e=>setDesc(e.target.value)}/></label><div className="flex gap-3 text-left"><label className="w-1/2 block text-left"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Valor</span><input type="number" placeholder="0,00" value={val} className="w-full border-2 border-slate-100 p-4 rounded-2xl font-black text-red-600 outline-none focus:border-red-400" onChange={e=>setVal(e.target.value)}/></label><label className="w-1/2 block text-left"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Data</span><input type="date" value={data} className="w-full border-2 border-slate-100 p-4 rounded-2xl font-bold text-xs outline-none" onChange={e=>setData(e.target.value)}/></label></div><label className="block text-left"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Categoria</span><div className="flex gap-2"><select className="w-full border-2 border-slate-100 p-4 rounded-2xl bg-white font-black outline-none focus:border-red-400" onChange={e=>setCat(e.target.value)} value={cat}>{categorias.map(c=><option key={c} value={c}>{c}</option>)}</select><button onClick={abrirConfig} className="bg-slate-100 px-4 rounded-2xl text-slate-500 hover:bg-slate-200"><PlusCircle size={20}/></button></div></label>
    
    <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col items-center justify-center gap-2 p-4 border border-slate-200 rounded-2xl hover:bg-slate-50 cursor-pointer">
            <Camera className="text-slate-400"/>
            <span className="text-[10px] font-black uppercase text-slate-500">Tirar Foto</span>
            <input type="file" capture="environment" accept="image/*" onChange={handleUpload} className="hidden"/>
        </label>
        <label className="flex flex-col items-center justify-center gap-2 p-4 border border-slate-200 rounded-2xl hover:bg-slate-50 cursor-pointer">
            <ImageSimple className="text-slate-400"/>
            <span className="text-[10px] font-black uppercase text-slate-500">Galeria</span>
            <input type="file" accept="image/*,application/pdf" onChange={handleUpload} className="hidden"/>
        </label>
    </div>
    {url && <div className="text-center text-xs font-bold text-green-600 bg-green-50 p-2 rounded-lg flex items-center justify-center gap-2"><CheckCircle size={14}/> Comprovante Anexado!</div>}
    {uploading && <div className="text-center"><RefreshCw className="animate-spin inline text-slate-400"/></div>}

    <div className="flex items-center gap-3 p-4 border-2 rounded-2xl bg-slate-50 cursor-pointer hover:bg-slate-100 transition text-left"><input type="checkbox" checked={pago} onChange={e=>setPago(e.target.checked)} className="w-5 h-5 rounded-md accent-red-500"/><span className="text-[10px] font-black text-slate-800 uppercase tracking-tighter block">Já foi pago?</span></div>{!despesaParaEditar && (<label className="flex items-center gap-3 p-4 border-2 rounded-2xl bg-slate-50 cursor-pointer hover:bg-slate-100 transition text-left"><input type="checkbox" checked={repetir} onChange={e=>setRepetir(e.target.checked)} className="w-5 h-5 rounded-md accent-red-500"/><div><span className="text-[10px] font-black text-slate-800 uppercase tracking-tighter block">Repetir mensalmente</span><span className="text-[9px] font-medium text-slate-400">Gera cópias até Dezembro</span></div></label>)}<div className="flex gap-2 pt-6"><button onClick={onClose} className="flex-1 py-4 text-slate-400 font-bold text-xs uppercase">Cancelar</button><button onClick={tentarSalvar} className="flex-2 bg-red-500 text-white py-4 rounded-2xl font-black shadow-xl flex-1 transition active:scale-95">SALVAR</button></div></div></div></div>; 
}

// ... Rest of the components (ModalEditarUnidade, ModalRelatorio, ModalZeladoria, etc.) remain unchanged ...

function ModalEditarUnidade({ u, onClose, onSave, ativarModoMorador, showToast, config, copiarTexto }) { 
    const [dados, setDados] = useState({...u}); 
    const [moraProp, setMoraProp] = useState(u.mora_proprietario);
    
    // Auto-update logic: Se Proprietário Mora = True, copia dados
    useEffect(() => {
        if(moraProp) {
            setDados(prev => ({...prev, inquilino: {...prev.proprietario}, mora_proprietario: true}));
        } else {
            setDados(prev => ({...prev, mora_proprietario: false}));
        }
    }, [moraProp]);

    const up = (field, val, isProp) => { 
        if(isProp) {
            const novoProp = {...(dados.proprietario || {}), [field]:val};
            setDados(prev => {
                const newState = {...prev, proprietario: novoProp};
                if(moraProp) newState.inquilino = novoProp; // Sync instantâneo
                return newState;
            });
        } else {
            if(!moraProp) setDados({...dados, inquilino:{...(dados.inquilino || {}), [field]:val}});
        }
    };

    const gerarLinkConvite = () => {
        const link = `${window.location.origin + window.location.pathname}?invite=${u.numero}`;
        const msg = `🏢 *${config.predioNome}*\n\nOlá! Segue seu link de acesso exclusivo para o *Apto ${u.numero}*.\n\n🔗 Clique para entrar: ${link}`;
        copiarTexto(msg); window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank'); showToast('Link de convite gerado!');
    };
    return (
        <div className="fixed inset-0 bg-[#1e293b]/80 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm text-left">
            <div className="bg-white rounded-[32px] w-full max-w-sm p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6"><h3 className="font-black text-2xl tracking-tighter text-slate-900 text-left">Apto {safeStr(u.numero)}</h3>{dados.linked_user_id ? ( <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-1 rounded-full flex items-center gap-1 uppercase"><UserCheck size={10}/> Vinculado</span> ) : ( <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-1 rounded-full flex items-center gap-1 uppercase"><UserX size={10}/> Aguardando</span> )}</div>
                <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left">
                        <p className="text-[10px] font-black text-[#1e293b] uppercase mb-2 tracking-widest opacity-50 text-left">Proprietário (Dono)</p>
                        <input placeholder="Nome" value={safeStr(dados.proprietario?.nome)} onChange={e=>up('nome', e.target.value, true)} className="w-full border p-2 rounded-lg font-bold text-sm mb-2 outline-none focus:border-[#84cc16]"/>
                        <input placeholder="WhatsApp" value={safeStr(dados.proprietario?.telefone)} onChange={e=>up('telefone', e.target.value, true)} className="w-full border p-2 rounded-lg font-bold text-sm outline-none focus:border-[#84cc16]"/>
                    </div>
                    <label className="flex items-center gap-3 p-3 bg-white border rounded-xl cursor-pointer shadow-sm"><input type="checkbox" checked={moraProp} onChange={e=>setMoraProp(e.target.checked)} className="accent-[#84cc16] w-5 h-5 rounded"/> <span className="text-xs font-bold text-slate-600">O proprietário reside no imóvel?</span></label>
                    {!moraProp && (
                        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-left animate-in fade-in">
                             <p className="text-[10px] font-black text-blue-900 uppercase mb-2 tracking-widest opacity-50 text-left">Inquilino (Morador Atual)</p>
                             <input placeholder="Nome" value={safeStr(dados.inquilino?.nome)} onChange={e=>up('nome', e.target.value, false)} className="w-full border p-2 rounded-lg font-bold text-sm mb-2 outline-none focus:border-blue-400"/>
                             <input placeholder="WhatsApp" value={safeStr(dados.inquilino?.telefone)} onChange={e=>up('telefone', e.target.value, false)} className="w-full border p-2 rounded-lg font-bold text-sm outline-none focus:border-blue-400"/>
                        </div>
                    )}
                    <button onClick={ativarModoMorador} className="w-full py-3 bg-blue-50 text-blue-600 rounded-xl font-black text-xs flex items-center justify-center gap-2 hover:bg-blue-100 transition"><Eye size={16}/> Ver como Morador</button>
                    {!dados.linked_user_id ? ( <button onClick={gerarLinkConvite} className="w-full bg-[#84cc16] text-[#1e293b] py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-lg hover:bg-[#a3e635] transition"><Link2 size={16}/> CONVITE DE ACESSO</button> ) : ( <button onClick={() => onSave({ ...dados, linked_user_id: null })} className="w-full py-3 border border-red-200 text-red-500 rounded-xl font-black text-xs hover:bg-red-50">REMOVER ACESSO DO APP</button> )}
                    <div className="flex gap-3 pt-2"><button onClick={() => onSave(dados)} className="flex-1 bg-[#1e293b] text-white py-4 rounded-2xl font-black shadow-xl transition active:scale-95">SALVAR</button></div>
                </div>
                <button onClick={onClose} className="w-full mt-4 text-slate-400 font-bold text-xs uppercase">Cancelar</button>
            </div>
        </div>
    ); 
}

function ModalRelatorio({ receita, despesa, saldo, despesas, unidades, pagamentos, mes, ano, config, onClose, fmt }) {
    // PRESTAÇÃO DE CONTAS - LÓGICA DE PREVISÃO
    // Mostra TODOS os apartamentos. Se pagou, mostra data e verde. Se não, mostra pendente e vermelho.
    const listaCompletaPagamentos = useMemo(() => {
        return unidades.map(u => {
            const pagou = pagamentos.find(p => p.unidade_id === u.id && p.mes === mes && String(p.ano) === String(ano));
            return {
                numero: u.numero,
                data: pagou ? pagou.data : '-',
                valor: pagou ? pagou.valor : 0,
                status: pagou ? 'ok' : 'pendente'
            };
        }).sort((a,b) => a.numero.localeCompare(b.numero, undefined, {numeric: true}));
    }, [unidades, pagamentos, mes, ano]);

    return (
        <div className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white border border-slate-200 p-8 shadow-2xl h-[90vh] overflow-y-auto print:h-auto print:border-none print:shadow-none">
                <div className="flex justify-between items-center mb-8 border-b pb-4">
                    <div className="flex items-center gap-4"><Logo variant="simple" width="w-24"/><div className="h-8 w-px bg-slate-200"></div><div><h1 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Prestação de Contas</h1><p className="text-xs text-slate-500 font-bold">{config.predioNome} • {mes}/{ano}</p></div></div>
                    <button onClick={onClose} className="bg-slate-100 p-2 rounded-full no-print"><X size={20}/></button>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100"><p className="text-[10px] uppercase font-black text-slate-400">Arrecadação</p><p className="text-xl font-black text-green-600">{fmt(receita)}</p></div>
                    <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100"><p className="text-[10px] uppercase font-black text-slate-400">Gastos</p><p className="text-xl font-black text-red-600">{fmt(despesa)}</p></div>
                    <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100"><p className="text-[10px] uppercase font-black text-slate-400">Saldo Final</p><p className="text-xl font-black text-slate-800">{fmt(saldo)}</p></div>
                </div>

                <h3 className="font-black text-sm uppercase mb-4 border-b pb-2 flex items-center gap-2"><ArrowUpCircle size={16} className="text-green-500"/> Detalhamento de Receitas</h3>
                <table className="w-full text-xs text-left mb-8">
                    <thead><tr className="border-b bg-slate-50"><th className="py-2 pl-2 rounded-l-lg">Apto</th><th>Data Pagto</th><th className="text-right pr-2 rounded-r-lg">Valor</th></tr></thead>
                    <tbody>
                        {listaCompletaPagamentos.map((p,i) => (
                            <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                                <td className="py-2 pl-2 font-black text-slate-800">{p.numero}</td>
                                <td className={`py-2 font-bold ${p.status==='ok'?'text-green-600':'text-red-400'}`}>{p.status==='ok' ? p.data : 'PENDENTE'}</td>
                                <td className="py-2 pr-2 text-right font-black text-slate-800">{p.status==='ok' ? fmt(p.valor) : '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <h3 className="font-black text-sm uppercase mb-4 border-b pb-2 flex items-center gap-2"><ArrowDownCircle size={16} className="text-red-500"/> Detalhamento de Despesas</h3>
                {despesas.length > 0 ? (
                    <table className="w-full text-xs text-left">
                        <thead><tr className="border-b bg-slate-50"><th className="py-2 pl-2 rounded-l-lg">Data</th><th>Descrição</th><th>Categoria</th><th className="text-right pr-2 rounded-r-lg">Valor</th></tr></thead>
                        <tbody>
                            {despesas.map((d,i) => (
                                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                                    <td className="py-2 pl-2 font-bold text-slate-500">{d.data}</td>
                                    <td className="py-2 font-bold text-slate-800">{d.descricao} {d.pago === false && <span className="text-red-400 text-[9px] uppercase">(Pendente)</span>}</td>
                                    <td className="py-2 text-slate-500"><span className="bg-slate-100 px-2 py-1 rounded text-[10px] uppercase font-black">{d.categoria}</span></td>
                                    <td className="py-2 pr-2 text-right font-black text-slate-800">{fmt(d.valor)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : <p className="text-xs text-slate-400 italic">Nenhuma despesa lançada.</p>}

                <div className="mt-8 pt-8 border-t text-center no-print">
                    <button onClick={() => window.print()} className="bg-[#1e293b] text-white px-6 py-3 rounded-xl font-black text-xs shadow-lg hover:bg-black transition flex items-center justify-center gap-2 mx-auto"><Printer size={16}/> IMPRIMIR RELATÓRIO</button>
                </div>
            </div>
        </div>
    )
}

function ModalZeladoria({ lista, onClose, onSave, onDelete }) {
    const [item, setItem] = useState('');
    return (
        <div className="fixed inset-0 bg-[#1e293b]/90 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-[32px] w-full max-w-sm p-6 shadow-2xl h-[80vh] flex flex-col">
                <div className="flex justify-between items-center mb-4"><h3 className="font-black text-xl flex items-center gap-2"><Hammer size={20}/> Zeladoria</h3><button onClick={onClose}><X size={20}/></button></div>
                <div className="flex gap-2 mb-4"><input value={item} onChange={e=>setItem(e.target.value)} placeholder="Novo item de manutenção..." className="flex-1 border-2 border-slate-100 p-3 rounded-xl text-sm font-bold outline-none"/><button onClick={() => {if(item) {onSave({item, data: new Date().toLocaleDateString(), concluido: false}); setItem('')}}} className="bg-[#1e293b] text-white p-3 rounded-xl"><PlusCircle/></button></div>
                <div className="flex-1 overflow-y-auto space-y-2">
                    {lista.map(z => (
                        <div key={z.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                            <span className="font-bold text-sm text-slate-700">{z.item}</span>
                            <button onClick={()=>onDelete(z.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                        </div>
                    ))}
                    {lista.length===0 && <p className="text-center text-slate-400 text-xs mt-10">Lista vazia.</p>}
                </div>
            </div>
        </div>
    )
}

function ModalAvisos({ lista, onClose, onSave, onDelete }) {
    const [titulo, setTitulo] = useState(''); const [msg, setMsg] = useState('');
    return (
        <div className="fixed inset-0 bg-[#1e293b]/90 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-[32px] w-full max-w-sm p-6 shadow-2xl h-[80vh] flex flex-col">
                <div className="flex justify-between items-center mb-4"><h3 className="font-black text-xl flex items-center gap-2"><Megaphone size={20}/> Mural</h3><button onClick={onClose}><X size={20}/></button></div>
                <div className="space-y-2 mb-4">
                    <input value={titulo} onChange={e=>setTitulo(e.target.value)} placeholder="Título do Aviso" className="w-full border-2 border-slate-100 p-3 rounded-xl text-sm font-bold outline-none"/>
                    <textarea value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Mensagem..." className="w-full border-2 border-slate-100 p-3 rounded-xl text-sm font-bold outline-none h-20"/>
                    <button onClick={() => {if(titulo && msg) {onSave({titulo, mensagem: msg, data: new Date().toLocaleDateString(), tipo: 'geral'}); setTitulo(''); setMsg('')}}} className="w-full bg-[#1e293b] text-white py-3 rounded-xl font-black text-xs shadow-lg">PUBLICAR AVISO</button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3">
                    {lista.map(a => (
                        <div key={a.id} className="p-4 bg-orange-50 border border-orange-100 rounded-xl relative">
                            <h4 className="font-black text-slate-800 text-sm">{a.titulo}</h4>
                            <p className="text-xs text-slate-600 mt-1">{a.mensagem}</p>
                            <button onClick={()=>onDelete(a.id)} className="absolute top-2 right-2 text-red-300 hover:text-red-500"><Trash2 size={14}/></button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function ModalEnquete({ lista, onClose, onSave }) {
    const [titulo, setTitulo] = useState('');
    return (
        <div className="fixed inset-0 bg-[#1e293b]/90 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-[32px] w-full max-w-sm p-6 shadow-2xl h-[80vh] flex flex-col">
                <div className="flex justify-between items-center mb-4"><h3 className="font-black text-xl flex items-center gap-2"><Vote size={20}/> Votações</h3><button onClick={onClose}><X size={20}/></button></div>
                <div className="flex gap-2 mb-4"><input value={titulo} onChange={e=>setTitulo(e.target.value)} placeholder="Pergunta da votação..." className="flex-1 border-2 border-slate-100 p-3 rounded-xl text-sm font-bold outline-none"/><button onClick={() => {if(titulo) {onSave({titulo, opcoes: {sim:0, nao:0}, ativa: true, data: new Date().toLocaleDateString()}); setTitulo('')}}} className="bg-[#1e293b] text-white p-3 rounded-xl"><PlusCircle/></button></div>
                <div className="flex-1 overflow-y-auto space-y-3">
                    {lista.map(e => (
                        <div key={e.id} className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                            <h4 className="font-black text-slate-800 text-sm mb-2">{e.titulo}</h4>
                            <div className="flex gap-2">
                                <div className="flex-1 bg-white p-2 rounded-lg text-center border border-blue-100"><span className="text-xs font-bold text-slate-400">SIM</span><p className="font-black text-blue-600">{e.opcoes?.sim || 0}</p></div>
                                <div className="flex-1 bg-white p-2 rounded-lg text-center border border-blue-100"><span className="text-xs font-bold text-slate-400">NÃO</span><p className="font-black text-red-400">{e.opcoes?.nao || 0}</p></div>
                            </div>
                        </div>
                    ))}
                    {lista.length===0 && <p className="text-center text-slate-400 text-xs mt-10">Nenhuma votação ativa.</p>}
                </div>
            </div>
        </div>
    )
}

function ModalInstalar({ onClose }) {
    const [aba, setAba] = useState('android');
    return (
        <div className="fixed inset-0 bg-[#1e293b]/90 z-[9999] flex items-center justify-center p-6 backdrop-blur-md">
            <div className="bg-white rounded-[32px] w-full max-w-sm p-8 shadow-2xl text-center">
                <Smartphone size={48} className="text-[#1e293b] mx-auto mb-4"/>
                <h3 className="font-black text-xl text-[#1e293b] mb-2">Instalar App</h3>
                <div className="flex bg-slate-100 p-1 rounded-xl mb-4"><button onClick={() => setAba('android')} className={`flex-1 py-2 text-xs font-black rounded-lg transition ${aba==='android'?'bg-white shadow-sm text-[#1e293b]':'text-slate-400'}`}>Android</button><button onClick={() => setAba('ios')} className={`flex-1 py-2 text-xs font-black rounded-lg transition ${aba==='ios'?'bg-white shadow-sm text-[#1e293b]':'text-slate-400'}`}>iPhone (iOS)</button></div>
                {aba === 'android' ? ( <div className="text-sm text-slate-500 mb-6 leading-relaxed text-left bg-slate-50 p-4 rounded-xl border border-slate-100"><p className="mb-2">1. Abra o navegador <strong>Google Chrome</strong>.</p><p className="mb-2">2. Toque nos <strong>três pontinhos (⋮)</strong> no canto superior direito.</p><p>3. Selecione <strong>"Instalar aplicativo"</strong>.</p></div> ) : ( <div className="text-sm text-slate-500 mb-6 leading-relaxed text-left bg-slate-50 p-4 rounded-xl border border-slate-100"><p className="mb-2">1. Abra o navegador <strong>Safari</strong>.</p><p className="mb-2">2. Toque no botão <strong>Compartilhar (<Share size={10} className="inline"/>)</strong>.</p><p>3. Toque em <strong>"Adicionar à Tela de Início"</strong>.</p></div> )}
                <button onClick={onClose} className="w-full bg-[#1e293b] text-white py-4 rounded-xl font-black text-xs uppercase shadow-lg">Entendi</button>
            </div>
        </div>
    )
}