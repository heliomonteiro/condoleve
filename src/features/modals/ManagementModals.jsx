import React, { useState, useEffect } from 'react';
import {
  X,
  Link as LinkIcon,
  Copy,
  Smartphone,
  Wrench,
  CheckCircle,
  Image as ImageIcon,
  Trash2,
  CheckSquare,
  Megaphone,
  Send,
  Vote,
  PlusCircle,
  Contact,
  Printer,
  UserPlus,
  UserCheck,
  LockKeyhole,
  KeyRound,
  RefreshCw,
  Save,
  Database,
  Download,
  Crown,
  Sparkles,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  History,
  LogOut,
} from 'lucide-react';
import { EmptyState } from '../../components/ui/EmptyState';
import { maskPhone, generateId, INFO_UTEIS_PADRAO } from '../../utils/helpers';
import { translateError } from '../../utils/errorTranslator';
import { polishNoticeWithAI } from '../../lib/aiClient';
import { canUseFeature } from '../../config/plans';

export function ModalEditarUnidade({
  u,
  onClose,
  onSave,
  ativarModoMorador,
  cId,
  showToast,
}) {
  const [form, setForm] = useState(u);
  const linkAcesso = u.invite_token
    ? `${window.location.origin}?convite=${u.invite_token}&c=${cId}`
    : `${window.location.origin}?invite=${encodeURIComponent(u.numero)}&c=${cId}`;

  return (
    <div className="fixed inset-0 bg-[#1e293b]/90 z-[9000] flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm text-left">
      <div className="bg-white rounded-t-[32px] sm:rounded-[32px] w-full max-w-md p-6 shadow-2xl animate-in slide-in-from-bottom-10 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="font-black text-xl text-slate-800">Editar Apto {u.numero}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto pr-2 space-y-4 mb-4">
          <div className="bg-slate-50 p-4 rounded-2xl border">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-3">
              Dados do Proprietário
            </p>
            <input
              value={form.proprietario?.nome || ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  proprietario: { ...form.proprietario, nome: e.target.value },
                })
              }
              className="w-full border p-3 rounded-xl font-bold mb-2 text-sm"
              placeholder="Nome Completo"
            />
            <input
              value={maskPhone(form.proprietario?.telefone || '')}
              onChange={(e) =>
                setForm({
                  ...form,
                  proprietario: { ...form.proprietario, telefone: e.target.value },
                })
              }
              className="w-full border p-3 rounded-xl font-bold text-sm"
              placeholder="WhatsApp (11) 99999-9999"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer bg-slate-100 p-4 rounded-xl border border-slate-200">
            <input
              type="checkbox"
              checked={form.mora_proprietario !== false}
              onChange={(e) => setForm({ ...form, mora_proprietario: e.target.checked })}
              className="accent-[#84cc16] w-5 h-5"
            />
            <span className="text-sm font-bold text-slate-700">Proprietário mora no imóvel</span>
          </label>

          {form.mora_proprietario === false && (
            <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
              <p className="text-[10px] font-black text-orange-400 uppercase mb-3">
                Dados do Inquilino
              </p>
              <input
                value={form.inquilino?.nome || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    inquilino: { ...form.inquilino, nome: e.target.value },
                  })
                }
                className="w-full border p-3 rounded-xl font-bold mb-2 text-sm"
                placeholder="Nome do Inquilino"
              />
              <input
                value={maskPhone(form.inquilino?.telefone || '')}
                onChange={(e) =>
                  setForm({
                    ...form,
                    inquilino: { ...form.inquilino, telefone: e.target.value },
                  })
                }
                className="w-full border p-3 rounded-xl font-bold text-sm"
                placeholder="WhatsApp (11) 99999-9999"
              />
            </div>
          )}

          {/* Isenção de Taxa do Síndico / Acordo */}
          <label className="flex items-start gap-3 cursor-pointer bg-lime-50/70 p-4 rounded-xl border border-lime-200">
            <input
              type="checkbox"
              checked={Boolean(form.isento_taxa)}
              onChange={(e) => setForm({ ...form, isento_taxa: e.target.checked })}
              className="accent-[#84cc16] w-5 h-5 mt-0.5"
            />
            <div>
              <span className="text-xs font-black text-slate-800 block">
                Unidade isenta da taxa condominial (Síndico)
              </span>
              <span className="text-[10px] text-slate-500 font-semibold">
                Não contabiliza como inadimplente nem soma na arrecadação prevista.
              </span>
            </div>
          </label>

          <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
            <p className="text-[10px] font-black text-blue-500 uppercase mb-2 flex items-center gap-1">
              <LinkIcon size={12} /> Link Exclusivo de Convite do Morador
            </p>
            <div className="flex gap-2">
              <input
                readOnly
                value={linkAcesso}
                className="w-full bg-white border border-blue-200 p-2 rounded-lg text-xs text-slate-500"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(linkAcesso);
                  showToast?.('Link de convite copiado!');
                }}
                className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-4 border-t shrink-0">
          <button
            type="button"
            onClick={ativarModoMorador}
            className="col-span-2 py-3 text-slate-500 font-bold bg-slate-100 rounded-xl hover:bg-slate-200 text-xs flex items-center justify-center gap-2"
          >
            <Smartphone size={14} /> SIMULAR VISÃO DESTE MORADOR
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-4 text-slate-500 font-bold bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onSave(form)}
            className="py-4 text-white font-black bg-[#1e293b] rounded-xl hover:bg-black shadow-lg"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

