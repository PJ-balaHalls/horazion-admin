'use client';
import React from 'react';

export function UserDataTab({ user }: { user: any }) {
  return (
    <div className="animate-in fade-in space-y-6">
      <p className="text-xs text-[#545454] font-medium border-l-2 border-[#B6192E] pl-3">
        Acesso direto ao Payload JSONB injetado no ecossistema PostgreSQL.
      </p>
      <div className="bg-[#0A0A0A] p-6 rounded-[16px] overflow-auto border border-[#333] shadow-inner">
        <pre className="text-[#00FF41] font-mono text-[11px] leading-relaxed">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
    </div>
  );
}