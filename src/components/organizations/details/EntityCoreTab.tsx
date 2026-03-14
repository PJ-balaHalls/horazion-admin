import React from 'react';
import { HzInput, HzSelect } from '@/components/ui';

export function EntityCoreTab({ formData, setFormData }: { formData: any, setFormData: any }) {
  // Ajustado para receber tanto eventos nativos quanto valores diretos (Zero Trust na UI)
  const updateField = (field: string, value: any) => {
    const finalValue = value?.target !== undefined ? value.target.value : value;
    setFormData({ ...formData, [field]: finalValue });
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Identidade da Organização</h2>
        <p className="text-sm text-gray-500">Dados base que definem a entidade no ecossistema.</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase">Nome de Exibição</label>
          <HzInput value={formData?.display_name || ''} onChange={e => updateField('display_name', e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase">Slug (Identificador URL)</label>
          <HzInput value={formData?.slug || ''} onChange={e => updateField('slug', e.target.value)} className="font-mono text-sm" />
        </div>
        
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase">Categoria B2B</label>
          <HzSelect 
            value={formData?.category || 'company'} 
            onChange={v => updateField('category', v)}
            options={[
              { value: 'company', label: 'Empresa (Company)' },
              { value: 'institution', label: 'Instituição de Ensino' },
              { value: 'startup', label: 'Startup' }
            ]}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase">Status da Conta</label>
          <HzSelect 
            value={formData?.status || 'active'} 
            onChange={v => updateField('status', v)}
            options={[
              { value: 'active', label: 'Ativo (Operando)' },
              { value: 'suspended_billing', label: 'Suspenso (Faturamento)' },
              { value: 'pending_verification', label: 'Pendente de Verificação' },
              { value: 'archived', label: 'Arquivado' }
            ]}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase">CNPJ / Documento Legal</label>
          <HzInput value={formData?.cnpj || ''} onChange={e => updateField('cnpj', e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase">Website Oficial</label>
          <HzInput value={formData?.website || ''} onChange={e => updateField('website', e.target.value)} />
        </div>
        <div className="space-y-2 col-span-2">
          <label className="text-xs font-bold text-gray-500 uppercase">Setor de Atuação</label>
          <HzInput value={formData?.sector || ''} onChange={e => updateField('sector', e.target.value)} />
        </div>
      </div>
    </div>
  );
}