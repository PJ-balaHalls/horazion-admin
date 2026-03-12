// src/app/(dashboard)/users/[id]/page.tsx
'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { HzButton, HzBadge, HzSkeleton } from '@/components/ui';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

// Importação de TODOS os seus módulos horizontais (As abas originais não foram descartadas)
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
  const [activeTab, setActiveTab] = useState<UserTabId>('overview'); // Estado global das abas

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const { data } = await supabase.from('profiles').select('*').eq('id', resolvedParams.id).single();
        setUserProfile(data);
      } catch (error) {
        console.error("Erro ao carregar utilizador:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [resolvedParams.id]);

  // 1ª Camada de Proteção: Skeleton Progressivo
  if (loading) {
    return (
      <div className="p-10 max-w-7xl mx-auto space-y-6">
        <HzButton variant="ghost" disabled className="p-2"><ArrowLeftIcon className="w-5 h-5 text-gray-300"/></HzButton>
        <div className="space-y-4">
          <HzSkeleton className="h-12 w-1/3" />
          <HzSkeleton className="h-6 w-32" />
        </div>
        <HzSkeleton className="h-64 w-full mt-10 rounded-xl" />
      </div>
    );
  }

  // 2ª Camada de Proteção: Tratamento de Fallback
  if (!userProfile) {
    return (
      <div className="p-10 max-w-7xl mx-auto text-center space-y-4">
        <h2 className="text-2xl font-bold text-black">Perfil não encontrado</h2>
        <p className="text-gray-500 text-sm">O Horizion ID solicitado não existe na base de dados.</p>
        <HzButton onClick={() => router.push('/users/list')} variant="ghost">Voltar à Listagem</HzButton>
      </div>
    );
  }

  // Definição das abas (Preservando as originais e adicionando a B2B no final)
  const tabs: { id: UserTabId; label: string }[] = [
    { id: 'overview', label: 'Visão Geral' },
    { id: 'data', label: 'Dados Pessoais' },
    { id: 'security', label: 'Segurança & Acessos' },
    { id: 'settings', label: 'Preferências (LGPD)' },
    { id: 'affiliations', label: 'Associações (B2B)' },
  ];

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-8">
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
            <HzBadge variant="info">{userProfile.role}</HzBadge>
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">ID: {userProfile.id}</span>
          </div>
        </div>
      </div>
      
      {/* NAVEGAÇÃO DE ABAS (Instântanea - State Driven) */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id 
                  ? 'border-[#B6192E] text-[#B6192E]' 
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* RENDERIZAÇÃO CONDICIONAL DOS MÓDULOS */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 min-h-[400px]">
         {activeTab === 'overview' && <UserOverviewTab userId={resolvedParams.id} />}
         {activeTab === 'data' && <UserDataTab userId={resolvedParams.id} />}
         {activeTab === 'security' && <UserSecurityTab userId={resolvedParams.id} />}
         {activeTab === 'settings' && <UserSettingsTab userId={resolvedParams.id} />}
         {activeTab === 'affiliations' && <UserAffiliationsTab userId={resolvedParams.id} />}
      </div>
    </div>
  );
}