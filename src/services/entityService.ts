// src/services/entityService.ts

import { supabase } from '@/lib/supabase';
import { Entity, EntityStatus, MassOnboardingJob } from '@/types/horizion';
import { HzError } from '@/lib/hzErrors'; // Assumindo sua biblioteca de erros estruturada

export const entityService = {
  /**
   * Obtém a lista de organizações com paginação baseada em limite
   * Aponta para o schema 'admin' garantindo acesso aos dados estendidos (Enterprise)
   */
  async getEntities(): Promise<Entity[]> {
    const { data, error } = await supabase
      .schema('admin')
      .from('entities')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar entidades:', error);
      throw new Error('HZ-ENT_001: Falha ao carregar as organizações.');
    }
    
    return data as Entity[];
  },

  /**
   * Obtém os detalhes completos de uma organização, incluindo billing e limits
   * Aponta para o schema 'admin' garantindo isolamento de domínio
   */
  async getEntityById(id: string): Promise<Entity | null> {
    const { data, error } = await supabase
      .schema('admin')
      .from('entities')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not Found
      console.error(`Erro ao buscar entidade ${id}:`, error);
      throw new Error('HZ-ENT_002: Falha ao carregar detalhes da organização.');
    }

    return data as Entity;
  },

  /**
   * Provisiona uma nova entidade no ecossistema (Base para B2B)
   * Implementa Anti-Corruption Layer para traduzir DTOs do Frontend para o Schema Físico
   */
  async createEntity(entityData: any): Promise<any> {
    // 1. Anti-Corruption Layer (Zero Trust) 
    // Mapeamento explícito da estrutura aninhada do Frontend (formData) para extração segura
    const { 
      displayName, // Atenção: O Frontend envia em camelCase
      slug, 
      strategic_data, 
      verification, 
      branding, 
      org_chart, 
      benefits_engine,
      website
    } = entityData;

    // 2. Montagem do Payload Seguro para o Banco de Dados
    const payload = {
      display_name: displayName, // Tradução de DTO para o Schema Físico
      slug: slug,
      category: 'company', // Categoria padrão B2B
      sector: strategic_data?.sector || null, // Extração de objeto aninhado
      cnpj: verification?.registration_number || null, // CNPJ mapeado da aba de verificação
      website: website || null,
      
      // 3. Encapsulamento de Metadados Estruturados (JSONB)
      metadata: {
        branding: branding || { primary_color: "#E50000" },
        strategic_data: strategic_data || {},
        org_chart: org_chart || {},
        benefits_engine: benefits_engine || {}
      }
    };

    // 4. Inserção explícita no schema 'admin'
    const { data, error } = await supabase
      .schema('admin')
      .from('entities')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar entidade:', error);
      throw new Error(`HZ-ENT_003: Falha ao criar a organização. Detalhe: ${error.message}`);
    }

    return data;
  },

  /**
   * Atualiza dados de governança e faturamento da entidade
   */
  async updateEntity(id: string, updates: Partial<Entity>): Promise<Entity> {
    const { data, error } = await supabase
      .schema('admin')
      .from('entities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Erro ao atualizar entidade ${id}:`, error);
      throw new Error(`HZ-ENT_004: Falha ao atualizar a organização. Detalhe: ${error.message}`);
    }

    return data as Entity;
  },

  /**
   * Upload de Mídia (Logo/Isologo) direto para o Bucket seguro com CDN
   */
  async uploadEntityMedia(entityId: string, file: File, type: 'logo' | 'isologo'): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const filePath = `${entityId}/${type}_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('entities_media')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error('Erro no upload de mídia:', uploadError);
      throw new Error('HZ-MED_001: Falha ao processar a imagem. Verifique o formato e tente novamente.');
    }

    const { data } = supabase.storage.from('entities_media').getPublicUrl(filePath);
    return data.publicUrl;
  },

  /**
   * Inicializa uma importação em massa (Mass Onboarding) para Instituições/Empresas
   */
  async startMassOnboardingJob(entityId: string, file: File): Promise<MassOnboardingJob> {
    // 1. Upload do CSV para um bucket privado de processamento temporal
    const filePath = `onboarding/${entityId}/${Date.now()}_users.csv`;
    const { error: uploadError } = await supabase.storage
      .from('admin_secure_files') // Requer criação deste bucket privado
      .upload(filePath, file);

    if (uploadError) {
      throw new Error('HZ-ONB_001: Falha ao enviar o arquivo para a fila de processamento.');
    }

    // 2. Regista o Job na Base de Dados (Schema Admin obrigatório)
    const { data, error: dbError } = await supabase
      .schema('admin')
      .from('mass_onboarding_jobs')
      .insert([{
        entity_id: entityId,
        status: 'pending',
        error_log: [],
      }])
      .select()
      .single();

    if (dbError) {
      throw new Error('HZ-ONB_002: Falha ao registrar a tarefa de importação.');
    }

    // 3. Opcional: Acionar webhook ou Edge Function para processar o CSV em background
    // await supabase.functions.invoke('process-mass-onboarding', { body: { job_id: data.id, file_path: filePath } });

    return data as MassOnboardingJob;
  }
};