'use client';

import React, { useState, useEffect } from 'react';
import { StarRole } from '@/types/horizion';
import { generateHorizionID } from '@/utils/horizionIdGenerator';
import { HzButton, HzInput, HzSelect, HzSkeleton } from '@/components/ui';
import { supabase } from '@/lib/supabase';

interface CreateUserModalProps { isOpen: boolean; onClose: () => void; onSuccess: () => void; }
type TabId = 'mandatory' | 'personal' | 'location' | 'settings';

const PRONOUNS_LIST = [
  { label: 'Selecione...', value: '' }, { label: 'Ele/Dele', value: 'Ele/Dele' },
  { label: 'Ela/Dela', value: 'Ela/Dela' }, { label: 'Elu/Delu', value: 'Elu/Delu' },
  { label: 'Eles/Deles', value: 'Eles/Deles' }, { label: 'Elas/Delas', value: 'Elas/Delas' },
  { label: 'Prefiro não informar', value: 'Nao_Informar' }
];

const PHONE_CODES = [
  { label: '+55 (BR)', value: '+55' }, { label: '+351 (PT)', value: '+351' },
  { label: '+1 (US/CA)', value: '+1' }, { label: '+44 (UK)', value: '+44' },
  { label: '+49 (DE)', value: '+49' }, { label: '+34 (ES)', value: '+34' }
];

const OCCUPATIONS_LIST = [
  { label: 'Selecione um cargo...', value: '' },
  "Administrador", "Advogado", "Analista de Dados", "Arquiteto", "Arquiteto de Software", 
  "Cientista de Dados", "Consultor", "Desenvolvedor Backend", "Desenvolvedor Frontend", 
  "Diretor Executivo (CEO)", "Engenheiro de Software", "Gerente de Projetos", "Médico", 
  "Product Manager", "Sócio", "Outro"
].map(o => typeof o === 'string' ? { label: o, value: o } : o);

