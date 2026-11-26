import React from 'react';
import { ShieldCheck, FileText, X } from 'lucide-react';

export function ModalTermosLGPD({ tipo = 'termos', onClose }) {
  const isPrivacidade = tipo === 'privacidade';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isPrivacidade ? 'Política de Privacidade' : 'Termos de Uso'}
      className="fixed inset-0 bg-[#1e293b]/90 z-[10030] flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm text-left"
    >
      <div className="bg-white rounded-t-[32px] sm:rounded-[32px] w-full max-w-lg p-6 shadow-2xl max-h-[88vh] flex flex-col animate-in zoom-in duration-200">
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100 shrink-0">
          <h3 className="font-black text-lg text-slate-800 flex items-center gap-2">
            {isPrivacidade ? (
              <>
                <ShieldCheck size={22} className="text-[#84cc16]" /> Política de Privacidade (LGPD)
              </>
            ) : (
              <>
                <FileText size={22} className="text-slate-600" /> Termos de Uso — CondoLeve
              </>
            )}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar janela"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-slate-100 rounded-full hover:bg-slate-200 transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto pr-2 space-y-4 text-xs text-slate-600 leading-relaxed flex-1">
          {isPrivacidade ? (
            <>
              <p>
                <strong>1. Compromisso com a Privacidade (LGPD - Lei nº 13.709/2018):</strong> O
                CondoLeve guarda e organiza exclusivamente as informações necessárias para a gestão
                financeira e comunicação do seu condomínio, sob responsabilidade do Síndico.
              </p>
              <p>
                <strong>2. Privacidade entre Vizinhos:</strong> Os moradores enxergam apenas os
                recibos e dados da sua própria unidade, além dos avisos e resumos gerais do prédio.
                Telefones pessoais de outros moradores e listas de cobrança ficam visíveis apenas
                para a administração.
              </p>
              <p>
                <strong>3. Segurança dos Dados:</strong> As informações ficam protegidas com
                isolamento individual por condomínio (cada prédio só acessa seus próprios dados) e
                conexão protegida por criptografia do início ao fim.
              </p>
              <p>
                <strong>4. Uso da Inteligência Artificial:</strong> Quando o síndico fotografa uma
                conta ou pede ajuda para melhorar um aviso, apenas aquele documento pontual é
                analisado, sem compartilhar dados pessoais de moradores.
              </p>
              <p>
                <strong>5. Seus Direitos:</strong> A qualquer momento você pode pedir a atualização,
                cópia ou exclusão dos seus dados junto ao síndico do prédio ou pelo suporte do
                CondoLeve.
              </p>
            </>
          ) : (
            <>
              <p>
                <strong>1. Objeto:</strong> O CondoLeve é uma plataforma digital de apoio à organização
                financeira, mural de avisos, enquetes e chamados de manutenção voltada a condomínios
                residenciais e comerciais.
              </p>
              <p>
                <strong>2. Responsabilidade Contábil e Jurídica:</strong> Os lançamentos de receitas,
                despesas, chaves PIX e comunicados são de inteira responsabilidade do Síndico/Gestor do
                condomínio. O CondoLeve não movimenta valores bancários diretamente nem substitui obrigações
                fiscais/trabalhistas previstas em lei ou na Convenção Condominial.
              </p>
              <p>
                <strong>3. Planos, Degustação e Limites:</strong> Todo novo condomínio pode testar os
                recursos Pro gratuitamente pelo período promocional vigente. Após o término, caso não haja
                contratação do Plano Pro, o condomínio permanece ativo no Plano Grátis (respeitando os
                limites de unidades, armazenamento e recursos avançados) sem perda dos dados já registrados.
              </p>
              <p>
                <strong>4. Uso Adequado:</strong> É vedado utilizar a plataforma para expor condôminos de
                forma vexatória, armazenar arquivos ilícitos ou tentar acessar dados de terceiros.
              </p>
            </>
          )}
        </div>

        <div className="pt-4 mt-4 border-t border-slate-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-[#1e293b] text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-black transition"
          >
            ENTENDI E FECHAR
          </button>
        </div>
      </div>
    </div>
  );
}
