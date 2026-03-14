import React, { useState } from 'react';
import { HzInput, HzButton } from '@/components/ui';
import { PlusIcon, BuildingLibraryIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export function OrgChartTab({ formData, setFormData }: any) {
  const [newRootDept, setNewRootDept] = useState('');
  const [subDeptsInputs, setSubDeptsInputs] = useState<Record<string, string>>({});
  
  const addDept = (parentId: string | null = null, name: string) => {
    if (!name.trim()) return;
    setFormData((p: any) => {
      const newD = { id: `dept-${Date.now()}`, name, members: [], sub_departments: [] };
      const newOrg = { ...p.org_chart };
      if (parentId === null) {
        newOrg.departments.push(newD);
      } else {
        const parent = newOrg.departments.find((d: any) => d.id === parentId);
        if (parent) parent.sub_departments.push(newD);
      }
      return { ...p, org_chart: newOrg };
    });
    if (parentId === null) setNewRootDept('');
    else setSubDeptsInputs(prev => ({ ...prev, [parentId]: '' }));
  };

  return (
    <div className="grid grid-cols-2 gap-12 max-w-7xl animate-in fade-in h-full">
      {/* Coluna Esquerda: Gerenciamento */}
      <div className="space-y-8 pr-8 border-r border-gray-100">
        <div>
           <h2 className="text-xl font-black text-black">Estrutura Interna</h2>
           <p className="text-sm text-gray-500">Adicione os departamentos e subsetores.</p>
        </div>

        <div className="flex gap-4 items-end">
          <div className="flex-1"><HzInput label="Departamento Raiz" value={newRootDept} onChange={e => setNewRootDept(e.target.value)} placeholder="Ex: Engenharia" /></div>
          <HzButton onClick={() => addDept(null, newRootDept)} className="bg-black text-white h-11 px-6 rounded-2xl hover:bg-[#E50000] transition-colors font-bold"><PlusIcon className="w-5 h-5"/></HzButton>
        </div>

        <div className="space-y-6">
          {formData.org_chart.departments.map((dept: any) => (
            <div key={dept.id} className="border border-gray-200 rounded-2xl p-5 hover:border-[#E50000] transition-colors">
              <h3 className="font-black text-sm text-black mb-4 flex items-center gap-2 uppercase tracking-wider"><BuildingLibraryIcon className="w-5 h-5 text-[#E50000]"/> {dept.name}</h3>
              
              <div className="flex gap-2 items-center mb-4">
                 <input type="text" placeholder={`Novo subsetor em ${dept.name}`} value={subDeptsInputs[dept.id] || ''} onChange={e => setSubDeptsInputs(p => ({...p, [dept.id]: e.target.value}))} className="text-xs border border-gray-200 rounded-xl px-4 py-2 w-full outline-none focus:border-[#E50000]" />
                 <button onClick={() => addDept(dept.id, subDeptsInputs[dept.id] || '')} className="p-2 bg-gray-50 text-black hover:text-[#E50000] hover:bg-red-50 rounded-xl border border-gray-200 transition-colors"><PlusIcon className="w-4 h-4"/></button>
              </div>

              {dept.sub_departments.length > 0 && (
                <div className="space-y-2 mt-2">
                  {dept.sub_departments.map((sub: any) => (
                    <div key={sub.id} className="bg-gray-50 border border-gray-100 px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-bold text-gray-700"><ChevronRightIcon className="w-3 h-3 text-[#E50000]"/> {sub.name}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Coluna Direita: Live Preview Organograma Visual */}
      <div className="bg-gray-50/50 rounded-3xl p-8 border border-gray-100 flex flex-col items-center justify-start overflow-auto">
         <h3 className="text-xs font-bold uppercase text-gray-400 tracking-widest mb-10">Preview em Tempo Real</h3>
         
         <div className="bg-black text-white px-8 py-3 rounded-2xl shadow-lg border border-black text-center min-w-[200px] z-10">
           <p className="font-black text-sm uppercase">{formData.displayName || 'ENTIDADE'}</p>
         </div>
         
         {formData.org_chart.departments.length > 0 && (
           <>
             <div className="w-0.5 h-8 bg-gray-300"></div>
             <div className="h-0.5 bg-gray-300 relative" style={{ width: `${Math.max(0, (formData.org_chart.departments.length - 1) * 200)}px` }}></div>
             <div className="flex gap-8 mt-0 px-4">
               {formData.org_chart.departments.map((dept: any) => (
                 <div key={dept.id} className="flex flex-col items-center w-[160px]">
                   <div className="w-0.5 h-6 bg-gray-300"></div>
                   <div className="bg-white border-2 border-gray-200 shadow-sm px-4 py-3 rounded-2xl text-center w-full z-10">
                      <h4 className="font-bold text-xs text-[#E50000] uppercase truncate">{dept.name}</h4>
                   </div>
                   {dept.sub_departments.length > 0 && (
                     <div className="mt-2 w-full space-y-2 border-l-2 border-gray-200 ml-4 pl-4 py-2">
                        {dept.sub_departments.map((sub:any) => (
                          <div key={sub.id} className="text-[10px] font-bold text-gray-600 bg-white border border-gray-100 py-1.5 px-2 rounded-lg text-left truncate shadow-sm">
                            {sub.name}
                          </div>
                        ))}
                     </div>
                   )}
                 </div>
               ))}
             </div>
           </>
         )}
      </div>
    </div>
  );
}