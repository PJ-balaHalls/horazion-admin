'use client';

import React, { use, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { HorizionUser } from '@/types/horizion';
import { HzGeoMap } from '@/components/ui/HzGeoMap';
import { HzButton } from '@/components/ui/HzButton';

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [user, setUser] = useState<HorizionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
      if (data) setUser(data);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <div className="p-20 text-center animate-pulse">Sincronizando...</div>;
  if (!user) return <div className="p-20 text-center">Usuário inexistente.</div>;

  return (
    <div className="bg-white min-h-screen animate-fade-in">
      <header className="p-10 border-b border-[#F2F2F2] flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter">{user.full_name}</h1>
          <p className="font-mono text-sm text-[#545454] tracking-widest">{user.horizion_id}</p>
        </div>
        <div className="flex gap-3">
          <HzButton variant="danger">Suspender Conta</HzButton>
          <HzButton variant="primary">Notificar Atualização</HzButton>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="p-10 border-r border-[#F2F2F2] space-y-8">
          <section>
            <h3 className="text-[10px] font-bold text-[#545454] uppercase tracking-widest mb-4">Localização Tracking</h3>
            <div className="h-64 border border-[#F2F2F2] rounded-[12px] overflow-hidden">
              <HzGeoMap center={{ lat: user.lat || 0, lng: user.lng || 0 }} markers={user.lat ? [{ id: user.id, lat: user.lat, lng: user.lng }] : []} />
            </div>
          </section>
        </div>

        <div className="col-span-2 p-10">
          <h3 className="text-[10px] font-bold text-[#545454] uppercase tracking-widest mb-6">Dados de Identidade</h3>
          <div className="grid grid-cols-2 gap-10">
            {Object.entries(user.custom_data).map(([key, value]) => (
              <div key={key} className="border-b border-[#F2F2F2] pb-2">
                <p className="text-[10px] font-bold text-[#545454] uppercase">{key}</p>
                <p className="text-lg font-medium">{String(value)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div'use client';

import React, { use, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { HorizionUser } from '@/types/horizion';
import { HzGeoMap } from '@/components/ui/HzGeoMap';
import { HzButton } from '@/components/ui/HzButton';
import { useRouter } from 'next/navigation';

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [user, setUser] = useState<HorizionUser | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'audit' | 'sec'>('info');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
      if (data) setUser(data as HorizionUser);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><div className="w-12 h-12 border-4 border-[#F2F2F2] border-t-black rounded-full animate-spin" /></div>;
  if (!user) return <div className="p-20 text-center bg-white">Identidade não encontrada.</div>;

  return (
    <div className="bg-white min-h-screen animate-fade-in flex flex-col">
      <header className="px-12 py-10 border-b border-[#F2F2F2] flex justify-between items-end bg-white">
        <div>
          <span className="text-[10px] font-bold text-[#545454] uppercase tracking-widest mb-2 block">⭐ {user.role}</span>
          <h1 className="text-5xl font-bold tracking-tighter text-black">{user.full_name}</h1>
          <p className="font-mono text-xs text-[#545454] mt-2 tracking-widest">{user.horizion_id}</p>
        </div>
        <div className="flex gap-3">
          <HzButton variant="secondary" onClick={() => router.back()}>Voltar</HzButton>
          <HzButton variant="danger">Suspender Conta</HzButton>
          <HzButton variant="primary">Notificar Atualização</HzButton>
        </div>
      </header>

      <nav className="px-12 border-b border-[#F2F2F2] flex gap-8 bg-white">
        {['info', 'audit', 'sec'].map(t => (
          <button key={t} onClick={() => setActiveTab(t as any)} className={`py-4 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === t ? 'border-black text-black' : 'border-transparent text-[#545454]'}`}>
            {t === 'info' ? 'Inteligência' : t === 'audit' ? 'Auditoria' : 'Segurança'}
          </button>
        ))}
      </nav>

      <main className="flex-1 p-12 overflow-y-auto">
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="space-y-8">
              <section>
                <h3 className="text-[10px] font-bold text-[#545454] uppercase tracking-widest mb-4">Localização Geográfica</h3>
                <div className="h-80 border border-[#F2F2F2] rounded-[12px] overflow-hidden grayscale contrast-125">
                  <HzGeoMap center={{ lat: user.lat || -23.55, lng: user.lng || -46.63 }} markers={user.lat ? [{ id: user.id, lat: user.lat, lng: user.lng }] : []} />
                </div>
                <p className="text-[10px] text-[#545454] mt-2 uppercase tracking-tight">{user.city}, {user.state} — {user.country}</p>
              </section>
            </div>

            <div className="lg:col-span-2 space-y-12">
              <section>
                <h3 className="text-[10px] font-bold text-[#545454] uppercase tracking-widest mb-6 border-b pb-2">Metadados e Atributos Dinâmicos</h3>
                <div className="grid grid-cols-2 gap-y-10 gap-x-12">
                  <div className="border-l-2 border-black pl-4">
                    <p className="text-[10px] font-bold text-[#545454] uppercase">Endereço Registrado</p>
                    <p className="text-sm font-medium mt-1">{user.address || 'Não informado'}</p>
                  </div>
                  {Object.entries(user.custom_data).map(([key, value]) => (
                    <div key={key} className="border-l border-[#F2F2F2] pl-4">
                      <p className="text-[10px] font-bold text-[#545454] uppercase tracking-wider">{key.replace('_', ' ')}</p>
                      <p className="text-sm font-medium mt-1">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="border border-[#F2F2F2] rounded-[12px] overflow-hidden">
             <table className="w-full text-left">
               <thead className="bg-[#FAFAFA] text-[10px] font-bold uppercase text-[#545454]">
                 <tr><th className="p-4">Evento</th><th className="p-4">IP</th><th className="p-4">Data</th></tr>
               </thead>
               <tbody className="text-xs divide-y divide-[#F2F2F2]">
                 <tr><td className="p-4">Criação de Identidade</td><td className="p-4">Sincronizado</td><td className="p-4">{new Date(user.created_at).toLocaleString()}</td></tr>
               </tbody>
             </table>
          </div>
        )}
      </main>
    </div>
  );
}
  );
}