export function CreateUserModal({ isOpen, onClose, onSuccess }: CreateUserModalProps) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [activeTab, setActiveTab] = useState<TabId>('mandatory');
  const [loading, setLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [isUsernameEdited, setIsUsernameEdited] = useState(false);
  
  const [hId, setHId] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [orgList, setOrgList] = useState<{id: string, display_name: string}[]>([]);
  
  const [form, setForm] = useState({
    first_name: '', last_name: '', username: '', email: '', role: 'sun' as StarRole,
    document_id: '', pronouns: '', birth_date: '', phone_code: '+55', phone: '', 
    occupation: '', company: '', bio: '', timezone: 'America/Sao_Paulo', preferred_language: 'pt-BR',
    cep: '', address: '', city: '', state: '', country: '',
    location_settings: { group_region: true, allow_monitoring: false },
    custom_data: { linkedin: '', github: '' },
    permissions: { can_create_universe: false, can_bypass_ads: false, can_manage_users: false, can_view_financials: false },
    flags: { send_notification: true, require_completion: true, agree_terms: false },
    entity_id: '', affiliation_role: 'member'
  });

  const TABS = [
    { id: 'mandatory', label: 'Identidade & Docs' }, { id: 'personal', label: 'Perfil Pessoal' },
    { id: 'location', label: 'Localização' }, { id: 'settings', label: 'Ações & Permissões' }
  ];

  const currentTabIndex = TABS.findIndex(t => t.id === activeTab);

  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setActiveTab('mandatory');
      setHId(generateHorizionID());
      setTempPassword(Math.random().toString(36).slice(-10).toUpperCase() + '@HZ1');
      setForm({
        first_name: '', last_name: '', username: '', email: '', role: 'sun',
        document_id: '', pronouns: '', birth_date: '', phone_code: '+55', phone: '', 
        occupation: '', company: '', bio: '', timezone: 'America/Sao_Paulo', preferred_language: 'pt-BR',
        cep: '', address: '', city: '', state: '', country: '',
        location_settings: { group_region: true, allow_monitoring: false },
        custom_data: { linkedin: '', github: '' },
        permissions: { can_create_universe: false, can_bypass_ads: false, can_manage_users: false, can_view_financials: false },
        flags: { send_notification: true, require_completion: true, agree_terms: false },
        entity_id: '', affiliation_role: 'member'
      });
      setIsUsernameEdited(false);
      
      // Buscar Organizações B2B para o select
      supabase.from('entities').select('id, display_name').then(({data}) => setOrgList(data || []));
    }
  }, [isOpen]);

  const handleNameChange = (field: 'first_name' | 'last_name', value: string) => {
    const newForm = { ...form, [field]: value };
    if (!isUsernameEdited) {
      const fn = newForm.first_name.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "");
      const ln = newForm.last_name.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "");
      newForm.username = `${fn}${ln ? `.${ln}` : ''}`;
    }
    setForm(newForm);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    if (val.length > 2) val = `(${val.slice(0, 2)}) ${val.slice(2)}`;
    if (val.length > 10) val = `${val.slice(0, 10)}-${val.slice(10)}`;
    setForm({ ...form, phone: val });
  };

  const handleTabChange = (tabId: TabId) => {
    if (activeTab === tabId) return;
    setIsTabLoading(true);
    setActiveTab(tabId);
    setTimeout(() => setIsTabLoading(false), 300);
  };

  const handleNext = () => { if (currentTabIndex < TABS.length - 1) handleTabChange(TABS[currentTabIndex + 1].id as TabId); };
  const handlePrev = () => { if (currentTabIndex > 0) handleTabChange(TABS[currentTabIndex - 1].id as TabId); };

  const handleCepLookup = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cleanCep = e.target.value.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      setIsFetchingData(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();
        if (!data.erro) setForm(p => ({ ...p, address: data.logradouro, city: data.localidade, state: data.uf, country: 'BR' }));
      } catch (e) { console.warn("Falha no CEP"); }
      finally { setIsFetchingData(false); }
    }
  };

  const togglePermission = (key: keyof typeof form.permissions) => setForm({ ...form, permissions: { ...form.permissions, [key]: !form.permissions[key] } });
  const toggleLocation = (key: keyof typeof form.location_settings) => setForm({ ...form, location_settings: { ...form.location_settings, [key]: !form.location_settings[key] } });

  const handleCreate = async () => {
    if (!form.first_name || !form.email) return alert("Nome e E-mail são obrigatórios.");
    if (!form.flags.agree_terms) return alert("Confirme a aceitação dos Termos de Serviço.");
    
    setLoading(true);
    try {
      const full_name = `${form.first_name} ${form.last_name}`.trim();
      const payload = { ...form, full_name, horizion_id: hId, password: tempPassword, status: form.flags.require_completion ? 'pre_registered' : 'active' };
      
      const response = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (response.ok) { setStep('success'); onSuccess(); } 
      else { const err = await response.json(); alert(`Falha no aprovisionamento: ${err.user_message || 'Erro desconhecido'}`); }
    } catch { alert(`Falha de comunicação com o servidor.`); }
    setLoading(false);
  };

  const getRichTextCredentials = () => `[ HORIZION LIFE | CREDENCIAIS ]\nNome: ${form.first_name} ${form.last_name}\nE-mail: ${form.email}\nApelido: @${form.username}\nHorizion ID: ${hId}\nSenha Provisória: ${tempPassword}\n\n${form.flags.require_completion ? 'Acesse o sistema para completar o seu pré-cadastro.' : 'Acesse o sistema e altere a sua senha imediatamente.'}`;

  if (!isOpen) return null;

  return (
    <div className="flex flex-col w-full h-full bg-white animate-in fade-in duration-300 relative">
      {isFetchingData && <div className="absolute top-0 left-0 w-full h-0.5 bg-[#F2F2F2] z-50"><div className="h-full bg-black animate-pulse w-1/3" /></div>}

      {step === 'form' ? (
        <>
          <header className="flex-none px-10 pt-8 border-b border-[#F2F2F2] bg-white">
            <div className="max-w-4xl mx-auto flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold text-black tracking-tight">Aprovisionamento Core</h1>
                <p className="text-[11px] font-bold text-[#A0A0A0] uppercase tracking-widest mt-1">Injeção de Identidade B2B/B2C</p>
              </div>
              <HzButton variant="ghost" onClick={onClose} className="text-[#A0A0A0] text-xs font-bold uppercase tracking-widest hover:text-black">Cancelar</HzButton>
            </div>
            <nav className="flex gap-8 overflow-x-auto max-w-4xl mx-auto">
              {TABS.map((tab, idx) => {
                const isActive = activeTab === tab.id;
                const isCompleted = idx < currentTabIndex;
                return (
                  <button key={tab.id} onClick={() => handleTabChange(tab.id as TabId)} className={`pb-3 text-xs font-bold uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${isActive ? 'border-black text-black' : isCompleted ? 'border-transparent text-black hover:text-[#B6192E]' : 'border-transparent text-[#A0A0A0] hover:text-black'}`}>
                    {String(idx + 1).padStart(2, '0')}. {tab.label}
                  </button>
                );
              })}
            </nav>
          </header>

          <main className="flex-1 overflow-y-auto p-10 custom-scrollbar">
            <div className="max-w-4xl mx-auto">
              {(isTabLoading || isFetchingData) ? (
                <div className="space-y-6 animate-pulse"><div className="grid grid-cols-2 gap-6"><HzSkeleton className="h-16 rounded" /><HzSkeleton className="h-16 rounded" /></div><HzSkeleton className="h-24 w-full rounded mt-4" /></div>
              ) : (
                <div className="space-y-8 animate-in fade-in duration-300">
                  
                  {activeTab === 'mandatory' && (
                    <div className="space-y-8">
                      <div className="grid grid-cols-2 gap-6 p-6 border border-[#F2F2F2] rounded bg-[#FAFAFA] shadow-sm">
                        <div><label className="text-[10px] font-bold uppercase text-[#A0A0A0] tracking-widest">Horizion ID Base</label><p className="text-lg font-mono font-black mt-1 text-black">{hId}</p></div>
                        <div><label className="text-[10px] font-bold uppercase text-[#B6192E] tracking-widest">Senha Provisória</label><p className="text-lg font-mono font-black mt-1 text-[#B6192E]">{tempPassword}</p></div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-8">
                        <HzInput label="Primeiro Nome *" value={form.first_name} onChange={e => handleNameChange('first_name', e.target.value)} />
                        <HzInput label="Último Nome / Sobrenome *" value={form.last_name} onChange={e => handleNameChange('last_name', e.target.value)} />
                        
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest">Apelido (Username) *</label>
                          <div className="flex items-center border border-[#F2F2F2] rounded bg-[#FAFAFA] overflow-hidden focus-within:border-black transition-all">
                            <span className="px-3 py-2.5 text-[#A0A0A0] font-bold text-sm border-r border-[#F2F2F2]">@</span>
                            <input type="text" className="w-full px-3 py-2.5 text-sm outline-none font-medium bg-transparent" value={form.username} onChange={e => { setIsUsernameEdited(true); setForm({...form, username: e.target.value.toLowerCase().replace(/\s/g, '')}); }} placeholder="joao.silva" />
                          </div>
                        </div>

                        <HzInput label="E-mail *" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                        <HzSelect label="Nível de Acesso (Plataforma)" options={[{label: 'Sun (Usuário Base)', value: 'sun'}, {label: 'Sirius (Admin)', value: 'sirius'}]} value={form.role} onChange={v => setForm({...form, role: v as StarRole})} />
                        <HzInput label="CPF / Documento *" placeholder="Apenas números" value={form.document_id} onChange={e => setForm({...form, document_id: e.target.value})} />
                      </div>

                      {/* Vinculação B2B */}
                      <div className="pt-6 border-t border-[#F2F2F2]">
                        <h3 className="text-[11px] font-bold uppercase text-black tracking-widest mb-4">Vinculação Corporativa (B2B)</h3>
                        <div className="grid grid-cols-2 gap-8">
                          <HzSelect 
                            label="Organização Hub" 
                            options={[{label: 'Nenhuma (Independente)', value: ''}, ...orgList.map(o => ({label: o.display_name, value: o.id}))]} 
                            value={form.entity_id} 
                            onChange={val => setForm({...form, entity_id: val})} 
                          />
                          <HzSelect 
                            label="Cargo na Organização" 
                            options={[{label: 'Membro Padrão', value: 'member'}, {label: 'Administrador Org', value: 'admin'}, {label: 'Gestor Financeiro', value: 'finance'}]} 
                            value={form.affiliation_role} 
                            onChange={val => setForm({...form, affiliation_role: val})} 
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'personal' && (
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest">Data de Nascimento</label>
                        <input type="date" value={form.birth_date} onChange={e => setForm({...form, birth_date: e.target.value})} className="w-full px-3 py-2.5 border border-[#F2F2F2] rounded text-sm font-medium focus:outline-none focus:border-black transition-all bg-white" />
                      </div>
                      
                      <HzSelect label="Pronomes" options={PRONOUNS_LIST} value={form.pronouns} onChange={val => setForm({...form, pronouns: val})} />
                      
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest">Telefone Principal</label>
                        <div className="flex gap-2">
                          <select value={form.phone_code} onChange={e => setForm({...form, phone_code: e.target.value})} className="w-1/3 px-2 py-2.5 border border-[#F2F2F2] rounded text-sm bg-[#FAFAFA] font-medium focus:outline-none focus:border-black">
                            {PHONE_CODES.map(pc => <option key={pc.value} value={pc.value}>{pc.label}</option>)}
                          </select>
                          <input type="text" placeholder="(11) 90000-0000" value={form.phone} onChange={handlePhoneChange} className="w-2/3 px-3 py-2.5 border border-[#F2F2F2] rounded text-sm font-medium focus:outline-none focus:border-black transition-all bg-white" />
                        </div>
                      </div>

                      <HzSelect label="Ocupação / Cargo" options={OCCUPATIONS_LIST} value={form.occupation} onChange={val => setForm({...form, occupation: val})} />
                      <HzInput label="Empresa Atual" value={form.company} onChange={e => setForm({...form, company: e.target.value})} />
                    </div>
                  )}

                  {activeTab === 'location' && (
                    <div className="space-y-10">
                      <div className="grid grid-cols-3 gap-8">
                        <HzInput label="CEP" placeholder="Ex: 01001-000" value={form.cep} onBlur={handleCepLookup} onChange={e => setForm({...form, cep: e.target.value})} />
                        <div className="col-span-2"><HzInput label="Endereço Automático" value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
                        <HzInput label="Cidade" value={form.city} onChange={e => setForm({...form, city: e.target.value})} />
                        <HzInput label="Estado" placeholder="SP" value={form.state} onChange={e => setForm({...form, state: e.target.value})} />
                        <HzInput label="País" placeholder="BR" value={form.country} onChange={e => setForm({...form, country: e.target.value})} />
                      </div>
                      <div className="pt-6 border-t border-[#F2F2F2]">
                        <h3 className="text-[10px] font-bold uppercase text-[#A0A0A0] tracking-widest mb-4">Configurações de Localização / Hub</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <label className="flex items-center gap-3 p-4 border border-[#F2F2F2] rounded cursor-pointer hover:bg-[#FAFAFA] transition-colors">
                            <input type="checkbox" checked={form.location_settings.group_region} onChange={() => toggleLocation('group_region')} className="w-4 h-4 accent-black" />
                            <span className="text-xs font-bold text-black">Agrupar utilizador no Hub da Região</span>
                          </label>
                          <label className="flex items-center gap-3 p-4 border border-[#F2F2F2] rounded cursor-pointer hover:bg-[#FAFAFA] transition-colors">
                            <input type="checkbox" checked={form.location_settings.allow_monitoring} onChange={() => toggleLocation('allow_monitoring')} className="w-4 h-4 accent-black" />
                            <span className="text-xs font-bold text-black">Permitir Monitoramento Global (Geotagging)</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'settings' && (
                    <div className="space-y-10">
                      <div>
                        <h3 className="text-[10px] font-bold uppercase text-[#A0A0A0] tracking-widest mb-4">Pré-Cadastro & Onboarding</h3>
                        <div className="space-y-3">
                          <label className="flex items-center gap-4 cursor-pointer p-4 border border-[#F2F2F2] rounded hover:border-black bg-[#FAFAFA] transition-colors">
                            <input type="checkbox" checked={form.flags.require_completion} onChange={() => setForm(p => ({...p, flags: {...p.flags, require_completion: !p.flags.require_completion}}))} className="w-4 h-4 accent-[#B6192E]" />
                            <span className="text-xs font-black text-black">Modo Pré-Cadastro (Usuário deve finalizar a conta no 1º acesso)</span>
                          </label>
                          <label className="flex items-center gap-4 cursor-pointer p-4 border border-[#F2F2F2] rounded hover:bg-[#FAFAFA] transition-colors">
                            <input type="checkbox" checked={form.flags.agree_terms} onChange={() => setForm(p => ({...p, flags: {...p.flags, agree_terms: !p.flags.agree_terms}}))} className="w-4 h-4 accent-black" />
                            <span className="text-xs font-bold text-[#A0A0A0]">Aprovação Override: Aceitar Termos de Serviço em nome do titular</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-[10px] font-bold uppercase text-[#A0A0A0] tracking-widest mb-4">Matriz de Permissões Avançadas</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <label className="flex items-center gap-3 p-4 border border-[#F2F2F2] rounded cursor-pointer hover:bg-[#FAFAFA]"><input type="checkbox" checked={form.permissions.can_create_universe} onChange={() => togglePermission('can_create_universe')} className="w-4 h-4 accent-black" /><span className="text-xs font-bold">Criar Universos Locais</span></label>
                          <label className="flex items-center gap-3 p-4 border border-[#F2F2F2] rounded cursor-pointer hover:bg-[#FAFAFA]"><input type="checkbox" checked={form.permissions.can_bypass_ads} onChange={() => togglePermission('can_bypass_ads')} className="w-4 h-4 accent-black" /><span className="text-xs font-bold">Isenção de Anúncios (VIP)</span></label>
                          <label className="flex items-center gap-3 p-4 border border-[#F2F2F2] rounded cursor-pointer hover:bg-[#FAFAFA]"><input type="checkbox" checked={form.permissions.can_manage_users} onChange={() => togglePermission('can_manage_users')} className="w-4 h-4 accent-black" /><span className="text-xs font-bold">Gerir Outros Utilizadores</span></label>
                          <label className="flex items-center gap-3 p-4 border border-[#F2F2F2] rounded cursor-pointer hover:bg-[#FAFAFA]"><input type="checkbox" checked={form.permissions.can_view_financials} onChange={() => togglePermission('can_view_financials')} className="w-4 h-4 accent-black" /><span className="text-xs font-bold">Acesso a Dados Financeiros</span></label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>

          <footer className="flex-none px-10 py-5 border-t border-[#F2F2F2] flex justify-center bg-white z-20">
            <div className="flex justify-between w-full max-w-4xl">
              <HzButton variant="ghost" onClick={handlePrev} disabled={currentTabIndex === 0 || isTabLoading} className="text-xs font-bold uppercase tracking-widest text-[#A0A0A0] hover:text-black">Voltar</HzButton>
              {currentTabIndex < TABS.length - 1 ? (
                <HzButton className="bg-black text-white text-xs font-bold uppercase tracking-widest px-6 py-2.5 rounded hover:bg-[#B6192E] transition-colors" onClick={handleNext} disabled={isTabLoading}>Avançar</HzButton>
              ) : (
                <HzButton className="bg-black text-white text-xs font-bold uppercase tracking-widest px-8 py-2.5 rounded hover:bg-[#B6192E] transition-colors" onClick={handleCreate} disabled={loading || isTabLoading}>{loading ? 'A processar...' : 'Aprovisionar Conta'}</HzButton>
              )}
            </div>
          </footer>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-10 bg-white">
          <div className="max-w-xl w-full text-center space-y-6 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-white border-2 border-black text-black rounded-full flex items-center justify-center text-3xl mx-auto shadow-sm">✓</div>
            <h2 className="text-2xl font-black text-black tracking-tight">Identidade Aprovisionada</h2>
            <p className="text-sm text-[#A0A0A0] font-medium">A identidade de {form.first_name} (@{form.username}) foi registrada com sucesso.</p>
            <div className="p-8 border border-[#F2F2F2] rounded text-left space-y-4 bg-[#FAFAFA] shadow-sm">
              <div><p className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest">Horizion ID</p><p className="text-lg font-mono font-black text-black mt-1">{hId}</p></div>
              <div className="pt-4 border-t border-[#F2F2F2]"><p className="text-[10px] font-bold text-[#B6192E] uppercase tracking-widest">Senha Provisória</p><p className="text-xl font-mono font-black text-[#B6192E] mt-1">{tempPassword}</p></div>
            </div>
            <div className="flex gap-4 justify-center mt-8">
              <HzButton onClick={() => { navigator.clipboard.writeText(getRichTextCredentials()); alert("Copiado!"); }} className="bg-black text-white text-xs font-bold uppercase tracking-widest px-6 py-2.5 rounded hover:bg-[#B6192E] transition-colors">Copiar Instruções</HzButton>
              <HzButton variant="ghost" onClick={onClose} className="text-xs font-bold uppercase tracking-widest text-[#A0A0A0] border border-[#F2F2F2] rounded px-6 py-2.5 hover:text-black hover:border-black transition-colors">Fechar Painel</HzButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}