import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { generateId } from '../utils/helpers';
import { RefreshCw } from 'lucide-react';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [contexto, setContexto] = useState(null); 
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [inviteData, setInviteData] = useState(null);
  const [toasts, setToasts] = useState([]);

  const showToast = (msg, type = 'success') => {
    const id = generateId(); 
    setToasts(prev => [...prev, { id, msg: String(msg), type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('invite') && params.get('c')) {
        setInviteData({ numero: params.get('invite'), cId: params.get('c') });
    }

    try {
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (error) console.error("getSession error:", error);
        setSession(session);
        setLoadingConfig(false);
      }).catch(err => {
        console.error("getSession exception:", err);
        setLoadingConfig(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        setSession(session);
        if(!session) setContexto(null);
        
        if (event === 'PASSWORD_RECOVERY') {
            showToast("Bem-vindo de volta! Acesse as Configurações e altere sua senha no seu Perfil.");
        }
      });

      return () => subscription?.unsubscribe();
    } catch(err) {
      console.error("Critical AuthContext error:", err);
      setLoadingConfig(false);
    }
  }, []);

  if (loadingConfig) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><RefreshCw className="animate-spin text-[#84cc16]"/></div>;
  }

  return (
    <AuthContext.Provider value={{ 
        session, setSession,
        contexto, setContexto, 
        inviteData, setInviteData,
        toasts, showToast, removeToast 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
