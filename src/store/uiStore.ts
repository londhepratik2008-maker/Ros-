import { create } from 'zustand'
import type { ThemeName } from '../core/types'
import { loadState, saveState } from '../utils/storage'

interface UIState {
  sidebarOpen: boolean
  theme: ThemeName
  activePanel: 'chat' | 'monitor' | 'settings'

  toggleSidebar: () => void
  setTheme: (theme: ThemeName) => void
  setActivePanel: (panel: 'chat' | 'monitor' | 'settings') => void
}

const persisted = loadState<{ theme: ThemeName; sidebarOpen: boolean }>('ui', {
  theme: 'default',
  sidebarOpen: true,
})

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: persisted.sidebarOpen,
  theme: persisted.theme,
  activePanel: 'chat',

  toggleSidebar: () =>
    set(state => {
      const next = { sidebarOpen: !state.sidebarOpen }
      saveState('ui', { theme: state.theme, sidebarOpen: next.sidebarOpen })
      return next
    }),

  setTheme: (theme) => {
    set({ theme })
    saveState('ui', { theme, sidebarOpen: get().sidebarOpen })
  },

  setActivePanel: (activePanel) => set({ activePanel }),
}))

function get() {
  return useUIStore.getState()
}
