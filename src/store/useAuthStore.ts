import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

// Mantida a taxonomia estelar para roles. Excelente prática de ofuscação e branding.
interface Profile {
  horizion_id: string;
  full_name: string;
  role: 'sirius' | 'rigel' | 'betelgeuse' | 'altair' | 'polaris' | 'user';
}

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  fetchProfile: (userId: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  
  setSession: (session) => {
    set({ session, user: session?.user || null, isLoading: false });
  },

  // [CORE-HZ-003] Intervenção na busca do Core: Zero Trust e Error Library
  fetchProfile: async (userId) => {
    try {
      const { data, error, status } = await supabase
        .from('profiles')
        .select('horizion_id, full_name, role')
        .eq('id', userId)
        .single();
        
      if (error) {
        // Padronização rigorosa de erros do ecossistema Horazion
        const coreError = {
          error_code: `HZ-AUTH_${status || '001'}`,
          system_message: error.message || error.details || "Falha silenciosa de RLS ou Rede.",
          user_message: "Não foi possível carregar a sua identidade digital.",
          explanation: "A comunicação com a infraestrutura principal foi negada pelo protocolo Zero Trust.",
          solution: "Verifique as permissões de RLS no banco de dados ou contate o suporte.",
          severity: "error"
        };
        
        console.error("Erro na busca da identidade no Core:", JSON.stringify(coreError, null, 2));
        return; // Interrompe o fluxo para não popular o estado global com null indesejado
      }

      if (data) {
        set({ profile: data as Profile });
      }
    } catch (err: any) {
      console.error("Exceção fatal na camada de rede:", err.message || err);
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, profile: null });
  }
}));