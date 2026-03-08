// Mapeamento exato do Enum criado no Banco de Dados
export type StarRole = 'sirius' | 'canopus' | 'arcturus' | 'vega' | 'altair' | 'polaris' | 'sun';

export interface HorizionUser {
  id: string; // auth.users.id
  horizion_id: string; // Ex: HZ-9F3A-2K8Q-MR7D
  full_name: string;
  email: string;
  star_role: StarRole;
  avatar_url?: string | null;
  is_active: boolean;
}

// Estrutura padrão da nossa Biblioteca de Erros (Horizion Codex)
export interface HorizionError {
  error_code: string;
  system_message: string;
  user_message: string;
  explanation: string;
  solution: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
}