'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { HzButton, HzSkeleton } from '@/components/ui';
import { CreateUserModal } from '@/components/users/CreateUserModal';
import { HzBrazilMap } from '@/components/ui/HzBrazilMap';
import { supabase } from '@/lib/supabase';
import { StarRole } from '@/types/horizion';
import { MagnifyingGlassIcon, MapPinIcon } from '@heroicons/react/24/outline';

interface RealProfile {
  id: string; 
  horizion_id: string; 
  full_name: string; 
  username: string | null;
  email: string | null; 
  role: StarRole; 
  status: string | null; 
  is_active: boolean; 
  city: string | null; 
  state: string | null; 
  created_at: string;
}

export default function UsersListPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState<RealProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // 1. Função que busca e ordena os dados
  const fetchUsers = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw error;

      // Ordena pelos utilizadores mais recentes no Frontend
      const sortedData = (data || []).sort((a, b) => {
        if (a.created_at && b.created_at) return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        return 0;
      });
      setUsers(sortedData);
    } catch (error: any) { 
      console.error("Erro ao buscar utilizadores:", error);
      setFetchError(error.message || "Erro de permissão. Verifique as políticas RLS no Supabase.");
    } finally { 
      setIsLoading(false); 
    }
  };

  // 2. Hook de Tempo Real (Mantém a lista atualizada automaticamente)
  useEffect(() => {
    fetchUsers();
    
    const subscription = supabase
      .channel('public:profiles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        console.log('🔄 Atualização de tempo real detectada. A sincronizar...');
        fetchUsers();
      })
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, []);

  // 3. Sistema de Filtro
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

  // 4. Calculadora de Densidade por Estado (Para o Mapa do Brasil)
  const stateCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    users.forEach(u => {
      if (u.state) {
        const sigla = u.state.toUpperCase();
        counts[sigla] = (counts[sigla] || 0) + 1;
      }
    });
    return counts;
  }, [users]);

  // 5. Estatísticas Rápidas
  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active' || (!u.status && u.is_active)).length,
    pending: users.filter(u => u.status === 'pre_registered').length,
  };

  if (isModalOpen) {
    return (
      <div className="w-full h-full bg-white flex">
        <CreateUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchUsers} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20 p-8 animate-in fade-in">
      
      {/* Alerta de Erro de Acesso RLS */}
      {fetchError && (
        <div className="bg-[#B6192E]/10 border border-[#B6192E] text-[#B6192E] p-4 rounded-[12px] flex items-center justify-between shadow-sm">
          <div>
            <h3 className="font-bold text-sm">Acesso Bloqueado ao Banco de Dados</h3>
            <p className="text-xs mt-1">{fetchError}</p>
          </div>
          <HzButton onClick={fetchUsers} className="bg-[#B6192E] text-white text-xs px-4 py-2 rounded">Tentar Novamente</HzButton>
        </div>
      )}

      {/* HEADER MINIMALISTA */}
      <div className="border-b border-[#F2F2F2] pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-black tracking-tighter">Grafo de Identidades</h1>
          <p className="text-sm text-[#A0A0A0] font-medium mt-1">Gerenciamento central do ecossistema de utilizadores.</p>
        </div>
        <HzButton onClick={() => setIsModalOpen(true)} className="bg-black text-white hover:bg-[#B6192E] px-6 py-2.5 rounded text-xs font-bold transition-colors shadow-sm">
          + APROVISIONAR CONTA
        </HzButton>
      </div>

      {/* DASHBOARD TÁTICO: MAPA & NÚMEROS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Mapa Coroplético do Brasil */}
        <div className="lg:col-span-2 bg-white border border-[#F2F2F2] rounded h-[320px] overflow-hidden relative flex shadow-sm">
          <div className="absolute top-4 left-4 z-10 bg-white px-3 py-1.5 border border-[#F2F2F2] rounded text-[9px] font-bold text-black uppercase tracking-widest flex items-center gap-2 shadow-sm">
             <span className="w-1.5 h-1.5 bg-[#B6192E] rounded-full animate-pulse"></span> DENSIDADE REGIONAL
          </div>
          
          <div className="flex-1">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <HzSkeleton className="w-full h-full" />
              </div>
            ) : (
              <HzBrazilMap stateData={stateCounts} />
            )}
          </div>

          {/* Escala Visual (Legend) do Heatmap */}
          <div className="w-16 border-l border-[#F2F2F2] bg-[#FAFAFA] flex flex-col items-center justify-between py-6">
            <span className="text-[9px] font-bold text-black">{Math.max(...Object.values(stateCounts), 1)}</span>
            <div className="w-2 flex-1 my-2 bg-gradient-to-b from-[#B6192E] to-[#FAFAFA] border border-[#F2F2F2] rounded-full"></div>
            <span className="text-[9px] font-bold text-[#A0A0A0]">0</span>
          </div>
        </div>

        {/* Cards de Estatística Flat B2B */}
        <div className="flex flex-col gap-4 h-[320px]">
          <div className="border border-[#F2F2F2] rounded p-6 flex-1 flex flex-col justify-center bg-white shadow-sm">
             <p className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest">Total no Ecossistema</p>
             <p className="text-4xl font-black text-black mt-1 tracking-tighter">{stats.total}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 flex-1">
            <div className="border border-[#F2F2F2] rounded p-5 flex flex-col justify-center bg-[#FAFAFA] shadow-sm">
               <p className="text-[9px] font-bold text-[#A0A0A0] uppercase tracking-widest leading-tight">Contas<br/>Ativas</p>
               <p className="text-2xl font-black text-black mt-2">{stats.active}</p>
            </div>
            <div className="border border-[#F2F2F2] rounded p-5 flex flex-col justify-center bg-white shadow-sm">
               <p className="text-[9px] font-bold text-[#B6192E] uppercase tracking-widest leading-tight">Aguardando<br/>Finalização</p>
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

        <div className="bg-white border border-[#F2F2F2] rounded-[12px] overflow-hidden shadow-sm">
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
                    Nenhum utilizador encontrado no banco de dados.
                  </td>
                </tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-[#FAFAFA] transition-colors group">
                  <td className="p-4 font-mono text-[10px] text-[#A0A0A0]">{user.horizion_id}</td>
                  
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full border border-black text-black flex items-center justify-center text-[10px] font-black uppercase bg-white">
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
                       <span className="text-[9px] font-bold text-[#A0A0A0] border border-[#F2F2F2] px-2 py-1 rounded bg-[#FAFAFA] uppercase tracking-widest">
                         Aguardando Finalização
                       </span>
                    ) : user.status === 'suspended' || (!user.is_active && user.status !== 'pre_registered') ? (
                       <span className="text-[9px] font-bold text-[#B6192E] border border-[#B6192E]/20 px-2 py-1 rounded bg-[#B6192E]/5 uppercase tracking-widest">
                         Suspenso
                       </span>
                    ) : (
                       <span className="text-[9px] font-bold text-black border border-black px-2 py-1 rounded uppercase tracking-widest">
                         Ativo
                       </span>
                    )}
                  </td>

                  <td className="p-4 text-right">
                    <HzButton 
                      onClick={() => router.push(`/users/${user.id}`)} 
                      className="bg-transparent text-[#A0A0A0] hover:text-white hover:bg-black border border-[#F2F2F2] hover:border-black text-[10px] font-bold px-4 py-2 rounded uppercase tracking-widest transition-all"
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