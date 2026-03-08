import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Chave secreta de servidor

export async function POST(req: Request) {
  try {
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const body = await req.json();
    const { 
      email, password, full_name, role, horizion_id, 
      cep, address, city, state, country, custom_data 
    } = body;

    // 1. Criação na Autenticação (auth.users)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name }
    });

    if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });

    // 2. Injeção de Claims (Hierarquia Estelar)
    await supabaseAdmin.auth.admin.updateUserById(authData.user.id, {
      app_metadata: { star_role: role }
    });

    // 3. Criação do Perfil SOS (public.profiles)
    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      id: authData.user.id,
      horizion_id,
      full_name,
      email,
      role,
      cep,
      address,
      city,
      state,
      country,
      custom_data,
      is_active: true
    });

    if (profileError) {
      // Rollback manual se o perfil falhar
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, userId: authData.user.id });
  } catch (err) {
    return NextResponse.json({ error: 'Erro crítico de aprovisionamento' }, { status: 500 });
  }
}