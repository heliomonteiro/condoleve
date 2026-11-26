import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || 'Erro inesperado de renderização.',
    };
  }

  componentDidCatch(error, info) {
    console.error('[CondoLeve ErrorBoundary]:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans text-center">
          <div className="bg-white p-8 rounded-[32px] shadow-xl max-w-sm w-full border border-slate-100">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-xl font-black text-slate-800 mb-2">Algo saiu do esperado</h2>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Ocorreu uma falha temporária na tela, mas seus dados estão seguros.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full bg-[#1e293b] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-black transition flex items-center justify-center gap-2"
            >
              <RotateCcw size={14} /> RECARREGAR APLICATIVO
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
