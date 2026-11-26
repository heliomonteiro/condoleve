import React, { useState } from 'react';
import {
  AlertOctagon,
  Settings,
  MonitorPlay,
  CheckCircle,
  Copy,
  Phone,
  Contact,
  Megaphone,
  Vote,
  Wrench,
  RotateCcw,
  History,
  Info,
  AlertCircle,
  ShieldCheck,
  ExternalLink,
  RefreshCw,
  Camera,
  Send,
  Image as ImageIcon,
  X,
  PhoneCall,
  Printer,
  Receipt,
  ChevronUp,
  ChevronDown,
  Paperclip,
  KeyRound,
  Save,
  LogOut,
  Bell,
  AlertTriangle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Logo } from '../../components/ui/Logo';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { BotaoLetraMaior } from '../../components/ui/BotaoLetraMaior';
import { ModalInstalarApp } from '../../features/modals/FinanceModals';
import { safeStr, safeNum, getMonthKey } from '../../utils/helpers';
import { translateError } from '../../utils/errorTranslator';
import { uploadCondoDocument } from '../../lib/storage';

export function ModoMorador({
  unidade,
  condominioId,
  config,
  onExit,
  mesAtual,
  anoAtual,
  getPagamentosMes,
  calcularTotalPago,
  fmt,
  avisos,
  enquetes,
  patrimonio,
  showToast,
  copiarTexto,
  abrirChamado,
  registrarVoto,
  modalInstalar,
  setModalInstalar,
  setPrintMode,
  pagamentosCompletos,
  setModalReciboVisual,
  supabase,
  unidadesTotal,
  taxaVigenteMes,
}) {
  const [activeTab, setActiveTab] = useState('mural');
  const [historyMode, setHistoryMode] = useState(false);
  const [novoChamado, setNovoChamado] = useState('');
  const [fotoChamado, setFotoChamado] = useState('');
  const [uploading, setUploading] = useState(false);
  const [verContatos, setVerContatos] = useState(false);
  const [verRecibos, setVerRecibos] = useState(false);
  const [reciboExpandido, setReciboExpandido] = useState(null);
  const [modalConfig, setModalConfig] = useState(false);
  const [pixCopiadoGuia, setPixCopiadoGuia] = useState(false);

  const [lidos, setLidos] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`lidos_${unidade.id}`) || '{}');
    } catch {
      return {};
    }
  });

  const marcarLido = (id) => {
    const novoLidos = { ...lidos, [id]: true };
    setLidos(novoLidos);
    localStorage.setItem(`lidos_${unidade.id}`, JSON.stringify(novoLidos));
  };

  const pags = getPagamentosMes(unidade, `${mesAtual}-${anoAtual}`);
  const totalPago = calcularTotalPago(pags);
  const valorDevido = unidade.isento_taxa
    ? 0
    : safeNum(taxaVigenteMes ?? config.valorCondominio);
  const isPago = unidade.isento_taxa || totalPago >= valorDevido;
  const valorRestante = Math.max(0, valorDevido - totalPago);

  const meusPagamentos = pagamentosCompletos
    .filter((p) => p.unidade_id === unidade.id)
    .sort((a, b) => getMonthKey(b.mes, b.ano) - getMonthKey(a.mes, a.ano));

  const filterActive = (list, type) => {
    if (!list) return [];
    if (type === 'aviso') {
      return list.filter((a) => {
        const d = new Date(a.data.split('/').reverse().join('-'));
        const diff = (new Date() - d) / (1000 * 3600 * 24);
        return historyMode ? diff > 30 : diff <= 30;
      });
    }
    if (type === 'enquete') return list.filter((e) => (historyMode ? !e.ativa : e.ativa));
    if (type === 'zeladoria') return list.filter((z) => (historyMode ? z.concluido : !z.concluido));
    return list;
  };

  const avisosShow = filterActive(avisos, 'aviso');
  const enquetesShow = filterActive(enquetes, 'enquete');
  const zelaShow = filterActive(patrimonio, 'zeladoria');
  const avisoUrgente = avisosShow.find((a) => a.tipo === 'Urgente');

  const handleUploadFoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const result = await uploadCondoDocument({
        supabase,
        condominioId,
        category: 'zeladoria',
        rawFile: file,
      });
      setFotoChamado(result.publicUrl);
      showToast('Foto anexada ao chamado!');
    } catch (err) {
      if (err.code === 'PLAN_LIMIT_REACHED') {
        showToast(
          'O plano atual do condomínio não inclui fotos nos chamados. Envie apenas a descrição.',
          'error'
        );
      } else {
        showToast(err.message || 'Erro no upload da foto.', 'error');
      }
    } finally {
      setUploading(false);
    }
  };

  const renderBadge = (count) =>
    count > 0 && (
      <span className="absolute -top-1 -right-1 bg-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold shadow-sm">
        {count}
      </span>
    );

  const renderTabBtn = (id, IconComp, labelDesktop, labelMobile, count) => (
    <button
      key={id}
      type="button"
      onClick={() => {
        setActiveTab(id);
        setHistoryMode(false);
      }}
      className={`flex-1 min-h-[48px] py-3 px-2 rounded-lg text-xs font-black uppercase transition flex flex-row items-center justify-center gap-1.5 relative shadow-sm ${
        activeTab === id
          ? 'bg-white text-[#1e293b] border-2 border-slate-100'
          : 'bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100'
      }`}
    >
      <IconComp size={15} className={activeTab === id ? 'text-[#65a30d]' : 'opacity-75'} />
      <span className="hidden sm:inline">{labelDesktop}</span>
      <span className="sm:hidden">{labelMobile}</span>
      {renderBadge(count)}
    </button>
  );

  const nomeExibicao =
    safeStr(
      unidade.mora_proprietario !== false
        ? unidade.proprietario?.nome
        : unidade.inquilino?.nome || unidade.proprietario?.nome
    ).split(' ')[0] || 'Vizinho';

  return (
    <div className="min-h-screen bg-[#f1f5f9] font-sans text-slate-800">
      {avisoUrgente && !historyMode && (
        <div className="bg-red-600 text-white p-3 sticky top-0 z-50 flex gap-3 items-center shadow-md animate-in slide-in-from-top">
          <AlertOctagon size={20} className="shrink-0 animate-pulse" />
          <div>
            <p className="font-bold text-xs leading-tight">{avisoUrgente.titulo}</p>
          </div>
        </div>
      )}

      {/* HEADER COMPACTO */}
      <div className="bg-[#1e293b] text-white p-4 pb-12 shadow-lg mb-0 relative">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-3">
            <div className="scale-75 origin-left -ml-2">
              <Logo variant="simple" className="brightness-0 invert" width="w-32" />
            </div>
            <div className="flex gap-1.5 items-center">
              <BotaoLetraMaior />
              <button
                type="button"
                onClick={() => setModalConfig(true)}
                title="Minha Senha"
                aria-label="Minha Conta e Senha"
                className="text-slate-200 min-h-[38px] px-2.5 py-1.5 rounded-xl hover:text-white transition bg-white/10 flex items-center gap-1 text-xs font-bold"
              >
                <Settings size={15} /> <span className="hidden sm:inline">Conta</span>
              </button>
              <button
                type="button"
                onClick={() => setModalInstalar(true)}
                title="Instalar Aplicativo"
                aria-label="Instalar Aplicativo"
                className="text-[#a3e635] min-h-[38px] px-2.5 py-1.5 rounded-xl hover:text-white transition bg-[#84cc16]/15 flex items-center gap-1 text-xs font-bold"
              >
                <MonitorPlay size={15} />
              </button>
              <button
                type="button"
                onClick={onExit}
                title="Sair"
                aria-label="Sair"
                className="text-red-300 min-h-[38px] px-2.5 py-1.5 rounded-xl hover:text-white transition bg-red-400/15 flex items-center gap-1 text-xs font-bold"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
          <h2 className="text-xl font-black mb-0.5 leading-tight tracking-tight">
            Olá, {nomeExibicao}!
          </h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
            Apto {safeStr(unidade.numero)} • {safeStr(config.predioNome)}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-6 relative z-10 space-y-3 pb-10">
        <Card className="p-4 text-left border-t-4 border-t-[#84cc16] bg-white shadow-xl">
          {isPago ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <CheckCircle size={20} className="text-[#84cc16]" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                    Fatura de {mesAtual}
                  </p>
                  <p className="text-sm font-black text-[#1e293b] leading-none">
                    {unidade.isento_taxa ? 'Unidade Isenta' : 'Tudo pago!'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setVerRecibos(true)}
                className="text-[9px] font-black text-blue-600 bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 flex items-center gap-1.5 transition uppercase tracking-widest"
              >
                <History size={12} />
                <span className="hidden sm:inline">RECIBOS</span>
              </button>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                    Fatura de {mesAtual}
                  </p>
                  <p className="text-2xl font-black text-[#1e293b] leading-tight">
                    {fmt(valorRestante)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setVerRecibos(true)}
                  className="text-[9px] font-black text-slate-500 bg-slate-100 px-3 py-2 rounded-lg hover:bg-slate-200 transition uppercase tracking-widest flex items-center gap-1.5"
                >
                  <History size={12} /> <span className="hidden sm:inline">RECIBOS</span>
                </button>
              </div>
              {totalPago > 0 && (
                <p className="text-[10px] text-slate-400 font-bold mb-3 uppercase">
                  Restante a pagar (Total: {fmt(valorDevido)})
                </p>
              )}
              <button
                type="button"
                className="w-full bg-[#1e293b] text-white py-4 min-h-[50px] mt-1 rounded-xl font-black flex items-center justify-center gap-2 active:scale-95 transition text-xs uppercase tracking-wider shadow-md"
                onClick={() => {
                  copiarTexto(config.chavePix);
                  if (config.chavePix) setPixCopiadoGuia(true);
                }}
              >
                <Copy size={16} /> COPIAR CHAVE PIX PARA PAGAR
              </button>
              {pixCopiadoGuia && config.chavePix && (
                <div className="mt-3 bg-lime-50 border border-lime-200 rounded-xl p-3.5 text-xs text-slate-700 space-y-1.5 animate-in fade-in">
                  <p className="font-black text-lime-900">
                    Pronto! A chave PIX já está copiada no seu celular:
                  </p>
                  <p>1. Abra o aplicativo do seu banco.</p>
                  <p>2. Toque em <b>PIX</b> e escolha pagar com <b>Chave</b> (ou Copia e Cola).</p>
                  <p>3. Segure o dedo no campo, toque em <b>Colar</b> e confirme o valor.</p>
                </div>
              )}
            </div>
          )}
        </Card>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              window.open(
                `https://wa.me/55${safeStr(config.telefoneSindico || '').replace(
                  /\D/g,
                  ''
                )}?text=${encodeURIComponent(`Olá, sou morador do Apto ${unidade.numero}`)}`,
                '_blank'
              )
            }
            className="flex-1 bg-white p-3 rounded-xl shadow-sm border border-slate-200 font-black text-[10px] text-slate-600 flex items-center justify-center gap-2 hover:bg-slate-50 transition active:scale-95 uppercase tracking-widest"
          >
            <Phone size={14} className="text-slate-400" /> Síndico
          </button>
          <button
            type="button"
            onClick={() => setVerContatos(true)}
            className="flex-1 bg-white p-3 rounded-xl shadow-sm border border-slate-200 font-black text-[10px] text-slate-600 flex items-center justify-center gap-2 hover:bg-slate-50 transition active:scale-95 uppercase tracking-widest"
          >
            <Contact size={14} className="text-teal-500" /> Contatos
          </button>
        </div>

        <div className="mt-4">
          <div className="flex gap-1.5 mb-3 bg-slate-200/50 p-1.5 rounded-xl border border-slate-200/50 shadow-inner">
            {renderTabBtn('mural', Megaphone, 'Mural', 'Mural', filterActive(avisos, 'aviso').length)}
            {renderTabBtn('vote', Vote, 'Votação', 'Votar', filterActive(enquetes, 'enquete').length)}
            {renderTabBtn('manut', Wrench, 'Chamados', 'Pedidos', filterActive(patrimonio, 'zeladoria').length)}
          </div>
          <div className="flex justify-between items-center mb-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {activeTab === 'mural'
                ? 'Quadro de Avisos'
                : activeTab === 'vote'
                ? 'Enquetes Abertas'
                : 'Manutenções'}
            </p>
            <button
              type="button"
              onClick={() => setHistoryMode(!historyMode)}
              className="text-[9px] font-black text-blue-500 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100 uppercase hover:bg-blue-100 flex items-center gap-1 transition shadow-sm"
            >
              {historyMode ? <RotateCcw size={10} /> : <History size={10} />}{' '}
              {historyMode ? 'VOLTAR' : 'HISTÓRICO'}
            </button>
          </div>

          {activeTab === 'mural' && (
            <div className="space-y-2">
              {avisosShow.map((a) => {
                const isUrgente = a.tipo === 'Urgente';
                const isRegra = a.tipo === 'Regra';
                const lido = Boolean(lidos[a.id]);
                const corBorda = isUrgente
                  ? 'border-l-red-500'
                  : isRegra
                  ? 'border-l-purple-500'
                  : 'border-l-blue-400';
                const tagColor = isUrgente
                  ? 'bg-red-100 text-red-600'
                  : isRegra
                  ? 'bg-purple-100 text-purple-600'
                  : 'bg-blue-100 text-blue-600';
                const icone = isUrgente ? (
                  <AlertCircle size={10} />
                ) : isRegra ? (
                  <ShieldCheck size={10} />
                ) : (
                  <Info size={10} />
                );

                return (
                  <div
                    key={a.id}
                    onClick={() => !lido && marcarLido(a.id)}
                    className={`relative bg-white rounded-xl border border-slate-100 border-l-4 ${corBorda} shadow-sm p-4 transition-all cursor-pointer hover:shadow-md ${
                      lido ? 'opacity-70' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex flex-col gap-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded flex items-center gap-1 ${tagColor}`}
                          >
                            {icone} {a.tipo || 'Aviso'}
                          </span>
                          {!lido && (
                            <span
                              className="w-2 h-2 rounded-full bg-blue-500 inline-block animate-pulse"
                              title="Não lido"
                            />
                          )}
                          {lido && (
                            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1">
                              <CheckCircle size={9} /> Lido
                            </span>
                          )}
                        </div>
                        <h4
                          className={`font-black text-sm leading-tight ${
                            lido ? 'text-slate-500' : 'text-slate-800'
                          }`}
                        >
                          {a.titulo}
                        </h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed whitespace-pre-line">
                          {a.mensagem}
                        </p>
                        {a.link && (
                          <a
                            href={a.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="mt-2 inline-flex items-center gap-1.5 text-[9px] font-black text-blue-500 bg-blue-50 px-2.5 py-1.5 rounded uppercase tracking-widest hover:bg-blue-100 transition w-max"
                          >
                            <ExternalLink size={10} /> Ver Anexo
                          </a>
                        )}
                      </div>
                      <span className="text-[8px] font-bold text-slate-400 whitespace-nowrap shrink-0 mt-0.5">
                        {a.data}
                      </span>
                    </div>
                    {!lido && (
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#84cc16]" />
                    )}
                  </div>
                );
              })}
              {avisosShow.length === 0 && (
                <EmptyState
                  icon={Bell}
                  title={historyMode ? 'Histórico Vazio' : 'Sem Avisos'}
                  desc=""
                />
              )}
            </div>
          )}

          {activeTab === 'vote' && (
            <div className="space-y-4">
              {enquetesShow.map((e) => {
                const votaramArray = e.opcoes?.votaram || [];
                const votosDetalhados = e.opcoes?.votosDetalhados || {};
                const jaVotou =
                  votaramArray.includes(unidade.id) || Boolean(votosDetalhados[unidade.id]);
                const meuVoto = votosDetalhados[unidade.id];
                const totalVotos = (e.opcoes?.sim || 0) + (e.opcoes?.nao || 0);
                const participacao =
                  unidadesTotal > 0 ? Math.round((totalVotos / unidadesTotal) * 100) : 0;

                return (
                  <div
                    key={e.id}
                    className="p-5 rounded-2xl border bg-white border-slate-100 shadow-sm text-left"
                  >
                    <h4 className="font-black text-sm text-slate-800 mb-1 leading-tight">
                      {e.titulo}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-bold mb-4 uppercase flex items-center gap-2">
                      {historyMode ? 'Encerrada' : 'Aberta'} • Votos: {totalVotos}
                      {unidadesTotal > 0 ? ` (${participacao}%)` : ''}{' '}
                      {e.opcoes?.dataFim && `• Fim: ${e.opcoes.dataFim}`}
                    </p>
                    {!historyMode ? (
                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => registrarVoto(e.id, 'sim', unidade.id)}
                            className={`flex-1 py-3 rounded-xl font-black text-xs transition active:scale-95 border flex flex-col items-center gap-1 ${
                              meuVoto === 'sim'
                                ? 'bg-green-500 text-white border-green-600 shadow-md'
                                : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-green-50 hover:text-green-600'
                            }`}
                          >
                            SIM {meuVoto === 'sim' && <span className="text-[8px]">(SEU VOTO)</span>}
                          </button>
                          <button
                            type="button"
                            onClick={() => registrarVoto(e.id, 'nao', unidade.id)}
                            className={`flex-1 py-3 rounded-xl font-black text-xs transition active:scale-95 border flex flex-col items-center gap-1 ${
                              meuVoto === 'nao'
                                ? 'bg-red-500 text-white border-red-600 shadow-md'
                                : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-red-50 hover:text-red-600'
                            }`}
                          >
                            NÃO {meuVoto === 'nao' && <span className="text-[8px]">(SEU VOTO)</span>}
                          </button>
                        </div>
                        {jaVotou && (
                          <p className="text-[9px] text-center text-slate-400 italic">
                            Você pode alterar seu voto enquanto a enquete estiver aberta.
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2 mt-4">
                        <div className="flex gap-2">
                          <div className="flex-1 bg-slate-50 p-3 rounded-xl text-center border border-slate-100 relative overflow-hidden">
                            <div
                              className="absolute top-0 left-0 bottom-0 bg-green-100 transition-all"
                              style={{
                                width: `${
                                  totalVotos === 0 ? 0 : ((e.opcoes?.sim || 0) / totalVotos) * 100
                                }%`,
                              }}
                            />
                            <div className="relative z-10 flex justify-between items-center px-2">
                              <span className="text-xs font-bold text-slate-500">SIM</span>
                              <span className="font-black text-green-600">
                                {e.opcoes?.sim || 0}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 bg-slate-50 p-3 rounded-xl text-center border border-slate-100 relative overflow-hidden">
                            <div
                              className="absolute top-0 left-0 bottom-0 bg-red-100 transition-all"
                              style={{
                                width: `${
                                  totalVotos === 0 ? 0 : ((e.opcoes?.nao || 0) / totalVotos) * 100
                                }%`,
                              }}
                            />
                            <div className="relative z-10 flex justify-between items-center px-2">
                              <span className="text-xs font-bold text-slate-500">NÃO</span>
                              <span className="font-black text-red-500">{e.opcoes?.nao || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {enquetesShow.length === 0 && (
                <EmptyState icon={Vote} title="Nenhuma Votação" desc="" />
              )}
            </div>
          )}

          {activeTab === 'manut' && (
            <div className="space-y-3 text-left">
              {!historyMode && (
                <div className="bg-white p-3.5 rounded-xl shadow-sm border border-slate-200 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                      <AlertTriangle size={12} /> Abrir Chamado
                    </p>
                  </div>
                  <textarea
                    value={novoChamado}
                    onChange={(e) => setNovoChamado(e.target.value)}
                    placeholder="Ex: Lâmpada queimada no corredor do 2º andar..."
                    className="w-full bg-slate-50 border border-slate-100 p-2.5 rounded-lg text-xs font-bold outline-none h-16 mb-2 focus:border-[#84cc16] resize-none"
                  />
                  <div className="flex gap-2">
                    <label
                      className={`flex-1 flex items-center justify-center gap-1.5 p-2.5 rounded-lg border text-[9px] font-black uppercase cursor-pointer transition ${
                        fotoChamado
                          ? 'bg-green-50 border-green-200 text-green-700'
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {uploading ? (
                        <RefreshCw size={12} className="animate-spin" />
                      ) : fotoChamado ? (
                        <CheckCircle size={12} />
                      ) : (
                        <Camera size={12} />
                      )}
                      <span className="hidden sm:inline">
                        {fotoChamado ? 'Foto Anexada' : 'Anexar Foto'}
                      </span>
                      <span className="sm:hidden">Foto</span>
                      <input
                        type="file"
                        onChange={handleUploadFoto}
                        className="hidden"
                        accept="image/*"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (novoChamado.trim()) {
                          abrirChamado({
                            item: novoChamado.trim(),
                            data: new Date().toLocaleDateString('pt-BR'),
                            concluido: false,
                            relator: `Apto ${unidade.numero}`,
                            url_foto: fotoChamado,
                          });
                          setNovoChamado('');
                          setFotoChamado('');
                        }
                      }}
                      disabled={!novoChamado.trim() || uploading}
                      className="flex-[2] bg-[#1e293b] text-white py-2.5 rounded-lg font-black text-[9px] uppercase tracking-widest active:scale-95 transition flex justify-center items-center gap-1.5 disabled:opacity-50"
                    >
                      <Send size={12} /> Enviar
                    </button>
                  </div>
                </div>
              )}
              {zelaShow.map((z) => (
                <div
                  key={z.id}
                  className="p-3.5 rounded-xl border bg-white border-slate-100 shadow-sm flex items-start gap-3"
                >
                  {z.concluido ? (
                    <CheckCircle size={18} className="text-green-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle size={18} className="text-orange-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span
                      className={`text-xs font-bold block leading-relaxed ${
                        z.concluido ? 'text-slate-400 line-through' : 'text-slate-700'
                      }`}
                    >
                      {z.item}
                    </span>
                    {z.url_foto && (
                      <a
                        href={z.url_foto}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1.5 inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-blue-500 bg-blue-50 px-2.5 py-1.5 rounded-lg transition hover:bg-blue-100"
                      >
                        <ImageIcon size={10} /> VER FOTO
                      </a>
                    )}
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">
                        {z.data}
                      </span>
                      {z.relator && (
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">
                          {z.relator}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {zelaShow.length === 0 && (
                <EmptyState icon={Wrench} title="Tudo em Ordem" desc="" />
              )}
            </div>
          )}
        </div>
      </div>

      {verContatos && (
        <div className="fixed inset-0 bg-[#1e293b]/90 z-[9000] flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm animate-in fade-in text-left">
          <div className="bg-white rounded-t-[32px] sm:rounded-[32px] w-full max-w-sm p-6 shadow-2xl animate-in slide-in-from-bottom-10 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h3 className="font-black text-xl flex items-center gap-2 text-slate-800">
                <Contact size={24} className="text-teal-500" /> Contatos & Info
              </h3>
              <button
                type="button"
                onClick={() => setVerContatos(false)}
                className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 pb-4">
              {config.telefonesUteis &&
                config.telefonesUteis
                  .filter((t) => t.numero.trim() !== '')
                  .map((t, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center bg-slate-50 border border-slate-100 p-4 rounded-2xl"
                    >
                      <div>
                        <p className="font-black text-slate-700 text-sm">{t.nome}</p>
                        <p className="text-xs font-bold text-slate-500">{t.numero}</p>
                      </div>
                      {t.numero.replace(/\D/g, '').length >= 8 && (
                        <a
                          href={`tel:${t.numero.replace(/\D/g, '')}`}
                          className="bg-teal-50 text-teal-600 p-3 rounded-full hover:bg-teal-100 transition active:scale-95 shadow-sm border border-teal-100"
                        >
                          <PhoneCall size={18} />
                        </a>
                      )}
                    </div>
                  ))}
            </div>
            <div className="pt-4 border-t shrink-0">
              <button
                type="button"
                onClick={() => setPrintMode('cartaz')}
                className="w-full bg-slate-100 text-slate-600 py-4 rounded-xl font-black text-xs hover:bg-slate-200 transition flex justify-center items-center gap-2"
              >
                <Printer size={16} /> IMPRIMIR CARTAZ P/ ELEVADOR
              </button>
            </div>
          </div>
        </div>
      )}

      {verRecibos && (
        <div className="fixed inset-0 bg-[#1e293b]/90 z-[9000] flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm animate-in fade-in text-left">
          <div className="bg-white rounded-t-[32px] sm:rounded-[32px] w-full max-w-sm p-6 shadow-2xl animate-in slide-in-from-bottom-10 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h3 className="font-black text-xl flex items-center gap-2 text-slate-800">
                <History size={24} className="text-blue-500" /> Meus Recibos
              </h3>
              <button
                type="button"
                onClick={() => setVerRecibos(false)}
                className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 pb-4">
              {meusPagamentos.map((p) => {
                const expandido = reciboExpandido === p.id;
                return (
                  <div
                    key={p.id}
                    className={`bg-slate-50 p-4 rounded-2xl border transition-all ${
                      expandido ? 'border-blue-300 shadow-md' : 'border-slate-200'
                    }`}
                  >
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => setReciboExpandido(expandido ? null : p.id)}
                    >
                      <div>
                        <p className="font-black text-slate-800 text-sm">{fmt(p.valor)}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                          Ref: {p.mes}/{p.ano}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-green-600 bg-green-100 px-2 py-1 rounded uppercase">
                          PAGO
                        </span>
                        {expandido ? (
                          <ChevronUp size={16} className="text-slate-400" />
                        ) : (
                          <ChevronDown size={16} className="text-slate-400" />
                        )}
                      </div>
                    </div>
                    {expandido && (
                      <div className="mt-4 pt-4 border-t border-slate-200 border-dashed animate-in fade-in slide-in-from-top-2">
                        <div className="mb-4">
                          <p className="text-[9px] font-bold text-slate-400 uppercase">
                            Data do Pagamento
                          </p>
                          <p className="text-xs font-black text-slate-700">{p.data}</p>
                        </div>
                        <div className="mb-4 bg-blue-50/50 p-2 rounded">
                          <p className="text-[9px] font-bold text-blue-400 uppercase">
                            Autenticidade
                          </p>
                          <p className="text-xs font-mono font-bold text-slate-600 tracking-wider break-all">
                            {p.hash_recibo || 'N/A'}
                          </p>
                        </div>
                        {p.url_comprovante && (
                          <a
                            href={p.url_comprovante}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full text-[10px] font-black text-blue-600 bg-blue-100 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-200 transition shadow-sm mb-2"
                          >
                            <Paperclip size={14} /> VER COMPROVANTE
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setModalReciboVisual({ pagamento: p, unidade });
                            setVerRecibos(false);
                          }}
                          className="w-full text-[10px] font-black text-white bg-blue-500 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-600 transition shadow-sm"
                        >
                          <Receipt size={14} /> ABRIR RECIBO DIGITAL
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
              {meusPagamentos.length === 0 && (
                <EmptyState
                  icon={Receipt}
                  title="Nenhum recibo"
                  desc="Você ainda não tem histórico de pagamentos registrados."
                />
              )}
            </div>
          </div>
        </div>
      )}

      {modalConfig && (
        <ModalConfiguracoesMorador
          onClose={() => setModalConfig(false)}
          showToast={showToast}
          supabase={supabase}
          onSair={onExit}
        />
      )}
      {modalInstalar && <ModalInstalarApp onClose={() => setModalInstalar(false)} />}
    </div>
  );
}

export function ModalConfiguracoesMorador({ onClose, showToast, supabase, onSair }) {
  const [novaSenha, setNovaSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loadingSenha, setLoadingSenha] = useState(false);

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
      onClose();
    } catch (err) {
      showToast(translateError(err), 'error');
    } finally {
      setLoadingSenha(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#1e293b]/90 z-[9000] flex items-center justify-center p-4 backdrop-blur-sm text-left">
      <div className="bg-white rounded-[32px] w-full max-w-sm p-6 shadow-2xl flex flex-col animate-in zoom-in duration-300">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="font-black text-xl flex items-center gap-2 text-slate-800">
            <Settings size={24} className="text-slate-500" /> Minha Conta
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl mb-6">
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
            className="w-full bg-[#1e293b] text-white py-3.5 px-6 rounded-xl font-black text-xs hover:bg-black transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
          >
            {loadingSenha ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}{' '}
            SALVAR NOVA SENHA
          </button>
        </div>

        <button
          type="button"
          onClick={onSair}
          className="w-full bg-red-50 text-red-600 py-4 rounded-xl font-black text-xs hover:bg-red-100 border border-red-200 transition flex items-center justify-center gap-2"
        >
          <LogOut size={16} /> TROCAR / SAIR DO CONDOMÍNIO
        </button>
      </div>
    </div>
  );
}
