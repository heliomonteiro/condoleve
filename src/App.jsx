import React, { useState, useEffect, useMemo } from 'react';
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
  Camera, ArrowLeft, Building, Ticket, AlertCircle, Info, LineChart, PartyPopper,
  Video, KeyRound, Contact, PhoneCall, MonitorPlay, AppWindow, MoveUpRight, Filter, Receipt, BadgeAlert, Wifi, ChevronDown, ChevronUp, PieChart as PieChartIcon, KeySquare
} from 'lucide-react';

// --- CONFIGURAÇÃO SUPABASE ---
const SUPABASE_URL = "https://jtoubtxumtfwrolxrbpf.supabase.co"; 
const SUPABASE_KEY = "sb_publishable_jRaZSrBV1Q75Ftj7OVd_Jg_tozzOju3"; 

// --- CONSTANTES E HELPERS ---
const LOGO_ICON = "https://res.cloudinary.com/dgt5d9xfq/image/upload/v1771380642/logo_compacta_sem_fundo_q97itc.png";
const LOGO_SIMPLE = "https://res.cloudinary.com/dgt5d9xfq/image/upload/v1771271358/CondoLeve_logo_sem_slogan_skb3zu.png";
const LOGO_FULL = "https://res.cloudinary.com/dgt5d9xfq/image/upload/v1771267774/CondoLeve_logo_com_slogan_qfgedb.png";

const CHART_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#f43f5e', '#84cc16'];
const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const CATEGORIAS_PADRAO = ['Água', 'Luz', 'Limpeza', 'Manutenção', 'Jardinagem', 'Administrativo', 'Outros', 'Fundo de Reserva'];

const INFO_UTEIS_PADRAO = [
    { id: '1', nome: 'Polícia Militar', numero: '190' },
    { id: '2', nome: 'SAMU (Ambulância)', numero: '192' },
    { id: '3', nome: 'Corpo de Bombeiros', numero: '193' },
    { id: '4', nome: 'WiFi Salão de Festas', numero: 'Senha: 123' }
];

