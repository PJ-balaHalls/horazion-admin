import React from 'react';
import { HzInput } from '@/components/ui';
import { CloudArrowUpIcon, PhotoIcon } from '@heroicons/react/24/outline';

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
    <div className="space-y-12 max-w-4xl animate-in fade-in">
      <div className="space-y-6">
        <HzInput label="Nome Oficial da Organização" value={formData.displayName} onChange={handleNameChange} placeholder="Ex: Horizion Group" />
        <div className="p-5 border border-gray-100 rounded-2xl flex flex-col gap-2">
           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Deep Link Global (Auto-gerado)</p>
           <p className="text-lg font-mono text-black">www.horaziongroup.com/org/<span className="text-[#E50000]">{formData.slug || 'nomedaorg'}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Upload Logo */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-black uppercase tracking-wider">Logotipo (Ícone)</label>
          <label htmlFor="logo-upload" className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-[#E50000] hover:bg-red-50 hover:text-[#E50000] transition-colors group">
            {previewUrls.logo ? <img src={previewUrls.logo} className="h-full w-auto object-contain p-2" /> : (
              <><CloudArrowUpIcon className="w-8 h-8 text-gray-400 group-hover:text-[#E50000] mb-2" /><span className="text-xs font-bold">Upload SVG/PNG</span></>
            )}
            <input id="logo-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} />
          </label>
        </div>

        {/* Upload Cover (Corrigido) */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-black uppercase tracking-wider">Imagem de Capa</label>
          <label htmlFor="cover-upload" className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-[#E50000] hover:bg-red-50 hover:text-[#E50000] transition-colors group overflow-hidden">
            {previewUrls.cover ? <img src={previewUrls.cover} className="w-full h-full object-cover" /> : (
              <><PhotoIcon className="w-8 h-8 text-gray-400 group-hover:text-[#E50000] mb-2" /><span className="text-xs font-bold">1920x480px (JPEG/PNG)</span></>
            )}
            <input id="cover-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'cover')} />
          </label>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-bold text-black uppercase tracking-wider">Cor Primária (Hex)</label>
        <div className="flex items-center gap-4 h-24 border border-gray-100 rounded-2xl p-4">
          <input type="color" className="w-16 h-16 rounded-xl cursor-pointer border-0 p-0 shadow-sm" value={formData.branding.primary_color} onChange={(e) => setFormData((p: any) => ({...p, branding: {...p.branding, primary_color: e.target.value}}))} />
          <HzInput value={formData.branding.primary_color} onChange={(e) => setFormData((p: any) => ({...p, branding: {...p.branding, primary_color: e.target.value}}))} className="w-48 uppercase font-mono" />
        </div>
      </div>
    </div>
  );
}