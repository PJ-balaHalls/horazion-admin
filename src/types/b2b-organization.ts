// CORE-HZ-007: Contratos Estritos do Ecossistema B2B (Organizações e Benefícios)

/**
 * Categorias semânticas do Motor de Benefícios
 */
export type BenefitCategory = 
  | 'identity' 
  | 'access' 
  | 'content' 
  | 'data' 
  | 'community' 
  | 'monetization';

/**
 * Definição estrutural de um benefício na interface
 */
export interface BenefitDefinition {
  id: keyof BenefitsEngineConfig;
  label: string;
  category: BenefitCategory;
  description: string;
}

/**
 * Zero Trust: Tipagem explícita de todos os 30 benefícios possíveis.
 * Isso garante que o TypeScript reclame se tentarmos acessar um benefício que não existe.
 */
export interface BenefitsEngineConfig {
  verified_badge: boolean;
  custom_deep_link: boolean;
  priority_search: boolean;
  brand_protection: boolean;
  official_profile_ui: boolean;
  api_access: boolean;
  premium_support: boolean;
  sso_saml: boolean;
  custom_webhook: boolean;
  early_access: boolean;
  high_res_uploads: boolean;
  live_streaming: boolean;
  extended_storage: boolean;
  ad_free_mode: boolean;
  custom_player: boolean;
  advanced_analytics: boolean;
  export_data: boolean;
  custom_dashboards: boolean;
  real_time_metrics: boolean;
  audit_logs: boolean;
  mass_onboarding: boolean;
  custom_roles: boolean;
  broadcast_messaging: boolean;
  moderation_tools: boolean;
  sub_communities: boolean;
  revenue_share: boolean;
  custom_pricing: boolean;
  tax_exemption: boolean;
  sponsored_slots: boolean;
  in_app_purchasing: boolean;
}

/**
 * Estrutura de Personalização e Branding
 */
export interface EntityBranding {
  primary_color: string;
  icon_url: string | null;
  logo_url: string | null;
  deep_link_preview?: string | null;
}

/**
 * Dados Estratégicos e Operacionais
 */
export interface EntityStrategicData {
  sector: string | null;
  hierarchy_level: 'master' | 'subsidiary' | 'department' | 'campaign';
  website: string | null;
  headquarters_location: string | null;
}

/**
 * Contrato Master do JSONB 'metadata' no Supabase
 */
export interface B2BEntityMetadata {
  branding: EntityBranding;
  strategic_data: EntityStrategicData;
  benefits_engine: BenefitsEngineConfig;
}

/**
 * Dicionário Mestre de Benefícios (Usado para renderizar o Wizard e a Gestão de Entidades)
 */
export const B2B_BENEFITS_DICTIONARY: BenefitDefinition[] = [
  // Identity
  { id: 'verified_badge', label: 'Selo Oficial de Verificação', category: 'identity', description: 'Garante autenticidade da entidade no ecossistema.' },
  { id: 'custom_deep_link', label: 'Deep Link Personalizado', category: 'identity', description: 'URLs limpas (ex: horazion.life/sua-empresa).' },
  { id: 'priority_search', label: 'Busca Prioritária', category: 'identity', description: 'Destaque no algoritmo de busca do Universo.' },
  { id: 'brand_protection', label: 'Proteção de Marca', category: 'identity', description: 'Evita squatting e nomes similares.' },
  { id: 'official_profile_ui', label: 'UI de Perfil Oficial', category: 'identity', description: 'Acesso a blocos e layouts corporativos avançados.' },
  
  // Access
  { id: 'api_access', label: 'Acesso à API Core', category: 'access', description: 'Integrações sistêmicas via REST/GraphQL.' },
  { id: 'premium_support', label: 'Suporte Premium 24/7', category: 'access', description: 'Canal de atendimento com SLA de 1 hora.' },
  { id: 'sso_saml', label: 'SSO (SAML/OAuth)', category: 'access', description: 'Login centralizado para os funcionários.' },
  { id: 'custom_webhook', label: 'Webhooks Personalizados', category: 'access', description: 'Eventos em tempo real disparados para servidores da empresa.' },
  { id: 'early_access', label: 'Early Access a Universos', category: 'access', description: 'Acesso antecipado a novas funcionalidades do Horazion.' },
  
  // Content
  { id: 'high_res_uploads', label: 'Uploads em Alta Resolução', category: 'content', description: 'Suporte a vídeos em 4K e Imagens RAW.' },
  { id: 'live_streaming', label: 'Transmissão ao Vivo', category: 'content', description: 'Capacidade de transmitir streams nativos.' },
  { id: 'extended_storage', label: 'Armazenamento Estendido', category: 'content', description: 'Quotas de armazenamento acima de 1TB.' },
  { id: 'ad_free_mode', label: 'Modo Livre de Anúncios', category: 'content', description: 'Experiência limpa para membros da organização.' },
  { id: 'custom_player', label: 'Player de Vídeo Customizado', category: 'content', description: 'Injeção de identidade visual da marca no player.' },
  
  // Data
  { id: 'advanced_analytics', label: 'Analytics Avançado', category: 'data', description: 'Métricas aprofundadas de retenção e conversão de blocos.' },
  { id: 'export_data', label: 'Exportação de Dados RAW', category: 'data', description: 'Acesso a dumps criptografados semanais via S3.' },
  { id: 'custom_dashboards', label: 'Dashboards Customizados', category: 'data', description: 'Criação de visões de dados sob medida.' },
  { id: 'real_time_metrics', label: 'Métricas em Tempo Real', category: 'data', description: 'Latência zero na visualização de dados operacionais.' },
  { id: 'audit_logs', label: 'Logs de Auditoria B2B', category: 'data', description: 'Rastreio inalterável de todas as ações de usuários ligados à entidade.' },
  
  // Community
  { id: 'mass_onboarding', label: 'Onboarding em Massa', category: 'community', description: 'Capacidade de convidar milhares de usuários via CSV/API.' },
  { id: 'custom_roles', label: 'Cargos Customizados', category: 'community', description: 'Mapeamento de organograma interno no sistema de afiliações.' },
  { id: 'broadcast_messaging', label: 'Mensagens em Massa', category: 'community', description: 'Push notifications globais para todos os membros.' },
  { id: 'moderation_tools', label: 'Ferramentas de Moderação', category: 'community', description: 'Acesso a painéis de ban, mute e gestão de conflitos.' },
  { id: 'sub_communities', label: 'Sub-Comunidades', category: 'community', description: 'Criação de clusters privados dentro da organização.' },
  
  // Monetization
  { id: 'revenue_share', label: 'Revenue Share Integrado', category: 'monetization', description: 'Repasse automático de lucros para criadores afiliados.' },
  { id: 'custom_pricing', label: 'Precificação Customizada', category: 'monetization', description: 'Estruturas de pagamento negociadas (Enterprise/Bespoke).' },
  { id: 'tax_exemption', label: 'Isenção de Taxas', category: 'monetization', description: 'Regimes especiais para ONGs e Instituições Educacionais.' },
  { id: 'sponsored_slots', label: 'Espaços Patrocinados', category: 'monetization', description: 'Direito a injeção de blocos orgânicos nos feeds relacionados.' },
  { id: 'in_app_purchasing', label: 'Compras In-App Ativas', category: 'monetization', description: 'Capacidade de comercializar produtos/serviços digitais via plataforma.' }
];