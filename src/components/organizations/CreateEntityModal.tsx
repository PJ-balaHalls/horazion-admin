'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HzButton } from '@/components/ui/HzButton';
import { HzInput } from '@/components/ui/HzInput';
import { HzSelect } from '@/components/ui/HzSelect';
import { entityService } from '@/services/entityService';
import { toast } from 'sonner';
import { XMarkIcon } from '@heroicons/react/24/outline';

export function CreateEntityModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ display_name: '', slug: '', category: 'company', sector: '' });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await entityService.createEntity(form);
      toast.success('Entidade Criada! Redirecionando...');
      onSuccess();
      onClose();
      router.push(`/organizations/${data.id}`);
    } catch (err: any) {
      toast.error(err.user_message || 'Erro ao criar');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-[24px] w-full max-w-md overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b flex justify-between bg-gray-50">
          <h2 className="font-bold text-black">Nova Organização</h2>
          <button type="button" onClick={onClose}><XMarkIcon className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="p-8 space-y-4">
          <HzInput required label="Nome Comercial *" value={form.display_name} onChange={e => setForm({...form, display_name: e.target.value})} />
          <HzInput required label="Identificador (Slug) *" value={form.slug} onChange={e => setForm({...form, slug: e.target.value.toLowerCase()})} />
          <HzSelect label="Categoria *" value={form.category} onChange={val => setForm({...form, category: val})} options={[{value: 'holding', label: 'Holding'}, {value: 'company', label: 'Empresa'}, {value: 'partner', label: 'Parceiro'}]} />
          <HzInput label="Setor de Atuação" value={form.sector} onChange={e => setForm({...form, sector: e.target.value})} />
        </div>
        <div className="p-6 border-t bg-gray-50 flex gap-2">
          <HzButton type="button" variant="ghost" className="flex-1" onClick={onClose}>Cancelar</HzButton>
          <HzButton type="submit" isLoading={loading} className="flex-1 bg-[#B6192E] text-white">Criar e Configurar</HzButton>
        </div>
      </form>
    </div>
  );
}