'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * [FE-HZ-005] Root Page - Horazion Life
 * Controlador de Tráfego do Ecossistema (Gateway).
 * Avalia a identidade e roteia para o módulo de Overview.
 */
export default function RootPage() {
  const router = useRouter();
  const { session } = useAuthStore();

  useEffect(() => {
    if (session) {
      // Direciona para o novo Centro de Gravidade
      router.replace('/overview');
    } else {
      router.replace('/login');
    }
  }, [session, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-horazion-light/30">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="w-10 h-10 bg-horazion-black rounded-hz animate-pulse flex items-center justify-center shadow-lg">
           <span className="text-horazion-white font-bold text-lg">H</span>
        </div>
        <span className="text-xs text-horazion-gray font-bold tracking-widest uppercase">Roteando Ecossistema...</span>
      </div>
    </div>
  );
}