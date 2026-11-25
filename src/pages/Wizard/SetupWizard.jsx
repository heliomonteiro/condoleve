import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../../components/ui/Logo';
import { safeNum, maskPhone, formatarMoeda, CATEGORIAS_PADRAO, INFO_UTEIS_PADRAO } from '../../utils/helpers';
import { X, PlusCircle, RefreshCw, PartyPopper, Activity } from 'lucide-react';

export function SetupWizard({ onComplete }) {
    const { session, showToast } = useAuth();
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({ nome: '', sindico: '', celular: '', valor: '', pix: '', saldoInicial: '' });
    const [temBlocos, setTemBlocos] = useState(false); 
    const [usarZero, setUsarZero] = useState(true);
    const [blocos, setBlocos] = useState(''); 
    const [andares, setAndares] = useState(''); 
    const [aptosPorAndar, setAptosPorAndar] = useState('');
    const [listaGerada, setListaGerada] = useState([]); 
    const [loading, setLoading] = useState(false); 
    const [insight, setInsight] = useState(null);

    const gerarApartamentos = () => {
        if(!andares || !aptosPorAndar) { showToast("Preencha andares e aptos.", "error"); return; }
        const numAndares = parseInt(andares); const numAptos = parseInt(aptosPorAndar); let novaLista = [];
        const listaBlocos = temBlocos && blocos ? blocos.split(',').map(b => b.trim()).filter(b=>b) : [''];
        listaBlocos.forEach(bloco => { 
            for(let i=1; i<=numAndares; i++) { 
                for(let j=1; j<=numAptos; j++) { 
                    const numeroStr = usarZero ? `${i}${String(j).padStart(2, '0')}` : `${i}${j}`; 
                    novaLista.push(bloco ? `${bloco}-${numeroStr}` : numeroStr); 
                } 
            } 
        });
        setListaGerada(prev => [...new Set([...prev, ...novaLista])]); 
        showToast(`Foram geradas ${novaLista.length} unidades na lista.`);
    };

    const finalizar = async () => {
        if(listaGerada.length === 0) return showToast("Gere a lista antes!", "error");
        setLoading(true);
        try {
            const hoje = new Date();
            const inicioOp = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
            const valorTaxa = safeNum(form.valor) || 0; 
            const saldoIni = safeNum(form.saldoInicial) || 0;

            const { data: condo, error: e1 } = await supabase.from('condominios').insert({ nome: form.nome, created_by: session.user.id }).select().single(); 
            if (e1) throw e1;

            const { data: vinc, error: e2 } = await supabase.from('vinculos').insert({ user_id: session.user.id, condominio_id: condo.id, role: 'sindico' }).select('*, condominios(nome)').single(); 
            if (e2) throw e2;

            const { error: e3 } = await supabase.from('config_geral').insert({ 
                condominio_id: condo.id, 
                user_id: session.user.id, 
                dados: { 
                    predioNome: form.nome, 
                    sindicaNome: form.sindico, 
                    valorCondominio: valorTaxa, 
                    saldoInicial: saldoIni, 
                    chavePix: form.pix, 
                    telefoneSindico: form.celular, 
                    categorias: CATEGORIAS_PADRAO, 
                    inicioOperacao: inicioOp, 
                    telefonesUteis: INFO_UTEIS_PADRAO, 
                    filaAprovacao: [] 
                } 
            }); 
            if (e3) throw e3;
            
            const unitsToInsert = listaGerada.map(n => ({ user_id: session.user.id, condominio_id: condo.id, numero: n, proprietario: {}, inquilino: {}, mora_proprietario: true }));
            await supabase.from('unidades').insert(unitsToInsert);
            
            const potencialMes = listaGerada.length * valorTaxa; 
            let mesesFolego = 0; 
            if (valorTaxa > 0) mesesFolego = (saldoIni / potencialMes).toFixed(1);

            setInsight({ vinc, potencialMes, saldoIni, mesesFolego: parseFloat(mesesFolego) }); 
            setStep(4); 
        } catch (err) { 
            showToast(err.message, 'error'); 
        } finally { 
            setLoading(false); 
        }
    };

    return (
        <div className="fixed inset-0 bg-white z-[10010] flex flex-col p-8 font-sans text-left overflow-y-auto">
            <div className="max-w-md mx-auto w-full">
                <div className="mb-10"><Logo variant="simple" width="w-48" /></div>
                
                {step < 4 && (
                    <div className="flex gap-2 mb-10">
                        {[1,2,3].map(i => <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${step >= i ? 'bg-[#1e293b]' : 'bg-slate-100'}`}></div>)}
                    </div>
                )}
                
                {step === 1 && (
                    <div className="space-y-6 animate-in slide-in-from-right">
                        <h2 className="text-3xl font-black text-slate-900 leading-tight">Vamos começar seu Condomínio? 🏢</h2>
                        <label className="block">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nome do Prédio</span>
                            <input value={form.nome} onChange={e=>setForm({...form, nome:e.target.value})} className="w-full border-2 border-slate-100 p-4 rounded-2xl font-black outline-none focus:border-[#84cc16] transition" placeholder="Ex: Edifício Solar"/>
                        </label>
                        <label className="block">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Seu Nome</span>
                            <input value={form.sindico} onChange={e=>setForm({...form, sindico:e.target.value})} className="w-full border-2 border-slate-100 p-4 rounded-2xl font-black outline-none focus:border-[#84cc16] transition" placeholder="Ex: Maria Síndica"/>
                        </label>
                        <label className="block">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">WhatsApp do Síndico</span>
                            <input value={maskPhone(form.celular)} onChange={e=>setForm({...form, celular:maskPhone(e.target.value)})} className="w-full border-2 border-slate-100 p-4 rounded-2xl font-black outline-none focus:border-[#84cc16] transition" placeholder="(11) 99999-9999"/>
                        </label>
                        <button onClick={()=>setStep(2)} disabled={!form.nome || !form.sindico} className="w-full bg-[#1e293b] text-white py-5 rounded-2xl font-black shadow-2xl disabled:opacity-50 transition active:scale-95">PRÓXIMO PASSO</button>
                    </div>
                )}
                {step === 2 && (
                    <div className="space-y-6 animate-in slide-in-from-right">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 leading-tight mb-2">Financeiro 💰</h2>
                            <p className="text-xs text-slate-400 font-bold mb-4">Você pode preencher isso depois se não souber agora.</p>
                        </div>
                        <div className="flex gap-4">
                            <label className="block w-1/2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Taxa (R$)</span>
                                <input type="number" placeholder="Opcional" value={form.valor} onChange={e=>setForm({...form, valor:e.target.value})} className="w-full border-2 border-slate-100 p-4 rounded-2xl font-black text-green-600 outline-none focus:border-[#84cc16]"/>
                            </label>
                            <label className="block w-1/2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Saldo Inicial (R$)</span>
                                <input type="number" placeholder="Opcional" value={form.saldoInicial} onChange={e=>setForm({...form, saldoInicial:e.target.value})} className="w-full border-2 border-slate-100 p-4 rounded-2xl font-black text-blue-600 outline-none focus:border-[#84cc16]"/>
                            </label>
                        </div>
                        <label className="block">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Chave PIX do Condomínio</span>
                            <input value={form.pix} onChange={e=>setForm({...form, pix:e.target.value})} className="w-full border-2 border-slate-100 p-4 rounded-2xl font-black outline-none focus:border-[#84cc16]" placeholder="Opcional por enquanto"/>
                        </label>
                        <button onClick={()=>setStep(3)} className="w-full bg-[#1e293b] text-white py-5 rounded-2xl font-black shadow-2xl transition active:scale-95">PULAR OU AVANÇAR</button>
                        <button onClick={()=>setStep(1)} className="w-full text-xs font-bold text-slate-400 hover:text-slate-800 transition">Voltar</button>
                    </div>
                )}
                {step === 3 && (
                    <div className="space-y-6 animate-in slide-in-from-right">
                        <h2 className="text-3xl font-black text-slate-900 mb-2 leading-tight">Gerador de Aptos 🏠</h2>
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-6 space-y-4">
                            <label className="flex items-center gap-3 cursor-pointer select-none">
                                <input type="checkbox" checked={temBlocos} onChange={e=>setTemBlocos(e.target.checked)} className="accent-[#84cc16] w-5 h-5 rounded-md"/>
                                <span className="text-sm font-bold text-slate-700">O condomínio possui Blocos/Torres?</span>
                            </label>
                            {temBlocos && <input placeholder="Ex: Bloco A, Bloco B, Torre 1" value={blocos} onChange={e=>setBlocos(e.target.value)} className="w-full p-4 border-2 border-slate-100 rounded-xl text-sm font-bold outline-none focus:border-[#84cc16] bg-white"/>}
                            <div className="flex gap-2">
                                <input placeholder="Nº de Andares (ex: 5)" type="number" value={andares} onChange={e=>setAndares(e.target.value)} className="w-1/2 p-4 border-2 border-slate-100 rounded-xl text-sm font-bold outline-none focus:border-[#84cc16] bg-white"/>
                                <input placeholder="Aptos por Andar (ex: 4)" type="number" value={aptosPorAndar} onChange={e=>setAptosPorAndar(e.target.value)} className="w-1/2 p-4 border-2 border-slate-100 rounded-xl text-sm font-bold outline-none focus:border-[#84cc16] bg-white"/>
                            </div>
                            <label className="flex items-center gap-3 cursor-pointer select-none pt-2">
                                <input type="checkbox" checked={usarZero} onChange={e=>setUsarZero(e.target.checked)} className="accent-[#84cc16] w-5 h-5 rounded-md"/>
                                <div><span className="text-sm font-bold text-slate-700 block">Usar zero na dezena?</span><span className="text-[10px] text-slate-400 font-bold uppercase">{usarZero ? 'Ex: 101, 102...' : 'Ex: 11, 12...'}</span></div>
                            </label>
                            <button onClick={gerarApartamentos} className="w-full bg-[#1e293b] text-white py-4 rounded-xl font-black text-xs uppercase hover:bg-black transition flex items-center justify-center gap-2 mt-2"><PlusCircle size={16}/> Gerar Lista</button>
                        </div>
                        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 min-h-[100px] items-start content-start">
                            {listaGerada.map((a,i) => ( 
                                <div key={i} className="bg-white border border-slate-200 shadow-sm px-4 py-2 rounded-full text-xs font-black text-slate-700 flex items-center gap-2">
                                    {a} <button onClick={()=>setListaGerada(listaGerada.filter(x=>x!==a))} className="text-red-400 hover:text-red-600"><X size={14}/></button>
                                </div> 
                            ))} 
                        </div>
                        <div className="pt-4">
                            <button onClick={finalizar} disabled={loading || listaGerada.length === 0} className={`w-full py-5 rounded-2xl font-black shadow-2xl transition flex justify-center items-center gap-2 ${listaGerada.length === 0 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-[#84cc16] text-[#1e293b] hover:bg-[#a3e635] active:scale-95'}`}>{loading ? <RefreshCw className="animate-spin"/> : 'FINALIZAR E ENTRAR'}</button>
                            <button onClick={()=>setStep(2)} className="w-full mt-4 text-xs font-bold text-slate-400 hover:text-slate-800 transition">Voltar</button>
                        </div>
                    </div>
                )}
                {step === 4 && insight && (
                    <div className="space-y-6 text-center animate-in zoom-in duration-500 py-10">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><PartyPopper size={48} className="text-green-500"/></div>
                        <h2 className="text-3xl font-black text-slate-900 leading-tight mb-2">Tudo Pronto!</h2>
                        <p className="text-slate-500 font-medium mb-8">Seu condomínio foi criado e já está pronto para uso.</p>
                        {(insight.potencialMes > 0 || insight.saldoIni > 0) && (
                            <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl text-left mb-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 opacity-5 -translate-y-4 translate-x-4"><Activity size={100}/></div>
                                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10"><Activity size={14}/> Raio-X Financeiro</p>
                                {insight.potencialMes > 0 && (<p className="text-sm font-bold text-slate-700 mb-2 relative z-10">Sua arrecadação potencial é de <span className="text-blue-600 font-black">{formatarMoeda(insight.potencialMes)}/mês</span>.</p>)}
                                {insight.saldoIni > 0 && insight.potencialMes > 0 && (<p className="text-sm font-bold text-slate-700 relative z-10">Com o saldo atual, você tem fôlego para cobrir <span className="bg-blue-200 text-blue-800 px-2 py-0.5 rounded font-black">{insight.mesesFolego} meses</span> de despesas equivalentes à sua arrecadação total.</p>)}
                            </div>
                        )}
                        <button onClick={() => onComplete(insight.vinc)} className="w-full bg-[#1e293b] text-white py-5 rounded-2xl font-black shadow-2xl transition hover:bg-black active:scale-95">ACESSAR MEU PAINEL</button>
                    </div>
                )}
            </div>
        </div>
    );
}
