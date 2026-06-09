import { create } from "zustand";

const useUIStore = create((set) => ({

  sidebarOpen: false,

  openSidebar: () =>
    set({
      sidebarOpen: true,
    }),

  closeSidebar: () =>
    set({
      sidebarOpen: false,
    }),

}));

export default useUIStore;