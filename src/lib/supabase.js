import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://jtoubtxumtfwrolxrbpf.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_jRaZSrBV1Q75Ftj7OVd_Jg_tozzOju3';

const rawEnvUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const rawEnvKey = (
  import.meta.env.VITE_SUPABASE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  ''
).trim();

const isValidHttpUrl = /^https?:\/\/[a-z0-9.-]+/i.test(rawEnvUrl);
const isValidKey = rawEnvKey.length >= 20 && !rawEnvKey.includes('sua_chave');

const SUPABASE_URL = isValidHttpUrl ? rawEnvUrl : DEFAULT_SUPABASE_URL;
const SUPABASE_KEY = isValidHttpUrl && isValidKey ? rawEnvKey : DEFAULT_SUPABASE_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
