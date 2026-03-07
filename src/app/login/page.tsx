'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { setSession, fetchProfile } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('Credenciais inválidas. O sistema operou com Zero Trust e negou o acesso.');
      setLoading(false);
    } else if (data.session) {
      setSession(data.session);
      await fetchProfile(data.session.user.id);
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-horazion-light/30 px-4 font-sans">
      <div className="w-full max-w-md bg-horazion-white border border-horazion-light p-8 rounded-hz shadow-lg">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-horazion-black rounded-hz flex items-center justify-center mb-4 shadow-sm">
            <span className="text-horazion-white font-bold text-xl">H</span>
          </div>
          <h1 className="text-2xl font-bold text-horazion-black">Backoffice</h1>
          <p className="text-sm font-medium text-horazion-gray mt-1">Acesso Restrito ao Ecossistema</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-horazion-red/10 border border-horazion-red/20 rounded-hz text-horazion-red text-sm font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-horazion-gray mb-1.5 uppercase tracking-wider">E-mail</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-horazion-light/50 border border-horazion-light rounded-hz text-horazion-black focus:outline-none focus:ring-2 focus:ring-horazion-red/20 focus:border-horazion-red transition-all font-medium"
              placeholder="ceo@horazion.life"
              required
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-horazion-gray mb-1.5 uppercase tracking-wider">Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-horazion-light/50 border border-horazion-light rounded-hz text-horazion-black focus:outline-none focus:ring-2 focus:ring-horazion-red/20 focus:border-horazion-red transition-all font-medium"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-horazion-red text-horazion-white font-bold p-3.5 rounded-hz hover:bg-horazion-black transition-all duration-300 disabled:opacity-50 mt-6 shadow-md hover:shadow-lg"
          >
            {loading ? 'Autenticando Identidade...' : 'Entrar no Sistema'}
          </button>
        </form>

      </div>
    </div>
  );
}