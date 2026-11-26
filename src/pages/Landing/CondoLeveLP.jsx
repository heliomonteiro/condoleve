import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Smartphone,
  FileText,
  Menu,
  X,
  ArrowRight,
  MessageCircle,
  ShieldCheck,
  Zap,
  Sparkles,
  Crown,
} from 'lucide-react';
import { PLANS, getCheckoutLink } from '../../config/plans';
import { formatarMoeda } from '../../utils/helpers';

export function CondoLeveLP({ onAcessarSistema, onCriarConta }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const abrirWhatsAppComercial = () => {
    const phone =
      (typeof import.meta !== 'undefined' &&
        import.meta.env &&
        import.meta.env.VITE_COMERCIAL_WHATSAPP) ||
      '5534999358189';
    const msg =
      'Olá! Vi o CondoLeve e gostaria de tirar uma dúvida sobre como usar no meu condomínio.';
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="font-sans text-slate-800 antialiased selection:bg-lime-200 selection:text-slate-900 bg-white">
      {/* NAV BAR */}
      <nav className="fixed w-full z-50 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="relative">
                <Building2 className="h-8 w-8 text-slate-800" />
                <div className="absolute -bottom-1 -right-1 bg-lime-500 rounded-full w-3 h-3 border-2 border-white" />
              </div>
              <span className="text-2xl font-bold text-slate-800 tracking-tight">
                Condo<span className="text-lime-600">Leve</span>
              </span>
            </div>

            <div className="hidden md:flex space-x-8 items-center">
              <a href="#beneficios" className="text-slate-600 hover:text-lime-600 font-medium transition">
                Benefícios
              </a>
              <a href="#como-funciona" className="text-slate-600 hover:text-lime-600 font-medium transition">
                Como Funciona
              </a>
              <a href="#planos" className="text-slate-600 hover:text-lime-600 font-medium transition">
                Planos
              </a>
              <button
                type="button"
                onClick={onAcessarSistema}
                className="bg-slate-800 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-slate-700 transition shadow-lg"
              >
                Acessar Sistema
              </button>
            </div>

            <div className="md:hidden">
              <button
                type="button"
                onClick={toggleMenu}
                aria-label="Abrir menu"
                className="text-slate-800 hover:text-lime-600 focus:outline-none p-2"
              >
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-100 shadow-xl">
            <div className="px-4 pt-2 pb-6 space-y-2">
              <a
                href="#beneficios"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-lg"
              >
                Benefícios
              </a>
              <a
                href="#como-funciona"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-lg"
              >
                Como Funciona
              </a>
              <a
                href="#planos"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-lg"
              >
                Planos
              </a>
              <button
                type="button"
                onClick={onAcessarSistema}
                className="w-full mt-4 bg-lime-500 text-slate-900 px-6 py-3 rounded-lg font-bold hover:bg-lime-400 transition"
              >
                Entrar no Sistema
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <header className="pt-32 pb-20 lg:pt-40 lg:pb-28 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-100 text-lime-800 text-sm font-semibold mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-600" />
              </span>
              Feito para pequenos condomínios sem administradora
            </div>

            <h1 className="text-4xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
              Abandone o caderninho. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-lime-600">
                Controle seu prédio fácil.
              </span>
            </h1>

            <p className="text-lg text-slate-600 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Simples para qualquer idade, sem planilhas quebradas e sem pagar caro. Controle quem pagou, gere recibos digitais, fotografe contas com IA e preste contas no WhatsApp em segundos.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                type="button"
                onClick={onCriarConta}
                className="flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition shadow-xl"
              >
                Começar Grátis
                <ArrowRight size={20} />
              </button>
              <button
                type="button"
                onClick={onAcessarSistema}
                className="flex items-center justify-center gap-2 bg-white text-slate-700 border-2 border-slate-200 px-8 py-4 rounded-xl font-bold text-lg hover:border-lime-500 hover:text-lime-600 transition"
              >
                <Smartphone size={20} />
                Já tenho conta
              </button>
            </div>

            <p className="mt-4 text-sm text-slate-500 font-medium">
              * Grátis até 8 unidades ou 30 dias completos no Pro sem cartão de crédito.
            </p>
          </div>

          <div className="lg:w-1/2 relative w-full max-w-md lg:max-w-none">
            <div className="relative bg-white p-6 rounded-3xl shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                    Saldo Atual em Caixa
                  </h3>
                  <p className="text-3xl font-bold text-slate-800">R$ 4.250,00</p>
                </div>
                <div className="h-10 w-10 bg-lime-100 rounded-full flex items-center justify-center text-lime-600">
                  <Building2 size={20} />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">Apt 101 - Sr. Antônio</p>
                      <p className="text-xs text-slate-500">Pago hoje às 09:30</p>
                    </div>
                  </div>
                  <span className="font-bold text-green-600">+ R$ 250</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">Apt 102 - Dona Tereza</p>
                      <p className="text-xs text-slate-500">Pago via PIX</p>
                    </div>
                  </div>
                  <span className="font-bold text-green-600">+ R$ 250</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center text-red-500">
                      <X size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">Apt 203 - Pendente</p>
                      <p className="text-xs text-red-500">2 cotas em aberto</p>
                    </div>
                  </div>
                  <span className="text-xs bg-white border border-red-200 text-red-600 px-2.5 py-1 rounded font-bold flex items-center gap-1">
                    <MessageCircle size={12} /> Cobrar
                  </span>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <div className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-sm font-medium shadow-lg flex items-center gap-2">
                  <FileText size={16} className="text-lime-400" /> Prestação de Contas LGPD
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* COMPARISON SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">A diferença é clara</h2>
            <p className="text-slate-500 mt-2">Por que síndicos escolhem o CondoLeve</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 bg-slate-200 text-slate-500 px-4 py-6 rounded-full text-xs font-bold rotate-12">
                DIFÍCIL
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-6 flex items-center gap-2">
                <FileText className="text-slate-400" /> O Jeito Antigo
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-slate-600">
                  <X className="text-red-400 shrink-0 mt-1" size={18} />
                  <span>Caderninho e notas fiscais que se perdem fácil</span>
                </li>
                <li className="flex items-start gap-3 text-slate-600">
                  <X className="text-red-400 shrink-0 mt-1" size={18} />
                  <span>Planilhas confusas e letras pequenas no celular</span>
                </li>
                <li className="flex items-start gap-3 text-slate-600">
                  <X className="text-red-400 shrink-0 mt-1" size={18} />
                  <span>Cobrança constrangedora no grupo ou porta a porta</span>
                </li>
                <li className="flex items-start gap-3 text-slate-600">
                  <X className="text-red-400 shrink-0 mt-1" size={18} />
                  <span>Moradores desconfiam quando não veem os comprovantes</span>
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-3xl bg-slate-900 text-white relative shadow-2xl border-4 border-lime-500/30">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 bg-lime-500 text-slate-900 px-4 py-6 rounded-full text-xs font-bold rotate-12 shadow-lg">
                LEVE
              </div>
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Building2 className="text-lime-400" /> Com CondoLeve
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-slate-300">
                  <CheckCircle2 className="text-lime-400 shrink-0 mt-1" size={18} />
                  <span>Botão A+ (Letra Maior) e telas simples sem termos difíceis</span>
                </li>
                <li className="flex items-start gap-3 text-slate-300">
                  <CheckCircle2 className="text-lime-400 shrink-0 mt-1" size={18} />
                  <span>Fotografe a conta de luz/água e a IA preenche para você</span>
                </li>
                <li className="flex items-start gap-3 text-slate-300">
                  <CheckCircle2 className="text-lime-400 shrink-0 mt-1" size={18} />
                  <span>Cobrança cordial no WhatsApp em 1 clique + PIX fácil</span>
                </li>
                <li className="flex items-start gap-3 text-slate-300">
                  <CheckCircle2 className="text-lime-400 shrink-0 mt-1" size={18} />
                  <span>Auditoria de caixa e perfil para Conselheiro Fiscal</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="beneficios" className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Funcionalidades que resolvem</h2>
            <p className="text-slate-600 text-lg">
              Sem excesso de botões. Apenas o que você precisa para manter as contas em dia e o prédio em paz.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="h-14 w-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                <MessageCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Cobrança & PIX no Zap</h3>
              <p className="text-slate-600">
                Controle automático de inadimplência e envio cordial no WhatsApp com a chave PIX pronta para o morador pagar.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="h-14 w-14 bg-lime-50 rounded-xl flex items-center justify-center text-lime-600 mb-6">
                <Sparkles size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">IA Zero Digitação</h3>
              <p className="text-slate-600">
                Tire foto de notas/boletos para lançar sozinho e transforme recados rápidos em avisos educados no Mural.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="h-14 w-14 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-6">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Prestação de Contas LGPD</h3>
              <p className="text-slate-600">
                Gere o demonstrativo mensal em imagem sem expor nomes de vizinhos devedores e libere acesso de leitura ao Conselho.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* STEP BY STEP */}
      <section id="como-funciona" className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Pronto para usar em 3 minutos</h2>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">Crie sua conta grátis</h4>
                    <p className="text-slate-600">
                      Funciona direto no navegador ou instalado no celular, sem baixar aplicativo pesado.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">Gere os apartamentos em 1 clique</h4>
                    <p className="text-slate-600">
                      Informe quantos andares e aptos por andar — nós montamos a lista automática na hora.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-lime-500 text-slate-900 flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">Envie o link aos moradores</h4>
                    <p className="text-slate-600">
                      Cada vizinho acessa sua fatura, copia o PIX com passo a passo e acompanha avisos e votações.
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onCriarConta}
                className="mt-10 bg-lime-500 text-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-lime-400 transition shadow-lg"
              >
                Criar minha conta agora
              </button>
            </div>

            {/* Planos Transparentes */}
            <div id="planos" className="space-y-4">
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                    Para começar leve
                  </span>
                  <span className="bg-slate-200 text-slate-700 text-xs font-black px-3 py-1 rounded-full">
                    GRÁTIS
                  </span>
                </div>
                <h3 className="text-2xl font-black text-slate-900">R$ 0 / mês</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Até <strong>8 apartamentos</strong>: livro-caixa, recibos digitais, mural e portal do morador.
                </p>
              </div>

              <div className="p-7 rounded-3xl bg-slate-900 text-white border-2 border-lime-500 shadow-2xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-black uppercase tracking-widest text-lime-400 flex items-center gap-1">
                    <Crown size={14} /> CondoLeve Pro
                  </span>
                  <span className="bg-lime-500 text-slate-900 text-xs font-black px-3 py-1 rounded-full">
                    30 DIAS GRÁTIS
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-black">
                    {formatarMoeda(PLANS.pro.priceYearlyMonthlyEq)}
                  </h3>
                  <span className="text-sm text-slate-400">/mês no plano anual</span>
                </div>
                <p className="text-xs text-slate-400 mt-1 mb-4">
                  Ou {formatarMoeda(PLANS.pro.priceMonthly)}/mês sem fidelidade • Até 120 unidades
                </p>
                <ul className="space-y-2 text-sm text-slate-200 mb-6">
                  <li className="flex items-center gap-2">
                    <Zap size={15} className="text-lime-400 shrink-0" /> Cobrança 1-Clique no WhatsApp + Inadimplência
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap size={15} className="text-lime-400 shrink-0" /> IA Leitora de Contas & Redator de Avisos
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap size={15} className="text-lime-400 shrink-0" /> Prestação Oficial PNG/Excel + Conselho Fiscal
                  </li>
                </ul>
                <button
                  type="button"
                  onClick={() => window.open(getCheckoutLink('Novo Condomínio', 'landing', 'anual'), '_blank', 'noopener,noreferrer')}
                  className="w-full bg-lime-500 text-slate-900 py-3.5 rounded-xl font-black text-sm hover:bg-lime-400 transition"
                >
                  TESTAR 30 DIAS GRÁTIS
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 bg-slate-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">O seu condomínio merece ser leve.</h2>
          <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">
            Troque o caderninho e a planilha quebrada pela tranquilidade. Comece grátis em 3 minutos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              type="button"
              onClick={onCriarConta}
              className="bg-lime-500 text-slate-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-lime-400 transition shadow-lg"
            >
              Quero meu condomínio organizado
            </button>
            <button
              type="button"
              onClick={abrirWhatsAppComercial}
              className="bg-transparent border border-slate-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition flex items-center justify-center gap-2"
            >
              <MessageCircle size={20} /> Falar no WhatsApp
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-100 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-slate-800" />
            <span className="text-xl font-bold text-slate-800">
              Condo<span className="text-lime-600">Leve</span>
            </span>
          </div>
          <div className="text-slate-500 text-sm text-center">
            © {new Date().getFullYear()} CondoLeve Gestão Simplificada. Todos os direitos reservados.
          </div>
          <button
            type="button"
            onClick={abrirWhatsAppComercial}
            className="text-slate-600 hover:text-lime-600 font-bold text-sm flex items-center gap-2 transition"
          >
            <MessageCircle size={18} /> Atendimento WhatsApp
          </button>
        </div>
      </footer>
    </div>
  );
}
