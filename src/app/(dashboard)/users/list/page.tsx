'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { HzButton, HzSkeleton } from '@/components/ui';
import { CreateUserModal } from '@/components/users/CreateUserModal';
import { HzGeoMap } from '@/components/ui/HzGeoMap';
import { supabase } from '@/lib/supabase';
import { StarRole } from '@/types/horizion';
import { MagnifyingGlassIcon, MapPinIcon } from '@heroicons/react/24/outline';

const STATE_COORDS: Record<string, [number, number]> = {
  'SP': [-23.5505, -46.6333], 'RJ': [-22.9068, -43.1729], 'MG': [-19.9167, -43.9345],
  'RS': [-30.0277, -51.2287], 'PR': [-25.4284, -49.2733], 'SC': [-27.5969, -48.5495],
  'BA': [-12.9714, -38.5014], 'PE': [-8.0476, -34.8770],  'CE': [-3.7172, -38.5431],
  'DF': [-15.7938, -47.8828], 'AM': [-3.1190, -60.0217],  'PA': [-1.4558, -48.5044],
  'BR': [-14.2350, -51.9253] 
};

interface RealProfile {
  id: string; horizion_id: string; full_name: string; username: string | null;
  email: string | null; role: StarRole; status: string | null; is_active: boolean; 
  city: string | null; state: string | null; created_at: string;
}

