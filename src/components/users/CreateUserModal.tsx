// src/components/users/CreateUserModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { userService } from '@/services/userService';
import { StellarRole, SYSTEM_PERMISSIONS, Profile } from '@/types/horizion';
import { generateHorizionID } from '@/utils/horizionIdGenerator';

interface Props { isOpen: boolean; onClose: () => void; onSuccess: () => void; }

export function CreateUserModal({ isOpen, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [hId, setHId] = useState('');
  const [form, setForm] = useState<Partial<Profile>>({
    full_name: '', role: 'user' as StellarRole, status: 'active',
    custom_permissions: [], location_city: '', location_country: ''
  });

  useEffect(() => { if (isOpen) setHId(generateHorizionID()); }, [isOpen]);

  if (!isOpen) return null;

  const handleCreate = async () => {
    setLoading(true);
    try {
      await userService.createProfile({
        ...form,
        horizion_id: hId,
        id: crypto.randomUUID() // Provisionamento de ID (UUID v4)
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(`Falha no Core: ${err.message || 'Erro de permissão RLS'}`);
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-md flex justify-end animate-fade-in">
      <div className="w-full max-w-xl bg-white h-full border-l border-horazion-light p-12 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-12">
          <header>
            <span className="text-[10px] font-bold text-horazion-red uppercase tracking-[0.4em]">Protocolo Sincronia</span>
            <h2 className="text-4xl font-bold tracking-tighter text-horazion-black">Nova Identidade</h2>
          </header>

          <section className="space-y-8">
            <div className="p-8 bg-horazion-light/10 rounded-[24px] border border-horazion-light text-center">
              <span className="text-[10px] font-bold text-horazion-gray uppercase tracking-widest block mb-1">HorizionID Gerado</span>
              <span className="text-2xl font-mono font-bold text-horazion-black tracking-tighter">{hId}</span>
            </div>

            <div className="space-y-6">
              <div className="group">
                <label className="text-[10px] font-bold text-horazion-gray uppercase tracking-widest">Nome Completo</label>
                <input 
                  className="w-full py-4 text-xl font-bold border-b border-horazion-light focus:border-horazion-black outline-none transition-all" 
                  placeholder="Ex: Sirius Black"
                  onChange={e => setForm({...form, full_name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-bold text-horazion-gray uppercase tracking-widest">Nível Estelar</label>
                  <select 
                    className="w-full py-4 border-b border-horazion-light bg-transparent font-bold text-sm outline-none"
                    onChange={e => setForm({...form, role: e.target.value as StellarRole})}
                  >
                    <option value="user">USER</option>
                    <option value="sirius">SIRIUS</option>
                    <option value="rigel">RIGEL</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-horazion-gray uppercase tracking-widest">Cidade</label>
                  <input 
                    className="w-full py-4 border-b border-horazion-light bg-transparent font-bold text-sm outline-none"
                    placeholder="São Paulo"
                    onChange={e => setForm({...form, location_city: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        <footer className="space-y-4 pt-10">
          <button 
            onClick={handleCreate} disabled={loading}
            className="w-full py-6 bg-horazion-black text-white text-[10px] font-bold uppercase tracking-[0.3em] rounded-full hover:bg-horazion-red transition-all"
          >
            {loading ? 'Sincronizando...' : 'Confirmar Registro'}
          </button>
          <button onClick={onClose} className="w-full text-[10px] font-bold text-horazion-gray uppercase tracking-widest py-2">Cancelar</button>
        </footer>
      </div>
    </div>
  );
}