export function ModalManutencao({
  lista,
  onClose,
  onToggle,
  onUpdateChamado,
  onDelete,
  readOnly = false,
}) {
  const [respostas, setRespostas] = useState({});

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Manutenção e Chamados"
      className="fixed inset-0 bg-[#1e293b]/90 z-[9000] flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm text-left"
    >
      <div className="bg-white rounded-t-[32px] sm:rounded-[32px] w-full max-w-md p-6 shadow-2xl animate-in slide-in-from-bottom-10 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="font-black text-xl text-slate-800 flex items-center gap-2">
            <Wrench className="text-slate-500" /> Manutenção
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-slate-100 rounded-full hover:bg-slate-200"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-4">
          {lista.map((z) => {
            const statusAtual = z.status || (z.concluido ? 'concluido' : 'aberto');
            const respostaDraft =
              respostas[z.id] !== undefined ? respostas[z.id] : z.resposta_sindico || '';

            return (
              <div
                key={z.id}
                className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3"
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    disabled={readOnly}
                    onClick={() => onToggle(z.id, !z.concluido)}
                    className={`shrink-0 mt-0.5 ${z.concluido ? 'text-green-500' : 'text-slate-300'}`}
                  >
                    {z.concluido ? (
                      <CheckCircle size={24} />
                    ) : (
                      <div className="w-6 h-6 border-2 border-slate-300 rounded-full" />
                    )}
                  </button>
                  <div className="flex-1">
                    <p
                      className={`text-sm font-bold ${
                        z.concluido ? 'line-through text-slate-400' : 'text-slate-800'
                      }`}
                    >
                      {z.item}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2 items-center">
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                          statusAtual === 'concluido'
                            ? 'bg-green-100 text-green-700'
                            : statusAtual === 'em_andamento'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {statusAtual === 'concluido'
                          ? 'Resolvido'
                          : statusAtual === 'em_andamento'
                          ? 'Em Andamento'
                          : 'Aberto'}
                      </span>
                      <span className="text-[9px] font-black text-slate-400 uppercase bg-slate-200/50 px-2 py-0.5 rounded">
                        {z.data}
                      </span>
                      {z.relator && (
                        <span className="text-[9px] font-black text-orange-500 uppercase bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                          {z.relator}
                        </span>
                      )}
                      {z.url_foto && (
                        <a
                          href={z.url_foto}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[9px] font-black text-blue-500 uppercase flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded border border-blue-100"
                        >
                          <ImageIcon size={10} /> Ver Foto
                        </a>
                      )}
                    </div>
                  </div>
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => onDelete(z.id)}
                      className="text-slate-300 hover:text-red-500 p-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {!readOnly && onUpdateChamado && (
                  <div className="pt-2 border-t border-slate-200/70 space-y-2">
                    <div className="flex gap-1.5">
                      {[
                        { id: 'aberto', label: 'Aberto' },
                        { id: 'em_andamento', label: 'Em Andamento' },
                        { id: 'concluido', label: 'Resolvido' },
                      ].map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() =>
                            onUpdateChamado(z.id, {
                              status: st.id,
                              concluido: st.id === 'concluido',
                              resposta_sindico: respostaDraft,
                            })
                          }
                          className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-black transition border ${
                            statusAtual === st.id
                              ? 'bg-[#1e293b] text-white border-[#1e293b]'
                              : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-1.5">
                      <input
                        value={respostaDraft}
                        onChange={(e) =>
                          setRespostas((prev) => ({ ...prev, [z.id]: e.target.value }))
                        }
                        placeholder="Recado p/ morador (ex: Técnico vem quinta)"
                        className="flex-1 bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold outline-none focus:border-[#84cc16]"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateChamado(z.id, {
                            status: statusAtual === 'aberto' ? 'em_andamento' : statusAtual,
                            concluido: statusAtual === 'concluido',
                            resposta_sindico: respostaDraft,
                          })
                        }
                        className="bg-[#84cc16] text-[#1e293b] px-3 py-2 rounded-xl text-[10px] font-black hover:bg-[#a3e635] transition shrink-0"
                      >
                        Salvar
                      </button>
                    </div>
                  </div>
                )}

                {readOnly && z.resposta_sindico && (
                  <p className="text-xs bg-white p-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold">
                    <strong>Síndico:</strong> {z.resposta_sindico}
                  </p>
                )}
              </div>
            );
          })}
          {lista.length === 0 && (
            <EmptyState icon={CheckSquare} title="Tudo OK!" desc="Nenhuma manutenção pendente." />
          )}
        </div>
      </div>
    </div>
  );
}

