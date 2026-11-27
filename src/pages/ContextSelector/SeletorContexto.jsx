import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../../components/ui/Logo';
import { Card } from '../../components/ui/Card';
import { SetupWizard } from '../Wizard/SetupWizard';
import {
  RefreshCw,
  Clock,
  Crown,
  Home,
  ArrowRight,
  PlusCircle,
  ShieldCheck,
} from 'lucide-react';

export function SeletorContexto({ skipAutoSelect = false }) {
  const { session, showToast, inviteData, setInviteData, setContexto } = useAuth();
  const [vinculos, setVinculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [statusFila, setStatusFila] = useState(null);

  useEffect(() => {
    let active = true;

    const init = async () => {
      try {
        if (inviteData && inviteData.cId) {
          showToast('Enviando solicitação para o Síndico...');
          let numeroUnidade = inviteData.numero;

          // Se veio por token criptográfico (?convite=<token>), resolve o número da unidade com segurança
          if (!numeroUnidade && inviteData.token) {
            const { data: unitByToken } = await supabase
              .from('unidades')
              .select('numero')
              .eq('condominio_id', inviteData.cId)
              .eq('invite_token', inviteData.token)
              .maybeSingle();
            numeroUnidade = unitByToken?.numero || '?';
          }

          const { data: existente } = await supabase
            .from('convites')
            .select('id')
            .eq('condominio_id', inviteData.cId)
            .eq('user_id', session.user.id)
            .eq('status', 'pendente')
            .maybeSingle();

          if (!existente && numeroUnidade) {
            await supabase.from('convites').insert({
              condominio_id: inviteData.cId,
              user_id: session.user.id,
              email: session.user.email,
              numero_unidade: numeroUnidade,
            });
          }

          if (active) {
            setStatusFila({ predio: 'seu condomínio', apto: numeroUnidade || '?' });
            setInviteData(null);
            setLoading(false);
          }
          return;
        }

        const { data, error } = await supabase
          .from('vinculos')
          .select('*, condominios(nome), unidades(numero, isento_taxa)')
          .eq('user_id', session.user.id);
        if (error) throw error;

        if (!active) return;

        if (data && data.length > 0) {
          setVinculos(data);
          if (data.length === 1 && !skipAutoSelect) setContexto(data[0]);
        } else {
          const { data: config } = await supabase
            .from('config_geral')
            .select('*')
            .eq('user_id', session.user.id)
            .maybeSingle();
          if (!active) return;
          if (config && config.condominio_id) {
            setVinculos([
              {
                id: 'legacy',
                role: 'sindico',
                condominio_id: config.condominio_id,
                condominios: { nome: config.dados?.predioNome || 'Meu Condomínio' },
              },
            ]);
          } else {
            setShowWizard(true);
          }
        }
      } catch {
        if (active) setShowWizard(true);
      } finally {
        if (active) setLoading(false);
      }
    };

    init();
    return () => {
      active = false;
    };
  }, [inviteData, session.user.email, session.user.id, setContexto, setInviteData, showToast, skipAutoSelect]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <RefreshCw className="animate-spin text-[#84cc16]" />
      </div>
    );
  }

  if (statusFila) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 text-center">
        <div className="bg-white p-8 rounded-[40px] shadow-xl max-w-sm w-full animate-in zoom-in">
          <div className="bg-orange-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-orange-500">
            <Clock size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2 leading-tight">
            Aguardando Liberação
          </h2>
          <p className="text-sm text-slate-500 mb-6 font-medium">
            Sua solicitação de acesso ao <b>Apto {statusFila.apto}</b> do condomínio{' '}
            <b>{statusFila.predio}</b> foi enviada ao Síndico.
          </p>
          <button
            type="button"
            onClick={() => {
              window.location.href = window.location.pathname;
            }}
            className="w-full bg-[#1e293b] text-white py-4 rounded-xl font-black text-xs hover:bg-black transition"
          >
            VOLTAR AO INÍCIO
          </button>
        </div>
      </div>
    );
  }

  if (showWizard) {
    return (
      <SetupWizard
        onComplete={(v) => setContexto(v)}
        onCancel={vinculos.length > 0 ? () => setShowWizard(false) : null}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center">
      <Logo variant="simple" width="w-40" className="mt-10 mb-10" />
      <div className="w-full max-w-md space-y-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-slate-800">Escolha o Acesso</h2>
        </div>
        {vinculos.map((v) => {
          const isAdmin = v.role === 'sindico' || v.role === 'admin';
          const isConselho = v.role === 'conselheiro';
          return (
            <Card key={v.id} className="overflow-hidden hover:shadow-md transition cursor-pointer group">
              <button
                type="button"
                onClick={() => setContexto(v)}
                className="w-full p-6 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-2xl ${
                      isAdmin
                        ? 'bg-[#1e293b] text-white'
                        : isConselho
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-[#84cc16]/10 text-[#1e293b]'
                    }`}
                  >
                    {isAdmin ? (
                      <Crown size={24} />
                    ) : isConselho ? (
                      <ShieldCheck size={24} />
                    ) : (
                      <Home size={24} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 group-hover:text-[#84cc16] transition">
                      {v.condominios?.nome || 'Condomínio'}
                    </h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {isAdmin
                        ? 'Gestor / Síndico'
                        : isConselho
                        ? 'Conselheiro Fiscal'
                        : `Morador - Apto ${v.unidades?.numero || '?'}`}
                    </p>
                  </div>
                </div>
                <ArrowRight
                  className="text-slate-200 group-hover:text-[#84cc16] group-hover:translate-x-1 transition"
                  size={20}
                />
              </button>
            </Card>
          );
        })}
        <div className="pt-6 border-t border-slate-200 mt-6 text-center">
          <button
            type="button"
            onClick={() => setShowWizard(true)}
            className="text-xs font-black text-[#84cc16] flex items-center gap-2 mx-auto hover:scale-105 transition"
          >
            <PlusCircle size={16} /> CRIAR NOVO CONDOMÍNIO
          </button>
          <button
            type="button"
            onClick={() => supabase.auth.signOut()}
            className="mt-10 text-xs font-bold text-slate-400 hover:text-red-500 transition"
          >
            Sair da conta
          </button>
        </div>
      </div>
    </div>
  );
}
