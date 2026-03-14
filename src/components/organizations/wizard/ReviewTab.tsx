'use client';

import React from 'react';
import { HzButton } from '@/components/ui';

interface ReviewTabProps {
  formData: any;
  previewUrls: { logo: string; cover: string };
  onSave: () => Promise<void>;
  onClose: () => void;
  loading: boolean;
}

export function ReviewTab({ formData, previewUrls, onSave, onClose, loading }: ReviewTabProps) {
  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="bg-white border border-gray-100 p-10 rounded-3xl shadow-lg">
        <h2 className="text-2xl font-black text-black mb-8 border-b border-gray-50 pb-4">
          Resumo da Entidade
        </h2>
        
        <div className="grid grid-cols-2 gap-y-8 gap-x-12">
          {/* Dados Principais */}
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Nome Oficial</p>
            <p className="text-lg font-black text-black">{formData.displayName || 'Pendente'}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Setor</p>
            <p className="text-lg font-black text-black">{formData.strategic_data.sector || 'Pendente'}</p>
          </div>
          
          {/* Identificadores */}
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Deep Link Global</p>
            <p className="text-sm font-mono text-blue-600">/org/{formData.slug || 'pendente'}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Horizon ID</p>
            <p className="text-sm font-mono text-gray-600">{formData.horizon_id}</p>
          </div>

          {/* Estrutura */}
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Organograma</p>
            <p className="text-sm font-black text-black">{formData.org_chart.departments.length} Departamento(s) Raiz</p>
          </div>
          
          {/* Onboarding */}
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Onboarding Inicial</p>
            <p className="text-sm font-black text-black">{formData.mass_onboarding_list.length} Membro(s) Vinculado(s)</p>
          </div>

          {/* Assinatura B2B */}
          <div className="col-span-2 bg-gray-50 p-6 rounded-2xl flex justify-between items-center border border-gray-100 mt-4">
            <div>
              <p className="text-sm font-black text-black">Assinatura B2B (Motor de Benefícios)</p>
              <p className="text-xs text-gray-500 mt-1">
                {formData.benefits_engine.custom_features.length} recursos e infraestruturas ativados.
              </p>
              {formData.benefits_engine.isCombo && (
                <span className="inline-block mt-2 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  25% de Desconto Aplicado (Combo)
                </span>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Total Mensal</p>
              <p className="text-4xl font-black text-[#E50000]">
                ${formData.benefits_engine.total_price.toFixed(0)}<span className="text-lg text-gray-400 font-normal">/mo</span>
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 flex gap-4 justify-end pt-6 border-t border-gray-50">
          <HzButton 
            variant="ghost" 
            onClick={onClose} 
            className="text-gray-500 font-bold hover:bg-gray-50 hover:text-black px-6"
          >
            Cancelar
          </HzButton>
          <HzButton 
            onClick={onSave} 
            disabled={loading} 
            className="bg-[#E50000] hover:bg-red-700 text-white px-8 shadow-md font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Instanciando no Supabase...' : 'Confirmar e Instanciar'}
          </HzButton>
        </div>
      </div>
    </div>
  );
}   