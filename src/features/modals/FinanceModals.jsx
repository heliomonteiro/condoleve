import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  MonitorPlay,
  X,
  DollarSign,
  RefreshCw,
  CheckCircle,
  Upload,
  Paperclip,
  Receipt,
  Share2,
  Trash2,
  PlusCircle,
  Copy,
  Download,
  ArrowDownCircle,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Wallet,
  ShieldCheck,
  PieChart,
  Building,
  FileSpreadsheet,
  Lock,
  EyeOff,
  Eye,
} from 'lucide-react';
import { Logo } from '../../components/ui/Logo';
import { uploadCondoDocument } from '../../lib/storage';
import { extractDocumentWithAI } from '../../lib/aiClient';
import { canUseFeature } from '../../config/plans';

export function ModalConfirmacao({ data, onClose }) {
  return (
    <div className="fixed inset-0 bg-[#1e293b]/90 z-[10100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-[32px] p-6 max-w-sm w-full shadow-2xl animate-in zoom-in text-center">
        <div className="bg-red-50 text-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={32} />
        </div>
        <h3 className="text-xl font-black text-slate-800 mb-2">{data.titulo}</h3>
        <p className="text-sm text-slate-500 mb-6">{data.texto}</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 text-slate-500 font-bold bg-slate-100 rounded-xl hover:bg-slate-200 transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={data.onConfirm}
            className="flex-1 py-3 text-white font-black bg-red-500 rounded-xl hover:bg-red-600 transition shadow-lg"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

export function ModalInstalarApp({ onClose }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const instalarNativo = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#1e293b]/90 z-[9000] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in text-center relative overflow-hidden">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-800"
        >
          <X size={20} />
        </button>
        <div className="bg-[#84cc16]/10 text-[#84cc16] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <MonitorPlay size={40} />
        </div>
        <h3 className="text-2xl font-black text-slate-800 mb-2">Instale o App</h3>
        <p className="text-sm text-slate-500 mb-6 font-medium">
          O CondoLeve funciona direto no seu celular como um aplicativo rápido e leve.
        </p>

        {deferredPrompt ? (
          <button
            type="button"
            onClick={instalarNativo}
            className="w-full bg-[#84cc16] text-[#1e293b] py-4 rounded-xl font-black text-xs uppercase hover:bg-[#a3e635] transition mb-3 shadow-lg"
          >
            INSTALAR AGORA NA TELA INICIAL
          </button>
        ) : (
          <div className="text-left bg-slate-50 p-4 rounded-2xl space-y-3 mb-6">
            <div className="text-xs font-bold text-slate-700 flex items-start gap-2">
              <div className="bg-[#1e293b] text-white w-5 h-5 rounded flex items-center justify-center shrink-0">
                1
              </div>
              Abra as opções do navegador (três pontinhos no Android ou Compartilhar no iPhone).
            </div>
            <div className="text-xs font-bold text-slate-700 flex items-start gap-2">
              <div className="bg-[#1e293b] text-white w-5 h-5 rounded flex items-center justify-center shrink-0">
                2
              </div>
              Toque em &ldquo;Adicionar à Tela de Início&rdquo;.
            </div>
            <div className="text-xs font-bold text-slate-700 flex items-start gap-2">
              <div className="bg-[#1e293b] text-white w-5 h-5 rounded flex items-center justify-center shrink-0">
                3
              </div>
              Confirme e acesse pelo ícone oficial na tela inicial!
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full bg-[#1e293b] text-white py-4 rounded-xl font-black text-xs hover:bg-black transition"
        >
          ENTENDI
        </button>
      </div>
    </div>
  );
}

export function ModalReceber({
  valorSugerido,
  onClose,
  onConfirm,
  supabase,
  condominioId,
  showToast,
  subscription,
  onRequestUpgrade,
}) {
  const [valor, setValor] = useState(valorSugerido || '');
  const [data, setData] = useState(() => new Date().toLocaleDateString('pt-BR'));
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const allowUpload = canUseFeature(subscription, 'upload');

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!allowUpload) {
      onRequestUpgrade('Anexar comprovantes na nuvem é um recurso do CondoLeve Pro.');
      return;
    }

    try {
      setLoading(true);
      const result = await uploadCondoDocument({
        supabase,
        condominioId,
        category: 'pagamentos',
        rawFile: file,
      });
      setUrl(result.publicUrl);
      showToast('Comprovante comprimido e anexado!');
    } catch (err) {
      if (err.code === 'PLAN_LIMIT_REACHED') {
        onRequestUpgrade(err.message);
      } else {
        showToast(err.message || 'Erro no upload', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#1e293b]/90 z-[9000] flex items-center justify-center p-4 backdrop-blur-sm text-left">
      <div className="bg-white rounded-[32px] p-6 max-w-sm w-full shadow-2xl animate-in zoom-in">
        <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
          <DollarSign className="text-green-500" /> Receber Pagamento
        </h3>
        <div className="space-y-4">
          <label className="block">
            <span className="text-[10px] font-black text-slate-400 uppercase">Valor (R$)</span>
            <input
              type="number"
              step="0.01"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="w-full border p-3 rounded-xl font-bold text-green-600 outline-none focus:border-[#84cc16]"
            />
          </label>
          <label className="block">
            <span className="text-[10px] font-black text-slate-400 uppercase">Data (DD/MM/AAAA)</span>
            <input
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full border p-3 rounded-xl font-bold outline-none focus:border-[#84cc16]"
            />
          </label>

          {allowUpload ? (
            <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200 text-center">
              <label className="cursor-pointer text-xs font-bold text-slate-500 flex flex-col items-center gap-2 hover:text-[#84cc16] transition">
                {loading ? (
                  <RefreshCw className="animate-spin text-slate-400" size={24} />
                ) : url ? (
                  <CheckCircle className="text-green-500" size={24} />
                ) : (
                  <Upload className="text-slate-400" size={24} />
                )}
                {url ? 'Comprovante Anexado!' : 'Anexar Comprovante (Opcional)'}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={handleUpload}
                />
              </label>
            </div>
          ) : (
            <button
              type="button"
              onClick={() =>
                onRequestUpgrade('Anexar comprovantes na nuvem é exclusivo do CondoLeve Pro.')
              }
              className="w-full bg-slate-50 p-3.5 rounded-xl border border-dashed border-slate-200 text-xs font-bold text-slate-400 hover:text-slate-700 flex items-center justify-center gap-2 transition"
            >
              <Lock size={14} className="text-[#84cc16]" /> Anexar Comprovante (Plano Pro)
            </button>
          )}
        </div>
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 text-slate-500 font-bold bg-slate-100 rounded-xl hover:bg-slate-200"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={Number(valor) <= 0 || loading}
            onClick={() => onConfirm(Number(valor), data, url)}
            className="flex-1 py-3 text-white font-black bg-[#1e293b] rounded-xl hover:bg-black shadow-lg disabled:opacity-50"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

export function ModalDetalhesUnidade({
  dados,
  onClose,
  onAdd,
  onDelete,
  fmt,
  enviarRecibo,
  supabase,
  condominioId,
  setModalReciboVisual,
  onUpdatePagamento,
  showToast,
  subscription,
  onRequestUpgrade,
  readOnly = false,
}) {
  const { u, mes, ano, pags, totalPago, valorDevido } = dados;
  const isPago = u.isento_taxa || totalPago >= valorDevido;
  const [mostrarNovoForm, setMostrarNovoForm] = useState(false);
  const [novoValor, setNovoValor] = useState(() => Math.max(0, valorDevido - totalPago));
  const [novaData, setNovaData] = useState(() => new Date().toLocaleDateString('pt-BR'));

  const allowUpload = canUseFeature(subscription, 'upload');

  const handleUploadExistente = async (e, pid) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!allowUpload) {
      onRequestUpgrade('Armazenamento de comprovantes na nuvem faz parte do CondoLeve Pro.');
      return;
    }

    try {
      const result = await uploadCondoDocument({
        supabase,
        condominioId,
        category: 'pagamentos',
        rawFile: file,
      });
      onUpdatePagamento(pid, result.publicUrl);
    } catch (err) {
      if (err.code === 'PLAN_LIMIT_REACHED') {
        onRequestUpgrade(err.message);
      } else {
        showToast(err.message || 'Erro inesperado', 'error');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-[#1e293b]/90 z-[9000] flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm text-left">
      <div className="bg-white rounded-t-[32px] sm:rounded-[32px] w-full max-w-md p-6 shadow-2xl animate-in slide-in-from-bottom-10 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <div>
            <h3 className="font-black text-xl text-slate-800">Apto {u.numero}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase">
              {mes}/{ano}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4 flex justify-between items-center">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase">Total Pago</p>
            <p className={`text-2xl font-black ${isPago ? 'text-[#84cc16]' : 'text-yellow-600'}`}>
              {u.isento_taxa ? 'ISENTO' : fmt(totalPago)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase">Fatura</p>
            <p className="text-lg font-bold text-slate-600">
              {u.isento_taxa ? 'R$ 0,00' : fmt(valorDevido)}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4">
          <p className="text-[10px] font-black text-slate-400 uppercase border-b pb-1">
            Histórico deste Mês
          </p>
          {pags.map((p) => (
            <div
              key={p.id}
              className="bg-white border border-slate-200 p-3 rounded-xl flex justify-between items-center shadow-sm"
            >
              <div>
                <p className="font-black text-slate-800">{fmt(p.valor)}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase">{p.data}</p>
              </div>
              <div className="flex gap-2">
                {p.url_comprovante ? (
                  <a
                    href={p.url_comprovante}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-100"
                    title="Ver comprovante"
                  >
                    <Paperclip size={14} />
                  </a>
                ) : (
                  !readOnly && (
                    <label
                      className="p-2 bg-slate-100 text-slate-400 rounded-lg hover:bg-slate-200 cursor-pointer"
                      title="Anexar comprovante"
                    >
                      <Upload size={14} />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,.pdf"
                        onChange={(e) => handleUploadExistente(e, p.id)}
                      />
                    </label>
                  )
                )}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setModalReciboVisual({ pagamento: p, unidade: u });
                  }}
                  className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
                  title="Recibo Digital"
                >
                  <Receipt size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => enviarRecibo(p, u)}
                  className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                  title="Enviar WhatsApp"
                >
                  <Share2 size={14} />
                </button>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => onDelete(p.id)}
                    className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"
                    title="Remover"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
          {pags.length === 0 && (
            <p className="text-center text-xs text-slate-400 py-4 italic">
              Nenhum pagamento registrado.
            </p>
          )}
        </div>

        {!isPago && !readOnly && (
          <div>
            {mostrarNovoForm ? (
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={novoValor}
                    onChange={(e) => setNovoValor(e.target.value)}
                    placeholder="Valor R$"
                    className="w-1/2 border p-2.5 rounded-xl text-xs font-bold"
                  />
                  <input
                    value={novaData}
                    onChange={(e) => setNovaData(e.target.value)}
                    placeholder="DD/MM/AAAA"
                    className="w-1/2 border p-2.5 rounded-xl text-xs font-bold"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMostrarNovoForm(false)}
                    className="flex-1 py-2.5 text-xs font-bold bg-white border rounded-xl text-slate-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (Number(novoValor) > 0 && novaData) {
                        onAdd(Number(novoValor), novaData, null);
                        setMostrarNovoForm(false);
                      }
                    }}
                    className="flex-1 py-2.5 text-xs font-black bg-[#1e293b] text-white rounded-xl"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setMostrarNovoForm(true)}
                className="w-full bg-[#1e293b] text-white py-4 rounded-xl font-black text-xs hover:bg-black shadow-lg flex justify-center items-center gap-2"
              >
                <PlusCircle size={16} /> ADICIONAR COMPLEMENTO DE PAGAMENTO
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function ModalReciboVisual({
  pagamento,
  unidade,
  config,
  onClose,
  fmt,
  enviarWhatsApp,
  showToast,
}) {
  const [gerando, setGerando] = useState(false);

  const renderCanvas = async () => {
    const elemento = document.getElementById('recibo-pdf');
    if (!elemento) return null;
    const { default: html2canvas } = await import('html2canvas');
    return html2canvas(elemento, { scale: 3, backgroundColor: '#ffffff', useCORS: true });
  };

  const baixarImagem = async () => {
    setGerando(true);
    try {
      const canvas = await renderCanvas();
      if (!canvas) return;
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `Recibo_Apto_${unidade.numero}_${pagamento.mes}_${pagamento.ano}.png`;
      a.click();
    } catch (err) {
      console.error('Erro ao gerar imagem:', err);
      showToast?.('Erro ao baixar recibo.', 'error');
    } finally {
      setGerando(false);
    }
  };

  const copiarImagem = async () => {
    setGerando(true);
    try {
      const canvas = await renderCanvas();
      if (!canvas) return;
      canvas.toBlob(async (blob) => {
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          showToast?.('Imagem copiada! Cole (Ctrl+V) na conversa do WhatsApp.');
        } catch {
          showToast?.('Seu navegador bloqueou a cópia direta. Use o botão BAIXAR.', 'error');
        }
      }, 'image/png');
    } catch (err) {
      console.error('Erro ao copiar imagem:', err);
    } finally {
      setGerando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#1e293b]/95 z-[9500] flex items-center justify-center p-4 backdrop-blur-md">
      <div className="w-full max-w-sm relative animate-in zoom-in duration-300">
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-red-400 transition"
        >
          <X size={32} />
        </button>
        <div
          className="bg-white rounded-[24px] p-8 shadow-2xl relative overflow-hidden font-mono"
          id="recibo-pdf"
        >
          <div className="text-center mb-6">
            <Logo variant="simple" width="w-24" className="mx-auto mb-2 grayscale opacity-50" />
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest mt-2">
              Recibo de Pagamento
            </h2>
          </div>

          <div className="space-y-4 text-xs font-bold text-slate-600 border-y-2 border-dashed border-slate-200 py-6 my-6">
            <div className="flex justify-between">
              <span className="text-slate-400">Condomínio:</span>
              <span className="text-right">{config.predioNome}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Unidade:</span>
              <span className="text-right text-sm text-[#1e293b] font-black">
                Apto {unidade.numero}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Data Pagto:</span>
              <span className="text-right">{pagamento.data}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Referência:</span>
              <span className="text-right">
                {pagamento.mes}/{pagamento.ano}
              </span>
            </div>
            <div className="flex justify-between mt-4 pt-4 border-t border-slate-100 items-end">
              <span className="text-slate-400 uppercase">Valor Pago</span>
              <span className="text-2xl font-black text-green-600">{fmt(pagamento.valor)}</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg text-center break-all">
            <p className="text-[8px] text-slate-400 uppercase tracking-widest mb-1">
              Chave de Autenticidade Verificável
            </p>
            <p className="text-xs font-black text-slate-700">
              {pagamento.hash_recibo || 'GERADO-MANUALMENTE'}
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-4 flex-col sm:flex-row">
          <div className="flex gap-2 w-full">
            <button
              type="button"
              onClick={copiarImagem}
              disabled={gerando}
              className="flex-1 bg-white text-slate-600 py-3 rounded-xl font-black text-[10px] hover:bg-slate-100 shadow-lg flex justify-center items-center gap-1 transition disabled:opacity-50"
            >
              <Copy size={14} /> COPIAR
            </button>
            <button
              type="button"
              onClick={baixarImagem}
              disabled={gerando}
              className="flex-1 bg-white text-slate-600 py-3 rounded-xl font-black text-[10px] hover:bg-slate-100 shadow-lg flex justify-center items-center gap-1 transition disabled:opacity-50"
            >
              <Download size={14} /> BAIXAR
            </button>
          </div>
          <button
            type="button"
            onClick={() => enviarWhatsApp(pagamento, unidade)}
            className="w-full sm:w-auto bg-[#84cc16] text-[#1e293b] px-4 py-3 rounded-xl font-black text-[10px] hover:bg-[#a3e635] shadow-lg flex justify-center items-center gap-2 transition"
          >
            <Share2 size={16} /> WHATSAPP
          </button>
        </div>
      </div>
    </div>
  );
}

export function ModalDespesa({
  supabase,
  condominioId,
  categorias,
  onClose,
  onSave,
  despesaParaEditar = null,
  showToast,
  subscription,
  onRequestUpgrade,
  onAiUsed,
}) {
  const isEdit = Boolean(despesaParaEditar);
  const [form, setForm] = useState(
    () =>
      despesaParaEditar || {
        descricao: '',
        valor: '',
        data: new Date().toISOString().split('T')[0],
        categoria: categorias[0] || 'Outros',
        pago: true,
        repetir: false,
        url_comprovante: '',
      }
  );
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);

  const allowUpload = canUseFeature(subscription, 'upload');
  const allowAi = canUseFeature(subscription, 'ai');

  const handleUpload = async (e, autoReadWithAi = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!allowUpload) {
      onRequestUpgrade('Anexar notas fiscais e boletos faz parte do CondoLeve Pro.');
      return;
    }

    try {
      setLoadingUpload(true);
      const result = await uploadCondoDocument({
        supabase,
        condominioId,
        category: 'despesas',
        rawFile: file,
      });

      let updatedForm = { ...form, url_comprovante: result.publicUrl };
      setForm(updatedForm);

      if (autoReadWithAi) {
        if (!allowAi) {
          onRequestUpgrade('Leitura automática de boletos com IA é exclusiva do CondoLeve Pro.');
          return;
        }
        setLoadingAi(true);
        try {
          const extracted = await extractDocumentWithAI({
            supabase,
            condominioId,
            file: result.compressedFile,
            categorias,
          });
          if (extracted) {
            updatedForm = {
              ...updatedForm,
              descricao: extracted.descricao || updatedForm.descricao,
              valor: extracted.valor || updatedForm.valor,
              data: extracted.dataISO || updatedForm.data,
              categoria: categorias.includes(extracted.categoriaSugerida)
                ? extracted.categoriaSugerida
                : updatedForm.categoria,
            };
            setForm(updatedForm);
            onAiUsed?.();
            showToast('Conta preenchida automaticamente pela IA! Confira os dados.');
          }
        } catch (aiErr) {
          if (aiErr.code === 'PLAN_LIMIT_REACHED') {
            onRequestUpgrade(aiErr.message);
          } else {
            showToast(aiErr.message, 'error');
          }
        } finally {
          setLoadingAi(false);
        }
      } else {
        showToast('Nota/Boleto anexado com sucesso!');
      }
    } catch (err) {
      if (err.code === 'PLAN_LIMIT_REACHED') {
        onRequestUpgrade(err.message);
      } else {
        showToast(err.message || 'Erro inesperado', 'error');
      }
    } finally {
      setLoadingUpload(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#1e293b]/90 z-[9000] flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm text-left">
      <div className="bg-white rounded-t-[32px] sm:rounded-[32px] w-full max-w-md p-6 shadow-2xl animate-in slide-in-from-bottom-10 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-5 border-b pb-4">
          <h3 className="font-black text-xl text-slate-800 flex items-center gap-2">
            <ArrowDownCircle className="text-orange-500" /> {isEdit ? 'Editar Conta' : 'Lançar Conta'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto pr-2 space-y-4 mb-4">
          {/* Atalho IA Zero Digitação */}
          {!isEdit && (
            <div className="bg-gradient-to-r from-[#1e293b] to-slate-800 text-white p-3.5 rounded-2xl flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black text-[#a3e635] uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={12} /> Leitura Inteligente IA
                </p>
                <p className="text-[11px] text-slate-300 leading-tight mt-0.5">
                  Fotografe a conta para preencher valor e data sozinho.
                </p>
              </div>
              {allowUpload && allowAi ? (
                <label className="bg-[#84cc16] text-[#1e293b] px-3 py-2 rounded-xl text-[10px] font-black uppercase cursor-pointer hover:bg-[#a3e635] transition shrink-0 flex items-center gap-1.5">
                  {loadingAi ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  LER CONTA
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={(e) => handleUpload(e, true)}
                  />
                </label>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    onRequestUpgrade('Preenchimento automático de contas por foto com IA é um recurso Pro.')
                  }
                  className="bg-white/10 hover:bg-white/20 text-lime-300 px-3 py-2 rounded-xl text-[10px] font-black uppercase shrink-0 flex items-center gap-1"
                >
                  <Lock size={11} /> PRO
                </button>
              )}
            </div>
          )}

          <label className="block">
            <span className="text-[10px] font-black text-slate-400 uppercase">Descrição</span>
            <input
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              className="w-full border p-3 rounded-xl font-bold outline-none focus:border-orange-500"
              placeholder="Ex: Conta de Luz"
            />
          </label>
          <div className="flex gap-3">
            <label className="block flex-1">
              <span className="text-[10px] font-black text-slate-400 uppercase">Valor (R$)</span>
              <input
                type="number"
                step="0.01"
                value={form.valor}
                onChange={(e) => setForm({ ...form, valor: e.target.value })}
                className="w-full border p-3 rounded-xl font-black text-orange-600 outline-none focus:border-orange-500"
              />
            </label>
            <label className="block flex-1">
              <span className="text-[10px] font-black text-slate-400 uppercase">Vencimento</span>
              <input
                type="date"
                value={form.data}
                onChange={(e) => setForm({ ...form, data: e.target.value })}
                className="w-full border p-3 rounded-xl font-bold outline-none focus:border-orange-500"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-[10px] font-black text-slate-400 uppercase">Categoria</span>
            <select
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              className="w-full border p-3 rounded-xl font-bold bg-white outline-none focus:border-orange-500"
            >
              {categorias.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          {allowUpload ? (
            <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200">
              <label className="cursor-pointer text-xs font-bold text-slate-500 flex items-center justify-center gap-2 hover:text-orange-500 transition">
                {loadingUpload ? (
                  <RefreshCw className="animate-spin text-slate-400" size={16} />
                ) : form.url_comprovante ? (
                  <CheckCircle className="text-green-500" size={16} />
                ) : (
                  <Upload className="text-slate-400" size={16} />
                )}
                {form.url_comprovante ? 'Nota Fiscal Anexada' : 'Anexar Nota/Boleto'}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={(e) => handleUpload(e, false)}
                />
              </label>
            </div>
          ) : (
            <button
              type="button"
              onClick={() =>
                onRequestUpgrade('Anexar notas fiscais na nuvem é um recurso do CondoLeve Pro.')
              }
              className="w-full bg-slate-50 p-3.5 rounded-xl border border-dashed border-slate-200 text-xs font-bold text-slate-400 hover:text-slate-700 flex items-center justify-center gap-2 transition"
            >
              <Lock size={14} className="text-orange-500" /> Anexar Nota/Boleto (Plano Pro)
            </button>
          )}

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-3 rounded-xl flex-1 border">
              <input
                type="checkbox"
                checked={form.pago}
                onChange={(e) => setForm({ ...form, pago: e.target.checked })}
                className="accent-orange-500 w-4 h-4"
              />
              <span className="text-xs font-bold text-slate-700">Conta Paga</span>
            </label>
            {!isEdit && (
              <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-3 rounded-xl flex-1 border">
                <input
                  type="checkbox"
                  checked={form.repetir}
                  onChange={(e) => setForm({ ...form, repetir: e.target.checked })}
                  className="accent-orange-500 w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-700">Lançar fixo</span>
              </label>
            )}
          </div>
        </div>

        <button
          type="button"
          disabled={!form.descricao || Number(form.valor) <= 0 || loadingUpload || loadingAi}
          onClick={() => onSave({ ...form, valor: Number(form.valor) }, form.repetir)}
          className="w-full py-4 text-white font-black bg-orange-500 rounded-xl hover:bg-orange-600 shadow-lg disabled:opacity-50"
        >
          {isEdit ? 'SALVAR ALTERAÇÕES' : 'SALVAR DESPESA'}
        </button>
      </div>
    </div>
  );
}

export function ModalRelatorio({
  receita,
  despesa,
  saldo,
  despesas,
  pagamentos,
  unidades,
  mes,
  ano,
  onClose,
  fmt,
  exportarCSV,
  config,
  showToast,
  subscription,
  onRequestUpgrade,
}) {
  const [gerando, setGerando] = useState(false);
  // Modo LGPD Seguro por padrão: não expõe nomes nem aponta inadimplentes individualmente!
  const [modoLgpdSeguro, setModoLgpdSeguro] = useState(true);

  const allowExport = canUseFeature(subscription, 'relatorio_oficial');
  const unidadesPagantes = unidades.filter((u) => !u.isento_taxa);
  const unidadesPagasList = unidadesPagantes.filter((u) => {
    const pgs = pagamentos.filter((p) => p.unidade_id === u.id);
    return pgs.reduce((a, p) => a + Number(p.valor), 0) > 0;
  });

  const totalPagos = unidadesPagasList.length;
  const totalPendentes = Math.max(0, unidadesPagantes.length - totalPagos);

  const renderCanvas = async () => {
    const elemento = document.getElementById('relatorio-pdf');
    if (!elemento) return null;
    const { default: html2canvas } = await import('html2canvas');
    return html2canvas(elemento, { scale: 2.5, backgroundColor: '#f8fafc', useCORS: true });
  };

  const baixarImagem = async () => {
    if (!allowExport) {
      onRequestUpgrade('Exportar infográfico oficial e planilha Excel faz parte do CondoLeve Pro.');
      return;
    }
    setGerando(true);
    try {
      const canvas = await renderCanvas();
      if (!canvas) return;
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `Prestacao_Contas_${mes}_${ano}.png`;
      a.click();
    } catch (err) {
      console.error(err);
      showToast?.('Erro ao exportar imagem.', 'error');
    } finally {
      setGerando(false);
    }
  };

  const copiarImagem = async () => {
    if (!allowExport) {
      onRequestUpgrade('Compartilhar infográfico oficial no WhatsApp faz parte do CondoLeve Pro.');
      return;
    }
    setGerando(true);
    try {
      const canvas = await renderCanvas();
      if (!canvas) return;
      canvas.toBlob(async (blob) => {
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          showToast?.('Infográfico copiado! Cole (Ctrl+V) no grupo do WhatsApp.');
        } catch {
          showToast?.('Seu navegador bloqueou a cópia direta. Use o botão Baixar.', 'error');
        }
      }, 'image/png');
    } catch (err) {
      console.error(err);
    } finally {
      setGerando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#1e293b]/95 z-[9500] flex items-center justify-center p-2 sm:p-6 backdrop-blur-md text-left">
      <div className="w-full max-w-4xl relative animate-in zoom-in duration-300 max-h-[95vh] flex flex-col">
        <div className="flex justify-between items-center mb-2 px-1">
          <button
            type="button"
            onClick={() => setModoLgpdSeguro(!modoLgpdSeguro)}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-1.5 transition ${
              modoLgpdSeguro
                ? 'bg-[#84cc16] text-[#1e293b]'
                : 'bg-red-500/20 text-red-200 border border-red-400/30'
            }`}
          >
            {modoLgpdSeguro ? <EyeOff size={13} /> : <Eye size={13} />}
            {modoLgpdSeguro
              ? 'Modo LGPD Ativo (Oculta Inadimplentes)'
              : 'Exibindo Unidades Pendentes'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-white hover:text-red-400 transition p-1"
          >
            <X size={28} />
          </button>
        </div>

        <div className="bg-white rounded-t-2xl shadow-2xl relative overflow-auto font-sans flex flex-col border border-slate-200 w-full">
          <div
            id="relatorio-pdf"
            className="bg-[#f8fafc] p-4 sm:p-8 relative shrink-0 w-full mx-auto text-slate-800"
          >
            {/* HEADER INFOGRÁFICO */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1e293b] text-white p-5 sm:p-6 rounded-2xl mb-6 shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white/10 to-transparent" />
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Demonstrativo Financeiro Oficial
                </p>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
                  {config?.predioNome || 'Condomínio'}
                </h2>
                <p className="text-sm font-bold text-[#84cc16] uppercase mt-1 tracking-widest">
                  {mes} / {ano}
                </p>
              </div>
              <div className="sm:text-right flex flex-col sm:items-end z-10">
                <Logo variant="full" width="w-28 sm:w-32" className="brightness-0 invert opacity-90 mb-2 sm:mb-3" />
                <div className="inline-flex items-center gap-1 bg-[#84cc16]/20 px-2.5 py-1 rounded text-[9px] font-black uppercase border border-[#84cc16]/30 text-[#a3e635]">
                  <ShieldCheck size={12} /> Documento Auditado
                </div>
              </div>
            </div>

            {/* KPIS HEADER */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-[16px] border border-green-100 flex flex-col justify-center relative overflow-hidden">
                <TrendingUp size={40} className="absolute -right-2 -bottom-2 text-green-200 opacity-50" />
                <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1 z-10">
                  Arrecadação
                </p>
                <p className="text-2xl font-black text-green-700 tracking-tight z-10">
                  {fmt(receita)}
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-[16px] border border-red-100 flex flex-col justify-center relative overflow-hidden">
                <TrendingDown size={40} className="absolute -right-2 -bottom-2 text-red-200 opacity-50" />
                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1 z-10">
                  Despesas
                </p>
                <p className="text-2xl font-black text-red-700 tracking-tight z-10">
                  -{fmt(despesa)}
                </p>
              </div>
              <div className="bg-[#f1f5f9] p-4 rounded-[16px] border border-slate-200 flex flex-col justify-center relative overflow-hidden shadow-inner">
                <Wallet size={40} className="absolute -right-2 -bottom-2 text-blue-200 opacity-50" />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 z-10">
                  Saldo Final em Caixa
                </p>
                <p className="text-2xl font-black text-[#1e293b] tracking-tight z-10">{fmt(saldo)}</p>
              </div>
            </div>

            {/* 2 COLUNAS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 items-start">
              {/* COLUNA ESQUERDA: RECEITAS */}
              <div>
                <h3 className="text-[11px] font-black text-white bg-slate-800 py-2 px-4 rounded-t-xl uppercase tracking-widest flex items-center gap-2 shadow-sm">
                  <ArrowDownCircle size={14} className="text-green-400" />
                  {modoLgpdSeguro ? 'Cotistas Confirmados no Mês' : 'Entradas por Unidade'}
                </h3>
                <div className="border-x border-b border-slate-200 rounded-b-xl p-3 bg-white shadow-sm">
                  <div className="space-y-1">
                    {(modoLgpdSeguro ? unidadesPagasList : unidades).map((u) => {
                      const pgs = pagamentos.filter((p) => p.unidade_id === u.id);
                      const tPago = pgs.reduce((a, p) => a + Number(p.valor), 0);
                      return (
                        <div
                          key={u.id}
                          className="flex justify-between items-center py-1.5 px-2 border-b border-slate-50 last:border-0 rounded"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-black text-xs text-slate-700">AP {u.numero}</span>
                            {u.isento_taxa && (
                              <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase">
                                Isento
                              </span>
                            )}
                          </div>
                          {u.isento_taxa ? (
                            <span className="font-bold text-slate-400 text-[10px] uppercase">
                              Isenção Síndico
                            </span>
                          ) : tPago > 0 ? (
                            <span className="font-black text-green-600 text-xs">{fmt(tPago)}</span>
                          ) : (
                            <span className="font-black text-slate-300 text-[9px] uppercase tracking-widest">
                              Em Aberto
                            </span>
                          )}
                        </div>
                      );
                    })}
                    {modoLgpdSeguro && unidadesPagasList.length === 0 && (
                      <p className="text-xs text-center text-slate-400 py-4 italic font-medium">
                        Nenhum recebimento confirmado no período.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* COLUNA DIREITA: DESPESAS + RESUMO */}
              <div>
                <h3 className="text-[11px] font-black text-white bg-slate-800 py-2 px-4 rounded-t-xl uppercase tracking-widest flex items-center gap-2 shadow-sm">
                  <TrendingDown size={14} className="text-red-400" /> Lista de Despesas
                </h3>
                <div className="border-x border-b border-slate-200 rounded-b-xl p-3 bg-white shadow-sm">
                  <div className="space-y-1">
                    {despesas.map((d) => (
                      <div
                        key={d.id}
                        className="flex justify-between items-center py-1.5 px-2 border-b border-slate-50 last:border-0 rounded"
                      >
                        <div className="flex flex-col pr-2">
                          <span className="font-bold text-xs text-slate-700 leading-tight">
                            {d.descricao}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                            {d.categoria}
                          </span>
                        </div>
                        <span className="font-black text-red-500 text-xs whitespace-nowrap">
                          -{fmt(d.valor)}
                        </span>
                      </div>
                    ))}
                    {despesas.length === 0 && (
                      <p className="text-xs text-center text-slate-400 py-4 italic font-medium">
                        Nenhuma despesa no período.
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-inner">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 text-center flex justify-center items-center gap-1">
                    <PieChart size={12} /> Resumo de Adimplência ({mes})
                  </p>
                  <div className="flex justify-around items-center">
                    <div className="text-center bg-white px-6 py-2 rounded-lg border border-slate-100 shadow-sm w-28">
                      <p className="text-2xl font-black text-green-600">{totalPagos}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Em Dia</p>
                    </div>
                    <div className="text-center bg-white px-6 py-2 rounded-lg border border-slate-100 shadow-sm w-28">
                      <p className="text-2xl font-black text-slate-700">{totalPendentes}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Em Aberto</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RODAPÉ */}
            <div className="text-center pt-6 mt-6 border-t border-slate-200">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
                <Building size={10} /> Prestação de Contas CondoLeve • condoleve.drafthub.com.br •{' '}
                {new Date().toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </div>

        {/* Botões de Exportação */}
        <div className="bg-white p-4 border-t border-slate-200 shrink-0 flex flex-col sm:flex-row gap-3 rounded-b-2xl">
          <div className="flex gap-2 w-full">
            <button
              type="button"
              onClick={copiarImagem}
              disabled={gerando}
              className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 shadow-sm flex justify-center items-center gap-2 transition disabled:opacity-50"
            >
              {gerando ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : allowExport ? (
                <Copy size={16} />
              ) : (
                <Lock size={14} className="text-[#84cc16]" />
              )}
              Copiar Imagem
            </button>
            <button
              type="button"
              onClick={baixarImagem}
              disabled={gerando}
              className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 shadow-sm flex justify-center items-center gap-2 transition disabled:opacity-50"
            >
              {gerando ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : allowExport ? (
                <Download size={16} />
              ) : (
                <Lock size={14} className="text-[#84cc16]" />
              )}
              Baixar PNG
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              if (!allowExport) {
                onRequestUpgrade('Exportar relatórios em Excel/CSV faz parte do CondoLeve Pro.');
                return;
              }
              exportarCSV();
            }}
            className="w-full sm:w-auto bg-[#1e293b] text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black shadow-lg flex justify-center items-center gap-2 transition"
          >
            {allowExport ? <FileSpreadsheet size={16} /> : <Lock size={14} className="text-[#84cc16]" />}
            Exportar Excel
          </button>
        </div>
      </div>
    </div>
  );
}
