'use client';

import React, { useState, useEffect } from 'react';
import { StarRole } from '@/types/horizion';
import { generateHorizionID } from '@/utils/horizionIdGenerator';
import { HzButton, HzInput, HzSelect, HzSkeleton } from '@/components/ui';

interface CreateUserModalProps { isOpen: boolean; onClose: () => void; onSuccess: () => void; }
type TabId = 'mandatory' | 'personal' | 'location' | 'settings';

const PRONOUNS_LIST = [
  { label: 'Selecione...', value: '' },
  { label: 'Ele/Dele', value: 'Ele/Dele' },
  { label: 'Ela/Dela', value: 'Ela/Dela' },
  { label: 'Elu/Delu', value: 'Elu/Delu' },
  { label: 'Eles/Deles', value: 'Eles/Deles' },
  { label: 'Elas/Delas', value: 'Elas/Delas' },
  { label: 'Prefiro não informar', value: 'Nao_Informar' }
];

const PHONE_CODES = [
  { label: '+55 (BR)', value: '+55' }, { label: '+351 (PT)', value: '+351' },
  { label: '+1 (US/CA)', value: '+1' }, { label: '+44 (UK)', value: '+44' },
  { label: '+49 (DE)', value: '+49' }, { label: '+34 (ES)', value: '+34' },
  { label: '+33 (FR)', value: '+33' }, { label: '+39 (IT)', value: '+39' },
  { label: '+54 (AR)', value: '+54' }, { label: '+56 (CL)', value: '+56' }
];

const OCCUPATIONS_LIST = [
  { label: 'Selecione um cargo...', value: '' },
  "Administrador", "Advogado", "Analista de Dados", "Analista de Marketing", "Analista de Sistemas", 
  "Analista Financeiro", "Arquiteto", "Arquiteto de Software", "Assistente Administrativo", "Auditor", 
  "Cientista de Dados", "Consultor", "Contador", "Coordenador", "Desenvolvedor Backend", 
  "Desenvolvedor Frontend", "Desenvolvedor Fullstack", "Designer Gráfico", "Designer UX/UI", "Diretor de Arte", 
  "Diretor Executivo (CEO)", "Diretor Financeiro (CFO)", "Diretor Operacional (COO)", "Diretor Técnico (CTO)", 
  "Engenheiro Civil", "Engenheiro de DevOps", "Engenheiro de Software", "Especialista em RH", "Estagiário", 
  "Freelancer", "Gerente de Contas", "Gerente de Projetos", "Gerente de Produto", "Gerente de Vendas", 
  "Gerente Geral", "Investidor", "Jornalista", "Médico", "Pesquisador", "Professor", 
  "Product Manager", "Product Owner", "Psicólogo", "Publicitário", "Recrutador", 
  "Scrum Master", "Sócio", "Supervisor", "Suporte Técnico", "Vendedor", "Outro"
].map(o => typeof o === 'string' ? { label: o, value: o } : o);

