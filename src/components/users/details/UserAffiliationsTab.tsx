'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { HzButton, HzSkeleton, HzSelect } from '@/components/ui';
import { BuildingOfficeIcon, TrashIcon, LinkIcon } from '@heroicons/react/24/outline';

interface UserAffiliationsTabProps { userId: string; }

export function UserAffiliationsTab({ userId }: UserAffiliationsTabProps) {
  const [affiliations, setAffiliations] = useState<any[]>([]);
  const [availableOrgs, setAvailableOrgs] = useState<{id: string, display_name: string, slug: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState('');
  const [selectedRole, setSelectedRole] = useState('member');
  const [isSaving, setIsSaving] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true); setFetchError(null);
    const { data: affData } = await supabase.from('affiliations').select(`id, affiliation_role, status, entities ( id, display_name, slug, logo_url )`).eq('profile_id', userId);
    if (affData) setAffiliations(affData);

    const { data: orgData, error: orgError } = await supabase.from('entities').select('id, display_name, slug');
    if (orgError) setFetchError("Acesso às organizações bloqueado.");
    else setAvailableOrgs(orgData || []);
    setIsLoading(false);
  };

  useEffect(() => { loadData(); }, [userId]);

  const handleAddAffiliation = async () => {
    if (!selectedEntity) return;
    if (affiliations.some(a => a.entities?.id === selectedEntity)) return alert("O vínculo já existe.");

    setIsSaving(true);
    const { error } = await supabase.from('affiliations').insert({ profile_id: userId, entity_id: selectedEntity, affiliation_role: selectedRole, status: 'active' });
    if (error) {
      console.error(error); alert("Falha ao criar vínculo.");
    } else { 
      setIsAdding(false); setSelectedEntity(''); await loadData(); 
    }
    setIsSaving(false);
  };

  const handleRevoke = async (id: string, orgName: string) => {
    if(!confirm(`Tem a certeza que deseja revogar o acesso à organização ${orgName}?`)) return;
    await supabase.from('affiliations').delete().eq('id', id);
    await loadData();
  };

  if (isLoading) return <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><HzSkeleton className="h-40 w-full rounded-[12px]" /><HzSkeleton className="h-40 w-full rounded-[12px]" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in">
      {fetchError && <div className="p-3 border border-[#B6192E] text-[#B6192E] text-xs font-bold uppercase tracking-widest rounded bg-[#B6192E]/5">{fetchError}</div>}

      <div className="flex justify-between items-end border-b border-[#F2F2F2] pb-6">
        <div>
          <h3 className="text-2xl font-black text-black tracking-tight">Grafo de Afiliações</h3>
          <p className="text-xs font-bold text-[#A0A0A0] uppercase tracking-widest mt-2">Acessos corporativos vinculados a esta identidade.</p>
        </div>
        {!isAdding && (
          <HzButton onClick={() => setIsAdding(true)} className="bg-black text-white hover:bg-[#B6192E] px-6 py-2.5 rounded text-[10px] font-bold uppercase tracking-widest transition-colors shadow-sm">
            <span className="flex items-center gap-2"><LinkIcon className="w-3.5 h-3.5" /> NOVO VÍNCULO</span>
          </HzButton>
        )}
      </div>

      {isAdding && (
        <div className="p-8 border border-black bg-[#FAFAFA] rounded-[12px] space-y-6 animate-in slide-in-from-top-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-black"></div>
          <div>
            <h4 className="text-sm font-black text-black uppercase tracking-widest">Acrescentar Vínculo B2B</h4>
            <p className="text-[10px] text-[#A0A0A0] font-medium mt-1 uppercase">Selecione o Hub Corporativo e a permissão do utilizador.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <HzSelect label="Organização" options={[{label: 'Selecione o Hub...', value: ''}, ...availableOrgs.map(o => ({label: `${o.display_name} (${o.slug})`, value: o.id}))]} value={selectedEntity} onChange={val => setSelectedEntity(val)} />
            <HzSelect label="Cargo Hierárquico" options={[{label: 'Membro Base', value: 'member'}, {label: 'Administrador (Admin)', value: 'admin'}, {label: 'Gestor Financeiro', value: 'finance'}]} value={selectedRole} onChange={val => setSelectedRole(val)} />
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t border-[#F2F2F2]">
            <HzButton variant="ghost" onClick={() => setIsAdding(false)} className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest hover:text-black">Cancelar</HzButton>
            <HzButton onClick={handleAddAffiliation} disabled={isSaving || !selectedEntity} className="bg-black text-white text-[10px] font-bold uppercase tracking-widest px-8 py-2.5 rounded hover:bg-[#B6192E] transition-colors">
              {isSaving ? 'A INJETAR...' : 'CONFIRMAR VÍNCULO'}
            </HzButton>
          </div>
        </div>
      )}

      {affiliations.length === 0 ? (
        <div className="p-16 text-center border border-[#F2F2F2] border-dashed rounded-[16px] bg-[#FAFAFA] flex flex-col items-center justify-center">
          <BuildingOfficeIcon className="w-12 h-12 text-[#F2F2F2] mb-4" />
          <h4 className="text-sm font-black text-black uppercase tracking-widest">Identidade Independente</h4>
          <p className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest mt-2">Este utilizador não possui vínculos corporativos no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {affiliations.map((aff) => (
            <div key={aff.id} className="group relative bg-white border border-[#F2F2F2] rounded-[16px] p-6 hover:border-black hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden min-h-[180px]">
              
              {/* Cabeçalho do Card */}
              <div className="flex justify-between items-start z-10">
                <div className="w-12 h-12 rounded-[8px] border border-[#F2F2F2] bg-[#FAFAFA] flex items-center justify-center overflow-hidden shadow-sm">
                  {aff.entities?.logo_url ? <img src={aff.entities.logo_url} className="w-full h-full object-cover" /> : <BuildingOfficeIcon className="w-6 h-6 text-[#A0A0A0]" />}
                </div>
                <span className={`text-[8px] font-black px-2.5 py-1 rounded uppercase tracking-[0.2em] ${aff.status === 'active' ? 'bg-[#FAFAFA] text-black border border-[#F2F2F2]' : 'bg-[#B6192E]/10 text-[#B6192E] border border-[#B6192E]/20'}`}>
                  {aff.status}
                </span>
              </div>

              {/* Informação Org */}
              <div className="mt-6 z-10">
                <h4 className="text-lg font-black text-black leading-tight truncate">{aff.entities?.display_name || 'Desconhecida'}</h4>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest px-2 py-0.5 border border-[#F2F2F2] rounded bg-[#FAFAFA]">
                    {aff.entities?.slug}
                  </span>
                  <span className="w-1 h-1 bg-[#A0A0A0] rounded-full"></span>
                  <span className="text-[10px] font-black text-black uppercase tracking-widest">
                    {aff.affiliation_role}
                  </span>
                </div>
              </div>

              {/* Ações Visíveis em Hover */}
              <div className="absolute top-0 right-0 w-full h-full bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                <HzButton onClick={() => handleRevoke(aff.id, aff.entities?.display_name)} className="bg-transparent text-[#B6192E] hover:bg-[#B6192E] hover:text-white border border-[#B6192E] text-[10px] font-bold uppercase tracking-widest px-6 py-2.5 rounded transition-all flex items-center gap-2">
                  <TrashIcon className="w-4 h-4" /> REVOGAR ACESSO
                </HzButton>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}