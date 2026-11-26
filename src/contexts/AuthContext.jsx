/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { generateId } from '../utils/helpers';
import { RefreshCw } from 'lucide-react';

const AuthContext = createContext({});

function parseInitialInviteFromUrl() {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const token = params.get('convite');
  const cId = params.get('c');
  const inviteNum = params.get('invite');

  if (token && cId) {
    return { token, cId, numero: inviteNum || null };
  }
  if (inviteNum && cId) {
    return { numero: inviteNum, cId, token: null };
  }
  return null;
}

function readInitialLetraGrande() {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem('condoleve_letra_grande') === '1';
  } catch {
    return false;
  }
}

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [contexto, setContexto] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [inviteData, setInviteData] = useState(parseInitialInviteFromUrl);
  const [toasts, setToasts] = useState([]);
  const [letraGrande, setLetraGrande] = useState(readInitialLetraGrande);

  const showToast = useCallback((msg, type = 'success') => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, msg: String(msg), type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleLetraGrande = useCallback(() => {
    const next = !letraGrande;
    setLetraGrande(next);
    try {
      localStorage.setItem('condoleve_letra_grande', next ? '1' : '0');
    } catch {
      // ignore storage errors
    }
    showToast(
      next
        ? 'Letra Maior ativada para facilitar a leitura!'
        : 'Tamanho padrão de letra restaurado.'
    );
  }, [letraGrande, showToast]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('letra-grande', letraGrande);
    }
  }, [letraGrande]);

  useEffect(() => {
    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data: { session: activeSession }, error }) => {
        if (error) console.error('getSession error:', error);
        if (mounted) {
          setSession(activeSession);
          setLoadingConfig(false);
        }
      })
      .catch((err) => {
        console.error('getSession exception:', err);
        if (mounted) setLoadingConfig(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      if (!nextSession) setContexto(null);

      if (event === 'PASSWORD_RECOVERY') {
        showToast('Bem-vindo de volta! Acesse Ajustes > Senha para cadastrar sua nova senha.');
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [showToast]);

  if (loadingConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <RefreshCw className="animate-spin text-[#84cc16]" />
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        setSession,
        contexto,
        setContexto,
        inviteData,
        setInviteData,
        toasts,
        showToast,
        removeToast,
        letraGrande,
        toggleLetraGrande,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
