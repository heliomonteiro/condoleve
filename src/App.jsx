import React, { useState } from 'react';
import { TelaLogin } from './pages/Login/TelaLogin';
import { CondoLeveLP } from './pages/Landing/CondoLeveLP';
import { SeletorContexto } from './pages/ContextSelector/SeletorContexto';
import { SistemaCondominio } from './pages/Dashboard/SistemaCondominio';
import { ToastContainer } from './components/ui/ToastContainer';
import { useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';

export default function App() {
  const { session, contexto, setContexto, showToast, inviteData } = useAuth();
  // Se o usuário veio por link de convite (?invite= / ?convite=), abre direto no Login; senão, apresenta a Landing Page
  const [authView, setAuthView] = useState(() => (inviteData ? 'login' : 'landing'));
  const [loginInitialMode, setLoginInitialMode] = useState('login');

  return (
    <>
      <ToastContainer />
      {!session ? (
        authView === 'landing' && !inviteData ? (
          <CondoLeveLP
            onAcessarSistema={() => {
              setLoginInitialMode('login');
              setAuthView('login');
            }}
            onCriarConta={() => {
              setLoginInitialMode('cadastro');
              setAuthView('login');
            }}
          />
        ) : (
          <TelaLogin
            initialMode={loginInitialMode}
            onVoltarSite={!inviteData ? () => setAuthView('landing') : null}
          />
        )
      ) : !contexto ? (
        <SeletorContexto />
      ) : (
        <SistemaCondominio
          supabase={supabase}
          session={session}
          contexto={contexto}
          onSwitch={() => setContexto(null)}
          showToast={showToast}
        />
      )}
    </>
  );
}
