'use client';

import React, { use, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { HorizionUser } from '@/types/horizion';
import { userService } from '@/services/userService';
import { HzGeoMap } from '@/components/ui/HzGeoMap';
import { HzButton } from '@/components/ui/HzButton';
import { useRouter } from 'next/navigation';

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [user, setUser] = useState<HorizionUser | null>(null);
  const [activeTab, setActiveTab] = useState<'intel' | 'audit' | 'sec'>('intel');
  const [loading, setLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Carregamento de Inteligência do Usuário
  useEffect(() => {
    async function load() {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', id).single();
      const { data: logs } = await supabase.from('audit_logs').select('*').eq('target_id', id).order('created_at', { ascending: false });
      
      if (profile) setUser(profile as HorizionUser);
      if (logs) setAuditLogs(logs);
      setLoading(false);
    }
    load();
  }, [id]);

  const handleAction = async (action: 'suspend' | 'ban' | 'strike') => {
    if (!user) return;
    const actorId = "system-admin-01"; // Em prod, viria do AuthStore
    
    try {
      if (action === 'suspend') await userService.suspendUser(user.id, "Violação de Termos", 7, actorId);
      if (action === 'ban') await userService.banUserPermanently(user.id, "Comportamento Inadequado", actorId);
      if (action === 'strike') await userService.applyStrike(user.id, "Spam detectado", actorId);
      
      // Refresh de estado
      const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
      if (data) setUser(data as HorizionUser);
      alert("Operação concluída com sucesso.");
    } catch (e) { alert("Falha na operação técnica."); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><div className="w-16 h-16 border-b-2 border-black rounded-full animate-spin" /></div>;
  if (!user) return <div className="p-20 text-center bg-white font-bold tracking-tighter">IDENTIDADE NÃO ENCONTRADA.</div>;

  return (
    <div className="bg-white min-h-screen flex flex-col animate-in fade-in duration-700">
      {/* HEADER DE COMANDO */}
      <header className="px-16 py-12 border-b border-[#F2F2F2] flex justify-between items-end bg-white/80 backdrop-blur-md sticky top-0 z-20">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {user.is_active ? 'Ativo' : 'Suspenso'}
            </span>
            <span className="text-[10px] font-bold text-[#545454] uppercase tracking-widest italic">⭐ {user.role}</span>
          </div>
          <h1 className="text-6xl font-bold tracking-tighter text-black">{user.full_name}</h1>
          <p className="font-mono text-sm text-[#545454] mt-3 tracking-[0.3em] uppercase">{user.horizion_id}</p>
        </div>
        <div className="flex gap-4">
          <HzButton variant="secondary" onClick={() => router.back()}>Retornar</HzButton>
          <HzButton variant="danger" onClick={() => handleAction('suspend')}>Suspender</HzButton>
          <HzButton variant="primary" onClick={() => handleAction('strike')}>Aplicar Strike</HzButton>
        </div>
      </header>

      {/* NAVEGAÇÃO DE DOMÍNIO */}
      <nav className="px-16 border-b border-[#F2F2F2] flex gap-12 bg-white">
        {['intel', 'audit', 'sec'].map(t => (
          <button key={t} onClick={() => setActiveTab(t as any)} className={`py-6 text-[11px] font-bold uppercase tracking-[0.2em] border-b-2 transition-all ${activeTab === t ? 'border-black text-black' : 'border-transparent text-[#999]'}`}>
            {t === 'intel' ? 'Inteligência de Identidade' : t === 'audit' ? 'Logs de Auditoria' : 'Segurança & Claims'}
          </button>
        ))}
      </nav>

      <main className="flex-1 p-16 overflow-y-auto">
        {activeTab === 'intel' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* COLUNA ESQUERDA: GEO & STATUS */}
            <div className="lg:col-span-4 space-y-12">
              <section>
                <h3 className="text-[11px] font-bold text-[#545454] uppercase tracking-widest mb-6 border-l-2 border-black pl-3">Tracking de Localização</h3>
                <div className="h-96 border border-[#F2F2F2] rounded-[24px] overflow-hidden grayscale contrast-125 brightness-95">
                  <HzGeoMap center={{ lat: user.lat || -23.55, lng: user.lng || -46.63 }} markers={user.lat ? [{ id: user.id, lat: user.lat, lng: user.lng }] : []} />
                </div>
                <div className="mt-4 p-6 bg-[#FAFAFA] rounded-[16px]">
                  <p className="text-[10px] text-[#545454] uppercase font-bold tracking-wider">Endereço de Registro</p>
                  <p className="text-sm font-medium mt-2">{user.address}, {user.city} - {user.state}</p>
                </div>
              </section>
            </div>

            {/* COLUNA DIREITA: METADADOS DINÂMICOS */}
            <div className="lg:col-span-8">
              <section>
                <h3 className="text-[11px] font-bold text-[#545454] uppercase tracking-widest mb-8 border-l-2 border-black pl-3">Metadados e Blocos de Atributos</h3>
                <div className="grid grid-cols-2 gap-x-12 gap-y-12">
                   {/* Itera sobre o JSONB real do banco */}
                  {Object.entries(user.custom_data).length > 0 ? Object.entries(user.custom_data).map(([key, value]) => (
                    <div key={key} className="group border-b border-[#F2F2F2] pb-6 hover:border-black transition-colors">
                      <p className="text-[10px] font-bold text-[#545454] uppercase tracking-[0.1em] group-hover:text-black transition-colors">{key.replace('_', ' ')}</p>
                      <p className="text-xl font-medium mt-2 text-black">{String(value)}</p>
                    </div>
                  )) : (
                    <div className="col-span-2 p-12 border-2 border-dashed border-[#F2F2F2] rounded-[24px] text-center">
                      <p className="text-xs text-[#999] font-bold uppercase tracking-widest">Nenhum metadado customizado injetado.</p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="border border-[#F2F2F2] rounded-[24px] overflow-hidden bg-white shadow-sm">
             <table className="w-full text-left border-collapse">
               <thead className="bg-[#FAFAFA] text-[10px] font-bold uppercase text-[#545454]">
                 <tr>
                   <th className="p-6 border-b border-[#F2F2F2]">Evento de Sistema</th>
                   <th className="p-6 border-b border-[#F2F2F2]">Ator (Admin)</th>
                   <th className="p-6 border-b border-[#F2F2F2]">Data do Registro</th>
                 </tr>
               </thead>
               <tbody className="text-xs divide-y divide-[#F2F2F2]">
                 {auditLogs.map(log => (
                   <tr key={log.id} className="hover:bg-[#FAFAFA] transition-colors">
                     <td className="p-6 font-medium text-black">{log.action}</td>
                     <td className="p-6 font-mono text-[#545454]">{log.actor_id}</td>
                     <td className="p-6 text-[#545454]">{new Date(log.created_at).toLocaleString('pt-BR')}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        )}
      </main>
    </div>
  );
}