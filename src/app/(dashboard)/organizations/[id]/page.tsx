'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { entityService } from '@/services/entityService';
import { HzButton } from '@/components/ui/HzButton';
import { HzInput } from '@/components/ui/HzInput';
import { HzBadge } from '@/components/ui/HzBadge';
import { PhotoIcon, ArrowLeftIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';

export default function OrgDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [org, setOrg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    entityService.getEntityById(id as string).then(setOrg).finally(() => setLoading(false));
  }, [id]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !org) return;
    setUploading(true);
    try {
      const url = await entityService.uploadEntityMedia(file, org.slug, 'logo');
      const updated = await entityService.updateEntity(org.id, { logo_url: url });
      setOrg(updated);
      toast.success('Logo Atualizado!');
    } catch (err) { toast.error('Falha no upload'); }
    finally { setUploading(false); }
  };

  const save = async () => {
    try {
      await entityService.updateEntity(org.id, org);
      toast.success('Dados salvos!');
    } catch (err) { toast.error('Erro ao salvar'); }
  };

  if (loading) return <div className="p-20 text-center animate-pulse">Carregando Entidade...</div>;

  return (
    <div className="p-10 max-w-5xl mx-auto space-y-10">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <HzButton variant="ghost" onClick={() => router.push('/organizations')}><ArrowLeftIcon className="w-5 h-5"/></HzButton>
          <h1 className="text-3xl font-black">{org.display_name}</h1>
          <HzBadge>{org.category}</HzBadge>
        </div>
        <HzButton onClick={save} className="bg-black text-white px-8">Salvar Alterações</HzButton>
      </header>

      <div className="grid grid-cols-3 gap-8">
        {/* Branding */}
        <div className="bg-white p-6 rounded-[24px] border space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Branding</h3>
          <div className="relative group w-32 h-32 mx-auto bg-gray-50 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden">
            {org.logo_url ? <img src={org.logo_url} className="w-full h-full object-cover" /> : <PhotoIcon className="w-8 h-8 text-gray-200" />}
            <button onClick={() => fileRef.current?.click()} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold uppercase">Alterar</button>
            <input type="file" ref={fileRef} className="hidden" onChange={handleUpload} />
          </div>
        </div>

        {/* Dados Legais */}
        <div className="col-span-2 bg-white p-8 rounded-[24px] border grid grid-cols-2 gap-4">
          <HzInput label="CNPJ" value={org.cnpj || ''} onChange={e => setOrg({...org, cnpj: e.target.value})} placeholder="00.000.000/0000-00" />
          <HzInput label="Website" value={org.website || ''} onChange={e => setOrg({...org, website: e.target.value})} />
          <HzInput label="Localização" value={org.location || ''} onChange={e => setOrg({...org, location: e.target.value})} />
          <HzInput label="Setor" value={org.sector || ''} onChange={e => setOrg({...org, sector: e.target.value})} />
        </div>
      </div>
    </div>
  );
}