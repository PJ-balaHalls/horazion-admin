'use client';

import React, { useEffect, useState } from 'react';
import { entityService } from '@/services/entityService';

// IMPORTAÇÕES DIRECTAS
import { HzButton } from '@/components/ui/HzButton';
import { HzBadge } from '@/components/ui/HzBadge';
import { HzSwitch } from '@/components/ui/HzSwitch';

import { CheckBadgeIcon, SparklesIcon, PlusIcon, ShieldCheckIcon, BeakerIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';

export function UserAffiliationsTab({ userId }: { userId: string }) {
  const [affiliations, setAffiliations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await entityService.getUserAffiliations(userId);
        setAffiliations(data || []);
      } catch (error: any) {
        toast.error(error?.user_message || "Falha ao sincronizar o Grafo de Relacionamentos.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [userId]);

  const togglePrivacy = async (affiliationId: string, currentSettings: any, key: string) => {
    const nextSettings = { ...currentSettings, [key]: !currentSettings[key] };
    
    setAffiliations(prev => 
      prev.map(a => a.id === affiliationId ? { ...a, privacy_settings: nextSettings } : a)
    );

    try {
      await entityService.updatePrivacy(affiliationId, nextSettings);
      toast.success("Regras de privacidade (LGPD) actualizadas com sucesso.");
    } catch (error: any) {
      setAffiliations(prev => 
        prev.map(a => a.id === affiliationId ? { ...a, privacy_settings: currentSettings } : a)
      );
      toast.error(error?.user_message || "Falha de segurança ao actualizar preferência. Acção revertida.");
    }
  };

  // Mapeamento dinâmico de ícones para a Engine de Benefícios
  const getBenefitIcon = (key: string) => {
    if (key.includes('premium')) return <SparklesIcon className="w-4 h-4 text-[#B6192E]" />;
    if (key.includes('library')) return <AcademicCapIcon className="w-4 h-4 text-[#B6192E]" />;
    if (key.includes('badge')) return <BeakerIcon className="w-4 h-4 text-[#B6192E]" />;
    return <ShieldCheckIcon className="w-4 h-4 text-[#B6192E]" />;
  };

  if (loading) {
    return (
      <div className="p-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] font-bold tracking-widest uppercase text-[#545454] animate-pulse">
          A aceder aos Tokens de Afiliação...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="flex justify-between items-center mb-8 border-b border-[#F2F2F2] pb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tighter text-black">Tokens e Associações</h2>
          <p className="text-xs text-[#545454] font-inter mt-1">Gestão de vínculos corporativos e herança de benefícios.</p>
        </div>
        <HzButton variant="secondary" className="h-8 !px-4 !text-[10px] bg-white">Conceder Novo Token</HzButton>
      </div>

      {affiliations.length === 0 ? (
        <div className="border-2 border-dashed border-[#E5E5E5] rounded-[24px] p-16 text-center bg-[#FAFAFA]">
          <p className="text-[#545454] text-sm mb-6 font-inter">Este Horizion ID não possui filiação ativa a nenhuma entidade.</p>
          <HzButton className="mx-auto bg-[#B6192E] text-white hover:bg-black transition-colors shadow-sm">
            <PlusIcon className="w-4 h-4 mr-2" /> Vincular a Organização
          </HzButton>
        </div>
      ) : (
        affiliations.map(aff => (
          <div key={aff.id} className="bg-white border border-[#F2F2F2] rounded-[24px] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            
            {/* HEADER DA AFILIAÇÃO */}
            <div className="bg-[#FAFAFA] p-6 flex justify-between items-center border-b border-[#F2F2F2]">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-white rounded-[16px] border border-[#E5E5E5] flex items-center justify-center overflow-hidden shadow-sm">
                  {aff.entity?.logo_url ? (
                    <img src={aff.entity.logo_url} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-black text-lg text-[#A0A0A0]">
                      {aff.entity?.display_name?.substring(0, 2).toUpperCase() || 'HZ'}
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-bold text-black uppercase text-sm tracking-tight">
                      {aff.entity?.display_name || 'Entidade Desconhecida'}
                    </span>
                    {aff.entity?.is_verified && <CheckBadgeIcon className="w-5 h-5 text-blue-500" title="Verificado" />}
                  </div>
                  <HzBadge variant="info" className="!text-[9px] uppercase tracking-widest">{aff.role}</HzBadge>
                </div>
              </div>
              <div className="text-right">
                <HzBadge variant="success" className="px-3 py-1 mb-2">VÍNCULO ACTIVO</HzBadge>
                <p className="text-[9px] text-[#A0A0A0] font-mono">Desde: {new Date(aff.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            
            {/* BODY: BENEFÍCIOS E PRIVACIDADE */}
            <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
              
              {/* Benefícios Herdados */}
              <div>
                <h3 className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest mb-4">Benefícios Herdados (Engine)</h3>
                <div className="space-y-3">
                  {aff.entity?.metadata?.benefits_engine ? (
                    Object.entries(aff.entity.metadata.benefits_engine).map(([key, isGranted]) => (
                      isGranted && (
                        <div key={key} className="flex gap-3 items-center p-3 rounded-[12px] border border-[#F2F2F2] bg-[#FAFAFA]">
                          {getBenefitIcon(key)}
                          <span className="text-xs font-bold text-black capitalize">
                            {key.replace(/_/g, ' ')}
                          </span>
                        </div>
                      )
                    ))
                  ) : (
                    <p className="text-xs text-[#A0A0A0] italic">A entidade não emite benefícios globais.</p>
                  )}
                </div>
              </div>

              {/* Controlos LGPD */}
              <div className="bg-[#FAFAFA] p-6 rounded-[16px] border border-[#F2F2F2]">
                <h3 className="text-xs font-bold text-black uppercase tracking-tight mb-4 border-b border-[#E5E5E5] pb-2">
                  Privacidade Granular (LGPD)
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-bold text-[#545454]">Métricas de Progresso</span>
                      <span className="block text-[9px] text-[#A0A0A0] mt-0.5">Partilhar com a organização</span>
                    </div>
                    <HzSwitch 
                      checked={aff.privacy_settings?.share_metrics || false} 
                      onChange={() => togglePrivacy(aff.id, aff.privacy_settings || {}, 'share_metrics')} 
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-bold text-[#545454]">Selo Público no Perfil</span>
                      <span className="block text-[9px] text-[#A0A0A0] mt-0.5">Visível no Life (Rede Social)</span>
                    </div>
                    <HzSwitch 
                      checked={aff.privacy_settings?.public_badge ?? true} 
                      onChange={() => togglePrivacy(aff.id, aff.privacy_settings || {}, 'public_badge')} 
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        ))
      )}
    </div>
  );
}