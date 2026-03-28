import React, { useState } from 'react';
import { HzInput, HzButton } from '@/components/ui';
import { CloudArrowUpIcon, PhotoIcon, BuildingOfficeIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

export function PersonalizationTab({ formData, setFormData, setLocalFiles, previewUrls, setPreviewUrls }: any) {
  
  // Estado local simplificado para gerenciamento dinâmico de departamentos na UI
  const [newDept, setNewDept] = useState('');

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

  // Funções para gerenciar o Schema Estrutural da Organização (Departamentos)
  const addDepartment = () => {
    if(!newDept.trim()) return;
    const currentDepts = formData.metadata?.departments || [];
    setFormData((p: any) => ({
      ...p,
      metadata: {
        ...p.metadata,
        departments: [...currentDepts, { id: Math.random().toString(36).substring(7), name: newDept.trim(), image_url: null }]
      }
    }));
    setNewDept('');
  };

  const removeDepartment = (id: string) => {
    const currentDepts = formData.metadata?.departments || [];
    setFormData((p: any) => ({
      ...p,
      metadata: {
        ...p.metadata,
        departments: currentDepts.filter((d: any) => d.id !== id)
      }
    }));
  };

  return (
    <div className="space-y-12 max-w-4xl animate-in fade-in pb-10">
      
      {/* SEÇÃO 1: Identidade Institucional e Roteamento */}
      <div className="space-y-6">
        <div>
           <h3 className="text-sm font-black text-black uppercase tracking-widest border-b border-[#F2F2F2] pb-3 mb-6">Identidade & Roteamento Global</h3>
           <HzInput label="Nome Oficial da Organização" value={formData.displayName} onChange={handleNameChange} placeholder="Ex: Horizion Group" />
        </div>
        <div className="p-5 border border-gray-100 rounded-2xl flex flex-col gap-2 bg-[#FAFAFA]">
           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Deep Link Global (Gerado via Slug Estrutural)</p>
           <p className="text-lg font-mono text-black">www.horaziongroup.com/org/<span className="text-[#E50000]">{formData.slug || 'nomedaorg'}</span></p>
        </div>
      </div>

      {/* SEÇÃO 2: Ativos Visuais (Branding) */}
      <div>
        <h3 className="text-sm font-black text-black uppercase tracking-widest border-b border-[#F2F2F2] pb-3 mb-6">Ativos Visuais & Marca</h3>
        <div className="grid grid-cols-2 gap-8">
          
          <div className="space-y-3">
            <label className="text-xs font-bold text-black uppercase tracking-wider">Logotipo Institucional</label>
            <label htmlFor="logo-upload" className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-[#E50000] hover:bg-red-50 hover:text-[#E50000] transition-colors group overflow-hidden bg-white shadow-sm">
              {previewUrls.logo ? <img src={previewUrls.logo} className="h-full w-auto object-contain p-4" alt="Logo Preview" /> : (
                <><CloudArrowUpIcon className="w-8 h-8 text-gray-400 group-hover:text-[#E50000] mb-2" /><span className="text-[10px] uppercase tracking-widest font-bold">Upload SVG/PNG</span></>
              )}
              <input id="logo-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} />
            </label>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-black uppercase tracking-wider">Imagem de Capa (Hub)</label>
            <label htmlFor="cover-upload" className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-[#E50000] hover:bg-red-50 hover:text-[#E50000] transition-colors group overflow-hidden bg-white shadow-sm">
              {previewUrls.cover ? <img src={previewUrls.cover} className="w-full h-full object-cover" alt="Cover Preview" /> : (
                <><PhotoIcon className="w-8 h-8 text-gray-400 group-hover:text-[#E50000] mb-2" /><span className="text-[10px] uppercase tracking-widest font-bold">1920x480px (JPEG/PNG)</span></>
              )}
              <input id="cover-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'cover')} />
            </label>
          </div>
        </div>

        <div className="space-y-3 mt-8">
          <label className="text-xs font-bold text-black uppercase tracking-wider">Cor Primária da Organização</label>
          <div className="flex items-center gap-4 h-24 border border-gray-100 rounded-2xl p-4 bg-white shadow-sm">
            <input type="color" className="w-16 h-16 rounded-xl cursor-pointer border-0 p-0 shadow-sm" value={formData.metadata?.branding?.primary_color || '#000000'} onChange={(e) => setFormData((p: any) => ({...p, metadata: {...p.metadata, branding: {...p.metadata?.branding, primary_color: e.target.value}}}))} />
            <HzInput value={formData.metadata?.branding?.primary_color || '#000000'} onChange={(e) => setFormData((p: any) => ({...p, metadata: {...p.metadata, branding: {...p.metadata?.branding, primary_color: e.target.value}}}))} className="w-48 uppercase font-mono" />
            <p className="text-[10px] text-[#A0A0A0] ml-4 font-medium max-w-xs">Esta cor definirá a herança de UI de todos os afiliados provisionados neste hub [FE-HZ].</p>
          </div>
        </div>
      </div>

      {/* SEÇÃO 3: Estrutura Organizacional e Setores Visuais */}
      <div>
        <h3 className="text-sm font-black text-black uppercase tracking-widest border-b border-[#F2F2F2] pb-3 mb-6">Organograma e Departamentos</h3>
        <p className="text-xs text-[#A0A0A0] mb-4 font-medium">Cadastre os departamentos oficiais. Estas opções irão compor os contratos estruturados nas afiliações B2B.</p>
        
        <div className="bg-[#FAFAFA] border border-[#E5E5E5] p-5 rounded-[12px]">
           <div className="flex gap-3 mb-6">
              <HzInput placeholder="Nome do Novo Departamento..." value={newDept} onChange={e => setNewDept(e.target.value)} className="flex-1 bg-white" />
              <HzButton onClick={addDepartment} className="bg-black text-white px-6 rounded-[8px] text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-colors">
                <PlusIcon className="w-4 h-4 mr-2 inline" /> Adicionar
              </HzButton>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(formData.metadata?.departments || []).map((dept: any) => (
                <div key={dept.id} className="bg-white border border-[#E5E5E5] rounded-[8px] p-4 flex items-center justify-between group shadow-sm hover:border-black transition-all">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#FAFAFA] rounded-[6px] border border-[#F2F2F2] flex items-center justify-center shrink-0 overflow-hidden relative group-hover:bg-gray-100 transition-colors cursor-pointer" title="Clique para adicionar imagem do departamento">
                         {dept.image_url ? <img src={dept.image_url} className="w-full h-full object-cover"/> : <BuildingOfficeIcon className="w-5 h-5 text-[#A0A0A0]" />}
                         <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <CloudArrowUpIcon className="w-4 h-4 text-white" />
                         </div>
                      </div>
                      <span className="text-xs font-black text-black uppercase tracking-wider">{dept.name}</span>
                   </div>
                   <button onClick={() => removeDepartment(dept.id)} className="text-[#E5E5E5] hover:text-[#E50000] transition-colors p-2">
                     <TrashIcon className="w-4 h-4" />
                   </button>
                </div>
              ))}
              {(!formData.metadata?.departments || formData.metadata.departments.length === 0) && (
                 <p className="text-[10px] text-[#A0A0A0] font-bold uppercase tracking-widest col-span-2 text-center py-4">Nenhum departamento estruturado na matriz.</p>
              )}
           </div>
        </div>
      </div>

    </div>
  );
}