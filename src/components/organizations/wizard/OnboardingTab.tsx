import React, { useState } from 'react';
import { HzInput, HzButton } from '@/components/ui';
import { UserIcon } from '@heroicons/react/24/outline';

export function OnboardingTab({ formData, setFormData }: any) {
  const [empInput, setEmpInput] = useState({ nome: '', identifier: '', role: '' });

  const addEmployee = () => {
    if (empInput.nome && empInput.identifier && empInput.role) {
      setFormData((p: any) => ({ ...p, mass_onboarding_list: [...p.mass_onboarding_list, empInput] }));
      setEmpInput({ nome: '', identifier: '', role: '' });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
       <div>
         <h2 className="text-2xl font-black text-black">Onboarding Inicial</h2>
         <p className="text-sm text-gray-500 mt-1">Convite seguro para líderes fundadores usando HorizionID.</p>
       </div>

       <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="grid grid-cols-4 gap-4 items-end">
            <div className="col-span-1"><HzInput label="Nome" value={empInput.nome} onChange={e => setEmpInput(p => ({...p, nome: e.target.value}))} placeholder="Ex: Pedro" /></div>
            <div className="col-span-1"><HzInput label="HorizionID" value={empInput.identifier} onChange={e => setEmpInput(p => ({...p, identifier: e.target.value}))} placeholder="@pedro" /></div>
            <div className="col-span-1"><HzInput label="Cargo" value={empInput.role} onChange={e => setEmpInput(p => ({...p, role: e.target.value}))} placeholder="CEO" /></div>
            <HzButton onClick={addEmployee} className="col-span-1 bg-black text-white h-11 rounded-xl hover:bg-gray-800 w-full">Vincular</HzButton>
          </div>
       </div>

       {formData.mass_onboarding_list.length > 0 && (
         <div className="border border-gray-100 rounded-3xl overflow-hidden shadow-sm bg-white">
           <table className="w-full text-left text-sm">
             <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold tracking-widest">
               <tr><th className="p-4">Colaborador</th><th className="p-4">Identificador</th><th className="p-4">Cargo</th></tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
               {formData.mass_onboarding_list.map((emp: any, idx: number) => (
                 <tr key={idx}>
                   <td className="p-4 font-bold text-black flex items-center gap-3"><UserIcon className="w-8 h-8 p-1.5 bg-gray-50 rounded-full text-gray-500"/>{emp.nome}</td>
                   <td className="p-4 text-gray-500 font-mono text-xs">{emp.identifier}</td>
                   <td className="p-4 text-[#E50000] font-bold text-xs uppercase">{emp.role}</td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
       )}
    </div>
  );
}