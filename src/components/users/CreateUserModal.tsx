'use client';

import React, { useState, useEffect } from 'react';
import { StarRole, CustomFieldDefinition } from '@/types/horizion';
import { generateHorizionID } from '@/utils/horizionIdGenerator';
import { supabase } from '@/lib/supabase';
import { HzButton } from '@/components/ui/HzButton';
import { HzInput } from '@/components/ui/HzInput';
import { HzSelect } from '@/components/ui/HzSelect';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateUserModal({ isOpen, onClose, onSuccess }: CreateUserModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hId, setHId] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [dynamicFields, setDynamicFields] = useState<CustomFieldDefinition[]>([]);
  
  const [form, setForm] = useState({
    full_name: '', email: '', role: 'sun' as StarRole,
    cep: '', address: '', city: '', state: '', country: 'Brasil',
    custom_data: {} as Record<string, any>
  });

  useEffect(() => {
    if (isOpen) {
      setHId(generateHorizionID());
      setTempPassword(Math.random().toString(36).slice(-10).toUpperCase() + '@HZ1');
      // Busca definições globais de campos customizados
      supabase.from('custom_fields').select('*').then(({ data }) => {
        if (data) setDynamicFields(data as CustomFieldDefinition[]);
      });
    }
  }, [isOpen]);

  const handleCepLookup = async () => {
    const cleanCep = form.cep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setForm(p => ({ ...p, address: data.logradouro, city: data.localidade, state: data.uf }));
        }
      } catch (e) { console.error("Falha no serviço de localização"); }
    }
  };

  const handleCreate = async () => {
    setLoading(true);
    // Chamada à API de Aprovisionamento Core
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, horizion_id: hId, password: tempPassword })
    });
    
    if (response.ok) {
      onSuccess();
      onClose();
    } else {
      const err = await response.json();
      alert(`Falha no Aprovisionamento: ${err.error}`);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-xl flex justify-end animate-in fade-in slide-in-from-right duration-500">
      <div className="w-full max-w-4xl bg-white border-l border-[#F2F2F2] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.05)] rounded-l-[32px] overflow-hidden">
        
        <header className="p-12 border-b border-[#F2F2F2] flex justify-between items-start">
          <div>
            <h2 className="text-4xl font-bold text-black tracking-tighter">Aprovisionamento Core</h2>
            <p className="text-xs text-[#545454] mt-2 uppercase tracking-[0.2em] font-medium">Injeção de Identidade no Ecossistema Horazion</p>
          </div>
          <div className="flex flex-col items-end">
             <span className="text-[10px] font-bold text-[#545454] uppercase tracking-widest mb-1">Status de Rede</span>
             <div className="flex items-center gap-2 px-3 py-1 bg-[#F2F2F2] rounded-full text-[10px] font-bold">
               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> SYNC_ACTIVE
             </div>
          </div>
        </header>

        <main className="flex-1 p-12 overflow-y-auto space-y-16">
          {/* IDENTIFICADORES GERADOS */}
          <section className="grid grid-cols-2 gap-8 p-10 bg-black rounded-[16px] text-white">
            <div>
              <label className="text-[10px] font-bold uppercase text-white/50 tracking-widest">Horizion ID (Imutável)</label>
              <p className="text-2xl font-mono font-bold mt-2 tracking-tighter">{hId}</p>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-white/50 tracking-widest">Senha de Primeiro Acesso</label>
              <p className="text-2xl font-mono font-bold text-[#B6192E] mt-2 tracking-tighter">{tempPassword}</p>
            </div>
          </section>

          {/* DADOS PRIMÁRIOS */}
          <div className="space-y-8">
            <h3 className="text-xs font-bold uppercase tracking-widest border-l-4 border-black pl-4">01. Atributos de Identidade</h3>
            <div className="grid grid-cols-2 gap-8">
              <HzInput label="Nome Completo" placeholder="Ex: John Horizon" value={form.full_name} onChange={(e) => setForm({...form, full_name: e.target.value})} />
              <HzInput label="E-mail Corporativo/Pessoal" type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
              <HzSelect 
                label="Hierarquia Estelar (Role)" 
                options={[
                  {label: 'Sun (Padrão)', value: 'sun'},
                  {label: 'Sirius (Admin)', value: 'sirius'},
                  {label: 'Polaris (Suporte)', value: 'polaris'}
                ]}
                value={form.role}
                onChange={(val) => setForm({...form, role: val as StarRole})}
              />
            </div>
          </div>

          {/* LOCALIZAÇÃO */}
          <div className="space-y-8">
            <h3 className="text-xs font-bold uppercase tracking-widest border-l-4 border-black pl-4">02. Geolocalização Tracking</h3>
            <div className="grid grid-cols-3 gap-8">
              <HzInput label="CEP" value={form.cep} onBlur={handleCepLookup} onChange={(e) => setForm({...form, cep: e.target.value})} />
              <div className="col-span-2"><HzInput label="Endereço Completo" value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} /></div>
              <HzInput label="Cidade" value={form.city} readOnly />
              <HzInput label="Estado/UF" value={form.state} readOnly />
              <HzInput label="País" value={form.country} onChange={(e) => setForm({...form, country: e.target.value})} />
            </div>
          </div>

          {/* CAMPOS DINÂMICOS - Módulo Modular */}
          {dynamicFields.length > 0 && (
            <div className="space-y-8">
              <h3 className="text-xs font-bold uppercase tracking-widest border-l-4 border-black pl-4">03. Metadados Adicionais</h3>
              <div className="grid grid-cols-2 gap-8">
                {dynamicFields.map(f => (
                  <HzInput 
                    key={f.id} label={f.field_label} type={f.field_type} 
                    onChange={(e) => setForm({...form, custom_data: {...form.custom_data, [f.field_name]: e.target.value}})} 
                  />
                ))}
              </div>
            </div>
          )}
        </main>

        <footer className="p-12 border-t border-[#F2F2F2] flex gap-6 bg-white sticky bottom-0 z-10">
          <HzButton variant="secondary" onClick={onClose} className="flex-1 h-14 rounded-[16px]">Abortar Registro</HzButton>
          <HzButton variant="primary" isLoading={loading} className="flex-[2] h-14 rounded-[16px]" onClick={handleCreate}>Efetivar Registro Core</HzButton>
        </footer>
      </div>
    </div>
  );
}