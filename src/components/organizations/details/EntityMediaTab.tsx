import React from 'react';
import { HzInput } from '@/components/ui';

export function EntityMediaTab({ formData, setFormData }: { formData: any, setFormData: any }) {
  const branding = formData.metadata?.branding || { primary_color: '#000000', secondary_color: '#FFFFFF' };

  const updateBranding = (key: string, value: string) => {
    setFormData({ ...formData, metadata: { ...formData.metadata, branding: { ...branding, [key]: value } } });
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="border-b border-[#F2F2F2] pb-4">
        <h2 className="text-lg font-bold text-black">Branding & Identidade Visual</h2>
        <p className="text-xs text-[#A0A0A0] font-medium uppercase tracking-widest mt-1">Configuração de marca branca (White-Label) da organização.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <HzInput label="URL do Logotipo Oficial" placeholder="https://..." value={formData.logo_url || ''} onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })} />
          <HzInput label="URL da Imagem de Capa (Cover)" placeholder="https://..." value={branding.cover_url || ''} onChange={(e) => updateBranding('cover_url', e.target.value)} />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest">Cor Primária</label>
              <div className="flex gap-2 mt-1">
                <input type="color" value={branding.primary_color} onChange={(e) => updateBranding('primary_color', e.target.value)} className="w-10 h-10 border border-[#F2F2F2] rounded cursor-pointer" />
                <input type="text" value={branding.primary_color} onChange={(e) => updateBranding('primary_color', e.target.value)} className="flex-1 border border-[#F2F2F2] rounded px-3 text-xs font-mono uppercase focus:outline-none focus:border-black" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest">Cor Secundária</label>
              <div className="flex gap-2 mt-1">
                <input type="color" value={branding.secondary_color} onChange={(e) => updateBranding('secondary_color', e.target.value)} className="w-10 h-10 border border-[#F2F2F2] rounded cursor-pointer" />
                <input type="text" value={branding.secondary_color} onChange={(e) => updateBranding('secondary_color', e.target.value)} className="flex-1 border border-[#F2F2F2] rounded px-3 text-xs font-mono uppercase focus:outline-none focus:border-black" />
              </div>
            </div>
          </div>
        </div>

        {/* Pré-visualização Dinâmica */}
        <div className="border border-[#F2F2F2] rounded-[12px] overflow-hidden bg-[#FAFAFA] flex flex-col">
          <div className="h-32 w-full bg-gray-200" style={{ backgroundImage: `url(${branding.cover_url})`, backgroundColor: branding.primary_color, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div className="p-6 flex-1 flex flex-col justify-center items-center text-center -mt-10">
            <div className="w-20 h-20 bg-white border-4 border-white rounded shadow-sm flex items-center justify-center overflow-hidden mb-4">
              {formData.logo_url ? <img src={formData.logo_url} className="w-full h-full object-cover" /> : <span className="text-[#A0A0A0] text-[10px] font-bold">LOGO</span>}
            </div>
            <h3 className="font-black text-lg text-black">{formData.display_name || 'Nome da Organização'}</h3>
            <HzButton className="mt-4 text-white text-xs font-bold px-6 py-2 rounded" style={{ backgroundColor: branding.primary_color }}>
              Botão Primário
            </HzButton>
          </div>
        </div>
      </div>
    </div>
  );
}