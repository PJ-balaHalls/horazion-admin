'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';

export default function LoginPage() {
  const router = useRouter();
  const { checkSession, isAuthenticated } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/overview');
    }
  }, [isAuthenticated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // [CORE-HZ-007] Tratamento estruturado baseado na Biblioteca de Erros Horizion
        let customMessage = 'Credenciais inválidas. Verifique seu e-mail e senha.';
        
        if (error.message.includes('Failed to fetch')) {
          customMessage = 'HZ-NET_001: Erro de conexão com o Horizion Core. Reinicie o servidor local para reler as variáveis .env ou desative extensões de bloqueio de anúncios.';
        } else if (error.message.includes('Invalid login credentials')) {
          customMessage = 'HZ-AUTH_401: E-mail ou senha incorretos.';
        }

        setErrorMsg(customMessage);
        return;
      }

      if (data.session) {
        await checkSession();
        router.push('/overview');
      }

    } catch (err: any) {
      console.error('[HZ-SYS_ERROR]', err);
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setErrorMsg('HZ-NET_002: Falha crítica de rede. (Verifique as chaves NEXT_PUBLIC_SUPABASE_ no seu .env)');
      } else {
        setErrorMsg('HZ-AUTH_500: Ocorreu um erro inesperado.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white font-sans p-4">
      <div className="w-full max-w-md bg-white border border-[#F2F2F2] rounded-[12px] p-8 shadow-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-[#000000] rounded-[12px] flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">H</span>
          </div>
          <h1 className="text-2xl font-bold text-[#000000] tracking-tight">Horazion Admin</h1>
          <p className="text-sm text-[#545454] mt-1">Autenticação Zero Trust</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-[#FAFAFA] border-l-4 border-[#B6192E] rounded-r-lg">
            <p className="text-xs font-semibold text-[#B6192E]">{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#545454] uppercase tracking-wider">
              E-mail
            </label>
            <input
              type="email"
              required
              disabled={isLoading}
              className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#F2F2F2] rounded-[12px] text-sm text-[#000000] focus:outline-none focus:border-[#000000] focus:bg-white transition-colors"
              placeholder="ceo@horazion.group"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#545454] uppercase tracking-wider">
              Senha
            </label>
            <input
              type="password"
              required
              disabled={isLoading}
              className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#F2F2F2] rounded-[12px] text-sm text-[#000000] focus:outline-none focus:border-[#000000] focus:bg-white transition-colors"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 bg-[#000000] text-white text-xs font-bold uppercase tracking-widest rounded-[12px] hover:bg-[#B6192E] disabled:bg-[#545454] disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? 'Validando Identidade...' : 'Acessar Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
}