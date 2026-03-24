'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { HzButton, HzSkeleton, HzSelect, HzInput } from '@/components/ui';
import { BuildingOfficeIcon, TrashIcon, LinkIcon, MagnifyingGlassIcon, FunnelIcon, GiftIcon, ShieldCheckIcon, ClockIcon } from '@heroicons/react/24/outline';

interface UserAffiliationsTabProps { userId: string; }

// Catálogo de Benefícios Mockados (Pode puxar do DB no futuro)
const AVAILABLE_BENEFITS = [
  { id: 'vip_access', label: 'Acesso VIP', icon: ShieldCheckIcon },
  { id: 'fee_waiver', label: 'Isenção de Taxas', icon: GiftIcon },
  { id: 'priority_support', label: 'Suporte Prioritário 24/7', icon: ClockIcon }
];

// Tradutor de Erros Nativos do PostgreSQL / Supabase
const parseSupabaseError = (error: any) => {
  console.error("[RAW ERROR]", error);
  if (error.code === '42501') return "Bloqueio de Segurança (RLS). O painel não tem permissão de escrita nesta tabela. Rode a query de liberação no SQL Editor.";
  if (error.code === '23503') return "Inconsistência de Dados. A organização ou a identidade selecionada foi apagada ou não existe.";
  if (error.code === '23505') return "Vínculo Duplicado. Esta identidade já possui uma afiliação com esta organização.";
  if (error.code === '22P02') return "Formato de ID inválido. Verifique se a organização selecionada é válida.";
  return error.message || "Erro de comunicação desconhecido com o Core.";
};

