import React from 'react';
import { TelaLogin } from './pages/Login/TelaLogin';
import { SeletorContexto } from './pages/ContextSelector/SeletorContexto';
import { SistemaCondominio } from './pages/Dashboard/SistemaCondominio';
import { ToastContainer } from './components/ui/ToastContainer';
import { useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';

export default function App() {
  const { session, contexto, setContexto, toasts, removeToast, showToast } = useAuth();

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      {!session ? ( 
        <TelaLogin /> 
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
