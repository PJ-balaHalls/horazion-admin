import { supabase } from '@/lib/supabase';
import { StarRole } from '@/types/horizion';

export const userService = {
  // ==========================================
  // 1. GESTÃO DE CARGOS E IDENTIDADE
  // ==========================================
  async changeUserRole(userId: string, newRole: StarRole, actorId: string) {
    // 1. Atualiza o perfil
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    if (error) throw error;

    // 2. Registra no Log de Auditoria
    await this.logAuditAction(actorId, userId, `Cargo alterado para ${newRole}`, null);
  },

  async updateUserProfile(userId: string, data: { full_name?: string; email?: string; avatar_url?: string }) {
    const { error } = await supabase.from('profiles').update(data).eq('id', userId);
    if (error) throw error;
  },

  // ==========================================
  // 2. MODERAÇÃO E PUNIÇÕES
  // ==========================================
  async applyStrike(userId: string, reason: string, actorId: string) {
    const { error } = await supabase.from('user_moderation').insert({
      user_id: userId,
      action_type: 'strike',
      reason,
      applied_by: actorId
    });
    if (error) throw error;
    await this.logAuditAction(actorId, userId, 'Strike aplicado', { reason });
  },

  async suspendUser(userId: string, reason: string, days: number, actorId: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

    await supabase.from('profiles').update({ is_active: false }).eq('id', userId);
    await supabase.from('user_moderation').insert({
      user_id: userId,
      action_type: 'suspend',
      reason,
      applied_by: actorId,
      expires_at: expiresAt.toISOString()
    });
    await this.logAuditAction(actorId, userId, `Suspensão (${days} dias)`, { reason });
  },

  async banUserPermanently(userId: string, reason: string, actorId: string) {
    await supabase.from('profiles').update({ is_active: false }).eq('id', userId);
    await supabase.from('user_moderation').insert({
      user_id: userId,
      action_type: 'ban',
      reason,
      applied_by: actorId,
      expires_at: null // Permanente
    });
    await this.logAuditAction(actorId, userId, 'Banimento Permanente', { reason });
  },

  async restoreUser(userId: string, actorId: string) {
    await supabase.from('profiles').update({ is_active: true }).eq('id', userId);
    await supabase.from('user_moderation').insert({
      user_id: userId,
      action_type: 'unban',
      reason: 'Restauração manual de conta',
      applied_by: actorId
    });
    await this.logAuditAction(actorId, userId, 'Conta Restaurada', null);
  },

  // ==========================================
  // 3. SEGURANÇA E VERIFICAÇÃO
  // ==========================================
  async verifyAccount(userId: string, actorId: string) {
    // Insere ou atualiza o status de verificação na tabela user_security
    const { error } = await supabase.from('user_security').upsert({
      user_id: userId,
      is_verified: true,
      document_status: 'approved',
      updated_at: new Date().toISOString()
    });
    if (error) throw error;
    await this.logAuditAction(actorId, userId, 'Selo de Verificação Concedido', null);
  },

  // ==========================================
  // 4. AUDITORIA E LOGS GERAIS
  // ==========================================
  async logAuditAction(actorId: string, targetId: string, action: string, details: any) {
    await supabase.from('audit_logs').insert({
      actor_id: actorId,
      target_id: targetId,
      action,
      details: details || {}
    });
  }
};