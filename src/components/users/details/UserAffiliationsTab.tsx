// src/components/users/details/UserAffiliationsTab.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { HzBadge, HzButton, HzSkeleton } from '@/components/ui';

interface UserAffiliationsTabProps {
  userId: string;
}

export function UserAffiliationsTab({ userId }: UserAffiliationsTabProps) {
  const [affiliations, setAffiliations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAffiliations = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_affiliations')
        .select(`id, role, status, privacy_settings, entities ( id, display_name, slug, logo_url )`)
        .eq('profile_id', userId);
        
      if (!error && data) setAffiliations(data);
      setIsLoading(false);
    };
    loadAffiliations();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <HzSkeleton className="h-16 w-full" />
        <HzSkeleton className="h-16 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-black">Vínculos Corporativos</h3>
          <p className="text-sm text-gray-500">Organizações associadas a este Horizion ID.</p>
        </div>
        <HzButton variant="ghost" className="border border-gray-200 text-sm">Adicionar Vínculo</HzButton>
      </div>

      {affiliations.length === 0 ? (
        <div className="p-6 text-center border border-dashed border-gray-300 rounded-xl bg-gray-50">
          <p className="text-sm text-gray-500">Este utilizador não possui vínculos com nenhuma organização.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {affiliations.map((aff) => (
            <div key={aff.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-white hover:border-gray-300 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-100">
                  {aff.entities?.logo_url ? <img src={aff.entities.logo_url} className="w-full h-full object-cover" /> : <span className="text-xs font-bold text-gray-400">ORG</span>}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-black">{aff.entities?.display_name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500 capitalize px-2 py-0.5 bg-gray-100 rounded-full">Role: {aff.role}</span>
                    <HzBadge variant={aff.status === 'active' ? 'success' : 'warning'}>{aff.status}</HzBadge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}