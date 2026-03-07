'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useAuthGuard } from '@/hooks/useAuthGuard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isCheckingAuth } = useAuthGuard();

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-horazion-light/30">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="w-10 h-10 bg-horazion-black rounded-hz animate-pulse flex items-center justify-center shadow-lg">
             <span className="text-horazion-white font-bold text-lg">H</span>
          </div>
          <span className="text-xs text-horazion-gray font-bold tracking-widest uppercase">Validando Identidade...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-horazion-light/30 font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto flex flex-col bg-horazion-light/30">
        <Header />
        <div className="p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}