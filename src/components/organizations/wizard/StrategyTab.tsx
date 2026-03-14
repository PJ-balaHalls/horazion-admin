import React, { useState } from 'react';
import { SECTORS, OBJECTIVES, KPIS_DICT } from '@/types/b2b-organization';
import { KeyIcon, CheckCircleIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

export function StrategyTab({ formData, setFormData }: any) {
  const [sectorOpen, setSectorOpen] = useState(false);

  const toggleArray = (path: string, val: string) => {
    setFormData((p: any) => {
      const curr = p.strategic_data[path];
      const updated = curr.includes(val) ? curr.filter((i: string) => i !== val) : [...curr, val];
      return { ...p, strategic_data: { ...p.strategic_data, [path]: updated } };
    });
  };

  return (
    <div className="space-y-12 max-w-6xl animate-in fade-in">
      
      {/* Setor Estilizado (Horizon Clarity Dropdown) */}
      <div className="space-y-3 relative max-w-md">
        <label className="text-sm font-bold text-black uppercase tracking-wider">Setor de Atuação</label>
        <div onClick={() => setSectorOpen(!sectorOpen)} className="w-full h-14 px-5 border border-gray-200 rounded-2xl bg-white flex items-center justify-between cursor-pointer hover:border-[#E50000] transition-colors">
          <span className={formData.strategic_data.sector ? 'text-black font-bold' : 'text-gray-400'}>{formData.strategic_data.sector || 'Selecione o setor...'}</span>
          <ChevronDownIcon className="w-5 h-5 text-gray-400"/>
        </div>
        {sectorOpen && (
          <div className="absolute top-24 left-0 w-full bg-white border border-gray-100 shadow-2xl rounded-2xl max-h-64 overflow-y-auto z-50 p-2">
            {SECTORS.map(s => (
              <div key={s} onClick={() => { setFormData((p:any) => ({...p, strategic_data: {...p.strategic_data, sector: s}})); setSectorOpen(false); }}
                   className="px-4 py-3 hover:bg-red-50 hover:text-[#E50000] text-sm font-medium cursor-pointer rounded-xl transition-colors">
                {s}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Objetivos de Negócios (Adicionado conforme solicitado) */}
      <div className="space-y-4 border-t border-gray-100 pt-8">
        <label className="text-sm font-bold text-black uppercase tracking-wider">Objetivos de Negócio (Estratégia Macro)</label>
        <div className="flex flex-wrap gap-3">
          {OBJECTIVES.map(obj => {
            const isActive = formData.strategic_data.business_objectives.includes(obj);
            return (
              <button key={obj} onClick={() => toggleArray('business_objectives', obj)}
                className={`px-5 py-3 rounded-2xl border text-sm font-bold transition-all ${isActive ? 'bg-red-50 border-[#E50000] text-[#E50000]' : 'bg-white border-gray-200 text-gray-600 hover:border-[#E50000] hover:bg-red-50 hover:text-[#E50000]'}`}
              >
                {obj}
              </button>
            );
          })}
        </div>
      </div>

      {/* KPIs */}
      <div className="space-y-4 border-t border-gray-100 pt-8">
        <label className="text-sm font-bold text-black uppercase tracking-wider">KPIs Monitorados (Métricas Chave)</label>
        <div className="grid grid-cols-3 gap-4">
          {KPIS_DICT.map(kpi => {
            const isActive = formData.strategic_data.monitoring_kpis.includes(kpi.id);
            return (
              <div key={kpi.id} onClick={() => toggleArray('monitoring_kpis', kpi.id)} 
                   className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col gap-3 group ${isActive ? 'border-[#E50000] bg-red-50/30' : 'border-gray-200 hover:border-[#E50000] hover:bg-red-50'}`}>
                <div className="flex justify-between items-start">
                  <div className={`p-2 rounded-xl ${isActive ? 'bg-[#E50000] text-white' : 'bg-gray-100 text-gray-400 group-hover:text-[#E50000]'}`}><KeyIcon className="w-5 h-5" /></div>
                  {isActive && <CheckCircleIcon className="w-6 h-6 text-[#E50000]" />}
                </div>
                <div>
                  <h4 className={`text-sm font-black ${isActive ? 'text-[#E50000]' : 'text-black group-hover:text-[#E50000]'}`}>{kpi.label}</h4>
                  <p className="text-[10px] text-gray-500 mt-1">{kpi.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}