import React, { useState } from 'react';
import {
  X,
  PlusCircle,
  Trash2,
  Coins,
  BookMarked,
  Upload,
  CheckCircle,
  RefreshCw,
  Copy,
  FileText,
  Lock,
  ExternalLink,
  CheckSquare,
} from 'lucide-react';
import { EmptyState } from '../../components/ui/EmptyState';
import { MESES, formatarMoeda } from '../../utils/helpers';
import { uploadCondoDocument } from '../../lib/storage';
import { canUseFeature } from '../../config/plans';

export function ModalRateioExtra({
  rateios = [],
  unidades = [],
  mesAtual,
  anoAtual,
  onClose,
  onCreate,
  onDelete,
  subscription,
  onRequestUpgrade,
  readOnly = false,
}) {
  const [titulo, setTitulo] = useState('');
  const [valorTotal, setValorTotal] = useState('');
  const [parcelas, setParcelas] = useState(1);
  const [mesInicio, setMesInicio] = useState(mesAtual);
  const [anoInicio, setAnoInicio] = useState(anoAtual);
  const [tipoCobranca, setTipoCobranca] = useState('extraordinaria');
  const [incluirIsentos, setIncluirIsentos] = useState(true);
  const [saving, setSaving] = useState(false);

  const allowRateio = subscription?.isPro || false;
  const qtdPagantes = unidades.filter((u) => incluirIsentos || !u.isento_taxa).length;
  const totalNum = Number(valorTotal) || 0;
  const valorParcelaTotal = parcelas > 0 ? totalNum / Number(parcelas) : 0;
  const valorPorUnidadePrevisto = qtdPagantes > 0 ? valorParcelaTotal / qtdPagantes : 0;

  const handleSalvar = async () => {
    if (!allowRateio) {
      onRequestUpgrade('Rateio e Cota Extra com divisão automática fazem parte do CondoLeve Pro.');
      return;
    }
    if (!titulo.trim() || totalNum <= 0 || qtdPagantes <= 0) return;

    setSaving(true);
    try {
      const startIdx = MESES.indexOf(mesInicio);
      const itens = [];
      const valorPorUnidadeArredondado = Math.round(valorPorUnidadePrevisto * 100) / 100;
      const valorParcelaArredondado = Math.round(valorParcelaTotal * 100) / 100;

      for (let i = 0; i < Number(parcelas); i++) {
        const d = new Date(Number(anoInicio), startIdx + i, 1);
        itens.push({
          titulo: Number(parcelas) > 1 ? `${titulo.trim()} (${i + 1}/${parcelas})` : titulo.trim(),
          valor_total: valorParcelaArredondado,
          valor_por_unidade: valorPorUnidadeArredondado,
          mes: MESES[d.getMonth()],
          ano: d.getFullYear(),
          tipo_cobranca: tipoCobranca,
          incluir_isentos: incluirIsentos,
        });
      }

      await onCreate(itens);
      setTitulo('');
      setValorTotal('');
      setParcelas(1);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Rateio e Cota Extra"
      className="fixed inset-0 bg-[#1e293b]/90 z-[9000] flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm text-left"
    >
      <div className="bg-white rounded-t-[32px] sm:rounded-[32px] w-full max-w-lg p-6 shadow-2xl animate-in slide-in-from-bottom-10 max-h-[92vh] flex flex-col">
        <div className="flex justify-between items-center mb-5 border-b pb-4">
          <h3 className="font-black text-xl text-slate-800 flex items-center gap-2">
            <Coins className="text-amber-500" /> Rateio / Cota Extra
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

        <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-2">
          {!readOnly && (
            <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl space-y-3">
              <label className="block">
                <span className="text-xs font-black text-slate-600 uppercase">
                  Motivo do Rateio *
                </span>
                <input
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Pintura do Portão, Troca da Bomba"
                  className="w-full border border-amber-200 bg-white p-3 rounded-xl font-bold text-sm outline-none focus:border-amber-500 mt-1"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs font-black text-slate-600 uppercase">
                    Valor Total (R$) *
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={valorTotal}
                    onChange={(e) => setValorTotal(e.target.value)}
                    placeholder="Ex: 1200"
                    className="w-full border border-amber-200 bg-white p-3 rounded-xl font-black text-sm text-amber-700 outline-none focus:border-amber-500 mt-1"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-black text-slate-600 uppercase">Parcelas</span>
                  <select
                    value={parcelas}
                    onChange={(e) => setParcelas(Number(e.target.value))}
                    className="w-full border border-amber-200 bg-white p-3 rounded-xl font-bold text-sm outline-none mt-1"
                  >
                    {[1, 2, 3, 4, 5, 6, 10, 12].map((n) => (
                      <option key={n} value={n}>
                        {n}x {n === 1 ? '(À vista)' : 'mensais'}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs font-black text-slate-600 uppercase">Mês Inicial</span>
                  <select
                    value={mesInicio}
                    onChange={(e) => setMesInicio(e.target.value)}
                    className="w-full border border-amber-200 bg-white p-3 rounded-xl font-bold text-xs outline-none mt-1"
                  >
                    {MESES.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-black text-slate-600 uppercase">Ano</span>
                  <input
                    type="number"
                    value={anoInicio}
                    onChange={(e) => setAnoInicio(Number(e.target.value))}
                    className="w-full border border-amber-200 bg-white p-3 rounded-xl font-bold text-xs outline-none mt-1"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-xs font-black text-slate-600 uppercase">
                  Quem responde pela despesa? (Lei do Inquilinato)
                </span>
                <select
                  value={tipoCobranca}
                  onChange={(e) => setTipoCobranca(e.target.value)}
                  className="w-full border border-amber-200 bg-white p-3 rounded-xl font-bold text-xs outline-none mt-1"
                >
                  <option value="extraordinaria">
                    Extraordinária (Obra/Reforma — Responsabilidade do Proprietário)
                  </option>
                  <option value="ordinaria">
                    Ordinária (Custeio/Manutenção — Responsabilidade do Morador/Inquilino)
                  </option>
                </select>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer bg-white p-3 rounded-xl border border-amber-200">
                <input
                  type="checkbox"
                  checked={incluirIsentos}
                  onChange={(e) => setIncluirIsentos(e.target.checked)}
                  className="accent-amber-500 w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-700">
                  Incluir unidades isentas (ex.: apto do síndico entra no rateio)
                </span>
              </label>

              {totalNum > 0 && qtdPagantes > 0 && (
                <div className="bg-white border border-amber-200 p-3 rounded-xl text-xs text-slate-700 flex justify-between items-center">
                  <span>
                    Divisão entre <b>{qtdPagantes} aptos</b> ({parcelas}x):
                  </span>
                  <span className="font-black text-amber-700 text-sm">
                    {formatarMoeda(valorPorUnidadePrevisto)} / apto por mês
                  </span>
                </div>
              )}

              <button
                type="button"
                disabled={saving || !titulo.trim() || totalNum <= 0}
                onClick={handleSalvar}
                className="w-full min-h-[46px] bg-[#1e293b] text-white py-3 rounded-xl font-black text-xs hover:bg-black transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {allowRateio ? <PlusCircle size={15} /> : <Lock size={14} className="text-[#84cc16]" />}
                {saving ? 'LANÇANDO...' : 'LANÇAR RATEIO NAS UNIDADES'}
              </button>
            </div>
          )}

          <div className="space-y-2.5">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Cotas Extras Lançadas
            </p>
            {rateios.length > 0 ? (
              rateios.map((r) => (
                <div
                  key={r.id}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-xs text-slate-800">{r.titulo}</span>
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                          r.tipo_cobranca === 'extraordinaria'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {r.tipo_cobranca === 'extraordinaria' ? 'Proprietário' : 'Morador/Inquilino'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-bold mt-1">
                      {r.mes}/{r.ano} • {formatarMoeda(r.valor_por_unidade)} por apto (Total:{' '}
                      {formatarMoeda(r.valor_total)})
                    </p>
                  </div>
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => onDelete(r.id)}
                      className="text-slate-300 hover:text-red-500 p-2"
                      aria-label="Excluir rateio"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <EmptyState
                icon={Coins}
                title="Nenhuma Cota Extra"
                desc="Rateios de obras ou reformas aparecerão aqui separados da mensalidade."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ModalConvencaoAssembleia({
  config,
  setConfig,
  onClose,
  supabase,
  condominioId,
  showToast,
  subscription,
  onRequestUpgrade,
  readOnly = false,
}) {
  const [aba, setAba] = useState('regras');
  const [conv, setConv] = useState(() => ({
    possuiConvencao: config?.convencao?.possuiConvencao ?? true,
    horarioSilencio: config?.convencao?.horarioSilencio || '22h às 7h',
    regrasMudanca: config?.convencao?.regrasMudanca || 'Segunda a sábado, das 8h às 18h (avisar síndico).',
    regrasGerais:
      config?.convencao?.regrasGerais ||
      '• Manter portões sempre fechados;\n• Não deixar objetos ou lixo nas escadas/corredores;\n• Respeitar vagas demarcadas na garagem.',
    urlPdf: config?.convencao?.urlPdf || '',
  }));
  const [uploading, setUploading] = useState(false);

  const allowPro = subscription?.isPro || false;
  const allowUpload = canUseFeature(subscription, 'upload');

  const modeloAta = `EDITAL DE CONVOCAÇÃO & PAUTA — 1ª ASSEMBLEIA DE ORGANIZAÇÃO
Condomínio: ${config?.predioNome || 'Nosso Condomínio'}

Prezados proprietários e moradores,
Convidamos todos para nossa reunião de alinhamento para definirmos juntos as regras básicas de convivência e aprovação do nosso Regimento Interno.

Data: ___/___/_____ às ___h___
Local: Hall / Garagem do prédio

PAUTA DO DIA:
1. Definição oficial do horário de silêncio e regras de mudança/obras;
2. Uso das áreas comuns (garagem, corredores, lixo, animais de estimação);
3. Confirmação do Síndico(a) (${config?.sindicaNome || 'A definir'}) e Conselheiro Fiscal;
4. Prestação de contas transparente via aplicativo CondoLeve.

Observação: Caso o proprietário não possa comparecer, pode enviar representante com autorização simples por escrito.`;

  const handleUploadPdf = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!allowUpload) {
      onRequestUpgrade('Armazenar o PDF da Convenção na nuvem faz parte do CondoLeve Pro.');
      return;
    }
    setUploading(true);
    try {
      const res = await uploadCondoDocument({
        supabase,
        condominioId,
        category: 'convencao',
        rawFile: file,
      });
      setConv((prev) => ({ ...prev, urlPdf: res.publicUrl }));
      showToast('Documento da Convenção anexado!');
    } catch (err) {
      showToast(err.message || 'Erro no upload.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const salvarConvencao = () => {
    if (!allowPro) {
      onRequestUpgrade('Salvar e publicar a Convenção/Regimento para os moradores faz parte do CondoLeve Pro.');
      return;
    }
    setConfig({ ...config, convencao: conv });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Convenção e Assembleia Guiada"
      className="fixed inset-0 bg-[#1e293b]/90 z-[9000] flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm text-left"
    >
      <div className="bg-white rounded-t-[32px] sm:rounded-[32px] w-full max-w-lg p-6 shadow-2xl animate-in slide-in-from-bottom-10 max-h-[92vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 border-b pb-4">
          <h3 className="font-black text-xl text-slate-800 flex items-center gap-2">
            <BookMarked className="text-indigo-600" /> Convenção &amp; Reunião
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

        <div className="flex gap-1.5 bg-slate-100 p-1.5 rounded-2xl mb-4 shrink-0">
          <button
            type="button"
            onClick={() => setAba('regras')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition ${
              aba === 'regras' ? 'bg-white text-[#1e293b] shadow-sm' : 'text-slate-500'
            }`}
          >
            Regras do Prédio
          </button>
          <button
            type="button"
            onClick={() => setAba('guia')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition ${
              aba === 'guia' ? 'bg-white text-[#1e293b] shadow-sm' : 'text-slate-500'
            }`}
          >
            Criar 1ª Convenção
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-2">
          {aba === 'regras' ? (
            <>
              <label className="block">
                <span className="text-xs font-black text-slate-600 uppercase">
                  Horário de Silêncio
                </span>
                <input
                  readOnly={readOnly}
                  value={conv.horarioSilencio}
                  onChange={(e) => setConv({ ...conv, horarioSilencio: e.target.value })}
                  className="w-full border border-slate-200 p-3 rounded-xl text-sm font-bold mt-1"
                />
              </label>

              <label className="block">
                <span className="text-xs font-black text-slate-600 uppercase">
                  Horário de Mudanças &amp; Reformas
                </span>
                <input
                  readOnly={readOnly}
                  value={conv.regrasMudanca}
                  onChange={(e) => setConv({ ...conv, regrasMudanca: e.target.value })}
                  className="w-full border border-slate-200 p-3 rounded-xl text-sm font-bold mt-1"
                />
              </label>

              <label className="block">
                <span className="text-xs font-black text-slate-600 uppercase">
                  Resumo do Regimento Interno (Visível aos Moradores)
                </span>
                <textarea
                  readOnly={readOnly}
                  value={conv.regrasGerais}
                  onChange={(e) => setConv({ ...conv, regrasGerais: e.target.value })}
                  className="w-full border border-slate-200 p-3 rounded-xl text-xs font-semibold h-28 mt-1 resize-none"
                />
              </label>

              <div className="bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200 space-y-2">
                {conv.urlPdf && (
                  <a
                    href={conv.urlPdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-indigo-50 text-indigo-700 py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:bg-indigo-100 transition"
                  >
                    <ExternalLink size={14} /> ABRIR DOCUMENTO DA CONVENÇÃO
                  </a>
                )}
                {!readOnly && (
                  <label className="cursor-pointer text-xs font-bold text-slate-500 flex items-center justify-center gap-2 hover:text-indigo-600 transition py-1">
                    {uploading ? (
                      <RefreshCw size={15} className="animate-spin" />
                    ) : conv.urlPdf ? (
                      <CheckCircle size={15} className="text-green-600" />
                    ) : (
                      <Upload size={15} />
                    )}
                    {conv.urlPdf ? 'Substituir PDF/Foto da Convenção' : 'Anexar PDF da Convenção (Opcional)'}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,.pdf"
                      onChange={handleUploadPdf}
                    />
                  </label>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
              <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl space-y-2">
                <p className="font-black text-indigo-900 text-sm flex items-center gap-1.5">
                  <CheckSquare size={16} /> Como formalizar sem administradora:
                </p>
                <p>1. <strong>Avise com 7 a 10 dias de antecedência</strong> no mural do CondoLeve e no WhatsApp.</p>
                <p>2. <strong>Faça uma lista de presença</strong> com assinatura dos proprietários presentes.</p>
                <p>3. <strong>Votem as regras práticas</strong> (silêncio, lixo, mudança, valor da taxa) e registrem em uma ata simples.</p>
                <p>4. <strong>Salve na aba ao lado</strong> para todo morador novo já entrar sabendo das regras!</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
                <p className="font-black text-slate-800 text-xs uppercase flex items-center gap-1.5">
                  <FileText size={14} /> Modelo Pronto de Convocação &amp; Pauta
                </p>
                <pre className="whitespace-pre-wrap font-sans text-[11px] bg-white p-3 rounded-xl border border-slate-200 text-slate-700 max-h-48 overflow-y-auto">
                  {modeloAta}
                </pre>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(modeloAta);
                    showToast?.('Modelo de Pauta copiado! Cole no WhatsApp ou Word.');
                  }}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-black text-xs hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                >
                  <Copy size={14} /> COPIAR MODELO PRONTO
                </button>
              </div>
            </div>
          )}
        </div>

        {aba === 'regras' && !readOnly && (
          <div className="pt-4 mt-2 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={salvarConvencao}
              className="w-full min-h-[48px] bg-[#1e293b] text-white py-3.5 rounded-2xl font-black text-xs hover:bg-black transition flex items-center justify-center gap-2"
            >
              {!allowPro && <Lock size={13} className="text-[#84cc16]" />}
              SALVAR CONVENÇÃO &amp; PUBLICAR
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
