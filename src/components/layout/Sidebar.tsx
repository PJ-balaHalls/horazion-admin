'use client';

import React from 'react';
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
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

// Arquitetura de Navegação Orientada a Domínio
const navigationGroups = [
  {
    title: 'Visão Global',
    items: [
      { name: 'Dashboard', href: '/overview', icon: ChartPieIcon },
    ]
  },
  {
    title: 'Identidade & Acesso (Account)',
    items: [
      { name: 'Utilizadores', href: '/users/list', icon: UsersIcon },
      { name: 'Organizações', href: '/organizations', icon: BuildingOfficeIcon },
      { name: 'Verificação KYC', href: '/users/verification', icon: CheckBadgeIcon },
      { name: 'Auditoria Core', href: '/users/audit', icon: ShieldExclamationIcon },
    ]
  },
  {
    title: 'Ecossistema (Life & Content)',
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
      { name: 'Ouvidoria (Ombudsman)', href: '/support/ombudsman', icon: ScaleIcon },
    ]
  },
  {
    title: 'Infraestrutura',
    items: [
      { name: 'Configurações do Sistema', href: '/settings/system', icon: Cog8ToothIcon },
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();

  // Função auxiliar para determinar se a rota actual pertence ao item do menu
  const isActive = (href: string) => {
    if (href === '/overview' && pathname === '/overview') return true;
    if (href !== '/overview' && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <aside className="w-72 bg-white border-r border-[#F2F2F2] flex flex-col h-screen sticky top-0 overflow-y-auto scrollbar-hide">
      
      {/* HEADER DA SIDEBAR (Logotipo e Versão) */}
      <div className="p-8 pb-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-black rounded flex items-center justify-center text-white font-bold text-xs">
          HZ
        </div>
        <div>
          <h1 className="font-bold text-black text-sm tracking-tight leading-none">Horazion Group</h1>
          <span className="text-[9px] text-[#A0A0A0] uppercase tracking-widest font-mono">Core Admin v3.1</span>
        </div>
      </div>

      {/* CORPO DE NAVEGAÇÃO MODULAR */}
      <nav className="flex-1 px-4 py-6 space-y-8">
        {navigationGroups.map((group, groupIdx) => (
          <div key={groupIdx}>
            <h3 className="px-4 text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest mb-3">
              {group.title}
            </h3>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={clsx(
                        "flex items-center gap-3 px-4 py-2.5 rounded-[12px] text-xs font-bold transition-all relative group overflow-hidden",
                        active 
                          ? "bg-[#FAFAFA] text-black" 
                          : "text-[#545454] hover:bg-[#FAFAFA] hover:text-black"
                      )}
                    >
                      {/* Indicador de Rota Activa (Fita Vermelha Horazion) */}
                      {active && (
                        <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#B6192E] rounded-r-full" />
                      )}
                      
                      <item.icon 
                        className={clsx(
                          "w-5 h-5 transition-colors", 
                          active ? "text-[#B6192E]" : "text-[#A0A0A0] group-hover:text-black"
                        )} 
                      />
                      <span className="tracking-wide">{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* FOOTER DA SIDEBAR (Sessão do Admin) */}
      <div className="p-6 border-t border-[#F2F2F2]">
        <button className="flex items-center gap-3 w-full px-4 py-3 rounded-[12px] text-xs font-bold text-[#545454] hover:bg-red-50 hover:text-[#B6192E] transition-colors group">
          <ArrowRightOnRectangleIcon className="w-5 h-5 text-[#A0A0A0] group-hover:text-[#B6192E] transition-colors" />
          <span className="tracking-wide">Encerrar Sessão</span>
        </button>
      </div>
    </aside>
  );
}