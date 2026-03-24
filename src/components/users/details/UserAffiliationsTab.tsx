
'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { HzButton, HzSkeleton, HzSelect } from '@/components/ui';

interface UserAffiliationsTabProps {
  userId: string;
}

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
    setIsLoading(true);
    setFetchError(null);
    
    // 1. Busca as afiliações
    const { data: affData } = await supabase
      .from('affiliations')
      .select(`id, affiliation_role, status, entities ( id, display_name, slug, logo_url )`)
      .eq('profile_id', userId);
    if (affData) setAffiliations(affData);

    // 2. Busca Organizações (Removido o filtro de status para evitar que RLS oculte os dados)
    const { data: orgData, error: orgError } = await supabase.from('entities').select('id, display_name, slug');
    
    if (orgError) {
      console.error("Erro RLS Entidades:", orgError);
      setFetchError("Acesso às organizações bloqueado. Verifique o RLS.");
    } else {
      setAvailableOrgs(orgData || []);
    }

    setIsLoading(false);
  };

  useEffect(() => { loadData(); }, [userId]);

  const handleAddAffiliation = async () => {
    if (!selectedEntity) return;
    if (affiliations.some(a => a.entities?.id === selectedEntity)) return alert("Vínculo já existe.");

    setIsSaving(true);
    const { error } = await supabase.from('affiliations').insert({
      profile_id: userId, entity_id: selectedEntity, affiliation_role: selectedRole, status: 'active'
    });

    if (error) alert("Falha ao criar vínculo.");
    else { setIsAdding(false); setSelectedEntity(''); await loadData(); }
    setIsSaving(false);
  };

  const handleRevoke = async (id: string) => {
    if(!confirm("Revogar vínculo?")) return;
    await supabase.from('affiliations').delete().eq('id', id);
    await loadData();
  };

  if (isLoading) return <div className="space-y-4"><HzSkeleton className="h-16 w-full rounded" /><HzSkeleton className="h-16 w-full rounded" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in">
      {fetchError && <div className="p-3 border border-[#B6192E] text-[#B6192E] text-xs font-bold uppercase tracking-widest">{fetchError}</div>}

      <div className="border-b border-[#F2F2F2] pb-4 flex justify-between items-end">
        <div>
          <h3 className="text-xl font-black text-black tracking-tight">Grafo de Afiliações</h3>
          <p className="text-xs font-bold text-[#A0A0A0] uppercase tracking-widest mt-1">Organizações (B2B) vinculadas a esta Identidade.</p>
        </div>
        {!isAdding && (
          <HzButton onClick={() => setIsAdding(true)} className="bg-black text-white hover:bg-[#B6192E] px-6 py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-colors">
            + Adicionar Vínculo
          </HzButton>
        )}
      </div>

      {isAdding && (
        <div className="p-6 border border-[#F2F2F2] bg-white space-y-4 rounded">
          <h4 className="text-xs font-bold text-black uppercase tracking-widest">Novo Vínculo Corporativo</h4>
          <div className="grid grid-cols-2 gap-6">
            <HzSelect label="Organização Hub" options={[{label: 'Selecione...', value: ''}, ...availableOrgs.map(o => ({label: `${o.display_name} (${o.slug})`, value: o.id}))]} value={selectedEntity} onChange={val => setSelectedEntity(val)} />
            <HzSelect label="Cargo/Role" options={[{label: 'Membro Padrão', value: 'member'}, {label: 'Administrador Org', value: 'admin'}, {label: 'Gestor Financeiro', value: 'finance'}]} value={selectedRole} onChange={val => setSelectedRole(val)} />
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t border-[#F2F2F2]">
            <HzButton variant="ghost" onClick={() => setIsAdding(false)} className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest hover:text-black">Cancelar</HzButton>
            <HzButton onClick={handleAddAffiliation} disabled={isSaving || !selectedEntity} className="bg-black text-white text-[10px] font-bold uppercase tracking-widest px-8 py-2 rounded hover:bg-[#B6192E] transition-colors">
              {isSaving ? 'A gravar...' : 'Confirmar Vínculo'}
            </HzButton>
          </div>
        </div>
      )}

      {affiliations.length === 0 ? (
        <div className="p-12 text-center border border-[#F2F2F2] bg-[#FAFAFA] rounded">
          <p className="text-xs font-bold text-[#A0A0A0] uppercase tracking-widest">Esta identidade opera de forma independente.</p>
        </div>
      ) : (
        <div className="border border-[#F2F2F2] rounded bg-white overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#FAFAFA] border-b border-[#F2F2F2]">
                <th className="p-4 text-[9px] font-bold text-[#A0A0A0] uppercase tracking-widest">Hub Corporativo</th>
                <th className="p-4 text-[9px] font-bold text-[#A0A0A0] uppercase tracking-widest">Role</th>
                <th className="p-4 text-[9px] font-bold text-[#A0A0A0] uppercase tracking-widest">Status</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2F2F2]">
              {affiliations.map((aff) => (
                <tr key={aff.id} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded border border-black bg-white flex items-center justify-center overflow-hidden">
                        {aff.entities?.logo_url ? <img src={aff.entities.logo_url} className="w-full h-full object-cover" /> : <span className="text-[9px] font-black text-black">ORG</span>}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-black">{aff.entities?.display_name || 'Desconhecida'}</h4>
                        <p className="text-[10px] font-mono text-[#A0A0A0] uppercase">{aff.entities?.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-[10px] font-bold text-black uppercase tracking-widest">{aff.affiliation_role}</td>
                  <td className="p-4"><span className={`text-[9px] font-bold px-2 py-1 rounded uppercase tracking-widest ${aff.status === 'active' ? 'border border-black text-black' : 'border border-[#B6192E] text-[#B6192E]'}`}>{aff.status}</span></td>
                  <td className="p-4 text-right">
                    <HzButton onClick={() => handleRevoke(aff.id)} variant="ghost" className="text-[#A0A0A0] hover:text-[#B6192E] border border-transparent hover:border-[#B6192E] text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded transition-colors">Revogar</HzButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}