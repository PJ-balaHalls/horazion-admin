'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { HzButton, HzSkeleton, HzInput } from '@/components/ui';
import { 
  BuildingOfficeIcon, TrashIcon, LinkIcon, MagnifyingGlassIcon, 
  ShieldCheckIcon, BriefcaseIcon, CheckCircleIcon, IdentificationIcon, 
  DocumentTextIcon, CalendarIcon, LifebuoyIcon, PrinterIcon, DocumentDuplicateIcon,
  GiftIcon, ShareIcon, EnvelopeIcon, GlobeAltIcon
} from '@heroicons/react/24/outline';

interface UserAffiliationsTabProps { userId?: string; }

// [ARCH-HZ] Dicionário Global de Erros para rastreabilidade Zero Trust
const ERROR_CODES = {
  FETCH: { code: 'HZ-AFF_001', msg: 'Falha ao carregar matriz de afiliações.' },
  INSERT: { code: 'HZ-AFF_002', msg: 'Não foi possível injetar o vínculo corporativo.' },
  REVOKE: { code: 'HZ-AFF_003', msg: 'Falha ao revogar vínculo corporativo.' },
  CONTEXT: { code: 'HZ-AFF_004', msg: 'Identidade de utilizador não detetada na interface nem na URL.' }
};

interface AffiliationSuccessData {
  orgName: string;
  orgLogo: string;
  orgSlug: string;
  orgColor: string;
  orgCnpj: string;
  jobTitle: string;
  department: string;
  scope: string;
  purpose: string;
  expiresAt: string;
  timestamp: string;
  benefits: any[];
  strategy: any;
}

const safeFormatDate = (dateString: any) => {
  if (!dateString) return 'Acesso Vitalício';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'Data Inválida';
    return d.toLocaleDateString('pt-PT');
  } catch {
    return 'Data Inválida';
  }
};

const isDateExpired = (dateString: any) => {
  if (!dateString) return false;
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return false;
    return d < new Date();
  } catch {
    return false;
  }
};

