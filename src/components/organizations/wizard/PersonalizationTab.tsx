import React from 'react';
import { HzInput } from '@/components/ui';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';

export function PersonalizationTab({ formData, setFormData, setLocalFiles, previewUrls, setPreviewUrls }: any) {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setFormData((p: any) => ({ ...p, displayName: name, slug }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'cover') => {
    const file = e.target.files?.[0];
    if (file) {
      setLocalFiles((p: any) => ({ ...p, [type]: file }));
      setPreviewUrls((p: any) => ({ ...p, [type]: URL.createObjectURL(file) }));
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in">
      <div>
        <h2 className="text-2xl font-black text-black">Identidade e Domínio</h2>
        <p className="text-sm text-gray-500 mt-1">Configure o perfil público da organização no ecossistema Horazion.</p>
      </div>

      <HzInput label="Nome Oficial da Organização" value={formData.displayName} onChange={handleNameChange} placeholder="Ex: Horizion Group" />
      
      <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2">
         <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Deep Link Global (Gerado Automaticamente)</p>
         <p className="text-lg font-mono text-black">www.horaziongroup.com/org/<span className="text-[#E50000]">{formData.slug || 'nomedaorg'}</span></p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-sm font-bold text-black">Logotipo SVG/PNG</label>
          <label className="flex flex-col items-center justify-center w-full h-32 border border-gray-200 rounded-2xl cursor-pointer hover:border-[#E50000] hover:bg-gray-50 transition-all">
            <CloudArrowUpIcon className="w-6 h-6 text-gray-400 mb-2" />
            <span className="text-xs text-gray-500">Clique para upload</span>
            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} />
          </label>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-black">Cor Primária (Hex)</label>
          <div className="flex items-center gap-4 h-32 border border-gray-200 rounded-2xl p-6 shadow-sm bg-white">
            <input type="color" className="w-16 h-16 rounded-xl cursor-pointer border-0 p-0 shadow-sm" value={formData.branding.primary_color} onChange={(e) => setFormData((p: any) => ({...p, branding: {...p.branding, primary_color: e.target.value}}))} />
            <HzInput value={formData.branding.primary_color} onChange={(e) => setFormData((p: any) => ({...p, branding: {...p.branding, primary_color: e.target.value}}))} className="w-full uppercase font-mono" />
          </div>
        </div>
      </div>
    </div>
  );
}