import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://jtoubtxumtfwrolxrbpf.supabase.co"; 
const SUPABASE_KEY = "sb_publishable_jRaZSrBV1Q75Ftj7OVd_Jg_tozzOju3"; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
