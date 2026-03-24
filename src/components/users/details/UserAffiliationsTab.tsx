'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { HzButton, HzSkeleton, HzInput } from '@/components/ui';
import { BuildingOfficeIcon, TrashIcon, LinkIcon, MagnifyingGlassIcon, FunnelIcon, GiftIcon, ShieldCheckIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface UserAffiliationsTabProps { userId: string; }

// Catálogo de Benefícios Rico
const AVAILABLE_BENEFITS = [
  { id: 'vip_access', label: 'Acesso VIP', desc: 'Isenção de restrições de base e limites de uso.', icon: ShieldCheckIcon },
  { id: 'fee_waiver', label: 'Isenção de Taxas', desc: 'Zero fee em transações financeiras internas.', icon: GiftIcon },
  { id: 'priority_support', label: 'Suporte Prioritário', desc: 'Canal direto 24/7 com SLA de resposta de 1h.', icon: ClockIcon }
];

// Níveis de Hierarquia
const ROLES = [
  { id: 'member', label: 'Membro Base', desc: 'Acesso padrão aos recursos do Hub.' },
  { id: 'finance', label: 'Gestor Financeiro', desc: 'Controlo de faturas, limites e pagamentos.' },
  { id: 'admin', label: 'Administrador', desc: 'Controlo total e gestão de utilizadores da Org.' }
];

// Tradutor de Erros do PostgreSQL
const parseSupabaseError = (error: any) => {
  if (error.code === '42501') return "Bloqueio de Segurança (RLS). O painel não tem permissão de escrita nesta tabela.";
  if (error.code === '23503') return "Inconsistência: A organização ou a identidade foi apagada.";
  if (error.code === '23505') return "Vínculo Duplicado. Esta identidade já possui afiliação com este Hub.";
  if (error.code === '22P02') return "Formato de ID inválido.";
  return error.message || "Erro de comunicação com o Core.";
};

export function UserAffiliationsTab({ userId }: UserAffiliationsTabProps) {
  const [affiliations, setAffiliations] = useState<any[]>([]);
  // Agora buscamos logo_url e metadata para ter a cor da marca e a imagem no carrossel
  const [availableOrgs, setAvailableOrgs] = useState<{id: string, display_name: string, slug: string, logo_url: string, metadata: any}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filtros da Listagem
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Estados do Wizard de Vínculo
  const [isAdding, setIsAdding] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState('');
  const [selectedRole, setSelectedRole] = useState('member');
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([]);
  const [expirationDate, setExpirationDate] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState<{title: string, msg: string} | null>(null);

  const loadData = async () => {
    setIsLoading(true); setActionError(null);
    
    // Busca Afiliações
    const { data: affData } = await supabase
      .from('affiliations')
      .select(`id, affiliation_role, status, expires_at, association_data, entities ( id, display_name, slug, logo_url, metadata )`)
      .eq('profile_id', userId);
    if (affData) setAffiliations(affData);

    // Busca Organizações com dados ricos
    const { data: orgData } = await supabase.from('entities').select('id, display_name, slug, logo_url, metadata').eq('status', 'active');
    if (orgData) setAvailableOrgs(orgData);
    
    setIsLoading(false);
  };

  useEffect(() => { loadData(); }, [userId]);

  const toggleBenefit = (benefitId: string) => {
    setSelectedBenefits(prev => prev.includes(benefitId) ? prev.filter(b => b !== benefitId) : [...prev, benefitId]);
  };

  const handleAddAffiliation = async () => {
    if (!selectedEntity) return;
    setActionError(null); setIsSaving(true);

    const payload = {
      profile_id: userId,
      entity_id: selectedEntity,
      affiliation_role: selectedRole,
      status: 'active',
      expires_at: expirationDate ? new Date(expirationDate).toISOString() : null,
      association_data: { benefits: selectedBenefits }
    };

    const { error } = await supabase.from('affiliations').insert(payload);

    if (error) {
      setActionError({ title: "Falha ao Injetar Vínculo", msg: parseSupabaseError(error) });
    } else {
      setIsAdding(false); setSelectedEntity(''); setSelectedRole('member'); setSelectedBenefits([]); setExpirationDate('');
      await loadData();
    }
    setIsSaving(false);
  };

  const handleRevoke = async (id: string, orgName: string) => {
    if(!confirm(`Revogar o acesso definitivo a ${orgName}?`)) return;
    setActionError(null);
    const { error } = await supabase.from('affiliations').delete().eq('id', id);
    if (error) setActionError({ title: "Falha na Revogação", msg: parseSupabaseError(error) });
    else await loadData();
  };

  const filteredAffiliations = useMemo(() => {
    return affiliations.filter(aff => {
      const matchSearch = aff.entities?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) || aff.entities?.slug?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'all' || aff.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [affiliations, searchTerm, statusFilter]);

  if (isLoading) return <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><HzSkeleton className="h-64 w-full rounded-[12px]" /><HzSkeleton className="h-64 w-full rounded-[12px]" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* Alertas de Erro Tratados */}
      {actionError && (
        <div className="p-4 border border-[#B6192E] bg-[#B6192E]/5 rounded-[8px] flex justify-between items-start shadow-sm">
          <div>
            <h4 className="text-xs font-black text-[#B6192E] uppercase tracking-widest">{actionError.title}</h4>
            <p className="text-[11px] font-bold text-[#B6192E]/80 mt-1">{actionError.msg}</p>
          </div>
          <HzButton variant="ghost" onClick={() => setActionError(null)} className="text-[#B6192E] text-[10px] font-bold uppercase hover:bg-[#B6192E]/10 px-3 py-1.5 rounded transition-colors">Fechar</HzButton>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#F2F2F2] pb-6">
        <div>
          <h3 className="text-3xl font-black text-black tracking-tight">Painel de Afiliações</h3>
          <p className="text-xs font-bold text-[#A0A0A0] uppercase tracking-widest mt-2">Gestão de Autorizações B2B e Benefícios.</p>
        </div>
        {!isAdding && (
          <HzButton onClick={() => setIsAdding(true)} className="bg-black text-white hover:bg-[#B6192E] px-6 py-3 rounded-[8px] text-[10px] font-black uppercase tracking-widest transition-all shadow-sm">
            <span className="flex items-center gap-2"><LinkIcon className="w-4 h-4" /> NOVO VÍNCULO</span>
          </HzButton>
        )}
      </div>

      {/* EXPERIÊNCIA DE CRIAÇÃO PREMIUM (CARROSSEL E CARDS) */}
      {isAdding && (
        <div className="border border-[#F2F2F2] bg-[#FAFAFA] rounded-[16px] shadow-sm overflow-hidden animate-in slide-in-from-top-4">
          <div className="p-8 space-y-10">
            
            {/* Passo 1: Seleção da Organização (Carrossel de Cards) */}
            <div>
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h4 className="text-sm font-black text-black uppercase tracking-widest">1. Selecione o Hub Corporativo</h4>
                  <p className="text-[10px] text-[#A0A0A0] font-medium mt-1 uppercase">Deslize para ver todas as organizações ativas.</p>
                </div>
              </div>
              
              <div className="flex overflow-x-auto gap-4 pb-4 snap-x custom-scrollbar">
                {availableOrgs.length === 0 ? (
                   <p className="text-xs text-[#A0A0A0] italic">Nenhuma organização disponível para vincular.</p>
                ) : (
                  availableOrgs.map(org => {
                    const isSelected = selectedEntity === org.id;
                    const primaryColor = org.metadata?.branding?.primary_color || '#B6192E';
                    
                    return (
                      <div 
                        key={org.id} 
                        onClick={() => setSelectedEntity(org.id)}
                        className={`snap-start flex-shrink-0 w-60 p-5 rounded-[12px] border-2 cursor-pointer transition-all duration-300 relative bg-white flex flex-col items-center text-center ${isSelected ? 'shadow-md scale-[1.02]' : 'border-[#F2F2F2] hover:border-black/20 hover:bg-[#FAFAFA]'}`}
                        style={{ borderColor: isSelected ? primaryColor : undefined }}
                      >
                        {isSelected && <div className="absolute top-3 right-3"><CheckCircleIcon className="w-5 h-5" style={{ color: primaryColor }} /></div>}
                        
                        <div className="w-16 h-16 rounded-[12px] border border-[#F2F2F2] bg-[#FAFAFA] flex items-center justify-center overflow-hidden mb-4 shadow-sm">
                          {org.logo_url ? <img src={org.logo_url} className="w-full h-full object-cover" /> : <BuildingOfficeIcon className="w-8 h-8 text-[#A0A0A0]" />}
                        </div>
                        <h5 className="text-sm font-black text-black leading-tight line-clamp-1">{org.display_name}</h5>
                        <p className="text-[10px] font-mono text-[#A0A0A0] mt-1">@{org.slug}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Passos 2 e 3 (Aparecem apenas após selecionar o Hub) */}
            {selectedEntity && (
              <div className="space-y-10 border-t border-[#F2F2F2] pt-10 animate-in fade-in duration-500">
                
                {/* Passo 2: Cargo e Expiração */}
                <div>
                  <h4 className="text-sm font-black text-black uppercase tracking-widest mb-4">2. Definição de Acesso</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {ROLES.map(role => (
                      <div 
                        key={role.id} onClick={() => setSelectedRole(role.id)}
                        className={`p-4 rounded-[12px] border-2 cursor-pointer transition-all ${selectedRole === role.id ? 'border-black bg-black text-white shadow-md' : 'border-[#F2F2F2] bg-white hover:border-black/30'}`}
                      >
                        <h5 className={`text-xs font-black uppercase tracking-widest ${selectedRole === role.id ? 'text-white' : 'text-black'}`}>{role.label}</h5>
                        <p className={`text-[10px] mt-2 font-medium leading-relaxed ${selectedRole === role.id ? 'text-gray-300' : 'text-[#A0A0A0]'}`}>{role.desc}</p>
                      </div>
                    ))}
                  </div>
                  <div className="max-w-xs">
                    <HzInput type="date" label="Data de Expiração Automática (Opcional)" value={expirationDate} onChange={e => setExpirationDate(e.target.value)} />
                  </div>
                </div>

                {/* Passo 3: Benefícios */}
                <div>
                  <h4 className="text-sm font-black text-black uppercase tracking-widest mb-4">3. Atribuição de Benefícios</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {AVAILABLE_BENEFITS.map(benefit => {
                      const isChecked = selectedBenefits.includes(benefit.id);
                      return (
                        <div 
                          key={benefit.id} onClick={() => toggleBenefit(benefit.id)}
                          className={`p-4 rounded-[12px] border-2 cursor-pointer transition-all flex gap-4 ${isChecked ? 'border-black bg-white shadow-sm' : 'border-[#F2F2F2] bg-white hover:border-black/30'}`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isChecked ? 'bg-black text-white' : 'bg-[#FAFAFA] text-[#A0A0A0]'}`}>
                            <benefit.icon className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="text-[11px] font-black text-black uppercase tracking-widest">{benefit.label}</h5>
                            <p className="text-[9px] font-medium text-[#A0A0A0] mt-1 leading-tight">{benefit.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}
          </div>

          <div className="flex justify-end gap-4 p-6 bg-white border-t border-[#F2F2F2]">
            <HzButton variant="ghost" onClick={() => setIsAdding(false)} className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest hover:text-black">Cancelar</HzButton>
            <HzButton onClick={handleAddAffiliation} disabled={isSaving || !selectedEntity} className="bg-black text-white text-[10px] font-black uppercase tracking-widest px-8 py-3 rounded-[8px] hover:bg-[#B6192E] transition-all shadow-sm">
              {isSaving ? 'A PROCESSAR...' : 'CONFIRMAR VÍNCULO'}
            </HzButton>
          </div>
        </div>
      )}

      {/* ÁREA DE LISTAGEM DE VÍNCULOS ATUAIS */}
      {!isAdding && affiliations.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 border border-[#F2F2F2] rounded-[12px] shadow-sm">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#A0A0A0]" />
            <input type="text" placeholder="Buscar no grafo..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 border border-[#F2F2F2] bg-[#FAFAFA] rounded-[8px] text-xs font-bold text-black focus:outline-none focus:border-black transition-colors" />
          </div>
          <div className="relative w-full sm:w-56">
            <FunnelIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#A0A0A0]" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full pl-11 pr-4 py-3 border border-[#F2F2F2] bg-[#FAFAFA] rounded-[8px] text-[10px] font-bold uppercase tracking-widest text-black focus:outline-none focus:border-black appearance-none cursor-pointer">
              <option value="all">Todos os Status</option>
              <option value="active">Ativos</option>
              <option value="pending">Pendentes</option>
            </select>
          </div>
        </div>
      )}

      {/* GRID DE CARDS B2B (Listagem de vínculos existentes) */}
      {!isAdding && (
        affiliations.length === 0 ? (
          <div className="p-20 text-center border border-[#F2F2F2] border-dashed rounded-[16px] bg-[#FAFAFA] flex flex-col items-center justify-center">
            <BuildingOfficeIcon className="w-16 h-16 text-[#E0E0E0] mb-4" />
            <h4 className="text-sm font-black text-black uppercase tracking-widest">Identidade Independente</h4>
            <p className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest mt-2 max-w-sm">Esta conta não possui autorização ou vínculo com nenhum hub corporativo.</p>
          </div>
        ) : filteredAffiliations.length === 0 ? (
          <div className="p-10 text-center text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest">A busca não retornou resultados.</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAffiliations.map((aff) => {
              const hasBenefits = aff.association_data?.benefits && aff.association_data.benefits.length > 0;
              const isExpired = aff.expires_at && new Date(aff.expires_at) < new Date();
              const brandColor = aff.entities?.metadata?.branding?.primary_color || '#000000';

              return (
                <div key={aff.id} className="bg-white border border-[#F2F2F2] rounded-[16px] p-6 flex flex-col justify-between overflow-hidden relative shadow-sm hover:shadow-md transition-all group">
                  <div className="absolute top-0 left-0 w-1.5 h-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: brandColor }}></div>
                  
                  {/* Cabeçalho */}
                  <div className="flex justify-between items-start border-b border-[#F2F2F2] pb-5 pl-2">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-[12px] border border-[#F2F2F2] bg-[#FAFAFA] flex items-center justify-center overflow-hidden shadow-sm">
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

                  {/* Informações Centrais */}
                  <div className="py-5 grid grid-cols-2 gap-4 border-b border-[#F2F2F2] pl-2">
                    <div>
                      <span className="block text-[9px] font-bold text-[#A0A0A0] uppercase tracking-widest mb-1">Nível de Acesso</span>
                      <span className="text-xs font-black text-black uppercase tracking-widest">{aff.affiliation_role}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-[#A0A0A0] uppercase tracking-widest mb-1">Validade</span>
                      <span className={`text-xs font-black uppercase tracking-widest ${isExpired ? 'text-[#B6192E]' : 'text-black'}`}>
                        {aff.expires_at ? new Date(aff.expires_at).toLocaleDateString('pt-PT') : 'Vitalício'}
                      </span>
                    </div>
                  </div>

                  {/* Benefícios */}
                  <div className="pt-5 pb-6 pl-2">
                    <span className="block text-[9px] font-bold text-[#A0A0A0] uppercase tracking-widest mb-3">Motor de Benefícios Ativos</span>
                    {hasBenefits ? (
                      <div className="flex flex-wrap gap-2">
                        {aff.association_data.benefits.map((b: string) => {
                          const benDef = AVAILABLE_BENEFITS.find(def => def.id === b);
                          return (
                            <span key={b} className="flex items-center gap-1.5 px-3 py-1.5 border border-[#F2F2F2] bg-[#FAFAFA] rounded-[6px] text-[10px] font-bold text-[#545454]">
                              {benDef ? <benDef.icon className="w-3.5 h-3.5 text-black" /> : <GiftIcon className="w-3.5 h-3.5 text-black" />}
                              {benDef ? benDef.label : b}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-[#A0A0A0] italic">Nenhum benefício extra associado.</span>
                    )}
                  </div>

                  {/* Rodapé e Ações */}
                  <div className="flex gap-3 mt-auto pl-2">
                    <HzButton className="flex-1 bg-[#FAFAFA] border border-[#F2F2F2] text-black hover:border-black text-[9px] font-bold uppercase tracking-widest py-3 rounded-[8px] transition-all">
                      Gerir Permissões
                    </HzButton>
                    <HzButton onClick={() => handleRevoke(aff.id, aff.entities?.display_name)} className="flex items-center justify-center gap-2 px-5 bg-transparent text-[#B6192E] hover:bg-[#B6192E] hover:text-white border border-[#B6192E]/30 hover:border-[#B6192E] text-[10px] font-bold uppercase tracking-widest rounded-[8px] transition-all shadow-sm">
                      <TrashIcon className="w-4 h-4" />
                    </HzButton>
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