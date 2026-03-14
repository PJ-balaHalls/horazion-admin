import React from 'react';
import { HzInput } from '@/components/ui';
import { CheckBadgeIcon } from '@heroicons/react/24/outline';

export function VerificationTab({ formData, setFormData }: any) {
  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="bg-white border border-gray-100 p-10 rounded-3xl shadow-sm text-center">
        <CheckBadgeIcon className="w-16 h-16 mx-auto text-[#E50000] mb-4" />
        <h2 className="text-2xl font-black text-black">Selo de Verificação (KYB)</h2>
        <p className="text-gray-500 mt-2 max-w-lg mx-auto text-sm leading-relaxed">
          Para garantir a integridade do ecossistema, o selo oficial exige a vinculação de um documento corporativo válido (Zero Trust).
        </p>
      </div>

      <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm space-y-6">
        <h3 className="text-sm font-bold text-black uppercase tracking-widest border-b border-gray-50 pb-4">Documentação</h3>
        <HzInput label="CNPJ / EIN / Registro Global" value={formData.verification.registration_number} 
                 onChange={e => setFormData((p:any) => ({...p, verification: {...p.verification, registration_number: e.target.value}}))} placeholder="00.000.000/0001-00" />
        
        <label className="flex items-center gap-4 cursor-pointer p-5 border border-gray-100 rounded-2xl hover:border-[#E50000] transition-colors">
          <input type="checkbox" className="w-5 h-5 accent-[#E50000]" checked={formData.verification.has_documents}
                 onChange={e => setFormData((p:any) => ({...p, verification: {...p.verification, has_documents: e.target.checked}}))} />
          <span className="text-sm font-bold text-gray-700">Declaro que possuo autoridade legal sobre a criação deste bloco digital.</span>
        </label>
      </div>
    </div>
  );
}