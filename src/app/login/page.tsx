'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HzInput, HzButton, HzSkeleton } from '@/components/ui';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    // Simulando chamada de API de Autenticação (Zero Trust)
    setTimeout(() => {
      router.push('/users/list');
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center p-6 relative overflow-hidden">
      
      {/* Background sutil Horizon (Opcional, apenas para quebrar o vazio absoluto se preferir) */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-red-50/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 z-0 pointer-events-none"></div>

      <div className="w-full max-w-[400px] bg-white rounded-[32px] border border-gray-100 shadow-2xl p-12 z-10 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Cabeçalho do Login */}
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg mb-6">
            HZ
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Horizion Admin</h1>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mt-3">Autenticação Zero Trust</p>
        </div>

        {/* Formulário com transição para Skeleton (Loading UX) */}
        {loading ? (
          <div className="space-y-6 animate-pulse">
             <div className="space-y-2">
               <HzSkeleton className="h-4 w-24 rounded" />
               <HzSkeleton className="h-14 w-full rounded-2xl" />
             </div>
             <div className="space-y-2">
               <HzSkeleton className="h-4 w-32 rounded" />
               <HzSkeleton className="h-14 w-full rounded-2xl" />
             </div>
             <HzSkeleton className="h-14 w-full rounded-2xl mt-8" />
             <div className="flex justify-center pt-4">
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest animate-bounce">Validando Credenciais...</span>
             </div>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-6 animate-in fade-in">
            <HzInput 
              label="Endereço de E-mail" 
              type="email" 
              placeholder="admin@horazion.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <HzInput 
              label="Senha de Acesso Mestre" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            
            <div className="pt-4">
              <HzButton 
                type="submit" 
                className="w-full h-14 bg-black hover:bg-[#E50000] text-white text-sm font-bold rounded-2xl shadow-md transition-colors"
              >
                Aceder ao Ecossistema
              </HzButton>
            </div>
          </form>
        )}
      </div>

      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mt-12 z-10">
        © 2026 Horizion Group. Acesso Restrito.
      </p>
    </div>
  );
}