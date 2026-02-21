import { create } from 'zustand'

const useUIStore = create((set) => ({
    isSidebarCollapsed: localStorage.getItem('sidebar_collapsed') === 'true',
    isMobileMenuOpen: false,
    windowWidth: typeof window !== 'undefined' ? window.innerWidth : 1200,

    toggleSidebar: () => set((state) => {
        const newState = !state.isSidebarCollapsed
        localStorage.setItem('sidebar_collapsed', newState)
        return { isSidebarCollapsed: newState }
    }),

    setMobileMenu: (isOpen) => set({ isMobileMenuOpen: isOpen }),
    setWindowWidth: (width) => set({ windowWidth: width }),

    // Helper to determine if we are on desktop
    isDesktop: () => typeof window !== 'undefined' && window.innerWidth >= 1024
}))

export default useUIStore
