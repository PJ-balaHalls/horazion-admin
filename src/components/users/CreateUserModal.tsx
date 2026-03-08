'use client';

import { useState, useEffect } from 'react';
import { StarRole } from '@/types/horizion';
import { generateHorizionID } from '@/utils/horizionIdGenerator';
import { supabase } from '@/lib/supabase';

// Componentes de UI Padronizados (12px rounded, pure white)
const Input = ({ label, ...props }: any) => (
  <div className="space-y-1.5 w-full">
    <label className="text-[10px] font-bold text-[#545454] uppercase tracking-wider block">{label}</label>
    <input className="w-full px-4 py-3 bg-white border border-[#F2F2F2] rounded-[12px] text-sm text-[#000000] placeholder-[#E5E7EB] focus:outline-none focus:border-[#000000] transition-colors" {...props} />
  </div>
);

export function CreateUserModal({ isOpen, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [hId, setHId] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  
  // Campos dinâmicos armazenados no banco
  const [dynamicFieldsDef, setDynamicFieldsDef] = useState<any[]>([]);
  const [newFieldMode, setNewFieldMode] = useState(false);
  const [newField, setNewField] = useState({ label: '', type: 'text' });

  const [form, setForm] = useState<any>({
    full_name: '', email: '', role: 'sun', cep: '', address: '', city: '', state: '', country: 'BR', custom_data: {}
  });

  useEffect(() => {
    if (isOpen) {
      setHId(generateHorizionID());
      setTempPassword(Math.random().toString(36).slice(-8) + 'H#1');
      fetchDynamicFields();
    }
  }, [isOpen]);

  const fetchDynamicFields = async () => {
    const { data } = await supabase.from('custom_fields').select('*');
    if (data) setDynamicFieldsDef(data);
  };

  const handleCepBlur = async () => {
    const cleanCep = form.cep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setForm((prev: any) => ({ ...prev, city: data.localidade, state: data.uf, address: data.logradouro }));
        }
      } catch (err) {
        console.error('Erro ao buscar CEP', err);
      }
    }
  };

  const handleCreateDynamicField = async () => {
    if (!newField.label) return;
    const nameSlug = newField.label.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const { error } = await supabase.from('custom_fields').insert({
      field_name: nameSlug,
      field_label: newField.label,
      field_type: newField.type
    });
    
    if (error) {
      alert(error.message.includes('HZ-DB_001') ? 'Limite de 20 campos atingido.' : 'Erro ao criar campo.');
      return;
    }
    setNewFieldMode(false);
    setNewField({ label: '', type: 'text' });
    fetchDynamicFields();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Chama a Rota de API Segura que acabamos de criar
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, horizion_id: hId, password: tempPassword })
      });
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      
      onSuccess?.();
    } catch (err: any) {
      alert(`HZ-AUTH_005: Falha na criação. Detalhe: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-md flex justify-end animate-fade-in">
      <div className="w-full max-w-3xl bg-white h-full border-l border-[#F2F2F2] flex flex-col overflow-y-auto shadow-2xl">
        
        <div className="px-10 py-8 border-b border-[#F2F2F2] flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-[#000000] tracking-tight">Provisionar Identidade</h2>
            <p className="text-xs text-[#545454] mt-1">Criação integral no banco de dados e atribuição de HorizionID.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full border border-[#F2F2F2] flex items-center justify-center hover:border-[#000000] transition-colors">
            X
          </button>
        </div>

        <div className="p-10 flex-1">
          <form id="create-user-form" onSubmit={handleCreate} className="space-y-8">
            
            {/* Secção 1: Credenciais */}
            <div className="bg-white border border-[#F2F2F2] rounded-[12px] p-6 space-y-6">
              <h3 className="text-sm font-bold text-[#000000] uppercase tracking-widest border-b border-[#F2F2F2] pb-4">Credenciais de Acesso</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="HorizionID Permanente" value={hId} disabled className="font-mono bg-[#FAFAFA]" />
                <Input label="Senha Provisória (Gerada)" value={tempPassword} readOnly className="font-mono bg-[#FAFAFA]" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Nome Completo" required placeholder="Ex: Ana Silva" value={form.full_name} onChange={(e: any) => setForm({...form, full_name: e.target.value})} />
                <Input label="E-mail Corporativo/Pessoal" type="email" required placeholder="ana@exemplo.com" value={form.email} onChange={(e: any) => setForm({...form, email: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#545454] uppercase tracking-wider block">Nível Estelar (Cargo)</label>
                <select className="w-full px-4 py-3 bg-white border border-[#F2F2F2] rounded-[12px] text-sm text-[#000000] focus:border-[#000000] outline-none" value={form.role} onChange={e => setForm({...form, role: e.target.value as StarRole})}>
                  <option value="sun">Sun (Utilizador Padrão)</option>
                  <option value="polaris">Polaris (Criador Verificado)</option>
                  <option value="altair">Altair (Moderador Assistente)</option>
                  <option value="sirius">Sirius (Liderança Suprema)</option>
                </select>
              </div>
            </div>

            {/* Secção 2: Geolocalização */}
            <div className="bg-white border border-[#F2F2F2] rounded-[12px] p-6 space-y-6">
              <h3 className="text-sm font-bold text-[#000000] uppercase tracking-widest border-b border-[#F2F2F2] pb-4">Localização (Busca Automática)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input label="CEP / Código Postal" placeholder="00000-000" value={form.cep} onChange={(e: any) => setForm({...form, cep: e.target.value})} onBlur={handleCepBlur} />
                <div className="col-span-2">
                  <Input label="Endereço / Rua" placeholder="Logradouro..." value={form.address} onChange={(e: any) => setForm({...form, address: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input label="Cidade" placeholder="Cidade" value={form.city} onChange={(e: any) => setForm({...form, city: e.target.value})} />
                <Input label="Estado/Distrito" placeholder="UF" value={form.state} onChange={(e: any) => setForm({...form, state: e.target.value})} />
                <Input label="País (ISO)" placeholder="BR, PT..." value={form.country} onChange={(e: any) => setForm({...form, country: e.target.value})} />
              </div>
            </div>

            {/* Secção 3: Campos Dinâmicos (Até 20) */}
            <div className="bg-white border border-[#F2F2F2] rounded-[12px] p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-[#F2F2F2] pb-4">
                <h3 className="text-sm font-bold text-[#000000] uppercase tracking-widest">Atributos Dinâmicos</h3>
                <button type="button" onClick={() => setNewFieldMode(!newFieldMode)} className="text-[10px] font-bold text-[#000000] border border-[#000000] px-3 py-1 rounded-full hover:bg-[#000000] hover:text-white transition-all">
                  + Adicionar Nova Regra
                </button>
              </div>

              {newFieldMode && (
                <div className="bg-[#FAFAFA] p-4 rounded-[12px] border border-[#F2F2F2] flex gap-4 items-end">
                  <Input label="Nome do Novo Campo" placeholder="Ex: Idade, Profissão..." value={newField.label} onChange={(e: any) => setNewField({...newField, label: e.target.value})} />
                  <div className="space-y-1.5 w-full">
                    <label className="text-[10px] font-bold text-[#545454] uppercase tracking-wider block">Tipo de Dado</label>
                    <select className="w-full px-4 py-3 bg-white border border-[#F2F2F2] rounded-[12px] text-sm text-[#000000]" value={newField.type} onChange={(e: any) => setNewField({...newField, type: e.target.value})}>
                      <option value="text">Texto Curto</option>
                      <option value="number">Número</option>
                      <option value="date">Data (Calendário)</option>
                    </select>
                  </div>
                  <button type="button" onClick={handleCreateDynamicField} className="px-6 py-3 bg-[#000000] text-white text-[10px] font-bold uppercase rounded-[12px] h-[46px]">Gravar</button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dynamicFieldsDef.map(field => (
                  <Input 
                    key={field.id} 
                    label={field.field_label} 
                    type={field.field_type} 
                    value={form.custom_data[field.field_name] || ''} 
                    onChange={(e: any) => setForm({...form, custom_data: {...form.custom_data, [field.field_name]: e.target.value}})} 
                  />
                ))}
                {dynamicFieldsDef.length === 0 && !newFieldMode && (
                  <p className="text-xs text-[#545454] col-span-2">Nenhum campo dinâmico configurado no sistema. A base inicial é gerada com valor Zero/Vazio por padrão.</p>
                )}
              </div>

              {/* Botão solicitado de notificação (Layout apenas, backend via Edge Functions no futuro) */}
              <button type="button" className="w-full py-3 bg-white border border-[#F2F2F2] text-[#000000] text-[10px] font-bold uppercase rounded-[12px] hover:border-[#000000] flex items-center justify-center gap-2 transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                Notificar Usuário para Preencher Campos Vazios
              </button>
            </div>

          </form>
        </div>

        <div className="p-10 border-t border-[#F2F2F2] bg-white sticky bottom-0 z-10 flex gap-4">
          <button type="button" onClick={onClose} className="px-8 py-4 text-[10px] font-bold text-[#545454] uppercase tracking-widest border border-[#F2F2F2] rounded-[12px] hover:border-[#000000] transition-colors bg-white">
            Cancelar
          </button>
          <button type="submit" form="create-user-form" disabled={loading} className="flex-1 py-4 bg-[#000000] text-white text-[10px] font-bold uppercase tracking-widest rounded-[12px] hover:bg-opacity-90 transition-all disabled:opacity-50">
            {loading ? 'A Inserir no Supabase...' : 'Confirmar e Gerar Conta'}
          </button>
        </div>
      </div>
    </div>
  );
}