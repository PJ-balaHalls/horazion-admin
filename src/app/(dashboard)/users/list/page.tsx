'use client';

import { useEffect, useState } from 'react';
import { userService } from '@/services/userService';
import { Profile } from '@/types/horizion';
import { CreateUserModal } from '@/components/users/CreateUserModal';

export default function UserManagementPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      setLoading(true);
      const data = await userService.getAllProfiles();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-[1400px] mx-auto">
      <div className="flex justify-between items-end border-b border-horazion-light pb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter">Comando de Identidades</h1>
          <p className="text-sm font-medium text-horazion-gray mt-1 uppercase tracking-widest">Auditoria Sirius • Total: {users.length}</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-8 py-2.5 bg-horazion-black text-horazion-white text-[10px] font-bold uppercase rounded-hz hover:bg-horazion-red transition-all shadow-lg">
          Criar Identidade
        </button>
      </div>

      <div className="bg-horazion-white border border-horazion-light rounded-hz overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-horazion-light/5 border-b border-horazion-light">
            <tr>
              <th className="px-6 py-5 text-[10px] font-bold text-horazion-gray uppercase tracking-widest">Identidade Única</th>
              <th className="px-6 py-5 text-[10px] font-bold text-horazion-gray uppercase tracking-widest">Tipo Estelar</th>
              <th className="px-6 py-5 text-[10px] font-bold text-horazion-gray uppercase tracking-widest">Cidade</th>
              <th className="px-6 py-5 text-[10px] font-bold text-horazion-gray uppercase tracking-widest text-right">Comando</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-horazion-light">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-horazion-light/20 transition-all">
                <td className="px-6 py-4">
                  <p className="font-bold text-horazion-black leading-tight">{u.full_name}</p>
                  <p className="text-[10px] font-mono text-horazion-gray/60">{u.horizion_id}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[9px] font-bold px-3 py-1 rounded-full border ${u.role === 'sirius' ? 'bg-horazion-red text-horazion-white border-horazion-red' : 'border-horazion-light text-horazion-black'}`}>
                    {u.role.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs font-medium">{u.location_city || 'Sincronizando...'}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-[10px] font-bold border-b border-horazion-black">EDITAR</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CreateUserModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onRefresh={loadData} 
      />
    </div>
  );
}