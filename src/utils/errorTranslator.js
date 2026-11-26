// ============================================================================
// Tradutor Humanizado de Erros (Foco em Usuários Leigos e Terceira Idade)
// Converte mensagens técnicas/em inglês do Supabase e de rede para português
// claro, calmo e orientativo.
// ============================================================================

export function translateError(error) {
  const raw = typeof error === 'string' ? error : error?.message || '';
  const msg = raw.toLowerCase();

  if (!raw) {
    return 'Não foi possível concluir agora. Tente novamente em instantes.';
  }
  if (msg.includes('invalid login credentials') || msg.includes('invalid_credentials')) {
    return 'E-mail ou senha incorretos. Confira se digitou certo ou toque em "Esqueceu a senha?".';
  }
  if (msg.includes('user already registered') || msg.includes('already been registered')) {
    return 'Este e-mail já tem conta cadastrada! Volte e use o botão "ENTRAR".';
  }
  if (msg.includes('password should be at least')) {
    return 'Sua senha precisa ter pelo menos 6 letras ou números.';
  }
  if (msg.includes('email not confirmed')) {
    return 'Confirme seu cadastro clicando no link que enviamos para o seu e-mail.';
  }
  if (msg.includes('rate limit') || msg.includes('too many requests') || msg.includes('over_email_send_rate_limit')) {
    return 'Muitas tentativas seguidas. Aguarde 1 minutinho antes de tentar novamente.';
  }
  if (msg.includes('failed to fetch') || msg.includes('networkerror') || msg.includes('network request failed')) {
    return 'Sem conexão com a internet no momento. Verifique seu Wi-Fi ou 4G.';
  }
  if (msg.includes('jwt expired') || msg.includes('session_not_found')) {
    return 'Seu acesso expirou por segurança. Entre novamente com seu e-mail e senha.';
  }
  if (msg.includes('same_password') || msg.includes('different from the old password')) {
    return 'A nova senha precisa ser diferente da senha atual.';
  }

  return raw;
}
