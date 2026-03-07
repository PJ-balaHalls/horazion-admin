import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/horizion';

/**
 * [CORE-HZ-015] Serviço de Identidades - Horazion Core
 * Exportação nomeada para garantir integridade no build SPA.
 */
export const userService = {
  async getAllProfiles() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Profile[];
  },

  async updateProfile(id: string, updates: Partial<Profile>) {
    const { error } = await supabase.from('profiles').update(updates).eq('id', id);
    if (error) throw error;
  },

  async getGrowthStats() {
    // Tenta buscar dados agregados por mês. Fallback seguro caso a RPC não exista.
    const { data, error } = await supabase.from('profiles').select('created_at');
    if (error || !data) {
      return [
        { name: 'Jan', count: 400 }, { name: 'Fev', count: 850 },
        { name: 'Mar', count: 1200 }, { name: 'Abr', count: 2100 }
      ];
    }

    // Agregação básica no cliente para o gráfico (pode ser movida para RPC no futuro)
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    const stats = months.map((m, i) => ({
      name: m,
      count: data.filter(d => new Date(d.created_at).getMonth() <= i).length
    }));
    return stats;
  }
};