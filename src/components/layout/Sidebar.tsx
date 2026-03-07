'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Users, ShieldAlert, Newspaper, Megaphone, 
  Settings, LogOut, ChevronDown, ChevronRight 
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

const menuItems = [
  { id: 'home', href: '/', icon: LayoutDashboard, label: 'Visão Global' },
  { 
    id: 'users', icon: Users, label: 'Identidade (Account)',
    subItems: [
      { href: '/users/list', label: 'Listar Usuários' },
      { href: '/users/audit', label: 'Logs de Auditoria' },
      { href: '/users/verification', label: 'Selos de Verificação' },
    ]
  },
  { 
    id: 'content', icon: Newspaper, label: 'Conteúdo (Content)',
    subItems: [
      { href: '/content/moderation', label: 'Moderação de Blocos' },
      { href: '/content/blogs', label: 'Blog Oficial' },
      { href: '/content/universes', label: 'Catálogo de Universos' },
    ]
  },
  { 
    id: 'support', icon: ShieldAlert, label: 'Suporte & Ouvidoria',
    subItems: [
      { href: '/support/tickets', label: 'Fila de Tickets' },
      { href: '/support/ombudsman', label: 'Painel da Ouvidoria' },
      { href: '/support/faq', label: 'Base de FAQ' },
    ]
  },
  { 
    id: 'ads', icon: Megaphone, label: 'Monetização (Ads)',
    subItems: [
      { href: '/ads/campaigns', label: 'Campanhas Ativas' },
      { href: '/ads/partners', label: 'Gestão de Parceiros' },
    ]
  },
  { 
    id: 'settings', icon: Settings, label: 'Configurações',
    subItems: [
      { href: '/settings/features', label: 'Feature Flags' },
      { href: '/settings/system', label: 'Status do Sistema' },
    ]
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuthStore();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['users']);

  const toggleMenu = (menuId: string) => {
    setExpandedMenus((prev) => 
      prev.includes(menuId) ? prev.filter(id => id !== menuId) : [...prev, menuId]
    );
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <aside className="w-64 bg-horazion-white border-r border-horazion-light flex flex-col justify-between overflow-y-auto hidden md:flex shadow-sm">
      <div>
        <div className="h-20 flex items-center justify-start px-6 border-b border-horazion-light sticky top-0 bg-horazion-white z-10">
          <div className="w-8 h-8 bg-horazion-black rounded-hz flex items-center justify-center shadow-sm">
            <span className="text-horazion-white font-bold text-sm">H</span>
          </div>
          <span className="ml-3 font-bold text-horazion-black text-lg tracking-tight">Backoffice</span>
        </div>

        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const isExpanded = expandedMenus.includes(item.id);
            const Icon = item.icon;
            const hasSubItems = !!item.subItems;
            const isDirectActive = !hasSubItems && pathname === item.href;
            
            return (
              <div key={item.id} className="mb-1">
                {hasSubItems ? (
                  <button 
                    onClick={() => toggleMenu(item.id)}
                    className="w-full flex items-center justify-between p-3 rounded-hz transition-all duration-200 text-horazion-gray hover:bg-horazion-light hover:text-horazion-black"
                  >
                    <div className="flex items-center">
                      <Icon size={18} strokeWidth={2.5} />
                      <span className="ml-3 text-sm font-semibold">{item.label}</span>
                    </div>
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                ) : (
                  <Link 
                    href={item.href!}
                    className={`flex items-center p-3 rounded-hz transition-all duration-200 ${
                      isDirectActive ? 'bg-horazion-red text-horazion-white shadow-sm' : 'text-horazion-gray hover:bg-horazion-light hover:text-horazion-black'
                    }`}
                  >
                    <Icon size={18} strokeWidth={2.5} className={isDirectActive ? 'text-horazion-white' : ''} />
                    <span className="ml-3 text-sm font-semibold">{item.label}</span>
                  </Link>
                )}

                {hasSubItems && isExpanded && (
                  <div className="mt-1 ml-4 pl-3 border-l-2 border-horazion-light space-y-1">
                    {item.subItems.map((sub) => {
                      const isSubActive = pathname === sub.href;
                      return (
                        <Link 
                          key={sub.href} 
                          href={sub.href}
                          className={`block p-2 text-xs font-semibold rounded-hz transition-all duration-200 ${
                            isSubActive 
                              ? 'bg-horazion-red/10 text-horazion-red' 
                              : 'text-horazion-gray hover:text-horazion-black hover:bg-horazion-light/50'
                          }`}
                        >
                          {sub.label}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-horazion-light sticky bottom-0 bg-horazion-white">
        <button 
          onClick={handleSignOut}
          className="flex items-center justify-center w-full p-3 rounded-hz text-horazion-gray hover:bg-horazion-red/10 hover:text-horazion-red transition-all duration-200 font-bold border border-transparent hover:border-horazion-red/20"
        >
          <LogOut size={18} strokeWidth={2.5} />
          <span className="ml-2 text-sm">Encerrar Sessão</span>
        </button>
      </div>
    </aside>
  );
}