export function ModalAvisos({
  lista,
  onClose,
  onSave,
  onDelete,
  supabase,
  condominioId,
  showToast,
  subscription,
  onRequestUpgrade,
  onAiUsed,
  readOnly = false,
}) {
  const [form, setForm] = useState(() => ({
    titulo: '',
    mensagem: '',
    tipo: 'Aviso',
    data: new Date().toLocaleDateString('pt-BR'),
  }));
  const [polishing, setPolishing] = useState(false);

  const allowAi = canUseFeature(subscription, 'ai');

  const handlePolishWithAi = async () => {
    if (!form.mensagem.trim()) {
      showToast?.('Escreva um rascunho rápido antes de refinar com a IA.', 'error');
      return;
    }
    if (!allowAi) {
      onRequestUpgrade('O Redator Diplomático com IA é exclusivo do CondoLeve Pro.');
      return;
    }

    setPolishing(true);
    try {
      const improved = await polishNoticeWithAI({
        supabase,
        condominioId,
        titulo: form.titulo,
        mensagem: form.mensagem,
        tipo: form.tipo,
      });
      if (improved) {
        setForm({
          ...form,
          titulo: improved.titulo || form.titulo,
          mensagem: improved.mensagem || form.mensagem,
        });
        if (!improved.usedFallback) onAiUsed?.();
        showToast?.('Texto refinado em tom profissional e cordial!');
      }
    } catch (err) {
      if (err.code === 'PLAN_LIMIT_REACHED') {
        onRequestUpgrade(err.message);
      } else {
        showToast?.(err.message || 'Falha ao refinar texto.', 'error');
      }
    } finally {
      setPolishing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#1e293b]/90 z-[9000] flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm text-left">
      <div className="bg-white rounded-t-[32px] sm:rounded-[32px] w-full max-w-md p-6 shadow-2xl animate-in slide-in-from-bottom-10 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="font-black text-xl text-slate-800 flex items-center gap-2">
            <Megaphone className="text-orange-500" /> Mural de Avisos
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4">
          {!readOnly && (
            <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 space-y-3">
              <input
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                className="w-full border-none p-3 rounded-xl font-black text-sm outline-none bg-white"
                placeholder="Título do Aviso"
              />
              <textarea
                value={form.mensagem}
                onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
                className="w-full border-none p-3 rounded-xl font-bold text-xs outline-none h-24 bg-white resize-none"
                placeholder="Escreva rápido o recado para os moradores..."
              />

              <button
                type="button"
                disabled={polishing}
                onClick={handlePolishWithAi}
                className="w-full py-2 px-3 rounded-xl bg-white border border-orange-200 text-[10px] font-black uppercase text-slate-700 hover:bg-orange-100/50 transition flex items-center justify-center gap-1.5"
              >
                {polishing ? (
                  <RefreshCw size={12} className="animate-spin text-orange-500" />
                ) : allowAi ? (
                  <Sparkles size={12} className="text-[#84cc16]" />
                ) : (
                  <Lock size={12} className="text-orange-400" />
                )}
                Tornar Profissional e Cordial com IA
              </button>

              <div className="flex gap-2">
                <select
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                  className="flex-1 border-none p-3 rounded-xl font-bold text-xs outline-none text-slate-600 bg-white"
                >
                  <option value="Aviso">Aviso Comum</option>
                  <option value="Urgente">Urgente</option>
                  <option value="Regra">Regra / Norma</option>
                </select>
                <button
                  type="button"
                  onClick={() => {
                    if (form.titulo && form.mensagem) {
                      onSave(form);
                      setForm({
                        titulo: '',
                        mensagem: '',
                        tipo: 'Aviso',
                        data: new Date().toLocaleDateString('pt-BR'),
                      });
                    }
                  }}
                  className="bg-orange-500 text-white px-4 rounded-xl font-black text-xs hover:bg-orange-600 transition"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {lista.map((a) => (
              <div
                key={a.id}
                className="p-4 bg-white border border-slate-200 rounded-2xl relative shadow-sm"
              >
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => onDelete(a.id)}
                    className="absolute top-2 right-2 text-slate-300 hover:text-red-500 p-2"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <span
                  className={`text-[8px] font-black uppercase px-2 py-0.5 rounded mb-2 inline-block ${
                    a.tipo === 'Urgente'
                      ? 'bg-red-100 text-red-600'
                      : a.tipo === 'Regra'
                      ? 'bg-purple-100 text-purple-600'
                      : 'bg-blue-100 text-blue-600'
                  }`}
                >
                  {a.tipo}
                </span>
                <p className="font-black text-slate-800 text-sm">{a.titulo}</p>
                <p className="text-xs text-slate-500 mt-1 whitespace-pre-line">{a.mensagem}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ModalEnquete({
  lista,
  onClose,
  onSave,
  onDelete,
  onEncerrar,
  subscription,
  onRequestUpgrade,
  readOnly = false,
}) {
  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    ativa: true,
    opcoes: { sim: 0, nao: 0 },
  });

  const allowEnquetes = canUseFeature(subscription, 'enquetes');

  return (
    <div className="fixed inset-0 bg-[#1e293b]/90 z-[9000] flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm text-left">
      <div className="bg-white rounded-t-[32px] sm:rounded-[32px] w-full max-w-md p-6 shadow-2xl animate-in slide-in-from-bottom-10 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="font-black text-xl text-slate-800 flex items-center gap-2">
            <Vote className="text-blue-500" /> Enquetes Auditáveis
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4">
          {!readOnly && (
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 space-y-3">
              <input
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                className="w-full border-none p-3 rounded-xl font-black text-sm outline-none bg-white"
                placeholder="Pergunta da votação (Sim / Não)"
              />
              <button
                type="button"
                onClick={() => {
                  if (!allowEnquetes) {
                    onRequestUpgrade('Enquetes digitais auditáveis fazem parte do CondoLeve Pro.');
                    return;
                  }
                  if (form.titulo) {
                    onSave(form);
                    setForm({ titulo: '', descricao: '', ativa: true, opcoes: { sim: 0, nao: 0 } });
                  }
                }}
                className="w-full bg-blue-500 text-white py-3 rounded-xl font-black text-xs hover:bg-blue-600 transition flex items-center justify-center gap-2"
              >
                {allowEnquetes ? <PlusCircle size={14} /> : <Lock size={14} />}
                INICIAR VOTAÇÃO (1 VOTO POR APTO)
              </button>
            </div>
          )}

          <div className="space-y-3">
            {lista.map((e) => (
              <div
                key={e.id}
                className="p-4 bg-white border border-slate-200 rounded-2xl relative shadow-sm"
              >
                {!readOnly && (
                  <>
                    <button
                      type="button"
                      onClick={() => onDelete(e.id)}
                      className="absolute top-2 right-2 text-slate-300 hover:text-red-500 p-1"
                      title="Apagar Enquete"
                    >
                      <Trash2 size={16} />
                    </button>
                    {e.ativa && (
                      <button
                        type="button"
                        onClick={() => onEncerrar(e.id)}
                        className="absolute top-2 right-9 text-slate-300 hover:text-orange-500 p-1"
                        title="Encerrar Votação"
                      >
                        <CheckCircle size={16} />
                      </button>
                    )}
                  </>
                )}
                <span
                  className={`text-[8px] font-black uppercase px-2 py-0.5 rounded mb-2 inline-block ${
                    e.ativa ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {e.ativa ? 'ABERTA' : 'ENCERRADA'}
                </span>
                <p className="font-black text-slate-800 text-sm mb-3 pr-6">{e.titulo}</p>
                <div className="flex gap-2">
                  <div className="flex-1 bg-green-50 p-2 rounded-lg text-center">
                    <p className="text-[10px] font-bold text-green-600">SIM</p>
                    <p className="font-black text-green-700">{e.opcoes?.sim || 0}</p>
                  </div>
                  <div className="flex-1 bg-red-50 p-2 rounded-lg text-center">
                    <p className="text-[10px] font-bold text-red-600">NÃO</p>
                    <p className="font-black text-red-700">{e.opcoes?.nao || 0}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ModalTelefonesUteis({ config, setConfig, onClose, setPrintMode, readOnly = false }) {
  const [lista, setLista] = useState(() => config.telefonesUteis || INFO_UTEIS_PADRAO);
  return (
    <div className="fixed inset-0 bg-[#1e293b]/90 z-[9000] flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm text-left">
      <div className="bg-white rounded-t-[32px] sm:rounded-[32px] w-full max-w-md p-6 shadow-2xl animate-in slide-in-from-bottom-10 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="font-black text-xl text-slate-800 flex items-center gap-2">
            <Contact className="text-teal-500" /> Telefones & Info
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 pb-4">
          {lista.map((t, i) => (
            <div
              key={t.id || i}
              className="flex gap-2 items-center bg-slate-50 p-3 rounded-xl border border-slate-100"
            >
              <input
                readOnly={readOnly}
                value={t.nome}
                onChange={(e) => {
                  const nv = [...lista];
                  nv[i] = { ...nv[i], nome: e.target.value };
                  setLista(nv);
                }}
                className="flex-1 bg-transparent font-black text-sm outline-none text-slate-700"
                placeholder="Nome/Serviço"
              />
              <input
                readOnly={readOnly}
                value={t.numero}
                onChange={(e) => {
                  const nv = [...lista];
                  nv[i] = { ...nv[i], numero: e.target.value };
                  setLista(nv);
                }}
                className="flex-1 bg-transparent font-bold text-xs outline-none text-slate-500 text-right"
                placeholder="Número/Info"
              />
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => setLista(lista.filter((_, idx) => idx !== i))}
                  className="text-slate-300 hover:text-red-500 p-1"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
          {!readOnly && (
            <button
              type="button"
              onClick={() => setLista([...lista, { id: generateId(), nome: '', numero: '' }])}
              className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-50 flex justify-center items-center gap-2"
            >
              <PlusCircle size={14} /> ADICIONAR LINHA
            </button>
          )}
        </div>
        <div className="pt-4 border-t flex flex-col gap-2 shrink-0">
          {!readOnly && (
            <button
              type="button"
              onClick={() => {
                setConfig({ ...config, telefonesUteis: lista });
                onClose();
              }}
              className="w-full bg-[#1e293b] text-white py-4 rounded-xl font-black text-xs hover:bg-black transition shadow-lg"
            >
              SALVAR INFORMAÇÕES
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              onClose();
              setPrintMode('cartaz');
            }}
            className="w-full bg-slate-100 text-slate-600 py-3 rounded-xl font-black text-[10px] hover:bg-slate-200 transition flex items-center justify-center gap-2"
          >
            <Printer size={14} /> IMPRIMIR CARTAZ P/ ELEVADOR
          </button>
        </div>
      </div>
    </div>
  );
}

export function ModalFilaAprovacao({
  fila,
  onClose,
  processarAprovacao,
  subscription,
  onRequestUpgrade,
}) {
  const allowConselho = canUseFeature(subscription, 'conselho');

  return (
    <div className="fixed inset-0 bg-[#1e293b]/90 z-[9000] flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm text-left">
      <div className="bg-white rounded-t-[32px] sm:rounded-[32px] w-full max-w-md p-6 shadow-2xl animate-in slide-in-from-bottom-10 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="font-black text-xl text-slate-800 flex items-center gap-2">
            <UserPlus className="text-purple-500" /> Novos Acessos
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 pb-4">
          {fila && fila.length > 0 ? (
            fila.map((f) => (
              <div
                key={f.id}
                className="bg-purple-50 border border-purple-100 p-4 rounded-2xl flex flex-col gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-white text-purple-600 w-12 h-12 rounded-xl font-black flex items-center justify-center text-lg shadow-sm border border-purple-100 shrink-0">
                    {f.numero}
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-sm">{f.email}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">
                      Solicitou em {f.data}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => processarAprovacao(f, false, 'morador')}
                    className="flex-1 py-2 bg-white text-red-500 border border-red-200 rounded-lg text-[10px] font-black hover:bg-red-50 transition"
                  >
                    REJEITAR
                  </button>
                  <button
                    type="button"
                    onClick={() => processarAprovacao(f, true, 'morador')}
                    className="flex-1 py-2 bg-purple-600 text-white rounded-lg text-[10px] font-black hover:bg-purple-700 transition shadow-md"
                  >
                    APROVAR MORADOR
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!allowConselho) {
                      onRequestUpgrade('O perfil Conselheiro Fiscal faz parte do CondoLeve Pro.');
                      return;
                    }
                    processarAprovacao(f, true, 'conselheiro');
                  }}
                  className="w-full py-2 bg-white border border-purple-200 text-purple-700 rounded-lg text-[10px] font-black hover:bg-purple-100/50 transition flex items-center justify-center gap-1"
                >
                  <ShieldCheck size={12} /> APROVAR COMO CONSELHEIRO FISCAL (LEITURA)
                </button>
              </div>
            ))
          ) : (
            <EmptyState
              icon={UserCheck}
              title="Nenhum Pedido"
              desc="Todos os moradores já foram aprovados."
            />
          )}
        </div>
      </div>
    </div>
  );
}

export function ModalConfiguracoes({
  config,
  setConfig,
  onClose,
  triggerConfirm,
  resetar,
  showToast,
  exportarBackup,
  supabase,
  condominioId,
  currentUserId,
  onSwitchContexto,
  subscription,
  onRequestUpgrade,
  unidadesCount = 0,
  onLogout,
}) {
  const [local, setLocal] = useState({ ...config });
  const [activeTab, setActiveTab] = useState('geral');
  const [bloqueado, setBloqueado] = useState(true);
  const [novaSenha, setNovaSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loadingSenha, setLoadingSenha] = useState(false);
  const [membrosSucessao, setMembrosSucessao] = useState([]);
  const [loadingMembros, setLoadingMembros] = useState(false);
  const [novoSindicoId, setNovoSindicoId] = useState('');
  const [transferindo, setTransferindo] = useState(false);

  const allowBackup = canUseFeature(subscription, 'backup');

  useEffect(() => {
    if (activeTab !== 'sistema' || !condominioId) return;
    let active = true;
    const carregarMembros = async () => {
      setLoadingMembros(true);
      try {
        const [{ data: vincs }, { data: convs }] = await Promise.all([
          supabase
            .from('vinculos')
            .select('id, user_id, role, unidades(numero, proprietario, inquilino)')
            .eq('condominio_id', condominioId)
            .neq('user_id', currentUserId),
          supabase
            .from('convites')
            .select('user_id, email')
            .eq('condominio_id', condominioId)
            .eq('status', 'aprovado'),
        ]);

        if (!active) return;
        const emailMap = new Map((convs || []).map((c) => [c.user_id, c.email]));
        const uniqueMap = new Map();
        (vincs || []).forEach((v) => {
          if (!uniqueMap.has(v.user_id)) {
            const apto = v.unidades?.numero ? `Apto ${v.unidades.numero}` : 'Sem unidade';
            const nome =
              v.unidades?.proprietario?.nome || v.unidades?.inquilino?.nome || '';
            const email = emailMap.get(v.user_id) || '';
            const labelParts = [apto, nome, email ? `(${email})` : ''].filter(Boolean);
            uniqueMap.set(v.user_id, {
              userId: v.user_id,
              role: v.role,
              label: `${labelParts.join(' — ')} [${v.role}]`,
            });
          }
        });
        const lista = Array.from(uniqueMap.values());
        setMembrosSucessao(lista);
        if (lista[0]) setNovoSindicoId(lista[0].userId);
      } catch {
        if (active) setMembrosSucessao([]);
      } finally {
        if (active) setLoadingMembros(false);
      }
    };
    carregarMembros();
    return () => {
      active = false;
    };
  }, [activeTab, condominioId, currentUserId, supabase]);

  const executarTransferenciaSindico = async (targetUserId) => {
    setTransferindo(true);
    try {
      const { error } = await supabase.rpc('transferir_sindico_condominio', {
        p_condominio_id: condominioId,
        p_novo_sindico_user_id: targetUserId,
      });
      if (error) throw error;
      showToast('Administração transferida com sucesso para o novo síndico!');
      onClose();
      onSwitchContexto?.();
    } catch (err) {
      showToast(translateError(err), 'error');
    } finally {
      setTransferindo(false);
    }
  };

  const alterarSenha = async () => {
    if (novaSenha.length < 6) {
      showToast('Sua nova senha precisa ter pelo menos 6 letras ou números.', 'error');
      return;
    }
    setLoadingSenha(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: novaSenha });
      if (error) throw error;
      showToast('Senha alterada com sucesso!');
      setNovaSenha('');
    } catch (err) {
      showToast(translateError(err), 'error');
    } finally {
      setLoadingSenha(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#1e293b]/90 z-[9000] flex items-center justify-center p-4 backdrop-blur-sm text-left">
      <div className="bg-white rounded-[32px] w-full max-w-2xl p-0 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in duration-300">
        <div className="bg-[#1e293b] p-6 text-white text-center relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-white/10 rounded-full hover:bg-white/20 transition"
          >
            <X size={20} />
          </button>
          <h3 className="font-black text-xl tracking-tighter mb-4">Ajustes & Assinatura</h3>
          <div className="flex gap-1 justify-center bg-black/20 p-1 rounded-xl overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('geral')}
              className={`flex-1 py-2 px-2 rounded-lg text-[10px] font-black uppercase ${
                activeTab === 'geral' ? 'bg-[#84cc16] text-[#1e293b]' : 'text-slate-400'
              }`}
            >
              Condomínio
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('plano')}
              className={`flex-1 py-2 px-2 rounded-lg text-[10px] font-black uppercase ${
                activeTab === 'plano' ? 'bg-[#84cc16] text-[#1e293b]' : 'text-slate-400'
              }`}
            >
              Meu Plano
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('perfil')}
              className={`flex-1 py-2 px-2 rounded-lg text-[10px] font-black uppercase ${
                activeTab === 'perfil' ? 'bg-[#84cc16] text-[#1e293b]' : 'text-slate-400'
              }`}
            >
              Senha
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('sistema')}
              className={`flex-1 py-2 px-2 rounded-lg text-[10px] font-black uppercase ${
                activeTab === 'sistema' ? 'bg-[#84cc16] text-[#1e293b]' : 'text-slate-400'
              }`}
            >
              Dados
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-white">
          {activeTab === 'geral' && (
            <div className="space-y-6">
              <div className="bg-slate-50 p-5 rounded-2xl border">
                <button
                  type="button"
                  onClick={() => setBloqueado(!bloqueado)}
                  className="mb-4 text-[9px] font-black border px-3 py-1.5 rounded-lg bg-white shadow-sm hover:bg-slate-100 transition flex items-center gap-2"
                >
                  <LockKeyhole size={12} /> {bloqueado ? 'DESTRAVAR EDIÇÃO' : 'TRAVAR EDIÇÃO'}
                </button>
                <div className={`space-y-4 ${bloqueado ? 'opacity-50 pointer-events-none' : ''}`}>
                  <label className="block">
                    <span className="text-[10px] font-black text-slate-400 uppercase">
                      Nome do Prédio
                    </span>
                    <input
                      value={local.predioNome}
                      onChange={(e) => setLocal({ ...local, predioNome: e.target.value })}
                      className="w-full border p-3 rounded-xl font-bold"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-black text-slate-400 uppercase">
                      Taxa Mensal Vigente (R$)
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={local.valorCondominio}
                      onChange={(e) =>
                        setLocal({ ...local, valorCondominio: Number(e.target.value) })
                      }
                      className="w-full border p-3 rounded-xl font-bold"
                    />
                    <span className="text-[10px] text-slate-400 font-medium">
                      Alterações de valor valem da competência atual em diante, preservando meses anteriores.
                    </span>
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-black text-slate-400 uppercase">
                      Chave PIX Oficial
                    </span>
                    <input
                      value={local.chavePix}
                      onChange={(e) => setLocal({ ...local, chavePix: e.target.value })}
                      className="w-full border p-3 rounded-xl font-bold"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-black text-slate-400 uppercase">
                      Início Operação (Mês/Ano)
                    </span>
                    <input
                      type="month"
                      value={local.inicioOperacao || ''}
                      onChange={(e) => setLocal({ ...local, inicioOperacao: e.target.value })}
                      className="w-full border p-3 rounded-xl text-sm font-bold"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'plano' && subscription && (
            <div className="space-y-4">
              <div className="bg-slate-900 text-white p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest bg-[#84cc16] text-[#1e293b] px-2.5 py-0.5 rounded-full">
                    {subscription.planConfig.badge}
                  </span>
                  <h4 className="font-black text-lg mt-2">{subscription.planConfig.name}</h4>
                  <p className="text-xs text-slate-400">{subscription.planConfig.tagline}</p>
                  {subscription.isTrial && (
                    <p className="text-xs text-lime-400 font-bold mt-2">
                      Restam {subscription.trialDaysLeft} dias de degustação gratuita.
                    </p>
                  )}
                </div>
                {subscription.effectivePlan !== 'pro' && (
                  <button
                    type="button"
                    onClick={() => onRequestUpgrade('Garanta acesso definitivo ao CondoLeve Pro.')}
                    className="bg-[#84cc16] text-[#1e293b] px-4 py-3 rounded-xl font-black text-xs hover:bg-[#a3e635] transition shrink-0 flex items-center gap-1.5"
                  >
                    <Crown size={14} /> ASSINAR PRO
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Unidades</p>
                  <p className="text-xl font-black text-slate-800 mt-1">
                    {unidadesCount} / {subscription.planConfig.limits.maxUnits}
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Anexos no Mês</p>
                  <p className="text-xl font-black text-slate-800 mt-1">
                    {subscription.uploadsUsed} /{' '}
                    {subscription.planConfig.limits.maxStorageUploadsPerMonth}
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Créditos IA</p>
                  <p className="text-xl font-black text-slate-800 mt-1">
                    {subscription.aiUsed} / {subscription.planConfig.limits.maxAiCreditsPerMonth}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'perfil' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                <h4 className="font-black text-slate-800 text-sm mb-4 flex items-center gap-2">
                  <KeyRound size={16} className="text-orange-500" /> Alterar Minha Senha
                </h4>
                <label className="block mb-3">
                  <span className="text-xs font-black text-slate-600 uppercase">Nova Senha</span>
                  <div className="relative mt-1">
                    <input
                      type={mostrarSenha ? 'text' : 'password'}
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      className="w-full border border-slate-200 p-3.5 pr-12 rounded-xl text-base font-bold outline-none focus:border-[#84cc16]"
                      placeholder="Mínimo de 6 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarSenha(!mostrarSenha)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-500"
                    >
                      {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </label>
                <button
                  type="button"
                  onClick={alterarSenha}
                  disabled={loadingSenha || novaSenha.length < 6}
                  className="bg-[#1e293b] text-white py-3 px-6 rounded-xl font-black text-xs hover:bg-black transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loadingSenha ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}
                  SALVAR NOVA SENHA
                </button>
              </div>

              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full min-h-[48px] bg-red-50 text-red-600 py-3.5 rounded-2xl font-black text-xs hover:bg-red-100 border border-red-200 transition flex items-center justify-center gap-2"
                >
                  <LogOut size={16} /> SAIR DA MINHA CONTA (LOGOUT)
                </button>
              )}
            </div>
          )}

          {activeTab === 'sistema' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl text-left">
                <h4 className="text-blue-800 font-black text-sm mb-2 flex items-center gap-2">
                  <Database size={16} /> Cópia de Segurança (JSON)
                </h4>
                <p className="text-xs text-blue-600 mb-4 font-medium">
                  Baixe um arquivo com todos os registros do condomínio para guarda externa.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (!allowBackup) {
                      onRequestUpgrade('Exportação completa de Backup JSON faz parte do CondoLeve Pro.');
                      return;
                    }
                    exportarBackup();
                  }}
                  className="w-full bg-blue-500 text-white py-3 rounded-xl font-black text-xs shadow-lg hover:bg-blue-600 transition flex items-center justify-center gap-2"
                >
                  {allowBackup ? <Download size={14} /> : <Lock size={14} />} EXPORTAR BACKUP
                </button>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl text-left">
                <h4 className="text-amber-900 font-black text-sm mb-1.5 flex items-center gap-2">
                  <Crown size={16} className="text-amber-600" /> Transferir Administração (Sucessão de Síndico)
                </h4>
                <p className="text-xs text-amber-800 mb-3 font-medium leading-relaxed">
                  Mudou o síndico na assembleia? Passe o controle do prédio para o novo síndico mantendo todo o histórico financeiro intacto. Você passará a acessar como morador/conselheiro.
                </p>

                {loadingMembros ? (
                  <div className="py-3 flex justify-center">
                    <RefreshCw className="animate-spin text-amber-600" size={18} />
                  </div>
                ) : membrosSucessao.length > 0 ? (
                  <div className="space-y-2.5">
                    <select
                      value={novoSindicoId}
                      onChange={(e) => setNovoSindicoId(e.target.value)}
                      className="w-full border border-amber-200 bg-white p-3 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-amber-500"
                    >
                      {membrosSucessao.map((m) => (
                        <option key={m.userId} value={m.userId}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={!novoSindicoId || transferindo}
                      onClick={() => {
                        const selecionado = membrosSucessao.find((m) => m.userId === novoSindicoId);
                        triggerConfirm({
                          titulo: 'Transferir Síndico?',
                          texto: `Você está passando a administração do condomínio para: ${selecionado?.label}. Após confirmar, você perderá os poderes de síndico.`,
                          onConfirm: () => {
                            triggerConfirm(null);
                            executarTransferenciaSindico(novoSindicoId);
                          },
                        });
                      }}
                      className="w-full min-h-[44px] bg-amber-600 text-white py-3 rounded-xl font-black text-xs hover:bg-amber-700 transition shadow-md disabled:opacity-50"
                    >
                      {transferindo ? 'TRANSFERINDO...' : 'TRANSFERIR CARGO DE SÍNDICO'}
                    </button>
                  </div>
                ) : (
                  <p className="text-[11px] font-bold text-amber-700 bg-white/70 p-3 rounded-xl border border-amber-200">
                    Para transferir, o novo síndico precisa primeiro entrar no prédio pelo link de convite e ser aprovado em Moradores.
                  </p>
                )}
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 text-center">
                <h4 className="text-red-600 font-black text-xs mb-2 uppercase">Zona de Perigo</h4>
                <button
                  type="button"
                  onClick={() =>
                    triggerConfirm({
                      titulo: 'Resetar Tudo?',
                      texto:
                        'Isso apagará TODOS os dados do prédio irrevogavelmente, sem possibilidade de recuperação.',
                      onConfirm: () => {
                        resetar();
                        triggerConfirm(null);
                      },
                    })
                  }
                  className="w-full py-4 bg-red-50 text-red-500 font-black text-xs hover:bg-red-100 rounded-xl border border-red-200 transition"
                >
                  LIMPAR CONDOMÍNIO (RESET TOTAL)
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-50 border-t flex gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-4 text-slate-400 font-bold text-xs uppercase hover:text-slate-600 transition"
          >
            Fechar
          </button>
          {activeTab === 'geral' && (
            <button
              type="button"
              onClick={() => {
                setConfig(local);
                onClose();
              }}
              className="flex-1 bg-[#84cc16] text-[#1e293b] rounded-2xl font-black text-xs shadow-xl active:scale-95"
            >
              SALVAR MUDANÇAS
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function ModalNovaUnidade({ onClose, onSave }) {
  const [numero, setNumero] = useState('');
  const [proprietarioNome, setProprietarioNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [isentoTaxa, setIsentoTaxa] = useState(false);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Adicionar Apartamento"
      className="fixed inset-0 bg-[#1e293b]/90 z-[9000] flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm text-left"
    >
      <div className="bg-white rounded-t-[32px] sm:rounded-[32px] w-full max-w-sm p-6 shadow-2xl animate-in slide-in-from-bottom-10">
        <div className="flex justify-between items-center mb-5 border-b pb-4">
          <h3 className="font-black text-xl text-slate-800 flex items-center gap-2">
            <PlusCircle className="text-[#84cc16]" /> Novo Apartamento
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-slate-100 rounded-full hover:bg-slate-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="text-xs font-black text-slate-600 uppercase">
              Número / Identificação *
            </span>
            <input
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              placeholder="Ex: 304, Cobertura, Loja 1"
              className="w-full border-2 border-slate-200 p-3.5 rounded-xl font-bold text-base outline-none focus:border-[#84cc16] mt-1"
            />
          </label>
          <label className="block">
            <span className="text-xs font-black text-slate-600 uppercase">
              Nome do Proprietário (Opcional)
            </span>
            <input
              value={proprietarioNome}
              onChange={(e) => setProprietarioNome(e.target.value)}
              placeholder="Ex: José da Silva"
              className="w-full border-2 border-slate-200 p-3.5 rounded-xl font-bold text-base outline-none focus:border-[#84cc16] mt-1"
            />
          </label>
          <label className="block">
            <span className="text-xs font-black text-slate-600 uppercase">
              WhatsApp (Opcional)
            </span>
            <input
              value={maskPhone(telefone)}
              onChange={(e) => setTelefone(maskPhone(e.target.value))}
              placeholder="(11) 99999-9999"
              className="w-full border-2 border-slate-200 p-3.5 rounded-xl font-bold text-base outline-none focus:border-[#84cc16] mt-1"
            />
          </label>
          <label className="flex items-center gap-3 cursor-pointer bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <input
              type="checkbox"
              checked={isentoTaxa}
              onChange={(e) => setIsentoTaxa(e.target.checked)}
              className="accent-[#84cc16] w-5 h-5"
            />
            <span className="text-xs font-bold text-slate-700">
              Unidade isenta da taxa condominial
            </span>
          </label>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 min-h-[48px] py-3 text-slate-500 font-bold bg-slate-100 rounded-xl hover:bg-slate-200"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!numero.trim()}
            onClick={() =>
              onSave({
                numero: numero.trim(),
                proprietario: { nome: proprietarioNome.trim(), telefone },
                inquilino: {},
                mora_proprietario: true,
                isento_taxa: isentoTaxa,
              })
            }
            className="flex-1 min-h-[48px] py-3 text-white font-black bg-[#1e293b] rounded-xl hover:bg-black shadow-lg disabled:opacity-50"
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}

export function ModalAuditoria({ logs, loading, onClose }) {
  const formatOp = (op) => {
    if (op === 'INSERT') return { label: 'Inclusão', color: 'bg-green-100 text-green-700' };
    if (op === 'UPDATE') return { label: 'Alteração', color: 'bg-blue-100 text-blue-700' };
    if (op === 'DELETE') return { label: 'Exclusão', color: 'bg-red-100 text-red-700' };
    return { label: op, color: 'bg-slate-100 text-slate-700' };
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Histórico de Auditoria"
      className="fixed inset-0 bg-[#1e293b]/90 z-[9000] flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm text-left"
    >
      <div className="bg-white rounded-t-[32px] sm:rounded-[32px] w-full max-w-lg p-6 shadow-2xl animate-in slide-in-from-bottom-10 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-5 border-b pb-4">
          <h3 className="font-black text-xl text-slate-800 flex items-center gap-2">
            <History className="text-slate-600" /> Auditoria do Caixa
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-slate-100 rounded-full hover:bg-slate-200"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-xs text-slate-500 font-medium mb-4 leading-relaxed">
          Registro automático e imutável de quem lançou, editou ou excluiu movimentações financeiras
          para total transparência com o Conselho Fiscal.
        </p>

        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 pb-2">
          {loading ? (
            <div className="py-12 flex justify-center">
              <RefreshCw className="animate-spin text-[#84cc16]" />
            </div>
          ) : logs && logs.length > 0 ? (
            logs.map((log) => {
              const badge = formatOp(log.operacao);
              const payload = log.dados_novos || log.dados_antigos || {};
              return (
                <div
                  key={log.id}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 space-y-1"
                >
                  <div className="flex justify-between items-center gap-2">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${badge.color}`}>
                      {badge.label} • {log.tabela}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {new Date(log.criado_em).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-700">
                    {payload.descricao
                      ? `${payload.descricao} (R$ ${Number(payload.valor || 0).toFixed(2)})`
                      : payload.valor
                      ? `Recebimento R$ ${Number(payload.valor).toFixed(2)} (${payload.mes || ''}/${payload.ano || ''})`
                      : `Registro #${log.registro_id || '-'}`}
                  </p>
                </div>
              );
            })
          ) : (
            <EmptyState
              icon={History}
              title="Sem registros ainda"
              desc="As novas inclusões, alterações e exclusões aparecerão aqui."
            />
          )}
        </div>
      </div>
    </div>
  );
}
