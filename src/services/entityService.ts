import { supabase } from '@/lib/supabase';
import { parseHorizionError } from '@/lib/hzErrors';

export const entityService = {
  /**
   * Obtém todas as organizações registadas no ecossistema
   */
  async getEntities() {
    const { data, error } = await supabase
      .schema('admin')
      .from('entities')
      .select('*')
      .order('display_name');
    
    if (error) throw parseHorizionError(error);
    return data;
  },

  /**
   * Obtém os detalhes completos de uma organização específica pelo ID
   */
  async getEntityById(id: string) {
    const { data, error } = await supabase
      .schema('admin')
      .from('entities')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw parseHorizionError(error);
    return data;
  },

  /**
   * Obtém todas as afiliações e tokens de um Horizion ID (Utilizador)
   */
  async getUserAffiliations(profileId: string) {
    const { data, error } = await supabase
      .schema('admin')
      .from('user_affiliations')
      .select(`
        *,
        entity:entity_id (*)
      `)
      .eq('profile_id', profileId);
      
    if (error) throw parseHorizionError(error);
    return data;
  },

  /**
   * Regista uma nova entidade corporativa no ecossistema (Horizion Account)
   */
  async createEntity(entity: any) {
    const { data, error } = await supabase
      .schema('admin')
      .from('entities')
      .insert(entity)
      .select()
      .single();
      
    if (error) throw parseHorizionError(error);
    return data;
  },

  /**
   * Atualiza os dados legais e metadados de uma organização existente
   */
  async updateEntity(id: string, updates: any) {
    const { data, error } = await supabase
      .schema('admin')
      .from('entities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw parseHorizionError(error);
    return data;
  },

  /**
   * Atualiza as permissões de privacidade granulares (LGPD) de uma afiliação
   */
  async updatePrivacy(affiliationId: string, settings: any) {
    const { error } = await supabase
      .schema('admin')
      .from('user_affiliations')
      .update({ privacy_settings: settings })
      .eq('id', affiliationId);
      
    if (error) throw parseHorizionError(error);
  },

  /**
   * Faz o upload seguro de ativos de branding da marca para o Storage
   */
  async uploadEntityMedia(file: File, entitySlug: string, type: 'logo' | 'isologo' | 'icon') {
    const fileExt = file.name.split('.').pop();
    // Gera um nome único para contornar problemas de cache do navegador
    const fileName = `${entitySlug}-${type}-${Date.now()}.${fileExt}`;
    const filePath = `brands/${entitySlug}/${fileName}`;

    // 1. Upload para o bucket seguro
    const { error: uploadError } = await supabase.storage
      .from('entities_media')
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (uploadError) throw parseHorizionError(uploadError);

    // 2. Retorna a URL pública gerada para salvar no JSONB da Entidade
    const { data } = supabase.storage
      .from('entities_media')
      .getPublicUrl(filePath);
      
    return data.publicUrl;
  }
};