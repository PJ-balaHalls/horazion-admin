'use client';

import React, { useEffect, useState } from 'react';
import { HzButton } from '@/components/ui/HzButton';
import { HzSkeleton } from '@/components/ui/HzSkeleton';
import { supabase } from '@/lib/supabase';
import clsx from 'clsx';

export function UserSecurityTab({ userId }: { userId: string | undefined }) {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('audit_logs')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50);
        
        if (error) {
          // Absorção do erro para não corromper o render React. (Zero Trust no BD)
          console.warn("[BD-HZ] Consulta ignorada ou bloqueada (RLS / Tabela inexistente):", error.message);
          setAuditLogs([]);
          return;
        }
        
        setAuditLogs(data || []);
      } catch (error) {
        console.warn("[SYS-WARN] Exceção em módulo crítico isolada:", error);
        setAuditLogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, [userId]);

  if (loading) {
    return (
      <div className="animate-in fade-in space-y-8 max-w-5xl">
         <HzSkeleton className="h-32 w-full rounded-[16px]" />
         <HzSkeleton className="h-64 w-full rounded-[16px]" />
      </div>
    );
  }

  const safeLogs = Array.isArray(auditLogs) ? auditLogs : [];

  return (
    <div className="animate-in fade-in max-w-5xl">
      <div className="p-8 border border-[#B6192E] bg-red-50/30 rounded-[16px] mb-8">
        <h3 className="text-[10px] font-bold uppercase text-[#B6192E] tracking-widest mb-4">Zona Crítica de Administração</h3>
        <div className="flex gap-4">
            <HzButton variant="secondary" className="bg-white border-black text-black text-xs h-10 hover:bg-black hover:text-white transition-colors">Forçar Logout Global</HzButton>
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
          
          {safeLogs.length === 0 ? (
            <div className="p-12 text-center text-sm text-[#A0A0A0] font-medium bg-white">
              Sem registos de auditoria disponíveis para esta identidade.
            </div>
          ) : (
            safeLogs.map((log) => (
              <div key={log.id || crypto.randomUUID()} className="grid grid-cols-12 p-4 text-sm border-b border-[#F2F2F2] items-center hover:bg-[#FAFAFA] transition-colors">
                <div className="col-span-5 flex items-center gap-3">
                  <span className={clsx(
                    "w-2 h-2 rounded-full", 
                    log.action?.includes('UPDATED') ? "bg-blue-500" : 
                    log.action?.includes('PROVISIONED') ? "bg-green-500" : 
                    "bg-black"
                  )} />
                  <span className="font-bold text-black">{log.action ? log.action.replace(/_/g, ' ') : 'AÇÃO_DESCONHECIDA'}</span>
                </div>
                <div className="col-span-4 pr-4">
                  <pre className="text-[10px] font-mono text-[#545454] truncate max-w-[200px] bg-[#F2F2F2] p-2 rounded">
                    {log.details ? JSON.stringify(log.details) : '{}'}
                  </pre>
                </div>
                <div className="col-span-3 flex flex-col">
                  <span className="text-xs text-black font-medium">{log.created_at ? new Date(log.created_at).toLocaleString('pt-PT') : '—'}</span>
                  <span className="font-mono text-[10px] text-[#A0A0A0] mt-0.5">IP: {log.ip_address || 'SISTEMA'}</span>
                </div>
              </div>
            ))
          )}
      </div>
    </div>
  );
}