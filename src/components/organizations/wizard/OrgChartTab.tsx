import React, { useState } from 'react';
import { HzInput, HzButton } from '@/components/ui';
import { PlusIcon, ChevronRightIcon, BuildingLibraryIcon } from '@heroicons/react/24/outline';

export function OrgChartTab({ formData, setFormData }: any) {
  const [newDeptName, setNewDeptName] = useState('');
  
  const addDept = (parentId: string | null = null) => {
    if (!newDeptName) return;
    setFormData((p: any) => {
      const newD = { id: Date.now().toString(), name: newDeptName, members: [], sub_departments: [] };
      const newOrg = { ...p.org_chart };
      if (parentId === null) {
        newOrg.departments.push(newD);
      } else {
        const parent = newOrg.departments.find((d: any) => d.id === parentId);
        if (parent) parent.sub_departments.push(newD);
      }
      return { ...p, org_chart: newOrg };
    });
    setNewDeptName('');
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div>
        <h2 className="text-2xl font-black text-black">Estrutura Organizacional</h2>
        <p className="text-sm text-gray-500 mt-1">Defina os departamentos e sub-setores da organização.</p>
      </div>

      <div className="flex gap-4 items-end bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex-1"><HzInput label="Adicionar Departamento Raiz" value={newDeptName} onChange={e => setNewDeptName(e.target.value)} placeholder="Ex: Governança, Tecnologia, RH" /></div>
        <HzButton onClick={() => addDept(null)} className="bg-black text-white h-11 px-6 rounded-xl hover:bg-gray-800"><PlusIcon className="w-5 h-5"/></HzButton>
      </div>

      <div className="space-y-6">
        {formData.org_chart.departments.map((dept: any) => (
          <div key={dept.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <h3 className="font-black text-lg text-black mb-4 flex items-center gap-2">
              <BuildingLibraryIcon className="w-6 h-6 text-[#E50000]"/> {dept.name}
            </h3>
            
            {dept.sub_departments.length > 0 && (
              <div className="pl-8 space-y-3 mt-4 border-l border-gray-200 ml-3">
                {dept.sub_departments.map((sub: any) => (
                  <div key={sub.id} className="bg-white border border-gray-100 shadow-sm p-3 rounded-xl flex items-center gap-3">
                    <ChevronRightIcon className="w-4 h-4 text-[#E50000]"/>
                    <span className="text-sm font-bold text-gray-700">{sub.name}</span>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-6 flex gap-2">
               <input type="text" placeholder={`Adicionar sub-setor em ${dept.name}`} className="text-sm border border-gray-200 rounded-lg px-3 py-2 w-full outline-none focus:border-[#E50000] transition-colors" 
                      onKeyDown={(e) => { if(e.key === 'Enter') { setNewDeptName(e.currentTarget.value); addDept(dept.id); e.currentTarget.value=''; } }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}