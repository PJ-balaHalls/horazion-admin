import React from 'react';
import { HzInput, HzSelect } from '@/components/ui';

export function EntityBillingTab({ formData, setFormData }: { formData: any, setFormData: any }) {
  const billing = formData?.billing_info || {};
  const limits = formData?.resource_limits || {};

  const updateBilling = (field: string, value: any) => {
    const finalValue = value?.target !== undefined ? value.target.value : value;
    setFormData({ ...formData, billing_info: { ...billing, [field]: finalValue } });
  };
  
  const updateLimits = (field: string, value: any) => {
    const finalValue = value?.target !== undefined ? value.target.value : value;
    setFormData({ ...formData, resource_limits: { ...limits, [field]: Number(finalValue) } });
  };

  return (
    <div className="space-y-10 animate-in fade-in">
      <div>
        <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-5">Governança Comercial</h2>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Plano Atual</label>
            <HzSelect 
              value={billing.plan || 'free'} 
              onChange={v => updateBilling('plan', v)}
              options={[
                { value: 'free', label: 'Free Tier' },
                { value: 'pro', label: 'Pro' },
                { value: 'enterprise', label: 'Enterprise' }
              ]}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Ciclo de Faturamento</label>
            <HzSelect 
              value={billing.billing_cycle || 'monthly'} 
              onChange={v => updateBilling('billing_cycle', v)}
              options={[
                { value: 'monthly', label: 'Mensal' },
                { value: 'annual', label: 'Anual' }
              ]}
            />
          </div>
          <div className="space-y-2 col-span-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Tax ID / Número Fiscal</label>
            <HzInput value={billing.tax_id || ''} onChange={e => updateBilling('tax_id', e.target.value)} />
          </div>
        </div>
      </div>
      <div>
        <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-5">Limites de Infraestrutura (Quotas)</h2>
        <div className="grid grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Max Usuários</label>
            <HzInput type="number" value={limits.max_users || 0} onChange={e => updateLimits('max_users', e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">API Quota (Chamadas)</label>
            <HzInput type="number" value={limits.api_calls_quota || 0} onChange={e => updateLimits('api_calls_quota', e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Storage (GB)</label>
            <HzInput type="number" value={limits.storage_limit_gb || 0} onChange={e => updateLimits('storage_limit_gb', e.target.value)} />
          </div>
        </div>
      </div>
    </div>
  );
}