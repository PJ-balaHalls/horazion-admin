'use client';

import React, { useState, useEffect } from 'react';
import { HzButton } from '@/components/ui';
import { 
  BuildingOfficeIcon, UserIcon, QrCodeIcon, ShieldCheckIcon, 
  ChevronLeftIcon, ChevronRightIcon, SwatchIcon, PresentationChartLineIcon,
  RectangleGroupIcon, GiftIcon, UsersIcon, CheckBadgeIcon, DocumentCheckIcon
} from '@heroicons/react/24/outline';
import { B2B_BENEFITS_DICTIONARY, BenefitsEngineConfig } from '@/types/b2b-organization';

// Importação das Sub-Abas (Criaremos a seguir)
import { PersonalizationTab } from './wizard/PersonalizationTab';
import { StrategyTab } from './wizard/StrategyTab';
import { OrgChartTab } from './wizard/OrgChartTab';
import { BenefitsTab } from './wizard/BenefitsTab';
import { OnboardingTab } from './wizard/OnboardingTab';
import { VerificationTab } from './wizard/VerificationTab';
import { ReviewTab } from './wizard/ReviewTab';

type TabId = 'personalization' | 'strategic' | 'org_chart' | 'benefits' | 'mass_onboarding' | 'verification' | 'review';
type PreviewMode = 'profile' | 'badge';

export interface OrgDepartment { id: string; name: string; members: any[]; sub_departments: OrgDepartment[]; }

