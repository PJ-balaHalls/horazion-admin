import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const ProfileUpdateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string().min(1),
  role: z.string(),
  horizion_id: z.string(),
  flags: z.object({
    send_notification: z.boolean(),
    require_completion: z.boolean(),
    agree_terms: z.boolean()
  })
}).passthrough();

const cleanStr = (val: any) => {
  if (typeof val === 'string') {
    const trimmed = val.trim();
    return trimmed !== '' ? trimmed : null;
  }
  return null;
};

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("FALHA DE AMBIENTE: Variáveis do Supabase não estão definidas no servidor.");
    }

    let body;
    try { 
      body = await req.json(); 
    } catch (e) { 
      throw new Error("FALHA DE PAYLOAD: O corpo enviado pelo frontend não é um JSON válido."); 
    }

    const parsed = ProfileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error_code: "HZ-PROF_003", user_message: "Validação estrutural falhou.", details: parsed.error.issues }, { status: 400 });
    }

    if (!parsed.data.flags.agree_terms) {
      return NextResponse.json({ error_code: "HZ-SEC_001", user_message: "É obrigatório confirmar a aceitação dos Termos de Serviço." }, { status: 400 });
    }

    const validData = parsed.data;
    const rawData = validData as any;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, { auth: { autoRefreshToken: false, persistSession: false } });

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: validData.email,
      password: validData.password,
      email_confirm: true,
      user_metadata: { full_name: validData.full_name }
    });

    if (authError) {
      return NextResponse.json({ error_code: "HZ-AUTH_001", user_message: authError.message, details: authError }, { status: 400 });
    }

    if (!authData || !authData.user) {
      throw new Error("FALHA CRÍTICA: O Supabase não devolveu o objeto do utilizador recém-criado.");
    }

    const documentId = cleanStr(rawData.document_id);
    const cep = cleanStr(rawData.cep);
    const address = cleanStr(rawData.address);
    const city = cleanStr(rawData.city);
    const rawState = cleanStr(rawData.state);
    const dbState = rawState ? rawState.substring(0, 2).toUpperCase() : null;
    const rawCountry = cleanStr(rawData.country);
    const dbCountry = rawCountry ? rawCountry.substring(0, 2).toUpperCase() : null;

    // [ARCH-HZ-014] Trade-off de Segurança: Armazenar a senha provisória apenas para o primeiro acesso.
    const structuredCustomData = {
      personal_info: {
        document_id: documentId,
        pronouns: cleanStr(rawData.pronouns),
        birth_date: cleanStr(rawData.birth_date),
        phone: cleanStr(rawData.phone),
        bio: cleanStr(rawData.bio),
        occupation: cleanStr(rawData.occupation),
        company: cleanStr(rawData.company),
        timezone: cleanStr(rawData.timezone),
        preferred_language: cleanStr(rawData.preferred_language),
      },
      social_links: rawData.custom_data || {},
      permissions: rawData.permissions || {},
      system_flags: {
        must_complete_profile: validData.flags.require_completion,
        notification_sent: validData.flags.send_notification,
        provisional_password: validData.password // Gravado para permitir exibição na Dashboard
      },
      preferences: { ads_enabled: true, profile_promoted: false, focus_mode: false, hide_metrics: false }
    };

    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      id: authData.user.id,
      horizion_id: validData.horizion_id,
      full_name: validData.full_name,
      email: validData.email,
      role: validData.role,
      cep: cep,
      address: address,
      city: city,
      state: dbState,
      country: dbCountry,
      custom_data: structuredCustomData,
      is_active: true
    });

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error_code: "HZ-DB_001", user_message: "Falha ao gravar identidade na tabela profiles.", details: profileError }, { status: 400 });
    }

    try {
      const ipAddress = req.headers.get('x-forwarded-for') || '127.0.0.1';
      await supabaseAdmin.schema('admin').from('audit_logs').insert({
        target_id: authData.user.id,
        action: 'IDENTITY_PROVISIONED',
        details: { role_assigned: validData.role, created_via: 'Horazion Admin Dashboard' },
        ip_address: ipAddress
      });
    } catch (auditException) {
      console.warn("[HORAZION WARNING] Falha no audit log:", auditException);
    }

    return NextResponse.json({ success: true, userId: authData.user.id });

  } catch (err: any) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("[HORAZION CORE FATAL ERROR]", errorMessage);
    return NextResponse.json({ error_code: "HZ-SYS_500", user_message: "Erro crítico no servidor.", details: errorMessage }, { status: 500 });
  }
}