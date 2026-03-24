'use client';
import React from 'react';

export function UserDataTab({ user }: { user: any }) {
  if (!user) {
    return (
      <div className="animate-in fade-in space-y-6">
        <p className="text-xs text-[#545454] font-medium border-l-2 border-[#B6192E] pl-3">
          Acesso direto ao Payload JSONB injetado no ecossistema PostgreSQL.
        </p>
        <div className="bg-[#0A0A0A] p-6 rounded-[16px] border border-[#333] shadow-inner flex items-center justify-center min-h-[200px]">
          <span className="text-[#B6192E] font-mono text-xs">
            [SYS_ERR] PAYLOAD_NOT_FOUND: Dados do utilizador indisponíveis para a renderização do bloco.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in space-y-6">
      <p className="text-xs text-[#545454] font-medium border-l-2 border-[#B6192E] pl-3">
        Acesso direto ao Payload JSONB injetado no ecossistema PostgreSQL.
      </p>
      <div className="bg-[#0A0A0A] p-6 rounded-[16px] overflow-auto border border-[#333] shadow-inner max-h-[600px] custom-scrollbar">
        <pre className="text-[#00FF41] font-mono text-[11px] leading-relaxed">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
    </div>
  );
}