import { create } from 'zustand'
import type { Message, ChatSession } from '../core/types'
import { loadState, saveState } from '../utils/storage'

interface ChatState {
  sessions: ChatSession[]
  activeSessionId: string | null
  isStreaming: boolean

  createSession: () => string
  setActiveSession: (id: string) => void
  addMessage: (sessionId: string, message: Message) => void
  updateMessage: (sessionId: string, messageId: string, content: string) => void
  finalizeMessage: (sessionId: string, messageId: string) => void
  deleteSession: (id: string) => void
  setStreaming: (streaming: boolean) => void
  getActiveSession: () => ChatSession | undefined
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

// Load persisted state
const persisted = loadState<{ sessions: ChatSession[]; activeSessionId: string | null }>('chat', {
  sessions: [],
  activeSessionId: null,
})

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: persisted.sessions,
  activeSessionId: persisted.activeSessionId,
  isStreaming: false,

  createSession: () => {
    const id = generateId()
    const session: ChatSession = {
      id,
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    set(state => {
      const next = { sessions: [session, ...state.sessions], activeSessionId: id }
      saveState('chat', { sessions: next.sessions, activeSessionId: next.activeSessionId })
      return next
    })
    return id
  },

  setActiveSession: (id) => {
    set({ activeSessionId: id })
    saveState('chat', { sessions: get().sessions, activeSessionId: id })
  },

  addMessage: (sessionId, message) =>
    set(state => {
      const sessions = state.sessions.map(s =>
        s.id === sessionId
          ? {
              ...s,
              messages: [...s.messages, message],
              updatedAt: Date.now(),
              title: s.messages.length === 0 && message.role === 'user'
                ? message.content.slice(0, 40) + (message.content.length > 40 ? '...' : '')
                : s.title,
            }
          : s
      )
      saveState('chat', { sessions, activeSessionId: state.activeSessionId })
      return { sessions }
    }),

  updateMessage: (sessionId, messageId, content) =>
    set(state => {
      const sessions = state.sessions.map(s =>
        s.id === sessionId
          ? {
              ...s,
              messages: s.messages.map(m =>
                m.id === messageId ? { ...m, content } : m
              ),
            }
          : s
      )
      saveState('chat', { sessions, activeSessionId: state.activeSessionId })
      return { sessions }
    }),

  finalizeMessage: (sessionId, messageId) =>
    set(state => {
      const sessions = state.sessions.map(s =>
        s.id === sessionId
          ? {
              ...s,
              messages: s.messages.map(m =>
                m.id === messageId ? { ...m, isStreaming: false } : m
              ),
            }
          : s
      )
      saveState('chat', { sessions, activeSessionId: state.activeSessionId })
      return { sessions }
    }),

  deleteSession: (id) =>
    set(state => {
      const sessions = state.sessions.filter(s => s.id !== id)
      const activeSessionId = state.activeSessionId === id
        ? (sessions[0]?.id ?? null)
        : state.activeSessionId
      saveState('chat', { sessions, activeSessionId })
      return { sessions, activeSessionId }
    }),

  setStreaming: (streaming) => set({ isStreaming: streaming }),

  getActiveSession: () => {
    const state = get()
    return state.sessions.find(s => s.id === state.activeSessionId)
  },
}))
