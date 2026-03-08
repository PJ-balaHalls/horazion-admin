'use client';

import React from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { HzButton } from '@/components/ui/HzButton';
import { useRouter } from 'next/navigation';

export default function DashboardOverview() {
  const { user } = useAuthGuard();
  const router = useRouter();

  // Dados mockados para ilustrar a arquitetura visual
  const metrics = [
    { label: 'Total de Identidades (Users)', value: '142.893', trend: '+12%', status: 'positive' },
    { label: 'Criadores Verificados (Polaris)', value: '1.204', trend: '+5%', status: 'positive' },
    { label: 'Denúncias Pendentes', value: '38', trend: '-2%', status: 'warning' },
    { label: 'Uptime do Core (Supabase)', value: '99.99%', trend: 'Estável', status: 'neutral' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Cabeçalho de Boas-vindas */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[12px] border border-[#F2F2F2] shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#000000] tracking-tight">
            Bem-vindo ao Centro de Comando, {user?.full_name?.split(' ')[0] || 'Líder'}.
          </h1>
          <p className="text-sm text-[#545454] mt-1">
            Você está operando sob a autoridade <span className="font-bold text-[#000000] uppercase">⭐ {user?.star_role}</span>.
          </p>
        </div>
        <div className="flex gap-3">
          <HzButton variant="secondary" onClick={() => router.push('/users/list')}>
            Gerir Usuários
          </HzButton>
          <HzButton variant="primary" onClick={() => router.push('/settings/system')}>
            Matriz de Permissões
          </HzButton>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white p-6 rounded-[12px] border border-[#F2F2F2] shadow-sm flex flex-col justify-between h-32">
            <h3 className="text-[10px] font-bold text-[#545454] uppercase tracking-wider">
              {metric.label}
            </h3>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-[#000000]">{metric.value}</span>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                metric.status === 'positive' ? 'bg-[#FAFAFA] text-[#10B981] border border-[#F2F2F2]' :
                metric.status === 'warning' ? 'bg-[#FAFAFA] text-[#F59E0B] border border-[#F2F2F2]' :
                'bg-[#FAFAFA] text-[#545454] border border-[#F2F2F2]'
              }`}>
                {metric.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Seção de Alertas do Sistema */}
      <div className="bg-white rounded-[12px] border border-[#F2F2F2] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#F2F2F2] bg-[#FAFAFA]">
          <h2 className="text-sm font-bold text-[#000000] uppercase tracking-widest">Logs de Segurança Recentes</h2>
        </div>
        <div className="divide-y divide-[#F2F2F2]">
          {[1, 2, 3].map((log) => (
            <div key={log} className="p-4 flex items-center justify-between hover:bg-[#FAFAFA] transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-[#B6192E]"></div>
                <div>
                  <p className="text-sm font-bold text-[#000000]">Tentativa de acesso bloqueada (Zero Trust)</p>
                  <p className="text-xs text-[#545454]">IP: 192.168.x.x tentou forçar login em conta Canopus.</p>
                </div>
              </div>
              <span className="text-xs text-[#545454] font-medium">Há 10 minutos</span>
            </div>
          ))}
        </div>
        <div className="p-4 bg-[#FAFAFA] border-t border-[#F2F2F2] text-center">
          <button className="text-[10px] font-bold text-[#000000] uppercase tracking-widest hover:text-[#B6192E] transition-colors">
            Ver Todos os Logs →
          </button>
        </div>
      </div>
    </div>
  );
}