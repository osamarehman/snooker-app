import { create } from 'zustand'
import type { StateCreator } from 'zustand'

type SyncStatus = 'idle' | 'syncing' | 'error'

type ActionPayload = {
  type: string
  payload: unknown
  endpoint: string
  method: string
}

interface OfflineStore {
  isOnline: boolean
  setIsOnline: (status: boolean) => void
  syncStatus: SyncStatus
  lastSync: Date | null
  queueAction: (action: ActionPayload) => Promise<unknown>
}

export const useOffline = create<OfflineStore>((set: StateCreator<OfflineStore>) => ({
  isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
  setIsOnline: (status: boolean) => set({ isOnline: status }),
  syncStatus: 'idle',
  lastSync: null,
  queueAction: async (action: ActionPayload) => {
    // Implementation of queueAction...
    // This is just a placeholder, actual implementation would be more complex
    return Promise.resolve()
  }
})) 