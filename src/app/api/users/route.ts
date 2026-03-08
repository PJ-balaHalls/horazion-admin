import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Proteção Zero Trust: Usamos a Service Role Key para ultrapassar o RLS na criação de contas 
// sem derrubar a sessão do CEO que está logado no painel.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req: Request) {
  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { error: 'HZ-SYS_005: Chaves de API do Supabase ausentes no servidor.' },
      { status: 500 }
    );
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  try {
    const body = await req.json();
    const { email, password, full_name, role, horizion_id, city, state, country, cep, address, custom_data } = body;

    // 1. Criar Auth User (A conta real no sistema)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name }
    });

    if (authError) throw authError;

    // 2. Injetar a claim estelar
    await supabaseAdmin.auth.admin.updateUserById(authData.user.id, {
      app_metadata: { star_role: role }
    });

    // 3. Criar o Perfil no Banco Público
    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      id: authData.user.id,
      horizion_id,
      full_name,
      email,
      role,
      city, state, country, cep, address,
      custom_data,
      is_active: true
    });

    if (profileError) throw profileError;

    return NextResponse.json({ success: true, user: authData.user });
  } catch (error: any) {
    console.error('[HZ-API_CREATE_USER]', error);
    return NextResponse.json({ error: error.message || 'Erro interno ao aprovisionar.' }, { status: 400 });
  }
}