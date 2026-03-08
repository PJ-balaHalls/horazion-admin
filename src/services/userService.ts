// src/services/userService.ts
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/horizion';

export const userService = {
  async getAllProfiles() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Profile[];
  },

  async createProfile(profileData: Partial<Profile>) {
    // Nota: Em produção, o 'id' deve vir da criação do usuário em auth.users.
    // Para este provisionamento, enviamos os dados para a tabela profiles.
    const { data, error } = await supabase
      .from('profiles')
      .insert([profileData])
      .select();

    if (error) {
      console.error("Erro detalhado Core:", error);
      throw error;
    }
    return data;
  },

  async getGrowthStats() {
    const { data, error } = await supabase.from('profiles').select('created_at');
    if (error || !data) return [{ name: 'Jan', count: 0 }];
    
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    return months.map((m, i) => ({
      name: m,
      count: data.filter(d => new Date(d.created_at).getMonth() <= i).length
    }));
  }
};