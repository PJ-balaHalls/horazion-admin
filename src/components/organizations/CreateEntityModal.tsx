// src/components/organizations/CreateEntityModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HzButton, HzInput, HzSelect, HzBadge } from '@/components/ui';
import { entityService } from '@/services/entityService';
import { toast } from 'sonner';
import { XMarkIcon, LinkIcon, CheckIcon } from '@heroicons/react/24/outline';

interface CreateEntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Matriz de 20 Benefícios (Horizion Benefits Engine)
const AVAILABLE_BENEFITS = [
  { id: 'verified_badge', label: 'Selo de Verificação Oficial' },
  { id: 'algo_priority', label: 'Prioridade no Algoritmo de Busca' },
  { id: 'api_read', label: 'Acesso à API Graph (Leitura)' },
  { id: 'api_write', label: 'Acesso à API Graph (Escrita)' },
  { id: 'advanced_analytics', label: 'Dashboard de Analytics Avançado' },
  { id: 'multi_seat', label: 'Gestão de Múltiplos Assentos (Seats)' },
  { id: 'support_247', label: 'Suporte Dedicado 24/7' },
  { id: 'zero_tax', label: 'Isenção de Taxa de Transação' },
  { id: 'custom_brand', label: 'Customização de Brand Colors' },
  { id: 'beta_features', label: 'Acesso Antecipado a Features' },
  { id: 'data_export', label: 'Exportação de Dados (CSV/JSON)' },
  { id: 'edu_integration', label: 'Integração: Horizion Education' },
  { id: 'startup_integration', label: 'Integração: Horizion Startups' },
  { id: 'sso_auth', label: 'Single Sign-On (SSO) Corporativo' },
  { id: 'audit_logs', label: 'Auditoria de Logs de Segurança' },
  { id: 'expanded_storage', label: 'Limites Expandidos (Storage)' },
  { id: 'expert_onboarding', label: 'Onboarding Assistido' },
  { id: 'partner_community', label: 'Acesso à Comunidade de Partners' },
  { id: 'direct_monetization', label: 'Monetização Direta de Conteúdo' },
  { id: 'ad_free', label: 'Remoção de Anúncios no Ecossistema' }
];

