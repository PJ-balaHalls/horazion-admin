'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { Constellation } from '@/components/users/Constellation';
import { userService } from '@/services/userService';
import { useState } from 'react';

export default function AccountPage() {
  const { profile } = useAuthStore();
  const [zip, setZip] = useState('');

  const findAddress = async () => {
    if (zip.length === 8) {
      const data = await userService.getGeoData(zip);
      // Aqui integraria com um update no banco
      alert(`Localizado: ${data.localidade} - ${data.uf}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      <div className="border-b border-horazion-light pb-6">
        <h1 className="text-3xl font-bold text-horazion-black tracking-tighter">Horizion Account</h1>
        <p className="text-sm text-horazion-gray font-medium">Controle total da sua Identidade Única.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Coluna Visual */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold text-horazion-red tracking-widest uppercase">Sua Estrela</h3>
          <Constellation profile={profile} />
        </div>

        {/* Coluna Dados */}
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-horazion-black tracking-widest uppercase">Preferências de Identidade</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-horazion-gray uppercase">HorizionID</label>
                <input disabled value={profile?.horizion_id || ''} className="w-full p-2.5 border border-horazion-light rounded bg-horazion-light/10 text-xs font-mono" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-horazion-gray uppercase">Localização (CEP)</label>
                <div className="flex gap-2">
                  <input maxLength={8} value={zip} onChange={e => setZip(e.target.value)} className="flex-1 p-2.5 border border-horazion-light rounded text-xs" />
                  <button onClick={findAddress} className="px-4 py-2 bg-horazion-black text-horazion-white text-[10px] font-bold rounded">BUSCAR</button>
                </div>
              </div>
            </div>
          </section>

          <section className="pt-6 border-t border-horazion-light">
            <h3 className="text-xs font-bold text-horazion-black tracking-widest uppercase mb-4">Governança (Minhas Permissões)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {profile?.custom_permissions && profile.custom_permissions.length > 0 ? (
                profile.custom_permissions.map((p: string, index: number) => (
                  <div key={index} className="p-2 border border-horazion-light rounded text-[10px] font-bold text-horazion-gray bg-horazion-light/5">
                    {/* Validação de segurança antes de aplicar o toUpperCase */}
                    ✓ {p ? p.toUpperCase() : 'INDEFINIDO'}
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-horazion-gray italic">
                  Permissões baseadas no nível {profile?.role || 'padrão'}.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}