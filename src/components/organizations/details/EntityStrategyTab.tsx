import React, { useState } from 'react';
import { HzInput, HzSelect, HzButton, HzBadge } from '@/components/ui';

export function EntityStrategyTab({ formData, setFormData }: { formData: any, setFormData: any }) {
  const strategy = formData?.metadata?.strategic_data || { hierarchy_level: 'master', monitoring_kpis: [], business_objectives: [] };
  
  const updateStrategy = (field: string, value: any) => {
    const finalValue = value?.target !== undefined ? value.target.value : value;
    setFormData({ 
      ...formData, 
      metadata: { 
        ...formData.metadata, 
        strategic_data: { ...strategy, [field]: finalValue } 
      } 
    });
  };

  return (
    <div className="space-y-10 animate-in fade-in">
      <div>
        <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-5">Estratégia</h2>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Nível Hierárquico</label>
            <HzSelect 
              value={strategy.hierarchy_level || 'master'} 
              onChange={v => updateStrategy('hierarchy_level', v)}
              options={[
                { value: 'master', label: 'Sede Central (Master)' },
                { value: 'subsidiary', label: 'Filial (Subsidiária)' },
                { value: 'partner', label: 'Parceiro Externo' }
              ]}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Sede</label>
            <HzInput value={strategy.headquarters_location || ''} onChange={e => updateStrategy('headquarters_location', e.target.value)} />
          </div>
        </div>
      </div>
    </div>
  );
}