const safeStr = (val) => val ? String(val) : "";
const safeNum = (val) => Number(val) || 0;
const formatarMoeda = (val) => safeNum(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const formatarInteiro = (val) => Math.round(safeNum(val)).toLocaleString('pt-BR');
const generateId = () => crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + Math.random().toString().slice(2);

const gerarHashVerificador = (unidadeId, valor, dataStr) => {
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

const getMonthKey = (mesStr, anoNum) => parseInt(anoNum) * 100 + MESES.indexOf(mesStr);
const getAbsoluteMonthIndex = (year, month) => year * 12 + month;

const maskPhone = (v) => {
    v = v.replace(/\D/g, "");
    if (v.length <= 11) v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
    if (v.length <= 11) v = v.replace(/(\d)(\d{4})$/, "$1-$2");
    return v.substring(0, 15);
};

const useMetaTags = (config) => {
  useEffect(() => {
    if (!config?.predioNome) return;
    document.title = `${config.predioNome} - CondoLeve`;
  }, [config?.predioNome]);
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

const Card = ({ children, className = "" }) => <div className={`bg-white rounded-3xl shadow-sm border border-slate-100 ${className}`}>{children}</div>;

const EmptyState = ({ icon: Icon, title, desc, action, label }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center px-4 bg-white rounded-3xl border-2 border-dashed border-slate-100">
        <div className="bg-slate-50 p-4 rounded-full mb-4 text-slate-300"><Icon size={32}/></div>
        <h3 className="font-black text-slate-700 text-sm mb-1">{title}</h3>
        <p className="text-xs text-slate-400 max-w-[200px] mb-6 leading-relaxed">{desc}</p>
        {action && <button onClick={action} className="bg-[#1e293b] text-white px-6 py-3 rounded-xl font-black text-xs shadow-lg hover:bg-black transition">{label}</button>}
    </div>
);

const ToastContainer = ({ toasts, removeToast }) => (
  <div className="fixed top-4 left-0 right-0 z-[10050] flex flex-col items-center gap-2 pointer-events-none px-4 no-print">
    {toasts.map(t => (
      <div key={t.id} className={`pointer-events-auto animate-in slide-in-from-top-2 fade-in duration-300 shadow-2xl rounded-2xl px-6 py-4 flex items-center gap-3 min-w-[300px] max-w-sm border ${t.type === 'error' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-[#1e293b] border-slate-800 text-white'}`}>
        {t.type === 'error' ? <XCircle size={20}/> : <CheckCircle size={20} className="text-[#84cc16]"/>}
        <span className="font-bold text-xs flex-1 text-left">{safeStr(t.msg)}</span>
        <button onClick={() => removeToast(t.id)}><X size={14} className="opacity-50 hover:opacity-100"/></button>
      </div>
    ))}
  </div>
);

const NavBtn = ({ active, onClick, icon, label, badgeCount }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition relative ${active ? 'text-[#84cc16] scale-110' : 'text-slate-400 hover:text-slate-600'}`}>
      <div className="relative">
          {icon}
          {badgeCount > 0 && <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[8px] font-black w-3.5 h-3.5 flex items-center justify-center rounded-full border border-white">{badgeCount}</span>}
      </div>
      <span className="text-[9px] font-black uppercase tracking-wide">{label}</span>
  </button>
);

// --- APP PRINCIPAL ---
export default function App() {
  const [supabase, setSupabase] = useState(null);
  const [session, setSession] = useState(null);
  const [contexto, setContexto] = useState(null); 
  const [libLoaded, setLibLoaded] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [inviteData, setInviteData] = useState(null);

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
      if (params.get('invite') && params.get('c')) {
          setInviteData({ numero: params.get('invite'), cId: params.get('c') });
      }
      
      client.auth.getSession().then(({ data: { session } }) => {
          setSession(session);
      });

      const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
          setSession(session);
          if(!session) setContexto(null);
          // Se o usuário veio de um link de recuperação de senha, ele estará logado e o evento é PASSWORD_RECOVERY
          if (event === 'PASSWORD_RECOVERY') {
              showToast("Bem-vindo de volta! Acesse as Configurações e altere sua senha no seu Perfil.");
          }
      });
      return () => subscription.unsubscribe();
    }
  }, [libLoaded]);

  if (!libLoaded) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><RefreshCw className="animate-spin text-[#84cc16]"/></div>;

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
      {!session ? ( <TelaLogin supabase={supabase} showToast={showToast} inviteData={inviteData} /> ) : !contexto ? ( <SeletorContexto supabase={supabase} session={session} onSelect={setContexto} showToast={showToast} inviteData={inviteData} setInviteData={setInviteData} /> ) : ( <SistemaCondominio supabase={supabase} session={session} contexto={contexto} onSwitch={() => setContexto(null)} showToast={showToast} /> )}
    </>
  );
}

// --- LOGIN ---
function TelaLogin({ supabase, showToast, inviteData }) {
    const [email, setEmail] = useState(''); 
    const [senha, setSenha] = useState(''); 
    const [loading, setLoading] = useState(false); 
    const [modo, setModo] = useState('login'); 

    const handleAcao = async (e) => { 
        e.preventDefault(); 
        setLoading(true); 
        try { 
            if (modo === 'recuperar') {
                const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
                if (error) throw error;
                showToast('Link de recuperação enviado para o seu e-mail!');
                setModo('login');
            } else if (modo === 'cadastro') {
                const { error } = await supabase.auth.signUp({ email, password: senha }); 
                if (error) throw error; 
                showToast('Conta criada! Bem-vindo.');
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password: senha }); 
                if (error) throw error; 
            }
        } catch (error) { 
            showToast(error.message || "Erro de autenticação", 'error'); 
        } finally { 
            setLoading(false); 
        } 
    };

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
         <div className="bg-white p-8 rounded-[40px] shadow-2xl w-full max-w-sm text-center relative overflow-hidden">
            <div className="flex justify-center mb-6"><Logo variant="simple" width="w-48" /></div>
            
            {inviteData && modo === 'login' && ( 
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl mb-6 flex items-center gap-3 text-left animate-in slide-in-from-top-4">
                    <ShieldCheck className="text-blue-500 shrink-0" size={24}/>
                    <div>
                        <p className="text-[10px] font-black text-blue-500 uppercase">Acesso Seguro</p>
                        <p className="text-xs font-bold text-blue-800 tracking-tight leading-tight">Faça login para solicitar acesso ao <b>Apto {inviteData.numero}</b>.</p>
                    </div>
                </div> 
            )}

            <h2 className="text-2xl font-black text-[#1e293b] mb-2">
                {modo === 'cadastro' ? 'Criar Conta' : (modo === 'recuperar' ? 'Recuperar Senha' : 'Bem-vindo')}
            </h2>
            
            {modo === 'recuperar' && <p className="text-xs text-slate-500 font-medium mb-4">Digite seu e-mail abaixo. Enviaremos um link mágico para você redefinir sua senha.</p>}

            <form onSubmit={handleAcao} className="space-y-4 text-left mt-6">
               <div>
                   <label className="text-[10px] font-black uppercase text-slate-400 ml-2">E-mail</label>
                   <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="w-full border-2 border-slate-100 p-4 rounded-2xl font-bold text-sm outline-none focus:border-[#84cc16] transition"/>
               </div>
               {modo !== 'recuperar' && (
                   <div>
                       <div className="flex justify-between items-center pr-2">
                           <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Senha</label>
                           {modo === 'login' && <button type="button" onClick={() => setModo('recuperar')} className="text-[10px] font-black text-[#84cc16] hover:underline">Esqueceu?</button>}
                       </div>
                       <input type="password" required value={senha} onChange={e=>setSenha(e.target.value)} className="w-full border-2 border-slate-100 p-4 rounded-2xl font-bold text-sm outline-none focus:border-[#84cc16] transition"/>
                   </div>
               )}
               
               <button disabled={loading} className="w-full bg-[#1e293b] text-white py-4 rounded-2xl font-black shadow-xl hover:bg-black transition active:scale-95 disabled:opacity-50 mt-2">
                   {loading ? <RefreshCw className="animate-spin mx-auto"/> : (modo === 'cadastro' ? 'CADASTRAR' : (modo === 'recuperar' ? 'ENVIAR LINK MAGICO' : 'ENTRAR'))}
               </button>
            </form>
            
            <div className="mt-6 flex flex-col gap-3">
                {modo === 'login' ? (
                    <button onClick={() => setModo('cadastro')} className="text-xs font-bold text-slate-400 hover:text-[#84cc16] transition">Criar uma conta nova</button>
                ) : (
                    <button onClick={() => setModo('login')} className="text-xs font-bold text-slate-400 hover:text-slate-800 transition flex items-center justify-center gap-1"><ArrowLeft size={14}/> Voltar para o Login</button>
                )}
            </div>
         </div>

         {/* Rodapé SaaS Profissional */}
         <div className="mt-12 text-center opacity-50">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CondoLeve © {new Date().getFullYear()}</p>
             <div className="flex justify-center gap-4 mt-2">
                 <a href="#" className="text-[10px] font-bold text-slate-500 hover:text-slate-800">Termos de Uso</a>
                 <span className="text-slate-300">•</span>
                 <a href="#" className="text-[10px] font-bold text-slate-500 hover:text-slate-800">Privacidade (LGPD)</a>
             </div>
         </div>
      </div>
    );
}

// --- SELETOR & FILA DE APROVAÇÃO ---
function SeletorContexto({ supabase, session, onSelect, showToast, inviteData, setInviteData }) {
    const [vinculos, setVinculos] = useState([]); const [loading, setLoading] = useState(true); const [showWizard, setShowWizard] = useState(false); const [statusFila, setStatusFila] = useState(null);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            try {
                if (inviteData) {
                    showToast(`Enviando solicitação para o Síndico...`);
                    const { data: configTarget } = await supabase.from('config_geral').select('*').eq('condominio_id', inviteData.cId).maybeSingle();
                    if (configTarget) {
                        const dadosApp = configTarget.dados || {}; const fila = dadosApp.filaAprovacao || [];
                        if (!fila.find(f => f.userId === session.user.id)) { fila.push({ id: generateId(), userId: session.user.id, email: session.user.email, numero: inviteData.numero, data: new Date().toLocaleDateString() }); await supabase.from('config_geral').update({ dados: { ...dadosApp, filaAprovacao: fila } }).eq('condominio_id', inviteData.cId); }
                        setStatusFila({ predio: dadosApp.predioNome || 'Condomínio', apto: inviteData.numero });
                    }
                    setInviteData(null); setLoading(false); return; 
                }
                const { data, error } = await supabase.from('vinculos').select('*, condominios(nome), unidades(numero)').eq('user_id', session.user.id);
                if (error) throw error;
                if (data && data.length > 0) { setVinculos(data); if (data.length === 1) onSelect(data[0]); } else { const { data: config } = await supabase.from('config_geral').select('*').eq('user_id', session.user.id).maybeSingle(); if (config && config.condominio_id) { setVinculos([{ id: 'legacy', role: 'sindico', condominio_id: config.condominio_id, condominios: { nome: config.dados.predioNome || 'Meu Condomínio' } }]); } else setShowWizard(true); }
            } catch (err) { setShowWizard(true); } finally { setLoading(false); }
        };
        init();
    }, []);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><RefreshCw className="animate-spin text-[#84cc16]"/></div>;
    if (statusFila) return ( <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 text-center"><div className="bg-white p-8 rounded-[40px] shadow-xl max-w-sm w-full animate-in zoom-in"><div className="bg-orange-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-orange-500"><Clock size={40}/></div><h2 className="text-2xl font-black text-slate-800 mb-2 leading-tight">Aguardando Liberação</h2><p className="text-sm text-slate-500 mb-6 font-medium">Sua solicitação de acesso ao <b>Apto {statusFila.apto}</b> do condomínio <b>{statusFila.predio}</b> foi enviada ao Síndico.</p><button onClick={() => window.location.href = window.location.pathname} className="w-full bg-[#1e293b] text-white py-4 rounded-xl font-black text-xs hover:bg-black transition">VOLTAR AO INÍCIO</button></div></div> );
    if (showWizard) return <SetupWizard supabase={supabase} session={session} onComplete={(v) => onSelect(v)} showToast={showToast} />;

    return (
        <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center">
            <Logo variant="simple" width="w-40" className="mt-10 mb-10" />
            <div className="w-full max-w-md space-y-4">
                <div className="text-center mb-6"><h2 className="text-2xl font-black text-slate-800">Escolha o Acesso</h2></div>
                {vinculos.map(v => (
                    <Card key={v.id} className="overflow-hidden hover:shadow-md transition cursor-pointer group">
                        <button onClick={() => onSelect(v)} className="w-full p-6 flex items-center justify-between text-left">
                            <div className="flex items-center gap-4"><div className={`p-3 rounded-2xl ${v.role === 'sindico' ? 'bg-[#1e293b] text-white' : 'bg-[#84cc16]/10 text-[#1e293b]'}`}>{v.role === 'sindico' ? <Crown size={24}/> : <Home size={24}/>}</div><div><h3 className="font-black text-slate-800 group-hover:text-[#84cc16] transition">{v.condominios?.nome || 'Condomínio'}</h3><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{v.role === 'sindico' ? 'Gestor / Síndico' : `Morador - Apto ${v.unidades?.numero || '?'}`}</p></div></div><ArrowRight className="text-slate-200 group-hover:text-[#84cc16] group-hover:translate-x-1 transition" size={20}/>
                        </button>
                    </Card>
                ))}
                <div className="pt-6 border-t border-slate-200 mt-6 text-center"><button onClick={() => setShowWizard(true)} className="text-xs font-black text-[#84cc16] flex items-center gap-2 mx-auto hover:scale-105 transition"><PlusCircle size={16}/> CRIAR NOVO CONDOMÍNIO</button><button onClick={() => supabase.auth.signOut()} className="mt-10 text-xs font-bold text-slate-300 hover:text-red-500 transition">Sair da conta</button></div>
            </div>
        </div>
    );
}

// --- WIZARD ---
function SetupWizard({ supabase, session, onComplete, showToast }) {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({ nome: '', sindico: '', celular: '', valor: '', pix: '', saldoInicial: '' });
    const [temBlocos, setTemBlocos] = useState(false); const [usarZero, setUsarZero] = useState(true);
    const [blocos, setBlocos] = useState(''); const [andares, setAndares] = useState(''); const [aptosPorAndar, setAptosPorAndar] = useState('');
    const [listaGerada, setListaGerada] = useState([]); const [loading, setLoading] = useState(false); const [insight, setInsight] = useState(null);

    const gerarApartamentos = () => {
        if(!andares || !aptosPorAndar) { showToast("Preencha andares e aptos.", "error"); return; }
        const numAndares = parseInt(andares); const numAptos = parseInt(aptosPorAndar); let novaLista = [];
        const listaBlocos = temBlocos && blocos ? blocos.split(',').map(b => b.trim()).filter(b=>b) : [''];
        listaBlocos.forEach(bloco => { for(let i=1; i<=numAndares; i++) { for(let j=1; j<=numAptos; j++) { const numeroStr = usarZero ? `${i}${String(j).padStart(2, '0')}` : `${i}${j}`; novaLista.push(bloco ? `${bloco}-${numeroStr}` : numeroStr); } } });
        setListaGerada(prev => [...new Set([...prev, ...novaLista])]); showToast(`Foram geradas ${novaLista.length} unidades na lista.`);
    };

    const finalizar = async () => {
        if(listaGerada.length === 0) return showToast("Gere a lista antes!", "error");
        setLoading(true);
        try {
            const hoje = new Date();
            const inicioOp = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
            const valorTaxa = safeNum(form.valor) || 0; const saldoIni = safeNum(form.saldoInicial) || 0;

            const { data: condo, error: e1 } = await supabase.from('condominios').insert({ nome: form.nome, created_by: session.user.id }).select().single(); if (e1) throw e1;
            const { data: vinc, error: e2 } = await supabase.from('vinculos').insert({ user_id: session.user.id, condominio_id: condo.id, role: 'sindico' }).select('*, condominios(nome)').single(); if (e2) throw e2;
            const { error: e3 } = await supabase.from('config_geral').insert({ condominio_id: condo.id, user_id: session.user.id, dados: { predioNome: form.nome, sindicaNome: form.sindico, valorCondominio: valorTaxa, saldoInicial: saldoIni, chavePix: form.pix, telefoneSindico: form.celular, categorias: CATEGORIAS_PADRAO, inicioOperacao: inicioOp, telefonesUteis: INFO_UTEIS_PADRAO, filaAprovacao: [] } }); if (e3) throw e3;
            
            const unitsToInsert = listaGerada.map(n => ({ user_id: session.user.id, condominio_id: condo.id, numero: n, proprietario: {}, inquilino: {}, mora_proprietario: true }));
            await supabase.from('unidades').insert(unitsToInsert);
            
            const potencialMes = listaGerada.length * valorTaxa; let mesesFolego = 0; if (valorTaxa > 0) mesesFolego = (saldoIni / potencialMes).toFixed(1);
            setInsight({ vinc, potencialMes, saldoIni, mesesFolego: parseFloat(mesesFolego) }); setStep(4); 
        } catch (err) { showToast(err.message, 'error'); } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-white z-[10010] flex flex-col p-8 font-sans text-left overflow-y-auto"><div className="max-w-md mx-auto w-full"><div className="mb-10"><Logo variant="simple" width="w-48" /></div>{step < 4 && <div className="flex gap-2 mb-10">{[1,2,3].map(i => <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${step >= i ? 'bg-[#1e293b]' : 'bg-slate-100'}`}></div>)}</div>}
                {step === 1 && (<div className="space-y-6 animate-in slide-in-from-right"><h2 className="text-3xl font-black text-slate-900 leading-tight">Vamos começar seu Condomínio? 🏢</h2><label className="block"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nome do Prédio</span><input value={form.nome} onChange={e=>setForm({...form, nome:e.target.value})} className="w-full border-2 border-slate-100 p-4 rounded-2xl font-black outline-none focus:border-[#84cc16] transition" placeholder="Ex: Edifício Solar"/></label><label className="block"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Seu Nome</span><input value={form.sindico} onChange={e=>setForm({...form, sindico:e.target.value})} className="w-full border-2 border-slate-100 p-4 rounded-2xl font-black outline-none focus:border-[#84cc16] transition" placeholder="Ex: Maria Síndica"/></label><label className="block"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">WhatsApp do Síndico</span><input value={maskPhone(form.celular)} onChange={e=>setForm({...form, celular:maskPhone(e.target.value)})} className="w-full border-2 border-slate-100 p-4 rounded-2xl font-black outline-none focus:border-[#84cc16] transition" placeholder="(11) 99999-9999"/></label><button onClick={()=>setStep(2)} disabled={!form.nome || !form.sindico} className="w-full bg-[#1e293b] text-white py-5 rounded-2xl font-black shadow-2xl disabled:opacity-50 transition active:scale-95">PRÓXIMO PASSO</button></div>)}
                {step === 2 && (<div className="space-y-6 animate-in slide-in-from-right"><div><h2 className="text-3xl font-black text-slate-900 leading-tight mb-2">Financeiro 💰</h2><p className="text-xs text-slate-400 font-bold mb-4">Você pode preencher isso depois se não souber agora.</p></div><div className="flex gap-4"><label className="block w-1/2"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Taxa (R$)</span><input type="number" placeholder="Opcional" value={form.valor} onChange={e=>setForm({...form, valor:e.target.value})} className="w-full border-2 border-slate-100 p-4 rounded-2xl font-black text-green-600 outline-none focus:border-[#84cc16]"/></label><label className="block w-1/2"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Saldo Inicial (R$)</span><input type="number" placeholder="Opcional" value={form.saldoInicial} onChange={e=>setForm({...form, saldoInicial:e.target.value})} className="w-full border-2 border-slate-100 p-4 rounded-2xl font-black text-blue-600 outline-none focus:border-[#84cc16]"/></label></div><label className="block"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Chave PIX do Condomínio</span><input value={form.pix} onChange={e=>setForm({...form, pix:e.target.value})} className="w-full border-2 border-slate-100 p-4 rounded-2xl font-black outline-none focus:border-[#84cc16]" placeholder="Opcional por enquanto"/></label><button onClick={()=>setStep(3)} className="w-full bg-[#1e293b] text-white py-5 rounded-2xl font-black shadow-2xl transition active:scale-95">PULAR OU AVANÇAR</button><button onClick={()=>setStep(1)} className="w-full text-xs font-bold text-slate-400 hover:text-slate-800 transition">Voltar</button></div>)}
                {step === 3 && (<div className="space-y-6 animate-in slide-in-from-right"><h2 className="text-3xl font-black text-slate-900 mb-2 leading-tight">Gerador de Aptos 🏠</h2><div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-6 space-y-4"><label className="flex items-center gap-3 cursor-pointer select-none"><input type="checkbox" checked={temBlocos} onChange={e=>setTemBlocos(e.target.checked)} className="accent-[#84cc16] w-5 h-5 rounded-md"/><span className="text-sm font-bold text-slate-700">O condomínio possui Blocos/Torres?</span></label>{temBlocos && <input placeholder="Ex: Bloco A, Bloco B, Torre 1" value={blocos} onChange={e=>setBlocos(e.target.value)} className="w-full p-4 border-2 border-slate-100 rounded-xl text-sm font-bold outline-none focus:border-[#84cc16] bg-white"/>}<div className="flex gap-2"><input placeholder="Nº de Andares (ex: 5)" type="number" value={andares} onChange={e=>setAndares(e.target.value)} className="w-1/2 p-4 border-2 border-slate-100 rounded-xl text-sm font-bold outline-none focus:border-[#84cc16] bg-white"/><input placeholder="Aptos por Andar (ex: 4)" type="number" value={aptosPorAndar} onChange={e=>setAptosPorAndar(e.target.value)} className="w-1/2 p-4 border-2 border-slate-100 rounded-xl text-sm font-bold outline-none focus:border-[#84cc16] bg-white"/></div><label className="flex items-center gap-3 cursor-pointer select-none pt-2"><input type="checkbox" checked={usarZero} onChange={e=>setUsarZero(e.target.checked)} className="accent-[#84cc16] w-5 h-5 rounded-md"/><div><span className="text-sm font-bold text-slate-700 block">Usar zero na dezena?</span><span className="text-[10px] text-slate-400 font-bold uppercase">{usarZero ? 'Ex: 101, 102...' : 'Ex: 11, 12...'}</span></div></label><button onClick={gerarApartamentos} className="w-full bg-[#1e293b] text-white py-4 rounded-xl font-black text-xs uppercase hover:bg-black transition flex items-center justify-center gap-2 mt-2"><PlusCircle size={16}/> Gerar Lista</button></div><div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 min-h-[100px] items-start content-start">{listaGerada.map((a,i) => ( <div key={i} className="bg-white border border-slate-200 shadow-sm px-4 py-2 rounded-full text-xs font-black text-slate-700 flex items-center gap-2">{a} <button onClick={()=>setListaGerada(listaGerada.filter(x=>x!==a))} className="text-red-400 hover:text-red-600"><X size={14}/></button></div> ))} </div><div className="pt-4"><button onClick={finalizar} disabled={loading || listaGerada.length === 0} className={`w-full py-5 rounded-2xl font-black shadow-2xl transition flex justify-center items-center gap-2 ${listaGerada.length === 0 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-[#84cc16] text-[#1e293b] hover:bg-[#a3e635] active:scale-95'}`}>{loading ? <RefreshCw className="animate-spin"/> : 'FINALIZAR E ENTRAR'}</button><button onClick={()=>setStep(2)} className="w-full mt-4 text-xs font-bold text-slate-400 hover:text-slate-800 transition">Voltar</button></div></div>)}
                {step === 4 && insight && (<div className="space-y-6 text-center animate-in zoom-in duration-500 py-10"><div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><PartyPopper size={48} className="text-green-500"/></div><h2 className="text-3xl font-black text-slate-900 leading-tight mb-2">Tudo Pronto!</h2><p className="text-slate-500 font-medium mb-8">Seu condomínio foi criado e já está pronto para uso.</p>{(insight.potencialMes > 0 || insight.saldoIni > 0) && (<div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl text-left mb-8 relative overflow-hidden"><div className="absolute top-0 right-0 opacity-5 -translate-y-4 translate-x-4"><Activity size={100}/></div><p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10"><Activity size={14}/> Raio-X Financeiro</p>{insight.potencialMes > 0 && (<p className="text-sm font-bold text-slate-700 mb-2 relative z-10">Sua arrecadação potencial é de <span className="text-blue-600 font-black">{formatarMoeda(insight.potencialMes)}/mês</span>.</p>)}{insight.saldoIni > 0 && insight.potencialMes > 0 && (<p className="text-sm font-bold text-slate-700 relative z-10">Com o saldo atual, você tem fôlego para cobrir <span className="bg-blue-200 text-blue-800 px-2 py-0.5 rounded font-black">{insight.mesesFolego} meses</span> de despesas equivalentes à sua arrecadação total.</p>)}</div>)}<button onClick={() => onComplete(insight.vinc)} className="w-full bg-[#1e293b] text-white py-5 rounded-2xl font-black shadow-2xl transition hover:bg-black active:scale-95">ACESSAR MEU PAINEL</button></div>)}
            </div></div>
    );
}

// --- DASHBOARD PRINCIPAL SÍNDICO ---
function SistemaCondominio({ supabase, session, contexto, onSwitch, showToast }) {
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
    valorCondominio: 200, sindicaNome: 'Síndico(a)', predioNome: contexto.condominios?.nome || 'CondoLeve', chavePix: '', 
    saldoInicial: 0, inicioOperacao: '', diaVencimento: 10, linkGrupo: '', 
    tipoPlano: 'free', categorias: CATEGORIAS_PADRAO, telefonesUteis: INFO_UTEIS_PADRAO, filaAprovacao: [], telefoneSindico: ''
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
  const removerPagamento = async (pagamentoId) => { setPagamentos(prev => prev.filter(p => p.id !== pagamentoId)); await supabase.from('pagamentos').delete().eq('id', pagamentoId); showToast('Pagamento removido do extrato.'); };
  const atualizarComprovantePagamento = async (pagamentoId, novaUrl) => { setPagamentos(prev => prev.map(p => p.id === pagamentoId ? { ...p, url_comprovante: novaUrl } : p)); await supabase.from('pagamentos').update({ url_comprovante: novaUrl }).eq('id', pagamentoId); showToast('Comprovante anexado ao pagamento com sucesso!'); };
  const enviarReciboWhatsApp = (pagamento, unidade) => { const hashExibicao = pagamento.hash_recibo || 'N/A'; const texto = `🧾 *RECIBO DE PAGAMENTO*\n\n🏢 Condomínio: *${config.predioNome}*\n🏠 Unidade: *${unidade.numero}*\n💰 Valor Recebido: *${fmt(pagamento.valor)}*\n📅 Data de Pagamento: *${pagamento.data}*\n\n✅ Pagamento confirmado pelo síndico.\n🔐 Autenticidade: ${hashExibicao}\n\n_Gerado pelo app CondoLeve_`; window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank'); };

  // CRUD base
  const salvarNovaDespesa = async (despesaData, repetir) => { const baseDespesa = { ...despesaData, user_id: session.user.id, condominio_id: cId }; const [y, m, day] = baseDespesa.data.split('-'); const ano = parseInt(y); const despesasParaInserir = [{ ...baseDespesa, mes: MESES[parseInt(m)-1], ano, data: baseDespesa.data.split('-').reverse().join('/') }]; if (repetir) { const [anoInt, mesInt, diaInt] = baseDespesa.data.split('-').map(Number); for (let i = mesInt + 1; i <= 12; i++) { despesasParaInserir.push({ ...baseDespesa, mes: MESES[i-1], ano: anoInt, data: `${String(diaInt).padStart(2,'0')}/${String(i).padStart(2,'0')}/${anoInt}`, pago: false }); } } const { data: inserted, error } = await supabase.from('despesas').insert(despesasParaInserir).select(); if (error) showToast('Erro ao salvar', 'error'); else { setDespesas(prev => [...prev, ...inserted]); showToast('Despesa lançada com sucesso!'); setModalNovaDespesa(false); } };
  const editarDespesa = async (d) => { setDespesas(prev => prev.map(x => x.id === d.id ? { ...x, ...d } : x)); await supabase.from('despesas').update(d).eq('id', d.id); showToast('Despesa atualizada com sucesso.'); };
  const apagarDespesa = async (id) => { await supabase.from('despesas').delete().eq('id', id); setDespesas(despesas.filter(x=>x.id!==id)); showToast("Despesa excluída."); };
  const salvarAviso = async (item) => { const {data, error} = await supabase.from('avisos').insert({...item, user_id:session.user.id, condominio_id: cId}).select().single(); if(!error) { setAvisos([data, ...avisos]); showToast('Aviso publicado!'); } };
  const apagarAviso = async (id) => { await supabase.from('avisos').delete().eq('id',id); setAvisos(avisos.filter(a=>a.id!==id)); showToast('Aviso excluído.'); };
  
  const salvarEnquete = async (item) => { const {data, error} = await supabase.from('enquetes').insert({...item, user_id:session.user.id, condominio_id: cId}).select().single(); if(!error) { setEnquetes([data, ...enquetes]); showToast('Votação criada!'); } };
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
  
  const abrirChamadoManutencao = async (item) => { const {data, error} = await supabase.from('zeladoria').insert({...item, user_id:session.user.id, condominio_id: cId}).select().single(); if(!error) { setPatrimonio([data, ...patrimonio]); showToast("Chamado aberto!"); } };
  const toggleStatusManutencao = async (id, concluido) => { setPatrimonio(prev => prev.map(p => p.id === id ? { ...p, concluido } : p)); await supabase.from('zeladoria').update({ concluido }).eq('id', id); showToast(concluido ? 'Chamado resolvido!' : 'Chamado reaberto.'); };
  const apagarManutencao = async (id) => { await supabase.from('zeladoria').delete().eq('id',id); setPatrimonio(patrimonio.filter(p=>p.id!==id)); showToast('Chamado excluído.'); };
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

  const generateConicGradient = (data, total) => { if(total === 0) return 'conic-gradient(#f1f5f9 0% 100%)'; let gradient = 'conic-gradient('; let start = 0; data.forEach((item, index) => { const percentage = (item.value / total) * 100; gradient += `${CHART_COLORS[index % CHART_COLORS.length]} ${start}% ${start + percentage}%, `; start += percentage; }); return gradient.slice(0, -2) + ')'; };

  if (loading && unidades.length === 0 && pagamentos.length === 0) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><RefreshCw className="animate-spin text-[#84cc16]"/><p className="ml-4 font-black text-[#1e293b]">Carregando Condomínio...</p></div>;
  
  // MODO IMPRESSÃO
  if (printMode === 'cartaz') {
      return (
          <div className="bg-white min-h-screen p-10 font-sans">
              <div className="text-center mb-10 border-b-4 border-[#1e293b] pb-6"><h1 className="text-5xl font-black text-[#1e293b] uppercase tracking-tighter mb-2">Informações Úteis</h1><h2 className="text-2xl font-bold text-slate-500">{config.predioNome}</h2></div>
              <div className="grid grid-cols-2 gap-8">{config.telefonesUteis && config.telefonesUteis.map((t, idx) => (<div key={idx} className="border-2 border-slate-200 p-6 rounded-3xl"><p className="text-xl font-black text-slate-400 uppercase tracking-widest mb-2">{t.nome}</p><p className="text-3xl font-black text-slate-800 break-words">{t.numero}</p></div>))}</div>
              <div className="mt-16 text-center border-t-2 border-slate-100 pt-8"><p className="text-lg font-bold text-slate-400">Síndico: <span className="text-slate-800">{config.sindicaNome}</span> • {config.telefoneSindico}</p><div className="mt-8 opacity-50"><Logo variant="simple" width="w-40" className="mx-auto" /></div></div>
              <div className="fixed bottom-4 left-0 right-0 text-center no-print"><button onClick={() => setPrintMode(null)} className="bg-slate-800 text-white px-6 py-2 rounded-xl font-bold">Voltar ao App</button></div>
          </div>
      );
  }

  // APP MORADOR
  if (modoMorador && unidadeMorador) return <ModoMorador unidade={unidadeMorador} config={config} onExit={() => { if(isSindico) { setModoMorador(false); setUnidadeMorador(null); } else { onSwitch(); } }} mesAtual={mesAtual} anoAtual={anoAtual} getPagamentosMes={getPagamentosMes} calcularTotalPago={calcularTotalPago} fmt={fmt} avisos={avisos} enquetes={enquetes} patrimonio={patrimonio} showToast={showToast} copiarTexto={copiarTexto} abrirChamado={abrirChamadoManutencao} registrarVoto={registrarVotoEnquete} modalInstalar={modalInstalar} setModalInstalar={setModalInstalar} setPrintMode={setPrintMode} pagamentosCompletos={pagamentos} setModalReciboVisual={setModalReciboVisual} supabase={supabase} unidadesTotal={unidades.length} />;

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
                                     {totalPago > 0 ? <button onClick={() => setModalDetalhesUnidade({ u, mes: mesAtual, ano: anoAtual, pags, totalPago, valorDevido })} className="w-full sm:w-auto text-[10px] bg-slate-100 text-slate-600 font-black px-4 py-3 rounded-xl hover:bg-slate-200 flex items-center justify-center gap-2 transition"><Eye size={12}/> EXTRATO DA UNIDADE</button> : <button onClick={() => setModalPagamento({ unidadeId: u.id, valorSugerido: valorDevido })} className="w-full sm:w-auto bg-[#1e293b] text-white text-[10px] font-black px-6 py-3 rounded-2xl shadow-lg active:scale-95 transition hover:bg-black">RECEBER</button>}
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

      {/* TODOS OS MODAIS IMPLEMENTADOS (SEM PONTAS SOLTAS) */}
      {confirmacao && <ModalConfirmacao data={confirmacao} onClose={() => setConfirmacao(null)} />}
      
      {modalPagamento && <ModalReceber valorSugerido={modalPagamento.valorSugerido} onClose={() => setModalPagamento(null)} onConfirm={(v,d,url) => { adicionarPagamento(modalPagamento.unidadeId, v, d, url); setModalPagamento(null); }} supabase={supabase} />}
      
      {modalDetalhesUnidade && <ModalDetalhesUnidade dados={modalDetalhesUnidade} onAdd={(v,d,url) => { adicionarPagamento(modalDetalhesUnidade.u.id, v, d, url); setModalDetalhesUnidade({...modalDetalhesUnidade, pags: [...modalDetalhesUnidade.pags, {id: generateId(), valor: v, data: d, url_comprovante: url}]}); }} onDelete={(pid) => setConfirmacao({ titulo: "Apagar Pagamento?", texto: "Tem certeza que deseja remover este recebimento?", onConfirm: () => { removerPagamento(pid); setModalDetalhesUnidade({...modalDetalhesUnidade, pags: modalDetalhesUnidade.pags.filter(p=>p.id!==pid)}); setConfirmacao(null); } })} onClose={() => setModalDetalhesUnidade(null)} fmt={fmt} enviarRecibo={enviarReciboWhatsApp} supabase={supabase} setModalReciboVisual={setModalReciboVisual} onUpdatePagamento={atualizarComprovantePagamento} />}
      
      {modalReciboVisual && <ModalReciboVisual pagamento={modalReciboVisual.pagamento} unidade={modalReciboVisual.unidade} config={config} onClose={() => setModalReciboVisual(null)} fmt={fmt} enviarWhatsApp={enviarReciboWhatsApp} />}

      {modalNovaDespesa && <ModalDespesa supabase={supabase} categorias={config.categorias} onClose={() => setModalNovaDespesa(false)} onSave={salvarNovaDespesa} />}
      
      {modalEditarDespesa && <ModalDespesa supabase={supabase} categorias={config.categorias} despesaParaEditar={modalEditarDespesa} onClose={() => setModalEditarDespesa(null)} onSave={(d) => { editarDespesa({...d, id: modalEditarDespesa.id}); setModalEditarDespesa(null); }} />}
      
      {modalEditar && <ModalEditarUnidade u={modalEditar} onClose={() => setModalEditar(null)} onSave={(novo) => { supabase.from('unidades').update(novo).eq('id',novo.id).then(()=>{ setUnidades(unidades.map(x=>x.id===novo.id?novo:x)); setModalEditar(null); showToast("Dados salvos!"); }); }} ativarModoMorador={() => { setUnidadeMorador(modalEditar); setModoMorador(true); setModalEditar(null); }} config={config} cId={cId} />}
      
      {modalConfig && <ModalConfiguracoes config={config} setConfig={salvarConfig} onClose={() => setModalConfig(false)} triggerConfirm={setConfirmacao} resetar={resetarSistema} showToast={showToast} exportarBackup={exportarBackup} supabase={supabase} />}
      
      {modalRelatorio && <ModalRelatorio receita={receitaMes} despesa={gastoMes} saldo={saldoAteMesSelecionado} despesas={despesasFiltradas} mes={mesAtual} ano={anoAtual} onClose={() => setModalRelatorio(false)} fmt={fmt} exportarCSV={exportarCSV} />}
      
      {modalManutencao && <ModalManutencao lista={patrimonio} onClose={() => setModalManutencao(false)} onToggle={toggleStatusManutencao} onDelete={(id) => setConfirmacao({ titulo: "Apagar Chamado?", texto: "Isso removerá o histórico.", onConfirm: () => { apagarManutencao(id); setConfirmacao(null); } })} />}
      
      {modalAvisos && <ModalAvisos lista={avisos} onClose={() => setModalAvisos(false)} onSave={salvarAviso} onDelete={(id) => setConfirmacao({ titulo: "Apagar Aviso?", texto: "Ele sumirá do app dos moradores.", onConfirm: () => { apagarAviso(id); setConfirmacao(null); } })} supabase={supabase} />}
      
      {modalEnquete && <ModalEnquete lista={enquetes} onClose={() => setModalEnquete(false)} onSave={salvarEnquete} onDelete={(id) => setConfirmacao({ titulo: "Encerrar Enquete?", texto: "Os votos serão perdidos se excluir.", onConfirm: () => { apagarEnquete(id); setConfirmacao(null); } })} unidadesTotal={unidades.length} />}
      
      {modalTelefones && <ModalTelefonesUteis config={config} setConfig={salvarConfig} onClose={() => setModalTelefones(false)} setPrintMode={setPrintMode} />}
      
      {modalFila && <ModalFilaAprovacao fila={config.filaAprovacao} onClose={() => setModalFila(false)} processarAprovacao={processarAprovacao} />}
      
      {modalInstalar && <ModalInstalarApp onClose={() => setModalInstalar(false)} />}
    </div>
  );
}

// --- MODO MORADOR ---
function ModoMorador({ unidade, config, onExit, mesAtual, anoAtual, getPagamentosMes, calcularTotalPago, fmt, avisos, enquetes, patrimonio, showToast, copiarTexto, abrirChamado, registrarVoto, modalInstalar, setModalInstalar, setPrintMode, pagamentosCompletos, setModalReciboVisual, supabase, unidadesTotal }) {
  const [activeTab, setActiveTab] = useState('mural');
  const [historyMode, setHistoryMode] = useState(false);
  const [novoChamado, setNovoChamado] = useState('');
  const [fotoChamado, setFotoChamado] = useState('');
  const [uploading, setUploading] = useState(false);
  const [verContatos, setVerContatos] = useState(false);
  const [verRecibos, setVerRecibos] = useState(false); 
  const [reciboExpandido, setReciboExpandido] = useState(null);
  const [modalConfig, setModalConfig] = useState(false);
  
  const pags = getPagamentosMes(unidade, `${mesAtual}-${anoAtual}`);
  const totalPago = calcularTotalPago(pags);
  const valorDevido = safeNum(config.valorCondominio);
  const isPago = totalPago >= valorDevido;
  const valorRestante = Math.max(0, valorDevido - totalPago);

  const meusPagamentos = pagamentosCompletos.filter(p => p.unidade_id === unidade.id).sort((a,b) => {
      const p1 = getMonthKey(a.mes, a.ano); const p2 = getMonthKey(b.mes, b.ano); return p2 - p1;
  });

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
  const avisoUrgente = avisosShow.find(a => a.tipo === 'Urgente');

  const handleUploadFoto = async (e) => { 
      try { 
          setUploading(true); 
          const file = e.target.files[0]; 
          if(!file) return; 
          const name = `chamado_${Date.now()}.${file.name.split('.').pop()}`; 
          await supabase.storage.from('comprovantes').upload(name, file); 
          const {data} = supabase.storage.from('comprovantes').getPublicUrl(name); 
          setFotoChamado(data.publicUrl); 
      } catch(err){ console.error(err); showToast("Erro no upload", "error"); } finally { setUploading(false) } 
  }; 

  const Badge = ({ count }) => count > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold shadow-sm">{count}</span>;
  const TabBtn = ({ id, icon: Icon, label, count }) => <button onClick={() => {setActiveTab(id); setHistoryMode(false);}} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition flex flex-col items-center gap-1 relative ${activeTab === id ? 'bg-[#1e293b] text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}`}><Icon size={18} className={activeTab === id ? 'text-[#84cc16]' : 'text-slate-300'}/>{label}<Badge count={count}/></button>;
  
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-10">
       {avisoUrgente && !historyMode && (
           <div className="bg-red-600 text-white p-4 sticky top-0 z-50 flex gap-3 items-start shadow-xl animate-in slide-in-from-top">
               <AlertOctagon size={24} className="shrink-0 animate-pulse"/>
               <div><p className="text-[10px] font-black uppercase tracking-widest opacity-80">Aviso Urgente</p><p className="font-bold text-sm leading-tight mt-1">{avisoUrgente.titulo}</p></div>
           </div>
       )}

       <div className={`bg-[#1e293b] text-white p-6 pb-12 rounded-b-[40px] shadow-2xl mb-8 relative ${avisoUrgente ? 'rounded-t-none' : ''}`}>
           <div className="absolute top-4 right-4 flex gap-2">
                <button onClick={() => setModalConfig(true)} className="bg-white/10 text-white p-2 rounded-xl hover:bg-white/20 transition"><Settings size={16}/></button>
                <button onClick={() => setModalInstalar(true)} className="bg-[#84cc16]/10 text-[#84cc16] p-2 rounded-xl hover:bg-[#84cc16]/20 transition animate-pulse"><MonitorPlay size={16}/></button>
                <button onClick={onExit} className="bg-white/10 text-white p-2 rounded-xl hover:bg-white/20 text-xs font-bold flex items-center gap-2 transition"><Building size={14}/> Sair</button>
           </div>
           <div className="mb-6 scale-90 origin-top-left"><Logo variant="simple" className="brightness-0 invert" width="w-40" /></div>
           <h2 className="text-3xl font-black mb-1">Olá, {safeStr(unidade.proprietario?.nome).split(' ')[0] || 'Vizinho'}!</h2>
           <p className="text-slate-400 text-sm font-medium">Apto {safeStr(unidade.numero)} • {safeStr(config.predioNome)}</p>
       </div>
       
       <div className="px-6 -mt-16 relative z-10 space-y-4">
          <Card className="p-6 text-center border-t-4 border-t-[#84cc16]">
              <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Fatura de {mesAtual}</p>
                  <button onClick={() => setVerRecibos(true)} className="text-[10px] font-black text-blue-500 bg-blue-50 px-3 py-2 rounded-xl hover:bg-blue-100 flex items-center gap-1 transition"><History size={12}/> MEUS RECIBOS</button>
              </div>

              {isPago ? (<div className="py-2 animate-in zoom-in duration-300"><CheckCircle size={40} className="text-[#84cc16] mx-auto mb-2"/><p className="text-xl font-black text-[#1e293b]">Tudo pago!</p></div>) : (
                  <div className="py-2">
                      <p className="text-4xl font-black text-[#1e293b] mb-1">{fmt(valorRestante)}</p>
                      {totalPago > 0 && <p className="text-xs text-slate-400 font-bold mb-4">Restante a pagar (Total: {fmt(valorDevido)})</p>}
                      <button className="w-full bg-[#1e293b] text-white py-4 rounded-xl font-black shadow-lg flex items-center justify-center gap-2 active:scale-95 transition" onClick={() => copiarTexto(config.chavePix)}><Copy size={16}/> COPIAR PIX ({fmt(valorRestante)})</button>
                  </div>
              )}
          </Card>
          
          <div className="grid grid-cols-2 gap-3 mt-4">
              <button onClick={() => window.open(`https://wa.me/55${safeStr(config.telefoneSindico || '').replace(/\D/g,'')}?text=Olá, sou morador do Apto ${unidade.numero}`, '_blank')} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 font-bold text-xs text-slate-600 flex flex-col items-center gap-2 hover:bg-slate-50 transition"><Phone size={24} className="text-slate-400"/> Síndico</button>
              <button onClick={() => setVerContatos(true)} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 font-bold text-xs text-slate-600 flex flex-col items-center gap-2 hover:bg-slate-50 transition relative overflow-hidden"><div className="absolute top-0 right-0 p-1 opacity-10"><Wifi size={40}/></div><Contact size={24} className="text-teal-500 relative z-10"/> <span className="relative z-10">Contatos & Info</span></button>
          </div>
          
          <div className="mt-8">
             <div className="flex gap-2 mb-4"><TabBtn id="mural" icon={Megaphone} label="Mural" count={filterActive(avisos, 'aviso').length}/><TabBtn id="vote" icon={Vote} label="Votação" count={filterActive(enquetes, 'enquete').length}/><TabBtn id="manut" icon={Wrench} label="Manutenção" count={filterActive(patrimonio, 'zeladoria').length}/></div>
             <div className="flex justify-end mb-2"><button onClick={() => setHistoryMode(!historyMode)} className="text-[10px] font-bold text-slate-400 uppercase hover:text-slate-600 flex items-center gap-1">{historyMode ? <RotateCcw size={10}/> : <History size={10}/>} {historyMode ? 'Ver Ativos' : 'Ver Histórico'}</button></div>
             
             {activeTab === 'mural' && <div className="space-y-4">{avisosShow.map(a => {
                 let corBase = 'blue'; let icone = <Info size={14}/>; if(a.tipo === 'Urgente') { corBase = 'red'; icone = <AlertCircle size={14}/>; } if(a.tipo === 'Regra') { corBase = 'purple'; icone = <ShieldCheck size={14}/>; }
                 return (<div key={a.id} className={`p-4 rounded-2xl border bg-white border-slate-100 shadow-sm border-l-4 border-l-${corBase}-500`}><div className="flex justify-between items-center mb-2"><span className={`text-[9px] font-black uppercase text-${corBase}-600 bg-${corBase}-50 px-2 py-1 rounded flex items-center gap-1`}>{icone} {a.tipo || 'AVISO'}</span><span className="text-[9px] font-bold text-slate-400">{a.data}</span></div><h4 className="font-black text-sm text-slate-800 mb-1">{a.titulo}</h4><p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{a.mensagem}</p>{a.link && <a href={a.link} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block bg-slate-100 text-blue-600 text-[10px] font-black px-3 py-2 rounded flex items-center gap-1 w-max hover:bg-slate-200"><ExternalLink size={12}/> VER ANEXO</a>}</div>)
             })} {avisosShow.length===0 && <EmptyState icon={Bell} title={historyMode ? "Histórico Vazio" : "Sem Avisos"} desc=""/>}</div>}
             
             {activeTab === 'vote' && <div className="space-y-4">{enquetesShow.map(e => {
                 const votaramArray = e.opcoes?.votaram || [];
                 const votosDetalhados = e.opcoes?.votosDetalhados || {};
                 const jaVotou = votaramArray.includes(unidade.id) || !!votosDetalhados[unidade.id];
                 const meuVoto = votosDetalhados[unidade.id];
                 const totalVotos = (e.opcoes?.sim || 0) + (e.opcoes?.nao || 0);
                 const participacao = unidadesTotal > 0 ? Math.round((totalVotos / unidadesTotal) * 100) : 0;
                 
                 return (<div key={e.id} className="p-5 rounded-2xl border bg-white border-slate-100 shadow-sm"><h4 className="font-black text-sm text-slate-800 mb-1 leading-tight">{e.titulo}</h4><p className="text-[10px] text-slate-400 font-bold mb-4 uppercase flex items-center gap-2">{historyMode ? 'Encerrada' : 'Aberta'} • Adesão: {participacao}% {e.opcoes?.dataFim && `• Fim: ${e.opcoes.dataFim}`}</p>{(!historyMode) ? (<div className="space-y-3"><div className="flex gap-3"><button onClick={() => registrarVoto(e.id, 'sim', unidade.id)} className={`flex-1 py-3 rounded-xl font-black text-xs transition active:scale-95 border flex flex-col items-center gap-1 ${meuVoto === 'sim' ? 'bg-green-500 text-white border-green-600 shadow-md' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-green-50 hover:text-green-600'}`}>👍 SIM {meuVoto === 'sim' && <span className="text-[8px] opacity-80">(SEU VOTO)</span>}</button><button onClick={() => registrarVoto(e.id, 'nao', unidade.id)} className={`flex-1 py-3 rounded-xl font-black text-xs transition active:scale-95 border flex flex-col items-center gap-1 ${meuVoto === 'nao' ? 'bg-red-500 text-white border-red-600 shadow-md' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-red-50 hover:text-red-600'}`}>👎 NÃO {meuVoto === 'nao' && <span className="text-[8px] opacity-80">(SEU VOTO)</span>}</button></div>{jaVotou && <p className="text-[9px] text-center text-slate-400 italic">Você pode mudar seu voto enquanto a enquete estiver aberta.</p>}</div>) : (<div className="space-y-2 mt-4"><div className="flex gap-2"><div className="flex-1 bg-slate-50 p-3 rounded-xl text-center border border-slate-100 relative overflow-hidden"><div className="absolute top-0 left-0 bottom-0 bg-green-100 transition-all" style={{width: `${totalVotos === 0 ? 0 : ((e.opcoes?.sim||0)/totalVotos)*100}%`}}></div><div className="relative z-10 flex justify-between items-center px-2"><span className="text-xs font-bold text-slate-500">SIM</span><span className="font-black text-green-600">{e.opcoes?.sim || 0}</span></div></div><div className="flex-1 bg-slate-50 p-3 rounded-xl text-center border border-slate-100 relative overflow-hidden"><div className="absolute top-0 left-0 bottom-0 bg-red-100 transition-all" style={{width: `${totalVotos === 0 ? 0 : ((e.opcoes?.nao||0)/totalVotos)*100}%`}}></div><div className="relative z-10 flex justify-between items-center px-2"><span className="text-xs font-bold text-slate-500">NÃO</span><span className="font-black text-red-500">{e.opcoes?.nao || 0}</span></div></div></div></div>)}</div>)
             })} {enquetesShow.length===0 && <EmptyState icon={Vote} title="Nenhuma Votação" desc=""/>}</div>}
             
             {activeTab === 'manut' && <div className="space-y-4">
                 {!historyMode && (<div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1"><AlertTriangle size={12}/> Reportar Problema</p><textarea value={novoChamado} onChange={e=>setNovoChamado(e.target.value)} placeholder="Ex: A lâmpada do corredor do 2º andar queimou..." className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-sm font-bold outline-none h-20 mb-2 focus:border-[#84cc16]"/><div className="flex gap-2 mb-3"><label className="flex-1 flex items-center justify-center gap-2 bg-slate-50 p-3 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500 font-bold cursor-pointer hover:bg-slate-100 transition">{uploading ? <RefreshCw size={14} className="animate-spin"/> : (fotoChamado ? <CheckCircle size={14} className="text-green-500"/> : <Camera size={14}/>)} {fotoChamado ? 'Foto Anexada' : 'Tirar Foto'}<input type="file" onChange={handleUploadFoto} className="hidden" accept="image/*"/></label></div><button onClick={() => { if(novoChamado) { abrirChamado({ item: novoChamado, data: new Date().toLocaleDateString(), concluido: false, relator: `Apto ${unidade.numero}`, url_foto: fotoChamado }); setNovoChamado(''); setFotoChamado(''); } }} className="w-full bg-[#1e293b] text-white py-4 rounded-xl font-black text-xs shadow-lg flex justify-center items-center gap-2 active:scale-95 transition"><Send size={14}/> ENVIAR CHAMADO</button></div>)}
                 {zelaShow.map(z => (<div key={z.id} className="p-4 rounded-2xl border bg-white border-slate-100 shadow-sm flex items-start gap-3">{z.concluido ? <CheckCircle size={20} className="text-green-500 shrink-0 mt-0.5"/> : <AlertCircle size={20} className="text-orange-400 shrink-0 mt-0.5"/>}<div><span className={`text-xs font-bold block leading-relaxed ${z.concluido ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{z.item}</span>{z.url_foto && <a href={z.url_foto} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-[10px] font-black text-blue-500 bg-blue-50 px-2 py-1 rounded-md"><ImageIcon size={10}/> VER FOTO</a>}<div className="flex items-center gap-2 mt-2"><span className="text-[9px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded">{z.data}</span>{z.relator && <span className="text-[9px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded">{z.relator}</span>}</div></div></div>))} 
                 {zelaShow.length === 0 && <EmptyState icon={Wrench} title="Tudo em Ordem" desc=""/>}
             </div>}
          </div>
       </div>

       {verContatos && (
           <div className="fixed inset-0 bg-[#1e293b]/90 z-[9999] flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm animate-in fade-in">
               <div className="bg-white rounded-t-[32px] sm:rounded-[32px] w-full max-w-sm p-6 shadow-2xl animate-in slide-in-from-bottom-10 max-h-[85vh] flex flex-col">
                   <div className="flex justify-between items-center mb-6 border-b pb-4"><h3 className="font-black text-xl flex items-center gap-2 text-slate-800"><Contact size={24} className="text-teal-500"/> Contatos & Info</h3><button onClick={() => setVerContatos(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition"><X size={20}/></button></div>
                   <div className="flex-1 overflow-y-auto space-y-3 pr-2 pb-4">
                       {config.telefonesUteis && config.telefonesUteis.filter(t => t.numero.trim() !== '').map((t, idx) => (<div key={idx} className="flex justify-between items-center bg-slate-50 border border-slate-100 p-4 rounded-2xl"><div><p className="font-black text-slate-700 text-sm">{t.nome}</p><p className="text-xs font-bold text-slate-500">{t.numero}</p></div>{t.numero.replace(/\D/g, '').length >= 8 && <a href={`tel:${t.numero.replace(/\D/g, '')}`} className="bg-teal-50 text-teal-600 p-3 rounded-full hover:bg-teal-100 transition active:scale-95 shadow-sm border border-teal-100"><PhoneCall size={18}/></a>}</div>))}
                   </div>
                   <div className="pt-4 border-t shrink-0"><button onClick={() => setPrintMode('cartaz')} className="w-full bg-slate-100 text-slate-600 py-4 rounded-xl font-black text-xs hover:bg-slate-200 transition flex justify-center items-center gap-2"><Printer size={16}/> IMPRIMIR CARTAZ P/ ELEVADOR</button></div>
               </div>
           </div>
       )}

       {verRecibos && (
           <div className="fixed inset-0 bg-[#1e293b]/90 z-[9999] flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm animate-in fade-in">
               <div className="bg-white rounded-t-[32px] sm:rounded-[32px] w-full max-w-sm p-6 shadow-2xl animate-in slide-in-from-bottom-10 max-h-[85vh] flex flex-col">
                   <div className="flex justify-between items-center mb-6 border-b pb-4"><h3 className="font-black text-xl flex items-center gap-2 text-slate-800"><History size={24} className="text-blue-500"/> Meus Recibos</h3><button onClick={() => setVerRecibos(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition"><X size={20}/></button></div>
                   
                   <div className="flex-1 overflow-y-auto space-y-3 pr-2 pb-4">
                       {meusPagamentos.map(p => {
                           const expandido = reciboExpandido === p.id;
                           return (
                           <div key={p.id} className={`bg-slate-50 p-4 rounded-2xl border transition-all ${expandido ? 'border-blue-300 shadow-md' : 'border-slate-200'}`}>
                               <div className="flex justify-between items-center cursor-pointer" onClick={() => setReciboExpandido(expandido ? null : p.id)}>
                                   <div>
                                       <p className="font-black text-slate-800 text-sm">{fmt(p.valor)}</p>
                                       <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Ref: {p.mes}/{p.ano}</p>
                                   </div>
                                   <div className="flex items-center gap-2">
                                       <span className="text-[9px] font-black text-green-600 bg-green-100 px-2 py-1 rounded uppercase">PAGO</span>
                                       {expandido ? <ChevronUp size={16} className="text-slate-400"/> : <ChevronDown size={16} className="text-slate-400"/>}
                                   </div>
                               </div>
                               {expandido && (
                                   <div className="mt-4 pt-4 border-t border-slate-200 border-dashed animate-in fade-in slide-in-from-top-2">
                                       <div className="mb-4">
                                           <p className="text-[9px] font-bold text-slate-400 uppercase">Data do Pagamento</p>
                                           <p className="text-xs font-black text-slate-700">{p.data}</p>
                                       </div>
                                       <div className="mb-4 bg-blue-50/50 p-2 rounded">
                                           <p className="text-[9px] font-bold text-blue-400 uppercase">Autenticidade</p>
                                           <p className="text-xs font-mono font-bold text-slate-600 tracking-wider break-all">{p.hash_recibo || 'N/A'}</p>
                                       </div>
                                       {p.url_comprovante && (
                                           <a href={p.url_comprovante} target="_blank" rel="noopener noreferrer" className="w-full text-[10px] font-black text-blue-600 bg-blue-100 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-200 transition shadow-sm mb-2"><Paperclip size={14}/> VER FOTO DO COMPROVANTE</a>
                                       )}
                                       <button onClick={() => { setModalReciboVisual({pagamento: p, unidade}); setVerRecibos(false); }} className="w-full text-[10px] font-black text-white bg-blue-500 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-600 transition shadow-sm"><Receipt size={14}/> GERAR PDF COMPLETO</button>
                                   </div>
                               )}
                           </div>
                       )})}
                       {meusPagamentos.length === 0 && <EmptyState icon={Receipt} title="Nenhum recibo" desc="Você ainda não tem histórico de pagamentos registrados." />}
                   </div>
               </div>
           </div>
       )}

       {modalConfig && <ModalConfiguracoesMorador onClose={() => setModalConfig(false)} showToast={showToast} supabase={supabase} onSair={onExit} />}
       {modalInstalar && <ModalInstalarApp onClose={() => setModalInstalar(false)} />}
    </div>
  )
}

// ==========================================
// MODAIS E COMPONENTES AUXILIARES (COMPLETOS)
// ==========================================

function ModalConfirmacao({ data, onClose }) {
    return (
        <div className="fixed inset-0 bg-[#1e293b]/90 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
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

function ModalInstalarApp({ onClose }) {
    return (
        <div className="fixed inset-0 bg-[#1e293b]/90 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in text-center relative overflow-hidden">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800"><X size={20}/></button>
                <div className="bg-[#84cc16]/10 text-[#84cc16] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"><MonitorPlay size={40}/></div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">Instale o App</h3>
                <p className="text-sm text-slate-500 mb-6 font-medium">O CondoLeve funciona direto no seu celular como um aplicativo nativo, sem ocupar espaço.</p>
                <div className="text-left bg-slate-50 p-4 rounded-2xl space-y-3 mb-6">
                    <p className="text-xs font-bold text-slate-700 flex items-start gap-2"><div className="bg-[#1e293b] text-white w-5 h-5 rounded flex items-center justify-center shrink-0">1</div> Abra as opções do seu navegador (três pontinhos ou botão compartilhar).</p>
                    <p className="text-xs font-bold text-slate-700 flex items-start gap-2"><div className="bg-[#1e293b] text-white w-5 h-5 rounded flex items-center justify-center shrink-0">2</div> Escolha "Adicionar à Tela Inicial".</p>
                    <p className="text-xs font-bold text-slate-700 flex items-start gap-2"><div className="bg-[#1e293b] text-white w-5 h-5 rounded flex items-center justify-center shrink-0">3</div> Confirme e acesse o ícone na sua tela inicial!</p>
                </div>
                <button onClick={onClose} className="w-full bg-[#1e293b] text-white py-4 rounded-xl font-black text-xs hover:bg-black transition">ENTENDI</button>
            </div>
        </div>
    );
}

function ModalReceber({ valorSugerido, onClose, onConfirm, supabase }) {
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
            await supabase.storage.from('comprovantes').upload(nome, file);
            const { data: pubData } = supabase.storage.from('comprovantes').getPublicUrl(nome);
            setUrl(pubData.publicUrl);
        } catch(err) {
            console.error(err);
        } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-[#1e293b]/90 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
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

function ModalDetalhesUnidade({ dados, onClose, onAdd, onDelete, fmt, enviarRecibo, supabase, setModalReciboVisual, onUpdatePagamento }) {
    const { u, mes, ano, pags, totalPago, valorDevido } = dados;
    const isPago = totalPago >= valorDevido;

    const handleUploadExistente = async (e, pid) => {
        try {
            const file = e.target.files[0];
            if(!file) return;
            const nome = `pgto_upd_${Date.now()}.${file.name.split('.').pop()}`;
            await supabase.storage.from('comprovantes').upload(nome, file);
            const { data: pubData } = supabase.storage.from('comprovantes').getPublicUrl(nome);
            onUpdatePagamento(pid, pubData.publicUrl);
        } catch(err) { console.error(err); }
    };

    return (
        <div className="fixed inset-0 bg-[#1e293b]/90 z-[9999] flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm">
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
    return (
        <div className="fixed inset-0 bg-[#1e293b]/90 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm relative">
                <button onClick={onClose} className="absolute -top-12 right-0 text-white hover:text-red-400 transition"><X size={32}/></button>
                <div className="bg-white rounded-[24px] p-8 shadow-2xl relative overflow-hidden font-mono border-t-[16px] border-[#1e293b]" id="recibo-pdf">
                    <div className="absolute top-0 right-8 w-8 h-8 bg-white rounded-b-full -mt-4 shadow-inner"></div>
                    <div className="absolute top-0 left-8 w-8 h-8 bg-white rounded-b-full -mt-4 shadow-inner"></div>
                    
                    <div className="text-center mb-6">
                        <Logo variant="simple" width="w-24" className="mx-auto mb-2 grayscale opacity-50"/>
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Recibo de Pagamento</h2>
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
                <button onClick={() => enviarWhatsApp(pagamento, unidade)} className="w-full bg-[#84cc16] text-[#1e293b] py-4 rounded-xl mt-4 font-black text-xs hover:bg-[#a3e635] shadow-lg flex justify-center items-center gap-2"><Share2 size={16}/> COMPARTILHAR NO WHATSAPP</button>
            </div>
        </div>
    );
}

function ModalDespesa({ supabase, categorias, onClose, onSave, despesaParaEditar = null }) {
    const isEdit = !!despesaParaEditar;
    const [form, setForm] = useState(despesaParaEditar || { descricao: '', valor: '', data: new Date().toISOString().split('T')[0], categoria: categorias[0], pago: true, repetir: false, url_comprovante: '' });
    const [loadingUpload, setLoadingUpload] = useState(false);

    const handleUpload = async (e) => {
        try {
            setLoadingUpload(true);
            const file = e.target.files[0];
            if(!file) return;
            const nome = `desp_${Date.now()}.${file.name.split('.').pop()}`;
            await supabase.storage.from('comprovantes').upload(nome, file);
            const { data } = supabase.storage.from('comprovantes').getPublicUrl(nome);
            setForm({...form, url_comprovante: data.publicUrl});
        } catch(err) { console.error(err); } finally { setLoadingUpload(false); }
    };

    return (
        <div className="fixed inset-0 bg-[#1e293b]/90 z-[9999] flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm">
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
        <div className="fixed inset-0 bg-[#1e293b]/90 z-[9999] flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm">
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

function ModalRelatorio({ receita, despesa, saldo, despesas, mes, ano, onClose, fmt, exportarCSV }) {
    return (
        <div className="fixed inset-0 bg-[#1e293b]/90 z-[9999] flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm">
            <div className="bg-white rounded-t-[32px] sm:rounded-[32px] w-full max-w-md p-6 shadow-2xl animate-in slide-in-from-bottom-10 max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-6 border-b pb-4"><h3 className="font-black text-xl text-slate-800 flex items-center gap-2"><FileBarChart className="text-[#84cc16]"/> Relatório {mes}</h3><button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><X size={20}/></button></div>
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-green-50 p-4 rounded-2xl border border-green-100"><p className="text-[10px] font-black text-green-600 uppercase">Receitas Mês</p><p className="text-xl font-black text-green-700">{fmt(receita)}</p></div>
                        <div className="bg-red-50 p-4 rounded-2xl border border-red-100"><p className="text-[10px] font-black text-red-600 uppercase">Despesas Mês</p><p className="text-xl font-black text-red-700">-{fmt(despesa)}</p></div>
                        <div className="col-span-2 bg-[#1e293b] p-4 rounded-2xl text-white mt-2"><p className="text-[10px] font-black text-slate-400 uppercase">Saldo em Caixa (Final do Mês)</p><p className="text-3xl font-black">{fmt(saldo)}</p></div>
                    </div>
                    <div className="pt-4 border-t border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-3">Detalhamento de Despesas</p>
                        {despesas.map(d => (
                            <div key={d.id} className="flex justify-between items-center border-b border-slate-50 py-2 text-xs">
                                <span className="font-bold text-slate-600">{d.descricao} <span className="text-[9px] text-slate-400 font-normal ml-1">({d.categoria})</span></span>
                                <span className="font-black text-red-500">-{fmt(d.valor)}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="pt-4 border-t shrink-0"><button onClick={exportarCSV} className="w-full bg-[#1e293b] text-white py-4 rounded-xl font-black text-xs hover:bg-black transition flex justify-center items-center gap-2"><FileSpreadsheet size={16}/> EXPORTAR PARA EXCEL (CSV)</button></div>
            </div>
        </div>
    );
}

function ModalManutencao({ lista, onClose, onToggle, onDelete }) {
    return (
        <div className="fixed inset-0 bg-[#1e293b]/90 z-[9999] flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm">
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
        <div className="fixed inset-0 bg-[#1e293b]/90 z-[9999] flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm">
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

function ModalEnquete({ lista, onClose, onSave, onDelete, unidadesTotal }) {
    const [form, setForm] = useState({ titulo: '', descricao: '', ativa: true, opcoes: { sim: 0, nao: 0 } });
    return (
        <div className="fixed inset-0 bg-[#1e293b]/90 z-[9999] flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm">
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
                                <button onClick={() => onDelete(e.id)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 p-2"><Trash2 size={14}/></button>
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
        <div className="fixed inset-0 bg-[#1e293b]/90 z-[9999] flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm">
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
        <div className="fixed inset-0 bg-[#1e293b]/90 z-[9999] flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm">
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
        <div className="fixed inset-0 bg-[#1e293b]/90 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm text-left">
            <div className="bg-white rounded-[32px] w-full max-w-2xl p-0 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in duration-300">
                <div className="bg-[#1e293b] p-6 text-white text-center">
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

// --- MODAL CONFIGURAÇÃO (MORADOR) ---
function ModalConfiguracoesMorador({ onClose, showToast, supabase, onSair }) { 
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
            onClose();
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setLoadingSenha(false);
        }
    };

    return ( 
        <div className="fixed inset-0 bg-[#1e293b]/90 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm text-left">
            <div className="bg-white rounded-[32px] w-full max-w-sm p-6 shadow-2xl flex flex-col animate-in zoom-in duration-300">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h3 className="font-black text-xl flex items-center gap-2 text-slate-800"><Settings size={24} className="text-slate-500"/> Minha Conta</h3>
                    <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition"><X size={20}/></button>
                </div>
                
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl mb-6">
                    <h4 className="font-black text-slate-800 text-sm mb-4 flex items-center gap-2"><KeyRound size={16} className="text-orange-500"/> Alterar Minha Senha</h4>
                    <label className="block mb-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase">Nova Senha</span>
                        <input type="password" value={novaSenha} onChange={e=>setNovaSenha(e.target.value)} className="w-full border border-slate-200 p-3 rounded-xl text-sm font-bold outline-none focus:border-[#84cc16] mt-1" placeholder="Mínimo de 6 caracteres"/>
                    </label>
                    <button onClick={alterarSenha} disabled={loadingSenha || novaSenha.length < 6} className="w-full bg-[#1e293b] text-white py-3 px-6 rounded-xl font-black text-xs hover:bg-black transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md">
                        {loadingSenha ? <RefreshCw className="animate-spin" size={14}/> : <Save size={14}/>} SALVAR NOVA SENHA
                    </button>
                </div>

                <button onClick={onSair} className="w-full bg-red-50 text-red-500 py-4 rounded-xl font-black text-xs hover:bg-red-100 border border-red-200 transition flex items-center justify-center gap-2"><LogOut size={16}/> SAIR DO CONDOMÍNIO</button>
            </div>
        </div>
    ); 
}