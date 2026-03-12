// src/app/(dashboard)/organizations/[id]/page.tsx
'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { entityService } from '@/services/entityService';
import { Entity } from '@/types/horizion';
import { HzButton, HzBadge, HzSkeleton } from '@/components/ui';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

type TabId = 'overview' | 'billing' | 'governance' | 'resources';

export default function OrganizationDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [entity, setEntity] = useState<Entity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  useEffect(() => {
    const fetchEntity = async () => {
      try {
        const data = await entityService.getEntityById(resolvedParams.id);
        setEntity(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEntity();
  }, [resolvedParams.id]);

  if (isLoading) {
    return (
      <div className="p-10 max-w-7xl mx-auto space-y-6">
        <div className="flex gap-4">
          <HzSkeleton className="h-16 w-16 rounded-xl" />
          <div className="space-y-2">
            <HzSkeleton className="h-8 w-64" />
            <HzSkeleton className="h-4 w-32" />
          </div>
        </div>
        <HzSkeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!entity) return <div className="p-10 text-center text-gray-500">Entidade não encontrada.</div>;

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Visão Geral' },
    { id: 'governance', label: 'Governança & Identidade' },
    { id: 'billing', label: 'Faturação & Planos' },
    { id: 'resources', label: 'Limites de Recursos' },
  ];

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex items-start gap-4">
        <HzButton variant="ghost" onClick={() => router.push('/organizations')} className="p-2 mt-2"><ArrowLeftIcon className="w-5 h-5"/></HzButton>
        <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden">
          {entity.logo_url ? <img src={entity.logo_url} className="w-full h-full object-cover" /> : <span className="text-gray-400 font-bold">ORG</span>}
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-black">{entity.display_name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <HzBadge variant={entity.status === 'active' ? 'success' : 'warning'}>{entity.status}</HzBadge>
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">ID: {entity.id}</span>
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">/ {entity.slug}</span>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id ? 'border-[#B6192E] text-[#B6192E]' : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8 min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div><span className="text-gray-500 block mb-1">CNPJ / Tax ID</span><span className="text-black font-medium">{entity.cnpj || 'Não definido'}</span></div>
            <div><span className="text-gray-500 block mb-1">Setor</span><span className="text-black font-medium">{entity.sector || 'Não definido'}</span></div>
            <div><span className="text-gray-500 block mb-1">Website</span><span className="text-black font-medium">{entity.website || 'Não definido'}</span></div>
          </div>
        )}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-black">Detalhes Financeiros</h3>
            <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center">
              <div>
                <div className="text-sm font-bold text-black">Plano Atual: <span className="uppercase text-[#B6192E]">{entity.billing_info?.plan || 'Free'}</span></div>
                <div className="text-xs text-gray-500 mt-1">Ciclo de cobrança: {entity.billing_info?.billing_cycle}</div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'resources' && (
           <div className="space-y-6">
             <h3 className="text-lg font-bold text-black">Uso de Recursos</h3>
             <div className="space-y-2">
               <div className="flex justify-between text-sm">
                 <span className="text-gray-600 font-medium">Assentos Ocupados (Seats)</span>
                 <span className="text-black font-bold">0 / {entity.resource_limits?.max_users || 10}</span>
               </div>
               <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                 <div className="bg-[#B6192E] h-2 rounded-full w-0"></div>
               </div>
             </div>
           </div>
        )}
        {activeTab === 'governance' && (
          <div className="text-sm text-gray-500">Configurações de identidade visual, cores primárias e controlo hierárquico serão carregados aqui.</div>
        )}
      </div>
    </div>
  );
}