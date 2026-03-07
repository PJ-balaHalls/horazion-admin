'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';

export default function OverviewPage() {
  const { profile } = useAuthStore();

  const constellation = [
    { id: 'sirius', name: 'SIRIUS', role: 'Arquiteto Master', desc: 'Controle absoluto da infraestrutura e regras do ecossistema.' },
    { id: 'rigel', name: 'RIGEL', role: 'Estrategista', desc: 'Gestão de Universos e governança de dados globais.' },
    { id: 'betelgeuse', name: 'BETELGEUSE', role: 'Operador', desc: 'Gestão de faturamento, campanhas e auditoria comercial.' },
    { id: 'altair', name: 'ALTAIR', role: 'Curador', desc: 'Moderação de blocos vivos e suporte de segundo nível.' },
    { id: 'polaris', name: 'POLARIS', role: 'Auditor', desc: 'Acesso de leitura estrita para conformidade e logs.' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-fade-in pb-20">
      
      {/* Entrada Clean White */}
      <div className="pb-8 border-b border-horazion-light">
        <h1 className="text-4xl font-bold text-horazion-black tracking-tighter mb-2">
          Bem-vindo, {profile?.full_name || 'Usuário'}.
        </h1>
        <p className="text-sm font-medium text-horazion-gray max-w-2xl leading-relaxed">
          Você está autenticado no **Horazion Admin**. Sua credencial <span className="text-horazion-red font-bold uppercase tracking-widest text-xs">[{profile?.role || 'SIRIUS'}]</span> permite orquestrar os parâmetros do Sistema Operativo Social.
        </p>
      </div>

      {/* Atalhos de Ação Direta */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Auditar Identidades', link: '/users/list', label: 'Users' },
          { title: 'Supervisionar Blocos', link: '/content/universes', label: 'Universes' },
          { title: 'Resolver Tickets', link: '/support/tickets', label: 'SOS Support' }
        ].map((item, i) => (
          <Link href={item.link} key={i} className="group p-8 bg-horazion-white border border-horazion-light rounded-hz hover:border-horazion-black transition-all">
            <span className="text-[10px] font-bold text-horazion-red uppercase tracking-[0.2em] mb-4 block">{item.label}</span>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-horazion-black group-hover:translate-x-1 transition-transform">{item.title}</h3>
              <svg className="w-5 h-5 text-horazion-black opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4-4m4 4H3" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {/* Visualização da Constelação: "Você está aqui" */}
      <div className="pt-10 border-t border-horazion-light">
        <div className="mb-10">
          <h2 className="text-xl font-bold text-horazion-black tracking-tight">Constelação de Permissões</h2>
          <p className="text-sm text-horazion-gray font-medium mt-1">Sua posição hierárquica no ecossistema Zero Trust.</p>
        </div>

        <div className="relative space-y-10 pl-8 border-l border-horazion-light">
          {constellation.map((star) => {
            const isCurrent = profile?.role === star.id || (star.id === 'sirius' && !profile?.role);
            return (
              <div key={star.id} className={`relative transition-all duration-700 ${isCurrent ? 'opacity-100 scale-100' : 'opacity-30 scale-95'}`}>
                <div className={`absolute -left-[41px] top-1 w-4 h-4 rounded-full border-4 border-horazion-white ${isCurrent ? 'bg-horazion-red shadow-[0_0_20px_rgba(182,25,46,0.5)] animate-pulse' : 'bg-horazion-light'}`}></div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className={`text-xs font-bold tracking-[0.3em] uppercase ${isCurrent ? 'text-horazion-red' : 'text-horazion-black'}`}>{star.name}</h4>
                    {isCurrent && <span className="bg-horazion-red text-horazion-white text-[9px] font-bold px-2 py-0.5 rounded-full tracking-widest uppercase">Você está aqui</span>}
                  </div>
                  <p className="text-sm font-bold text-horazion-black">{star.role}</p>
                  <p className="text-sm text-horazion-gray font-medium mt-1 max-w-xl">{star.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}