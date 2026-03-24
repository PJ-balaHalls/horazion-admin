'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HzButton, HzInput, HzSkeleton } from '@/components/ui';
import { CreateUserModal } from '@/components/users/CreateUserModal';
import { supabase } from '@/lib/supabase';
import { StarRole } from '@/types/horizion';
import { PlusIcon, UserIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const StarIcon = () => (
  <svg className="w-3 h-3 inline-block mr-1 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

interface RealProfile {
  id: string; horizion_id: string; full_name: string; email: string | null; role: StarRole; is_active: boolean; created_at: string;
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

  // CORREÇÃO AQUI: Proteção absoluta contra 'undefined.includes()'
  const filteredUsers = users.filter(u => 
    (u.full_name && u.full_name.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (u.horizion_id && u.horizion_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isModalOpen) {
    return (
      <div className="w-full h-full bg-white flex">
        <CreateUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchUsers} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full animate-in fade-in space-y-6 bg-white p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-black tracking-tight">Identidades Registadas</h1>
          <p className="text-xs font-medium text-gray-500 mt-1 uppercase tracking-wider">
            {isLoading ? 'A sincronizar com o Core...' : `Gerindo ${users.length} utilizadores`}
          </p>
        </div>
        <HzButton className="bg-black hover:bg-[#E50000] text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm" onClick={() => setIsModalOpen(true)}>
          + Nova Identidade
        </HzButton>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="p-4 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">HorizionID</th>
                <th className="p-4 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Utilizador</th>
                <th className="p-4 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Acesso</th>
                <th className="p-4 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Estado</th>
                <th className="p-4 text-[10px] font-semibold text-gray-400 uppercase tracking-widest text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx}>
                    <td className="p-4"><HzSkeleton className="h-4 w-24" /></td>
                    <td className="p-4 flex gap-3 items-center"><HzSkeleton className="h-8 w-8 rounded-full" /><div className="space-y-2"><HzSkeleton className="h-4 w-32" /><HzSkeleton className="h-3 w-20" /></div></td>
                    <td className="p-4"><HzSkeleton className="h-5 w-16 rounded-full" /></td>
                    <td className="p-4"><HzSkeleton className="h-4 w-12" /></td>
                    <td className="p-4 text-right"><HzSkeleton className="h-8 w-16 inline-block rounded-lg" /></td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-xs font-medium text-gray-500">Nenhuma identidade encontrada.</td>
                </tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer" onClick={() => router.push(`/users/${user.id}`)}>
                  <td className="p-4 font-mono text-xs font-medium text-gray-500">{user.horizion_id}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full border border-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold uppercase bg-white">
                        {user.full_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{user.full_name}</p>
                        <p className="text-[11px] font-medium text-gray-500">{user.email || 'Sem e-mail'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-full text-[10px] font-bold text-gray-700 uppercase tracking-widest inline-flex items-center">
                      <StarIcon /> {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    {user.is_active ? (
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-gray-700 uppercase tracking-wider"><span className="w-2 h-2 rounded-full bg-green-500"></span> Ativo</span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-gray-700 uppercase tracking-wider"><span className="w-2 h-2 rounded-full bg-[#E50000]"></span> Suspenso</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <HzButton variant="ghost" className="text-gray-500 hover:text-black text-xs font-semibold px-3 py-1.5 border border-transparent hover:border-gray-200 rounded-lg">Gerir</HzButton>
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