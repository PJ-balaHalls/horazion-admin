'use client';

import React from 'react';
import { HzButton } from '@/components/ui/HzButton';
import clsx from 'clsx';

export function UserSecurityTab({ auditLogs }: { auditLogs: any[] }) {
  return (
    <div className="animate-in fade-in max-w-5xl">
      <div className="p-8 border border-[#B6192E] bg-red-50/30 rounded-[16px] mb-8">
        <h3 className="text-[10px] font-bold uppercase text-[#B6192E] tracking-widest mb-4">Zona Crítica de Administração</h3>
        <div className="flex gap-4">
            <HzButton variant="secondary" className="bg-white border-black text-black text-xs h-10">Forçar Logout Global</HzButton>
            <HzButton variant="secondary" className="bg-white border-[#B6192E] text-[#B6192E] text-xs h-10 hover:bg-[#B6192E] hover:text-white transition-colors">Apagar Identidade</HzButton>
        </div>
      </div>

      <h3 className="text-[10px] font-bold uppercase text-[#A0A0A0] tracking-widest border-l-2 border-black pl-3 mb-6 mt-12">Log de Atividades (Audit Trail)</h3>
      <div className="border border-[#F2F2F2] rounded-[16px] overflow-hidden bg-white shadow-sm">
          <div className="grid grid-cols-12 p-4 bg-[#FAFAFA] text-[10px] font-bold uppercase tracking-widest text-[#545454] border-b border-[#F2F2F2]">
            <div className="col-span-5">Ação Executada</div>
            <div className="col-span-4">Metadados Analíticos (JSON)</div>
            <div className="col-span-3">Timestamp & Origem (IP)</div>
          </div>
          {auditLogs.length === 0 ? (
            <div className="p-12 text-center text-sm text-[#A0A0A0] font-medium">Sem logs registados.</div>
          ) : (
            auditLogs.map((log) => (
              <div key={log.id} className="grid grid-cols-12 p-4 text-sm border-b border-[#F2F2F2] items-center hover:bg-[#FAFAFA] transition-colors">
                <div className="col-span-5 flex items-center gap-3">
                  <span className={clsx("w-2 h-2 rounded-full", log.action.includes('UPDATED') ? "bg-blue-500" : log.action.includes('PROVISIONED') ? "bg-green-500" : "bg-black")} />
                  <span className="font-bold text-black">{log.action.replace(/_/g, ' ')}</span>
                </div>
                <div className="col-span-4 pr-4">
                  <pre className="text-[10px] font-mono text-[#545454] truncate max-w-[200px] bg-[#F2F2F2] p-2 rounded">{JSON.stringify(log.details)}</pre>
                </div>
                <div className="col-span-3 flex flex-col">
                  <span className="text-xs text-black font-medium">{new Date(log.created_at).toLocaleString('pt-BR')}</span>
                  <span className="font-mono text-[10px] text-[#A0A0A0] mt-0.5">IP: {log.ip_address || 'SISTEMA'}</span>
                </div>
              </div>
            ))
          )}
      </div>
    </div>
  );
}