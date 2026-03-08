import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { HorizionUser, StarRole } from '@/types/horizion';

interface AuthState {
  user: HorizionUser | null;
  isAuthenticated: boolean;
  isChecking: boolean;
  setUser: (user: HorizionUser | null) => void;
  checkSession: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isChecking: true, // Impede flicker de tela ao carregar

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  // Esta é a função exata que a sua página de login está exigindo
  checkSession: async () => {
    set({ isChecking: true });
    
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        set({ user: null, isAuthenticated: false, isChecking: false });
        return;
      }

      // Zero Trust: A estrela de permissão (role) vem do JWT criptografado, não do banco legível
      const jwtRole = (session.user.app_metadata?.star_role as StarRole) || 'sun';

      // Busca apenas dados cosméticos na tabela public.profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('horizion_id, full_name, avatar_url, is_active')
        .eq('id', session.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('[HZ-AUTH-SYSTEM] Erro ao buscar perfil:', profileError);
      }

      if (profile && profile.is_active) {
        set({
          user: {
            id: session.user.id,
            email: session.user.email || '',
            horizion_id: profile.horizion_id,
            full_name: profile.full_name,
            star_role: jwtRole, // Fonte da verdade para a Hierarquia Estelar
            avatar_url: profile.avatar_url,
            is_active: profile.is_active,
          },
          isAuthenticated: true,
        });
      } else {
        // Caso o usuário exista no auth mas não tenha perfil ativo
        set({ user: null, isAuthenticated: false });
      }
    } catch (error) {
      console.error('[HZ-AUTH-SYSTEM] Falha crítica ao validar sessão:', error);
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isChecking: false });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false, isChecking: false });
  },
}));