export function CreateEntityModal({ isOpen, onClose, onSuccess }: CreateEntityModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isAutoSlug, setIsAutoSlug] = useState(true);
  
  const [form, setForm] = useState({ 
    display_name: '', 
    slug: '', 
    category: 'company', 
    sector: 'official_account', 
    cnpj: '',
    website: '',
    plan: 'free',
    benefits: [] as string[]
  });

  // Reset seguro sempre que o modal abre
  useEffect(() => {
    if (isOpen) {
      setForm({ 
        display_name: '', slug: '', category: 'company', sector: 'official_account', 
        cnpj: '', website: '', plan: 'free', benefits: [] 
      });
      setIsAutoSlug(true);
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const generateSlug = (text: string) => {
    if (!text) return '';
    return text.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-')
      .replace(/^-+/, '').replace(/-+$/, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setForm(prev => {
      const next = { ...prev, display_name: newName };
      if (isAutoSlug) next.slug = generateSlug(newName);
      return next;
    });
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsAutoSlug(false);
    setForm(prev => ({ ...prev, slug: generateSlug(e.target.value) }));
  };

  const toggleBenefit = (benefitId: string) => {
    setForm(prev => ({
      ...prev,
      benefits: prev.benefits.includes(benefitId) 
        ? prev.benefits.filter(id => id !== benefitId) 
        : [...prev.benefits, benefitId]
    }));
  };

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    
    // Validação estrita do Frontend (Zero Trust)
    if (!form.display_name?.trim() || !form.slug?.trim() || !form.category) {
      toast.error('Preencha os campos obrigatórios (Nome, Slug e Categoria).');
      return;
    }

    setLoading(true);
    try {
      // Higienização de dados: se estiver vazio, envia explicitamente null (evita conflito de UNIQUE)
      const safeCnpj = form.cnpj?.trim() !== '' ? form.cnpj.trim() : null;
      const safeWebsite = form.website?.trim() !== '' ? form.website.trim() : null;

      // Construção do Payload rigoroso para o Supabase
      const payload = {
        display_name: form.display_name.trim(),
        slug: form.slug.trim(),
        category: form.category,
        sector: form.sector,
        cnpj: safeCnpj,
        website: safeWebsite,
        billing_info: {
          tax_id: safeCnpj,
          plan: form.plan,
          billing_cycle: 'monthly',
          payment_method: null
        },
        metadata: {
          branding: { icon_url: null, isologo_url: null, primary_color: "#B6192E" },
          products: [],
          hierarchy: { level: "master", parent_id: null },
          benefits_engine: {
            active_benefits: form.benefits
          }
        }
      };

      const data = await entityService.createEntity(payload);
      toast.success('Entidade aprovisionada com sucesso!');
      onSuccess();
      onClose();
      router.push(`/organizations/${data.id}`);
    } catch (err: any) {
      console.error("Detalhe do erro no handleSubmit:", err);
      toast.error(err.message || err.user_message || 'Erro crítico ao provisionar organização.');
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
          <div>
            <h2 className="text-xl font-bold text-black">Aprovisionamento de Entidade</h2>
            <p className="text-xs text-gray-500 mt-1">Configure o perfil base da nova organização no ecossistema Horizion.</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <XMarkIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        {/* Body (Duas colunas) */}
        <div className="p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* COLUNA ESQUERDA: Dados Base */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-black border-b border-gray-100 pb-2">01. Identidade e Deep Link</h3>
              <HzInput required label="Nome Comercial *" placeholder="Ex: Horizion Group" value={form.display_name} onChange={handleNameChange} />
              <HzInput required label="Identificador Único (Slug) *" placeholder="ex: horizion-group" value={form.slug} onChange={handleSlugChange} />
              
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center">
                    <LinkIcon className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest block mb-0.5">Deep Link Horazion</span>
                    <span className="text-sm font-medium text-black truncate block">
                      horazion.life/o/<span className="text-[#B6192E] font-bold">{form.slug || 'slug'}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-black border-b border-gray-100 pb-2">02. Escopo Operacional</h3>
              <div className="grid grid-cols-2 gap-4">
                <HzSelect 
                  label="Categoria Geral *" 
                  value={form.category} 
                  onChange={val => setForm({...form, category: val as string})} 
                  options={[
                    {value: 'holding', label: 'Holding / Grupo'}, 
                    {value: 'company', label: 'Empresa Privada'}, 
                    {value: 'education', label: 'Instituição de Ensino'},
                    {value: 'startup', label: 'Startup'},
                    {value: 'partner', label: 'Parceiro (Creator)'}
                  ]} 
                />
                <HzSelect 
                  label="Escopo de Atuação *" 
                  value={form.sector} 
                  onChange={val => setForm({...form, sector: val as string})} 
                  options={[
                    {value: 'official_account', label: 'Conta Oficial (Marca)'}, 
                    {value: 'campaign', label: 'Campanha/Evento'}, 
                    {value: 'franchise', label: 'Franquia/Filial'},
                    {value: 'subsidiary', label: 'Subsidiária'},
                    {value: 'community', label: 'Comunidade Temática'},
                    {value: 'independent_creator', label: 'Creator Independente'},
                    {value: 'internal_department', label: 'Departamento Interno'}
                  ]} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <HzInput label="CNPJ / NIF / Tax ID" placeholder="00.000.000/0001-00" value={form.cnpj} onChange={e => setForm({...form, cnpj: e.target.value})} />
                <HzSelect label="Plano Inicial" value={form.plan} onChange={val => setForm({...form, plan: val as string})} options={[ {value: 'free', label: 'Free'}, {value: 'pro', label: 'Pro'}, {value: 'education', label: 'Education'}, {value: 'enterprise', label: 'Enterprise'} ]} />
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA: Benefícios */}
          <div className="space-y-4 flex flex-col h-full">
             <div className="flex justify-between items-end border-b border-gray-100 pb-2 shrink-0">
                <h3 className="text-sm font-bold text-black">03. Matriz de Benefícios Associados</h3>
                <span className="text-xs font-mono text-[#B6192E] bg-red-50 px-2 py-1 rounded-md font-bold">
                  {form.benefits.length} Selecionados
                </span>
             </div>
             <p className="text-xs text-gray-500 shrink-0">Selecione os recursos e privilégios que esta entidade terá desbloqueados nativamente no ecossistema.</p>
             
             {/* Lista scrollável com estilo Horizon Clarity */}
             <div className="grid grid-cols-1 gap-2 flex-1 overflow-y-auto pr-2 custom-scrollbar pb-4">
               {AVAILABLE_BENEFITS.map((benefit) => {
                 const isSelected = form.benefits.includes(benefit.id);
                 return (
                   <button
                     key={benefit.id}
                     type="button"
                     onClick={() => toggleBenefit(benefit.id)}
                     className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all duration-200 ${
                       isSelected ? 'border-[#B6192E] bg-red-50/20' : 'border-gray-200 bg-white hover:border-gray-300'
                     }`}
                   >
                     <span className={`text-xs font-medium ${isSelected ? 'text-[#B6192E]' : 'text-gray-700'}`}>
                       {benefit.label}
                     </span>
                     <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${isSelected ? 'bg-[#B6192E] border-[#B6192E]' : 'border-gray-300 bg-gray-50'}`}>
                       {isSelected && <CheckIcon className="w-3 h-3 text-white" strokeWidth={3} />}
                     </div>
                   </button>
                 );
               })}
             </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3 justify-end rounded-b-2xl">
          <HzButton type="button" variant="ghost" className="px-6 border border-gray-200 bg-white" onClick={onClose}>
            Cancelar
          </HzButton>
          <HzButton type="submit" onClick={handleSubmit} isLoading={loading} className="bg-[#B6192E] text-white px-8 hover:bg-red-800 transition-colors">
            Aprovisionar Entidade
          </HzButton>
        </div>
      </form>
    </div>
  );
}