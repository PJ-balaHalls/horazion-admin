// src/app/(dashboard)/users/[id]/page.tsx
'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { HzButton, HzBadge, HzSkeleton } from '@/components/ui';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

import { UserOverviewTab } from '@/components/users/details/UserOverviewTab';
import { UserDataTab } from '@/components/users/details/UserDataTab';
import { UserSecurityTab } from '@/components/users/details/UserSecurityTab';
import { UserSettingsTab } from '@/components/users/details/UserSettingsTab';
import { UserAffiliationsTab } from '@/components/users/details/UserAffiliationsTab';

type UserTabId = 'overview' | 'data' | 'security' | 'settings' | 'affiliations';

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<UserTabId>('overview');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        // [BD-HZ] Consulta principal de perfil
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', resolvedParams.id)
          .single();
          
        if (error) throw error;
        setUserProfile(data);
      } catch (error) {
        console.error("[CORE-HZ] Falha ao recuperar identidade digital:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="p-10 max-w-7xl mx-auto space-y-6 animate-in fade-in">
        <HzButton variant="ghost" disabled className="p-2"><ArrowLeftIcon className="w-5 h-5 text-[#E5E5E5]"/></HzButton>
        <div className="space-y-4">
          <HzSkeleton className="h-12 w-1/3 rounded-md" />
          <HzSkeleton className="h-6 w-32 rounded-md" />
        </div>
        <HzSkeleton className="h-[400px] w-full mt-10 rounded-[16px]" />
      </div>
    );
  }

  // [FE-HZ] Prevenção Zero Trust: Renderização interrompida se o dado falhar
  if (!userProfile) {
    return (
      <div className="p-10 max-w-7xl mx-auto text-center space-y-4">
        <h2 className="text-2xl font-bold text-black tracking-tight">Perfil não encontrado</h2>
        <p className="text-[#545454] text-sm">A Identidade Digital solicitada não existe ou o acesso foi negado (RLS).</p>
        <HzButton onClick={() => router.push('/users/list')} variant="ghost" className="mt-4">Voltar à Listagem</HzButton>
      </div>
    );
  }

  const tabs: { id: UserTabId; label: string }[] = [
    { id: 'overview', label: 'Visão Geral' },
    { id: 'data', label: 'Dados Pessoais' },
    { id: 'security', label: 'Segurança & Acessos' },
    { id: 'settings', label: 'Preferências (LGPD)' },
    { id: 'affiliations', label: 'Associações (B2B)' },
  ];

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in">
      {/* HEADER DO PERFIL */}
      <div className="flex items-start gap-4">
        <HzButton variant="ghost" onClick={() => router.push('/users/list')} className="p-2 mt-1">
          <ArrowLeftIcon className="w-5 h-5"/>
        </HzButton>
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-black">
            {userProfile.full_name || 'Utilizador Sem Nome'}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <HzBadge variant="info">{userProfile.role || 'user'}</HzBadge>
            <span className="text-[10px] font-mono text-[#A0A0A0] uppercase tracking-widest">ID: {userProfile.id}</span>
          </div>
        </div>
      </div>
      
      {/* NAVEGAÇÃO DE ABAS */}
      <div className="border-b border-[#F2F2F2]">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id 
                  ? 'border-[#B6192E] text-[#B6192E]' 
                  : 'border-transparent text-[#A0A0A0] hover:text-black'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* RENDERIZAÇÃO ESTRUTURAL DOS MÓDULOS */}
      <div className="bg-white rounded-[16px] border border-[#F2F2F2] p-8 min-h-[400px]">
         {/* Abas que consomem o perfil principal */}
         {activeTab === 'overview' && <UserOverviewTab user={userProfile} />}
         {activeTab === 'data' && <UserDataTab user={userProfile} />}
         {activeTab === 'settings' && <UserSettingsTab user={userProfile} />}
         {activeTab === 'affiliations' && <UserAffiliationsTab user={userProfile} />}
         
         {/* Aba que gere os seus próprios pedidos à base de dados */}
         {activeTab === 'security' && <UserSecurityTab userId={resolvedParams.id} />}
      </div>
    </div>
  );
}