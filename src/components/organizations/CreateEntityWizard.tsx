'use client';

import React, { useState } from 'react';
import { HzButton } from '@/components/ui';
import { B2B_BENEFITS_DICTIONARY, BenefitsEngineConfig } from '@/types/b2b-organization';
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';

import { PersonalizationTab } from '@/components/organizations/wizard/PersonalizationTab';
import { StrategyTab } from '@/components/organizations/wizard/StrategyTab';
import { OrgChartTab } from '@/components/organizations/wizard/OrgChartTab';
import { BenefitsTab } from '@/components/organizations/wizard/BenefitsTab';
import { OnboardingTab } from '@/components/organizations/wizard/OnboardingTab';
import { VerificationTab } from '@/components/organizations/wizard/VerificationTab';
import { ReviewTab } from '@/components/organizations/wizard/ReviewTab';

type TabId = 'personalization' | 'strategic' | 'org_chart' | 'benefits' | 'mass_onboarding' | 'verification' | 'review';
export interface OrgDepartment { id: string; name: string; members: any[]; sub_departments: OrgDepartment[]; }

export function CreateEntityWizard({ onClose, onSave }: { onClose: () => void, onSave: (d: any) => Promise<void> }) {
  const [activeTab, setActiveTab] = useState<TabId>('personalization');
  const [loading, setLoading] = useState(false);

  const [localFiles, setLocalFiles] = useState<{ logo: File | null; cover: File | null }>({ logo: null, cover: null });
  const [previewUrls, setPreviewUrls] = useState({ logo: '', cover: '' });

  const [formData, setFormData] = useState({
    horizon_id: `ORG-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    displayName: '',
    slug: '',
    branding: { primary_color: '#E50000' },
    strategic_data: { sector: '', business_objectives: [] as string[], monitoring_kpis: [] as string[] },
    org_chart: { departments: [{ id: 'gov-1', name: 'Governança Corporativa', members: [], sub_departments: [] }] as OrgDepartment[] },
    benefits_engine: { mode: 'custom' as 'bundle' | 'custom', active_bundles: [] as string[], custom_features: [] as string[], final_features: {} as BenefitsEngineConfig, total_price: 0, isCombo: false },
    mass_onboarding_list: [] as any[],
    verification: { has_documents: false, registration_number: '' }
  });

  const TABS = [
    { id: 'personalization', label: '1. Identidade Visual' },
    { id: 'strategic', label: '2. Estratégia B2B' },
    { id: 'org_chart', label: '3. Organograma' },
    { id: 'benefits', label: '4. Motor Comercial' },
    { id: 'mass_onboarding', label: '5. Onboarding' },
    { id: 'verification', label: '6. Validação (KYB)' },
    { id: 'review', label: '7. Consolidar' }
  ];

  const currentTabIndex = TABS.findIndex(t => t.id === activeTab);

  const handleNext = () => { if (currentTabIndex < TABS.length - 1) setActiveTab(TABS[currentTabIndex + 1].id as TabId); };
  const handlePrev = () => { if (currentTabIndex > 0) setActiveTab(TABS[currentTabIndex - 1].id as TabId); };

  const handleSaveWrapper = async () => {
    setLoading(true);
    try { await onSave({ ...formData, local_files: localFiles }); } 
    catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  return (
    // ZERO BORDAS (Sem rounded, sem border, sem shadow). Ele FUDE-SE ao layout pai nativamente.
    <div className="flex flex-col w-full h-full bg-white animate-in fade-in duration-300">
      
      {/* Top Header & Tabs (Ocupa 100% da largura, dividindo espaço com a sidebar global) */}
      <header className="flex-none px-12 pt-10 border-b border-gray-100 bg-white">
        <div className="flex justify-between items-start mb-10 max-w-7xl mx-auto">
          <div>
            <h1 className="text-4xl font-black text-black tracking-tight">Provisionar Nova Entidade</h1>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest border border-gray-200 px-4 py-1.5 rounded-full">
                ID: {formData.horizon_id}
              </span>
              <span className="text-xs font-black text-[#E50000] uppercase tracking-widest bg-red-50 px-4 py-1.5 rounded-full">
                Etapa {currentTabIndex + 1} de {TABS.length}
              </span>
            </div>
          </div>
          <HzButton 
            variant="ghost" 
            onClick={onClose} 
            className="text-gray-400 font-bold hover:text-black hover:bg-gray-50 border border-transparent rounded-xl px-6 py-3 transition-all"
          >
            Cancelar Operação
          </HzButton>
        </div>

        <nav className="flex gap-10 overflow-x-auto custom-scrollbar max-w-7xl mx-auto">
          {TABS.map((tab, idx) => {
            const isActive = activeTab === tab.id;
            const isCompleted = idx < currentTabIndex;

            return (
              <button
                key={tab.id} 
                onClick={() => setActiveTab(tab.id as TabId)}
                className={`pb-5 text-sm font-black transition-all border-b-2 whitespace-nowrap px-2 ${
                  isActive 
                    ? 'border-[#E50000] text-[#E50000]' 
                    : isCompleted 
                      ? 'border-transparent text-black hover:text-[#E50000]'
                      : 'border-transparent text-gray-300 hover:text-gray-500'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Main Form Area */}
      <main className="flex-1 overflow-y-auto p-12 bg-white custom-scrollbar relative">
        <div className="max-w-6xl mx-auto pb-12">
          {activeTab === 'personalization' && <PersonalizationTab formData={formData} setFormData={setFormData} setLocalFiles={setLocalFiles} previewUrls={previewUrls} setPreviewUrls={setPreviewUrls} />}
          {activeTab === 'strategic' && <StrategyTab formData={formData} setFormData={setFormData} />}
          {activeTab === 'org_chart' && <OrgChartTab formData={formData} setFormData={setFormData} />}
          {activeTab === 'benefits' && <BenefitsTab formData={formData} setFormData={setFormData} />}
          {activeTab === 'mass_onboarding' && <OnboardingTab formData={formData} setFormData={setFormData} />}
          {activeTab === 'verification' && <VerificationTab formData={formData} setFormData={setFormData} />}
          {activeTab === 'review' && <ReviewTab formData={formData} previewUrls={previewUrls} onSave={handleSaveWrapper} onClose={onClose} loading={loading} />}
        </div>
      </main>

      {/* Footer Fixo */}
      <footer className="flex-none px-12 py-6 border-t border-gray-100 bg-white flex justify-between items-center z-10">
        <div className="max-w-7xl mx-auto w-full flex justify-between">
          <HzButton 
            variant="ghost" 
            onClick={handlePrev} 
            disabled={currentTabIndex === 0} 
            className="text-gray-400 font-black hover:text-black hover:bg-gray-50 border border-transparent disabled:opacity-30 disabled:hover:bg-transparent flex gap-2 items-center px-8 py-4 rounded-xl transition-all"
          >
            <ChevronLeftIcon className="w-5 h-5 font-black"/> Voltar
          </HzButton>

          {currentTabIndex < TABS.length - 1 ? (
            <HzButton onClick={handleNext} className="bg-black hover:bg-[#E50000] text-white font-black flex gap-2 items-center px-10 py-4 rounded-xl shadow-md transition-colors">
              Avançar <ChevronRightIcon className="w-5 h-5 font-black"/>
            </HzButton>
          ) : (
            <HzButton onClick={handleSaveWrapper} disabled={loading} className="bg-[#E50000] hover:bg-red-700 text-white font-black px-12 py-4 rounded-xl shadow-lg transition-colors disabled:opacity-50">
              {loading ? 'Processando...' : 'Concluir e Instanciar Entidade'}
            </HzButton>
          )}
        </div>
      </footer>
    </div>
  );
}