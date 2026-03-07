'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, ShieldAlert, Newspaper, Megaphone, Settings, LogOut } from 'lucide-react';
import './globals.css';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);

  // Mapeamento de menus e explicações de setor
  const menuItems = [
    { id: 'home', href: '/', icon: LayoutDashboard, label: 'Visão Global', desc: 'Métricas gerais e saúde do ecossistema Horazion.' },
    { id: 'users', href: '/users', icon: Users, label: 'Identidade (Account)', desc: 'Gestão de usuários, papéis e auditoria de segurança.' },
    { id: 'content', href: '/content', icon: Newspaper, label: 'Conteúdo (Content)', desc: 'Curadoria de blocos, blogs e catálogos de universos.' },
    { id: 'support', href: '/support', icon: ShieldAlert, label: 'Suporte & Ouvidoria', desc: 'Resolução de tickets e denúncias de usuários.' },
    { id: 'ads', href: '/ads', icon: Megaphone, label: 'Monetização (Ads)', desc: 'Gestão de parceiros e aprovação de campanhas.' },
    { id: 'settings', href: '/settings', icon: Settings, label: 'Configurações', desc: 'Acesso Sirius/Rigel: Feature flags e variáveis de ambiente.' },
  ];

  return (
    <div className="flex h-screen bg-horazion-light/30">
      
      {/* Sidebar Minimalista */}
      <aside className="w-20 lg:w-64 bg-horazion-white border-r border-horazion-light flex flex-col justify-between transition-all duration-300">
        <div>
          <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-horazion-light">
            {/* Logo minimalista */}
            <div className="w-8 h-8 bg-horazion-black rounded-hz flex items-center justify-center">
              <span className="text-horazion-white font-bold text-sm">H</span>
            </div>
            <span className="hidden lg:block ml-3 font-bold text-horazion-black text-lg">Backoffice</span>
          </div>

          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <div 
                  key={item.id}
                  className="relative group"
                  onMouseEnter={() => setHoveredMenu(item.id)}
                  onMouseLeave={() => setHoveredMenu(null)}
                >
                  <Link 
                    href={item.href}
                    className={`flex items-center p-3 rounded-hz transition-colors ${
                      isActive ? 'bg-horazion-red text-horazion-white' : 'text-horazion-gray hover:bg-horazion-light hover:text-horazion-black'
                    }`}
                  >
                    <Icon size={20} className={isActive ? 'text-horazion-white' : ''} />
                    <span className="hidden lg:block ml-3 text-sm font-medium">{item.label}</span>
                  </Link>

                  {/* Tooltip / Popup Explicativo (Aparece no desktop collapsed ou com hover prolongado) */}
                  {hoveredMenu === item.id && (
                    <div className="absolute left-full top-0 ml-4 w-48 p-3 bg-horazion-black text-horazion-white text-xs rounded-hz shadow-lg z-50 animate-fade-in pointer-events-none">
                      <p className="font-semibold mb-1">{item.label}</p>
                      <p className="text-horazion-light/70">{item.desc}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-horazion-light">
          <button className="flex items-center w-full p-3 rounded-hz text-horazion-gray hover:bg-horazion-light hover:text-horazion-red transition-colors">
            <LogOut size={20} />
            <span className="hidden lg:block ml-3 text-sm font-medium">Sessão Segura</span>
          </button>
        </div>
      </aside>

      {/* Área de Conteúdo */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-20 bg-horazion-white border-b border-horazion-light flex items-center justify-between px-8">
          <h1 className="text-xl font-bold text-horazion-black">Dashboard Sirius</h1>
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-horazion-black">Seu Nome (CEO)</p>
              <p className="text-xs text-horazion-red font-semibold">Nível: Sirius</p>
            </div>
            <div className="w-10 h-10 bg-horazion-light rounded-full flex items-center justify-center text-horazion-black font-bold">
              C
            </div>
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}