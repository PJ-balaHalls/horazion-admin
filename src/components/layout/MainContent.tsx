'use client';

import React, { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useNavigationStore } from '@/store/useNavigationStore';
import DashboardLoading from '@/app/(dashboard)/loading';

// 1. Isolamos os hooks de navegação em um sub-componente
function RouteChangeHandler() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setIsNavigating } = useNavigationStore();

  useEffect(() => {
    // Assim que o Next.js terminar de carregar a nova página,
    // desligamos o estado de navegação.
    setIsNavigating(false);
  }, [pathname, searchParams, setIsNavigating]);

  return null; // Este componente não renderiza nada visualmente
}

// 2. O Componente Principal agora envolve a lógica em um Suspense
export function MainContent({ children }: { children: React.ReactNode }) {
  const { isNavigating } = useNavigationStore();

  return (
    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-white custom-scrollbar relative">
      {/* O Suspense impede que o Next.js quebre o build estático ao usar useSearchParams */}
      <Suspense fallback={null}>
        <RouteChangeHandler />
      </Suspense>
      
      {isNavigating ? <DashboardLoading /> : children}
    </main>
  );
}