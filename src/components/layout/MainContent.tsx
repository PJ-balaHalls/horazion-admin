'use client';

import React, { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useNavigationStore } from '@/store/useNavigationStore';
import DashboardLoading from '@/app/(dashboard)/loading';

export function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isNavigating, setIsNavigating } = useNavigationStore();

  useEffect(() => {
    // Assim que o Next.js terminar de carregar a nova página e mudar o URL,
    // nós desligamos o Skeleton global e mostramos o conteúdo real.
    setIsNavigating(false);
  }, [pathname, searchParams, setIsNavigating]);

  return (
    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-white custom-scrollbar relative">
      {isNavigating ? <DashboardLoading /> : children}
    </main>
  );
}