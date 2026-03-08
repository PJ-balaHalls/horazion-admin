'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { HzButton } from '@/components/ui/HzButton';
import { HzGeoMap } from '@/components/ui/HzGeoMap';
import { supabase } from '@/lib/supabase';

const StarIcon = () => (
  <svg className="w-3 h-3 inline-block mr-1 text-[#000000]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

// [CORE-HZ-008] Tipagem atualizada: params agora é uma Promise no Next.js 15+
export default function UserDetailView({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  
  // Desempacota a Promise exigida pela nova arquitetura do Next.js
  const resolvedParams = use(params);
  const userId = resolvedParams.id;

  const [activeTab, setActiveTab] = useState<'overview' | 'security' | 'logs'>('overview');
  const [user, setUser] = useState<any>(null);
  const [userLogs, setUserLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRealUserData() {
      setIsLoading(true);
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileError) throw profileError;

        const { data: logsData } = await supabase
          .from('audit_logs')
          .select('*')
          .eq('target_id', userId)
          .order('created_at', { ascending: false });

        setUser(profileData);
        setUserLogs(logsData || []);
      } catch (error) {
        console.error('[HZ-SYS_004] Erro ao carregar detalhes da identidade:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (userId) {
      fetchRealUserData();
    }
  }, [userId]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#F2F2F2] border-t-[#000000] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center">
        <h2 className="text-xl font-bold text-[#000000]">Identidade Não Encontrada</h2>
        <p className="text-sm text-[#545454] mt-2">O registro procurado não existe no Supabase.</p>
        <HzButton variant="secondary" className="mt-4" onClick={() => router.push('/users/list')}>Voltar à Lista</HzButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full animate-fade-in">
      <div className="w-full lg:w-80 flex flex-col gap-6">
        <div className="bg-white border border-[#F2F2F2] p-6 shadow-sm">
          <div className="flex flex-col items-center text-center border-b border-[#F2F2F2] pb-6 mb-6">
            <div className="w-20 h-20 bg-white border border-[#F2F2F2] flex items-center justify-center mb-4 rounded-none">
              <span className="text-2xl text-[#000000] font-bold uppercase">{user.full_name?.charAt(0)}</span>
            </div>
            <h2 className="text-lg font-bold text-[#000000] tracking-tight">{user.full_name}</h2>
            <p className="text-xs font-bold text-[#545454] uppercase tracking-widest mt-1 mb-3">{user.horizion_id}</p>
            <div className="px-3 py-1 bg-white border border-[#F2F2F2] inline-flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-[#000000]">
                <StarIcon /> {user.role}
              </span>
            </div>
          </div>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-[#545454] font-medium text-xs uppercase tracking-wider">Estado</span>
              {user.is_active ? (
                <span className="text-[#000000] font-bold flex items-center gap-1 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span> Ativo
                </span>
              ) : (
                <span className="text-[#000000] font-bold flex items-center gap-1 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B6192E]"></span> Suspenso
                </span>
              )}
            </div>
            <div className="flex justify-between">
              <span className="text-[#545454] font-medium text-xs uppercase tracking-wider">Registo</span>
              <span className="text-[#000000] font-medium text-xs">
                {new Date(user.created_at).toLocaleDateString('pt-PT')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#545454] font-medium text-xs uppercase tracking-wider">E-mail</span>
              <span className="text-[#000000] font-medium text-xs truncate max-w-[120px]" title={user.email}>
                {user.email || 'Não informado'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#F2F2F2] p-6 shadow-sm">
          <h3 className="text-[10px] font-bold text-[#545454] uppercase tracking-wider mb-4">Ações de Gestão</h3>
          <div className="space-y-3">
            <HzButton variant="secondary" className="w-full justify-start text-[10px]">Alterar Nível Estelar</HzButton>
            <HzButton variant="danger" className="w-full justify-start text-[10px]">Suspender Conta</HzButton>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white border border-[#F2F2F2] shadow-sm overflow-hidden">
        <div className="flex border-b border-[#F2F2F2] px-6 pt-4 gap-6 bg-white">
          {['overview', 'security', 'logs'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-4 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                activeTab === tab 
                  ? 'text-[#000000] border-b-2 border-[#000000]' 
                  : 'text-[#545454] hover:text-[#000000]'
              }`}
            >
              {tab === 'overview' ? 'Visão Geral' : tab === 'security' ? 'Segurança' : 'Auditoria'}
            </button>
          ))}
        </div>

        <div className="p-8 flex-1 overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-sm font-bold text-[#000000] mb-4 uppercase tracking-widest">Painel Geográfico</h3>
                <div className="w-full h-64 border border-[#F2F2F2] bg-[#FAFAFA]">
                  <HzGeoMap zoom={2} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-[#000000] uppercase tracking-widest">Verificações (Zero Trust)</h3>
              <div className="border border-[#F2F2F2] divide-y divide-[#F2F2F2]">
                <div className="p-4 flex justify-between items-center bg-white">
                  <div>
                    <p className="text-xs font-bold text-[#000000] uppercase tracking-wider">Identidade Central (HorizionID)</p>
                    <p className="text-[10px] text-[#545454] uppercase mt-1">Status de propagação</p>
                  </div>
                  <span className="px-3 py-1 bg-white border border-[#F2F2F2] text-[10px] font-bold text-[#000000] uppercase">Sincronizado</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-[#000000] uppercase tracking-widest">Auditoria de Ações da Conta</h3>
              <div className="border border-[#F2F2F2] overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-white border-b border-[#F2F2F2]">
                    <tr>
                      <th className="p-4 text-[10px] font-bold text-[#545454] uppercase tracking-wider">Data/Hora</th>
                      <th className="p-4 text-[10px] font-bold text-[#545454] uppercase tracking-wider">Ação Executada</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2F2F2] text-sm text-[#000000] bg-white">
                    {userLogs.length > 0 ? (
                      userLogs.map(log => (
                        <tr key={log.id}>
                          <td className="p-4 text-[10px] text-[#545454] uppercase">
                            {new Date(log.created_at).toLocaleString('pt-PT')}
                          </td>
                          <td className="p-4 text-xs font-medium">{log.action}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} className="p-8 text-center text-[10px] text-[#545454] uppercase tracking-widest">
                          Nenhum registro de auditoria encontrado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}