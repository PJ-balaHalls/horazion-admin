import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { StarRole } from '@/types/horizion';

export function useAuthGuard(requiredRoles?: StarRole[]) {
  const { user, isAuthenticated, isChecking, checkSession } = useAuthStore();

  useEffect(() => {
    // Apenas checa se for a primeira vez que o hook monta
    if (!isAuthenticated && isChecking) {
      checkSession();
    }
  }, [isAuthenticated, isChecking, checkSession]);

  // Função utilitária para os componentes verificarem se podem renderizar um botão
  const hasPermission = (allowedRoles: StarRole[]) => {
    if (!user) return false;
    return allowedRoles.includes(user.star_role);
  };

  let isAuthorized = true;

  // Se a rota exigiu roles específicas (ex: ['sirius', 'canopus']) e a checagem acabou
  if (!isChecking && isAuthenticated && requiredRoles && user) {
    if (!requiredRoles.includes(user.star_role)) {
      isAuthorized = false;
    }
  }

  return {
    user,
    isAuthenticated,
    isChecking,
    isAuthorized,
    hasPermission
  };
}