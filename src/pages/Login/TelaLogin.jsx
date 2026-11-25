import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../../components/ui/Logo';
import { ShieldCheck, RefreshCw, ArrowLeft } from 'lucide-react';

export function TelaLogin() {
    const { showToast, inviteData } = useAuth();
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
