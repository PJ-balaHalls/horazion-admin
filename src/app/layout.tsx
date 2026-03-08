// src/components/users/CreateUserModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { userService } from '@/services/userService';
import { StellarRole, Profile } from '@/types/horizion';
import { generateHorizionID } from '@/utils/horizionIdGenerator';

export function CreateUserModal({ isOpen, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [hId, setHId] = useState('');
  const [form, setForm] = useState<Partial<Profile>>({
    full_name: '', role: 'user', status: 'active'
  });

  useEffect(() => { if (isOpen) setHId(generateHorizionID()); }, [isOpen]);

  if (!isOpen) return null;

  const handleCreate = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Nota: Em um SOS real, isso chamaria uma Edge Function para criar Auth + Profile
      await userService.createProfile({
        ...form,
        horizion_id: hId,
        id: crypto.randomUUID() // Fallback para provisionamento manual
      });
      onSuccess();
      onClose();
    } catch (err) {
      alert("Erro no Core: Falha na sincronização de dados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white/90 backdrop-blur-xl flex justify-end animate-fade-in">
      <div className="w-full max-w-xl bg-white h-full border-l border-horazion-light p-16 flex flex-col shadow-none">
        <div className="flex-1 space-y-12">
          <header className="space-y-2">
            <span className="text-[10px] font-bold text-horazion-red uppercase tracking-[0.4em]">Núcleo de Identidade</span>
            <h2 className="text-4xl font-bold tracking-tighter text-horazion-black">Novo Registro</h2>
          </header>

          <div className="space-y-10">
            <div className="p-10 border border-horazion-light rounded-[32px] text-center bg-horazion-light/10">
              <p className="text-[9px] font-bold text-horazion-gray uppercase tracking-widest mb-2">HorizionID Permanente</p>
              <p className="text-3xl font-mono font-bold text-horazion-black">{hId}</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-horazion-gray uppercase">Nome Completo</label>
                <input 
                  required
                  className="w-full py-4 text-xl font-bold border-b border-horazion-light focus:border-horazion-black outline-none bg-transparent"
                  onChange={e => setForm({...form, full_name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-horazion-gray uppercase">Nível Estelar</label>
                  <select 
                    className="w-full py-4 border-b border-horazion-light bg-transparent font-bold outline-none uppercase text-xs"
                    onChange={e => setForm({...form, role: e.target.value as StellarRole})}
                  >
                    <option value="user">User</option>
                    <option value="sirius">Sirius (Admin)</option>
                    <option value="rigel">Rigel</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-horazion-gray uppercase">Cidade</label>
                  <input 
                    className="w-full py-4 border-b border-horazion-light bg-transparent font-bold outline-none text-xs"
                    onChange={e => setForm({...form, location_city: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-10 space-y-4">
          <button 
            onClick={handleCreate} disabled={loading}
            className="w-full py-6 bg-horazion-black text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-horazion-red transition-all"
          >
            {loading ? 'Sincronizando...' : 'Confirmar Identidade'}
          </button>
          <button onClick={onClose} className="w-full text-[10px] font-bold text-horazion-gray uppercase py-2">Cancelar</button>
        </div>
      </div>
    </div>
  );
}