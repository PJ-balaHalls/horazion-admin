'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { HzButton, HzInput, HzSkeleton } from '@/components/ui';
import { CreateUserModal } from '@/components/users/CreateUserModal';
import { HzGeoMap } from '@/components/ui/HzGeoMap';
import { supabase } from '@/lib/supabase';
import { StarRole } from '@/types/horizion';
import { MapPinIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const StarIcon = () => (
  <svg className="w-3 h-3 inline-block mr-1 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

// Dicionário para gerar coordenadas visuais no Dashboard baseado no Estado
const STATE_COORDS: Record<string, [number, number]> = {
  'SP': [-23.5505, -46.6333], 'RJ': [-22.9068, -43.1729], 'MG': [-19.9167, -43.9345],
  'RS': [-30.0277, -51.2287], 'PR': [-25.4284, -49.2733], 'SC': [-27.5969, -48.5495],
  'BA': [-12.9714, -38.5014], 'PE': [-8.0476, -34.8770],  'CE': [-3.7172, -38.5431],
  'DF': [-15.7938, -47.8828], 'AM': [-3.1190, -60.0217],  'PA': [-1.4558, -48.5044],
  'BR': [-14.2350, -51.9253] // Centro Padrão
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
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setUsers(data || []);
    } catch (error) { console.error(error); } 
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  // Filtro de Pesquisa Seguro
  const filteredUsers = users.filter(u => 
    (u.full_name && u.full_name.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (u.username && u.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.horizion_id && u.horizion_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Mapear Identidades para o Mapa Geográfico (com leve espalhamento randômico para não sobrepor pins na mesma cidade)
  const mapMarkers = useMemo(() => {
    return users.map(u => {
      const baseCoord = STATE_COORDS[u.state?.toUpperCase() || ''] || STATE_COORDS['BR'];
      return {
        id: u.id,
        lat: baseCoord[0] + (Math.random() - 0.5) * 1.5,
        lng: baseCoord[1] + (Math.random() - 0.5) * 1.5,
        label: u.full_name || 'Utilizador'
      };
    });
  }, [users]);

  // Estatísticas
  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active' || (!u.status && u.is_active)).length,
    pending: users.filter(u => u.status === 'pre_registered').length,
    suspended: users.filter(u => u.status === 'suspended' || (!u.is_active && u.status !== 'pre_registered')).length
  };

  if (isModalOpen) {
    return <div className="w-full h-full bg-white flex"><CreateUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchUsers} /></div>;
  }

  return (
    <div className="flex flex-col min-h-full animate-in fade-in space-y-8 bg-[#FAFAFA] p-8 max-w-[1400px] mx-auto w-full">
      
      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-black tracking-tight">Gestão de Identidades</h1>
          <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-widest">
            {isLoading ? 'A sincronizar com o Core...' : 'Ecossistema Global de Utilizadores'}
          </p>
        </div>
        <HzButton className="bg-[#E50000] hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md" onClick={() => setIsModalOpen(true)}>
          + Aprovisionar Identidade
        </HzButton>
      </div>

      {/* DASHBOARD GEOGRÁFICO E ESTATÍSTICO */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Mapa Global */}
        <div className="lg:col-span-3 bg-white border border-gray-200 rounded-[24px] overflow-hidden h-[320px] shadow-sm relative group">
          <div className="absolute top-5 left-5 z-10 bg-white/90 backdrop-blur px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-[#E50000] animate-pulse"></div>
             <h3 className="text-[10px] font-bold uppercase tracking-widest text-black">Live Tracking</h3>
          </div>
          {isLoading ? (
             <div className="w-full h-full bg-gray-50 flex items-center justify-center"><HzSkeleton className="w-full h-full" /></div>
          ) : (
             <HzGeoMap markers={mapMarkers} zoom={4} center={{ lat: -14.235, lng: -51.925 }} />
          )}
        </div>

        {/* Cards de Estatísticas */}
        <div className="flex flex-col gap-4 h-[320px]">
          <div className="bg-white border border-gray-200 rounded-[20px] p-5 flex-1 flex flex-col justify-center shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-[100px] -z-0"></div>
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest relative z-10">Total de Contas</p>
             <p className="text-4xl font-black text-black mt-1 relative z-10">{stats.total}</p>
          </div>
          <div className="bg-[#FFF8F0] border border-[#FFE8D6] rounded-[20px] p-5 flex-1 flex flex-col justify-center shadow-sm">
             <p className="text-[10px] font-bold text-[#D97706] uppercase tracking-widest">Aguardando Onboarding</p>
             <p className="text-4xl font-black text-[#B45309] mt-1">{stats.pending}</p>
             <p className="text-[9px] font-bold text-[#D97706]/70 uppercase mt-1">Pré-cadastros gerados</p>
          </div>
          <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-[20px] p-5 flex-1 flex flex-col justify-center shadow-sm">
             <p className="text-[10px] font-bold text-[#16A34A] uppercase tracking-widest">Identidades Ativas</p>
             <p className="text-4xl font-black text-[#15803D] mt-1">{stats.active}</p>
          </div>
        </div>
      </div>

      {/* ÁREA DA TABELA COM FILTRO */}
      <div className="bg-white border border-gray-200 rounded-[24px] shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
          <h2 className="text-lg font-bold text-black">Lista de Identidades</h2>
          <div className="relative w-72">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar nome, @apelido ou email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">HorizionID</th>
                <th className="p-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Utilizador / Apelido</th>
                <th className="p-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Localização</th>
                <th className="p-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hierarquia</th>
                <th className="p-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estado</th>
                <th className="p-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx}>
                    <td className="p-5"><HzSkeleton className="h-4 w-24" /></td>
                    <td className="p-5 flex gap-3 items-center"><HzSkeleton className="h-10 w-10 rounded-full" /><div className="space-y-2"><HzSkeleton className="h-4 w-32" /><HzSkeleton className="h-3 w-20" /></div></td>
                    <td className="p-5"><HzSkeleton className="h-4 w-24" /></td>
                    <td className="p-5"><HzSkeleton className="h-5 w-20 rounded-full" /></td>
                    <td className="p-5"><HzSkeleton className="h-5 w-24 rounded-full" /></td>
                    <td className="p-5 text-right"><HzSkeleton className="h-8 w-16 inline-block rounded-lg" /></td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-16 text-center text-sm font-medium text-gray-400">Nenhuma identidade encontrada no sistema.</td>
                </tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => router.push(`/users/${user.id}`)}>
                  <td className="p-5 font-mono text-[11px] font-bold text-gray-500">{user.horizion_id}</td>
                  
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full border border-gray-200 text-black flex items-center justify-center text-sm font-black uppercase bg-white shadow-sm">
                        {user.full_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900">{user.full_name}</p>
                        <p className="text-[11px] font-bold text-gray-400 mt-0.5">
                          {user.username ? `@${user.username}` : (user.email || 'Sem registo')}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="p-5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                      <MapPinIcon className="w-3.5 h-3.5" />
                      {user.city && user.state ? `${user.city}, ${user.state}` : 'Não Geolocalizado'}
                    </div>
                  </td>

                  <td className="p-5">
                    <span className="px-3 py-1 bg-gray-100 border border-gray-200 rounded-full text-[9px] font-black text-black uppercase tracking-widest inline-flex items-center">
                      <StarIcon /> {user.role}
                    </span>
                  </td>

                  <td className="p-5">
                    {user.status === 'pre_registered' ? (
                       <span className="px-3 py-1 bg-[#FFF8F0] border border-[#FFE8D6] rounded-full text-[9px] font-black text-[#D97706] uppercase tracking-widest">Pré-Cadastro</span>
                    ) : user.status === 'suspended' || (!user.is_active && user.status !== 'pre_registered') ? (
                       <span className="px-3 py-1 bg-red-50 border border-red-100 rounded-full text-[9px] font-black text-[#E50000] uppercase tracking-widest">Suspenso</span>
                    ) : (
                       <span className="px-3 py-1 bg-[#F0FDF4] border border-[#DCFCE7] rounded-full text-[9px] font-black text-[#15803D] uppercase tracking-widest">Ativo</span>
                    )}
                  </td>

                  <td className="p-5 text-right">
                    <HzButton variant="ghost" className="text-gray-500 hover:text-black hover:bg-white shadow-sm border border-transparent hover:border-gray-200 text-xs font-bold px-4 py-2 rounded-xl transition-all">
                      Abrir Perfil
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