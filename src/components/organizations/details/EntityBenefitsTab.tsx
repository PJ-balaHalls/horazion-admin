
import React from 'react';
import { HzSwitch } from '@/components/ui';

export function EntityBenefitsTab({ formData, setFormData }: { formData: any, setFormData: any }) {
  // Inicialização segura Zero Trust
  const benefits = formData?.metadata?.benefits_engine || {};

  const toggleBenefit = (key: string) => {
    setFormData({
      ...formData,
      metadata: { 
        ...formData.metadata, 
        benefits_engine: { ...benefits, [key]: !benefits[key] } 
      }
    });
  };

  // Mapeamento 1:1 do schema PostgreSQL (admin.entities -> metadata -> benefits_engine)
  const benefitClusters = [
    {
      group: "Governança, Identidade e Segurança",
      items: [
        { key: 'sso_saml', label: 'SSO (SAML)', desc: 'Permite login corporativo unificado.' },
        { key: 'api_access', label: 'Acesso à API', desc: 'Libera tokens para integração externa.' },
        { key: 'audit_logs', label: 'Logs de Auditoria', desc: 'Registo detalhado de acessos (Compliance).' },
        { key: 'custom_roles', label: 'Papéis Customizados', desc: 'Permite RBAC além dos papéis padrão.' },
        { key: 'brand_protection', label: 'Brand Protection', desc: 'Impede uso indevido do nome da entidade.' },
      ]
    },
    {
      group: "Gestão e Escala (Enterprise)",
      items: [
        { key: 'mass_onboarding', label: 'Mass Onboarding', desc: 'Importação de milhares de membros via CSV.' },
        { key: 'sub_communities', label: 'Sub-Comunidades', desc: 'Habilita ramificações dentro da organização.' },
        { key: 'premium_support', label: 'Suporte Premium', desc: 'SLA prioritário e atendimento dedicado.' },
        { key: 'early_access', label: 'Early Access', desc: 'Acesso antecipado a funcionalidades Beta.' },
        { key: 'broadcast_messaging', label: 'Broadcast Messaging', desc: 'Envio de mensagens globais para afiliados.' },
      ]
    },
    {
      group: "Mídia, Streaming e Conteúdo",
      items: [
        { key: 'custom_player', label: 'Player Customizado', desc: 'Player de vídeo com branding próprio.' },
        { key: 'live_streaming', label: 'Live Streaming', desc: 'Transmissão ao vivo via Infraestrutura Horazion.' },
        { key: 'high_res_uploads', label: 'Uploads 4K/RAW', desc: 'Libera envio de mídias pesadas sem compressão.' },
        { key: 'extended_storage', label: 'Storage Estendido', desc: 'Aumenta limites de retenção de dados.' },
        { key: 'ad_free_mode', label: 'Modo Ad-Free', desc: 'Remove interrupções da interface e do feed.' },
      ]
    },
    {
      group: "Inteligência de Dados e Analytics",
      items: [
        { key: 'custom_dashboards', label: 'Dashboards Customizados', desc: 'Criação de visuais analíticos próprios.' },
        { key: 'real_time_metrics', label: 'Métricas em Tempo Real', desc: 'Telemetria de engajamento sem latência.' },
        { key: 'advanced_analytics', label: 'Analytics Avançado', desc: 'Acesso ao Data Lake e machine learning.' },
        { key: 'export_data', label: 'Exportação de Dados (Dumps)', desc: 'Permite download massivo de métricas.' },
        { key: 'priority_search', label: 'Busca Prioritária', desc: 'Indexação acelerada no motor de busca.' },
      ]
    },
    {
      group: "Monetização e Operações Financeiras",
      items: [
        { key: 'revenue_share', label: 'Revenue Share', desc: 'Repasse financeiro sobre transações.' },
        { key: 'in_app_purchasing', label: 'In-App Purchasing', desc: 'Venda de produtos/acessos na plataforma.' },
        { key: 'sponsored_slots', label: 'Sponsored Slots', desc: 'Permite compra de destaque no ecossistema.' },
        { key: 'custom_pricing', label: 'Custom Pricing', desc: 'Tabela de preços exclusiva (Negociação direta).' },
        { key: 'tax_exemption', label: 'Isenção Fiscal', desc: 'Aplica regras fiscais especiais à entidade.' },
      ]
    },
    {
      group: "Interface, Customização e Moderação",
      items: [
        { key: 'verified_badge', label: 'Selo de Verificação', desc: 'Badge oficial de autenticidade (Checkmark).' },
        { key: 'official_profile_ui', label: 'UI Oficial de Perfil', desc: 'Layout VIP para a página da organização.' },
        { key: 'custom_deep_link', label: 'Deep Links Customizados', desc: 'URLs nativas encurtadas.' },
        { key: 'moderation_tools', label: 'Ferramentas de Moderação', desc: 'Delegação de superpoderes a gestores.' },
        { key: 'custom_webhook', label: 'Webhooks Customizados', desc: 'Integrações de eventos em tempo real.' },
      ]
    }
  ];

  return (
    <div className="space-y-10 animate-in fade-in pb-10">
      <div>
        <h2 className="text-xl font-black text-gray-900 tracking-tight">Motor de Benefícios</h2>
        <p className="text-sm text-gray-500 mt-1">
          O núcleo operacional da organização. Estas flags ditam o que o servidor autoriza (Zero Trust) a entidade a realizar dentro do Horazion Life e Workspace.
        </p>
      </div>

      <div className="space-y-10">
        {benefitClusters.map((cluster, idx) => (
          <section key={idx}>
            <h3 className="text-sm font-bold text-[#E50000] uppercase tracking-widest border-b border-gray-100 pb-2 mb-4">
              {cluster.group}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {cluster.items.map((benefit) => (
                <div 
                  key={benefit.key} 
                  className={`flex items-center justify-between p-4 border rounded-xl transition-colors ${
                    benefits[benefit.key] ? 'border-[#E50000] bg-red-50/10 shadow-sm' : 'border-gray-100 hover:bg-gray-50'
                  }`}
                >
                  <div className="pr-4">
                    <p className="font-bold text-gray-900 text-sm">{benefit.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{benefit.desc}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <HzSwitch 
                      checked={benefits[benefit.key] || false} 
                      onChange={() => toggleBenefit(benefit.key)} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}