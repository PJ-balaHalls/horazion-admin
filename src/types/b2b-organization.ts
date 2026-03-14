// CORE-HZ-007: Contratos Estritos do Ecossistema B2B (Organizações e Benefícios)

export type BenefitCategory = 'identity' | 'access' | 'content' | 'data' | 'community' | 'monetization';

export interface BenefitDefinition {
  id: keyof BenefitsEngineConfig;
  label: string;
  category: BenefitCategory;
  description: string;
  price: number; // Preço mensal em USD
}

export interface BenefitsEngineConfig {
  verified_badge?: boolean;
  custom_deep_link?: boolean;
  priority_search?: boolean;
  brand_protection?: boolean;
  official_profile_ui?: boolean;
  api_access?: boolean;
  premium_support?: boolean;
  sso_saml?: boolean;
  custom_webhook?: boolean;
  early_access?: boolean;
  high_res_uploads?: boolean;
  live_streaming?: boolean;
  extended_storage?: boolean;
  ad_free_mode?: boolean;
  custom_player?: boolean;
  advanced_analytics?: boolean;
  export_data?: boolean;
  custom_dashboards?: boolean;
  real_time_metrics?: boolean;
  audit_logs?: boolean;
  mass_onboarding?: boolean;
  custom_roles?: boolean;
  broadcast_messaging?: boolean;
  moderation_tools?: boolean;
  sub_communities?: boolean;
  revenue_share?: boolean;
  custom_pricing?: boolean;
  tax_exemption?: boolean;
  sponsored_slots?: boolean;
  in_app_purchasing?: boolean;
}

export interface EntityBranding {
  primary_color: string;
  icon_url: string | null;
  logo_url: string | null;
  deep_link_preview?: string | null;
}

export interface EntityStrategicData {
  sector: string | null;
  hierarchy_level: 'master' | 'subsidiary' | 'department' | 'campaign';
  website: string | null;
  business_objectives: string[];
  monitoring_kpis: string[];
}

export interface B2BEntityMetadata {
  horizon_id: string;
  branding: EntityBranding;
  strategic_data: EntityStrategicData;
  benefits_engine: {
    mode: 'bundle' | 'custom';
    active_bundles: string[];
    custom_features: string[];
    final_features: BenefitsEngineConfig;
    total_price: number;
    isCombo: boolean;
  };
  verification: {
    has_documents: boolean;
    registration_number: string;
  };
}

// ---------------------------------------------------------
// DOMÍNIOS ESTRUTURAIS (Listas Expandidas)
// ---------------------------------------------------------

export const SECTORS = [
  'Tecnologia da Informação', 'Educação & Ensino', 'Saúde & Bem-Estar', 'Finanças & Bancos', 
  'Varejo & E-commerce', 'Entretenimento & Mídia', 'Indústria & Manufatura', 'Energia & Utilities', 
  'Logística & Supply Chain', 'Agricultura & Agronegócio', 'Imobiliário & Construção', 'Turismo & Hospitalidade', 
  'Alimentação & Bebidas', 'Moda & Vestuário', 'Automotivo', 'Telecomunicações', 'Indústria Farmacêutica', 
  'Cosméticos & Beleza', 'Consultoria & Gestão', 'Serviços Jurídicos', 'Marketing & Publicidade', 
  'Segurança & Defesa', 'Terceiro Setor (ONGs)', 'Recursos Humanos', 'Biotecnologia'
];

export const OBJECTIVES = [
  'Expansão de Mercado', 'Redução de Custos', 'Inovação de Produto/Serviço', 
  'Retenção de Talentos', 'Transformação Digital', 'Internacionalização', 'Sustentabilidade (ESG)', 
  'Aquisição de Clientes', 'Fidelização de Clientes', 'Otimização Logística', 
  'Liderança de Mercado', 'Diversificação de Receita', 'Automação de Processos', 
  'Melhoria de Qualidade', 'Parcerias Estratégicas'
];

export const KPIS_DICT = [
  { id: 'gmv', label: 'Volume de Vendas (GMV)', desc: 'Mede o valor total bruto de transações financeiras na organização.' },
  { id: 'cac', label: 'Custo de Aquisição (CAC)', desc: 'Investimento médio necessário para conquistar um novo cliente ou usuário.' },
  { id: 'ltv', label: 'Lifetime Value (LTV)', desc: 'Lucro líquido projetado durante todo o ciclo de vida de um cliente.' },
  { id: 'nps', label: 'NPS (Satisfação)', desc: 'Métrica de lealdade e probabilidade de recomendação da marca.' },
  { id: 'churn', label: 'Taxa de Churn', desc: 'Índice de cancelamento ou abandono de usuários em um período.' },
  { id: 'roi', label: 'Retorno sobre Investimento', desc: 'Relação entre o lucro obtido e o capital investido em iniciativas.' },
  { id: 'mau', label: 'Usuários Ativos (MAU)', desc: 'Volume de usuários engajados mensalmente na plataforma.' },
  { id: 'ttm', label: 'Time to Market (TTM)', desc: 'Velocidade com que novos produtos ou features são lançados.' },
  { id: 'enps', label: 'Satisfação do Colaborador', desc: 'Mede a lealdade e satisfação dos funcionários com a empresa.' },
  { id: 'mrr', label: 'Receita Recorrente (MRR)', desc: 'Receita mensal previsível gerada por assinaturas ou contratos.' },
  { id: 'market_share', label: 'Market Share', desc: 'Fatia de mercado dominada pela organização frente aos concorrentes.' },
  { id: 'conversion_rate', label: 'Taxa de Conversão', desc: 'Percentual de usuários que realizam a ação desejada.' },
  { id: 'ebitda', label: 'Margem EBITDA', desc: 'Indicador de rentabilidade operacional da empresa.' },
  { id: 'esg_index', label: 'Índice de Sustentabilidade', desc: 'Métricas de impacto ambiental, social e de governança.' },
  { id: 'opex', label: 'Custo Operacional Total', desc: 'Despesas contínuas necessárias para manter a operação funcionando.' }
];

