import { create } from 'zustand'
import type { ThemeName } from '../core/types'
import { loadState, saveState } from '../utils/storage'

interface UIState {
  theme: ThemeName
  activePanel: 'chat' | 'monitor' | 'settings'
  isShattering: boolean
  isAssembling: boolean

  setTheme: (theme: ThemeName) => void
  setActivePanel: (panel: 'chat' | 'monitor' | 'settings') => void
  triggerShatter: () => void
  triggerAssemble: () => void
  resetState: () => void
}

const persisted = loadState<{ theme: ThemeName }>('ui', {
  theme: 'default',
})

export const useUIStore = create<UIState>((set) => ({
  theme: persisted.theme,
  activePanel: 'chat',
  isShattering: false,
  isAssembling: false,

  setTheme: (theme) => {
    set({ theme })
    saveState('ui', { theme })
  },

  setActivePanel: (activePanel) => set({ activePanel }),

  triggerShatter: () => set({ isShattering: true, isAssembling: false }),

  triggerAssemble: () => set({ isAssembling: true, isShattering: false }),

  resetState: () => set({ isShattering: false, isAssembling: false }),
}))
