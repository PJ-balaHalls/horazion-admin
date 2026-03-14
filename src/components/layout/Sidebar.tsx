'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import {
  ChartPieIcon,
  UsersIcon,
  BuildingOfficeIcon,
  ShieldExclamationIcon,
  CheckBadgeIcon,
  SparklesIcon,
  ShieldCheckIcon,
  PresentationChartLineIcon,
  BriefcaseIcon,
  TicketIcon,
  ScaleIcon,
  Cog8ToothIcon,
  ArrowRightOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const navigationGroups = [
  {
    title: 'Visão Global',
    items: [
      { name: 'Dashboard', href: '/overview', icon: ChartPieIcon },
    ]
  },
  {
    title: 'Identidade & Acesso',
    items: [
      { name: 'Utilizadores', href: '/users/list', icon: UsersIcon },
      { name: 'Organizações', href: '/organizations', icon: BuildingOfficeIcon },
      { name: 'Verificação KYC', href: '/users/verification', icon: CheckBadgeIcon },
      { name: 'Auditoria Core', href: '/users/audit', icon: ShieldExclamationIcon },
    ]
  },
  {
    title: 'Ecossistema',
    items: [
      { name: 'Universos', href: '/content/universes', icon: SparklesIcon },
      { name: 'Moderação Global', href: '/content/moderation', icon: ShieldCheckIcon },
    ]
  },
  {
    title: 'Monetização (Ads)',
    items: [
      { name: 'Campanhas', href: '/ads/campaigns', icon: PresentationChartLineIcon },
      { name: 'Parceiros de Marca', href: '/ads/partners', icon: BriefcaseIcon },
    ]
  },
  {
    title: 'Governança & Suporte',
    items: [
      { name: 'Central de Tickets', href: '/support/tickets', icon: TicketIcon },
      { name: 'Ouvidoria', href: '/support/ombudsman', icon: ScaleIcon },
    ]
  },
  {
    title: 'Infraestrutura',
    items: [
      { name: 'Configurações', href: '/settings/system', icon: Cog8ToothIcon },
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (href: string) => {
    if (href === '/overview' && pathname === '/overview') return true;
    if (href !== '/overview' && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <aside className={clsx(
      "bg-white border-r border-[#F2F2F2] flex flex-col h-screen sticky top-0 overflow-visible transition-all duration-300 ease-in-out relative z-50",
      isCollapsed ? "w-24" : "w-72"
    )}>
      
      {/* Botão Flutuante de Colapso */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3.5 top-8 bg-white border border-[#F2F2F2] rounded-full p-1.5 shadow-sm hover:text-[#B6192E] hover:border-[#B6192E] transition-colors z-[60] flex items-center justify-center"
      >
        {isCollapsed ? <ChevronRightIcon className="w-4 h-4"/> : <ChevronLeftIcon className="w-4 h-4"/>}
      </button>
      
      {/* HEADER DA SIDEBAR */}
      <div className={clsx("p-8 pb-4 flex items-center transition-all overflow-hidden", isCollapsed ? "justify-center px-0" : "gap-3")}>
        <div className="w-8 h-8 bg-black rounded flex items-center justify-center text-white font-bold text-xs flex-none">
          HZ
        </div>
        {!isCollapsed && (
          <div className="whitespace-nowrap">
            <h1 className="font-bold text-black text-sm tracking-tight leading-none">Horazion Group</h1>
            <span className="text-[9px] text-[#A0A0A0] uppercase tracking-widest font-mono">Core Admin v3.1</span>
          </div>
        )}
      </div>

      {/* CORPO DE NAVEGAÇÃO MODULAR */}
      <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto custom-scrollbar overflow-x-hidden">
        {navigationGroups.map((group, groupIdx) => (
          <div key={groupIdx}>
            {!isCollapsed ? (
              <h3 className="px-4 text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest mb-3 whitespace-nowrap">
                {group.title}
              </h3>
            ) : (
              // Divisor visual elegante quando colapsado
              <div className="h-px bg-[#F2F2F2] mx-4 mb-3 mt-6 first:mt-0 first:bg-transparent"></div>
            )}
            
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      title={isCollapsed ? item.name : ''}
                      className={clsx(
                        "flex items-center rounded-[12px] text-xs font-bold transition-all relative group overflow-hidden",
                        isCollapsed ? "justify-center py-3 px-0 mx-2" : "gap-3 px-4 py-2.5",
                        active 
                          ? "bg-[#FAFAFA] text-black" 
                          : "text-[#545454] hover:bg-[#FAFAFA] hover:text-black"
                      )}
                    >
                      {/* Indicador de Rota Activa */}
                      {active && (
                        <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#B6192E] rounded-r-full" />
                      )}
                      
                      <item.icon 
                        className={clsx(
                          "w-5 h-5 transition-colors flex-none", 
                          active ? "text-[#B6192E]" : "text-[#A0A0A0] group-hover:text-black"
                        )} 
                      />
                      
                      {!isCollapsed && (
                        <span className="tracking-wide whitespace-nowrap">{item.name}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* FOOTER DA SIDEBAR */}
      <div className="p-6 border-t border-[#F2F2F2]">
        <button 
          title={isCollapsed ? "Encerrar Sessão" : ""}
          className={clsx(
            "flex items-center text-xs font-bold text-[#545454] hover:bg-red-50 hover:text-[#B6192E] transition-colors group rounded-[12px]",
            isCollapsed ? "justify-center py-3 px-0 w-full" : "gap-3 px-4 py-3 w-full"
          )}
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5 text-[#A0A0A0] group-hover:text-[#B6192E] transition-colors flex-none" />
          {!isCollapsed && <span className="tracking-wide whitespace-nowrap">Encerrar Sessão</span>}
        </button>
      </div>
    </aside>
  );
}