export function UserAffiliationsTab({ userId }: UserAffiliationsTabProps) {
  const [affiliations, setAffiliations] = useState<any[]>([]);
  const [availableOrgs, setAvailableOrgs] = useState<{id: string, display_name: string, slug: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Controles de UI (Busca e Filtro)
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Controles do Formulário de Vínculo
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
      .select(`id, affiliation_role, status, expires_at, association_data, entities ( id, display_name, slug, logo_url )`)
      .eq('profile_id', userId);
    
    if (affData) setAffiliations(affData);

    // Busca Organizações
    const { data: orgData } = await supabase.from('entities').select('id, display_name, slug').eq('status', 'active');
    if (orgData) setAvailableOrgs(orgData);
    
    setIsLoading(false);
  };

  useEffect(() => { loadData(); }, [userId]);

  const toggleBenefit = (benefitId: string) => {
    setSelectedBenefits(prev => prev.includes(benefitId) ? prev.filter(b => b !== benefitId) : [...prev, benefitId]);
  };

  const handleAddAffiliation = async () => {
    if (!selectedEntity) return;
    setActionError(null);
    setIsSaving(true);

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
      setIsAdding(false);
      setSelectedEntity('');
      setSelectedRole('member');
      setSelectedBenefits([]);
      setExpirationDate('');
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

  // Motor de Filtro Local
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
      
      {/* EXIBIÇÃO DE ERROS TRATADOS */}
      {actionError && (
        <div className="p-4 border border-[#B6192E] bg-[#B6192E]/5 rounded-[8px] flex justify-between items-start">
          <div>
            <h4 className="text-xs font-black text-[#B6192E] uppercase tracking-widest">{actionError.title}</h4>
            <p className="text-[11px] font-bold text-[#B6192E]/80 mt-1">{actionError.msg}</p>
          </div>
          <HzButton variant="ghost" onClick={() => setActionError(null)} className="text-[#B6192E] text-[10px] font-bold uppercase hover:bg-[#B6192E]/10 px-2 py-1 rounded">Fechar</HzButton>
        </div>
      )}

      {/* HEADER E AÇÕES */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#F2F2F2] pb-6">
        <div>
          <h3 className="text-2xl font-black text-black tracking-tight">Painel de Afiliações</h3>
          <p className="text-xs font-bold text-[#A0A0A0] uppercase tracking-widest mt-2">Gestão de Autorizações B2B da Identidade.</p>
        </div>
        {!isAdding && (
          <HzButton onClick={() => setIsAdding(true)} className="bg-black text-white hover:bg-[#B6192E] px-6 py-2.5 rounded text-[10px] font-bold uppercase tracking-widest transition-colors shadow-sm whitespace-nowrap">
            <span className="flex items-center gap-2"><LinkIcon className="w-3.5 h-3.5" /> NOVO VÍNCULO</span>
          </HzButton>
        )}
      </div>

      {/* ÁREA DE CRIAÇÃO (FORMULÁRIO RICO) */}
      {isAdding && (
        <div className="p-8 border border-black bg-[#FAFAFA] rounded-[12px] space-y-8 animate-in slide-in-from-top-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-black"></div>
          
          <div>
            <h4 className="text-sm font-black text-black uppercase tracking-widest">Injeção de Vínculo Corporativo</h4>
            <p className="text-[10px] text-[#A0A0A0] font-medium mt-1 uppercase">Configure as regras de acesso e benefícios do utilizador na organização.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <HzSelect label="Organização Hub *" options={[{label: 'Selecione o Hub...', value: ''}, ...availableOrgs.map(o => ({label: `${o.display_name} (${o.slug})`, value: o.id}))]} value={selectedEntity} onChange={val => setSelectedEntity(val)} />
              <div className="grid grid-cols-2 gap-4">
                <HzSelect label="Cargo Hierárquico *" options={[{label: 'Membro Base', value: 'member'}, {label: 'Administrador', value: 'admin'}, {label: 'Financeiro', value: 'finance'}]} value={selectedRole} onChange={val => setSelectedRole(val)} />
                <HzInput type="date" label="Data de Expiração (Opcional)" value={expirationDate} onChange={e => setExpirationDate(e.target.value)} />
              </div>
            </div>

            <div className="bg-white p-5 border border-[#F2F2F2] rounded-[8px]">
              <label className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest block mb-4">Atribuição de Benefícios</label>
              <div className="space-y-3">
                {AVAILABLE_BENEFITS.map(benefit => (
                  <label key={benefit.id} className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={selectedBenefits.includes(benefit.id)} onChange={() => toggleBenefit(benefit.id)} className="w-4 h-4 accent-black" />
                    <span className="flex items-center gap-2 text-xs font-bold text-[#545454] group-hover:text-black transition-colors">
                      <benefit.icon className="w-4 h-4" /> {benefit.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-[#F2F2F2]">
            <HzButton variant="ghost" onClick={() => setIsAdding(false)} className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest hover:text-black">Cancelar</HzButton>
            <HzButton onClick={handleAddAffiliation} disabled={isSaving || !selectedEntity} className="bg-black text-white text-[10px] font-bold uppercase tracking-widest px-8 py-2.5 rounded hover:bg-[#B6192E] transition-colors">
              {isSaving ? 'A INJETAR...' : 'CONFIRMAR VÍNCULO'}
            </HzButton>
          </div>
        </div>
      )}

      {/* BARRA DE FERRAMENTAS (BUSCA E FILTROS) */}
      {!isAdding && affiliations.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#A0A0A0]" />
            <input type="text" placeholder="Buscar por organização ou slug..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2.5 border border-[#F2F2F2] bg-[#FAFAFA] rounded-[8px] text-xs font-bold text-black focus:outline-none focus:border-black transition-colors" />
          </div>
          <div className="relative w-full sm:w-48">
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#A0A0A0]" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full pl-9 pr-4 py-2.5 border border-[#F2F2F2] bg-[#FAFAFA] rounded-[8px] text-[10px] font-bold uppercase tracking-widest text-black focus:outline-none focus:border-black appearance-none cursor-pointer">
              <option value="all">Todos os Status</option>
              <option value="active">Ativos</option>
              <option value="pending">Pendentes</option>
              <option value="suspended">Suspensos</option>
            </select>
          </div>
        </div>
      )}

      {/* GRID DE CARDS PREMIUM */}
      {affiliations.length === 0 ? (
        <div className="p-16 text-center border border-[#F2F2F2] border-dashed rounded-[16px] bg-[#FAFAFA] flex flex-col items-center justify-center">
          <BuildingOfficeIcon className="w-12 h-12 text-[#F2F2F2] mb-4" />
          <h4 className="text-sm font-black text-black uppercase tracking-widest">Identidade Independente</h4>
          <p className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest mt-2">Este utilizador não possui vínculos corporativos no momento.</p>
        </div>
      ) : filteredAffiliations.length === 0 ? (
        <div className="p-10 text-center text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest">Nenhuma organização encontrada com os filtros aplicados.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAffiliations.map((aff) => {
            const hasBenefits = aff.association_data?.benefits && aff.association_data.benefits.length > 0;
            const isExpired = aff.expires_at && new Date(aff.expires_at) < new Date();

            return (
              <div key={aff.id} className="bg-white border border-[#F2F2F2] rounded-[12px] p-6 flex flex-col justify-between overflow-hidden relative shadow-sm hover:border-black transition-colors">
                
                {/* Header do Card */}
                <div className="flex justify-between items-start border-b border-[#F2F2F2] pb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-[8px] border border-[#F2F2F2] bg-[#FAFAFA] flex items-center justify-center overflow-hidden">
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

                {/* Corpo do Card: Dados de Vínculo */}
                <div className="py-5 grid grid-cols-2 gap-4 border-b border-[#F2F2F2]">
                  <div>
                    <span className="block text-[9px] font-bold text-[#A0A0A0] uppercase tracking-widest mb-1">Role Hierárquica</span>
                    <span className="text-xs font-black text-black uppercase tracking-widest">{aff.affiliation_role}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-[#A0A0A0] uppercase tracking-widest mb-1">Validade</span>
                    <span className={`text-xs font-black uppercase tracking-widest ${isExpired ? 'text-[#B6192E]' : 'text-black'}`}>
                      {aff.expires_at ? new Date(aff.expires_at).toLocaleDateString('pt-PT') : 'Vitalício'}
                    </span>
                  </div>
                </div>

                {/* Corpo do Card: Benefícios (JSONB) */}
                <div className="pt-5 pb-6">
                  <span className="block text-[9px] font-bold text-[#A0A0A0] uppercase tracking-widest mb-3">Benefícios Ativos</span>
                  {hasBenefits ? (
                    <div className="flex flex-wrap gap-2">
                      {aff.association_data.benefits.map((b: string) => {
                        const benDef = AVAILABLE_BENEFITS.find(def => def.id === b);
                        return (
                          <span key={b} className="flex items-center gap-1.5 px-2.5 py-1 border border-[#F2F2F2] bg-[#FAFAFA] rounded-[4px] text-[10px] font-bold text-[#545454]">
                            {benDef ? <benDef.icon className="w-3 h-3" /> : <GiftIcon className="w-3 h-3" />}
                            {benDef ? benDef.label : b}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold text-[#A0A0A0] italic">Nenhum benefício associado.</span>
                  )}
                </div>

                {/* Footer de Ações (Fixo na Base) */}
                <div className="flex gap-3 mt-auto">
                  <HzButton className="flex-1 bg-[#FAFAFA] border border-[#F2F2F2] text-black hover:border-black text-[9px] font-bold uppercase tracking-widest py-2.5 rounded transition-all">
                    Gerir Benefícios
                  </HzButton>
                  <HzButton onClick={() => handleRevoke(aff.id, aff.entities?.display_name)} className="flex items-center justify-center gap-2 px-4 bg-transparent text-[#B6192E] hover:bg-[#B6192E] hover:text-white border border-[#B6192E]/30 hover:border-[#B6192E] text-[10px] font-bold uppercase tracking-widest rounded transition-all">
                    <TrashIcon className="w-3.5 h-3.5" />
                  </HzButton>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}