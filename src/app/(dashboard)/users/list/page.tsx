// src/app/(dashboard)/users/list/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { userService } from '@/services/userService';
import { Profile } from '@/types/horizion';
import { CreateUserModal } from '@/components/users/CreateUserModal';

export default function UserListPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const data = await userService.getAllProfiles();
      setUsers(data);
    } catch (e) {
      console.error("Erro na carga do SOS:", e);
    }
  }

  return (
    <div className="max-w-[1200px] mx-auto py-20 space-y-20 animate-fade-in">
      <header className="flex justify-between items-end border-b border-horazion-light pb-10">
        <div>
          <h1 className="text-6xl font-bold tracking-tighter text-horazion-black">Comando</h1>
          <p className="text-horazion-gray font-medium mt-2">{users.length} estrelas sincronizadas.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-10 py-4 bg-horazion-black text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-horazion-red transition-all"
        >
          Nova Identidade
        </button>
      </header>

      <div className="bg-white border border-horazion-light rounded-[40px] overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-horazion-light bg-horazion-light/10">
              <th className="px-12 py-8 text-[10px] font-bold text-horazion-gray uppercase tracking-widest">Identidade Única</th>
              <th className="px-12 py-8 text-[10px] font-bold text-horazion-gray uppercase tracking-widest">Nível</th>
              <th className="px-12 py-8 text-[10px] font-bold text-horazion-gray uppercase tracking-widest text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-horazion-light">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-horazion-light/20 transition-all">
                <td className="px-12 py-10">
                  <p className="text-2xl font-bold text-horazion-black">{u.full_name}</p>
                  <p className="text-[10px] font-mono text-horazion-red font-bold uppercase">{u.horizion_id}</p>
                </td>
                <td className="px-12 py-10">
                  <span className="px-4 py-1 border border-horazion-black rounded-full text-[9px] font-bold uppercase">
                    {u.role}
                  </span>
                </td>
                <td className="px-12 py-10 text-right">
                  <div className="inline-block w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CreateUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={loadData} />
    </div>
  );
}