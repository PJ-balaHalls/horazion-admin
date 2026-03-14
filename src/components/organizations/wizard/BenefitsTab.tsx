import React from 'react';
import { B2B_BENEFITS_DICTIONARY } from '@/types/b2b-organization';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

export function BenefitsTab({ formData, setFormData }: any) {
  const engine = formData.benefits_engine;
  
  const toggleFeature = (id: string) => {
    const isSelected = engine.custom_features.includes(id);
    const newFeatures = isSelected ? engine.custom_features.filter((f: string) => f !== id) : [...engine.custom_features, id];
    
    let total = 0;
    newFeatures.forEach((fId: string) => {
      total += B2B_BENEFITS_DICTIONARY.find(b => b.id === fId)?.price || 0;
    });
    
    // Regra de Negócio: Mais de 3 features = 25% de desconto
    const isCombo = newFeatures.length >= 3;
    if (isCombo) total = total * 0.75; 

    setFormData((p: any) => ({
      ...p, benefits_engine: { ...p.benefits_engine, mode: 'custom', custom_features: newFeatures, total_price: total, isCombo }
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-black">Motor de Benefícios</h2>
          <p className="text-sm text-gray-500 mt-1">Monte o plano ideal. <span className="font-bold text-[#E50000]">Selecione 3 ou mais para 25% OFF.</span></p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Valor Mensal</p>
          <p className="text-4xl font-black text-black">
            ${engine.total_price.toFixed(0)} <span className="text-lg text-gray-400 font-normal">/mo</span>
          </p>
          {engine.isCombo && <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded font-bold uppercase mt-1 inline-block">25% Combo Aplicado</span>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {B2B_BENEFITS_DICTIONARY.map(benefit => {
          const isActive = engine.custom_features.includes(benefit.id);
          return (
            <div key={benefit.id} onClick={() => toggleFeature(benefit.id)} 
                 className={`p-6 rounded-3xl border transition-all cursor-pointer relative ${isActive ? 'bg-white border-[#E50000] shadow-lg ring-2 ring-red-50 scale-[1.02]' : 'bg-white border-gray-100 hover:border-gray-300'}`}>
              {isActive && <CheckCircleIcon className="w-6 h-6 text-[#E50000] absolute top-5 right-5" />}
              <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-2 block">{benefit.category}</span>
              <h4 className={`text-sm font-bold pr-6 ${isActive ? 'text-black' : 'text-gray-700'}`}>{benefit.label}</h4>
              <p className={`text-xl font-black mt-4 ${isActive ? 'text-[#E50000]' : 'text-black'}`}>${benefit.price}<span className="text-xs font-normal text-gray-400">/mo</span></p>
            </div>
          );
        })}
      </div>
    </div>
  );
}