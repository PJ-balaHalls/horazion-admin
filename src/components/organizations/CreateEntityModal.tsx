'use client';

import React, { useState, useMemo } from 'react';
import { HzInput, HzButton, HzSwitch, HzBadge } from '@/components/ui';
import { B2B_BENEFITS_DICTIONARY, BenefitsEngineConfig, BenefitCategory } from '@/types/b2b-organization';
import { 
  CloudArrowUpIcon, PhotoIcon, BuildingOfficeIcon, UserGroupIcon, 
  IdentificationIcon, CheckCircleIcon, ShieldCheckIcon, ChartBarIcon,
  CurrencyDollarIcon, VideoCameraIcon, UserIcon, QrCodeIcon
} from '@heroicons/react/24/outline';

// FE-HZ-011: Layout Anti-Overflow, Dual Preview (Crachá) e Dados Estruturados

type Tab = 'personalization' | 'strategic' | 'org_chart' | 'benefits' | 'mass_onboarding';
type PreviewMode = 'profile' | 'badge';

interface CreateEntityModalProps {
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

// Listas de Domínio (Poderiam vir de uma API no futuro)
const SECTORS = ['Tecnologia da Informação', 'Educação & Ensino', 'Finanças & Bancos', 'Saúde & Bem-Estar', 'Varejo & E-commerce', 'Entretenimento & Mídia'];
const OBJECTIVES = ['Expansão de Mercado', 'Treinamento Corporativo', 'Engajamento de Comunidade', 'Vendas Diretas', 'Suporte ao Cliente'];
const KPIS = ['Volume de Vendas (GMV)', 'Retenção de Usuários', 'NPS (Satisfação)', 'Horas de Consumo de Conteúdo', 'Taxa de Conversão'];

// Mapeamento de Ícones para Categorias de Benefícios
const CategoryIcons: Record<BenefitCategory, React.ElementType> = {
  identity: IdentificationIcon,
  access: ShieldCheckIcon,
  content: VideoCameraIcon,
  data: ChartBarIcon,
  community: UserGroupIcon,
  monetization: CurrencyDollarIcon
};

export function CreateEntityModal({ onClose, onSave }: CreateEntityModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('personalization');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('profile');
  const [loading, setLoading] = useState(false);

  const [localFiles, setLocalFiles] = useState<{ logo: File | null; cover: File | null }>({ logo: null, cover: null });
  const [previewUrls, setPreviewUrls] = useState({ logo: '', cover: '' });

  const [formData, setFormData] = useState({
    displayName: '',
    slug: '',
    branding: { primary_color: '#E50000' },
    strategic_data: { sector: '', hierarchy_level: 'master', website: '', headquarters_location: '', business_objectives: [] as string[], monitoring_kpis: [] as string[] },
    org_chart: { 
      departments: [{ id: 'd1', name: 'Diretoria Executiva', members: [] as { name: string, role: string, identifier: string }[] }] 
    },
    benefits_engine: B2B_BENEFITS_DICTIONARY.reduce((acc, b) => ({ ...acc, [b.id]: false }), {} as BenefitsEngineConfig),
    mass_onboarding_list: [] as { nome: string, identifier: string, role: string }[]
  });

  const [empInput, setEmpInput] = useState({ nome: '', identifier: '', role: '' });
  const [newDeptName, setNewDeptName] = useState('');

  // Helpers
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setFormData((prev) => ({ ...prev, displayName: name, slug }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'cover') => {
    const file = e.target.files?.[0];
    if (file) {
      setLocalFiles(prev => ({ ...prev, [type]: file }));
      setPreviewUrls(prev => ({ ...prev, [type]: URL.createObjectURL(file) }));
    }
  };

  const toggleArrayItem = (path: 'business_objectives' | 'monitoring_kpis', value: string) => {
    setFormData(prev => {
      const current = prev.strategic_data[path];
      const updated = current.includes(value) ? current.filter(item => item !== value) : [...current, value];
      return { ...prev, strategic_data: { ...prev.strategic_data, [path]: updated } };
    });
  };

  const addDepartment = () => {
    if (!newDeptName) return;
    setFormData(prev => ({
      ...prev,
      org_chart: { departments: [...prev.org_chart.departments, { id: Date.now().toString(), name: newDeptName, members: [] }] }
    }));
    setNewDeptName('');
  };

  const addEmployee = () => {
    if (empInput.nome && empInput.identifier && empInput.role) {
      setFormData(prev => ({
        ...prev, mass_onboarding_list: [...prev.mass_onboarding_list, empInput]
      }));
      setEmpInput({ nome: '', identifier: '', role: '' });
    }
  };

  const submitModal = async () => {
    setLoading(true);
    try {
      await onSave({ ...formData, local_files: localFiles });
      onClose();
    } catch (error) {
      console.error('Erro ao salvar entidade', error);
    } finally {
      setLoading(false);
    }
  };

  const groupedBenefits = useMemo(() => {
    const groups = { identity: [], access: [], content: [], data: [], community: [], monetization: [] } as Record<BenefitCategory, typeof B2B_BENEFITS_DICTIONARY>;
    B2B_BENEFITS_DICTIONARY.forEach(b => groups[b.category].push(b));
    return groups;
  }, []);

  return (
    // Layout Anti-Overflow: h-screen travado. Somente o 'main' tem rolagem.
    <div className="fixed inset-0 bg-white z-50 flex flex-col h-screen overflow-hidden">
      
      {/* Header Fixo */}
      <header className="flex-none bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center z-20 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-black tracking-tight">Nova Entidade B2B</h2>
          <p className="text-sm text-gray-500">Provisionamento do ecossistema e geração de blocos.</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-red-600 transition-colors text-3xl font-light">&times;</button>
      </header>

      <div className="flex flex-1 overflow-hidden bg-gray-50/30">
        
        {/* Sidebar Fixo */}
        <nav className="w-64 flex-none bg-white border-r border-gray-100 p-6 flex flex-col gap-2 overflow-y-auto">
          {[
            { id: 'personalization', label: '1. Identidade Visual' },
            { id: 'strategic', label: '2. Estratégia & KPIs' },
            { id: 'org_chart', label: '3. Organograma' },
            { id: 'benefits', label: '4. Motor de Benefícios' },
            { id: 'mass_onboarding', label: '5. Onboarding' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id ? 'bg-red-50 text-red-600 shadow-sm border border-red-100' : 'text-gray-600 hover:bg-gray-50 border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Área de Conteúdo Central (Com Rolagem Independente) */}
        <main className="flex-1 overflow-y-auto p-10 custom-scrollbar relative">
          
          {/* ABA 1: Personalização */}
          {activeTab === 'personalization' && (
            <div className="max-w-3xl space-y-8 animate-in fade-in">
              <HzInput label="Nome Oficial da Organização" value={formData.displayName} onChange={handleNameChange} placeholder="Ex: Horizion Group" />
              
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-black">Logotipo (Ícone)</label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-red-300 transition-all">
                    <CloudArrowUpIcon className="w-6 h-6 text-gray-400 mb-2" />
                    <span className="text-xs text-gray-500">Upload SVG/PNG</span>
                    <input type="file" className="hidden" accept="image/png, image/jpeg, image/svg+xml" onChange={(e) => handleFileUpload(e, 'logo')} />
                  </label>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-black">Imagem de Capa</label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-red-300 transition-all">
                    <PhotoIcon className="w-6 h-6 text-gray-400 mb-2" />
                    <span className="text-xs text-gray-500">Recomendado: 1920x480px</span>
                    <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={(e) => handleFileUpload(e, 'cover')} />
                  </label>
                </div>
              </div>

              {/* Seletor de Cores Aprimorado */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-black">Cor Primária da Marca</label>
                <div className="flex items-center gap-4">
                  <input type="color" className="w-14 h-14 rounded cursor-pointer border-0 p-0" value={formData.branding.primary_color} onChange={(e) => setFormData(p => ({...p, branding: {...p.branding, primary_color: e.target.value}}))} />
                  <HzInput value={formData.branding.primary_color} onChange={(e) => setFormData(p => ({...p, branding: {...p.branding, primary_color: e.target.value}}))} className="w-32 uppercase font-mono" />
                  <div className="flex gap-2 ml-auto">
                    {['#E50000', '#000000', '#1E3A8A', '#059669', '#D97706'].map(color => (
                      <button key={color} onClick={() => setFormData(p => ({...p, branding: {...p.branding, primary_color: color}}))} className="w-8 h-8 rounded-full border border-gray-200 hover:scale-110 transition-transform" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ABA 2: Estratégia (Listas Inteligentes) */}
          {activeTab === 'strategic' && (
            <div className="max-w-3xl space-y-8 animate-in fade-in">
               <div className="space-y-2">
                 <label className="text-sm font-medium text-black">Setor de Atuação</label>
                 <select className="w-full h-11 px-4 border border-gray-200 rounded-xl bg-white text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none" value={formData.strategic_data.sector} onChange={(e) => setFormData(p => ({...p, strategic_data: {...p.strategic_data, sector: e.target.value}}))}>
                   <option value="">Selecione um setor na lista...</option>
                   {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
               </div>

               <div className="space-y-3">
                 <label className="text-sm font-medium text-black">Objetivos de Negócio (Selecione até 3)</label>
                 <div className="grid grid-cols-2 gap-3">
                   {OBJECTIVES.map(obj => (
                     <label key={obj} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${formData.strategic_data.business_objectives.includes(obj) ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                       <input type="checkbox" className="accent-red-600 w-4 h-4" checked={formData.strategic_data.business_objectives.includes(obj)} onChange={() => toggleArrayItem('business_objectives', obj)} />
                       <span className="text-sm text-gray-800">{obj}</span>
                     </label>
                   ))}
                 </div>
               </div>

               <div className="space-y-3">
                 <label className="text-sm font-medium text-black">KPIs Monitorados (Métricas de Sucesso)</label>
                 <div className="grid grid-cols-2 gap-3">
                   {KPIS.map(kpi => (
                     <label key={kpi} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${formData.strategic_data.monitoring_kpis.includes(kpi) ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                       <input type="checkbox" className="accent-blue-600 w-4 h-4" checked={formData.strategic_data.monitoring_kpis.includes(kpi)} onChange={() => toggleArrayItem('monitoring_kpis', kpi)} />
                       <span className="text-sm text-gray-800">{kpi}</span>
                     </label>
                   ))}
                 </div>
               </div>
            </div>
          )}

          {/* ABA 3: Organograma */}
          {activeTab === 'org_chart' && (
            <div className="max-w-3xl space-y-8 animate-in fade-in">
              <div className="flex gap-4 items-end">
                <div className="flex-1"><HzInput label="Novo Departamento" value={newDeptName} onChange={e => setNewDeptName(e.target.value)} placeholder="Ex: Engenharia de Software" /></div>
                <HzButton onClick={addDepartment} className="bg-gray-900 text-white h-11 px-6 rounded-xl hover:bg-black">Adicionar</HzButton>
              </div>

              <div className="space-y-6">
                {formData.org_chart.departments.map(dept => (
                  <div key={dept.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                      <h3 className="font-bold text-black flex items-center gap-2"><UserGroupIcon className="w-5 h-5 text-gray-400"/> {dept.name}</h3>
                      <span className="text-xs text-gray-400">{dept.members.length} membros</span>
                    </div>
                    {/* Aqui entraria a lógica de adicionar membros específicos ao departamento */}
                    <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg text-center border border-dashed border-gray-200">
                      Integração de Membros será habilitada após salvar a entidade raiz.
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ABA 4: Benefícios Interativos */}
          {activeTab === 'benefits' && (
            <div className="space-y-12 animate-in fade-in pb-20">
               {(Object.keys(groupedBenefits) as BenefitCategory[]).map((cat) => {
                 const Icon = CategoryIcons[cat];
                 return (
                   <div key={cat} className="space-y-4">
                     <h4 className="flex items-center gap-2 text-sm uppercase tracking-widest font-bold text-gray-800 border-b border-gray-200 pb-3">
                       <Icon className="w-5 h-5 text-red-600" /> Módulo: {cat}
                     </h4>
                     <div className="grid grid-cols-2 gap-4">
                       {groupedBenefits[cat].map(benefit => (
                         <div key={benefit.id} onClick={() => setFormData(prev => ({ ...prev, benefits_engine: { ...prev.benefits_engine, [benefit.id]: !prev.benefits_engine[benefit.id] } }))} 
                              className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between h-36 ${formData.benefits_engine[benefit.id] ? 'bg-red-50 border-red-500 shadow-md scale-[1.02]' : 'bg-white border-gray-200 hover:border-red-300 hover:shadow-sm'}`}>
                           <div className="flex justify-between items-start">
                             <p className={`text-sm font-bold ${formData.benefits_engine[benefit.id] ? 'text-red-700' : 'text-gray-900'}`}>{benefit.label}</p>
                             {formData.benefits_engine[benefit.id] ? <CheckCircleIcon className="w-6 h-6 text-red-600" /> : <div className="w-6 h-6 rounded-full border-2 border-gray-200" />}
                           </div>
                           <p className="text-xs text-gray-500 leading-relaxed mt-2">{benefit.description}</p>
                         </div>
                       ))}
                     </div>
                   </div>
                 );
               })}
            </div>
          )}

          {/* ABA 5: Onboarding */}
          {activeTab === 'mass_onboarding' && (
            <div className="max-w-4xl space-y-8 animate-in fade-in">
               <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <h3 className="text-sm font-bold text-black mb-4">Onboarding Unitário (Zero Trust)</h3>
                  <div className="grid grid-cols-4 gap-4 items-end">
                    <div className="col-span-1"><HzInput label="Nome (Visual)" value={empInput.nome} onChange={e => setEmpInput(p => ({...p, nome: e.target.value}))} placeholder="Ex: Pedro Silva" /></div>
                    <div className="col-span-1"><HzInput label="HorizionID ou CPF" value={empInput.identifier} onChange={e => setEmpInput(p => ({...p, identifier: e.target.value}))} placeholder="@pedro ou 000.000..." /></div>
                    <div className="col-span-1"><HzInput label="Cargo/Role" value={empInput.role} onChange={e => setEmpInput(p => ({...p, role: e.target.value}))} placeholder="Ex: CEO" /></div>
                    <HzButton onClick={addEmployee} className="col-span-1 bg-black text-white h-11 rounded-xl hover:bg-gray-800 w-full">Vincular</HzButton>
                  </div>
               </div>

               {formData.mass_onboarding_list.length > 0 && (
                 <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                   <table className="w-full text-left text-sm">
                     <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                       <tr><th className="p-4 font-semibold">Colaborador</th><th className="p-4 font-semibold">Identificador</th><th className="p-4 font-semibold">Cargo</th><th className="p-4 font-semibold">Status</th></tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                       {formData.mass_onboarding_list.map((emp, idx) => (
                         <tr key={idx} className="bg-white hover:bg-gray-50 transition-colors">
                           <td className="p-4 font-medium text-black flex items-center gap-3"><UserIcon className="w-8 h-8 p-1.5 bg-gray-100 rounded-full text-gray-500"/>{emp.nome}</td>
                           <td className="p-4 text-gray-600 font-mono">{emp.identifier}</td>
                           <td className="p-4 text-gray-600">{emp.role}</td>
                           <td className="p-4"><HzBadge variant="warning">Convite Pendente</HzBadge></td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               )}
            </div>
          )}
        </main>

        {/* Dual Live Preview Lateral (Fixo na tela, sem rolar com o modal) */}
        <aside className="w-[360px] flex-none bg-gray-50 border-l border-gray-200 p-6 flex flex-col items-center shadow-inner overflow-y-auto">
          
          <div className="flex w-full bg-gray-200 rounded-lg p-1 mb-8">
            <button onClick={() => setPreviewMode('profile')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${previewMode === 'profile' ? 'bg-white text-black shadow' : 'text-gray-500'}`}>Perfil</button>
            <button onClick={() => setPreviewMode('badge')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${previewMode === 'badge' ? 'bg-white text-black shadow' : 'text-gray-500'}`}>Crachá Escala</button>
          </div>
          
          {/* PREVIEW 1: Perfil Oficial da Entidade */}
          {previewMode === 'profile' && (
            <div className="w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden transform transition-all duration-300 animate-in zoom-in-95">
              <div className="h-32 w-full relative" style={{ backgroundColor: previewUrls.cover ? 'transparent' : formData.branding.primary_color }}>
                {previewUrls.cover && <img src={previewUrls.cover} className="w-full h-full object-cover" alt="Cover" />}
              </div>
              
              <div className="px-6 pb-8 pt-0 relative flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-2xl bg-white shadow-lg border-4 border-white absolute -top-10 flex items-center justify-center overflow-hidden">
                  {previewUrls.logo ? <img src={previewUrls.logo} className="w-full h-full object-cover" /> : <BuildingOfficeIcon className="w-10 h-10 text-gray-300" />}
                </div>
                
                <div className="mt-14 w-full">
                  <h3 className="text-xl font-bold text-black leading-tight truncate">{formData.displayName || 'Nome da Entidade'}</h3>
                  <p className="text-sm text-gray-500 mt-1 truncate">{formData.strategic_data.sector || 'Setor não definido'}</p>
                  
                  {formData.benefits_engine.verified_badge && (
                    <div className="mt-4 flex justify-center"><HzBadge variant="success" className="bg-green-50 text-green-700 border-green-200"> Organização Verificada</HzBadge></div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PREVIEW 2: Crachá Corporativo (Badge) */}
          {previewMode === 'badge' && (
            <div className="w-full bg-white rounded-[32px] shadow-2xl border border-gray-100 overflow-hidden transform transition-all duration-300 animate-in zoom-in-95 aspect-[2/3] flex flex-col relative">
              {/* Lanyard Hole */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-3 bg-gray-100 rounded-full border border-gray-200 shadow-inner z-10"></div>
              
              {/* Badge Header (Cor da Empresa) */}
              <div className="h-32 w-full flex flex-col items-center justify-end pb-4 relative" style={{ backgroundColor: formData.branding.primary_color }}>
                 {previewUrls.logo && <img src={previewUrls.logo} className="w-12 h-12 rounded-lg bg-white p-1 shadow-md absolute top-8 left-1/2 -translate-x-1/2" />}
              </div>

              {/* Corpo do Crachá */}
              <div className="flex-1 flex flex-col items-center px-6 pt-12 pb-6 text-center">
                 <div className="w-24 h-24 bg-gray-100 rounded-full border-4 border-white shadow-lg absolute top-20 left-1/2 -translate-x-1/2 overflow-hidden flex items-center justify-center">
                    <UserIcon className="w-12 h-12 text-gray-300" />
                 </div>
                 
                 <h2 className="text-2xl font-bold text-black uppercase tracking-tight leading-none mt-4">
                   {formData.mass_onboarding_list[0]?.nome || 'JOHN DOE'}
                 </h2>
                 <p className="text-sm font-semibold text-gray-500 mt-2 uppercase tracking-widest">
                   {formData.mass_onboarding_list[0]?.role || 'COLABORADOR'}
                 </p>

                 <div className="mt-auto w-full pt-6 border-t border-gray-100 border-dashed flex flex-col items-center">
                   <QrCodeIcon className="w-16 h-16 text-gray-800" />
                   <p className="text-[10px] font-mono text-gray-400 mt-2">ID: {formData.mass_onboarding_list[0]?.identifier || 'HORIZION-EMP-001'}</p>
                 </div>
              </div>
            </div>
          )}

          <div className="mt-auto w-full pt-8">
            <div className="flex items-center gap-2 p-4 bg-gray-100 rounded-xl text-xs text-gray-600 font-mono">
              <ShieldCheckIcon className="w-5 h-5 text-green-600" /> Sistema Seguro / Zero Trust
            </div>
          </div>
        </aside>
      </div>

      {/* Footer Fixo (Na base da tela) */}
      <footer className="flex-none bg-white border-t border-gray-200 p-5 flex justify-end gap-4 z-20">
        <HzButton variant="ghost" onClick={onClose} className="text-gray-500 hover:bg-gray-100 px-6">Cancelar</HzButton>
        <HzButton onClick={submitModal} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white min-w-[200px] h-11 text-base shadow-md">
          {loading ? 'Sincronizando...' : 'Consolidar Entidade'}
        </HzButton>
      </footer>
    </div>
  );
}