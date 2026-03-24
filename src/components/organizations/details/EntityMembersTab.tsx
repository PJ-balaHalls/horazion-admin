import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { HzSkeleton } from '@/components/ui';

export function EntityMembersTab({ entityId }: { entityId: string }) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      // Busca na tabela de afiliações juntando com os dados do perfil
      const { data, error } = await supabase
        .from('affiliations')
        .select(`id, affiliation_role, status, profiles ( id, full_name, username, email, horizion_id )`)
        .eq('entity_id', entityId);
      
      if (!error && data) setMembers(data);
      setLoading(false);
    };
    fetchMembers();
  }, [entityId]);

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="border-b border-[#F2F2F2] pb-4 flex justify-between items-end">
        <div>
          <h2 className="text-lg font-bold text-black">Grafo de Utilizadores</h2>
          <p className="text-xs text-[#A0A0A0] font-medium uppercase tracking-widest mt-1">Identidades vinculadas a este Hub Corporativo.</p>
        </div>
        <div className="text-[10px] font-bold text-black border border-black px-3 py-1 rounded uppercase tracking-widest">
          {members.length} Membros
        </div>
      </div>

      <div className="border border-[#F2F2F2] rounded-[12px] overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#FAFAFA] border-b border-[#F2F2F2]">
              <th className="p-4 text-[9px] font-bold text-[#A0A0A0] uppercase tracking-widest">Horizion ID</th>
              <th className="p-4 text-[9px] font-bold text-[#A0A0A0] uppercase tracking-widest">Identidade</th>
              <th className="p-4 text-[9px] font-bold text-[#A0A0A0] uppercase tracking-widest">Cargo / Role</th>
              <th className="p-4 text-[9px] font-bold text-[#A0A0A0] uppercase tracking-widest">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F2F2F2]">
            {loading ? (
               <tr><td colSpan={4} className="p-8"><HzSkeleton className="h-10 w-full" /></td></tr>
            ) : members.length === 0 ? (
               <tr><td colSpan={4} className="p-12 text-center text-xs font-medium text-[#A0A0A0]">Nenhum utilizador vinculado a esta organização.</td></tr>
            ) : members.map((mem) => (
              <tr key={mem.id} className="hover:bg-[#FAFAFA] transition-colors">
                <td className="p-4 font-mono text-[10px] text-[#A0A0A0]">{mem.profiles?.horizion_id}</td>
                <td className="p-4">
                  <p className="text-sm font-bold text-black">{mem.profiles?.full_name}</p>
                  <p className="text-[10px] font-mono text-[#A0A0A0] mt-0.5">@{mem.profiles?.username || mem.profiles?.email}</p>
                </td>
                <td className="p-4 text-[10px] font-bold text-black uppercase tracking-widest">{mem.affiliation_role}</td>
                <td className="p-4">
                   <span className="text-[9px] font-bold text-black border border-black px-2 py-1 rounded uppercase tracking-widest">{mem.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}