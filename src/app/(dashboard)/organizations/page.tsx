'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { entityService } from '@/services/entityService';
import { HzButton, HzBadge, HzSkeleton } from '@/components/ui';
import { BuildingOfficeIcon, PlusIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { CreateEntityWizard } from '@/components/organizations/CreateEntityModal'; // Renomeado conceitualmente

// FE-HZ-009: Alinhamento de Contratos e SPA (Single Page Application)
// O Wizard agora ocupa o espaço da listagem, respeitando a Sidebar e o Header globais.

export default function OrganizationsPage() {
  const router = useRouter();
  const [entities, setEntities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false); // Substitui o conceito de 'modal'

  const load = () => {
    setLoading(true);
    entityService.getEntities()
      .then(setEntities)
      .catch((err) => console.error('Erro ao carregar entidades:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSaveEntity = async (formData: any) => {
    try {
      await entityService.createEntity(formData);
      setIsCreating(false);
      load();
    } catch (error) {
      console.error('Falha estrutural ao salvar entidade:', error);
      throw error;
    }
  };

  // Modo SPA: Se estiver criando, renderiza apenas o Wizard ocupando o contêiner
  if (isCreating) {
    return (
      <div className="h-[calc(100vh-80px)] p-6 bg-gray-50/50">
        <CreateEntityWizard 
          onClose={() => setIsCreating(false)} 
          onSave={handleSaveEntity} 
        />
      </div>
    );
  }

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-10 animate-in fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter text-black">Grafo de Organizações</h1>
          <p className="text-gray-500 text-sm mt-2">Gestão de identidades corporativas e subsidiárias.</p>
        </div>
        <HzButton 
          onClick={() => setIsCreating(true)} 
          className="bg-[#E50000] hover:bg-red-700 text-white flex gap-2 items-center px-4 py-2 rounded-xl transition-colors shadow-md"
        >
          <PlusIcon className="w-5 h-5"/> Nova Entidade
        </HzButton>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <HzSkeleton key={idx} className="h-48 w-full rounded-[24px]" />
          ))
        ) : entities.map(ent => (
          <div key={ent.id} className="bg-white border border-gray-100 p-6 rounded-[24px] hover:shadow-xl hover:border-gray-200 transition-all duration-300 group flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 overflow-hidden">
                  {ent.logo_url ? <img src={ent.logo_url} className="w-full h-full object-cover" /> : <BuildingOfficeIcon className="w-6 h-6 text-gray-300"/>}
                </div>
                <HzBadge variant={ent.status === 'active' ? 'success' : 'warning'}>
                  {ent.category || 'Organização'}
                </HzBadge>
              </div>
              <h3 className="text-xl font-bold truncate text-black">{ent.display_name}</h3>
              <p className="text-[10px] font-mono text-gray-400 mt-1 uppercase tracking-wider">{ent.slug}</p>
            </div>
            
            <HzButton variant="ghost" onClick={() => router.push(`/organizations/${ent.id}`)} className="w-full mt-6 justify-between border border-gray-200 text-gray-600 hover:text-black">
              Gerir Entidade <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </HzButton>
          </div>
        ))}
      </div>
    </div>
  );
}