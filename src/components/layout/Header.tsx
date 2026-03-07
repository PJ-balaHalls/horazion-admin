'use client';

import { useAuthStore } from '@/store/useAuthStore';

export function Header() {
  const { profile, isLoading } = useAuthStore();

  const userName = profile?.full_name || (isLoading ? 'Autenticando...' : 'Desconhecido');
  const userRole = profile?.role ? profile.role.toUpperCase() : (isLoading ? '...' : 'SEM ACESSO');
  const initial = profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'H';

  return (
    <header className="h-20 bg-horazion-white border-b border-horazion-light flex items-center justify-between px-8 sticky top-0 z-10 transition-all shadow-sm">
      <h1 className="text-xl font-bold text-horazion-black">Centro de Comando</h1>
      
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-bold text-horazion-black">{userName}</p>
          <p className="text-xs text-horazion-red font-bold tracking-widest">{userRole}</p>
        </div>
        <div className="w-10 h-10 bg-horazion-black rounded-hz flex items-center justify-center text-horazion-white font-bold shadow-md ring-2 ring-horazion-light">
          {initial}
        </div>
      </div>
    </header>
  );
}