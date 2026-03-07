export type StellarRole = 'sirius' | 'rigel' | 'betelgeuse' | 'altair' | 'polaris' | 'user';

export interface Profile {
  id: string;
  horizion_id: string;
  full_name: string;
  role: StellarRole;
  status: 'active' | 'blocked' | 'pending';
  location_city?: string;
  location_country?: string;
  zip_code?: string;
  created_at: string;
  custom_permissions: string[];
}

export const SYSTEM_PERMISSIONS = [
  // Core (5)
  { id: 'p_core_login', label: 'Acesso ao Ecossistema', cat: 'Core', min: 'user' },
  { id: 'p_core_edit', label: 'Editar Dados Próprios', cat: 'Core', min: 'user' },
  { id: 'p_core_hzid', label: 'Alterar HorizionID', cat: 'Core', min: 'betelgeuse' },
  { id: 'p_core_delete', label: 'Autodeleção de Conta', cat: 'Core', min: 'user' },
  { id: 'p_core_logs', label: 'Visualizar Logs Pessoais', cat: 'Core', min: 'user' },
  // Content (7)
  { id: 'p_cnt_post', label: 'Criar Blocos Vivos', cat: 'Content', min: 'user' },
  { id: 'p_cnt_mod', label: 'Moderar Blocos Alheios', cat: 'Content', min: 'altair' },
  { id: 'p_cnt_univ', label: 'Gerir Universos', cat: 'Content', min: 'rigel' },
  { id: 'p_cnt_pin', label: 'Fixar Blocos Globais', cat: 'Content', min: 'rigel' },
  { id: 'p_cnt_ads', label: 'Criar Campanhas Ads', cat: 'Content', min: 'betelgeuse' },
  { id: 'p_cnt_media', label: 'Upload de Mídia 4K', cat: 'Content', min: 'user' },
  { id: 'p_cnt_verify', label: 'Selo de Verificação', cat: 'Content', min: 'altair' },
  // Social (6)
  { id: 'p_soc_msg', label: 'Mensagens Diretas', cat: 'Social', min: 'user' },
  { id: 'p_soc_call', label: 'Chamadas de Vídeo', cat: 'Social', min: 'user' },
  { id: 'p_soc_group', label: 'Criar Grupos/Constelações', cat: 'Social', min: 'user' },
  { id: 'p_soc_follow', label: 'Seguir Identidades', cat: 'Social', min: 'user' },
  { id: 'p_soc_hide', label: 'Modo Invisível', cat: 'Social', min: 'polaris' },
  { id: 'p_soc_metric', label: 'Ver Métricas Sociais', cat: 'Social', min: 'user' },
  // Admin & Finance (12)
  { id: 'p_adm_user_edit', label: 'Editar Outros Usuários', cat: 'Admin', min: 'rigel' },
  { id: 'p_adm_user_block', label: 'Bloquear Identidades', cat: 'Admin', min: 'altair' },
  { id: 'p_adm_user_del', label: 'Apagar Contas Externas', cat: 'Admin', min: 'sirius' },
  { id: 'p_adm_role', label: 'Alterar Níveis Estelares', cat: 'Admin', min: 'sirius' },
  { id: 'p_adm_geo', label: 'Rastreio Geográfico', cat: 'Admin', min: 'polaris' },
  { id: 'p_adm_support', label: 'Responder Tickets SOS', cat: 'Admin', min: 'altair' },
  { id: 'p_fin_view', label: 'Auditoria Financeira', cat: 'Admin', min: 'betelgeuse' },
  { id: 'p_fin_refund', label: 'Processar Reembolsos', cat: 'Admin', min: 'betelgeuse' },
  { id: 'p_sys_config', label: 'Configurações de Sistema', cat: 'Admin', min: 'sirius' },
  { id: 'p_sys_logs', label: 'Ver Logs de Servidor', cat: 'Admin', min: 'polaris' },
  { id: 'p_sys_flags', label: 'Gerir Feature Flags', cat: 'Admin', min: 'rigel' },
  { id: 'p_sys_db', label: 'Acesso Direto ao Banco', cat: 'Admin', min: 'sirius' },
];