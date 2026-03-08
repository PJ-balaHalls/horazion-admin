'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
// Correção: Usando Named Imports em vez de Default Imports
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAuthGuard } from '@/hooks/useAuthGuard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isChecking, isAuthenticated, user } = useAuthGuard();
  const router = useRouter();

  useEffect(() => {
    // Redireciona para login se não estiver autenticado após a checagem
    if (!isChecking && !isAuthenticated) {
      router.push('/login');
    }
  }, [isChecking, isAuthenticated, router]);

  // Skeleton de proteção enquanto valida a sessão (Prevenção de Flicker)
  if (isChecking || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#F2F2F2] border-t-[#B6192E] rounded-full animate-spin"></div>
          <p className="mt-4 text-sm text-[#545454]">Validando credenciais de acesso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Passamos o userRole para a Sidebar para ela renderizar os menus permitidos */}
      <Sidebar userRole={user?.star_role} />
      
      <div className="flex-1 flex flex-col h-full border-l border-[#F2F2F2]">
        {/* Passamos o user para o Header para exibir Avatar e HorizionID */}
        <Header user={user} />
        
        <main className="flex-1 overflow-y-auto bg-[#FAFAFA] p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 