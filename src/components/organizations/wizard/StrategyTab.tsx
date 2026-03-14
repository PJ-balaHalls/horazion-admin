import React from 'react';
import { SECTORS, OBJECTIVES, KPIS_DICT } from '@/types/b2b-organization';
import { KeyIcon, CheckIcon } from '@heroicons/react/24/outline';

export function StrategyTab({ formData, setFormData }: any) {
  const toggleArray = (path: string, val: string) => {
    setFormData((p: any) => {
      const curr = p.strategic_data[path];
      const updated = curr.includes(val) ? curr.filter((i: string) => i !== val) : [...curr, val];
      return { ...p, strategic_data: { ...p.strategic_data, [path]: updated } };
    });
  };

  return (
    <div className="space-y-10 animate-in fade-in">
      <div>
        <h2 className="text-2xl font-black text-black">Estratégia e Dados</h2>
        <p className="text-sm text-gray-500 mt-1">Defina o foco corporativo e os indicadores de performance.</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-black uppercase tracking-wider">Setor de Atuação</h3>
        <select className="w-full h-12 px-4 border border-gray-200 rounded-xl bg-white text-black font-medium focus:border-[#E50000] outline-none shadow-sm"
                value={formData.strategic_data.sector} onChange={(e) => setFormData((p: any) => ({...p, strategic_data: {...p.strategic_data, sector: e.target.value}}))}>
          <option value="">Selecione o setor da organização...</option>
          {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-black uppercase tracking-wider border-t border-gray-100 pt-8">KPIs Monitorados</h3>
        <p className="text-xs text-gray-500">Selecione os indicadores-chave que serão extraídos do ecossistema.</p>
        <div className="grid grid-cols-2 gap-4">
          {KPIS_DICT.map(kpi => {
            const isSelected = formData.strategic_data.monitoring_kpis.includes(kpi.id);
            return (
              <div key={kpi.id} onClick={() => toggleArray('monitoring_kpis', kpi.id)} 
                   className={`p-4 rounded-2xl border cursor-pointer transition-all flex gap-4 items-start ${isSelected ? 'border-[#E50000] bg-white shadow-md' : 'border-gray-100 bg-white hover:border-gray-300'}`}>
                <div className={`p-2 rounded-xl flex-none ${isSelected ? 'bg-red-50 text-[#E50000]' : 'bg-gray-50 text-gray-400'}`}>
                  <KeyIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className={`text-sm font-bold ${isSelected ? 'text-black' : 'text-gray-700'}`}>{kpi.label}</h4>
                  <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">{kpi.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}