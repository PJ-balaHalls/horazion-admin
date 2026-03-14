'use client';

import React, { useState } from 'react';
import { HzButton, HzSkeleton } from '@/components/ui';
import { B2B_BENEFITS_DICTIONARY, BenefitsEngineConfig } from '@/types/b2b-organization';

import { PersonalizationTab } from '@/components/organizations/wizard/PersonalizationTab';
import { StrategyTab } from '@/components/organizations/wizard/StrategyTab';
import { OrgChartTab } from '@/components/organizations/wizard/OrgChartTab';
import { BenefitsTab } from '@/components/organizations/wizard/BenefitsTab';
import { OnboardingTab } from '@/components/organizations/wizard/OnboardingTab';
import { VerificationTab } from '@/components/organizations/wizard/VerificationTab';
import { ReviewTab } from '@/components/organizations/wizard/ReviewTab';

type TabId = 'personalization' | 'strategic' | 'org_chart' | 'benefits' | 'mass_onboarding' | 'verification' | 'review';

export function CreateEntityWizard({ onClose, onSave }: { onClose: () => void, onSave: (d: any) => Promise<void> }) {
  const [activeTab, setActiveTab] = useState<TabId>('personalization');
  const [loading, setLoading] = useState(false);
  const [isTabLoading, setIsTabLoading] = useState(false); // Skeleton UX Global

  const [localFiles, setLocalFiles] = useState<{ logo: File | null; cover: File | null }>({ logo: null, cover: null });
  const [previewUrls, setPreviewUrls] = useState({ logo: '', cover: '' });

  const [formData, setFormData] = useState({
    horizon_id: `ORG-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    displayName: '', slug: '', branding: { primary_color: '#E50000' },
    strategic_data: { sector: '', business_objectives: [] as string[], monitoring_kpis: [] as string[] },
    org_chart: { departments: [{ id: 'gov-1', name: 'Governança', members: [], sub_departments: [] }] },
    benefits_engine: { mode: 'custom' as any, active_bundles: [], custom_features: [], final_features: {} as BenefitsEngineConfig, total_price: 0, isCombo: false },
    mass_onboarding_list: [] as any[], verification: { has_documents: false, registration_number: '' }
  });

  const TABS = [
    { id: 'personalization', label: 'Identidade Visual' },
    { id: 'strategic', label: 'Estratégia B2B' },
    { id: 'org_chart', label: 'Organograma' },
    { id: 'benefits', label: 'Motor Comercial' },
    { id: 'mass_onboarding', label: 'Onboarding' },
    { id: 'verification', label: 'Auditoria Legal' },
    { id: 'review', label: 'Consolidar' }
  ];

  const currentTabIndex = TABS.findIndex(t => t.id === activeTab);

  const handleTabChange = (tabId: TabId) => {
    if (activeTab === tabId) return;
    setIsTabLoading(true);
    setActiveTab(tabId);
    setTimeout(() => setIsTabLoading(false), 300);
  };

  const handleNext = () => { if (currentTabIndex < TABS.length - 1) handleTabChange(TABS[currentTabIndex + 1].id as TabId); };
  const handlePrev = () => { if (currentTabIndex > 0) handleTabChange(TABS[currentTabIndex - 1].id as TabId); };

  const handleSaveWrapper = async () => {
    setLoading(true);
    try { await onSave({ ...formData, local_files: localFiles }); } 
    catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col w-full h-full bg-white animate-in fade-in duration-300">
      
      {/* HEADER IDENTICO AO USER MODAL */}
      <header className="flex-none px-10 pt-8 border-b border-gray-100 bg-white">
        <div className="max-w-5xl mx-auto flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Provisionar Entidade</h1>
            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-widest mt-1">Wizard de Criação de Organização B2B</p>
          </div>
          <HzButton variant="ghost" onClick={onClose} className="text-gray-500 text-sm font-semibold hover:text-black">Cancelar</HzButton>
        </div>

        <nav className="flex gap-8 overflow-x-auto max-w-5xl mx-auto custom-scrollbar">
          {TABS.map((tab, idx) => {
            const isActive = activeTab === tab.id;
            const isCompleted = idx < currentTabIndex;
            return (
              <button
                key={tab.id} onClick={() => handleTabChange(tab.id as TabId)}
                className={`pb-3 text-[13px] font-semibold transition-all border-b-2 whitespace-nowrap ${isActive ? 'border-[#E50000] text-gray-900' : isCompleted ? 'border-transparent text-gray-900 hover:text-[#E50000]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              >
                {String(idx + 1).padStart(2, '0')}. {tab.label}
              </button>
            );
          })}
        </nav>
      </header>

      {/* ÁREA CENTRAL COM SKELETON GLOBAL */}
      <main className="flex-1 overflow-y-auto p-10 custom-scrollbar relative bg-white">
        <div className="max-w-5xl mx-auto pb-16">
          {isTabLoading ? (
            <div className="space-y-6 animate-pulse">
               <HzSkeleton className="h-20 w-full rounded-xl" />
               <div className="grid grid-cols-2 gap-6"><HzSkeleton className="h-40 rounded-xl" /><HzSkeleton className="h-40 rounded-xl" /></div>
            </div>
          ) : (
            <div className="animate-in fade-in duration-300">
              {activeTab === 'personalization' && <PersonalizationTab formData={formData} setFormData={setFormData} setLocalFiles={setLocalFiles} previewUrls={previewUrls} setPreviewUrls={setPreviewUrls} />}
              {activeTab === 'strategic' && <StrategyTab formData={formData} setFormData={setFormData} />}
              {activeTab === 'org_chart' && <OrgChartTab formData={formData} setFormData={setFormData} />}
              {activeTab === 'benefits' && <BenefitsTab formData={formData} setFormData={setFormData} />}
              {activeTab === 'mass_onboarding' && <OnboardingTab formData={formData} setFormData={setFormData} />}
              {activeTab === 'verification' && <VerificationTab formData={formData} setFormData={setFormData} />}
              {activeTab === 'review' && <ReviewTab formData={formData} previewUrls={previewUrls} onSave={handleSaveWrapper} onClose={onClose} loading={loading} />}
            </div>
          )}
        </div>
      </main>

      {/* FOOTER IDENTICO AO USER MODAL */}
      <footer className="flex-none px-10 py-5 border-t border-gray-100 flex justify-center bg-white z-20">
        <div className="flex justify-between w-full max-w-5xl">
          <HzButton variant="ghost" onClick={handlePrev} disabled={currentTabIndex === 0 || isTabLoading} className="text-sm font-semibold text-gray-500 hover:text-gray-900">Voltar</HzButton>
          {currentTabIndex < TABS.length - 1 ? (
            <HzButton className="bg-gray-900 text-white text-sm font-semibold px-6 py-2 rounded-lg hover:bg-[#E50000] transition-colors" onClick={handleNext} disabled={isTabLoading}>Avançar</HzButton>
          ) : (
            <HzButton className="bg-[#E50000] text-white text-sm font-semibold px-8 py-2 rounded-lg hover:bg-red-700 transition-colors" onClick={handleSaveWrapper} disabled={loading || isTabLoading}>{loading ? 'A processar...' : 'Instanciar Entidade'}</HzButton>
          )}
        </div>
      </footer>
    </div>
  );
}