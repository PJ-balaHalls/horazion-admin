import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('HZ-SYS_001: Variáveis de ambiente do Supabase não encontradas.');
}

// Log arquitetural de validação (aparecerá no console do navegador)
if (typeof window !== 'undefined') {
  console.log('[HZ-CORE] Inicializando conexão com:', supabaseUrl);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});