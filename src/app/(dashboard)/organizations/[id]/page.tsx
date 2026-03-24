// src/app/(dashboard)/organizations/[id]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { entityService } from '@/services/entityService';
import { HzButton, HzSkeleton, HzBadge } from '@/components/ui';
import { BuildingOfficeIcon, ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

// Importação das Sub-Abas
import { EntityCoreTab } from '@/components/organizations/details/EntityCoreTab';
import { EntityBenefitsTab } from '@/components/organizations/details/EntityBenefitsTab';
import { EntityBillingTab } from '@/components/organizations/details/EntityBillingTab';
import { EntityStrategyTab } from '@/components/organizations/details/EntityStrategyTab';
import { EntityOrgChartTab } from '@/components/organizations/details/EntityOrgChartTab';
import { EntityMediaTab } from '@/components/organizations/details/EntityMediaTab';
import { EntityMembersTab } from '@/components/organizations/details/EntityMembersTab';

type TabId = 'core' | 'strategy' | 'orgchart' | 'benefits' | 'billing' | 'media' | 'members';

export default function EntityManagementPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [entity, setEntity] = useState<any>(null);
  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('core');

  const loadEntity = async () => {
    setLoading(true);
    try {
      const data = await entityService.getEntityById(id as string);
      setEntity(data);
      setFormData(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadEntity(); }, [id]);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await entityService.updateEntity(id as string, formData);
      await loadEntity(); 
    } catch (error) {
      console.error('Falha ao atualizar entidade', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10 max-w-7xl mx-auto space-y-8 animate-pulse">
        <div className="flex items-center gap-4"><HzSkeleton className="w-16 h-16 rounded-2xl" /><div className="space-y-2"><HzSkeleton className="h-8 w-64 rounded-lg" /><HzSkeleton className="h-4 w-32 rounded-lg" /></div></div>
        <div className="flex gap-8 border-b border-[#F2F2F2] pb-2 mt-8"><HzSkeleton className="h-8 w-32 rounded-md" /><HzSkeleton className="h-8 w-32 rounded-md" /><HzSkeleton className="h-8 w-32 rounded-md" /></div>
        <HzSkeleton className="h-[500px] w-full rounded-[12px]" />
      </div>
    );
  }

  if (!entity || !formData) {
    return (
      <div className="p-10 text-center flex flex-col items-center justify-center min-h-[400px]">
        <BuildingOfficeIcon className="w-16 h-16 text-[#F2F2F2] mb-4" />
        <h2 className="text-xl font-bold text-black">Entidade não encontrada</h2>
        <HzButton onClick={() => router.push('/organizations')} variant="ghost" className="mt-6 border border-[#F2F2F2]">Voltar para Organizações</HzButton>
      </div>
    );
  }

  const hasChanges = JSON.stringify(entity) !== JSON.stringify(formData);

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      <header className="flex items-center justify-between bg-white p-6 rounded-[12px] border border-[#F2F2F2] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: formData.metadata?.branding?.primary_color || '#B6192E' }} />
        
        <div className="flex items-center gap-5 z-10">
          <HzButton variant="ghost" onClick={() => router.push('/organizations')} className="p-3 border border-[#F2F2F2] rounded hover:bg-[#FAFAFA]">
            <ArrowLeftIcon className="w-5 h-5 text-black" />
          </HzButton>
          <div className="w-16 h-16 bg-[#FAFAFA] rounded border border-[#F2F2F2] flex items-center justify-center overflow-hidden">
            {formData.logo_url ? <img src={formData.logo_url} className="w-full h-full object-cover" alt="Logo" /> : <BuildingOfficeIcon className="w-8 h-8 text-[#A0A0A0]"/>}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black tracking-tight text-black">{formData.display_name}</h1>
              {formData.is_verified && <CheckCircleIcon className="w-6 h-6 text-black" title="Organização Verificada" />}
              <span className={`text-[9px] font-bold px-2 py-1 rounded uppercase tracking-widest ${formData.status === 'active' ? 'border border-black text-black' : 'border border-[#B6192E]/20 text-[#B6192E] bg-[#B6192E]/5'}`}>
                {formData.status === 'active' ? 'Ativo' : formData.status}
              </span>
            </div>
            <p className="text-sm font-mono text-[#A0A0A0] mt-1 uppercase tracking-widest">
              {formData.slug} • CNPJ: {formData.cnpj || 'N/A'} • {formData.category || 'ORG'}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 z-10">
          <HzButton onClick={handleUpdate} disabled={!hasChanges || saving} className={`${hasChanges ? 'bg-black hover:bg-[#B6192E] text-white' : 'bg-[#FAFAFA] text-[#A0A0A0] border border-[#F2F2F2] cursor-not-allowed'} text-xs font-bold px-6 py-2.5 rounded transition-all uppercase tracking-widest`}>
            {saving ? 'Sincronizando...' : hasChanges ? 'Gravar Alterações' : 'Tudo Sincronizado'}
          </HzButton>
          {hasChanges && <span className="text-[10px] text-[#B6192E] font-bold uppercase tracking-widest animate-pulse">Alterações Pendentes</span>}
        </div>
      </header>

      <nav className="flex gap-8 border-b border-[#F2F2F2] px-4 overflow-x-auto custom-scrollbar">
        {[
          { id: 'core', label: 'Dados Estruturais' },
          { id: 'strategy', label: 'Estratégia & Metas' },
          { id: 'orgchart', label: 'Organograma' },
          { id: 'benefits', label: 'Motor de Benefícios' },
          { id: 'billing', label: 'Faturamento & Limites' },
          { id: 'media', label: 'Branding & Mídia' },
          { id: 'members', label: 'Grafo de Afiliações' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabId)}
            className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${
              activeTab === tab.id ? 'border-black text-black' : 'border-transparent text-[#A0A0A0] hover:text-black'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="bg-white rounded-[12px] border border-[#F2F2F2] p-8 min-h-[500px]">
        {activeTab === 'core' && <EntityCoreTab formData={formData} setFormData={setFormData} />}
        {activeTab === 'strategy' && <EntityStrategyTab formData={formData} setFormData={setFormData} />}
        {activeTab === 'orgchart' && <EntityOrgChartTab formData={formData} setFormData={setFormData} />}
        {activeTab === 'benefits' && <EntityBenefitsTab formData={formData} setFormData={setFormData} />}
        {activeTab === 'billing' && <EntityBillingTab formData={formData} setFormData={setFormData} />}
        {activeTab === 'media' && <EntityMediaTab formData={formData} setFormData={setFormData} />}
        {activeTab === 'members' && <EntityMembersTab entityId={id as string} />}
      </main>
    </div>
  );
}