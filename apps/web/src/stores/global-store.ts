import { create } from "zustand";

interface GlobalStore {
  usersConnected: number;
  setUsersConnected: (count: number) => void;
}

export const useGlobalStore = create<GlobalStore>()(set => ({
  usersConnected: 0,
  setUsersConnected: (count: number) => set(() => ({ usersConnected: count })),
}));