export function UserAffiliationsTab({ userId: propUserId }: UserAffiliationsTabProps) {
  const params = useParams();
  const resolvedUserId = propUserId || (params?.id as string);

  // Estados Base
  const [affiliations, setAffiliations] = useState<any[]>([]);
  const [availableOrgs, setAvailableOrgs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionError, setActionError] = useState<{ title: string, msg: string, detail?: string } | null>(null);

  // Estados do Wizard B2B
  const [isAdding, setIsAdding] = useState(false);
  const [selectedEntityId, setSelectedEntityId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Campos Estruturados do Contrato
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [scope, setScope] = useState('');
  const [purpose, setPurpose] = useState('');
  const [expirationDate, setExpirationDate] = useState('');

  // Estado do Contrato de Aceite
  const [showContractPreview, setShowContractPreview] = useState(false);
  const [hasAcceptedContract, setHasAcceptedContract] = useState(false);

  // Estado de Sucesso & Exportação
  const [successData, setSuccessData] = useState<AffiliationSuccessData | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');

  // [CORE-HZ] Ciclo de Vida e Busca de Dados
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setActionError(null);

    if (!resolvedUserId) {
      setActionError({ 
        title: ERROR_CODES.CONTEXT.code, 
        msg: ERROR_CODES.CONTEXT.msg, 
        detail: 'O componente pai não enviou o ID e a URL não contém um parâmetro válido.' 
      });
      setIsLoading(false);
      return;
    }

    try {
      const { data: affData, error: affError } = await supabase
        .from('affiliations')
        .select('id, entity_id, affiliation_role, status, expires_at, association_data')
        .eq('profile_id', resolvedUserId);

      if (affError) throw new Error(affError.message || 'Falha de leitura na tabela de afiliações.');

      // Leitura da tabela entities (sem cnpj na raiz, pois ele vive em metadata/billing_info na modelagem híbrida)
      const { data: orgsData, error: orgsError } = await supabase
        .from('entities')
        .select('id, slug, display_name, logo_url, is_verified, website, metadata, status')
        .order('created_at', { ascending: false });

      if (orgsError) throw new Error(orgsError.message || 'Falha de leitura na tabela de entidades.');

      const safeOrgsData = Array.isArray(orgsData) ? orgsData : [];
      setAvailableOrgs(safeOrgsData);

      const safeAffData = Array.isArray(affData) ? affData : [];
      const hydratedAffiliations = safeAffData.map(aff => {
        const org = safeOrgsData.find(o => o.id === aff.entity_id);
        return { ...aff, entities: org };
      });

      setAffiliations(hydratedAffiliations);

    } catch (error: any) {
      const errorDetail = error?.message || error?.details || JSON.stringify(error);
      setActionError({ title: ERROR_CODES.FETCH.code, msg: ERROR_CODES.FETCH.msg, detail: errorDetail });
    } finally {
      setIsLoading(false);
    }
  }, [resolvedUserId]);

  useEffect(() => { loadData(); }, [loadData]);

  const selectedEntityData = useMemo(() => 
    availableOrgs.find(o => o.id === selectedEntityId), 
  [selectedEntityId, availableOrgs]);

  const primaryColor = selectedEntityData?.metadata?.branding?.primary_color || '#000000';

  // [CORE-HZ] Expansão e Enriquecimento das Listas Dinâmicas (Fallbacks Inteligentes de Alto Nível)
  const availableRoles = selectedEntityData?.metadata?.roles || [
    'Diretor Executivo (CEO / Founder)', 'Diretor de Operações (COO)', 'Diretor de Produto (CPO)', 
    'Gerente de Engenharia', 'Arquiteto de Soluções Cloud', 'Engenheiro de Software Sênior', 
    'Especialista em Segurança (InfoSec)', 'Analista de Dados Estratégicos', 
    'Líder de Marketing e Growth', 'Designer de Produto (UI/UX)', 
    'Consultor Estratégico Externo', 'Agente Associado Institucional', 'Embaixador da Marca / Influenciador'
  ];

  const availableDepartments = selectedEntityData?.metadata?.departments?.map((d: any) => d.name) || [
    'Conselho Administrativo (Board)', 'Estratégia e Governança', 'Engenharia e Tecnologia Core', 
    'Produto e Experiência do Usuário (UI/UX)', 'Segurança da Informação e LGPD', 
    'Marketing, Growth e Comunicação', 'Operações e Logística', 
    'Recursos Humanos e Cultura', 'Financeiro, Billing e Compliance', 'Suporte e Sucesso do Cliente'
  ];

  const availableScopes = selectedEntityData?.metadata?.scopes || [
    'Acesso Root (Governança Total e Destrutiva)', 'Administrador de Hub (Leitura e Escrita Global)', 
    'Membro Especialista (Escrita Restrita ao Setor)', 'Auditor de Compliance (Leitura Global Irrestrita)', 
    'Colaborador Padrão (Acesso ao Workspace Base)', 'Acesso Temporário (Projetos e Campanhas)', 
    'Acesso Externo B2B (Vendor / Parceiro Limitado)'
  ];

  const availablePurposes = selectedEntityData?.metadata?.purposes || [
    'Gestão Estratégica e Liderança de Operações', 'Desenvolvimento, Evolução e Manutenção do Core', 
    'Expansão Comercial e Parcerias B2B', 'Auditoria Externa, Segurança e Compliance Legal', 
    'Campanhas de Marketing e Influência Digital', 'Atendimento Operacional e Resolução de Disputas',
    'Pesquisa, Desenvolvimento e Inovação (P&D)'
  ];

  // Extração de Estratégia e Benefícios da Organização
  const orgStrategy = selectedEntityData?.metadata?.strategy || {
    mission: "Elevar o potencial humano e produtivo através de infraestrutura digital integrada e de alta performance.",
    vision: "Tornar-se o ecossistema digital mais confiável, escalável e seguro para a organização da vida digital corporativa e pessoal.",
    values: ["Transparência Radical", "Zero Trust Security", "Minimalismo Funcional", "Foco no Utilizador"]
  };

  const orgBenefits = selectedEntityData?.metadata?.defined_benefits || selectedEntityData?.metadata?.benefits_engine?.list || [
    { id: 'b1', label: 'Single Sign-On (SSO)', desc: 'Autenticação fluida e centralizada através do HorizionID.' },
    { id: 'b2', label: 'Acesso Global ao Workspace', desc: 'Permissão corporativa aos painéis de gestão e colaboração.' },
    { id: 'b3', label: 'Licença Enterprise Activa', desc: 'Utilização irrestrita das ferramentas da suite Horazion no escopo da empresa.' },
    { id: 'b4', label: 'Auditoria e Compliance', desc: 'Rastreamento de logs de atividade resguardados pela governança LGPD.' }
  ];

  const filteredAffiliations = useMemo(() => {
    return affiliations.filter(aff => {
      const term = (searchTerm || '').toLowerCase();
      const displayName = (aff.entities?.display_name || '').toLowerCase();
      const slugName = (aff.entities?.slug || '').toLowerCase();
      return displayName.includes(term) || slugName.includes(term);
    });
  }, [affiliations, searchTerm]);

  // [CORE-HZ] Injeção e Geração do Certificado
  const handleAddAffiliation = async () => {
    if (!hasAcceptedContract) {
      alert("É obrigatório assinar o contrato institucional digitalmente.");
      return;
    }
    if (!selectedEntityId || !resolvedUserId) return;
    
    setIsSaving(true); 
    setActionError(null);

    const payload = {
      profile_id: resolvedUserId,
      entity_id: selectedEntityId,
      affiliation_role: 'member',
      status: 'active',
      expires_at: expirationDate ? new Date(expirationDate).toISOString() : null,
      association_data: { 
        job_title: jobTitle || availableRoles[0],
        department: department || availableDepartments[0],
        scope: scope || availableScopes[0],
        purpose: purpose || availablePurposes[0]
      }
    };

    const { error } = await supabase.from('affiliations').insert([payload]);

    if (error) {
      console.error('[CORE-HZ] Falha na injeção Supabase:', error);
      setActionError({ title: ERROR_CODES.INSERT.code, msg: ERROR_CODES.INSERT.msg, detail: error.message });
      setIsSaving(false);
    } else {
      setSuccessData({
        orgName: selectedEntityData.display_name,
        orgLogo: selectedEntityData.logo_url,
        orgSlug: selectedEntityData.slug,
        orgColor: primaryColor,
        orgCnpj: selectedEntityData.metadata?.cnpj || selectedEntityData.billing_info?.tax_id || 'Não Informado / Operação Global',
        jobTitle: payload.association_data.job_title,
        department: payload.association_data.department,
        scope: payload.association_data.scope,
        purpose: payload.association_data.purpose,
        expiresAt: payload.expires_at || 'Acesso Vitalício',
        timestamp: new Date().toISOString(),
        benefits: orgBenefits,
        strategy: orgStrategy
      });
      setIsSaving(false);
      setShowContractPreview(false);
      setHasAcceptedContract(false);
    }
  };

  const handleFinishSuccess = async () => {
    setSuccessData(null);
    setIsCopied(false);
    setIsAdding(false);
    setSelectedEntityId('');
    setJobTitle('');
    setDepartment('');
    setScope('');
    setPurpose('');
    setExpirationDate('');
    await loadData();
  };

  const handleRevoke = async (id: string, orgName: string) => {
    if (!confirm(`Revogar de forma irreversível o acesso desta conta ao Hub ${orgName || 'Desconhecido'}?`)) return;
    setIsLoading(true);
    const { error } = await supabase.from('affiliations').delete().eq('id', id);
    if (error) {
      setActionError({ title: ERROR_CODES.REVOKE.code, msg: ERROR_CODES.REVOKE.msg, detail: error.message });
      setIsLoading(false);
    } else {
      await loadData();
    }
  };

  // [FE-HZ] Motores de Exportação e Compartilhamento
  const handlePrintPDF = () => window.print();

  const handleWhatsAppShare = () => {
    if(!successData) return;
    const text = encodeURIComponent(`*CERTIFICADO DE AFILIAÇÃO B2B*\n\nOlá! Meu vínculo na *${successData.orgName}* foi homologado com sucesso.\n\n*Cargo:* ${successData.jobTitle}\n*Departamento:* ${successData.department}\n*Escopo Sistêmico:* ${successData.scope}\n\n_Validado e emitido pelo motor criptográfico Horazion Life._`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleEmailShare = () => {
    if(!successData) return;
    const subject = encodeURIComponent(`[Horazion] Certificado de Provisionamento B2B - ${successData.orgName}`);
    const body = encodeURIComponent(`Segue a confirmação oficial de afiliação estrutural:\n\nORGANIZAÇÃO: ${successData.orgName} (@${successData.orgSlug})\nCNPJ/TAX ID: ${successData.orgCnpj}\n\nCARGO ATRIBUÍDO: ${successData.jobTitle}\nDEPARTAMENTO: ${successData.department}\nESCOPO DE ACESSO: ${successData.scope}\nPROPÓSITO DO VÍNCULO: ${successData.purpose}\n\nEste documento atesta os privilégios e governança atribuídos à sua identidade digital.\n\nEquipe Horazion Group.`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleCopyText = async () => {
    if (!successData) return;
    const textToCopy = `
=====================================================
CERTIFICADO DE PROVISIONAMENTO HORIZION
Data da Emissão: ${new Date(successData.timestamp).toLocaleString('pt-PT')}
Identidade Validadora: Motor Zero Trust (Horazion Core)
=====================================================

[ DADOS INSTITUCIONAIS ]
- Contratante: ${successData.orgName} (@${successData.orgSlug})
- Registro Fiscal: ${successData.orgCnpj}

[ ESTRATÉGIA CORPORATIVA (ALINHAMENTO) ]
- Missão: ${successData.strategy.mission}
- Valores: ${successData.strategy.values.join(' | ')}

[ PARÂMETROS ESTRUTURAIS DO CONTRATO ]
- Cargo Atribuído: ${successData.jobTitle}
- Setor / Organograma: ${successData.department}
- Escopo de Acesso Atribuído: ${successData.scope}
- Propósito Oficial do Vínculo: ${successData.purpose}
- Validade do Acesso Sistêmico: ${safeFormatDate(successData.expiresAt)}

[ MOTOR DE BENEFÍCIOS ATIVOS ]
${successData.benefits.map(b => `> ${b.label || b.id}: ${b.desc || 'Benefício padronizado provisionado.'}`).join('\n')}

=====================================================
    `.trim();
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    } catch (err) {
      alert("Falha ao copiar texto.");
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
        <HzSkeleton className="h-64 w-full rounded-[12px]" />
        <HzSkeleton className="h-64 w-full rounded-[12px]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in pb-10">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #printable-certificate, #printable-certificate * { visibility: visible; }
          #printable-certificate { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; border: none !important; margin: 0; padding: 0; }
          .no-print { display: none !important; }
        }
      `}} />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#F2F2F2] pb-6 no-print">
        <div>
          <h3 className="text-3xl font-bold text-black tracking-tighter">Grafo de Conexões B2B</h3>
          <p className="text-sm font-medium text-[#A0A0A0] uppercase tracking-widest mt-2">Provisionamento de Contratos e Identidades Corporativas.</p>
        </div>
        {!isAdding && !successData && (
          <HzButton onClick={() => setIsAdding(true)} disabled={!resolvedUserId} className="bg-black text-white hover:bg-[#1A1A1A] px-6 py-3 rounded-[8px] text-[10px] font-black uppercase tracking-widest shadow-sm transition-all disabled:opacity-50">
            <span className="flex items-center gap-2.5"><LinkIcon className="w-4 h-4" /> Novo Contrato Institucional</span>
          </HzButton>
        )}
      </div>

      {actionError && (
         <div className="p-4 border-l-4 border-[#B6192E] bg-[#B6192E]/5 flex justify-between items-start rounded-r-[8px] no-print">
         <div className="flex gap-3 items-start">
           <CheckCircleIcon className="w-5 h-5 text-[#B6192E] shrink-0 mt-0.5" />
           <div>
             <h4 className="text-xs font-black text-[#B6192E] uppercase tracking-widest">{actionError.title}</h4>
             <p className="text-sm font-medium text-[#B6192E]/90 mt-1">{actionError.msg}</p>
             {actionError.detail && <p className="text-[10px] font-mono mt-2 text-[#B6192E]/70 break-all">{actionError.detail}</p>}
           </div>
         </div>
         <button onClick={() => setActionError(null)} className="text-[#B6192E] text-[10px] font-bold uppercase hover:bg-[#B6192E]/10 px-3 py-1.5 rounded transition-colors">Fechar</button>
       </div>
      )}

      {/* TEMPLATE MESSAGE: CERTIFICADO DE PROVISIONAMENTO EXPORTÁVEL (Full Width) */}
      {successData && (
        <div id="printable-certificate" className="bg-white border border-[#E5E5E5] rounded-[16px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 max-w-5xl mx-auto relative mb-10">
          <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: successData.orgColor }}></div>
          
          <div className="p-10 md:p-14">
            
            {/* Header do Documento */}
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between border-b border-[#F2F2F2] pb-8 mb-8">
              <div className="flex items-center gap-6 mb-6 md:mb-0">
                <div className="w-20 h-20 rounded-[12px] bg-[#FAFAFA] border border-[#E5E5E5] flex items-center justify-center shadow-sm overflow-hidden shrink-0">
                  {successData.orgLogo ? <img src={successData.orgLogo} className="w-full h-full object-cover" alt="Logo" /> : <BuildingOfficeIcon className="w-10 h-10 text-[#A0A0A0]" />}
                </div>
                <div>
                  <h2 className="text-3xl font-black text-black tracking-tight">{successData.orgName}</h2>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs font-mono font-bold text-[#A0A0A0] uppercase tracking-widest bg-[#FAFAFA] border border-[#E5E5E5] px-2 py-0.5 rounded">@{successData.orgSlug}</span>
                    <span className="text-[10px] font-mono text-[#A0A0A0] uppercase font-bold tracking-widest">CNPJ/TAX ID: {successData.orgCnpj}</span>
                  </div>
                </div>
              </div>
              <div className="text-center md:text-right">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-green-50 border border-green-200 text-green-700 text-[10px] font-black uppercase tracking-widest mb-2 shadow-sm">
                  <CheckCircleIcon className="w-4 h-4"/> Vínculo Institucional Ativo
                </div>
                <p className="text-[10px] font-mono text-[#A0A0A0] uppercase font-bold tracking-widest">Data de Emissão: {new Date(successData.timestamp).toLocaleString('pt-PT')}</p>
              </div>
            </div>

            {/* Secção de Estratégia e Marca */}
            <div className="mb-10 bg-[#FAFAFA] border border-[#E5E5E5] rounded-[12px] p-6 shadow-inner">
               <h3 className="text-[10px] font-black text-[#A0A0A0] uppercase tracking-widest mb-4 flex items-center gap-2">
                 <GlobeAltIcon className="w-4 h-4"/> Estratégia Institucional e Alinhamento
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <span className="block text-[9px] font-bold text-[#A0A0A0] uppercase tracking-widest mb-1">A Nossa Missão</span>
                    <p className="text-xs font-medium text-black leading-relaxed italic border-l-2 border-black pl-3">{successData.strategy.mission}</p>
                 </div>
                 <div>
                    <span className="block text-[9px] font-bold text-[#A0A0A0] uppercase tracking-widest mb-2">Valores Corporativos (Core)</span>
                    <div className="flex flex-wrap gap-2">
                      {successData.strategy.values.map((v: string, i: number) => (
                         <span key={i} className="text-[9px] font-black uppercase tracking-widest text-black bg-white border border-[#E5E5E5] px-2.5 py-1 rounded shadow-sm">{v}</span>
                      ))}
                    </div>
                 </div>
               </div>
            </div>

            {/* Corpo do Documento: Contrato e Benefícios */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
              
              {/* Bloco 1: Parâmetros do SLA Estrutural */}
              <div>
                <h3 className="text-[10px] font-black text-[#A0A0A0] uppercase tracking-widest mb-4 flex items-center gap-2">
                  <DocumentTextIcon className="w-4 h-4"/> Parâmetros do SLA Contratual
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start justify-between border-b border-[#F2F2F2] pb-3">
                    <span className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-wider">Cargo Funcional</span>
                    <strong className="text-xs font-black text-black text-right max-w-[200px]">{successData.jobTitle}</strong>
                  </li>
                  <li className="flex items-start justify-between border-b border-[#F2F2F2] pb-3">
                    <span className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-wider">Departamento Base</span>
                    <strong className="text-xs font-black text-black text-right max-w-[200px]">{successData.department}</strong>
                  </li>
                  <li className="flex items-start justify-between border-b border-[#F2F2F2] pb-3">
                    <span className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-wider">Escopo de Acesso Atribuído</span>
                    <strong className="text-[11px] font-bold text-black text-right max-w-[220px] leading-snug">{successData.scope}</strong>
                  </li>
                  <li className="flex items-start justify-between border-b border-[#F2F2F2] pb-3">
                    <span className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-wider">Propósito do Vínculo</span>
                    <strong className="text-[11px] font-bold text-black text-right max-w-[220px] leading-snug">{successData.purpose}</strong>
                  </li>
                  <li className="flex items-start justify-between pb-1">
                    <span className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-wider">Validade Sistêmica</span>
                    <strong className={`text-[11px] font-black uppercase tracking-widest ${successData.expiresAt === 'Acesso Vitalício' ? 'text-green-600' : 'text-black'}`}>{safeFormatDate(successData.expiresAt)}</strong>
                  </li>
                </ul>
              </div>

              {/* Bloco 2: Motor de Benefícios Ativos */}
              <div>
                <h3 className="text-[10px] font-black text-[#A0A0A0] uppercase tracking-widest mb-4 flex items-center gap-2">
                  <GiftIcon className="w-4 h-4"/> Benefícios Corporativos Provisionados
                </h3>
                <ul className="space-y-4 border border-[#E5E5E5] rounded-[12px] p-5 bg-white shadow-sm">
                  {successData.benefits.map((b: any, i: number) => (
                    <li key={i} className="flex gap-4 items-start">
                      <div className="mt-0.5 shrink-0 w-5 h-5 bg-[#FAFAFA] border border-[#E5E5E5] rounded flex items-center justify-center">
                         <CheckCircleIcon className="w-3.5 h-3.5 text-black" />
                      </div>
                      <div>
                        <strong className="block text-[10px] font-black text-black uppercase tracking-widest">{b.label || b.id}</strong>
                        <span className="block text-[11px] font-medium text-[#A0A0A0] mt-1.5 leading-snug">{b.desc || 'Concessão validada pelo motor estrutural e governança LGPD.'}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Ações (Não aparecem na impressão) */}
            <div className="mt-10 pt-6 border-t border-[#F2F2F2] flex flex-col md:flex-row justify-between items-center gap-4 no-print">
              <div className="flex flex-wrap gap-3 w-full md:w-auto">
                <HzButton onClick={handlePrintPDF} variant="ghost" className="flex-1 md:flex-none flex items-center justify-center gap-2 text-[10px] font-black text-black uppercase tracking-widest border border-[#E5E5E5] hover:bg-[#FAFAFA] px-5 py-3 rounded-[8px] transition-all">
                  <PrinterIcon className="w-4 h-4" /> Exportar PDF
                </HzButton>
                <HzButton onClick={handleCopyText} variant="ghost" className="flex-1 md:flex-none flex items-center justify-center gap-2 text-[10px] font-black text-black uppercase tracking-widest border border-[#E5E5E5] hover:bg-[#FAFAFA] px-5 py-3 rounded-[8px] transition-all">
                  {isCopied ? <CheckCircleIcon className="w-4 h-4 text-green-600" /> : <DocumentDuplicateIcon className="w-4 h-4" />} Copiar Dados
                </HzButton>
                <HzButton onClick={handleWhatsAppShare} variant="ghost" className="flex-1 md:flex-none flex items-center justify-center gap-2 text-[10px] font-black text-[#25D366] border-[#25D366]/30 uppercase tracking-widest border hover:bg-[#25D366]/10 px-5 py-3 rounded-[8px] transition-all">
                  <ShareIcon className="w-4 h-4" /> Compartilhar WhatsApp
                </HzButton>
                <HzButton onClick={handleEmailShare} variant="ghost" className="flex-1 md:flex-none flex items-center justify-center gap-2 text-[10px] font-black text-blue-600 border-blue-600/30 uppercase tracking-widest border hover:bg-blue-50 px-5 py-3 rounded-[8px] transition-all">
                  <EnvelopeIcon className="w-4 h-4" /> Enviar por E-mail
                </HzButton>
              </div>
              <HzButton onClick={handleFinishSuccess} className="w-full md:w-auto bg-black text-white px-10 py-3 rounded-[8px] text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-[#1A1A1A] transition-all">
                Concluir Provisionamento
              </HzButton>
            </div>
          </div>
        </div>
      )}

      {/* FORMULÁRIO WIZARD (Deep B2B Form) */}
      {isAdding && !successData && (
        <div className="bg-white border border-black rounded-[16px] shadow-xl overflow-hidden flex flex-col lg:flex-row relative no-print">
          <div className="absolute top-0 left-0 w-1 h-full bg-black z-10"></div>
          
          <div className="w-full lg:w-[35%] bg-[#FAFAFA] p-8 overflow-y-auto custom-scrollbar border-r border-[#E5E5E5] max-h-[800px]">
            <div className="mb-8">
              <h4 className="text-sm font-black text-black uppercase tracking-widest mb-4">1. Hub Institucional</h4>
              <p className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest mb-4">Selecione a entidade B2B validada para a assinatura.</p>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A0A0A0]" />
                <input type="text" placeholder="Procurar Organização..." className="w-full pl-12 pr-4 py-3 rounded-[8px] border border-[#E5E5E5] bg-white text-xs font-bold uppercase tracking-widest focus:border-black outline-none transition-all shadow-sm" />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {availableOrgs.map(org => {
                const isSelected = selectedEntityId === org.id;
                const orgColor = org.metadata?.branding?.primary_color || '#000000';
                return (
                  <div 
                    key={org.id} onClick={() => setSelectedEntityId(org.id)}
                    className={`relative p-5 rounded-[12px] cursor-pointer transition-all border bg-white flex items-center justify-between group ${isSelected ? 'shadow-lg border-transparent' : 'hover:border-black/30 border-[#E5E5E5]'}`}
                    style={{ borderColor: isSelected ? orgColor : undefined }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-[8px] border border-[#F2F2F2] overflow-hidden bg-[#FAFAFA] flex items-center justify-center shrink-0">
                        {org.logo_url ? <img src={org.logo_url} className="w-full h-full object-cover" /> : <BuildingOfficeIcon className="w-6 h-6 text-[#A0A0A0]" />}
                      </div>
                      <div>
                        <h4 className="font-black text-xs text-black tracking-wide">{org.display_name}</h4>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-mono">@{org.slug}</p>
                      </div>
                    </div>
                    {isSelected && <CheckCircleIcon className="w-6 h-6" style={{ color: orgColor }} />}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="w-full lg:w-[65%] p-10 bg-white max-h-[800px] overflow-y-auto custom-scrollbar">
            {selectedEntityData ? (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col h-full">
                
                {!showContractPreview ? (
                  <>
                    <div className="flex-1">
                      <h4 className="text-sm font-black text-black uppercase tracking-widest mb-2">2. Termo de Acordo (SLA)</h4>
                      <p className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest mb-8 border-b border-[#F2F2F2] pb-6">Preencha os dados rigorosos da governança corporativa. Estas informações constarão na trilha de auditoria e no contrato exportável[cite: 1, 2].</p>
                      
                      {/* Campos Listas Dinâmicas (Estética Horizon Clarity: Mono, Uppercase, Bordas Hard) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-black uppercase tracking-widest flex items-center gap-2"><BriefcaseIcon className="w-4 h-4" /> Cargo Funcional Ocupado</label>
                          <select value={jobTitle} onChange={e => setJobTitle(e.target.value)} className="w-full p-3.5 rounded-[8px] border border-[#E5E5E5] bg-[#FAFAFA] text-[10px] font-bold text-black uppercase tracking-widest focus:border-black focus:ring-0 outline-none transition-all shadow-sm cursor-pointer hover:border-black/30">
                            <option value="">Selecione na Hierarquia...</option>
                            {availableRoles.map((r: string) => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-black uppercase tracking-widest flex items-center gap-2"><IdentificationIcon className="w-4 h-4" /> Departamento Operacional</label>
                          <select value={department} onChange={e => setDepartment(e.target.value)} className="w-full p-3.5 rounded-[8px] border border-[#E5E5E5] bg-[#FAFAFA] text-[10px] font-bold text-black uppercase tracking-widest focus:border-black focus:ring-0 outline-none transition-all shadow-sm cursor-pointer hover:border-black/30">
                            <option value="">Selecione o Organograma...</option>
                            {availableDepartments.map((d: string) => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-8 mb-8">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-black uppercase tracking-widest flex items-center gap-2"><DocumentTextIcon className="w-4 h-4" /> Escopo de Acesso Concedido</label>
                          <select value={scope} onChange={e => setScope(e.target.value)} className="w-full p-3.5 rounded-[8px] border border-[#E5E5E5] bg-[#FAFAFA] text-[10px] font-bold text-black uppercase tracking-widest focus:border-black focus:ring-0 outline-none transition-all shadow-sm cursor-pointer hover:border-black/30">
                            <option value="">Configurar Privilégios...</option>
                            {availableScopes.map((s: string) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-black uppercase tracking-widest flex items-center gap-2"><ShieldCheckIcon className="w-4 h-4" /> Propósito Institucional Base</label>
                          <select value={purpose} onChange={e => setPurpose(e.target.value)} className="w-full p-3.5 rounded-[8px] border border-[#E5E5E5] bg-[#FAFAFA] text-[10px] font-bold text-black uppercase tracking-widest focus:border-black focus:ring-0 outline-none transition-all shadow-sm cursor-pointer hover:border-black/30">
                            <option value="">Justificativa de Auditoria...</option>
                            {availablePurposes.map((p: string) => <option key={p} value={p}>{p}</option>)}
                          </select>
                        </div>
                        <HzInput type="date" label="Data de Expiração Restritiva (Vazio para Acesso Contínuo)" value={expirationDate} onChange={e => setExpirationDate(e.target.value)} icon={CalendarIcon} />
                      </div>
                    </div>

                    <div className="flex gap-4 mt-10 pt-8 border-t border-[#F2F2F2]">
                      <HzButton variant="ghost" onClick={() => setIsAdding(false)} className="w-1/3 text-[10px] font-bold uppercase tracking-widest border border-[#F2F2F2] hover:bg-[#FAFAFA] text-black transition-colors">Abortar Emissão</HzButton>
                      <button onClick={() => setShowContractPreview(true)} style={{ backgroundColor: primaryColor }} disabled={!jobTitle || !department || !scope || !purpose}
                        className="flex-1 text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-[8px] hover:opacity-90 transition-all shadow-lg disabled:opacity-50 flex justify-center items-center"
                      >
                        Avançar para Visualização do Contrato Digital
                      </button>
                    </div>
                  </>
                ) : (
                  /* MOTOR DE CONTRATO DINÂMICO (FULL VIEW) */
                  <div className="flex flex-col h-full animate-in zoom-in-95 duration-300">
                    <h4 className="text-sm font-black text-black uppercase tracking-widest mb-6">3. Revisão e Aceite Legal do Contrato</h4>
                    <div className="flex-1 bg-[#FAFAFA] border border-[#E5E5E5] rounded-[12px] p-8 overflow-y-auto custom-scrollbar text-xs text-black leading-relaxed font-serif shadow-inner">
                      
                      <div className="text-center mb-8 pb-6 border-b border-[#E5E5E5]">
                         <img src={selectedEntityData.logo_url || '/logo.png'} className="h-12 mx-auto mb-4" alt="Logo" />
                         <h5 className="font-black uppercase tracking-widest text-sm text-black">CONTRATO OFICIAL DE AFILIAÇÃO INSTITUCIONAL</h5>
                         <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-[#A0A0A0] mt-2">Provisionamento de Identidade Digital e SLA B2B</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-white p-5 rounded-[8px] border border-[#F2F2F2] shadow-sm font-sans">
                         <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-[#A0A0A0] mb-1">Entidade Contratante (Hub)</p>
                            <p className="font-black text-black text-sm">{selectedEntityData.display_name}</p>
                            <p className="text-[10px] text-gray-500 font-mono mt-1">CNPJ/ID: {selectedEntityData.metadata?.cnpj || selectedEntityData.billing_info?.tax_id || 'Global'}</p>
                         </div>
                         <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-[#A0A0A0] mb-1">Identidade Afiliada</p>
                            <p className="font-black text-black text-sm break-all">{resolvedUserId}</p>
                            <p className="text-[10px] text-gray-500 font-mono mt-1">Motor: Horazion Group (Zero Trust)</p>
                         </div>
                      </div>
                      
                      <h6 className="font-black mt-6 mb-3 uppercase text-[10px] tracking-widest text-black">Cláusula 1 - Do Objeto, Atribuição Sistêmica e Organograma</h6>
                      <p className="mb-5 text-gray-800 text-justify">Pelo presente instrumento de provisionamento estrutural, a Identidade Afiliada assume formalmente o cargo funcional de <strong>{jobTitle}</strong>. O vínculo encontra-se subordinado tecnologicamente e alocado de forma exclusiva ao departamento de <strong>{department}</strong> dentro da arquitetura da Entidade Contratante. O escopo lógico de atuação foi fixado pela governança em <strong>{scope}</strong>, justificado mediante auditoria contínua para o cumprimento do propósito principal estabelecido como: <strong>{purpose}</strong>.</p>
                      
                      <h6 className="font-black mt-6 mb-3 uppercase text-[10px] tracking-widest text-black">Cláusula 2 - Da Estratégia de Marca e Alinhamento Corporativo</h6>
                      <p className="mb-5 text-gray-800 text-justify">O Afiliado compromete-se a operar dentro das diretrizes da Contratante, cuja missão global é estipulada como: <em>"{orgStrategy.mission}"</em>. Adicionalmente, atesta estar ciente e alinhado aos valores corporativos exigidos no dia a dia da operação: <strong>{orgStrategy.values.join(', ')}</strong>.</p>

                      <h6 className="font-black mt-6 mb-3 uppercase text-[10px] tracking-widest text-black">Cláusula 3 - Da Extensão de Acessos e Motor de Benefícios</h6>
                      <p className="mb-4 text-gray-800 text-justify">A Entidade Contratante, através da infraestrutura Horazion, concede de forma automática e vinculada ao ciclo de vida desta afiliação os seguintes acessos e benefícios documentados:</p>
                      <ul className="mb-5 space-y-2 pl-4 border-l-2 border-black">
                         {orgBenefits.map((b: any, index: number) => (
                           <li key={index} className="text-[11px]"><strong className="text-black">{b.label}:</strong> <span className="text-gray-600">{b.desc}</span></li>
                         ))}
                      </ul>
                      
                      <h6 className="font-black mt-6 mb-3 uppercase text-[10px] tracking-widest text-black">Cláusula 4 - Temporalidade, Privacidade e Governança (LGPD)</h6>
                      <p className="mb-5 text-gray-800 text-justify">A revogação de todos os acessos estruturais dispostos neste contrato ocorrerá sumariamente no prazo de {expirationDate ? safeFormatDate(expirationDate) : 'caráter vitalício e contínuo, enquanto durar a parceria estipulada'}. O Afiliado declara consentimento explícito, à luz da Legislação Geral de Proteção de Dados (LGPD) e normativas Zero Trust [cite: 3, 4], para o compartilhamento criptografado de suas matrizes de identidade básicas exigidas pelo Hub Contratante[cite: 5, 6]. A holding Horazion Group atua exclusivamente como custodiante tecnológico garantindo o isolamento da operação.</p>
                      
                      <div className="mt-8 pt-5 border-t border-[#E5E5E5] flex items-start gap-4 bg-white p-5 rounded-[8px] border-2 border-transparent hover:border-black/10 shadow-md cursor-pointer transition-all" onClick={() => setHasAcceptedContract(!hasAcceptedContract)}>
                         <div className={`mt-0.5 shrink-0 w-5 h-5 rounded border ${hasAcceptedContract ? 'bg-black border-black' : 'bg-white border-[#A0A0A0]'} flex items-center justify-center transition-colors`}>
                           {hasAcceptedContract && <CheckCircleIcon className="w-4 h-4 text-white" />}
                         </div>
                         <span className="text-[11px] font-sans font-bold text-black uppercase tracking-wider leading-relaxed">Assino digitalmente este documento. Declaro ter lido as cláusulas e autorizo o provisionamento imediato desta afiliação sistêmica em meu HorizionID.</span>
                      </div>
                    </div>

                    <div className="flex gap-4 mt-8 pt-6 border-t border-[#F2F2F2]">
                      <HzButton variant="ghost" onClick={() => setShowContractPreview(false)} className="w-1/3 text-[10px] font-bold uppercase tracking-widest border border-[#F2F2F2] hover:bg-[#FAFAFA] text-black transition-colors">Retroceder</HzButton>
                      <button onClick={handleAddAffiliation} style={{ backgroundColor: primaryColor }} disabled={!hasAcceptedContract || isSaving}
                        className="flex-1 text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-[8px] hover:opacity-90 transition-all shadow-lg disabled:opacity-50 flex justify-center items-center"
                      >
                        {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Confirmar Assinatura e Emitir Certificado'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-40 max-w-sm mx-auto text-center animate-in fade-in py-20">
                 <div className="w-20 h-20 rounded-full border-2 border-dashed border-black flex items-center justify-center mb-6">
                   <LinkIcon className="w-8 h-8 text-black" />
                 </div>
                 <h4 className="text-sm font-black text-black uppercase tracking-widest mb-3">Auditoria B2B Aguardando</h4>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-[#A0A0A0] leading-relaxed">Selecione o Hub na listagem adjacente para destravar o formulário de provisionamento contratual e motor de SLAs.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Listagem de Identidades (Modo de Visualização Normal da Aba) */}
      {!isAdding && !successData && affiliations.length > 0 && (
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500 no-print">
         {filteredAffiliations.map(aff => {
           const org = aff.entities;
           const brandColor = org?.metadata?.branding?.primary_color || '#000000';
           const isExpired = isDateExpired(aff.expires_at);

           return (
             <div key={aff.id} className="bg-white border border-[#F2F2F2] rounded-[16px] p-8 flex flex-col justify-between overflow-hidden relative shadow-sm hover:shadow-xl transition-all group">
               <div className="absolute top-0 left-0 w-2 h-full transition-opacity opacity-0 group-hover:opacity-100" style={{ backgroundColor: brandColor }}></div>
               <div className="flex justify-between items-start border-b border-[#F2F2F2] pb-6 pl-2">
                 <div className="flex items-center gap-5">
                   <div className="w-16 h-16 rounded-[12px] border border-[#F2F2F2] bg-[#FAFAFA] flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                     {org?.logo_url ? <img src={org.logo_url} className="w-full h-full object-cover" /> : <BuildingOfficeIcon className="w-6 h-6 text-[#A0A0A0]" />}
                   </div>
                   <div>
                     <h4 className="text-lg font-black text-black truncate max-w-[200px] tracking-tight">{org?.display_name || 'Organização Privada'}</h4>
                     <p className="text-[10px] font-mono font-bold text-[#A0A0A0] uppercase mt-1 tracking-widest">@{org?.slug || 'hub-b2b'}</p>
                   </div>
                 </div>
                 <span className={`text-[9px] font-black px-3 py-1.5 rounded uppercase tracking-[0.2em] shadow-sm ${isExpired ? 'bg-[#A0A0A0]/10 text-[#A0A0A0] border border-[#A0A0A0]/20' : aff.status === 'active' ? 'bg-[#FAFAFA] text-black border border-[#E5E5E5]' : 'bg-[#B6192E]/10 text-[#B6192E] border border-[#B6192E]/20'}`}>
                   {isExpired ? 'EXPIRADO' : aff.status}
                 </span>
               </div>
               <div className="py-6 grid grid-cols-2 gap-6 border-b border-[#F2F2F2] pl-2">
                 <div><span className="block text-[9px] font-bold text-[#A0A0A0] uppercase tracking-widest mb-2">Cargo Funcional</span><span className="text-xs font-black text-black uppercase tracking-widest leading-tight block">{aff.association_data?.job_title || 'Membro'} <br/><span className="text-[9px] text-[#A0A0A0] mt-1 block">{aff.association_data?.department || 'Geral'}</span></span></div>
                 <div><span className="block text-[9px] font-bold text-[#A0A0A0] uppercase tracking-widest mb-2">Expiração Contratual</span><span className={`text-xs font-black uppercase tracking-widest ${isExpired ? 'text-[#B6192E]' : 'text-black'}`}>{safeFormatDate(aff.expires_at)}</span></div>
                 <div className="col-span-2 mt-2"><span className="block text-[9px] font-bold text-[#A0A0A0] uppercase tracking-widest mb-2">Propósito Sistêmico (Auditoria)</span><span className="text-[10px] font-bold uppercase tracking-widest text-black truncate block">{aff.association_data?.purpose || 'Conexão padrão B2B'}</span></div>
               </div>
               <div className="flex gap-4 mt-6 pl-2">
                 <HzButton className="flex-1 bg-white border border-[#E5E5E5] hover:border-black text-black text-[9px] font-black uppercase tracking-widest py-3 rounded-[8px] transition-all shadow-sm">Detalhes do Contrato</HzButton>
                 <HzButton onClick={() => handleRevoke(aff.id, org?.display_name)} className="flex items-center justify-center gap-2 px-6 bg-transparent text-[#B6192E] hover:bg-[#B6192E] hover:text-white border border-[#B6192E]/30 hover:border-[#B6192E] text-[10px] font-black uppercase tracking-widest rounded-[8px] transition-all"><TrashIcon className="w-5 h-5" /></HzButton>
               </div>
             </div>
           );
         })}
       </div>
      )}
    </div>
  );
}