export function CreateUserModal({ isOpen, onClose, onSuccess }: CreateUserModalProps) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [activeTab, setActiveTab] = useState<TabId>('mandatory');
  const [loading, setLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [isUsernameEdited, setIsUsernameEdited] = useState(false); // Trava para não sobrescrever se o usuário digitar
  
  const [hId, setHId] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  
  const [form, setForm] = useState({
    first_name: '', last_name: '', username: '', email: '', role: 'sun' as StarRole,
    document_id: '', pronouns: '', birth_date: '', phone_code: '+55', phone: '', 
    occupation: '', company: '', bio: '', timezone: 'America/Sao_Paulo', preferred_language: 'pt-BR',
    cep: '', address: '', city: '', state: '', country: '',
    location_settings: { group_region: true, allow_monitoring: false },
    custom_data: { linkedin: '', github: '' },
    permissions: { can_create_universe: false, can_bypass_ads: false, can_moderate_content: false, can_manage_users: false, can_view_financials: false },
    flags: { send_notification: true, require_completion: true, agree_terms: false }
  });

  const TABS = [
    { id: 'mandatory', label: 'Identidade & Docs' },
    { id: 'personal', label: 'Perfil Pessoal' },
    { id: 'location', label: 'Localização' },
    { id: 'settings', label: 'Ações & Permissões' }
  ];

  const currentTabIndex = TABS.findIndex(t => t.id === activeTab);

  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setActiveTab('mandatory');
      setHId(generateHorizionID());
      setTempPassword(Math.random().toString(36).slice(-10).toUpperCase() + '@HZ1');
      // Reset Form
      setForm({
        first_name: '', last_name: '', username: '', email: '', role: 'sun',
        document_id: '', pronouns: '', birth_date: '', phone_code: '+55', phone: '', 
        occupation: '', company: '', bio: '', timezone: 'America/Sao_Paulo', preferred_language: 'pt-BR',
        cep: '', address: '', city: '', state: '', country: '',
        location_settings: { group_region: true, allow_monitoring: false },
        custom_data: { linkedin: '', github: '' },
        permissions: { can_create_universe: false, can_bypass_ads: false, can_moderate_content: false, can_manage_users: false, can_view_financials: false },
        flags: { send_notification: true, require_completion: true, agree_terms: false }
      });
      setIsUsernameEdited(false);
    }
  }, [isOpen]);

  // AUTO-GERADOR DE @APELIDO
  const handleNameChange = (field: 'first_name' | 'last_name', value: string) => {
    const newForm = { ...form, [field]: value };
    if (!isUsernameEdited) {
      const fn = newForm.first_name.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "");
      const ln = newForm.last_name.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "");
      newForm.username = `${fn}${ln ? `.${ln}` : ''}`;
    }
    setForm(newForm);
  };

  // MÁSCARA DE TELEFONE (DD + 9 + NNNN-NNNN)
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
      } catch (e) { console.warn("Falha de rede no CEP"); }
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
      // Formata o nome completo para envio ao backend legados que ainda precisem disso
      const full_name = `${form.first_name} ${form.last_name}`.trim();
      const payload = { ...form, full_name, horizion_id: hId, password: tempPassword, status: form.flags.require_completion ? 'pre_registered' : 'active' };
      
      const response = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (response.ok) { setStep('success'); onSuccess(); } 
      else alert(`Falha no aprovisionamento.`);
    } catch { alert(`Falha de comunicação.`); }
    setLoading(false);
  };

  const getRichTextCredentials = () => `[ HORIZION LIFE | CREDENCIAIS ]\nNome: ${form.first_name} ${form.last_name}\nE-mail: ${form.email}\nApelido: @${form.username}\nHorizion ID: ${hId}\nSenha Provisória: ${tempPassword}\n\n${form.flags.require_completion ? '⚠️ ATENÇÃO: Acesse o sistema para completar o seu pré-cadastro.' : 'Aceda ao sistema e altere a sua senha imediatamente.'}`;

  if (!isOpen) return null;

  return (
    <div className="flex flex-col w-full h-full bg-white animate-in fade-in duration-300 relative">
      {isFetchingData && <div className="absolute top-0 left-0 w-full h-0.5 bg-gray-100 z-50"><div className="h-full bg-[#E50000] animate-pulse w-1/3" /></div>}

      {step === 'form' ? (
        <>
          <header className="flex-none px-10 pt-8 border-b border-gray-100 bg-white">
            <div className="max-w-4xl mx-auto flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Aprovisionamento Core</h1>
                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-widest mt-1">Injeção de Identidade no Ecossistema</p>
              </div>
              <HzButton variant="ghost" onClick={onClose} className="text-gray-500 text-sm font-semibold hover:text-black">Cancelar</HzButton>
            </div>
            <nav className="flex gap-8 overflow-x-auto max-w-4xl mx-auto">
              {TABS.map((tab, idx) => {
                const isActive = activeTab === tab.id;
                const isCompleted = idx < currentTabIndex;
                return (
                  <button key={tab.id} onClick={() => handleTabChange(tab.id as TabId)} className={`pb-3 text-[13px] font-semibold transition-all border-b-2 whitespace-nowrap ${isActive ? 'border-[#E50000] text-gray-900' : isCompleted ? 'border-transparent text-gray-900 hover:text-[#E50000]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                    {String(idx + 1).padStart(2, '0')}. {tab.label}
                  </button>
                );
              })}
            </nav>
          </header>

          <main className="flex-1 overflow-y-auto p-10 custom-scrollbar">
            <div className="max-w-4xl mx-auto">
              {(isTabLoading || isFetchingData) ? (
                <div className="space-y-6 animate-pulse"><div className="grid grid-cols-2 gap-6"><HzSkeleton className="h-16 rounded-xl" /><HzSkeleton className="h-16 rounded-xl" /></div><HzSkeleton className="h-24 w-full rounded-lg mt-4" /></div>
              ) : (
                <div className="space-y-8 animate-in fade-in duration-300">
                  
                  {activeTab === 'mandatory' && (
                    <div className="space-y-8">
                      <div className="grid grid-cols-2 gap-6 p-6 border border-gray-100 rounded-xl bg-gray-50/50 shadow-sm">
                        <div><label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Horizion ID Base</label><p className="text-lg font-mono font-bold mt-1 text-gray-900">{hId}</p></div>
                        <div><label className="text-[10px] font-bold uppercase text-[#E50000] tracking-widest">Senha Provisória</label><p className="text-lg font-mono font-bold mt-1 text-[#E50000]">{tempPassword}</p></div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-8">
                        <HzInput label="Primeiro Nome *" value={form.first_name} onChange={e => handleNameChange('first_name', e.target.value)} />
                        <HzInput label="Último Nome / Sobrenome *" value={form.last_name} onChange={e => handleNameChange('last_name', e.target.value)} />
                        
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Apelido (Username) *</label>
                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
                            <span className="bg-gray-50 px-3 py-2.5 text-gray-400 font-bold text-sm border-r border-gray-200">@</span>
                            <input type="text" className="w-full px-3 py-2.5 text-sm outline-none font-medium" value={form.username} onChange={e => { setIsUsernameEdited(true); setForm({...form, username: e.target.value.toLowerCase().replace(/\s/g, '')}); }} placeholder="joao.silva" />
                          </div>
                        </div>

                        <HzInput label="CPF / Documento *" placeholder="Apenas números" value={form.document_id} onChange={e => setForm({...form, document_id: e.target.value})} />
                        <HzInput label="E-mail *" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                        <HzSelect label="Nível de Acesso (Role)" options={[{label: 'Sun (Usuário Base)', value: 'sun'}, {label: 'Sirius (Admin)', value: 'sirius'}]} value={form.role} onChange={v => setForm({...form, role: v as StarRole})} />
                      </div>
                    </div>
                  )}

                  {activeTab === 'personal' && (
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Data de Nascimento</label>
                        <input type="date" value={form.birth_date} onChange={e => setForm({...form, birth_date: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:border-black transition-all" />
                      </div>
                      
                      <HzSelect label="Pronomes" options={PRONOUNS_LIST} value={form.pronouns} onChange={val => setForm({...form, pronouns: val})} />
                      
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Telefone Principal</label>
                        <div className="flex gap-2">
                          <select value={form.phone_code} onChange={e => setForm({...form, phone_code: e.target.value})} className="w-1/3 px-2 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 font-medium focus:outline-none focus:border-black">
                            {PHONE_CODES.map(pc => <option key={pc.value} value={pc.value}>{pc.label}</option>)}
                          </select>
                          <input type="text" placeholder="(11) 90000-0000" value={form.phone} onChange={handlePhoneChange} className="w-2/3 px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:border-black transition-all" />
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
                      <div className="pt-6 border-t border-gray-100">
                        <h3 className="text-[11px] font-bold uppercase text-gray-500 tracking-widest mb-4">Configurações de Localização / Hub</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <label className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                            <input type="checkbox" checked={form.location_settings.group_region} onChange={() => toggleLocation('group_region')} className="w-4 h-4 accent-gray-900" />
                            <span className="text-sm">Agrupar utilizador no Hub da Região</span>
                          </label>
                          <label className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                            <input type="checkbox" checked={form.location_settings.allow_monitoring} onChange={() => toggleLocation('allow_monitoring')} className="w-4 h-4 accent-gray-900" />
                            <span className="text-sm">Permitir Monitoramento Global (Geotagging)</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'settings' && (
                    <div className="space-y-10">
                      <div>
                        <h3 className="text-[11px] font-bold uppercase text-gray-500 tracking-widest mb-4">Pré-Cadastro & Onboarding</h3>
                        <div className="space-y-3">
                          <label className="flex items-center gap-4 cursor-pointer p-4 border border-gray-200 rounded-xl hover:border-gray-300 bg-gray-50/50 transition-colors">
                            <input type="checkbox" checked={form.flags.require_completion} onChange={() => setForm(p => ({...p, flags: {...p.flags, require_completion: !p.flags.require_completion}}))} className="w-4 h-4 accent-[#E50000]" />
                            <span className="text-sm font-bold text-gray-900">Modo Pré-Cadastro (Usuário deve finalizar a conta no 1º acesso)</span>
                          </label>
                          <label className="flex items-center gap-4 cursor-pointer p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                            <input type="checkbox" checked={form.flags.agree_terms} onChange={() => setForm(p => ({...p, flags: {...p.flags, agree_terms: !p.flags.agree_terms}}))} className="w-4 h-4 accent-gray-900" />
                            <span className="text-sm font-medium text-gray-600">Aprovação Override: Aceitar Termos de Serviço em nome do titular</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-[11px] font-bold uppercase text-gray-500 tracking-widest mb-4">Matriz de Permissões Avançadas</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <label className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50"><input type="checkbox" checked={form.permissions.can_create_universe} onChange={() => togglePermission('can_create_universe')} className="w-4 h-4 accent-gray-900" /><span className="text-sm">Criar Universos Locais</span></label>
                          <label className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50"><input type="checkbox" checked={form.permissions.can_bypass_ads} onChange={() => togglePermission('can_bypass_ads')} className="w-4 h-4 accent-gray-900" /><span className="text-sm">Isenção de Anúncios (VIP)</span></label>
                          <label className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50"><input type="checkbox" checked={form.permissions.can_manage_users} onChange={() => togglePermission('can_manage_users')} className="w-4 h-4 accent-gray-900" /><span className="text-sm">Gerir Outros Utilizadores</span></label>
                          <label className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50"><input type="checkbox" checked={form.permissions.can_view_financials} onChange={() => togglePermission('can_view_financials')} className="w-4 h-4 accent-gray-900" /><span className="text-sm">Acesso a Dados Financeiros</span></label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>

          <footer className="flex-none px-10 py-5 border-t border-gray-100 flex justify-center bg-white z-20">
            <div className="flex justify-between w-full max-w-4xl">
              <HzButton variant="ghost" onClick={handlePrev} disabled={currentTabIndex === 0 || isTabLoading} className="text-sm font-semibold text-gray-500 hover:text-gray-900">Voltar</HzButton>
              {currentTabIndex < TABS.length - 1 ? (
                <HzButton className="bg-gray-900 text-white text-sm font-semibold px-6 py-2 rounded-lg hover:bg-[#E50000] transition-colors" onClick={handleNext} disabled={isTabLoading}>Avançar</HzButton>
              ) : (
                <HzButton className="bg-[#E50000] text-white text-sm font-semibold px-8 py-2 rounded-lg hover:bg-red-700 transition-colors" onClick={handleCreate} disabled={loading || isTabLoading}>{loading ? 'A processar...' : 'Aprovisionar Conta'}</HzButton>
              )}
            </div>
          </footer>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-10 bg-white">
          <div className="max-w-xl w-full text-center space-y-6 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-white border-2 border-gray-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto shadow-sm">✓</div>
            <h2 className="text-2xl font-bold text-gray-900">Identidade Aprovisionada</h2>
            <p className="text-sm text-gray-500">A identidade de {form.first_name} (@{form.username}) foi registrada.</p>
            <div className="p-8 border border-gray-100 rounded-2xl text-left space-y-4 bg-white shadow-sm">
              <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Horizion ID</p><p className="text-lg font-mono font-bold text-gray-900 mt-1">{hId}</p></div>
              <div className="pt-4 border-t border-gray-100"><p className="text-[10px] font-bold text-[#E50000] uppercase tracking-widest">Senha Provisória</p><p className="text-xl font-mono font-bold text-[#E50000] mt-1">{tempPassword}</p></div>
            </div>
            <div className="flex gap-4 justify-center mt-8">
              <HzButton onClick={() => { navigator.clipboard.writeText(getRichTextCredentials()); alert("Copiado!"); }} className="bg-gray-900 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-[#E50000]">Copiar Instruções</HzButton>
              <HzButton variant="ghost" onClick={onClose} className="text-sm font-semibold text-gray-500 border border-gray-200 rounded-xl px-6 py-2.5 hover:text-gray-900 hover:border-gray-300">Fechar Painel</HzButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}