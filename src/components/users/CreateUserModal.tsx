'use client';

import { useState } from 'react';
import { userService } from '@/services/userService';
import { StellarRole } from '@/types/horizion';

export function CreateUserModal({ isOpen, onClose, onRefresh }: any) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    id: '', full_name: '', horizion_id: '', role: 'user' as StellarRole,
    zip_code: '', location_city: '', location_country: 'Brasil'
  });

  const handleZip = async (zip: string) => {
    setForm({ ...form, zip_code: zip });
    if (zip.length === 8) {
      const data = await userService.fetchAddress(zip);
      if (!data.erro) setForm(prev => ({ ...prev, location_city: data.localidade }));
    }
  };

  const handleNameChange = (name: string) => {
    setForm({ ...form, full_name: name, horizion_id: userService.generateID(name) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userService.createProfile(form);
      onRefresh();
      onClose();
    } catch (err: any) {
      alert(`Erro Core: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-horazion-black/20 backdrop-blur-sm p-4">
      <div className="bg-horazion-white w-full max-w-2xl rounded-hz border border-horazion-light shadow-2xl p-10 animate-slide-in">
        <h2 className="text-2xl font-bold tracking-tighter mb-8 text-horazion-black">Nova Identidade Estelar</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[9px] font-bold text-horazion-gray uppercase block mb-1.5">Nome Completo</label>
              <input required onChange={e => handleNameChange(e.target.value)} className="w-full p-3 border border-horazion-light rounded-hz text-sm font-bold focus:border-horazion-black outline-none" placeholder="Ex: Arthur Sirius" />
            </div>
            <div>
              <label className="text-[9px] font-bold text-horazion-gray uppercase block mb-1.5">HorizionID (Auto)</label>
              <input readOnly value={form.horizion_id} className="w-full p-3 border border-horazion-light rounded-hz text-sm font-mono bg-horazion-light/20 text-horazion-red" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
             <div>
              <label className="text-[9px] font-bold text-horazion-gray uppercase block mb-1.5">CEP</label>
              <input required maxLength={8} onChange={e => handleZip(e.target.value)} className="w-full p-3 border border-horazion-light rounded-hz text-sm font-bold" placeholder="00000000" />
            </div>
            <div className="col-span-2">
              <label className="text-[9px] font-bold text-horazion-gray uppercase block mb-1.5">Cidade</label>
              <input required value={form.location_city} onChange={e => setForm({...form, location_city: e.target.value})} className="w-full p-3 border border-horazion-light rounded-hz text-sm font-bold" />
            </div>
          </div>

          <div>
            <label className="text-[9px] font-bold text-horazion-gray uppercase block mb-1.5">Nível Estelar</label>
            <select value={form.role} onChange={e => setForm({...form, role: e.target.value as StellarRole})} className="w-full p-3 border border-horazion-light rounded-hz text-sm font-bold bg-horazion-white">
              <option value="user">SOL (Usuário)</option>
              <option value="altair">ALTAIR (Analista)</option>
              <option value="betelgeuse">BETELGEUSE (Operador)</option>
              <option value="rigel">RIGEL (Estrategista)</option>
              <option value="sirius">SIRIUS (Diretor)</option>
            </select>
          </div>

          <div>
            <label className="text-[9px] font-bold text-horazion-gray uppercase block mb-1.5">UUID Auth (Supabase)</label>
            <input required value={form.id} onChange={e => setForm({...form, id: e.target.value})} className="w-full p-3 border border-horazion-light rounded-hz text-xs font-mono" placeholder="00000000-0000..." />
          </div>

          <div className="flex gap-4 pt-6">
            <button type="button" onClick={onClose} className="flex-1 p-3 text-xs font-bold text-horazion-gray">DESCARTAR</button>
            <button type="submit" disabled={loading} className="flex-1 p-3 bg-horazion-black text-horazion-white text-xs font-bold rounded-hz shadow-lg hover:bg-horazion-red transition-all">
              {loading ? 'SINCRONIZANDO...' : 'CONFIRMAR NO CORE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}