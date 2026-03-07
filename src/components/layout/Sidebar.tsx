'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// [FE-HZ-008] Sidebar - Clean White e Agrupamento por Tópicos
export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  // Estrutura complexa de Tópicos e Subtópicos
  const menuGroups = [
    {
      label: 'Núcleo',
      items: [
        { name: 'Visão Geral', path: '/overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
      ]
    },
    {
      label: 'Ecossistema',
      items: [
        { name: 'Identidades (Users)', path: '/users/list', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
        { name: 'Universos', path: '/content/universes', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
      ]
    },
    {
      label: 'Operações',
      items: [
        { name: 'Publicidade', path: '/ads/campaigns', icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z' },
        { name: 'Suporte SOS', path: '/support/tickets', icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z' },
      ]
    },
    {
      label: 'Sistema',
      items: [
        { name: 'Configurações', path: '/settings/system', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
      ]
    }
  ];

  return (
    <aside 
      className={`${isCollapsed ? 'w-20' : 'w-72'} transition-all duration-300 ease-in-out h-screen bg-horazion-white border-r border-horazion-light flex flex-col relative z-20`}
    >
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-7 bg-horazion-white border border-horazion-light rounded-full p-1 shadow-sm hover:bg-horazion-light/50 transition-colors z-30"
      >
        <svg className={`w-4 h-4 text-horazion-black transform transition-transform ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="p-6 flex items-center justify-center border-b border-horazion-light h-20">
        <div className="w-8 h-8 bg-horazion-black rounded-hz flex items-center justify-center shrink-0">
          <span className="text-horazion-white font-bold text-sm">H</span>
        </div>
        {!isCollapsed && (
          <div className="ml-3 flex flex-col overflow-hidden whitespace-nowrap animate-fade-in">
            <span className="font-bold text-horazion-black leading-none text-lg tracking-tight">Horazion</span>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-6 scrollbar-hide">
        {menuGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="flex flex-col space-y-1">
            {/* Tópico (Label) */}
            {!isCollapsed && (
              <span className="px-3 text-[10px] font-bold text-horazion-gray/70 uppercase tracking-widest mb-2">
                {group.label}
              </span>
            )}
            {isCollapsed && <div className="h-4 border-b border-horazion-light/30 mb-2 w-8 mx-auto"></div>}
            
            {/* Subtópicos (Links) */}
            {group.items.map((item) => {
              const isActive = pathname.startsWith(item.path);
              return (
                <Link 
                  key={item.path} 
                  href={item.path}
                  className={`flex items-center px-3 py-2.5 rounded-hz transition-all group relative ${
                    isActive 
                      ? 'bg-horazion-black text-horazion-white' 
                      : 'text-horazion-gray hover:bg-horazion-light/30 hover:text-horazion-black'
                  }`}
                  title={isCollapsed ? item.name : ''}
                >
                  <svg className={`w-5 h-5 shrink-0 ${isActive ? 'text-horazion-white' : 'text-horazion-gray group-hover:text-horazion-black'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                  </svg>
                  {!isCollapsed && (
                    <span className="ml-3 text-sm font-semibold whitespace-nowrap">{item.name}</span>
                  )}
                  {/* Ponto indicador de ativo para o modo colapsado */}
                  {isActive && isCollapsed && (
                    <div className="absolute top-1/2 -right-1 w-1.5 h-1.5 bg-horazion-red rounded-full transform -translate-y-1/2"></div>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}