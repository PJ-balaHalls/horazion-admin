'use client';

import React, { useState, useEffect } from 'react';
import { StarRole } from '@/types/horizion';
import { generateHorizionID } from '@/utils/horizionIdGenerator';
import { HzButton, HzInput, HzSelect } from '@/components/ui';

interface CreateUserModalProps { isOpen: boolean; onClose: () => void; onSuccess: () => void; }
type TabId = 'mandatory' | 'personal' | 'location' | 'settings';

export function CreateUserModal({ isOpen, onClose, onSuccess }: CreateUserModalProps) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [activeTab, setActiveTab] = useState<TabId>('mandatory');
  const [loading, setLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);
  
  const [hId, setHId] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  
  const [form, setForm] = useState({
    full_name: '', email: '', role: 'sun' as StarRole,
    document_id: '', pronouns: '', birth_date: '', phone: '', occupation: '', company: '', bio: '', timezone: 'America/Sao_Paulo', preferred_language: 'pt-BR',
    cep: '', address: '', city: '', state: '', country: '',
    custom_data: { linkedin: '', github: '' },
    permissions: { can_create_universe: false, can_bypass_ads: false, can_moderate_content: false },
    flags: { send_notification: true, require_completion: true, agree_terms: false }
  });

  const TABS = [
    { id: 'mandatory', label: 'Documentação Base' },
    { id: 'personal', label: 'Dados Pessoais' },
    { id: 'location', label: 'Localização' },
    { id: 'settings', label: 'Permissões' }
  ];

  const currentTabIndex = TABS.findIndex(t => t.id === activeTab);

  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setActiveTab('mandatory');
      setHId(generateHorizionID());
      setTempPassword(Math.random().toString(36).slice(-10).toUpperCase() + '@HZ1');
    }
  }, [isOpen]);

  const handleCreate = async () => {
    if (!form.full_name || !form.email) return alert("O Nome e E-mail são estritamente obrigatórios.");
    setLoading(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, horizion_id: hId, password: tempPassword })
      });
      if (res.ok) { setStep('success'); onSuccess(); } 
      else alert("Falha no provisionamento. Verifique os dados.");
    } catch { alert("Falha de rede."); }
    setLoading(false);
  };

  const getRichTextCredentials = () => `Credenciais de ${form.full_name}\nID: ${hId}\nSenha: ${tempPassword}`;
  const handleCopy = () => { navigator.clipboard.writeText(getRichTextCredentials()); alert("Copiado!"); };

  if (!isOpen) return null;

  return (
    <div className="flex flex-col w-full h-full bg-white animate-in fade-in duration-300 relative">
      {isFetchingData && <div className="absolute top-0 left-0 w-full h-0.5 bg-gray-100 z-50"><div className="h-full bg-[#E50000] animate-pulse w-1/3" /></div>}

      {step === 'form' ? (
        <>
          {/* HEADER COM TOP TABS */}
          <header className="flex-none px-10 pt-8 border-b border-gray-100 bg-white">
            <div className="max-w-4xl mx-auto flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Provisionar Identidade</h1>
                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-widest mt-1">Wizard de Criação de Horizion Account</p>
              </div>
              <HzButton variant="ghost" onClick={onClose} className="text-gray-500 text-sm font-semibold hover:text-black">Cancelar</HzButton>
            </div>

            <nav className="flex gap-8 overflow-x-auto max-w-4xl mx-auto">
              {TABS.map((tab, idx) => {
                const isActive = activeTab === tab.id;
                const isCompleted = idx < currentTabIndex;
                return (
                  <button
                    key={tab.id} onClick={() => setActiveTab(tab.id as TabId)}
                    className={`pb-3 text-[13px] font-semibold transition-all border-b-2 whitespace-nowrap ${isActive ? 'border-[#E50000] text-[#E50000]' : isCompleted ? 'border-transparent text-gray-900 hover:text-[#E50000]' : 'border-transparent text-gray-400'}`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </header>

          {/* ÁREA CENTRAL */}
          <main className="flex-1 overflow-y-auto p-10 custom-scrollbar">
            <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in">
              
              {activeTab === 'mandatory' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6 p-6 bg-gray-50/50 border border-gray-100 rounded-2xl">
                    <div><label className="text-[9px] font-bold uppercase text-gray-500 tracking-widest">Horizion ID Base</label><p className="text-lg font-mono font-bold mt-1 text-black">{hId}</p></div>
                    <div><label className="text-[9px] font-bold uppercase text-[#E50000] tracking-widest">Senha Provisória</label><p className="text-lg font-mono font-bold mt-1 text-[#E50000]">{tempPassword}</p></div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <HzInput label="CPF / Documento *" value={form.document_id} onChange={e => setForm({...form, document_id: e.target.value})} />
                    <HzInput label="Nome Completo *" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} />
                    <HzInput label="E-mail *" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                    <HzSelect label="Hierarquia (Role)" options={[{label: 'Sun (Usuário)', value: 'sun'}, {label: 'Sirius (Admin)', value: 'sirius'}]} value={form.role} onChange={v => setForm({...form, role: v as StarRole})} />
                  </div>
                </div>
              )}

              {activeTab === 'personal' && (
                <div className="grid grid-cols-2 gap-6">
                  <HzInput label="Data Nascimento" value={form.birth_date} onChange={e => setForm({...form, birth_date: e.target.value})} />
                  <HzInput label="Pronomes" value={form.pronouns} onChange={e => setForm({...form, pronouns: e.target.value})} />
                  <HzInput label="Telefone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                  <HzInput label="Ocupação" value={form.occupation} onChange={e => setForm({...form, occupation: e.target.value})} />
                </div>
              )}

              {activeTab === 'location' && (
                <div className="grid grid-cols-2 gap-6">
                  <HzInput label="CEP" value={form.cep} onChange={e => setForm({...form, cep: e.target.value})} />
                  <HzInput label="Cidade" value={form.city} onChange={e => setForm({...form, city: e.target.value})} />
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <label className="flex items-center gap-3 cursor-pointer p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
                    <input type="checkbox" checked={form.flags.agree_terms} onChange={() => setForm(p => ({...p, flags: {...p.flags, agree_terms: !p.flags.agree_terms}}))} className="w-4 h-4 accent-[#E50000]" />
                    <span className="text-sm font-medium text-gray-900">Aceitar Termos e Condições</span>
                  </label>
                </div>
              )}
            </div>
          </main>

          {/* FOOTER */}
          <footer className="flex-none px-10 py-5 border-t border-gray-100 flex justify-center bg-white z-20">
            <div className="flex justify-between w-full max-w-4xl">
              <HzButton variant="ghost" onClick={() => { if(currentTabIndex > 0) setActiveTab(TABS[currentTabIndex - 1].id as TabId); }} disabled={currentTabIndex === 0} className="text-sm font-semibold">Voltar</HzButton>
              {currentTabIndex < TABS.length - 1 ? (
                <HzButton className="bg-black text-white text-sm font-semibold px-6 py-2 rounded-lg" onClick={() => setActiveTab(TABS[currentTabIndex + 1].id as TabId)}>Avançar</HzButton>
              ) : (
                <HzButton className="bg-[#E50000] hover:bg-red-700 text-white text-sm font-semibold px-6 py-2 rounded-lg" onClick={handleCreate} disabled={loading}>{loading ? 'A processar...' : 'Concluir'}</HzButton>
              )}
            </div>
          </footer>
        </>
      ) : (
        /* SUCESSO */
        <div className="flex-1 flex flex-col items-center justify-center p-10 bg-white">
          <div className="max-w-xl w-full text-center space-y-6">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">✓</div>
            <h2 className="text-2xl font-bold text-gray-900">Credenciais Oficiais Geradas</h2>
            <p className="text-sm text-gray-500">A conta de {form.email} foi instanciada com sucesso.</p>
            <div className="p-6 bg-gray-50 border border-gray-100 rounded-xl text-left space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase">Horizion ID</p>
              <p className="text-lg font-mono font-bold text-black">{hId}</p>
              <p className="text-xs font-semibold text-gray-500 uppercase pt-3 border-t border-gray-200">Senha Provisória</p>
              <p className="text-lg font-mono font-bold text-[#E50000]">{tempPassword}</p>
            </div>
            <div className="flex gap-4 justify-center mt-6">
              <HzButton onClick={handleCopy} className="bg-black text-white text-sm font-semibold px-6 rounded-lg">Copiar Credenciais</HzButton>
              <HzButton variant="ghost" onClick={onClose} className="text-sm font-semibold border border-gray-200 rounded-lg">Fechar</HzButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}