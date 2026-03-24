'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { HzButton, HzSkeleton, HzInput, HzSelect } from '@/components/ui';
import { BuildingOfficeIcon, TrashIcon, LinkIcon, MagnifyingGlassIcon, FunnelIcon, GiftIcon, ShieldCheckIcon, ClockIcon, CheckCircleIcon, ChevronLeftIcon, ChevronRightIcon, BriefcaseIcon } from '@heroicons/react/24/outline';

interface UserAffiliationsTabProps { userId: string; }

// Catálogo de Ícones para Benefícios
const BENEFIT_ICONS: Record<string, React.ElementType> = {
  'vip_access': ShieldCheckIcon, 'fee_waiver': GiftIcon, 'priority_support': ClockIcon, 'default': GiftIcon
};

const ROLES_DEFINITION = [
  { id: 'member', label: 'Membro Padrão', desc: 'Permissões de leitura e interação base.' },
  { id: 'finance', label: 'Gestor Financeiro', desc: 'Gestão de faturas, orçamentos e transações.' },
  { id: 'admin', label: 'Administrador Org', desc: 'Controlo total e provisionamento de usuários.' }
];

// Formatador de Datas Seguro (Evita quebrar a Netlify)
const safeFormatDate = (dateString: any) => {
  if (!dateString) return 'Vitalício';
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

export function UserAffiliationsTab({ userId }: UserAffiliationsTabProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  
  // Dados Principais
  const [affiliations, setAffiliations] = useState<any[]>([]);
  const [availableOrgs, setAvailableOrgs] = useState<any[]>([]);
  
  // UI States
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentStep, setCurrentStep] = useState(1);
  const [actionError, setActionError] = useState<{title: string, msg: string} | null>(null);

  // Form States
  const [isAdding, setIsAdding] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [selectedRole, setSelectedRole] = useState('member');
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([]);
  const [expirationDate, setExpirationDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    setIsLoading(true); setActionError(null);

    try {
      // 1. Busca Afiliações
      const { data: affData, error: affError } = await supabase
        .from('affiliations')
        .select(`id, affiliation_role, status, expires_at, association_data, entities ( id, display_name, slug, logo_url, metadata )`)
        .eq('profile_id', userId);
        
      if (affError) throw affError;
      setAffiliations(affData || []);

      // 2. Busca Organizações
      const { data: orgData, error: orgError } = await supabase
        .from('entities')
        .select('id, display_name, slug, logo_url, metadata, status');
        
      if (orgError) throw orgError;
      setAvailableOrgs(orgData || []);

    } catch (error: any) {
      console.error(error);
      setActionError({ title: "Falha de Leitura", msg: error.message || "Erro ao conectar ao banco de dados." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [userId]);

  // Benefícios extraídos dinamicamente da Org Selecionada
  const currentOrgBenefits = useMemo(() => {
    if (!selectedEntity) return [];
    const org = availableOrgs.find(o => o.id === selectedEntity);
    return org?.metadata?.defined_benefits || [];
  }, [selectedEntity, availableOrgs]);

  const toggleBenefit = (benefitId: string) => {
    setSelectedBenefits(prev => prev.includes(benefitId) ? prev.filter(b => b !== benefitId) : [...prev, benefitId]);
  };

  // INJEÇÃO NO BANCO (MÉTODO BLINDADO)
  const handleAddAffiliation = async () => {
    if (!selectedEntity) return alert("Selecione uma organização.");
    if (!userId) return setActionError({ title: "Erro de Contexto", msg: "O ID do utilizador não existe nesta página." });
    
    setActionError(null); setIsSaving(true);

    // Payload Limpo e Direto (Sem validadores externos que possam falhar)
    const payload = {
      profile_id: userId,
      entity_id: selectedEntity,
      affiliation_role: selectedRole,
      status: 'active',
      expires_at: expirationDate ? new Date(expirationDate).toISOString() : null,
      association_data: { 
        job_title: jobTitle.trim() || 'Membro', 
        benefits: selectedBenefits 
      }
    };

    const { error } = await supabase.from('affiliations').insert([payload]);

    if (error) {
      console.error("ERRO SUPABASE:", error);
      setActionError({ 
        title: "Falha ao Injetar Vínculo", 
        msg: error.message.includes('23505') ? 'Este vínculo já existe.' : error.message 
      });
    } else {
      setIsAdding(false); setCurrentStep(1); setSelectedEntity(''); setJobTitle(''); setSelectedRole('member'); setSelectedBenefits([]); setExpirationDate('');
      await loadData();
    }
    setIsSaving(false);
  };

  const handleRevoke = async (id: string, orgName: string) => {
    if(!confirm(`Revogar o acesso definitivo ao Hub ${orgName}?`)) return;
    const { error } = await supabase.from('affiliations').delete().eq('id', id);
    if (error) setActionError({ title: "Falha na Revogação", msg: error.message });
    else await loadData();
  };

  const scrollCarousel = (direction: -1 | 1) => {
    if (carouselRef.current) carouselRef.current.scrollBy({ left: 300 * direction, behavior: 'smooth' });
  };

  // Filtro Blindado
  const filteredAffiliations = useMemo(() => {
    return affiliations.filter(aff => {
      const term = (searchTerm || '').toLowerCase();
      const displayName = (aff.entities?.display_name || '').toLowerCase();
      const slug = (aff.entities?.slug || '').toLowerCase();
      
      const matchSearch = displayName.includes(term) || slug.includes(term);
      const matchStatus = statusFilter === 'all' || aff.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [affiliations, searchTerm, statusFilter]);

  if (isLoading) return <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><HzSkeleton className="h-64 w-full rounded-[12px]" /><HzSkeleton className="h-64 w-full rounded-[12px]" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in pb-10">
      
      {/* ALERTAS */}
      {actionError && (
        <div className="p-4 border border-[#B6192E] bg-[#B6192E]/5 rounded-[8px] flex justify-between items-start shadow-sm">
          <div className="flex gap-3 items-center">
            <CheckCircleIcon className="w-5 h-5 text-[#B6192E]" />
            <div><h4 className="text-xs font-black text-[#B6192E] uppercase tracking-widest">{actionError.title}</h4><p className="text-[11px] font-bold text-[#B6192E]/80 mt-1">{actionError.msg}</p></div>
          </div>
          <button onClick={() => setActionError(null)} className="text-[#B6192E] text-[10px] font-bold uppercase hover:bg-[#B6192E]/10 px-3 py-1.5 rounded transition-colors">Fechar</button>
        </div>
      )}

      {/* HEADER B2B */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#F2F2F2] pb-6">
        <div>
          <h3 className="text-3xl font-bold text-black tracking-tighter">Grafo de Identidades B2B</h3>
          <p className="text-sm font-medium text-[#A0A0A0] uppercase tracking-widest mt-2">Provisionamento de Acessos e Motor de Benefícios.</p>
        </div>
        {!isAdding && (
          <HzButton onClick={() => setIsAdding(true)} className="bg-black text-white hover:bg-[#B6192E] px-6 py-3 rounded-[8px] text-[10px] font-black uppercase tracking-widest transition-all shadow-sm">
            <span className="flex items-center gap-2.5"><LinkIcon className="w-4 h-4" /> NOVO VÍNCULO CORPORATIVO</span>
          </HzButton>
        )}
      </div>

      {/* WIZARD PREMIUM (CRIAÇÃO DE VÍNCULO) */}
      {isAdding && (
        <div className="border border-black bg-[#FAFAFA] rounded-[16px] shadow-sm animate-in slide-in-from-top-4 overflow-hidden relative">
          <div className="absolute top-0 left-0 h-full w-1 bg-black"></div>
          
          <div className="p-8 space-y-10">
            {/* Steps */}
            <div className="flex gap-1.5 border-b border-[#F2F2F2] pb-4">
               {[1,2,3].map(step => (
                 <div key={step} className={`w-8 h-8 flex items-center justify-center text-[10px] font-black uppercase tracking-widest border transition-colors ${currentStep === step ? 'bg-black text-white border-black' : step < currentStep ? 'bg-[#FAFAFA] text-black border-black' : 'bg-[#FAFAFA] text-[#A0A0A0] border-[#F2F2F2]'}`}>
                    {String(step).padStart(2, '0')}
                 </div>
               ))}
               <p className="text-[10px] font-black text-black uppercase tracking-widest mt-2 ml-3">
                  {currentStep === 1 ? 'Seleção do Hub' : currentStep === 2 ? 'Definição de Função' : 'Atribuição de Benefícios'}
               </p>
            </div>

            {/* Passo 1: Carrossel */}
            {currentStep === 1 && (
              <div className="animate-in fade-in duration-500">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h4 className="text-sm font-black text-black uppercase tracking-widest">Selecione o Hub Corporativo</h4>
                    <p className="text-[10px] text-[#A0A0A0] font-medium mt-1 uppercase">Afiliação da Identidade ao Ecossistema da Organização.</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => scrollCarousel(-1)} className="p-2 border border-[#F2F2F2] rounded-full text-black hover:bg-white hover:border-black transition-all shadow-sm"><ChevronLeftIcon className="w-4 h-4" /></button>
                    <button onClick={() => scrollCarousel(1)} className="p-2 border border-[#F2F2F2] rounded-full text-black hover:bg-white hover:border-black transition-all shadow-sm"><ChevronRightIcon className="w-4 h-4" /></button>
                  </div>
                </div>
                
                <div ref={carouselRef} className="flex overflow-x-auto gap-5 pb-6 snap-x custom-scrollbar pl-2">
                  {availableOrgs.length === 0 ? (
                     <div className="w-full text-center p-12 text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest">Nenhuma organização disponível.</div>
                  ) : (
                    availableOrgs.map(org => {
                      const isSelected = selectedEntity === org.id;
                      const primaryColor = org.metadata?.branding?.primary_color || '#000000';
                      return (
                        <div 
                          key={org.id} onClick={() => setSelectedEntity(org.id)}
                          className={`snap-start flex-shrink-0 w-72 p-6 rounded-[12px] border cursor-pointer transition-all duration-300 relative bg-white group flex items-center gap-4 ${isSelected ? 'shadow-lg' : 'border-[#F2F2F2] hover:border-black hover:bg-[#FAFAFA]'}`}
                          style={{ borderColor: isSelected ? primaryColor : undefined }}
                        >
                          <div className="absolute top-0 left-0 w-1.5 h-full transition-opacity opacity-0 group-hover:opacity-100" style={{ backgroundColor: primaryColor, opacity: isSelected ? 1 : undefined }}></div>
                          <div className="w-16 h-16 rounded-[8px] border border-[#F2F2F2] bg-[#FAFAFA] flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                            {org.logo_url ? <img src={org.logo_url} className="w-full h-full object-cover" /> : <BuildingOfficeIcon className="w-8 h-8 text-[#A0A0A0]" />}
                          </div>
                          <div><h5 className="text-sm font-black text-black leading-tight line-clamp-1">{org.display_name}</h5><p className="text-[10px] font-mono text-[#A0A0A0] mt-1 font-bold">@{org.slug}</p></div>
                          {isSelected && <div className="absolute top-4 right-4"><CheckCircleIcon className="w-4 h-4" style={{ color: primaryColor }} /></div>}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Passo 2: Função e Hierarquia */}
            {currentStep === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
                <div>
                   <h4 className="text-sm font-black text-black uppercase tracking-widest mb-4">Hierarquia de Acesso Horazion</h4>
                   <div className="space-y-4">
                     {ROLES_DEFINITION.map(role => (
                       <div key={role.id} onClick={() => setSelectedRole(role.id)} className={`p-5 rounded-[12px] border cursor-pointer transition-all ${selectedRole === role.id ? 'border-black bg-black shadow-md' : 'border-[#F2F2F2] bg-white hover:border-black/30'}`}>
                         <h5 className={`text-xs font-black uppercase tracking-widest ${selectedRole === role.id ? 'text-white' : 'text-black'}`}>{role.label}</h5>
                         <p className={`text-[10px] mt-2 font-medium leading-relaxed ${selectedRole === role.id ? 'text-gray-300' : 'text-[#A0A0A0]'}`}>{role.desc}</p>
                       </div>
                     ))}
                   </div>
                </div>
                <div className="space-y-6">
                    <h4 className="text-sm font-black text-black uppercase tracking-widest mb-4">Dados no Hub</h4>
                    <HzInput label="Função Real / Cargo (Ex: Sénior Dev)" value={jobTitle} onChange={e => setJobTitle(e.target.value)} icon={BriefcaseIcon} />
                    <HzInput type="date" label="Data de Expiração Automática (Opcional)" value={expirationDate} onChange={e => setExpirationDate(e.target.value)} icon={ClockIcon} />
                </div>
              </div>
            )}

            {/* Passo 3: Benefícios */}
            {currentStep === 3 && (
              <div className="animate-in fade-in duration-500">
                  <h4 className="text-sm font-black text-black uppercase tracking-widest mb-5">Atribuição de Benefícios</h4>
                  {!currentOrgBenefits || currentOrgBenefits.length === 0 ? (
                     <div className="p-10 text-center border border-[#F2F2F2] rounded-[12px] bg-white text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest">Nenhum benefício configurado neste Hub corporativo.</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {currentOrgBenefits.map((benefit: any) => {
                        const isChecked = selectedBenefits.includes(benefit.id);
                        const Icon = BENEFIT_ICONS[benefit.icon_key || ''] || BENEFIT_ICONS['default'];
                        return (
                          <div 
                            key={benefit.id} onClick={() => toggleBenefit(benefit.id)}
                            className={`p-5 rounded-[12px] border cursor-pointer transition-all flex gap-4 ${isChecked ? 'border-black bg-white shadow-sm' : 'border-[#F2F2F2] bg-white hover:border-black/30'}`}
                          >
                            <div className={`w-10 h-10 rounded-[8px] flex items-center justify-center shrink-0 ${isChecked ? 'bg-black text-white' : 'bg-[#FAFAFA] text-[#A0A0A0]'}`}><Icon className="w-5 h-5" /></div>
                            <div>
                              <h5 className="text-[11px] font-black text-black uppercase tracking-widest">{benefit.label}</h5>
                              <p className="text-[9px] font-medium text-[#A0A0A0] mt-1.5 leading-tight">{benefit.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
              </div>
            )}
          </div>

          {/* Navegação do Wizard */}
          <div className="flex justify-between gap-4 p-6 bg-white border-t border-[#F2F2F2]">
            <HzButton variant="ghost" onClick={() => setIsAdding(false)} className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest hover:text-black">Cancelar</HzButton>
            <div className="flex gap-3">
               {currentStep > 1 && <HzButton variant="ghost" onClick={() => setCurrentStep(prev => prev - 1)} className="text-[10px] font-bold text-black uppercase tracking-widest hover:text-white hover:bg-black border border-[#F2F2F2] rounded px-5">Voltar</HzButton>}
               {currentStep < 3 && <HzButton onClick={() => setCurrentStep(prev => prev + 1)} disabled={currentStep === 1 && !selectedEntity} className="bg-black text-white text-[10px] font-bold uppercase tracking-widest px-8 py-3 rounded-[8px] hover:bg-[#B6192E] transition-all shadow-sm">Seguinte</HzButton>}
               {currentStep === 3 && <HzButton onClick={handleAddAffiliation} disabled={isSaving} className="bg-black text-white text-[10px] font-black uppercase tracking-widest px-8 py-3 rounded-[8px] hover:bg-[#B6192E] transition-all shadow-sm">{isSaving ? 'A INJETAR...' : 'CONFIRMAR AFILIAÇÃO'}</HzButton>}
            </div>
          </div>
        </div>
      )}

      {/* BUSCA E FILTROS */}
      {!isAdding && affiliations.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 border border-[#F2F2F2] rounded-[12px] shadow-sm">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#A0A0A0]" />
            <input type="text" placeholder="Buscar no Grafo..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 border border-[#F2F2F2] bg-[#FAFAFA] rounded-[8px] text-xs font-bold text-black focus:outline-none focus:border-black transition-colors" />
          </div>
          <div className="relative w-full sm:w-56">
            <FunnelIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#A0A0A0]" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full pl-11 pr-4 py-3 border border-[#F2F2F2] bg-[#FAFAFA] rounded-[8px] text-[10px] font-bold uppercase tracking-widest text-black focus:outline-none focus:border-black appearance-none cursor-pointer">
              <option value="all">Todos</option><option value="active">Ativos</option><option value="pending">Pendentes</option>
            </select>
          </div>
        </div>
      )}

      {/* LISTAGEM DE CARDS PREMIUM */}
      {!isAdding && (
        affiliations.length === 0 ? (
          <div className="p-20 text-center border border-[#F2F2F2] border-dashed rounded-[16px] bg-[#FAFAFA] flex flex-col items-center justify-center">
            <BuildingOfficeIcon className="w-16 h-16 text-[#E0E0E0] mb-4" />
            <h4 className="text-sm font-black text-black uppercase tracking-widest">Identidade Independente</h4>
            <p className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest mt-2 max-w-sm">Esta conta não possui afiliação corporativa.</p>
          </div>
        ) : filteredAffiliations.length === 0 ? (
          <div className="p-12 text-center text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest border border-black/5 bg-white rounded-[12px]">Nenhum vínculo corresponde aos filtros.</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAffiliations.map((aff) => {
              // BLINDAGEM DE ARRAYS (Para a Netlify não quebrar nunca)
              const rawBenefits = aff.association_data?.benefits;
              const safeBenefits = Array.isArray(rawBenefits) ? rawBenefits : [];
              const hasBenefits = safeBenefits.length > 0;
              
              const isExpired = isDateExpired(aff.expires_at);
              const brandColor = aff.entities?.metadata?.branding?.primary_color || '#000000';
              
              const rawOrgBenefits = aff.entities?.metadata?.defined_benefits;
              const orgBenefitsList = Array.isArray(rawOrgBenefits) ? rawOrgBenefits : [];

              return (
                <div key={aff.id} className="bg-white border border-[#F2F2F2] rounded-[16px] p-7 flex flex-col justify-between overflow-hidden relative shadow-sm hover:shadow-lg transition-all group">
                  <div className="absolute top-0 left-0 w-1.5 h-full transition-opacity opacity-0 group-hover:opacity-100" style={{ backgroundColor: brandColor }}></div>
                  
                  <div className="flex justify-between items-start border-b border-[#F2F2F2] pb-6 pl-2">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-[12px] border border-[#F2F2F2] bg-[#FAFAFA] flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                        {aff.entities?.logo_url ? <img src={aff.entities.logo_url} className="w-full h-full object-cover" /> : <BuildingOfficeIcon className="w-6 h-6 text-[#A0A0A0]" />}
                      </div>
                      <div>
                        <h4 className="text-base font-black text-black truncate max-w-[200px]">{aff.entities?.display_name || 'Desconhecida'}</h4>
                        <p className="text-[10px] font-mono font-bold text-[#A0A0A0] uppercase mt-1">@{aff.entities?.slug}</p>
                      </div>
                    </div>
                    <span className={`text-[9px] font-black px-2.5 py-1 rounded uppercase tracking-[0.2em] ${isExpired ? 'bg-[#A0A0A0]/10 text-[#A0A0A0] border border-[#A0A0A0]/20' : aff.status === 'active' ? 'bg-[#FAFAFA] text-black border border-[#F2F2F2]' : 'bg-[#B6192E]/10 text-[#B6192E] border border-[#B6192E]/20'}`}>
                      {isExpired ? 'EXPIRADO' : aff.status}
                    </span>
                  </div>

                  <div className="py-6 grid grid-cols-2 gap-4 border-b border-[#F2F2F2] pl-2">
                    <div><span className="block text-[9px] font-bold text-[#A0A0A0] uppercase tracking-widest mb-1">Função / Cargo</span><span className="text-xs font-black text-black uppercase tracking-widest">{aff.association_data?.job_title || 'Membro'}</span></div>
                    <div><span className="block text-[9px] font-bold text-[#A0A0A0] uppercase tracking-widest mb-1">Hierarquia</span><span className="text-xs font-black text-black uppercase tracking-widest">{aff.affiliation_role}</span></div>
                    <div><span className="block text-[9px] font-bold text-[#A0A0A0] uppercase tracking-widest mb-1">Validade Automática</span><span className={`text-xs font-black uppercase tracking-widest ${isExpired ? 'text-[#B6192E]' : 'text-black'}`}>{safeFormatDate(aff.expires_at)}</span></div>
                  </div>

                  <div className="pt-6 pb-7 pl-2">
                    <span className="block text-[9px] font-bold text-[#A0A0A0] uppercase tracking-widest mb-3.5">Benefícios Ativos</span>
                    {hasBenefits ? (
                      <div className="flex flex-wrap gap-2.5">
                        {safeBenefits.map((bId: string) => {
                          const benDef = orgBenefitsList.find((def:any) => def.id === bId);
                          const Icon = BENEFIT_ICONS[benDef?.icon_key || ''] || BENEFIT_ICONS['default'];
                          return (
                            <span key={bId} className="flex items-center gap-2 px-3.5 py-2 border border-[#F2F2F2] bg-[#FAFAFA] rounded-[6px] text-[10px] font-bold text-[#545454]">
                              <Icon className="w-4 h-4 text-black" /> {benDef?.label || bId}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-[#A0A0A0] italic">Nenhum benefício extra provisionado.</span>
                    )}
                  </div>

                  <div className="flex gap-3 mt-auto pl-2">
                    <HzButton className="flex-1 bg-white border border-[#F2F2F2] hover:border-black text-black text-[9px] font-black uppercase tracking-widest py-3 rounded-[8px] transition-all">Gerir</HzButton>
                    <HzButton onClick={() => handleRevoke(aff.id, aff.entities?.display_name)} className="flex items-center justify-center gap-2 px-6 bg-transparent text-[#B6192E] hover:bg-[#B6192E] hover:text-white border border-[#B6192E]/30 hover:border-[#B6192E] text-[10px] font-black uppercase tracking-widest rounded-[8px] transition-all"><TrashIcon className="w-4 h-4" /></HzButton>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}