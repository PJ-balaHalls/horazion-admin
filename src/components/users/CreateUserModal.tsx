'use client';

import { useState, useEffect } from 'react';
// import { userService } from '@/services/userService'; // Descomente quando a service estiver alinhada
import { StarRole } from '@/types/horizion';
import { generateHorizionID } from '@/utils/horizionIdGenerator';

export function CreateUserModal({ isOpen, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [hId, setHId] = useState('');
  const [form, setForm] = useState<{ full_name: string; role: StarRole; location_city: string }>({
    full_name: '',
    role: 'sun', // Padrão agora é 'sun'
    location_city: ''
  });

  useEffect(() => {
    if (isOpen) setHId(generateHorizionID());
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // [CORE-HZ-006] Em produção, isso chama a Edge Function de provisionamento
      console.log('Criando usuário no Core:', { ...form, horizion_id: hId });
      /*
      await userService.createProfile({
        ...form,
        horizion_id: hId,
        id: crypto.randomUUID()
      });
      */
      onSuccess?.();
      onClose();
    } catch (err) {
      alert("HZ-AUTH_005: Erro no Core: Falha na sincronização de dados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white/90 backdrop-blur-xl flex justify-end animate-fade-in">
      <div className="w-full max-w-xl bg-white h-full border-l border-[#F2F2F2] p-16 flex flex-col shadow-none">
        <div className="flex-1 space-y-12">
          <header className="space-y-2">
            <span className="text-[10px] font-bold text-[#B6192E] uppercase tracking-[0.4em]">Núcleo de Identidade</span>
            <h2 className="text-4xl font-bold tracking-tighter text-[#000000]">Novo Registro</h2>
          </header>

          <form id="create-user-form" onSubmit={handleCreate} className="space-y-10">
            <div className="p-10 border border-[#F2F2F2] rounded-[32px] text-center bg-[#FAFAFA]">
              <p className="text-[9px] font-bold text-[#545454] uppercase tracking-widest mb-2">HorizionID Permanente</p>
              <p className="text-3xl font-mono font-bold text-[#000000]">{hId}</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#545454] uppercase">Nome Completo</label>
                <input 
                  required
                  className="w-full py-4 text-xl font-bold border-b border-[#F2F2F2] focus:border-[#000000] outline-none bg-transparent"
                  value={form.full_name}
                  onChange={e => setForm({...form, full_name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#545454] uppercase">Nível Estelar</label>
                  <select 
                    className="w-full py-4 border-b border-[#F2F2F2] bg-transparent font-bold outline-none uppercase text-xs"
                    value={form.role}
                    onChange={e => setForm({...form, role: e.target.value as StarRole})}
                  >
                    <option value="sun">Sun (Padrão)</option>
                    <option value="polaris">Polaris (Parceiro)</option>
                    <option value="altair">Altair (Mod Assistente)</option>
                    <option value="vega">Vega (Mod Principal)</option>
                    <option value="arcturus">Arcturus (Gerente)</option>
                    <option value="canopus">Canopus (Admin)</option>
                    <option value="sirius">Sirius (CEO)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#545454] uppercase">Cidade Base</label>
                  <input 
                    className="w-full py-4 border-b border-[#F2F2F2] bg-transparent font-bold outline-none text-xs"
                    value={form.location_city}
                    onChange={e => setForm({...form, location_city: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="pt-10 space-y-4">
          <button 
            type="submit"
            form="create-user-form"
            disabled={loading}
            className="w-full py-6 bg-[#000000] text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-[#B6192E] transition-all"
          >
            {loading ? 'Sincronizando...' : 'Confirmar Identidade'}
          </button>
          <button 
            type="button"
            onClick={onClose} 
            className="w-full text-[10px] font-bold text-[#545454] uppercase py-2 hover:text-[#000000]"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}