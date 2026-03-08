'use client';

import React, { useState } from 'react';
import clsx from 'clsx';

// Definição tipada baseada na matriz enviada
type StarRole = 'sirius' | 'canopus' | 'arcturus' | 'vega' | 'altair' | 'polaris' | 'sun';

interface PermissionAction {
  id: string;
  label: string;
  category: 'users' | 'content' | 'system';
  defaultRoles: StarRole[];
}

const PERMISSIONS_DATA: PermissionAction[] = [
  { id: 'create_users', label: 'Criar usuários', category: 'users', defaultRoles: ['sirius', 'canopus'] },
  { id: 'edit_users', label: 'Editar usuários', category: 'users', defaultRoles: ['sirius', 'canopus', 'arcturus'] },
  { id: 'ban_users', label: 'Banir usuários', category: 'users', defaultRoles: ['sirius', 'canopus', 'arcturus', 'vega'] },
  { id: 'suspend_users', label: 'Suspender temporariamente', category: 'users', defaultRoles: ['sirius', 'canopus', 'arcturus', 'vega', 'altair'] },
  { id: 'edit_system_permissions', label: 'Editar permissões do sistema', category: 'system', defaultRoles: ['sirius'] },
  { id: 'create_public_posts', label: 'Criar posts públicos', category: 'content', defaultRoles: ['sirius', 'canopus', 'arcturus', 'vega', 'altair', 'polaris', 'sun'] },
  { id: 'delete_any_content', label: 'Excluir qualquer conteúdo', category: 'content', defaultRoles: ['sirius', 'canopus', 'arcturus', 'vega'] },
];

const ROLES: { id: StarRole; label: string; icon: string }[] = [
  { id: 'sirius', label: 'Sirius', icon: '⭐' },
  { id: 'canopus', label: 'Canopus', icon: '⭐' },
  { id: 'arcturus', label: 'Arcturus', icon: '⭐' },
  { id: 'vega', label: 'Vega', icon: '⭐' },
  { id: 'altair', label: 'Altair', icon: '⭐' },
  { id: 'polaris', label: 'Polaris', icon: '⭐' },
  { id: 'sun', label: 'Sun', icon: '☀' },
];

export function PermissionsMatrix() {
  // Estado local simulando a edição dinâmica da tabela
  const [permissions, setPermissions] = useState<Record<string, StarRole[]>>(
    PERMISSIONS_DATA.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.defaultRoles }), {})
  );

  const togglePermission = (actionId: string, role: StarRole) => {
    setPermissions((prev) => {
      const currentRoles = prev[actionId];
      if (currentRoles.includes(role)) {
        return { ...prev, [actionId]: currentRoles.filter((r) => r !== role) };
      }
      return { ...prev, [actionId]: [...currentRoles, role] };
    });
  };

  const savePermissions = () => {
    // [CORE-HZ-003] Aqui conectaremos com a tabela admin.role_permissions via Supabase RPC
    console.log('Permissões salvas (Payload):', permissions);
    alert('Matriz de permissões atualizada com sucesso no servidor.');
  };

  return (
    <div className="bg-white rounded-xl border border-[#F2F2F2] overflow-hidden shadow-sm">
      <div className="p-6 border-b border-[#F2F2F2] flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-black">Matriz de Permissões</h2>
          <p className="text-sm text-[#545454] mt-1">
            Controle de fluxo baseado na hierarquia estelar Horizion.
          </p>
        </div>
        <button
          onClick={savePermissions}
          className="bg-[#B6192E] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-opacity-90 transition-all"
        >
          Salvar Alterações
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F9FAFB] border-b border-[#F2F2F2]">
              <th className="p-4 text-sm font-semibold text-black w-1/4">Ação / Regra</th>
              {ROLES.map((role) => (
                <th key={role.id} className="p-4 text-center text-xs font-semibold text-[#545454] uppercase">
                  <span className="block text-base mb-1">{role.icon}</span>
                  {role.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F2F2F2]">
            {PERMISSIONS_DATA.map((action) => (
              <tr key={action.id} className="hover:bg-[#FAFAFA] transition-colors group">
                <td className="p-4 text-sm font-medium text-black">
                  {action.label}
                  <span className="block text-xs text-[#545454] font-normal mt-0.5">
                    Módulo: {action.category}
                  </span>
                </td>
                {ROLES.map((role) => {
                  const isAllowed = permissions[action.id].includes(role.id);
                  return (
                    <td key={role.id} className="p-4 text-center">
                      <label className="relative flex items-center justify-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={isAllowed}
                          onChange={() => togglePermission(action.id, role.id)}
                          // Proteção arquitetural: Sirius não pode perder privilégios base de sistema
                          disabled={role.id === 'sirius' && action.category === 'system'}
                        />
                        <div
                          className={clsx(
                            "w-5 h-5 border rounded flex items-center justify-center transition-all",
                            isAllowed 
                              ? "bg-[#B6192E] border-[#B6192E] text-white" 
                              : "bg-white border-[#E5E7EB] text-transparent hover:border-[#B6192E]"
                          )}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </label>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}