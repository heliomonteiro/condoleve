import React, { useState } from 'react';
import { BookOpen, Home, Key, Scale, Sparkles, X } from 'lucide-react';

export function ModalGuiaCondominio({ onClose, convencao = null }) {
  const [aba, setAba] = useState('contas');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Guia Simples do Condomínio e Lei do Inquilinato"
      className="fixed inset-0 bg-[#1e293b]/90 z-[10025] flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm text-left"
    >
      <div className="bg-white rounded-t-[32px] sm:rounded-[32px] w-full max-w-lg p-6 shadow-2xl max-h-[90vh] flex flex-col animate-in zoom-in duration-200">
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100 shrink-0">
          <h3 className="font-black text-lg text-slate-800 flex items-center gap-2">
            <BookOpen size={22} className="text-[#84cc16]" /> Guia: Inquilino &amp; Proprietário
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar guia"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-slate-100 rounded-full hover:bg-slate-200 transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex gap-1.5 bg-slate-100 p-1.5 rounded-2xl mb-4 shrink-0">
          <button
            type="button"
            onClick={() => setAba('contas')}
            className={`flex-1 min-h-[42px] py-2 px-3 rounded-xl text-xs font-black transition ${
              aba === 'contas'
                ? 'bg-white text-[#1e293b] shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Quem paga o quê?
          </button>
          <button
            type="button"
            onClick={() => setAba('convivencia')}
            className={`flex-1 min-h-[42px] py-2 px-3 rounded-xl text-xs font-black transition ${
              aba === 'convivencia'
                ? 'bg-white text-[#1e293b] shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Regras &amp; Reuniões
          </button>
        </div>

        <div className="overflow-y-auto pr-1 space-y-4 text-xs text-slate-600 leading-relaxed flex-1">
          {aba === 'contas' ? (
            <>
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
                <p className="font-black text-blue-900 text-sm mb-1.5 flex items-center gap-1.5">
                  <Key size={16} className="text-blue-600" /> O que o INQUILINO paga (Despesas do Dia a Dia)
                </p>
                <p className="text-[11px] text-blue-800 mb-2 font-medium">
                  Conforme a Lei do Inquilinato (Lei nº 8.245/91), quem mora no imóvel paga os gastos normais de funcionamento do prédio:
                </p>
                <ul className="space-y-1 text-blue-900 font-semibold list-disc pl-4">
                  <li>Água, luz das áreas comuns e gás;</li>
                  <li>Limpeza, jardinagem e pequenos reparos de rotina;</li>
                  <li>Portaria, zeladoria e administração do condomínio;</li>
                  <li>Taxa mensal ordinária de manutenção.</li>
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
                <p className="font-black text-amber-900 text-sm mb-1.5 flex items-center gap-1.5">
                  <Home size={16} className="text-amber-700" /> O que o PROPRIETÁRIO paga (Obras &amp; Melhorias)
                </p>
                <p className="text-[11px] text-amber-800 mb-2 font-medium">
                  Gastos que valorizam o patrimônio ou são reformas estruturais pertencem ao dono do apartamento:
                </p>
                <ul className="space-y-1 text-amber-900 font-semibold list-disc pl-4">
                  <li>Pintura da fachada, reforma de telhado ou troca de portão;</li>
                  <li>Instalação de câmeras, cerca elétrica ou equipamentos novos;</li>
                  <li>Fundo de Reserva e rateios extraordinários de obras;</li>
                  <li>Dívidas antigas do condomínio anteriores ao aluguel.</li>
                </ul>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-[11px] text-slate-600">
                <strong>Importante para o Síndico:</strong> Perante a lei, o condomínio sempre cobra a
                unidade (e o proprietário responde legalmente em último caso), por isso manter os dois
                cadastros atualizados evita confusão!
              </div>
            </>
          ) : (
            <>
              {convencao && (
                <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-2xl space-y-2">
                  <p className="font-black text-indigo-900 text-sm">
                    Regras Oficiais Deste Condomínio
                  </p>
                  {convencao.horarioSilencio && (
                    <p className="text-xs text-indigo-900">
                      <strong>Horário de Silêncio:</strong> {convencao.horarioSilencio}
                    </p>
                  )}
                  {convencao.regrasMudanca && (
                    <p className="text-xs text-indigo-900">
                      <strong>Mudanças e Obras:</strong> {convencao.regrasMudanca}
                    </p>
                  )}
                  {convencao.regrasGerais && (
                    <p className="text-xs text-indigo-900 whitespace-pre-line">
                      {convencao.regrasGerais}
                    </p>
                  )}
                  {convencao.urlPdf && (
                    <a
                      href={convencao.urlPdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-1 bg-indigo-600 text-white px-3 py-2 rounded-xl text-[11px] font-black"
                    >
                      ABRIR CONVENÇÃO COMPLETA (PDF)
                    </a>
                  )}
                </div>
              )}

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
                <p className="font-black text-slate-800 text-sm flex items-center gap-1.5">
                  <Scale size={16} className="text-[#65a30d]" /> Direitos e Deveres Básicos
                </p>
                <ul className="space-y-2 font-medium">
                  <li>
                    <strong>Barulho e Silêncio:</strong> Respeitar o horário de descanso (em geral das 22h
                    às 7h) e evitar som alto que incomode vizinhos em qualquer horário.
                  </li>
                  <li>
                    <strong>Áreas Comuns:</strong> Corredores, escadas e garagem não podem ser usados como
                    depósito de móveis, bicicletas ou lixo.
                  </li>
                  <li>
                    <strong>Votações e Assembleias:</strong> O proprietário tem direito a voto; o inquilino
                    pode votar em despesas do dia a dia caso o proprietário não compareça (ou com
                    procuração, conforme a convenção).
                  </li>
                  <li>
                    <strong>Síndico não precisa ser proprietário:</strong> Pela lei (Código Civil),
                    qualquer pessoa eleita em assembleia pode ser síndica, salvo se a Convenção do prédio
                    proibir.
                  </li>
                </ul>
              </div>

              <div className="bg-lime-50 border border-lime-200 p-4 rounded-2xl">
                <p className="font-black text-lime-900 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-lime-700" /> Dica de Gestão para Prédios Pequenos
                </p>
                <p className="text-xs text-lime-900 leading-relaxed">
                  Se o prédio ainda não tem <strong>Convenção ou Regimento Interno</strong>, vale fazer
                  uma reunião simples entre os moradores, registrar em ata os horários de silêncio,
                  mudanças e regras da garagem e guardar aqui no CondoLeve.
                </p>
              </div>
            </>
          )}
        </div>

        <div className="pt-4 mt-4 border-t border-slate-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[48px] bg-[#1e293b] text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-black transition"
          >
            ENTENDI E FECHAR
          </button>
        </div>
      </div>
    </div>
  );
}
