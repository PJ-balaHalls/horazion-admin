import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

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

  fetchProfile: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('horizion_id, full_name, role')
      .eq('id', userId)
      .single();
      
    if (!error && data) {
      set({ profile: data as Profile });
    } else {
      console.error("Erro na busca da identidade no Core:", error);
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, profile: null });
  }
}));