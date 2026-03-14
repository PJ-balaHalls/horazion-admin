import { create } from 'zustand';

interface NavigationStore {
  isNavigating: boolean;
  setIsNavigating: (val: boolean) => void;
}

export const useNavigationStore = create<NavigationStore>((set) => ({
  isNavigating: false,
  setIsNavigating: (val) => set({ isNavigating: val }),
}));