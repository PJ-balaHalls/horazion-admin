'use client';

import React, { useEffect, useState } from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { HzButton } from '@/components/ui/HzButton';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// SVGs Técnicos minimalistas e rigorosos
const StarIcon = () => (
  <svg className="w-3.5 h-3.5 inline-block mr-1 text-[#000000]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-4 h-4 text-[#000000]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

export default function DashboardOverview() {
  const { user } = useAuthGuard();
  const router = useRouter();
  
  const [analytics, setAnalytics] = useState({
    total_users: 0,
    active_today: 0,
    verified_users: 0,
    total_banned: 0
  });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAbsoluteRealData() {
      setIsLoading(true);
      try {
        // 1. Chama a RPC no banco de dados que calcula os Analytics exatos
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_dashboard_analytics');
        if (!rpcError && rpcData) {
          setAnalytics(rpcData);
        }

        // 2. Busca os últimos 5 logs reais de sistema
        const { data: logsData } = await supabase
          .from('audit_logs')
          .select('id, action, ip_address, created_at')
          .order('created_at', { ascending: false })
          .limit(5);

        setRecentLogs(logsData || []);
      } catch (error) {
        console.error('[HZ-SYS_002] Erro de rede ao buscar dados reais:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAbsoluteRealData();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Cabeçalho de Comando */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[12px] border border-[#F2F2F2]">
        <div>
          <h1 className="text-2xl font-bold text-[#000000] tracking-tight">
            Painel Central, {user?.full_name?.split(' ')[0] || 'Líder'}.
          </h1>
          <p className="text-sm text-[#545454] mt-1 flex items-center">
            Autoridade operante: <StarIcon /> <span className="font-bold text-[#000000] uppercase ml-1">{user?.star_role}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <HzButton variant="secondary" onClick={() => router.push('/users/list')}>
            Gestão Integral de Identidades
          </HzButton>
        </div>
      </div>

      {/* Grid de Analytics Reais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[12px] border border-[#F2F2F2] flex flex-col justify-between h-32">
          <h3 className="text-[10px] font-bold text-[#545454] uppercase tracking-wider">Identidades Totais</h3>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-[#000000]">
              {isLoading ? '...' : analytics.total_users.toLocaleString('pt-PT')}
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[12px] border border-[#F2F2F2] flex flex-col justify-between h-32">
          <h3 className="text-[10px] font-bold text-[#545454] uppercase tracking-wider">Ativos (Últimas 24h)</h3>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-[#000000]">
              {isLoading ? '...' : analytics.active_today.toLocaleString('pt-PT')}
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[12px] border border-[#F2F2F2] flex flex-col justify-between h-32">
          <h3 className="text-[10px] font-bold text-[#545454] uppercase tracking-wider">Contas Verificadas</h3>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-[#000000]">
              {isLoading ? '...' : analytics.verified_users.toLocaleString('pt-PT')}
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[12px] border border-[#F2F2F2] flex flex-col justify-between h-32">
          <h3 className="text-[10px] font-bold text-[#B6192E] uppercase tracking-wider">Banimentos Ativos</h3>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-[#B6192E]">
              {isLoading ? '...' : analytics.total_banned.toLocaleString('pt-PT')}
            </span>
          </div>
        </div>
      </div>

      {/* Tabela de Logs (Zero Trust) */}
      <div className="bg-white rounded-[12px] border border-[#F2F2F2] overflow-hidden">
        <div className="p-6 border-b border-[#F2F2F2] flex items-center gap-2">
          <ShieldIcon />
          <h2 className="text-sm font-bold text-[#000000] uppercase tracking-widest">Auditoria de Segurança (Tempo Real)</h2>
        </div>
        
        <div className="divide-y divide-[#F2F2F2]">
          {isLoading ? (
            <div className="p-8 text-center text-[10px] text-[#545454] uppercase tracking-widest font-bold">A extrair dados do Core...</div>
          ) : recentLogs.length > 0 ? (
            recentLogs.map((log) => (
              <div key={log.id} className="p-4 flex items-center justify-between hover:bg-[#FAFAFA] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#000000]"></div>
                  <div>
                    <p className="text-sm font-bold text-[#000000]">{log.action}</p>
                    <p className="text-[10px] text-[#545454] uppercase tracking-wider mt-0.5">Origem: {log.ip_address || 'Rede Interna'}</p>
                  </div>
                </div>
                <span className="text-[10px] text-[#545454] font-bold uppercase tracking-widest">
                  {new Date(log.created_at).toLocaleDateString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          ) : (
            <div className="p-8 text-center bg-white">
              <p className="text-[10px] text-[#545454] font-bold uppercase tracking-widest">A base de dados de auditoria está vazia.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}