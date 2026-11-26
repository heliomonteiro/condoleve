import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../../components/ui/Logo';
import { BotaoLetraMaior } from '../../components/ui/BotaoLetraMaior';
import { ModalTermosLGPD } from '../../components/legal/ModalTermosLGPD';
import { translateError } from '../../utils/errorTranslator';
import { ShieldCheck, RefreshCw, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export function TelaLogin({ initialMode = 'login', onVoltarSite = null }) {
  const { showToast, inviteData } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [modalLegal, setModalLegal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modo, setModo] = useState(initialMode);

  const googleAuthEnabled = import.meta.env.VITE_ENABLE_GOOGLE_AUTH === 'true';

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (error) {
      showToast(translateError(error), 'error');
      setLoading(false);
    }
  };

  const handleAcao = async (e) => {
    e.preventDefault();
    if (modo === 'cadastro' && !aceitouTermos) {
      showToast('Marque a caixinha confirmando os Termos de Uso e Privacidade.', 'error');
      return;
    }

    setLoading(true);
    try {
      const emailLimpo = email.trim();
      if (modo === 'recuperar') {
        const { error } = await supabase.auth.resetPasswordForEmail(emailLimpo, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        showToast('Pronto! Abra seu e-mail e toque no link que enviamos para criar outra senha.');
        setModo('login');
      } else if (modo === 'cadastro') {
        const { error } = await supabase.auth.signUp({
          email: emailLimpo,
          password: senha,
          options: {
            data: { lgpd_accepted_at: new Date().toISOString() },
          },
        });
        if (error) throw error;
        showToast('Conta criada com sucesso! Bem-vindo ao CondoLeve.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: emailLimpo,
          password: senha,
        });
        if (error) throw error;
      }
    } catch (error) {
      showToast(translateError(error), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm flex justify-between items-center mb-3">
        {onVoltarSite ? (
          <button
            type="button"
            onClick={onVoltarSite}
            className="min-h-[44px] px-3 rounded-xl bg-white border border-slate-200 text-xs font-black text-slate-700 hover:bg-slate-100 transition flex items-center gap-1.5"
          >
            <ArrowLeft size={14} /> Voltar ao site
          </button>
        ) : (
          <span />
        )}
        <BotaoLetraMaior variant="light" />
      </div>

      <div className="bg-white p-8 rounded-[36px] shadow-2xl w-full max-w-sm text-center relative overflow-hidden border border-slate-100">
        <div className="flex justify-center mb-6">
          <Logo variant="simple" width="w-48" />
        </div>

        {inviteData && modo === 'login' && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl mb-6 flex items-center gap-3 text-left animate-in slide-in-from-top-4">
            <ShieldCheck className="text-blue-600 shrink-0" size={26} />
            <div>
              <p className="text-xs font-black text-blue-700 uppercase">Convite do Condomínio</p>
              <p className="text-xs font-bold text-blue-900 leading-snug mt-0.5">
                Entre com sua conta (ou toque em &ldquo;Ainda não tem conta? Criar conta grátis&rdquo;
                abaixo) para acessar seu apartamento
                {inviteData.numero ? ` ${inviteData.numero}` : ''}.
              </p>
            </div>
          </div>
        )}

        <h2 className="text-2xl font-black text-[#1e293b] mb-2">
          {modo === 'cadastro'
            ? 'Criar Nova Conta'
            : modo === 'recuperar'
            ? 'Recuperar Minha Senha'
            : 'Entrar no CondoLeve'}
        </h2>

        {modo === 'recuperar' && (
          <p className="text-xs text-slate-600 font-medium mb-4 leading-relaxed">
            Digite seu e-mail abaixo. Vamos te enviar um link simples para você escolher uma senha
            nova.
          </p>
        )}

        <form onSubmit={handleAcao} className="space-y-4 text-left mt-5">
          <div>
            <label className="text-xs font-black uppercase text-slate-600 ml-1 block mb-1">
              Seu E-mail
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="exemplo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-slate-200 p-4 rounded-2xl font-bold text-base outline-none focus:border-[#84cc16] transition"
            />
          </div>

          {modo !== 'recuperar' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-black uppercase text-slate-600 ml-1">
                  Sua Senha
                </label>
                {modo === 'login' && (
                  <button
                    type="button"
                    onClick={() => setModo('recuperar')}
                    className="text-xs font-black text-[#65a30d] hover:underline min-h-[44px] px-2 flex items-center"
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  required
                  minLength={6}
                  autoComplete={modo === 'cadastro' ? 'new-password' : 'current-password'}
                  placeholder="Mínimo 6 dígitos"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full border-2 border-slate-200 p-4 pr-14 rounded-2xl font-bold text-base outline-none focus:border-[#84cc16] transition"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-500 hover:text-slate-800 rounded-xl"
                >
                  {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          )}

          {modo === 'cadastro' && (
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={aceitouTermos}
                  onChange={(e) => setAceitouTermos(e.target.checked)}
                  className="accent-[#84cc16] w-6 h-6 mt-0.5 rounded shrink-0"
                />
                <span className="text-xs text-slate-700 font-bold leading-snug pt-0.5">
                  Li e concordo com os Termos de Uso e Política de Privacidade (LGPD).
                </span>
              </label>
              <div className="flex gap-2 pl-9">
                <button
                  type="button"
                  onClick={() => setModalLegal('termos')}
                  className="min-h-[40px] px-3 rounded-xl bg-white border border-slate-200 text-xs font-black text-slate-800 hover:bg-slate-100 transition"
                >
                  Ler Termos
                </button>
                <button
                  type="button"
                  onClick={() => setModalLegal('privacidade')}
                  className="min-h-[40px] px-3 rounded-xl bg-white border border-slate-200 text-xs font-black text-slate-800 hover:bg-slate-100 transition"
                >
                  Ler Privacidade
                </button>
              </div>
            </div>
          )}

          <button
            disabled={loading}
            className="w-full bg-[#1e293b] text-white py-4 min-h-[54px] rounded-2xl font-black text-sm shadow-xl hover:bg-black transition active:scale-95 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <RefreshCw className="animate-spin mx-auto" />
            ) : modo === 'cadastro' ? (
              'CRIAR MINHA CONTA'
            ) : modo === 'recuperar' ? (
              'ENVIAR LINK PARA MEU E-MAIL'
            ) : (
              'ENTRAR'
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-3">
          {googleAuthEnabled && modo === 'login' && (
            <button
              type="button"
              disabled={loading}
              onClick={handleGoogleLogin}
              className="w-full min-h-[48px] py-3 px-4 rounded-2xl bg-white border-2 border-slate-200 text-xs font-black text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-2"
            >
              Entrar com Conta Google (Gmail)
            </button>
          )}
          {modo === 'login' ? (
            <button
              type="button"
              onClick={() => setModo('cadastro')}
              className="w-full min-h-[48px] py-3 px-4 rounded-2xl bg-slate-100 text-xs font-black text-slate-700 hover:bg-lime-100 hover:text-slate-900 transition"
            >
              Ainda não tem conta? Criar conta grátis
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setModo('login')}
              className="w-full min-h-[48px] py-3 px-4 rounded-2xl bg-slate-100 text-xs font-black text-slate-700 hover:bg-slate-200 transition flex items-center justify-center gap-1.5"
            >
              <ArrowLeft size={16} /> Voltar para a tela de Entrar
            </button>
          )}
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs font-bold text-slate-500">
          CondoLeve © {new Date().getFullYear()}
        </p>
        <div className="flex justify-center gap-3 mt-1">
          <button
            type="button"
            onClick={() => setModalLegal('termos')}
            className="text-xs font-bold text-slate-600 underline hover:text-slate-900 min-h-[44px] px-3 flex items-center"
          >
            Termos de Uso
          </button>
          <span className="text-slate-300 self-center">•</span>
          <button
            type="button"
            onClick={() => setModalLegal('privacidade')}
            className="text-xs font-bold text-slate-600 underline hover:text-slate-900 min-h-[44px] px-3 flex items-center"
          >
            Privacidade (LGPD)
          </button>
        </div>
      </div>

      {modalLegal && <ModalTermosLGPD tipo={modalLegal} onClose={() => setModalLegal(null)} />}
    </div>
  );
}
