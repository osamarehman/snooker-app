import { db } from './indexedDB'
import type { Match } from '@/types/database'

type QueueAction = {
  type: string
  payload: Record<string, unknown>
  endpoint: string
  method: string
}

class OfflineSync {
  private isClient: boolean

  constructor() {
    this.isClient = typeof window !== 'undefined'
  }

  async queueAction(action: QueueAction) {
    if (!this.isClient) return null

    if (navigator.onLine) {
      // If online, execute immediately
      return this.executeAction(action)
    } else {
      // If offline, store in IndexedDB
      await db.upsert('syncQueue', {
        ...action,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString()
      })
    }
  }

  private async executeAction(action: QueueAction) {
    try {
      const response = await fetch(action.endpoint, {
        method: action.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(action.payload),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to execute action:', error)
      throw error
    }
  }
}

export const offlineSync = new OfflineSync() 