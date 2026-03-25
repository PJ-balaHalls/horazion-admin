'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { HzButton, HzSkeleton, HzInput } from '@/components/ui';
import { 
  BuildingOfficeIcon, TrashIcon, LinkIcon, MagnifyingGlassIcon, 
  ShieldCheckIcon, BriefcaseIcon, CheckCircleIcon, IdentificationIcon, 
  DocumentTextIcon, CalendarIcon, LifebuoyIcon, PrinterIcon, DocumentDuplicateIcon,
  GiftIcon
} from '@heroicons/react/24/outline';

interface UserAffiliationsTabProps { userId?: string; }

// [ARCH-HZ] Dicionário Global de Erros para rastreabilidade
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
  jobTitle: string;
  department: string;
  scope: string;
  purpose: string;
  expiresAt: string;
  timestamp: string;
  benefits: any[];
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
  // [FE-HZ] Self-Healing: Extração robusta do ID
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
  
  // Campos do Contrato
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [scope, setScope] = useState('');
  const [purpose, setPurpose] = useState('');
  const [expirationDate, setExpirationDate] = useState('');

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

  const filteredAffiliations = useMemo(() => {
    return affiliations.filter(aff => {
      const term = (searchTerm || '').toLowerCase();
      const displayName = (aff.entities?.display_name || '').toLowerCase();
      const slugName = (aff.entities?.slug || '').toLowerCase();
      return displayName.includes(term) || slugName.includes(term);
    });
  }, [affiliations, searchTerm]);

  // [CORE-HZ] Injeção e Geração de Certificado Estruturado
  const handleAddAffiliation = async () => {
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
        job_title: jobTitle.trim() || 'Membro Colaborador',
        department: department.trim() || 'Geral',
        scope: scope.trim() || 'Acesso Padrão ao Hub',
        purpose: purpose.trim() || 'Integração B2B'
      }
    };

    const { error } = await supabase.from('affiliations').insert([payload]);

    if (error) {
      console.error('[CORE-HZ] Falha na injeção Supabase:', error);
      setActionError({ title: ERROR_CODES.INSERT.code, msg: ERROR_CODES.INSERT.msg, detail: error.message });
      setIsSaving(false);
    } else {
      // Extração resiliente dos benefícios da organização
      const rawBenefits = selectedEntityData.metadata?.defined_benefits || selectedEntityData.metadata?.benefits_engine?.list || [];
      const extractedBenefits = Array.isArray(rawBenefits) && rawBenefits.length > 0 
        ? rawBenefits 
        : [{ id: 'b1', label: 'Acesso Global ao Workspace', desc: 'Permissão de leitura aos painéis corporativos.' },
           { id: 'b2', label: 'Single Sign-On (SSO)', desc: 'Autenticação integrada com HorizionID.' }];

      setSuccessData({
        orgName: selectedEntityData.display_name,
        orgLogo: selectedEntityData.logo_url,
        orgSlug: selectedEntityData.slug,
        orgColor: primaryColor,
        jobTitle: payload.association_data.job_title,
        department: payload.association_data.department,
        scope: payload.association_data.scope,
        purpose: payload.association_data.purpose,
        expiresAt: payload.expires_at || 'Acesso Vitalício',
        timestamp: new Date().toISOString(),
        benefits: extractedBenefits
      });
      setIsSaving(false);
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

  // [FE-HZ] Motores de Exportação (Texto e Impressão)
  const handlePrintPDF = () => {
    window.print();
  };

  const handleCopyText = async () => {
    if (!successData) return;
    const textToCopy = `
=== CERTIFICADO DE PROVISIONAMENTO HORIZION ===
Data da Emissão: ${new Date(successData.timestamp).toLocaleString('pt-PT')}
ID de Triagem Automática: VINC-${Math.random().toString(36).substring(2, 8).toUpperCase()}

[ DADOS INSTITUCIONAIS ]
- Organização: ${successData.orgName}
- Identificador (Slug): @${successData.orgSlug}

[ PARÂMETROS DO CONTRATO ]
- Cargo Atribuído: ${successData.jobTitle}
- Departamento: ${successData.department}
- Escopo de Acesso: ${successData.scope}
- Propósito do Vínculo: ${successData.purpose}
- Expiração do Acesso: ${safeFormatDate(successData.expiresAt)}

[ MOTOR DE BENEFÍCIOS ATIVOS ]
${successData.benefits.map(b => `- ${b.label || b.id}: ${b.desc || 'Concedido'}`).join('\n')}

[ GOVERNANÇA E COMPLIANCE ]
- Suporte Oficial: enterprise@horazion.com
- Status do Motor: Sincronizado e Ativo
===============================================
    `.trim();

    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    } catch (err) {
      alert("Falha ao copiar texto para a área de transferência.");
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
      
      {/* Estilos para impressão (Esconde UI extra no PDF/Imagem gerado) */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #printable-certificate, #printable-certificate * { visibility: visible; }
          #printable-certificate { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; border: none !important; }
          .no-print { display: none !important; }
        }
      `}} />

      {/* Header B2B */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#F2F2F2] pb-6 no-print">
        <div>
          <h3 className="text-3xl font-bold text-black tracking-tighter">Grafo de Conexões B2B</h3>
          <p className="text-sm font-medium text-[#A0A0A0] uppercase tracking-widest mt-2">Provisionamento e Governança de Identidades Corporativas.</p>
        </div>
        {!isAdding && !successData && (
          <HzButton onClick={() => setIsAdding(true)} disabled={!resolvedUserId} className="bg-black text-white hover:bg-[#1A1A1A] px-6 py-3 rounded-[8px] text-[10px] font-black uppercase tracking-widest shadow-sm transition-all disabled:opacity-50">
            <span className="flex items-center gap-2.5"><LinkIcon className="w-4 h-4" /> Novo Vínculo Institucional</span>
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

      {/* TEMPLATE MESSAGE: CERTIFICADO DE PROVISIONAMENTO EXPORTÁVEL */}
      {successData && (
        <div id="printable-certificate" className="bg-white border border-[#E5E5E5] rounded-[16px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 max-w-4xl mx-auto relative mb-10">
          <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: successData.orgColor }}></div>
          
          <div className="p-10 md:p-14">
            
            {/* Header do Certificado */}
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between border-b border-[#F2F2F2] pb-8 mb-8">
              <div className="flex items-center gap-5 mb-6 md:mb-0">
                <div className="w-16 h-16 rounded-[12px] bg-[#FAFAFA] border border-[#E5E5E5] flex items-center justify-center shadow-sm overflow-hidden shrink-0">
                  {successData.orgLogo ? <img src={successData.orgLogo} className="w-full h-full object-cover" alt="Logo" /> : <BuildingOfficeIcon className="w-8 h-8 text-[#A0A0A0]" />}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-black tracking-tight">{successData.orgName}</h2>
                  <p className="text-xs font-mono font-bold text-[#A0A0A0] uppercase mt-1">@{successData.orgSlug}</p>
                </div>
              </div>
              <div className="text-center md:text-right">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-green-50 border border-green-200 text-green-700 text-[9px] font-black uppercase tracking-widest mb-2">
                  <CheckCircleIcon className="w-3.5 h-3.5"/> Provisionamento Ativo
                </span>
                <p className="text-[10px] font-mono text-[#A0A0A0] uppercase font-bold">Gerado em: {new Date(successData.timestamp).toLocaleString('pt-PT')}</p>
              </div>
            </div>

            {/* Corpo do Documento: Listas Estruturadas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
              
              {/* Bloco 1: Parâmetros do Contrato */}
              <div>
                <h3 className="text-[10px] font-black text-[#A0A0A0] uppercase tracking-widest mb-4 flex items-center gap-2">
                  <DocumentTextIcon className="w-4 h-4"/> Parâmetros do Contrato
                </h3>
                <ul className="space-y-4 bg-[#FAFAFA] border border-[#F2F2F2] rounded-[12px] p-5">
                  <li>
                    <span className="block text-[9px] font-bold text-[#A0A0A0] uppercase tracking-wider mb-1">Cargo Atribuído</span>
                    <strong className="text-xs font-black text-black">{successData.jobTitle}</strong>
                  </li>
                  <li>
                    <span className="block text-[9px] font-bold text-[#A0A0A0] uppercase tracking-wider mb-1">Departamento Institucional</span>
                    <strong className="text-xs font-black text-black">{successData.department}</strong>
                  </li>
                  <li>
                    <span className="block text-[9px] font-bold text-[#A0A0A0] uppercase tracking-wider mb-1">Escopo de Acesso</span>
                    <strong className="text-xs font-medium text-black leading-snug">{successData.scope}</strong>
                  </li>
                  <li>
                    <span className="block text-[9px] font-bold text-[#A0A0A0] uppercase tracking-wider mb-1">Propósito do Vínculo</span>
                    <strong className="text-xs font-medium text-black leading-snug">{successData.purpose}</strong>
                  </li>
                  <li>
                    <span className="block text-[9px] font-bold text-[#A0A0A0] uppercase tracking-wider mb-1">Validade Contratual</span>
                    <strong className="text-xs font-black text-black">{safeFormatDate(successData.expiresAt)}</strong>
                  </li>
                </ul>
              </div>

              {/* Bloco 2: Benefícios e Compliance */}
              <div className="flex flex-col gap-8">
                <div>
                  <h3 className="text-[10px] font-black text-[#A0A0A0] uppercase tracking-widest mb-4 flex items-center gap-2">
                    <GiftIcon className="w-4 h-4"/> Motor de Benefícios Ativos
                  </h3>
                  <ul className="space-y-3">
                    {successData.benefits.map((benefit: any, index: number) => (
                      <li key={index} className="flex gap-3 items-start pb-3 border-b border-[#F2F2F2] last:border-0 last:pb-0">
                        <CheckCircleIcon className="w-4 h-4 text-black shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-[11px] font-black text-black uppercase">{benefit.label || benefit.id}</strong>
                          <span className="block text-[10px] font-medium text-[#A0A0A0] mt-1 leading-snug">{benefit.desc || 'Benefício padronizado provisionado.'}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-[10px] font-black text-[#A0A0A0] uppercase tracking-widest mb-3 flex items-center gap-2">
                    <LifebuoyIcon className="w-4 h-4"/> Governança & Suporte
                  </h3>
                  <div className="bg-black text-white p-4 rounded-[12px] shadow-sm">
                    <ul className="space-y-2">
                      <li className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-gray-400 uppercase tracking-widest">Canal de Disputa:</span>
                        <strong className="font-mono">enterprise@horazion.com</strong>
                      </li>
                      <li className="flex justify-between items-center text-[10px] border-t border-white/10 pt-2 mt-2">
                        <span className="font-bold text-gray-400 uppercase tracking-widest">Motor Lógico:</span>
                        <strong className="text-green-400">Online & Sincronizado</strong>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Ações (Não aparecem na impressão) */}
            <div className="mt-10 pt-6 border-t border-[#F2F2F2] flex flex-col md:flex-row justify-between items-center gap-4 no-print">
              <div className="flex gap-3 w-full md:w-auto">
                <HzButton onClick={handlePrintPDF} variant="ghost" className="flex-1 md:flex-none flex items-center justify-center gap-2 text-[10px] font-black text-black uppercase tracking-widest border border-[#E5E5E5] hover:bg-[#FAFAFA] px-5 py-3 rounded-[8px] transition-all">
                  <PrinterIcon className="w-4 h-4" /> Exportar PDF / Imagem
                </HzButton>
                <HzButton onClick={handleCopyText} variant="ghost" className="flex-1 md:flex-none flex items-center justify-center gap-2 text-[10px] font-black text-black uppercase tracking-widest border border-[#E5E5E5] hover:bg-[#FAFAFA] px-5 py-3 rounded-[8px] transition-all">
                  {isCopied ? <CheckCircleIcon className="w-4 h-4 text-green-600" /> : <DocumentDuplicateIcon className="w-4 h-4" />}
                  {isCopied ? 'Copiado!' : 'Copiar Texto'}
                </HzButton>
              </div>
              <HzButton onClick={handleFinishSuccess} className="w-full md:w-auto bg-black text-white px-8 py-3 rounded-[8px] text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-[#1A1A1A] transition-all">
                Concluir Operação
              </HzButton>
            </div>
          </div>
        </div>
      )}

      {/* FORMULÁRIO WIZARD (Deep B2B Form) */}
      {isAdding && !successData && (
        <div className="bg-white border border-black rounded-[16px] shadow-xl overflow-hidden flex flex-col lg:flex-row relative no-print">
          <div className="absolute top-0 left-0 w-1 h-full bg-black z-10"></div>
          
          <div className="w-full lg:w-[40%] bg-[#FAFAFA] p-8 overflow-y-auto custom-scrollbar border-r border-[#F2F2F2] max-h-[700px]">
            <div className="mb-6">
              <h4 className="text-sm font-black text-black uppercase tracking-widest mb-4">1. Seleção do Hub Institucional</h4>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A0A0A0]" />
                <input type="text" placeholder="Procurar Organização..." className="w-full pl-12 pr-4 py-3 rounded-[8px] border border-[#E5E5E5] bg-white text-sm font-medium focus:border-black outline-none transition-all shadow-sm" />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {availableOrgs.map(org => {
                const isSelected = selectedEntityId === org.id;
                const orgColor = org.metadata?.branding?.primary_color || '#000000';
                return (
                  <div 
                    key={org.id} onClick={() => setSelectedEntityId(org.id)}
                    className={`relative p-4 rounded-[12px] cursor-pointer transition-all border bg-white flex items-center justify-between group ${isSelected ? 'shadow-md border-transparent' : 'hover:border-black/30 border-[#E5E5E5]'}`}
                    style={{ borderColor: isSelected ? orgColor : undefined }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-[8px] border border-[#F2F2F2] overflow-hidden bg-[#FAFAFA] flex items-center justify-center shrink-0">
                        {org.logo_url ? <img src={org.logo_url} className="w-full h-full object-cover" /> : <BuildingOfficeIcon className="w-5 h-5 text-[#A0A0A0]" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-black">{org.display_name}</h4>
                        <p className="text-[9px] text-gray-400 mt-0.5 uppercase tracking-wider font-mono">@{org.slug}</p>
                      </div>
                    </div>
                    {isSelected && <CheckCircleIcon className="w-5 h-5" style={{ color: orgColor }} />}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="w-full lg:w-[60%] p-8 bg-white max-h-[700px] overflow-y-auto custom-scrollbar">
            {selectedEntityData ? (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col h-full">
                <div className="flex-1">
                  <h4 className="text-sm font-black text-black uppercase tracking-widest mb-6">2. Parametrização do Contrato Digital</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <HzInput label="Cargo Funcional" placeholder="Ex: Engenheiro de Software" value={jobTitle} onChange={e => setJobTitle(e.target.value)} icon={BriefcaseIcon} />
                    <HzInput label="Departamento / Organograma" placeholder="Ex: Tecnologia / Squad Alpha" value={department} onChange={e => setDepartment(e.target.value)} icon={IdentificationIcon} />
                  </div>

                  <div className="space-y-6 mb-6">
                    <HzInput label="Escopo de Acesso" placeholder="Ex: Acesso total aos repositórios." value={scope} onChange={e => setScope(e.target.value)} icon={DocumentTextIcon} />
                    <HzInput label="Propósito Institucional" placeholder="Ex: Desenvolvimento contínuo." value={purpose} onChange={e => setPurpose(e.target.value)} icon={ShieldCheckIcon} />
                    <HzInput type="date" label="Data de Expiração (Vazio para vitalício)" value={expirationDate} onChange={e => setExpirationDate(e.target.value)} icon={CalendarIcon} />
                  </div>
                </div>

                <div className="flex gap-4 mt-8 pt-6 border-t border-[#F2F2F2]">
                  <HzButton variant="ghost" onClick={() => setIsAdding(false)} className="w-1/3 text-[10px] font-bold uppercase tracking-widest border border-[#F2F2F2] hover:bg-[#FAFAFA] text-black transition-colors">Cancelar Vínculo</HzButton>
                  <button 
                    onClick={handleAddAffiliation} disabled={isSaving} style={{ backgroundColor: primaryColor }}
                    className="flex-1 text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-[8px] hover:opacity-90 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                  >
                    {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Autorizar e Provisionar Identidade'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-40 max-w-sm mx-auto text-center animate-in fade-in py-20">
                 <div className="w-16 h-16 rounded-full border border-dashed border-black flex items-center justify-center mb-6">
                   <LinkIcon className="w-6 h-6 text-black" />
                 </div>
                 <h4 className="text-sm font-black text-black uppercase tracking-widest mb-3">Aguardando Seleção</h4>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-[#A0A0A0] leading-relaxed">Selecione o Hub na listagem ao lado para destravar os parâmetros de provisionamento estrutural.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Listagem Estendida de Identidades Vinculadas */}
      {!isAdding && !successData && affiliations.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-500 no-print">
          {filteredAffiliations.map(aff => {
            const org = aff.entities;
            const brandColor = org?.metadata?.branding?.primary_color || '#000000';
            const isExpired = isDateExpired(aff.expires_at);

            return (
              <div key={aff.id} className="bg-white border border-[#F2F2F2] rounded-[16px] p-7 flex flex-col justify-between overflow-hidden relative shadow-sm hover:shadow-lg transition-all group">
                <div className="absolute top-0 left-0 w-1.5 h-full transition-opacity opacity-0 group-hover:opacity-100" style={{ backgroundColor: brandColor }}></div>
                
                <div className="flex justify-between items-start border-b border-[#F2F2F2] pb-6 pl-2">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-[12px] border border-[#F2F2F2] bg-[#FAFAFA] flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                      {org?.logo_url ? <img src={org.logo_url} className="w-full h-full object-cover" /> : <BuildingOfficeIcon className="w-6 h-6 text-[#A0A0A0]" />}
                    </div>
                    <div>
                      <h4 className="text-base font-black text-black truncate max-w-[200px]">{org?.display_name || 'Desconhecida'}</h4>
                      <p className="text-[10px] font-mono font-bold text-[#A0A0A0] uppercase mt-1">@{org?.slug || 'hub-b2b'}</p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-black px-2.5 py-1 rounded uppercase tracking-[0.2em] ${isExpired ? 'bg-[#A0A0A0]/10 text-[#A0A0A0] border border-[#A0A0A0]/20' : aff.status === 'active' ? 'bg-[#FAFAFA] text-black border border-[#F2F2F2]' : 'bg-[#B6192E]/10 text-[#B6192E] border border-[#B6192E]/20'}`}>
                    {isExpired ? 'EXPIRADO' : aff.status}
                  </span>
                </div>

                <div className="py-6 grid grid-cols-2 gap-4 border-b border-[#F2F2F2] pl-2">
                  <div><span className="block text-[9px] font-bold text-[#A0A0A0] uppercase tracking-widest mb-1.5">Cargo / Organograma</span><span className="text-xs font-black text-black uppercase tracking-widest leading-tight block">{aff.association_data?.job_title || 'Membro'} <br/><span className="text-[9px] text-[#A0A0A0]">{aff.association_data?.department || 'Geral'}</span></span></div>
                  <div><span className="block text-[9px] font-bold text-[#A0A0A0] uppercase tracking-widest mb-1.5">Expiração Contratual</span><span className={`text-xs font-black uppercase tracking-widest ${isExpired ? 'text-[#B6192E]' : 'text-black'}`}>{safeFormatDate(aff.expires_at)}</span></div>
                  <div className="col-span-2 mt-2"><span className="block text-[9px] font-bold text-[#A0A0A0] uppercase tracking-widest mb-1.5">Propósito Sistêmico</span><span className="text-[10px] font-medium text-black line-clamp-1">{aff.association_data?.purpose || 'Conexão padrão'}</span></div>
                </div>

                <div className="flex gap-4 mt-6 pl-2">
                  <HzButton className="flex-1 bg-white border border-[#F2F2F2] hover:border-black text-black text-[9px] font-black uppercase tracking-widest py-3 rounded-[8px] transition-all">Detalhes do Contrato</HzButton>
                  <HzButton onClick={() => handleRevoke(aff.id, org?.display_name)} className="flex items-center justify-center gap-2 px-6 bg-transparent text-[#B6192E] hover:bg-[#B6192E] hover:text-white border border-[#B6192E]/30 hover:border-[#B6192E] text-[10px] font-black uppercase tracking-widest rounded-[8px] transition-all"><TrashIcon className="w-4 h-4" /></HzButton>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isAdding && !successData && affiliations.length === 0 && (
        <div className="p-24 text-center border border-[#E5E5E5] border-dashed rounded-[16px] bg-white flex flex-col items-center justify-center animate-in fade-in duration-700 no-print">
          <div className="w-20 h-20 bg-[#FAFAFA] rounded-full flex items-center justify-center shadow-sm mb-6 border border-[#F2F2F2]">
            <BuildingOfficeIcon className="w-8 h-8 text-black" />
          </div>
          <h4 className="text-sm font-black text-black uppercase tracking-widest">Identidade Independente</h4>
          <p className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest mt-3 max-w-sm leading-relaxed">Este HorizionID não possui arquitetura corporativa interligada. Toda governança repousa exclusivamente sobre a conta pessoal.</p>
        </div>
      )}
    </div>
  );
}