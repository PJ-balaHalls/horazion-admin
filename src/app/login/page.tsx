'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('Credenciais inválidas. O sistema operou com Zero Trust e negou o acesso.');
      setLoading(false);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-horazion-light/30 px-4">
      <div className="w-full max-w-md bg-horazion-white border border-horazion-light p-8 rounded-hz shadow-sm">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-horazion-black rounded-hz flex items-center justify-center mb-4">
            <span className="text-horazion-white font-bold text-xl">H</span>
          </div>
          <h1 className="text-2xl font-bold text-horazion-black">Backoffice</h1>
          <p className="text-sm text-horazion-gray mt-1">Acesso Restrito ao Ecossistema</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-horazion-red/10 border border-horazion-red/20 rounded-hz text-horazion-red text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-horazion-gray mb-1 uppercase tracking-wider">E-mail</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-horazion-white border border-horazion-light rounded-hz text-horazion-black focus:outline-none focus:border-horazion-red transition-colors"
              placeholder="ceo@horazion.life"
              required
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-horazion-gray mb-1 uppercase tracking-wider">Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-horazion-white border border-horazion-light rounded-hz text-horazion-black focus:outline-none focus:border-horazion-red transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-horazion-red text-horazion-white font-bold p-3 rounded-hz hover:bg-horazion-black transition-colors disabled:opacity-50 mt-4"
          >
            {loading ? 'Autenticando...' : 'Entrar no Sistema'}
          </button>
        </form>

      </div>
    </div>
  );
}