// ---------------------------------------------------------
// DICIONÁRIO DE BENEFÍCIOS B2B
// ---------------------------------------------------------
export const B2B_BENEFITS_DICTIONARY: BenefitDefinition[] = [
  { id: 'verified_badge', label: 'Selo Oficial', category: 'identity', description: 'Autenticidade da entidade.', price: 19 },
  { id: 'custom_deep_link', label: 'Deep Link Custom', category: 'identity', description: 'URLs limpas corporativas.', price: 9 },
  { id: 'priority_search', label: 'Busca Prioritária', category: 'identity', description: 'Destaque no algoritmo.', price: 29 },
  { id: 'brand_protection', label: 'Proteção de Marca', category: 'identity', description: 'Evita squatting.', price: 49 },
  { id: 'official_profile_ui', label: 'Perfil Oficial UI', category: 'identity', description: 'Layouts corporativos avançados.', price: 39 },
  
  { id: 'api_access', label: 'Acesso à API Core', category: 'access', description: 'Integrações REST/GraphQL.', price: 89 },
  { id: 'premium_support', label: 'Suporte Premium 24/7', category: 'access', description: 'SLA de 1 hora.', price: 149 },
  { id: 'sso_saml', label: 'SSO (SAML/OAuth)', category: 'access', description: 'Login centralizado.', price: 199 },
  { id: 'custom_webhook', label: 'Webhooks Custom', category: 'access', description: 'Eventos em tempo real.', price: 59 },
  { id: 'early_access', label: 'Early Access', category: 'access', description: 'Acesso a novas features.', price: 0 },
  
  { id: 'high_res_uploads', label: 'Uploads 4K', category: 'content', description: 'Vídeos 4K e Imagens RAW.', price: 29 },
  { id: 'live_streaming', label: 'Transmissão ao Vivo', category: 'content', description: 'Streams nativos Horazion.', price: 79 },
  { id: 'extended_storage', label: 'Storage Estendido', category: 'content', description: 'Quotas acima de 1TB.', price: 49 },
  { id: 'ad_free_mode', label: 'Livre de Anúncios', category: 'content', description: 'Experiência limpa.', price: 39 },
  { id: 'custom_player', label: 'Player Customizado', category: 'content', description: 'Injeção de identidade visual.', price: 59 },
  
  { id: 'advanced_analytics', label: 'Analytics Avançado', category: 'data', description: 'Métricas de conversão.', price: 129 },
  { id: 'export_data', label: 'Exportação S3', category: 'data', description: 'Dumps criptografados.', price: 99 },
  { id: 'custom_dashboards', label: 'Dashboards Custom', category: 'data', description: 'Visões de dados sob medida.', price: 89 },
  { id: 'real_time_metrics', label: 'Métricas em Tempo Real', category: 'data', description: 'Latência zero de dados.', price: 149 },
  { id: 'audit_logs', label: 'Logs de Auditoria', category: 'data', description: 'Rastreio inalterável.', price: 199 },
  
  { id: 'mass_onboarding', label: 'Mass Onboarding', category: 'community', description: 'Convites via CSV/API.', price: 49 },
  { id: 'custom_roles', label: 'Cargos Customizados', category: 'community', description: 'Organograma interno.', price: 39 },
  { id: 'broadcast_messaging', label: 'Broadcast', category: 'community', description: 'Push notifications globais.', price: 69 },
  { id: 'moderation_tools', label: 'Moderação Avançada', category: 'community', description: 'Gestão de conflitos.', price: 79 },
  { id: 'sub_communities', label: 'Sub-Comunidades', category: 'community', description: 'Clusters privados.', price: 89 },
  
  { id: 'revenue_share', label: 'Revenue Share', category: 'monetization', description: 'Repasse automático de lucros.', price: 0 },
  { id: 'custom_pricing', label: 'Precificação Custom', category: 'monetization', description: 'Estruturas Enterprise.', price: 299 },
  { id: 'tax_exemption', label: 'Isenção de Taxas', category: 'monetization', description: 'Regimes especiais.', price: 0 },
  { id: 'sponsored_slots', label: 'Espaços Patrocinados', category: 'monetization', description: 'Injeção orgânica nos feeds.', price: 399 },
  { id: 'in_app_purchasing', label: 'Compras In-App', category: 'monetization', description: 'Venda de produtos digitais.', price: 149 }
];