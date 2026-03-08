'use client';

import React, { useRef } from 'react';
import { HzButton } from '@/components/ui/HzButton';

export function UserOverviewTab({ user }: { user: any }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { personal_info, system_flags } = user.custom_data;
  const provPassword = system_flags?.provisional_password;

  const getCleanTextCredentials = () => {
    const docId = personal_info?.document_id || 'o seu CPF/Documento';
    const passText = provPassword ? provPassword : '[Senha definitiva já configurada pelo titular]';
    return `Horizion Life | Credenciais de Acesso Oficial\n\nOlá, ${user.full_name}. A sua identidade digital foi aprovisionada com sucesso.\n\nDetalhes da Conta:\nE-mail: ${user.email}\nHorizion ID: ${user.horizion_id}\nSenha Provisória: ${passText}\n\nInstruções para o Primeiro Acesso:\nAcesso no app ou site em criar conta e completar cadastro informando seu CPF (${docId}) para validação de segurança.\n\nSuporte Técnico: suporte@horazion.com`;
  };

  const handleCopyCredentials = () => {
    navigator.clipboard.writeText(getCleanTextCredentials());
    alert('Credenciais copiadas para a área de transferência.');
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Horizion Life | Acesso Oficial - ${user.full_name}`);
    const body = encodeURIComponent(getCleanTextCredentials());
    window.location.href = `mailto:${user.email}?subject=${subject}&body=${body}`;
  };

  const handleDownloadTxt = () => {
    const element = document.createElement("a");
    const file = new Blob([getCleanTextCredentials()], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Acesso_Horizion_${user.full_name.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element); element.click(); document.body.removeChild(element);
  };

  const handlePrintCard = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Credenciais - ${user.full_name}</title><style>body { font-family: sans-serif; padding: 40px; } .card { border: 1px solid #ccc; padding: 30px; border-radius: 12px; max-width: 600px; } .label { font-size: 10px; color: #666; text-transform: uppercase; font-weight: bold; } .value { font-size: 16px; margin-bottom: 20px; font-weight: bold; } .instructions { background: #f9f9f9; padding: 15px; border-radius: 8px; font-size: 14px; line-height: 1.5; }</style></head>
          <body>
            <div class="card">
              <h2>Horizion Life | Credenciais Oficiais</h2>
              <div class="label">Titular</div><div class="value">${user.full_name}</div>
              <div class="label">E-mail</div><div class="value">${user.email}</div>
              <div class="label">Horizion ID</div><div class="value">${user.horizion_id}</div>
              <div class="label">Senha Provisória</div><div class="value" style="color: #B6192E;">${provPassword || '[Já configurada]'}</div>
              <div class="instructions"><strong>Instruções:</strong><br/>Acesso no app ou site em criar conta e completar cadastro informando seu CPF para validação de segurança.</div>
            </div>
            <script>window.onload = function() { window.print(); window.close(); };</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="grid grid-cols-5 gap-12 animate-in fade-in">
      <div className="col-span-2 space-y-4">
        <div ref={cardRef} className="bg-white rounded-[16px] border border-[#F2F2F2] shadow-sm overflow-hidden sticky top-8">
          <div className="p-8 border-b border-[#F2F2F2]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold">H</div>
              <h3 className="text-lg font-bold text-black tracking-tighter">Horizion Life</h3>
            </div>
            <div className="space-y-4">
              <div><p className="text-[10px] font-bold uppercase text-[#A0A0A0] tracking-widest">Titular</p><p className="text-sm font-bold text-black">{user.full_name}</p></div>
              <div><p className="text-[10px] font-bold uppercase text-[#A0A0A0] tracking-widest">E-mail</p><p className="text-sm font-medium text-black">{user.email}</p></div>
              <div><p className="text-[10px] font-bold uppercase text-[#A0A0A0] tracking-widest">Horizion ID</p><p className="text-sm font-mono text-black">{user.horizion_id}</p></div>
              <div>
                <p className="text-[10px] font-bold uppercase text-[#A0A0A0] tracking-widest">Senha Provisória</p>
                <div className="inline-flex items-center gap-2 mt-1">
                  <p className="text-lg font-mono font-bold text-[#B6192E]">{provPassword || '********'}</p>
                  {!provPassword && <span className="text-[10px] text-[#A0A0A0]">(Protegida/Alterada)</span>}
                </div>
              </div>
            </div>
            <div className="mt-8 p-4 bg-[#FAFAFA] rounded-[8px] border border-[#E5E5E5]">
              <p className="text-xs text-[#545454] leading-relaxed font-medium">Acesso no app ou site em <strong className="text-black">criar conta e completar cadastro</strong> informando seu CPF para validação de segurança.</p>
            </div>
          </div>
          <div className="bg-[#FAFAFA] p-4 grid grid-cols-2 gap-2">
            <HzButton variant="secondary" onClick={handleCopyCredentials} className="bg-white text-xs h-10 border-[#E5E5E5] hover:border-black text-black">Copiar Texto</HzButton>
            <HzButton variant="secondary" onClick={handleEmailShare} className="bg-white text-xs h-10 border-[#E5E5E5] hover:border-black text-black">Enviar E-mail</HzButton>
            <HzButton variant="secondary" onClick={handleDownloadTxt} className="bg-white text-xs h-10 border-[#E5E5E5] hover:border-black text-black">Baixar (.txt)</HzButton>
            <HzButton variant="secondary" onClick={handlePrintCard} className="bg-white text-xs h-10 border-[#E5E5E5] hover:border-black text-black">Imprimir / PDF</HzButton>
          </div>
        </div>
      </div>

      <div className="col-span-3 space-y-10">
        <div className="space-y-6">
          <h3 className="text-[10px] font-bold uppercase text-[#A0A0A0] tracking-widest border-l-2 border-black pl-3">Metadados Pessoais</h3>
          <div className="bg-white border border-[#F2F2F2] rounded-[16px] overflow-hidden text-sm">
            <div className="grid grid-cols-3 border-b border-[#F2F2F2] p-4"><span className="text-[#545454] font-medium">CPF / Doc</span><span className="col-span-2 font-mono text-black">{personal_info.document_id || '—'}</span></div>
            <div className="grid grid-cols-3 border-b border-[#F2F2F2] p-4"><span className="text-[#545454] font-medium">Ocupação</span><span className="col-span-2 font-bold text-black">{personal_info.occupation || '—'} at {personal_info.company || '—'}</span></div>
            <div className="grid grid-cols-3 border-b border-[#F2F2F2] p-4"><span className="text-[#545454] font-medium">Telefone</span><span className="col-span-2 font-bold text-black">{personal_info.phone || '—'}</span></div>
            <div className="grid grid-cols-3 p-4"><span className="text-[#545454] font-medium">Data de Registo</span><span className="col-span-2 text-black">{new Date(user.created_at).toLocaleString('pt-BR')}</span></div>
          </div>
        </div>
        <div className="space-y-6">
          <h3 className="text-[10px] font-bold uppercase text-[#A0A0A0] tracking-widest border-l-2 border-black pl-3">Geolocalização</h3>
          <div className="bg-white border border-[#F2F2F2] rounded-[16px] overflow-hidden text-sm">
            <div className="grid grid-cols-3 border-b border-[#F2F2F2] p-4"><span className="text-[#545454] font-medium">Cidade / Estado</span><span className="col-span-2 font-bold text-black">{user.city || '—'} / {user.state || '—'}</span></div>
            <div className="grid grid-cols-3 p-4"><span className="text-[#545454] font-medium">Morada</span><span className="col-span-2 text-black">{user.address || '—'} {user.cep ? `(${user.cep})` : ''}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}