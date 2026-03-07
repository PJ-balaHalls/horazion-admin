'use client';

import { useAuthStore } from '@/store/useAuthStore';

/**
 * [FE-HZ-011] Header - Estética Clean White & Busca Global
 * Implementa a transparência sutil e a barra de comandos do SOS.
 */
export function Header() {
  const { profile, signOut } = useAuthStore();

  return (
    <header className="h-20 px-8 bg-horazion-white border-b border-horazion-light flex items-center justify-between sticky top-0 z-30 transition-all">
      
      {/* Esquerda: Identificador de Contexto */}
      <div className="flex-shrink-0 hidden lg:block">
        <span className="text-[10px] font-bold text-horazion-gray/60 uppercase tracking-[0.2em]">
          Ambiente de Gestão • SOS
        </span>
      </div>

      {/* Centro: Barra de Pesquisa Minimalista */}
      <div className="flex-1 max-w-2xl mx-12">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-horazion-gray/40 group-focus-within:text-horazion-black transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-12 py-2.5 border border-horazion-light rounded-hz bg-horazion-white placeholder-horazion-gray/30 text-horazion-black focus:outline-none focus:ring-1 focus:ring-horazion-black/10 focus:border-horazion-black transition-all sm:text-sm font-medium"
            placeholder="Buscar por HorizionID, blocos ou universos..."
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <kbd className="hidden sm:inline-flex items-center px-2 font-sans text-[10px] font-bold text-horazion-gray/40 border border-horazion-light rounded bg-horazion-white">
              ⌘ K
            </kbd>
          </div>
        </div>
      </div>

      {/* Direita: Perfil e Credencial Estelar */}
      <div className="flex items-center gap-6">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold text-horazion-black leading-tight tracking-tight">
            {profile?.full_name || 'Arquiteto'}
          </p>
          <p className="text-[10px] font-bold text-horazion-red uppercase tracking-widest mt-0.5">
            Acesso {profile?.role || 'SIRIUS'}
          </p>
        </div>
        
        <div className="relative group">
           <div className="w-10 h-10 bg-horazion-white border border-horazion-light rounded-full flex items-center justify-center cursor-pointer hover:border-horazion-black transition-colors overflow-hidden">
             <span className="text-horazion-black font-bold text-xs">
               {profile?.full_name?.charAt(0).toUpperCase() || 'H'}
             </span>
           </div>
        </div>

        <button 
          onClick={() => signOut()}
          className="p-2 text-horazion-gray hover:text-horazion-black hover:bg-horazion-light/30 rounded-hz transition-all"
          title="Encerrar Sessão"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>
  );
}