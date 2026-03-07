'use client';

import { useEffect, useState } from 'react';
import { userService } from '@/services/userService';
import { Profile, StellarRole, SYSTEM_PERMISSIONS } from '@/types/horizion';
import { GrowthChart } from '@/components/users/GrowthChart';

export default function UserListPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [u, s] = await Promise.all([userService.getAllProfiles(), userService.getGrowthStats()]);
      setUsers(u);
      setStats(s);
    } finally {
      setLoading(false);
    }
  }

  const exportToCSV = () => {
    const headers = "HorizionID,Nome,Role,Status,Cidade\n";
    const rows = users.map(u => `${u.horizion_id},${u.full_name},${u.role},${u.status},${u.location_city}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `horazion_users_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      {/* Header e Ações Globais */}
      <div className="flex justify-between items-start border-b border-horazion-light pb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter text-horazion-black">Comando de Identidades</h1>
          <p className="text-sm font-medium text-horazion-gray">Gestão de {users.length} estrelas no ecossistema SOS.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportToCSV} className="px-4 py-2 border border-horazion-light text-[10px] font-bold uppercase rounded-hz hover:bg-horazion-light transition-all">Exportar CSV</button>
          <button className="px-6 py-2 bg-horazion-black text-horazion-white text-[10px] font-bold uppercase rounded-hz hover:bg-horazion-red transition-all shadow-sm">Criar Nova Identidade</button>
        </div>
      </div>

      {/* Analytics Real */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 border border-horazion-light rounded-hz p-2">
          <GrowthChart data={stats} />
        </div>
        <div className="border border-horazion-light rounded-hz p-8 flex flex-col justify-center">
          <span className="text-[10px] font-bold text-horazion-red uppercase tracking-widest mb-1">Status Global</span>
          <div className="text-4xl font-bold mb-4 tracking-tighter">{users.length}</div>
          <div className="space-y-2">
            <div className="flex justify-between text-[11px] font-bold border-b border-horazion-light pb-2">
              <span className="text-horazion-gray">SIRIUS (ADMINS)</span>
              <span>{users.filter(u => u.role === 'sirius').length}</span>
            </div>
            <div className="flex justify-between text-[11px] font-bold border-b border-horazion-light pb-2">
              <span className="text-horazion-gray">BLOQUEADOS</span>
              <span className="text-horazion-red">{users.filter(u => u.status === 'blocked').length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Gestão */}
      <div className="bg-horazion-white border border-horazion-light rounded-hz overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-horazion-white border-b border-horazion-light">
            <tr>
              <th className="px-6 py-5 text-[10px] font-bold text-horazion-gray uppercase tracking-widest">Identidade Única</th>
              <th className="px-6 py-5 text-[10px] font-bold text-horazion-gray uppercase tracking-widest">Nível</th>
              <th className="px-6 py-5 text-[10px] font-bold text-horazion-gray uppercase tracking-widest">Localização</th>
              <th className="px-6 py-5 text-[10px] font-bold text-horazion-gray uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-horazion-light">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-horazion-light/20 transition-all group">
                <td className="px-6 py-4">
                  <p className="font-bold text-horazion-black leading-tight">{user.full_name}</p>
                  <p className="text-[10px] font-mono text-horazion-gray">{user.horizion_id}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${user.role === 'sirius' ? 'bg-horazion-black text-horazion-white' : 'border-horazion-light text-horazion-black'}`}>
                    {user.role.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs font-medium">{user.location_city || 'Não definido'}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setSelectedUser(user)} className="p-2 border border-horazion-light rounded-hz hover:border-horazion-black text-[10px] font-bold uppercase">Ver User</button>
                    <button className="p-2 text-horazion-red hover:bg-horazion-red/10 rounded-hz transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Drawer de Compilação de Informações (View User) */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex justify-end bg-horazion-black/10 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-horazion-white h-full shadow-2xl animate-slide-in p-10 overflow-y-auto border-l border-horazion-light">
            <div className="flex justify-between items-start mb-10">
              <h2 className="text-2xl font-bold tracking-tighter">Compilação de Dados</h2>
              <button onClick={() => setSelectedUser(null)} className="text-horazion-gray hover:text-horazion-black font-bold">FECHAR</button>
            </div>

            <div className="space-y-8">
              <section className="pb-6 border-b border-horazion-light">
                <span className="text-[10px] font-bold text-horazion-red uppercase tracking-widest block mb-4">Núcleo</span>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-[9px] font-bold text-horazion-gray uppercase">Nome</label><p className="font-bold">{selectedUser.full_name}</p></div>
                  <div><label className="text-[9px] font-bold text-horazion-gray uppercase">ID</label><p className="font-mono text-xs">{selectedUser.horizion_id}</p></div>
                </div>
              </section>

              <section>
                <span className="text-[10px] font-bold text-horazion-red uppercase tracking-widest block mb-4">Capacidades (30 Permissões)</span>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  {SYSTEM_PERMISSIONS.map(p => {
                    const hasPerm = selectedUser.role === 'sirius' || p.min === 'user' || selectedUser.custom_permissions.includes(p.id);
                    return (
                      <div key={p.id} className={`flex items-center justify-between text-[10px] font-bold p-2 border ${hasPerm ? 'border-horazion-black bg-horazion-black/5' : 'border-horazion-light opacity-30'}`}>
                        <span>{p.label}</span>
                        {hasPerm && <span>✓</span>}
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}