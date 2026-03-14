import React from 'react';
import { B2B_BENEFITS_DICTIONARY } from '@/types/b2b-organization';
import { CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/outline';

// Contrato temporário para os 7 pacotes (Coloque no b2b-organization.ts depois)
const B2B_PACKAGES = [
  { id: 'pack_identity', name: 'Starter Identity', price: 99, desc: 'Selo oficial, deep link e profile corporativo.', features: ['verified_badge', 'custom_deep_link', 'official_profile_ui'] },
  { id: 'pack_media', name: 'Media Creator', price: 149, desc: 'Uploads 4K, streaming nativo e player custom.', features: ['high_res_uploads', 'live_streaming', 'custom_player'] },
  { id: 'pack_community', name: 'Community Hub', price: 199, desc: 'Sub-comunidades, moderação e broadcast.', features: ['sub_communities', 'moderation_tools', 'broadcast_messaging'] },
  { id: 'pack_data', name: 'Data Driven', price: 299, desc: 'Analytics real-time, exportação S3 e dashboards.', features: ['advanced_analytics', 'export_data', 'real_time_metrics'] },
  { id: 'pack_sales', name: 'Monetization Plus', price: 399, desc: 'In-app purchases, revenue share e slots ads.', features: ['in_app_purchasing', 'revenue_share', 'sponsored_slots'] },
  { id: 'pack_enterprise', name: 'Enterprise Secure', price: 499, desc: 'SSO (SAML), API total e logs de auditoria.', features: ['sso_saml', 'api_access', 'audit_logs'] },
  { id: 'pack_ultimate', name: 'Horizion Ultimate', price: 999, desc: 'Acesso total a todos os 30 recursos premium.', features: B2B_BENEFITS_DICTIONARY.map(b => b.id) }
];

export function BenefitsTab({ formData, setFormData }: any) {
  const engine = formData.benefits_engine;
  
  const toggleFeature = (id: string) => {
    const isSelected = engine.custom_features.includes(id);
    const newFeatures = isSelected ? engine.custom_features.filter((f: string) => f !== id) : [...engine.custom_features, id];
    
    let total = newFeatures.reduce((acc: number, fId: string) => acc + (B2B_BENEFITS_DICTIONARY.find(b => b.id === fId)?.price || 0), 0);
    const isCombo = newFeatures.length >= 3;
    if (isCombo) total = total * 0.75; 

    setFormData((p: any) => ({
      ...p, benefits_engine: { mode: 'custom', active_bundles: [], custom_features: newFeatures, total_price: total, isCombo }
    }));
  };

  const applyPackage = (pack: typeof B2B_PACKAGES[0]) => {
    setFormData((p: any) => ({
      ...p, benefits_engine: { mode: 'bundle', active_bundles: [pack.id], custom_features: pack.features, total_price: pack.price, isCombo: false }
    }));
  };

  return (
    <div className="space-y-12 max-w-7xl animate-in fade-in">
      
      {/* Resumo Fixo de Preço */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border border-[#E50000] p-6 rounded-3xl shadow-lg flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-black text-[#E50000] flex items-center gap-2"><SparklesIcon className="w-6 h-6"/> Plano Selecionado</h2>
          <p className="text-sm font-bold text-gray-600 mt-1">{engine.mode === 'bundle' ? 'Pacote Fechado' : 'A La Carte Personalizado'}</p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-black text-black">${engine.total_price.toFixed(0)} <span className="text-lg text-gray-400 font-normal">/mo</span></p>
          {engine.isCombo && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-md font-bold uppercase">25% Combo Aplicado</span>}
        </div>
      </div>

      {/* 7 Pacotes Comerciais */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-black uppercase tracking-wider">Pacotes Pré-Montados (Bundles)</h3>
        <div className="grid grid-cols-4 gap-4">
          {B2B_PACKAGES.map(pack => {
            const isPackActive = engine.mode === 'bundle' && engine.active_bundles.includes(pack.id);
            return (
              <div key={pack.id} onClick={() => applyPackage(pack)} className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between ${isPackActive ? 'border-[#E50000] bg-red-50/50 shadow-md' : 'border-gray-200 hover:border-[#E50000] hover:bg-red-50'}`}>
                <div>
                   <h4 className={`text-lg font-black ${isPackActive ? 'text-[#E50000]' : 'text-black'}`}>{pack.name}</h4>
                   <p className="text-[10px] text-gray-500 mt-2 font-medium leading-relaxed">{pack.desc}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-end">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">{pack.features.length} Features</span>
                  <span className="text-xl font-black text-black">${pack.price}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* A La Carte */}
      <div className="space-y-4 border-t border-gray-100 pt-8">
        <div className="flex items-center gap-4">
           <h3 className="text-sm font-bold text-black uppercase tracking-wider">Montar A La Carte</h3>
           <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-full uppercase">Escolha 3+ e ganhe 25% OFF</span>
        </div>
        <div className="grid grid-cols-5 gap-4">
          {B2B_BENEFITS_DICTIONARY.map(benefit => {
            const isActive = engine.custom_features.includes(benefit.id);
            return (
              <div key={benefit.id} onClick={() => toggleFeature(benefit.id)} className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${isActive ? 'bg-[#E50000] border-[#E50000] text-white shadow-md' : 'bg-white border-gray-200 text-black hover:border-[#E50000] hover:bg-red-50 hover:text-[#E50000]'}`}>
                {isActive && <CheckCircleIcon className="w-5 h-5 text-white absolute top-3 right-3" />}
                <span className={`text-[9px] font-black uppercase tracking-wider block mb-2 ${isActive ? 'text-red-200' : 'text-gray-400'}`}>{benefit.category}</span>
                <h4 className="text-xs font-bold pr-4 leading-tight">{benefit.label}</h4>
                <p className={`text-sm font-black mt-3 ${isActive ? 'text-white' : 'text-black'}`}>${benefit.price}<span className="text-[10px] font-normal opacity-70">/mo</span></p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}