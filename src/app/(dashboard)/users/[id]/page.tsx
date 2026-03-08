'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { HzGeoMap } from '@/components/ui/HzGeoMap';
import { supabase } from '@/lib/supabase';

// Ícones minimalistas
const StarIcon = () => (
  <svg className="w-3.5 h-3.5 inline-block mr-1 text-[#000000]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const MailIcon = () => (
  <svg className="w-4 h-4 text-[#545454]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const MapPinIcon = () => (
  <svg className="w-4 h-4 text-[#545454]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export default function UserDetailView({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const userId = resolvedParams.id;

  const [activeTab, setActiveTab] = useState<'inteligencia' | 'seguranca' | 'auditoria'>('inteligencia');
  const [user, setUser] = useState<any>(null);
  const [userLogs, setUserLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRealUserData() {
      setIsLoading(true);
      try {
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', userId).single();
        const { data: logsData } = await supabase.from('audit_logs').select('*').eq('target_id', userId).order('created_at', { ascending: false });

        setUser(profileData);
        setUserLogs(logsData || []);
      } catch (error) {
        console.error('Erro de rede:', error);
      } finally {
        setIsLoading(false);
      }
    }
    if (userId) fetchRealUserData();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <div className="w-10 h-10 border-2 border-[#F2F2F2] border-t-[#000000] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center bg-white">
        <h2 className="text-2xl font-bold text-[#000000]">Identidade Expurgada</h2>
        <p className="text-sm text-[#545454] mt-2">O registro procurado não existe no banco de dados.</p>
        <button className="mt-6 px-6 py-2 border border-[#000000] text-xs font-bold uppercase tracking-widest" onClick={() => router.push('/users/list')}>Voltar</button>
      </div>
    );
  }

  // Verifica se o usuário tem coordenadas. Se não, centraliza genérico
  const hasLocation = user.lat && user.lng;
  const mapMarkers = hasLocation ? [{ id: user.id, lat: Number(user.lat), lng: Number(user.lng) }] : [];

  return (
    <div className="flex flex-col h-full bg-white animate-fade-in pb-12">
      
      {/* =========================================
          CABEÇALHO DE PERFIL (PURE WHITE)
      ========================================= */}
      <div className="w-full border-b border-[#F2F2F2] px-8 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 border border-[#000000] flex items-center justify-center">
            <span className="text-4xl text-[#000000] font-bold uppercase">{user.full_name?.charAt(0) || '?'}</span>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-[#000000] tracking-tight">{user.full_name}</h1>
              <span className="px-3 py-1 border border-[#F2F2F2] text-[10px] font-bold text-[#000000] uppercase tracking-wider inline-flex items-center">
                <StarIcon /> {user.role}
              </span>
            </div>
            <p className="text-sm font-mono font-bold text-[#545454] tracking-widest">{user.horizion_id}</p>
            
            <div className="flex items-center gap-6 mt-4">
              <span className="flex items-center gap-2 text-xs font-medium text-[#000000]">
                <MailIcon /> {user.email || 'E-mail não registado'}
              </span>
              <span className="flex items-center gap-2 text-xs font-medium text-[#000000]">
                <MapPinIcon /> {user.city ? `${user.city}, ${user.country}` : 'Localização Pendente'}
              </span>
            </div>
          </div>
        </div>

        {/* Botões de Ação Imediata */}
        <div className="flex flex-col gap-2 w-full md:w-auto">
          {user.is_active ? (
            <button className="px-6 py-3 border border-[#B6192E] text-[#B6192E] text-[10px] font-bold uppercase tracking-widest hover:bg-[#B6192E] hover:text-white transition-colors">
              Suspender Operação
            </button>
          ) : (
            <button className="px-6 py-3 border border-[#10B981] text-[#10B981] text-[10px] font-bold uppercase tracking-widest hover:bg-[#10B981] hover:text-white transition-colors">
              Restaurar Acesso
            </button>
          )}
          <button className="px-6 py-3 bg-[#000000] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-opacity-80 transition-colors">
            Editar Propriedades
          </button>
        </div>
      </div>

      {/* =========================================
          CORPO CENTRAL: ABAS DE NAVEGAÇÃO
      ========================================= */}
      <div className="flex border-b border-[#F2F2F2] px-8 pt-6 gap-8">
        {[
          { id: 'inteligencia', label: 'Inteligência & Tracking' },
          { id: 'seguranca', label: 'Matriz de Segurança' },
          { id: 'auditoria', label: 'Auditoria (Zero Trust)' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 text-[10px] font-bold uppercase tracking-widest transition-all ${
              activeTab === tab.id 
                ? 'text-[#000000] border-b-2 border-[#000000]' 
                : 'text-[#545454] hover:text-[#000000]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* =========================================
          CONTEÚDO DINÂMICO DA ABA
      ========================================= */}
      <div className="p-8 max-w-7xl mx-auto w-full">
        
        {activeTab === 'inteligencia' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Coluna Esquerda: Dados Rápidos */}
            <div className="space-y-8">
              <div className="border border-[#F2F2F2] p-6">
                <h3 className="text-[10px] font-bold text-[#545454] uppercase tracking-wider mb-6">Status da Conexão</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-end border-b border-[#F2F2F2] pb-2">
                    <span className="text-xs font-medium text-[#545454]">Acesso ao Ecossistema</span>
                    <span className={user.is_active ? "text-xs font-bold text-[#10B981]" : "text-xs font-bold text-[#B6192E]"}>
                      {user.is_active ? 'AUTORIZADO' : 'BLOQUEADO'}
                    </span>
                  </div>
                  <div className="flex justify-between items-end border-b border-[#F2F2F2] pb-2">
                    <span className="text-xs font-medium text-[#545454]">Data de Ingresso</span>
                    <span className="text-xs font-bold text-[#000000]">{new Date(user.created_at).toLocaleDateString('pt-PT')}</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-[#F2F2F2] pb-2">
                    <span className="text-xs font-medium text-[#545454]">Última Sincronização</span>
                    <span className="text-xs font-bold text-[#000000]">{user.last_login_at ? new Date(user.last_login_at).toLocaleDateString('pt-PT') : 'Nunca'}</span>
                  </div>
                </div>
              </div>

              <div className="border border-[#F2F2F2] p-6">
                <h3 className="text-[10px] font-bold text-[#545454] uppercase tracking-wider mb-4">Promover Nível Estelar</h3>
                <p className="text-xs text-[#545454] mb-4">Alterar a autoridade deste utilizador afetará os seus acessos globalmente.</p>
                <button className="w-full py-3 border border-[#000000] text-[10px] font-bold text-[#000000] uppercase tracking-widest hover:bg-[#000000] hover:text-white transition-all">
                  Gerir Permissões
                </button>
              </div>
            </div>

            {/* Coluna Direita: Mapa de Tracking Focado */}
            <div className="col-span-1 lg:col-span-2 flex flex-col">
              <h3 className="text-[10px] font-bold text-[#545454] uppercase tracking-wider mb-4">Tracking Geográfico</h3>
              <div className="w-full flex-1 min-h-[400px] border border-[#F2F2F2] bg-white relative">
                {hasLocation ? (
                  <HzGeoMap markers={mapMarkers} zoom={13} />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                    <MapPinIcon />
                    <span className="text-[10px] text-[#000000] font-bold uppercase tracking-widest mt-4">Localização Não Registada</span>
                    <span className="text-xs text-[#545454] mt-1">O utilizador não forneceu coordenadas ou ainda não acedeu ao sistema.</span>
                    <HzGeoMap zoom={2} /> {/* Renderiza o mapa base ao fundo */}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'seguranca' && (
          <div className="max-w-3xl space-y-6">
            <h3 className="text-sm font-bold text-[#000000] uppercase tracking-widest mb-6">Validações Zero Trust</h3>
            
            <div className="border border-[#F2F2F2] p-6 flex justify-between items-center">
              <div>
                <p className="text-sm font-bold text-[#000000]">E-mail Verificado</p>
                <p className="text-xs text-[#545454] mt-1">Confirmação criptográfica do endereço de correio.</p>
              </div>
              <button className="px-4 py-2 border border-[#F2F2F2] text-[10px] font-bold uppercase hover:border-[#000000]">Forçar Verificação</button>
            </div>

            <div className="border border-[#F2F2F2] p-6 flex justify-between items-center">
              <div>
                <p className="text-sm font-bold text-[#000000]">Autenticação 2FA</p>
                <p className="text-xs text-[#545454] mt-1">Proteção contra roubo de sessão.</p>
              </div>
              <span className="text-xs font-bold text-[#B6192E]">DESATIVADO</span>
            </div>

            <div className="border border-[#F2F2F2] p-6 flex justify-between items-center">
              <div>
                <p className="text-sm font-bold text-[#000000]">Selo KYC (Conheça o Cliente)</p>
                <p className="text-xs text-[#545454] mt-1">Documentação legal submetida e aprovada pela Moderação.</p>
              </div>
              <button className="px-4 py-2 bg-[#000000] text-white text-[10px] font-bold uppercase">Analisar Documentos</button>
            </div>
          </div>
        )}

        {activeTab === 'auditoria' && (
          <div className="w-full">
            <h3 className="text-sm font-bold text-[#000000] uppercase tracking-widest mb-6">Log de Eventos (Imutável)</h3>
            <div className="border border-[#F2F2F2]">
              <table className="w-full text-left">
                <thead className="border-b border-[#F2F2F2]">
                  <tr>
                    <th className="p-4 text-[10px] font-bold text-[#545454] uppercase tracking-wider">Data / Hora (UTC)</th>
                    <th className="p-4 text-[10px] font-bold text-[#545454] uppercase tracking-wider">Ação Registada</th>
                    <th className="p-4 text-[10px] font-bold text-[#545454] uppercase tracking-wider">Agente / IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2F2F2]">
                  {userLogs.length > 0 ? (
                    userLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#FAFAFA] transition-colors">
                        <td className="p-4 text-[10px] font-mono text-[#545454]">{new Date(log.created_at).toLocaleString('pt-PT')}</td>
                        <td className="p-4 text-xs font-bold text-[#000000]">{log.action}</td>
                        <td className="p-4 text-xs text-[#545454]">{log.ip_address || 'Serviço Core'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-[10px] text-[#545454] font-bold uppercase tracking-widest">
                        Nenhum rastro de auditoria encontrado.
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
  );
}