export default function UsersListPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState<RealProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Removido o ".order()" do banco para evitar crash caso a coluna não exista.
      const { data, error } = await supabase.from('profiles').select('*');
      
      if (error) {
        console.error("Erro do Supabase:", error);
        alert(`Ocorreu um erro ao buscar os utilizadores: ${error.message}`);
        return;
      }

      // Ordenação feita pelo lado do cliente (Client-side) de forma segura
      const sortedData = (data || []).sort((a, b) => {
        if (a.created_at && b.created_at) {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return 0;
      });

      setUsers(sortedData);
    } catch (error) { 
      console.error(error); 
    } finally { 
      setIsLoading(false); 
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // Lógica de filtro blindada contra valores nulos
  const filteredUsers = users.filter(u => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (u.full_name && u.full_name.toLowerCase().includes(term)) || 
      (u.username && u.username.toLowerCase().includes(term)) ||
      (u.horizion_id && u.horizion_id.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term))
    );
  });

  const mapMarkers = useMemo(() => {
    return users.map(u => {
      const baseCoord = STATE_COORDS[u.state?.toUpperCase() || ''] || STATE_COORDS['BR'];
      return { id: u.id, lat: baseCoord[0] + (Math.random() - 0.5) * 1.5, lng: baseCoord[1] + (Math.random() - 0.5) * 1.5, label: u.full_name };
    });
  }, [users]);

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active' || (!u.status && u.is_active)).length,
    pending: users.filter(u => u.status === 'pre_registered').length,
  };

  if (isModalOpen) {
    return <div className="w-full h-full bg-white flex"><CreateUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchUsers} /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20 p-8 animate-in fade-in">
      
      {/* HEADER MINIMALISTA */}
      <div className="border-b border-[#F2F2F2] pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-black tracking-tighter">Grafo de Identidades</h1>
          <p className="text-sm text-[#A0A0A0] font-medium mt-1">Gerenciamento central do ecossistema de utilizadores.</p>
        </div>
        <HzButton onClick={() => setIsModalOpen(true)} className="bg-black text-white hover:bg-[#B6192E] px-6 py-2.5 rounded text-xs font-bold transition-colors">
          + APROVISIONAR CONTA
        </HzButton>
      </div>

      {/* DASHBOARD TÁTICO: MAPA & NÚMEROS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white border border-[#F2F2F2] rounded-[12px] h-[280px] overflow-hidden relative">
          <div className="absolute top-4 left-4 z-10 bg-white/90 px-3 py-1.5 border border-[#F2F2F2] rounded text-[9px] font-bold text-black uppercase tracking-widest flex items-center gap-2">
             <span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse"></span> GEOTAGGING
          </div>
          {isLoading ? <div className="w-full h-full flex items-center justify-center"><HzSkeleton className="w-full h-full" /></div> : <HzGeoMap markers={mapMarkers} zoom={4} center={{ lat: -14.235, lng: -51.925 }} />}
        </div>

        <div className="flex flex-col gap-4 h-[280px]">
          <div className="border border-[#F2F2F2] rounded-[12px] p-6 flex-1 flex flex-col justify-center bg-[#FAFAFA]">
             <p className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest">Total no Ecossistema</p>
             <p className="text-4xl font-black text-black mt-1 tracking-tighter">{stats.total}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 flex-1">
            <div className="border border-[#F2F2F2] rounded-[12px] p-5 flex flex-col justify-center bg-white">
               <p className="text-[9px] font-bold text-[#A0A0A0] uppercase tracking-widest leading-tight">Contas<br/>Ativas</p>
               <p className="text-2xl font-black text-black mt-2">{stats.active}</p>
            </div>
            <div className="border border-[#F2F2F2] rounded-[12px] p-5 flex flex-col justify-center bg-white">
               <p className="text-[9px] font-bold text-[#A0A0A0] uppercase tracking-widest leading-tight">Aguardando<br/>Finalização</p>
               <p className="text-2xl font-black text-[#B6192E] mt-2">{stats.pending}</p>
            </div>
          </div>
        </div>
      </div>

      {/* LISTAGEM (TABELA CLEAN) */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <h3 className="text-xs font-bold text-black tracking-widest uppercase">Diretório de Acessos</h3>
          <div className="relative w-80">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#A0A0A0]" />
            <input 
              type="text" 
              placeholder="Buscar por ID, nome ou apelido..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-[#F2F2F2] bg-[#FAFAFA] rounded text-xs text-black focus:outline-none focus:border-black transition-colors"
            />
          </div>
        </div>

        <div className="bg-white border border-[#F2F2F2] rounded-[12px] overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#FAFAFA] border-b border-[#F2F2F2]">
                <th className="p-4 text-[9px] font-bold text-[#A0A0A0] uppercase tracking-widest">Horizion ID</th>
                <th className="p-4 text-[9px] font-bold text-[#A0A0A0] uppercase tracking-widest">Identidade</th>
                <th className="p-4 text-[9px] font-bold text-[#A0A0A0] uppercase tracking-widest">Geolocalização</th>
                <th className="p-4 text-[9px] font-bold text-[#A0A0A0] uppercase tracking-widest">Role</th>
                <th className="p-4 text-[9px] font-bold text-[#A0A0A0] uppercase tracking-widest">Status</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2F2F2]">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx}>
                    <td className="p-4"><HzSkeleton className="h-4 w-20" /></td>
                    <td className="p-4 flex gap-3"><HzSkeleton className="h-8 w-8 rounded-full" /><div className="space-y-2 mt-1"><HzSkeleton className="h-3 w-24" /><HzSkeleton className="h-2 w-16" /></div></td>
                    <td className="p-4"><HzSkeleton className="h-4 w-24" /></td>
                    <td className="p-4"><HzSkeleton className="h-4 w-16" /></td>
                    <td className="p-4"><HzSkeleton className="h-4 w-20" /></td>
                    <td className="p-4"></td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-xs font-medium text-[#A0A0A0]">
                    Nenhum utilizador encontrado.
                  </td>
                </tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-[#FAFAFA] transition-colors group cursor-pointer" onClick={() => router.push(`/users/${user.id}`)}>
                  <td className="p-4 font-mono text-[10px] text-[#A0A0A0]">{user.horizion_id}</td>
                  
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full border border-black text-black flex items-center justify-center text-[10px] font-black uppercase">
                        {user.full_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-black">{user.full_name}</p>
                        <p className="text-[10px] font-mono text-[#A0A0A0] mt-0.5">
                          {user.username ? `@${user.username}` : (user.email || 'Sem email')}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-[#545454]">
                      <MapPinIcon className="w-3.5 h-3.5 text-[#A0A0A0]" />
                      {user.city && user.state ? `${user.city}, ${user.state}` : '—'}
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest">
                      {user.role}
                    </span>
                  </td>

                  <td className="p-4">
                    {user.status === 'pre_registered' ? (
                       <span className="text-[9px] font-bold text-[#A0A0A0] border border-[#F2F2F2] px-2 py-1 rounded bg-[#FAFAFA] uppercase tracking-widest">Aguardando Finalização</span>
                    ) : user.status === 'suspended' || (!user.is_active && user.status !== 'pre_registered') ? (
                       <span className="text-[9px] font-bold text-[#B6192E] border border-[#B6192E]/20 px-2 py-1 rounded bg-[#B6192E]/5 uppercase tracking-widest">Suspenso</span>
                    ) : (
                       <span className="text-[9px] font-bold text-black border border-black px-2 py-1 rounded uppercase tracking-widest">Ativo</span>
                    )}
                  </td>

                  <td className="p-4 text-right">
                    {/* BOTÃO GERIR RESTAURADO E COM DESIGN MINIMALISTA */}
                    <HzButton 
                      variant="ghost" 
                      className="text-[#A0A0A0] hover:text-white hover:bg-black border border-[#F2F2F2] hover:border-black text-[10px] font-bold px-4 py-2 rounded uppercase tracking-widest transition-all"
                    >
                      Gerir
                    </HzButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}