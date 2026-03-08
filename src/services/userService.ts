import { supabase } from '@/lib/supabase';
import { Profile, StellarRole } from '@/types/horizion';

export const userService = {
  /**
   * Gera um HorizionID único baseado no nome
   */
  generateID(name: string): string {
    const slug = name.split(' ')[0].toUpperCase();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `HZ-${slug}-${random}`;
  },

  /**
   * Busca endereço via API externa
   */
  async fetchAddress(zip: string) {
    const res = await fetch(`https://viacep.com.br/ws/${zip}/json/`);
    return res.json();
  },

  async getAllProfiles(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('role', { ascending: true });
    if (error) throw error;
    return data as Profile[];
  },

  async createProfile(profile: any) {
    const { data, error } = await supabase.from('profiles').insert([profile]).select().single();
    if (error) throw error;
    return data;
  }
};