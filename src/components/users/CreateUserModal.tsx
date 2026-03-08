'use client';

import React, { useState, useEffect } from 'react';
import { StarRole, CustomFieldDefinition } from '@/types/horizion';
import { generateHorizionID } from '@/utils/horizionIdGenerator';
import { supabase } from '@/lib/supabase';
import { HzButton } from '@/components/ui/HzButton';
import { HzInput } from '@/components/ui/HzInput';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateUserModal({ isOpen, onClose, onSuccess }: CreateUserModalProps) {
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
      setTempPassword(Math.random().toString(36).slice(-10).toUpperCase() + '@H1');
      supabase.from('custom_fields').select('*').then(({ data }) => {
        if (data) setDynamicFields(data as CustomFieldDefinition[]);
      });
    }
  }, [isOpen]);

  const handleCepLookup = async () => {
    const cleanCep = form.cep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setForm(p => ({ ...p, address: data.logradouro, city: data.localidade, state: data.uf }));
      }
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
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
      alert(`Erro: ${err.error}`);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-md flex justify-end">
      <div className="w-full max-w-3xl bg-white border-l border-[#F2F2F2] flex flex-col shadow-2xl overflow-y-auto rounded-l-[24px]">
        <header className="p-12 border-b border-[#F2F2F2]">
          <h2 className="text-4xl font-bold text-black tracking-tighter">Novo Registro Core</h2>
          <p className="text-sm text-[#545454] mt-2 italic">Aprovisionamento de Identidade Digital Única.</p>
        </header>

        <form onSubmit={handleCreate} className="p-12 space-y-12">
          {/* Box de Segurança */}
          <div className="grid grid-cols-2 gap-8 p-8 border border-black rounded-[12px] bg-white">
            <div>
              <label className="text-[10px] font-bold uppercase text-[#545454] tracking-widest">ID Alocado</label>
              <p className="text-xl font-mono font-bold mt-1">{hId}</p>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-[#545454] tracking-widest">Senha Provisória</label>
              <p className="text-xl font-mono font-bold text-[#B6192E] mt-1">{tempPassword}</p>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest border-b border-[#F2F2F2] pb-2">Informação Primária</h3>
            <div className="grid grid-cols-2 gap-6">
              <HzInput label="Nome Completo" required value={form.full_name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, full_name: e.target.value})} />
              <HzInput label="E-mail" type="email" required value={form.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, email: e.target.value})} />
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest border-b border-[#F2F2F2] pb-2">Geolocalização</h3>
            <div className="grid grid-cols-3 gap-6">
              <HzInput label="CEP (Auto)" value={form.cep} onBlur={handleCepLookup} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, cep: e.target.value})} />
              <div className="col-span-2"><HzInput label="Endereço" value={form.address} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, address: e.target.value})} /></div>
            </div>
          </div>

          {dynamicFields.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-widest border-b border-[#F2F2F2] pb-2">Metadados Dinâmicos</h3>
              <div className="grid grid-cols-2 gap-6">
                {dynamicFields.map(f => (
                  <HzInput 
                    key={f.id} label={f.field_label} type={f.field_type} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, custom_data: {...form.custom_data, [f.field_name]: e.target.value}})} 
                  />
                ))}
              </div>
            </div>
          )}
        </form>

        <footer className="p-12 border-t border-[#F2F2F2] flex gap-4 bg-white sticky bottom-0">
          <HzButton variant="secondary" onClick={onClose} className="flex-1 rounded-[12px]">Cancelar</HzButton>
          <HzButton variant="primary" isLoading={loading} className="flex-1 rounded-[12px]" onClick={handleCreate}>Efetivar Registro</HzButton>
        </footer>
      </div>
    </div>
  );
}2