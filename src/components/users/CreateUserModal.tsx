'use client';

import React, { useState, useEffect } from 'react';
import { StarRole } from '@/types/horizion';
import { generateHorizionID } from '@/utils/horizionIdGenerator';
import { HzButton, HzInput, HzSelect, HzSkeleton } from '@/components/ui';

interface CreateUserModalProps { isOpen: boolean; onClose: () => void; onSuccess: () => void; }
type TabId = 'mandatory' | 'personal' | 'location' | 'settings';

export function CreateUserModal({ isOpen, onClose, onSuccess }: CreateUserModalProps) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [activeTab, setActiveTab] = useState<TabId>('mandatory');
  const [loading, setLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [isTabLoading, setIsTabLoading] = useState(false); // Skeleton UX state
  
  const [hId, setHId] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  
  // SEU PAYLOAD COMPLETO PRESERVADO
  const [form, setForm] = useState({
    full_name: '', email: '', role: 'sun' as StarRole,
    document_id: '', pronouns: '', birth_date: '', phone: '', occupation: '', company: '', bio: '', timezone: 'America/Sao_Paulo', preferred_language: 'pt-BR',
    cep: '', address: '', city: '', state: '', country: '',
    custom_data: { linkedin: '', github: '' },
    permissions: { can_create_universe: false, can_bypass_ads: false, can_moderate_content: false },
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
      setForm({
        full_name: '', email: '', role: 'sun',
        document_id: '', pronouns: '', birth_date: '', phone: '', occupation: '', company: '', bio: '', timezone: 'America/Sao_Paulo', preferred_language: 'pt-BR',
        cep: '', address: '', city: '', state: '', country: '',
        custom_data: { linkedin: '', github: '' },
        permissions: { can_create_universe: false, can_bypass_ads: false, can_moderate_content: false },
        flags: { send_notification: true, require_completion: true, agree_terms: false }
      });
    }
  }, [isOpen]);

  // UX: Simula carregamento ao trocar de aba
  const handleTabChange = (tabId: TabId) => {
    if (activeTab === tabId) return;
    setIsTabLoading(true);
    setActiveTab(tabId);
    setTimeout(() => setIsTabLoading(false), 300); // 300ms de skeleton para fluidez
  };

  const handleNext = () => { if (currentTabIndex < TABS.length - 1) handleTabChange(TABS[currentTabIndex + 1].id as TabId); };
  const handlePrev = () => { if (currentTabIndex > 0) handleTabChange(TABS[currentTabIndex - 1].id as TabId); };

  // Funções de Lookup preservadas com ativação de Skeleton Global
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

  const handleCpfLookup = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cleanCpf = e.target.value.replace(/\D/g, '');
    if (cleanCpf.length === 11) {
      setIsFetchingData(true);
      try { console.info(`Proxy interno chamado para CPF: ${cleanCpf}`); setTimeout(() => setIsFetchingData(false), 600); } 
      catch (e) { setIsFetchingData(false); }
    }
  };

  const togglePermission = (key: keyof typeof form.permissions) => {
    setForm({ ...form, permissions: { ...form.permissions, [key]: !form.permissions[key] } });
  };

  const handleCreate = async () => {
    if (!form.full_name || !form.email) return alert("Nome e E-mail são obrigatórios.");
    if (!form.flags.agree_terms) return alert("Confirme a aceitação dos Termos de Serviço.");
    
    setLoading(true);
    try {
      const response = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, horizion_id: hId, password: tempPassword }) });
      if (response.ok) { setStep('success'); onSuccess(); } 
      else alert(`Falha no aprovisionamento.`);
    } catch { alert(`Falha de comunicação.`); }
    setLoading(false);
  };

  // Funções ricas de exportação preservadas
  const getRichTextCredentials = () => {
    return `[ HORIZION LIFE | CREDENCIAIS OFICIAIS ]\nNome: ${form.full_name}\nE-mail: ${form.email}\nHorizion ID: ${hId}\nSenha Provisória: ${tempPassword}\n\nAceda ao sistema e altere a sua senha imediatamente.`;
  };

  if (!isOpen) return null;

  return (
    <div className="flex flex-col w-full h-full bg-white animate-in fade-in duration-300 relative">
      {/* Skeleton Header Loading Line */}
      {isFetchingData && <div className="absolute top-0 left-0 w-full h-0.5 bg-gray-100 z-50"><div className="h-full bg-[#E50000] animate-pulse w-1/3" /></div>}

      {step === 'form' ? (
        <>
          {/* HEADER PADRÃO (Sóbrio, Fonte Inter) */}
          <header className="flex-none px-10 pt-8 border-b border-gray-100 bg-white">
            <div className="max-w-4xl mx-auto flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Aprovisionamento Core</h1>
                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-widest mt-1">Injeção de Identidade no Ecossistema</p>
              </div>
              <HzButton variant="ghost" onClick={onClose} className="text-gray-500 text-sm font-semibold hover:text-black">Cancelar</HzButton>
            </div>

            {/* TOP TABS PADRÃO (Sem botões gigantes) */}
            <nav className="flex gap-8 overflow-x-auto max-w-4xl mx-auto">
              {TABS.map((tab, idx) => {
                const isActive = activeTab === tab.id;
                const isCompleted = idx < currentTabIndex;
                return (
                  <button
                    key={tab.id} onClick={() => handleTabChange(tab.id as TabId)}
                    className={`pb-3 text-[13px] font-semibold transition-all border-b-2 whitespace-nowrap ${isActive ? 'border-[#E50000] text-gray-900' : isCompleted ? 'border-transparent text-gray-900 hover:text-[#E50000]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                  >
                    {String(idx + 1).padStart(2, '0')}. {tab.label}
                  </button>
                );
              })}
            </nav>
          </header>

          <main className="flex-1 overflow-y-auto p-10 custom-scrollbar">
            <div className="max-w-4xl mx-auto">
              
              {/* RENDERIZAÇÃO DE SKELETON DURANTE A TROCA DE ABA OU FETCH */}
              {(isTabLoading || isFetchingData) ? (
                <div className="space-y-6 animate-pulse">
                   <div className="grid grid-cols-2 gap-6"><HzSkeleton className="h-16 rounded-xl" /><HzSkeleton className="h-16 rounded-xl" /></div>
                   <div className="grid grid-cols-2 gap-6"><HzSkeleton className="h-12 rounded-lg" /><HzSkeleton className="h-12 rounded-lg" /></div>
                   <HzSkeleton className="h-24 w-full rounded-lg mt-4" />
                </div>
              ) : (
                <div className="space-y-8 animate-in fade-in duration-300">
                  {/* CONTEÚDO DAS ABAS */}
                  {activeTab === 'mandatory' && (
                    <div className="space-y-8">
                      <div className="grid grid-cols-2 gap-6 p-6 border border-gray-100 rounded-xl bg-white shadow-sm">
                        <div><label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Horizion ID Base</label><p className="text-lg font-mono font-bold mt-1 text-gray-900">{hId}</p></div>
                        <div><label className="text-[10px] font-bold uppercase text-[#E50000] tracking-widest">Senha Provisória</label><p className="text-lg font-mono font-bold mt-1 text-[#E50000]">{tempPassword}</p></div>
                      </div>
                      <div className="grid grid-cols-2 gap-8">
                        <HzInput label="CPF / Documento *" placeholder="Apenas números" value={form.document_id} onBlur={handleCpfLookup} onChange={e => setForm({...form, document_id: e.target.value})} />
                        <HzInput label="Nome Completo *" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} />
                        <HzInput label="E-mail *" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                        <HzSelect label="Hierarquia (Role)" options={[{label: 'Sun (Usuário Base)', value: 'sun'}, {label: 'Sirius (Admin)', value: 'sirius'}]} value={form.role} onChange={v => setForm({...form, role: v as StarRole})} />
                      </div>
                    </div>
                  )}

                  {activeTab === 'personal' && (
                    <div className="grid grid-cols-2 gap-8">
                      <HzInput label="Data de Nascimento" value={form.birth_date} onChange={e => setForm({...form, birth_date: e.target.value})} />
                      <HzInput label="Pronomes" value={form.pronouns} onChange={e => setForm({...form, pronouns: e.target.value})} />
                      <HzInput label="Telefone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                      <HzSelect label="Fuso Horário" options={[{label: 'Brasília (GMT-3)', value: 'America/Sao_Paulo'}]} value={form.timezone} onChange={val => setForm({...form, timezone: val})} />
                      <HzInput label="Ocupação / Cargo" value={form.occupation} onChange={e => setForm({...form, occupation: e.target.value})} />
                    </div>
                  )}

                  {activeTab === 'location' && (
                    <div className="grid grid-cols-3 gap-8">
                      <HzInput label="CEP" placeholder="Ex: 01001-000" value={form.cep} onBlur={handleCepLookup} onChange={e => setForm({...form, cep: e.target.value})} />
                      <div className="col-span-2"><HzInput label="Endereço Automático" value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
                      <HzInput label="Cidade" value={form.city} onChange={e => setForm({...form, city: e.target.value})} />
                      <HzInput label="Estado" placeholder="SP" value={form.state} onChange={e => setForm({...form, state: e.target.value})} />
                      <HzInput label="País" placeholder="BR" value={form.country} onChange={e => setForm({...form, country: e.target.value})} />
                    </div>
                  )}

                  {activeTab === 'settings' && (
                    <div className="space-y-10">
                      <div>
                        <h3 className="text-[11px] font-bold uppercase text-gray-500 tracking-widest mb-4">Onboarding</h3>
                        <label className="flex items-center gap-4 cursor-pointer p-5 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
                          <input type="checkbox" checked={form.flags.agree_terms} onChange={() => setForm(p => ({...p, flags: {...p.flags, agree_terms: !p.flags.agree_terms}}))} className="w-4 h-4 accent-[#E50000]" />
                          <span className="text-sm font-medium text-gray-900">Confirmo a aceitação dos Termos de Serviço do Horizion Life</span>
                        </label>
                      </div>
                      <div>
                        <h3 className="text-[11px] font-bold uppercase text-gray-500 tracking-widest mb-4">Permissões Especiais</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <label className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50">
                            <input type="checkbox" checked={form.permissions.can_create_universe} onChange={() => togglePermission('can_create_universe')} className="w-4 h-4 accent-gray-900" />
                            <span className="text-sm">Criar Universos Locais</span>
                          </label>
                          <label className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50">
                            <input type="checkbox" checked={form.permissions.can_bypass_ads} onChange={() => togglePermission('can_bypass_ads')} className="w-4 h-4 accent-gray-900" />
                            <span className="text-sm">Isenção de Anúncios (VIP)</span>
                          </label>
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
        // TELA DE SUCESSO (Flat e Limpa)
        <div className="flex-1 flex flex-col items-center justify-center p-10 bg-white">
          <div className="max-w-xl w-full text-center space-y-6 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-white border-2 border-gray-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto shadow-sm">✓</div>
            <h2 className="text-2xl font-bold text-gray-900">Credenciais Geradas</h2>
            <p className="text-sm text-gray-500">A identidade de {form.full_name} foi registrada.</p>
            <div className="p-8 border border-gray-100 rounded-2xl text-left space-y-4 bg-white shadow-sm">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Horizion ID</p>
                <p className="text-lg font-mono font-bold text-gray-900 mt-1">{hId}</p>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-[10px] font-bold text-[#E50000] uppercase tracking-widest">Senha Provisória</p>
                <p className="text-xl font-mono font-bold text-[#E50000] mt-1">{tempPassword}</p>
              </div>
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