'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { HzSkeleton } from '@/components/ui';
import { useNavigationStore } from '@/store/useNavigationStore';
import {
  ChartPieIcon, UsersIcon, BuildingOfficeIcon, ShieldExclamationIcon, CheckBadgeIcon,
  SparklesIcon, ShieldCheckIcon, PresentationChartLineIcon, BriefcaseIcon,
  TicketIcon, ScaleIcon, Cog8ToothIcon, ArrowRightOnRectangleIcon,
  ChevronLeftIcon, ChevronRightIcon
} from '@heroicons/react/24/outline';

const navigationGroups = [
  { title: 'Visão Global', items: [{ name: 'Dashboard', href: '/overview', icon: ChartPieIcon }] },
  { title: 'Identidade & Acesso', items: [
      { name: 'Utilizadores', href: '/users/list', icon: UsersIcon },
      { name: 'Organizações', href: '/organizations', icon: BuildingOfficeIcon },
      { name: 'Verificação KYC', href: '/users/verification', icon: CheckBadgeIcon },
      { name: 'Auditoria Core', href: '/users/audit', icon: ShieldExclamationIcon },
  ]},
  { title: 'Ecossistema', items: [
      { name: 'Universos', href: '/content/universes', icon: SparklesIcon },
      { name: 'Moderação Global', href: '/content/moderation', icon: ShieldCheckIcon },
  ]},
  { title: 'Monetização (Ads)', items: [
      { name: 'Campanhas', href: '/ads/campaigns', icon: PresentationChartLineIcon },
      { name: 'Parceiros', href: '/ads/partners', icon: BriefcaseIcon },
  ]},
  { title: 'Infraestrutura', items: [{ name: 'Configurações', href: '/settings/system', icon: Cog8ToothIcon }] }
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  
  // Importação do Zustand Store
  const { setIsNavigating } = useNavigationStore();
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  useEffect(() => { setPendingPath(null); }, [pathname]);
  useEffect(() => {
    const timer = setTimeout(() => setIsLoadingProfile(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const isActive = (href: string) => {
    const pathToCheck = pendingPath || pathname;
    if (href === '/overview' && pathToCheck === '/overview') return true;
    if (href !== '/overview' && pathToCheck.startsWith(href)) return true;
    return false;
  };

  return (
    <aside className={clsx(
      "bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0 overflow-visible transition-all duration-300 ease-in-out relative z-50 flex-none",
      isCollapsed ? "w-24" : "w-72"
    )}>
      
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3.5 top-8 bg-white border border-gray-200 rounded-full p-1.5 shadow-sm hover:text-[#E50000] hover:border-[#E50000] transition-colors z-[60] flex items-center justify-center"
      >
        {isCollapsed ? <ChevronRightIcon className="w-4 h-4 text-black"/> : <ChevronLeftIcon className="w-4 h-4 text-black"/>}
      </button>
      
      <div className={clsx("h-24 flex items-center transition-all overflow-hidden border-b border-gray-50", isCollapsed ? "justify-center px-0" : "px-8 gap-3")}>
        <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-black text-sm flex-none shadow-md">HZ</div>
        {!isCollapsed && (
          <div className="whitespace-nowrap animate-in fade-in">
            <h1 className="font-black text-black text-lg tracking-tight leading-none">Horizion</h1>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Admin Core</span>
          </div>
        )}
      </div>

      <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto custom-scrollbar overflow-x-hidden">
        {navigationGroups.map((group, groupIdx) => (
          <div key={groupIdx}>
            {!isCollapsed ? (
              <h3 className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 whitespace-nowrap">{group.title}</h3>
            ) : (
              <div className="h-px bg-gray-100 mx-4 mb-3 mt-6 first:mt-0 first:bg-transparent"></div>
            )}
            
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      title={isCollapsed ? item.name : ''}
                      onClick={(e) => {
                        // GATILHO INSTANTÂNEO: Se não estiver já na página, apaga o ecrã e mostra o Skeleton!
                        if (!active) {
                          setPendingPath(item.href);
                          setIsNavigating(true);
                        }
                      }}
                      className={clsx(
                        "flex items-center rounded-2xl text-xs font-semibold transition-all relative group overflow-hidden",
                        isCollapsed ? "justify-center py-3 px-0 mx-2" : "gap-3 px-4 py-3",
                        active ? "bg-red-50/50 text-[#E50000]" : "text-gray-600 hover:bg-gray-50 hover:text-black"
                      )}
                    >
                      {active && <span className="absolute left-0 top-1 bottom-1 w-1 bg-[#E50000] rounded-r-full" />}
                      <item.icon className={clsx("w-5 h-5 transition-colors flex-none", active ? "text-[#E50000]" : "text-gray-400 group-hover:text-black")} />
                      {!isCollapsed && <span className="tracking-wide whitespace-nowrap">{item.name}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="p-6 border-t border-gray-50">
        {isLoadingProfile ? (
           <div className={clsx("flex items-center", isCollapsed ? "justify-center" : "gap-3 px-2")}>
             <HzSkeleton className="w-10 h-10 rounded-full flex-none" />
             {!isCollapsed && (
               <div className="space-y-2 w-full">
                 <HzSkeleton className="h-3 w-24 rounded-md" />
                 <HzSkeleton className="h-2 w-16 rounded-md" />
               </div>
             )}
           </div>
        ) : (
          <button 
            title={isCollapsed ? "Encerrar Sessão" : ""}
            className={clsx(
              "flex items-center text-xs font-bold text-gray-500 hover:bg-red-50 hover:text-[#E50000] transition-colors group rounded-2xl",
              isCollapsed ? "justify-center py-3 px-0 w-full border border-gray-100" : "gap-3 px-4 py-3 w-full border border-transparent hover:border-red-100"
            )}
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 text-gray-400 group-hover:text-[#E50000] transition-colors flex-none" />
            {!isCollapsed && <span className="tracking-wide whitespace-nowrap">Encerrar Sessão</span>}
          </button>
        )}
      </div>
    </aside>
  );
}