export function CreateEntityWizard({ onClose, onSave }: { onClose: () => void, onSave: (d: any) => Promise<void> }) {
  const [activeTab, setActiveTab] = useState<TabId>('personalization');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('profile');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  const [localFiles, setLocalFiles] = useState<{ logo: File | null; cover: File | null }>({ logo: null, cover: null });
  const [previewUrls, setPreviewUrls] = useState({ logo: '', cover: '' });

  const [formData, setFormData] = useState({
    horizon_id: `ORG-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    displayName: '',
    slug: '',
    branding: { primary_color: '#E50000' },
    strategic_data: { sector: '', business_objectives: [] as string[], monitoring_kpis: [] as string[] },
    org_chart: { departments: [{ id: 'gov-1', name: 'Governança', members: [], sub_departments: [] }] as OrgDepartment[] },
    benefits_engine: {
      mode: 'bundle' as 'bundle' | 'custom',
      active_bundles: [] as string[],
      custom_features: [] as string[],
      final_features: {} as BenefitsEngineConfig,
      total_price: 0
    },
    mass_onboarding_list: [] as any[],
    verification: { has_documents: false, document_type: '', registration_number: '' }
  });

  const TABS = [
    { id: 'personalization', label: 'Identidade Visual', icon: SwatchIcon },
    { id: 'strategic', label: 'Estratégia & KPIs', icon: PresentationChartLineIcon },
    { id: 'org_chart', label: 'Organograma', icon: RectangleGroupIcon },
    { id: 'benefits', label: 'Benefícios B2B', icon: GiftIcon },
    { id: 'mass_onboarding', label: 'Onboarding', icon: UsersIcon },
    { id: 'verification', label: 'Selo de Verificado', icon: CheckBadgeIcon },
    { id: 'review', label: 'Resumo & Instanciar', icon: DocumentCheckIcon }
  ];

  return (
    <div className="flex bg-white rounded-3xl border border-gray-100 shadow-xl h-full overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      
      {/* Sidebar Colapsável (Clean White) */}
      <aside className={`flex-none bg-white border-r border-gray-100 flex flex-col transition-all duration-300 relative ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          className="absolute -right-3 top-8 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:text-[#E50000] z-10"
        >
          {isSidebarOpen ? <ChevronLeftIcon className="w-4 h-4"/> : <ChevronRightIcon className="w-4 h-4"/>}
        </button>

        <div className="p-6 border-b border-gray-50 flex items-center justify-center">
          {isSidebarOpen ? (
            <div className="w-full">
              <h2 className="text-lg font-black text-black tracking-tight">Nova Entidade</h2>
              <p className="text-[10px] text-gray-400 font-mono mt-1">{formData.horizon_id}</p>
            </div>
          ) : (
            <BuildingOfficeIcon className="w-8 h-8 text-[#E50000]"/>
          )}
        </div>
        
        <nav className="p-4 flex flex-col gap-2 overflow-y-auto flex-1 custom-scrollbar">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id} onClick={() => setActiveTab(tab.id as TabId)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                  isActive ? 'bg-red-50 text-[#E50000]' : 'text-gray-500 hover:bg-gray-50 hover:text-black'
                } ${!isSidebarOpen && 'justify-center px-0'}`}
                title={!isSidebarOpen ? tab.label : ''}
              >
                <Icon className={`w-5 h-5 flex-none ${isActive ? 'text-[#E50000]' : 'text-gray-400'}`} />
                {isSidebarOpen && <span>{tab.label}</span>}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Dynamic Content Area */}
      <main className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-white relative">
        <div className="max-w-4xl mx-auto">
          {activeTab === 'personalization' && <PersonalizationTab formData={formData} setFormData={setFormData} setLocalFiles={setLocalFiles} previewUrls={previewUrls} setPreviewUrls={setPreviewUrls} />}
          {activeTab === 'strategic' && <StrategyTab formData={formData} setFormData={setFormData} />}
          {activeTab === 'org_chart' && <OrgChartTab formData={formData} setFormData={setFormData} />}
          {activeTab === 'benefits' && <BenefitsTab formData={formData} setFormData={setFormData} />}
          {activeTab === 'mass_onboarding' && <OnboardingTab formData={formData} setFormData={setFormData} />}
          {activeTab === 'verification' && <VerificationTab formData={formData} setFormData={setFormData} />}
          {activeTab === 'review' && <ReviewTab formData={formData} previewUrls={previewUrls} onSave={() => onSave(formData)} onClose={onClose} loading={loading} />}
        </div>
      </main>

      {/* Dual Preview (Refined Corporate Badge) */}
      <aside className="w-[360px] flex-none bg-white border-l border-gray-100 p-8 flex flex-col items-center shadow-sm overflow-y-auto">
        <div className="flex w-full bg-gray-50 rounded-xl p-1 mb-8 border border-gray-100">
          <button onClick={() => setPreviewMode('profile')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${previewMode === 'profile' ? 'bg-white text-black shadow-sm border border-gray-200' : 'text-gray-400 hover:text-black'}`}>Perfil Social</button>
          <button onClick={() => setPreviewMode('badge')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${previewMode === 'badge' ? 'bg-white text-black shadow-sm border border-gray-200' : 'text-gray-400 hover:text-black'}`}>Corporate Badge</button>
        </div>
        
        {previewMode === 'profile' && (
          <div className="w-full bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden group hover:border-[#E50000] transition-colors">
            <div className="h-32 w-full relative" style={{ backgroundColor: previewUrls.cover ? 'transparent' : formData.branding.primary_color }}>
              {previewUrls.cover && <img src={previewUrls.cover} className="w-full h-full object-cover" />}
            </div>
            <div className="px-6 pb-8 pt-0 relative flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-white shadow-xl border-4 border-white absolute -top-10 flex items-center justify-center overflow-hidden z-10">
                {previewUrls.logo ? <img src={previewUrls.logo} className="w-full h-full object-cover" /> : <BuildingOfficeIcon className="w-8 h-8 text-gray-200" />}
              </div>
              <div className="mt-14 w-full">
                <h3 className="text-lg font-black text-black leading-tight truncate flex items-center justify-center gap-1">
                  {formData.displayName || 'Entidade Base'}
                  {formData.verification.has_documents && <ShieldCheckIcon className="w-5 h-5 text-blue-500"/>}
                </h3>
                <p className="text-xs font-mono text-gray-500 mt-1">www.horaziongroup.com/org/{formData.slug || 'slug'}</p>
                <div className="mt-4"><span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border border-gray-200 px-3 py-1 rounded-full">{formData.strategic_data.sector || 'SETOR'}</span></div>
              </div>
            </div>
          </div>
        )}

        {previewMode === 'badge' && (
          <div className="w-full bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all aspect-[2/3] flex flex-col relative">
            {/* Lanyard Hole */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-3 bg-white rounded-full border border-gray-200 shadow-inner z-20"></div>
            
            {/* Elegant Header with SVG Noise for texture */}
            <div className="h-32 w-full relative flex items-end justify-center pb-4" style={{ backgroundColor: formData.branding.primary_color }}>
               <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
               {previewUrls.logo ? <img src={previewUrls.logo} className="w-14 h-14 rounded-xl bg-white p-1.5 shadow-xl z-10 border border-white/50" /> : <BuildingOfficeIcon className="w-10 h-10 text-white/50 z-10"/>}
            </div>

            <div className="flex-1 flex flex-col items-center px-6 pt-10 pb-8 text-center bg-white">
               <div className="w-24 h-24 bg-gray-50 rounded-full border border-gray-100 shadow-inner flex items-center justify-center mb-6">
                  <UserIcon className="w-10 h-10 text-gray-300" />
               </div>
               <h2 className="text-xl font-black text-black uppercase tracking-tight truncate w-full">{formData.mass_onboarding_list[0]?.nome || 'NOME DO MEMBRO'}</h2>
               <p className="text-[10px] font-black mt-1 uppercase tracking-[0.2em] truncate w-full" style={{ color: formData.branding.primary_color }}>
                 {formData.mass_onboarding_list[0]?.role || 'CARGO'}
               </p>

               <div className="mt-auto w-full pt-6 flex flex-col items-center">
                 <QrCodeIcon className="w-16 h-16 text-black mb-2 opacity-90" />
                 <p className="text-[9px] font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-100">{formData.horizon_id}</p>
               </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}