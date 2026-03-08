'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HzButton } from '@/components/ui/HzButton';
import { HzInput } from '@/components/ui/HzInput';
import { CreateUserModal } from '@/components/users/CreateUserModal';
import { supabase } from '@/lib/supabase';
import { StarRole } from '@/types/horizion';

const StarIcon = () => (
  <svg className="w-3 h-3 inline-block mr-1 text-[#000000]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

interface RealProfile {
  id: string;
  horizion_id: string;
  full_name: string;
  email: string | null;
  role: StarRole;
  is_active: boolean;
  created_at: string;
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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('[HZ-SYS_003] Falha ao carregar utilizadores:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.horizion_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full animate-fade-in space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#000000] tracking-tight">Identidades Registadas</h1>
          <p className="text-sm text-[#545454] mt-1">
            {isLoading ? 'A sincronizar com o Core...' : `A gerir ${users.length} utilizadores no ecossistema.`}
          </p>
        </div>
        <HzButton variant="primary" onClick={() => setIsModalOpen(true)}>
          + Nova Identidade
        </HzButton>
      </div>

      <div className="bg-white p-4 rounded-[12px] border border-[#F2F2F2] flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <HzInput 
            label="Procurar Identidade" 
            placeholder="Nome, E-mail ou HorizionID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[12px] border border-[#F2F2F2] flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#F2F2F2]">
                <th className="p-4 text-[10px] font-bold text-[#545454] uppercase tracking-wider whitespace-nowrap bg-white">HorizionID</th>
                <th className="p-4 text-[10px] font-bold text-[#545454] uppercase tracking-wider bg-white">Utilizador</th>
                <th className="p-4 text-[10px] font-bold text-[#545454] uppercase tracking-wider bg-white">Nível Estelar</th>
                <th className="p-4 text-[10px] font-bold text-[#545454] uppercase tracking-wider bg-white">Estado</th>
                <th className="p-4 text-[10px] font-bold text-[#545454] uppercase tracking-wider text-right bg-white">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2F2F2]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-sm text-[#545454] bg-white">
                    <div className="w-6 h-6 border-2 border-[#F2F2F2] border-t-[#B6192E] rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-[#FAFAFA] transition-colors group">
                  <td className="p-4 font-mono text-xs font-bold text-[#000000] bg-transparent">
                    {user.horizion_id}
                  </td>
                  <td className="p-4 bg-transparent">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full border border-[#F2F2F2] text-[#000000] flex items-center justify-center text-xs font-bold uppercase bg-white">
                        {user.full_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#000000]">
                          {user.full_name} 
                        </p>
                        <p className="text-xs text-[#545454]">{user.email || 'Sem e-mail registado'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 bg-transparent">
                    <span className="px-3 py-1 bg-white border border-[#F2F2F2] rounded-full text-[10px] font-bold text-[#000000] uppercase tracking-wider inline-flex items-center">
                      <StarIcon /> {user.role}
                    </span>
                  </td>
                  <td className="p-4 bg-transparent">
                    {user.is_active ? (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-[#000000]">
                        <span className="w-2 h-2 rounded-full bg-[#10B981]"></span> Ativo
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-[#000000]">
                        <span className="w-2 h-2 rounded-full bg-[#B6192E]"></span> Suspenso
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right bg-transparent">
                    <HzButton 
                      variant="secondary" 
                      className="!px-3 !py-1.5 text-[10px]"
                      onClick={() => router.push(`/users/${user.id}`)}
                    >
                      Gerir
                    </HzButton>
                  </td>
                </tr>
              ))}

              {!isLoading && filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-sm text-[#545454] bg-white">
                    Nenhuma identidade encontrada na base de dados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateUserModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
          fetchUsers();
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}