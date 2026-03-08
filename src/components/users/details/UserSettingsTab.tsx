'use client';

import React from 'react';
import clsx from 'clsx';

interface UserSettingsTabProps {
  user: any;
  updatePreference: (key: string, value: boolean) => void;
}

export function UserSettingsTab({ user, updatePreference }: UserSettingsTabProps) {
  const { preferences, permissions } = user.custom_data;

  return (
    <div className="grid grid-cols-2 gap-12 animate-in fade-in">
      <div className="space-y-6">
        <h3 className="text-[10px] font-bold uppercase text-[#A0A0A0] tracking-widest border-l-2 border-black pl-3 mb-6">Políticas de Exibição e UI</h3>
        
        <div className="p-6 bg-[#FAFAFA] border border-[#F2F2F2] rounded-[16px] flex items-center justify-between">
          <div><p className="text-sm font-bold text-black">Exibição de Anúncios (Ads)</p><p className="text-xs text-[#545454] mt-1">Monetização no feed.</p></div>
          <div className="flex gap-2">
            <button onClick={() => updatePreference('ads_enabled', true)} className={clsx("px-4 py-2 text-xs font-bold rounded-[8px] transition", preferences.ads_enabled ? "bg-black text-white" : "bg-white border border-[#E5E5E5] text-[#A0A0A0]")}>ATIVAR</button>
            <button onClick={() => updatePreference('ads_enabled', false)} className={clsx("px-4 py-2 text-xs font-bold rounded-[8px] transition", !preferences.ads_enabled ? "bg-[#B6192E] text-white" : "bg-white border border-[#E5E5E5] text-[#A0A0A0]")}>SUPRIMIR</button>
          </div>
        </div>

        <div className="p-6 bg-[#FAFAFA] border border-[#F2F2F2] rounded-[16px] flex items-center justify-between">
          <div><p className="text-sm font-bold text-black">Ocultar Métricas (Saúde Mental)</p><p className="text-xs text-[#545454] mt-1">Esconde likes e seguidores.</p></div>
          <div className="flex gap-2">
            <button onClick={() => updatePreference('hide_metrics', true)} className={clsx("px-4 py-2 text-xs font-bold rounded-[8px] transition", preferences.hide_metrics ? "bg-black text-white" : "bg-white border border-[#E5E5E5] text-[#A0A0A0]")}>ATIVAR</button>
            <button onClick={() => updatePreference('hide_metrics', false)} className={clsx("px-4 py-2 text-xs font-bold rounded-[8px] transition", !preferences.hide_metrics ? "bg-white text-black border border-black" : "bg-white border border-[#E5E5E5] text-[#A0A0A0]")}>SUPRIMIR</button>
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        <h3 className="text-[10px] font-bold uppercase text-[#A0A0A0] tracking-widest border-l-2 border-[#B6192E] pl-3 mb-6">Matriz de Permissões Core</h3>
        <div className="bg-white border border-[#F2F2F2] rounded-[16px] overflow-hidden text-sm">
          <div className="flex justify-between border-b border-[#F2F2F2] p-4"><span className="text-[#545454]">Criar Novos Universos</span><span className="font-mono text-xs font-bold">{permissions.can_create_universe ? 'TRUE' : 'FALSE'}</span></div>
          <div className="flex justify-between border-b border-[#F2F2F2] p-4"><span className="text-[#545454]">Moderar Conteúdo Local</span><span className="font-mono text-xs font-bold">{permissions.can_moderate_content ? 'TRUE' : 'FALSE'}</span></div>
          <div className="flex justify-between p-4"><span className="text-[#545454]">Bypass de Sistema (VIP)</span><span className="font-mono text-xs font-bold">{permissions.can_bypass_ads ? 'TRUE' : 'FALSE'}</span></div>
        </div>
      </div>
    </div>
  );
}