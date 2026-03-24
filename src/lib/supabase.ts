import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Previne a quebra do build estático (prerender) da Netlify
if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window !== 'undefined') {
    // Se estiver no navegador do usuário e faltar as chaves, aí sim bloqueamos
    throw new Error('HZ-SYS_001: Variáveis de ambiente do Supabase não encontradas.');
  } else {
    // Se estiver no servidor da Netlify gerando o build, apenas avisa
    console.warn('⚠️ [HZ-CORE] Variáveis do Supabase ausentes durante o build. Usando placeholders para não travar.');
  }
}

if (typeof window !== 'undefined' && supabaseUrl) {
  console.log('[HZ-CORE] Inicializando conexão com:', supabaseUrl);
}

// Inicializa com as chaves ou com placeholders inofensivos para o Next.js conseguir compilar
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-anon-key', 
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);