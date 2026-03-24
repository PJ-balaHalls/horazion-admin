'use client';

import React from 'react';
import { HzButton } from '@/components/ui/HzButton';
import { HzSwitch } from '@/components/ui/HzSwitch';

export function UserSettingsTab({ user }: { user: any }) {
  if (!user) {
    return (
      <div className="flex items-center justify-center p-12 text-[#A0A0A0] text-sm font-medium border border-dashed border-[#E5E5E5] rounded-[16px]">
        [SYS_WARN] O payload de preferências não foi fornecido.
      </div>
    );
  }

  const customData = user.custom_data || {};
  const preferences = customData.preferences || {};

  return (
    <div className="animate-in fade-in space-y-8 max-w-4xl">
      <div className="space-y-4">
        <h3 className="text-[10px] font-bold uppercase text-[#A0A0A0] tracking-widest border-l-2 border-black pl-3">Privacidade & LGPD</h3>
        <div className="bg-white border border-[#F2F2F2] rounded-[16px] divide-y divide-[#F2F2F2] overflow-hidden">
          <div className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-black">Partilha de Dados Analíticos</p>
              <p className="text-xs text-[#545454] mt-1">Permite a recolha de dados anónimos para melhoria do ecossistema.</p>
            </div>
            <HzSwitch checked={preferences.analytics_sharing ?? false} disabled />
          </div>
          <div className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-black">Visibilidade do Horizion ID</p>
              <p className="text-xs text-[#545454] mt-1">Torna o perfil localizável nos Universos Sociais.</p>
            </div>
            <HzSwitch checked={preferences.public_profile ?? true} disabled />
          </div>
        </div>
      </div>

      <div className="space-y-4 mt-8">
        <h3 className="text-[10px] font-bold uppercase text-[#A0A0A0] tracking-widest border-l-2 border-[#B6192E] pl-3">Ações de Conformidade</h3>
        <div className="flex gap-4">
          <HzButton variant="secondary" className="bg-white text-black border-[#E5E5E5] text-xs h-10 hover:border-black">Exportar Dados (JSON)</HzButton>
          <HzButton variant="secondary" className="bg-white text-[#B6192E] border-[#E5E5E5] text-xs h-10 hover:border-[#B6192E] hover:bg-red-50">Revogar Consentimento Global</HzButton>
        </div>
      </div>
    </div>
  );
}