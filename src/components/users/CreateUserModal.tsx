'use client';

import React, { useState, useEffect } from 'react';
import { StarRole } from '@/types/horizion';
import { generateHorizionID } from '@/utils/horizionIdGenerator';
import { HzButton } from '@/components/ui/HzButton';
import { HzInput } from '@/components/ui/HzInput';
import { HzSelect } from '@/components/ui/HzSelect';
import clsx from 'clsx';

interface CreateUserModalProps { isOpen: boolean; onClose: () => void; onSuccess: () => void; }

export function CreateUserModal({ isOpen, onClose, onSuccess }: CreateUserModalProps) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [activeTab, setActiveTab] = useState<'mandatory' | 'personal' | 'location' | 'settings'>('mandatory');
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

  const handleCepLookup = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cleanCep = e.target.value.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      setIsFetchingData(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();
        if (!data.erro) setForm(p => ({ ...p, address: data.logradouro, city: data.localidade, state: data.uf, country: 'BR' }));
      } catch (e) { console.warn("Falha de rede no CEP"); }
      setIsFetchingData(false);
    }
  };

  const handleCpfLookup = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cleanCpf = e.target.value.replace(/\D/g, '');
    if (cleanCpf.length === 11) {
      setIsFetchingData(true);
      try { console.info(`Proxy interno chamado para CPF: ${cleanCpf}`); } 
      catch (e) { console.warn("Falha de rede no CPF"); }
      setIsFetchingData(false);
    }
  };

  const togglePermission = (key: keyof typeof form.permissions) => {
    setForm({ ...form, permissions: { ...form.permissions, [key]: !form.permissions[key] } });
  };

  const handleCreate = async () => {
    if (!form.full_name || !form.email) return alert("O Nome e E-mail são estritamente obrigatórios.");
    if (!form.flags.agree_terms) return alert("É obrigatório confirmar a aceitação dos Termos de Serviço.");
    
    setLoading(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, horizion_id: hId, password: tempPassword })
      });
      
      const rawText = await response.text();
      let parsedData: any = {};
      
      try { parsedData = JSON.parse(rawText); } 
      catch { parsedData = { message: rawText || "A resposta do servidor estava vazia ou ilegível." }; }

      if (response.ok) {
        setStep('success');
        onSuccess();
      } else {
        console.error("[HORAZION ERROR LOG]", parsedData);
        alert(`FALHA NO APROVISIONAMENTO:\n\n${parsedData.user_message || parsedData.message}`);
      }
    } catch (networkError: any) {
      console.error("[HORAZION NETWORK LOG]", networkError);
      alert(`FALHA DE COMUNICAÇÃO:\nNão foi possível chegar ao servidor.`);
    }
    setLoading(false);
  };

  // Funções Ricas de Partilha e Exportação
  const getRichTextCredentials = () => {
    const roleName = form.role === 'sirius' ? 'SIRIUS (Administrador)' : 'SUN (Utilizador Base)';
    let perms = [];
    if (form.permissions.can_create_universe) perms.push('Criar Universos');
    if (form.permissions.can_bypass_ads) perms.push('Estatuto VIP (Sem Ads)');
    if (form.permissions.can_moderate_content) perms.push('Moderação Local');
    const permsText = perms.length > 0 ? perms.join(', ') : 'Acesso Padrão ao Ecossistema';

    return `=========================================
HORIZION LIFE | CREDENCIAIS OFICIAIS
=========================================

Olá, ${form.full_name}. 
A sua identidade digital foi aprovisionada com sucesso no Sistema Operativo Social.

[ DADOS DE AUTENTICAÇÃO ]
• E-mail de Acesso: ${form.email}
• Horizion ID: ${hId}
• Senha Provisória: ${tempPassword}

[ MATRIZ DE ACESSO CONCEDIDO ]
• Grupo Estelar: ${roleName}
• Nível de Extensões: ${permsText}

[ INSTRUÇÕES OBRIGATÓRIAS DE PRIMEIRO ACESSO ]
1. Aceda à aplicação oficial ou ao portal web do Horizion Life.
2. Selecione a opção "Completar Cadastro / Primeiro Acesso".
3. Ser-lhe-á solicitado o seu CPF (${form.document_id || 'O seu documento registado'}) para validação de segurança.
4. Insira a senha provisória fornecida acima.
5. Crie a sua senha definitiva e privada para assumir o controlo dos seus Blocos Vivos.

[ SUPORTE TÉCNICO ]
Em caso de anomalia, contacte imediatamente a equipa através de: suporte@horazion.com

Bem-vindo(a) ao seu novo horizonte digital.
=========================================`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getRichTextCredentials());
    alert("Credenciais copiadas com formatação oficial!");
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent("Horizion Life | As Suas Credenciais Oficiais");
    const body = encodeURIComponent(getRichTextCredentials());
    window.location.href = `mailto:${form.email}?subject=${subject}&body=${body}`;
  };

  const handleDownloadTxt = () => {
    const element = document.createElement("a");
    const file = new Blob([getRichTextCredentials()], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Credenciais_Horizion_${form.full_name.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-xl flex justify-end animate-in fade-in slide-in-from-right duration-500">
      <div className="w-full max-w-4xl bg-white border-l border-[#F2F2F2] flex flex-col shadow-2xl overflow-hidden relative">
        
        {isFetchingData && (
          <div className="absolute top-0 left-0 w-full h-1 bg-[#F2F2F2] z-50 overflow-hidden">
            <div className="h-full bg-black animate-pulse w-1/3 rounded-r-full" />
          </div>
        )}

        {step === 'form' && (
          <>
            <header className="px-12 pt-12 pb-6 border-b border-[#F2F2F2]">
              <h2 className="text-4xl font-bold text-black tracking-tighter">Aprovisionamento Core</h2>
              <p className="text-xs text-[#545454] mt-2 uppercase tracking-[0.2em] font-medium mb-8">Injeção de Identidade no Ecossistema Horazion</p>
              <div className="flex gap-8 border-b border-[#F2F2F2]">
                {[
                  { id: 'mandatory', label: '01. Identidade & Docs*' },
                  { id: 'personal', label: '02. Perfil Pessoal' },
                  { id: 'location', label: '03. Local & Redes' },
                  { id: 'settings', label: '04. Ações & Permissões' }
                ].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={clsx("pb-4 text-[11px] font-bold uppercase tracking-widest transition-all", activeTab === tab.id ? "text-black border-b-2 border-black" : "text-[#A0A0A0] hover:text-black")}>
                    {tab.label}
                  </button>
                ))}
              </div>
            </header>

            <main className="flex-1 p-12 overflow-y-auto">
              {activeTab === 'mandatory' && (
                <div className="space-y-8 animate-in fade-in">
                  <div className="grid grid-cols-2 gap-8 p-6 bg-[#FAFAFA] border border-[#F2F2F2] rounded-[16px]">
                    <div><label className="text-[10px] font-bold uppercase text-[#A0A0A0] tracking-widest">Horizion ID</label><p className="text-xl font-mono font-bold mt-1 text-black">{hId}</p></div>
                    <div><label className="text-[10px] font-bold uppercase text-[#A0A0A0] tracking-widest">Senha Provisória</label><p className="text-xl font-mono font-bold mt-1 text-[#B6192E]">{tempPassword}</p></div>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <HzInput label="CPF / Documento *" placeholder="Apenas números" value={form.document_id} onBlur={handleCpfLookup} onChange={e => setForm({...form, document_id: e.target.value})} />
                    <HzInput label="Nome Completo *" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} />
                    <HzInput label="E-mail *" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                    <HzSelect label="Hierarquia (Role) *" options={[{label: 'Sun (Usuário Base)', value: 'sun'}, {label: 'Sirius (Admin)', value: 'sirius'}]} value={form.role} onChange={val => setForm({...form, role: val as StarRole})} />
                  </div>
                </div>
              )}

              {activeTab === 'personal' && (
                <div className="space-y-8 animate-in fade-in">
                  <p className="text-xs text-[#A0A0A0] font-medium border-l-2 border-black pl-3 mb-6">Campos opcionais.</p>
                  <div className="grid grid-cols-2 gap-8">
                    <HzInput label="Data Nasc. (YYYY-MM-DD)" value={form.birth_date} onChange={e => setForm({...form, birth_date: e.target.value})} />
                    <HzInput label="Pronomes" value={form.pronouns} onChange={e => setForm({...form, pronouns: e.target.value})} />
                    <HzInput label="Telefone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                    <HzSelect label="Fuso Horário" options={[{label: 'Brasília (GMT-3)', value: 'America/Sao_Paulo'}]} value={form.timezone} onChange={val => setForm({...form, timezone: val})} />
                    <HzInput label="Ocupação / Cargo" value={form.occupation} onChange={e => setForm({...form, occupation: e.target.value})} />
                  </div>
                </div>
              )}

              {activeTab === 'location' && (
                <div className="space-y-8 animate-in fade-in">
                  <div className="grid grid-cols-3 gap-8">
                    <HzInput label="CEP" placeholder="Busca automática" value={form.cep} onBlur={handleCepLookup} onChange={e => setForm({...form, cep: e.target.value})} />
                    <div className="col-span-2"><HzInput label="Endereço" value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
                    <HzInput label="Cidade" value={form.city} onChange={e => setForm({...form, city: e.target.value})} />
                    <HzInput label="Estado (2 Letras)" placeholder="SP" value={form.state} onChange={e => setForm({...form, state: e.target.value})} />
                    <HzInput label="País (2 Letras)" placeholder="BR" value={form.country} onChange={e => setForm({...form, country: e.target.value})} />
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-12 animate-in fade-in">
                  <div>
                    <h3 className="text-[10px] font-bold uppercase text-[#545454] tracking-widest mb-6 border-l-2 border-[#B6192E] pl-2">Ações de Onboarding</h3>
                    <div className="space-y-4">
                      <label className="flex items-center gap-4 cursor-pointer p-4 bg-red-50 border border-red-100 rounded-[12px]">
                        <input type="checkbox" checked={form.flags.agree_terms} onChange={() => setForm(p => ({...p, flags: {...p.flags, agree_terms: !p.flags.agree_terms}}))} className="w-5 h-5 accent-[#B6192E]" />
                        <span className="text-sm font-bold text-[#B6192E]">Confirmo a aceitação dos Termos de Serviço pelo utilizador *</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-bold uppercase text-[#545454] tracking-widest mb-6 border-l-2 border-black pl-2">Permissões Core</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center gap-4 p-4 border border-[#F2F2F2] rounded-[12px] cursor-pointer hover:border-black transition-colors">
                        <input type="checkbox" checked={form.permissions.can_create_universe} onChange={() => togglePermission('can_create_universe')} className="w-5 h-5 accent-black" />
                        <span className="text-sm font-medium">Criar Novos Universos</span>
                      </label>
                      <label className="flex items-center gap-4 p-4 border border-[#F2F2F2] rounded-[12px] cursor-pointer hover:border-black transition-colors">
                        <input type="checkbox" checked={form.permissions.can_bypass_ads} onChange={() => togglePermission('can_bypass_ads')} className="w-5 h-5 accent-black" />
                        <span className="text-sm font-medium">Isenção de Anúncios (VIP)</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </main>

            <footer className="p-12 border-t border-[#F2F2F2] flex gap-6 bg-white">
              <HzButton variant="secondary" onClick={onClose} className="flex-1 h-14">Cancelar Operação</HzButton>
              <HzButton variant="primary" isLoading={loading} onClick={handleCreate} className="flex-[2] h-14 bg-black text-white hover:bg-[#B6192E] transition-colors">
                Aprovisionar Conta no Ecossistema
              </HzButton>
            </footer>
          </>
        )}

        {/* ETAPA DE SUCESSO - CARTÃO OFICIAL COM FLUXO DE EXPORTAÇÃO */}
        {step === 'success' && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#FAFAFA] animate-in zoom-in-95 duration-500 overflow-y-auto">
            <div id="horazion-credentials-card" className="w-full max-w-2xl bg-white rounded-[24px] border border-[#F2F2F2] shadow-xl overflow-hidden text-left my-8">
              
              <div className="bg-black text-white p-10 flex items-center justify-between">
                <div>
                  <h3 className="text-3xl font-bold tracking-tighter">Credenciais Oficiais</h3>
                  <p className="text-sm text-white/70 mt-2">Identidade digital aprovisionada com sucesso.</p>
                </div>
                <div className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center text-3xl font-bold shadow-lg">✓</div>
              </div>

              <div className="p-10 space-y-8">
                <div className="grid grid-cols-2 gap-6 p-6 bg-[#FAFAFA] rounded-[16px] border border-[#F2F2F2]">
                  <div><label className="text-[10px] font-bold uppercase text-[#A0A0A0] tracking-widest">Titular / E-mail</label><p className="text-base font-bold text-black mt-1 truncate">{form.email}</p></div>
                  <div><label className="text-[10px] font-bold uppercase text-[#A0A0A0] tracking-widest">Horizion ID</label><p className="text-base font-mono font-bold text-black mt-1">{hId}</p></div>
                  <div className="col-span-2 pt-4 border-t border-[#E5E5E5]">
                    <label className="text-[10px] font-bold uppercase text-[#B6192E] tracking-widest">Senha Provisória (Exibição Única)</label>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-2xl font-mono font-bold text-[#B6192E] bg-red-50 px-4 py-2 rounded-[8px] tracking-widest">{tempPassword}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase text-[#545454] tracking-widest border-l-2 border-black pl-3">Instruções de Primeiro Acesso</h4>
                  <div className="p-6 bg-white border border-[#F2F2F2] rounded-[16px] space-y-3 text-sm text-[#545454] leading-relaxed">
                    <p><strong>1.</strong> Aceda à aplicação ou site oficial do Horizion Life.</p>
                    <p><strong>2.</strong> Navegue até a secção <em>"Completar Cadastro"</em>.</p>
                    <p><strong>3.</strong> Informe o seu CPF <strong>({form.document_id || 'Documento'})</strong> para validação biométrica/segurança.</p>
                    <p><strong>4.</strong> Insira a senha provisória e defina a sua palavra-passe definitiva.</p>
                    <p className="mt-4 pt-4 border-t border-[#F2F2F2] text-xs font-mono">Suporte Global: suporte@horazion.com</p>
                  </div>
                </div>
              </div>

              {/* FERRAMENTAS DE EXPORTAÇÃO */}
              <div className="p-6 border-t border-[#F2F2F2] bg-[#FAFAFA] grid grid-cols-3 gap-4">
                <HzButton variant="secondary" onClick={handleDownloadTxt} className="w-full bg-white h-12 text-xs border-[#E5E5E5] text-black hover:border-black">
                  ⬇ Baixar Ficheiro (.txt)
                </HzButton>
                <HzButton variant="secondary" onClick={handleEmailShare} className="w-full bg-white h-12 text-xs border-[#E5E5E5] text-black hover:border-black">
                  ✉ Enviar por E-mail
                </HzButton>
                <HzButton variant="primary" onClick={handleCopy} className="w-full h-12 text-xs bg-black text-white">
                  ⧉ Copiar Texto Rico
                </HzButton>
              </div>
            </div>
            
            <HzButton variant="secondary" onClick={onClose} className="w-full max-w-2xl h-14 bg-white border-none text-[#A0A0A0] hover:text-black mt-4">
              Fechar Janela e Concluir Operação
            </HzButton>
          </div>
        )}
      </div>
    </div>
  );
}