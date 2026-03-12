export interface HorizionError {
  error_code: string;
  user_message: string;
  explanation: string;
  solution: string;
  severity: 'warning' | 'error' | 'critical';
}

export function parseHorizionError(error: any): HorizionError {
  console.error("[Horizion Debug]:", error);

  // Erro PGRST106 - Schema não exposto
  if (error?.code === 'PGRST106') {
    return {
      error_code: 'HZ-SYS-106',
      user_message: 'Schema "admin" não configurado.',
      explanation: 'A API do Supabase não tem permissão para aceder ao schema administrativo.',
      solution: 'Vá às configurações de API no Supabase e adicione "admin" aos "Exposed Schemas".',
      severity: 'critical'
    };
  }

  if (error?.code === '23505') {
    return {
      error_code: 'HZ-ORG-001',
      user_message: 'Registo Duplicado.',
      explanation: 'O Slug ou CNPJ já existe no sistema.',
      solution: 'Verifique se a organização já foi criada.',
      severity: 'warning'
    };
  }

  return {
    error_code: 'HZ-SYS-500',
    user_message: 'Erro Inesperado.',
    explanation: error?.message || 'Falha na comunicação com o banco.',
    solution: 'Tente recarregar a página ou verifique o console.',
    severity: 'error'
  };
}