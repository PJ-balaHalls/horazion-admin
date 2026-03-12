'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { entityService } from '@/services/entityService';
import { HzButton } from '@/components/ui/HzButton';
import { HzBadge } from '@/components/ui/HzBadge';
import { BuildingOfficeIcon, PlusIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { CreateEntityModal } from '@/components/organizations/CreateEntityModal';

export default function OrganizationsPage() {
  const router = useRouter();
  const [entities, setEntities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);

  const load = () => {
    setLoading(true);
    entityService.getEntities().then(setEntities).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter">Grafo de Organizações</h1>
          <p className="text-gray-500 text-sm mt-2">Gestão de identidades corporativas e subsidiárias.</p>
        </div>
        <HzButton onClick={() => setModal(true)} className="bg-[#B6192E] text-white flex gap-2">
          <PlusIcon className="w-5 h-5"/> Nova Entidade
        </HzButton>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {entities.map(ent => (
          <div key={ent.id} className="bg-white border p-6 rounded-[24px] hover:shadow-lg transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border overflow-hidden">
                {ent.logo_url ? <img src={ent.logo_url} /> : <BuildingOfficeIcon className="w-6 h-6 text-gray-300"/>}
              </div>
              <HzBadge>{ent.category}</HzBadge>
            </div>
            <h3 className="text-xl font-bold truncate">{ent.display_name}</h3>
            <p className="text-[10px] font-mono text-gray-400 mt-1 uppercase">{ent.slug}</p>
            <HzButton onClick={() => router.push(`/organizations/${ent.id}`)} variant="secondary" className="w-full mt-6 justify-between">
              Gerir Entidade <ArrowRightIcon className="w-4 h-4" />
            </HzButton>
          </div>
        ))}
      </div>

      <CreateEntityModal isOpen={modal} onClose={() => setModal(false)} onSuccess={load} />
    </div>
  );
}