// src/app/(dashboard)/organizations/[id]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { entityService } from '@/services/entityService';
import { HzButton, HzSkeleton, HzBadge } from '@/components/ui';
import { BuildingOfficeIcon, ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

// Importação das Sub-Abas (Delegação de Domínio)
import { EntityCoreTab } from '@/components/organizations/details/EntityCoreTab';
import { EntityBenefitsTab } from '@/components/organizations/details/EntityBenefitsTab';
import { EntityBillingTab } from '@/components/organizations/details/EntityBillingTab';
import { EntityStrategyTab } from '@/components/organizations/details/EntityStrategyTab';
import { EntityOrgChartTab } from '@/components/organizations/details/EntityOrgChartTab';

type TabId = 'core' | 'strategy' | 'orgchart' | 'benefits' | 'billing' | 'media' | 'members';

export default function EntityManagementPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [entity, setEntity] = useState<any>(null);
  const [formData, setFormData] = useState<any>(null); // Cópia mutável para edição
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('core');

  const loadEntity = async () => {
    setLoading(true);
    try {
      const data = await entityService.getEntityById(id as string);
      setEntity(data);
      setFormData(data); // Inicia o formulário com o espelho exato do banco
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
      // Envia o formData completo para a Anti-Corruption Layer no Service
      await entityService.updateEntity(id as string, formData);
      await loadEntity(); // Atualiza a verdade a partir do banco (aciona os triggers de sync)
    } catch (error) {
      console.error('Falha ao atualizar entidade', error);
    } finally {
      setSaving(false);
    }
  };

  // UX de Alta Retenção: Skeleton Screen de Alta Fidelidade
  if (loading) {
    return (
      <div className="p-10 max-w-7xl mx-auto space-y-8 animate-pulse">
        <div className="flex items-center gap-4">
          <HzSkeleton className="w-16 h-16 rounded-2xl" />
          <div className="space-y-2">
            <HzSkeleton className="h-8 w-64 rounded-lg" />
            <HzSkeleton className="h-4 w-32 rounded-lg" />
          </div>
        </div>
        <div className="flex gap-8 border-b border-gray-100 pb-2 mt-8">
          <HzSkeleton className="h-8 w-32 rounded-md" />
          <HzSkeleton className="h-8 w-32 rounded-md" />
          <HzSkeleton className="h-8 w-32 rounded-md" />
        </div>
        <HzSkeleton className="h-[500px] w-full rounded-3xl" />
      </div>
    );
  }

  if (!entity || !formData) {
    return (
      <div className="p-10 text-center flex flex-col items-center justify-center min-h-[400px]">
        <BuildingOfficeIcon className="w-16 h-16 text-gray-200 mb-4" />
        <h2 className="text-xl font-bold text-gray-700">Entidade não encontrada</h2>
        <p className="text-sm text-gray-500 mt-2">O registo pode ter sido removido ou não tem permissões para o visualizar.</p>
        <HzButton onClick={() => router.push('/organizations')} variant="ghost" className="mt-6 border border-gray-200">
          Voltar para Organizações
        </HzButton>
      </div>
    );
  }

  // Compara o estado atual com o original para habilitar o botão de salvar
  const hasChanges = JSON.stringify(entity) !== JSON.stringify(formData);

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* HEADER DA ENTIDADE */}
      <header className="flex items-center justify-between bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
        {/* Detalhe de design: Linha sutil no topo simulando o branding color */}
        <div 
          className="absolute top-0 left-0 w-full h-1" 
          style={{ backgroundColor: formData.metadata?.branding?.primary_color || '#E50000' }}
        />
        
        <div className="flex items-center gap-5 z-10">
          <HzButton variant="ghost" onClick={() => router.push('/organizations')} className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50">
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </HzButton>
          <div className="w-16 h-16 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center overflow-hidden">
            {formData.logo_url ? <img src={formData.logo_url} className="w-full h-full object-cover" alt="Logo" /> : <BuildingOfficeIcon className="w-8 h-8 text-gray-300"/>}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black tracking-tight text-gray-900">{formData.display_name}</h1>
              {formData.is_verified && <CheckCircleIcon className="w-6 h-6 text-blue-500" title="Organização Verificada" />}
              <HzBadge variant={formData.status === 'active' ? 'success' : 'warning'}>
                {formData.status === 'active' ? 'Ativo' : formData.status}
              </HzBadge>
            </div>
            <p className="text-sm font-mono text-gray-400 mt-1 uppercase tracking-widest">
              {formData.slug} • CNPJ: {formData.cnpj || 'N/A'} • {formData.category}
            </p>
          </div>
        </div>

        {/* Action Button Fixo */}
        <div className="flex flex-col items-end gap-2 z-10">
          <HzButton 
            onClick={handleUpdate} 
            disabled={!hasChanges || saving} 
            className={`${hasChanges ? 'bg-[#E50000] hover:bg-red-700 text-white shadow-md' : 'bg-gray-100 text-gray-400 cursor-not-allowed'} font-bold px-8 py-3 rounded-xl transition-all`}
          >
            {saving ? 'Sincronizando...' : hasChanges ? 'Gravar Alterações' : 'Tudo Sincronizado'}
          </HzButton>
          {hasChanges && <span className="text-xs text-[#E50000] font-medium animate-pulse">Existem alterações não salvas</span>}
        </div>
      </header>

      {/* TABS DE NAVEGAÇÃO */}
      <nav className="flex gap-8 border-b border-gray-200 px-4 overflow-x-auto custom-scrollbar">
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
            className={`pb-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-[#E50000] text-gray-900' 
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* RENDERIZAÇÃO CONDICIONAL DAS ABAS */}
      <main className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm min-h-[500px]">
        {activeTab === 'core' && <EntityCoreTab formData={formData} setFormData={setFormData} />}
        {activeTab === 'strategy' && <EntityStrategyTab formData={formData} setFormData={setFormData} />}
        {activeTab === 'orgchart' && <EntityOrgChartTab formData={formData} setFormData={setFormData} />}
        {activeTab === 'benefits' && <EntityBenefitsTab formData={formData} setFormData={setFormData} />}
        {activeTab === 'billing' && <EntityBillingTab formData={formData} setFormData={setFormData} />}
        
        {/* Placeholders para as próximas iterações */}
        {activeTab === 'media' && (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-100 rounded-2xl">
            <h3 className="text-lg font-bold text-gray-700">Módulo de Mídia e Buckets</h3>
            <p className="text-sm text-gray-500 mt-2 max-w-md">Em breve: Upload direto para os buckets Edge CDN do Supabase, gestão de isologo, covers e paleta de cores.</p>
          </div>
        )}
        {activeTab === 'members' && (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-100 rounded-2xl">
            <h3 className="text-lg font-bold text-gray-700">Grafo de Afiliações</h3>
            <p className="text-sm text-gray-500 mt-2 max-w-md">Em breve: Relacionamento nativo com `admin.user_affiliations`. Vinculação de HorizionIDs a departamentos da organização.</p>
          </div>
        )}
      </main>
    </div>
  );
}