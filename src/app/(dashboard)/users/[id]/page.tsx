'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
// IMPORTAÇÃO DIRECTA CORRIGIDA (Sem usar index.ts)
import { HzButton } from '@/components/ui/HzButton';
import clsx from 'clsx';

// Importação da Arquitetura Modular
import { UserOverviewTab } from '@/components/users/details/UserOverviewTab';
import { UserSettingsTab } from '@/components/users/details/UserSettingsTab';
import { UserSecurityTab } from '@/components/users/details/UserSecurityTab';
import { UserDataTab } from '@/components/users/details/UserDataTab';
import { UserAffiliationsTab } from '@/components/users/details/UserAffiliationsTab';

export default function UserDetailPage() {
  const params = useParams();
  const userId = params.id as string;
  
  const [user, setUser] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'security' | 'association' | 'raw'>('overview');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => { 
    fetchUser(); 
  }, [userId]);

  const fetchUser = async () => {
    setLoading(true);
    
    // Promessa Dupla (Zero Trust Fetching)
    const [userResponse, logsResponse] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.schema('admin').from('audit_logs').select('*').eq('target_id', userId).order('created_at', { ascending: false }).limit(20)
    ]);

    if (userResponse.data) {
      const data = userResponse.data;
      data.custom_data = {
        personal_info: data.custom_data?.personal_info || {},
        permissions: data.custom_data?.permissions || {},
        preferences: data.custom_data?.preferences || { ads_enabled: true, profile_promoted: false, focus_mode: false, hide_metrics: false },
        system_flags: data.custom_data?.system_flags || {}
      };
      setUser(data);
    }

    if (logsResponse.data) {
      setAuditLogs(logsResponse.data);
    }

    setLoading(false);
  };

  const updatePreference = async (key: string, value: boolean) => {
    if (!user) return;
    setIsUpdating(true);
    
    const updatedCustomData = { 
      ...user.custom_data, 
      preferences: { ...user.custom_data.preferences, [key]: value } 
    };
    
    const { error } = await supabase.from('profiles').update({ custom_data: updatedCustomData }).eq('id', user.id);
    
    if (!error) {
      setUser({ ...user, custom_data: updatedCustomData });
    } else {
      alert("Falha ao actualizar preferência na Base de Dados Central.");
    }
    
    setIsUpdating(false);
  };

  const toggleAccountStatus = async () => {
    if (!user) return;
    setIsUpdating(true);
    const newStatus = !user.is_active;
    
    const { error } = await supabase.from('profiles').update({ is_active: newStatus }).eq('id', user.id);
    
    if (!error) {
      setUser({ ...user, is_active: newStatus });
      await supabase.schema('admin').from('audit_logs').insert({ 
        target_id: user.id, 
        action: newStatus ? 'ACCOUNT_REACTIVATED' : 'ACCOUNT_SUSPENDED', 
        details: { triggered_via: 'Admin Dashboard Horizon Clarity' } 
      });
    } else {
      alert("Falha ao alterar o status da conta.");
    }
    
    setIsUpdating(false);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
      <span className="text-[10px] font-bold tracking-widest uppercase text-[#545454]">A Sincronizar Identidade no Ecossistema...</span>
    </div>
  );
  
  if (!user) return (
    <div className="p-20 text-center text-[#B6192E] font-bold border border-[#B6192E] bg-red-50 rounded-[16px] max-w-2xl mx-auto mt-20">
      IDENTIDADE NÃO ENCONTRADA NO REGISTO CENTRAL DO HORAZION.
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-24 animate-in fade-in duration-700">
      
      {/* HEADER CORPORATE */}
      <header className="flex items-start justify-between border-b border-[#F2F2F2] pb-10 mb-10 mt-8">
        <div className="flex gap-8">
          <div className="w-24 h-24 rounded-[16px] bg-[#FAFAFA] border border-[#E5E5E5] flex items-center justify-center text-3xl font-bold text-black shadow-sm">
            {user.full_name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="px-2 py-1 bg-[#F2F2F2] text-black text-[10px] font-bold uppercase tracking-widest rounded-[6px]">
                {user.role}
              </span>
              <span className={clsx("px-2 py-1 border text-[10px] font-bold uppercase tracking-widest rounded-[6px] flex items-center gap-2", user.is_active ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200")}>
                <span className={clsx("w-1.5 h-1.5 rounded-full", user.is_active ? "bg-green-500 animate-pulse" : "bg-red-500")} /> 
                {user.is_active ? 'SISTEMA ATIVO' : 'SESSÃO SUSPENSA'}
              </span>
              <span className="px-2 py-1 bg-[#FAFAFA] border border-[#E5E5E5] text-[#545454] text-[10px] font-bold uppercase tracking-widest rounded-[6px]">
                {user.horizion_id}
              </span>
            </div>
            <h1 className="text-4xl font-bold text-black tracking-tighter leading-none">{user.full_name}</h1>
            <p className="text-[#545454] mt-3 text-sm">{user.email}</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 items-end">
          <HzButton variant="primary" isLoading={isUpdating} onClick={toggleAccountStatus} className={clsx("h-10 px-6 !text-xs !font-bold rounded-[8px]", user.is_active ? "bg-[#B6192E] hover:bg-black text-white border-none" : "bg-black text-white")}>
            {user.is_active ? 'Suspender Credenciais' : 'Restaurar Acesso'}
          </HzButton>
          <span className="text-[10px] text-[#A0A0A0] uppercase tracking-widest font-mono">
            Último Login: {user.last_login_at ? new Date(user.last_login_at).toLocaleString('pt-BR') : 'NUNCA'}
          </span>
        </div>
      </header>

      {/* TABS DE NAVEGAÇÃO DA ARQUITETURA */}
      <div className="flex gap-8 border-b border-[#F2F2F2] mb-10 overflow-x-auto scrollbar-hide">
        {[
          { id: 'overview', label: '01. Identidade & Contexto' },
          { id: 'settings', label: '02. Controlo de Algoritmo' },
          { id: 'security', label: '03. Auditoria Core' },
          { id: 'association', label: '05. Associação' },
          { id: 'raw', label: '04. Data Explorer (JSON)' }
        ].map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id as any)} 
            className={clsx("pb-4 text-[11px] font-bold uppercase tracking-widest transition-all whitespace-nowrap", activeTab === tab.id ? "text-black border-b-2 border-black" : "text-[#A0A0A0] hover:text-black")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* RENDERIZAÇÃO DOS MÓDULOS (INJEÇÃO DE DEPENDÊNCIAS) */}
      {activeTab === 'overview' && <UserOverviewTab user={user} />}
      {activeTab === 'settings' && <UserSettingsTab user={user} updatePreference={updatePreference} />}
      {activeTab === 'security' && <UserSecurityTab auditLogs={auditLogs} />}
      {activeTab === 'association' && <UserAffiliationsTab userId={user.id} />}
      {activeTab === 'raw' && <UserDataTab user={user} />}

    </div>
  );
}