import { openDB, DBSchema, IDBPDatabase } from 'idb'
import type { Match, IndexedDBMatch } from '@/types/database'

type SyncQueueItem = {
  id: string
  type: string
  payload: Record<string, unknown>
  endpoint: string
  method: string
  timestamp: string
}

interface MyDB extends DBSchema {
  matches: {
    key: string
    value: IndexedDBMatch
  }
  syncQueue: {
    key: string
    value: SyncQueueItem
  }
}

type StoreNames = 'matches' | 'syncQueue'
type StoreTypes = IndexedDBMatch | SyncQueueItem

class IndexedDB {
  private db: Promise<IDBPDatabase<MyDB>> | null = null

  constructor() {
    // Only initialize IndexedDB on the client side
    if (typeof window !== 'undefined') {
      this.initDB()
    }
  }

  private initDB() {
    this.db = openDB<MyDB>('snooker-app', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('matches')) {
          db.createObjectStore('matches', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { keyPath: 'id' })
        }
      },
    })
  }

  async getById<T extends StoreTypes>(
    store: StoreNames,
    id: string
  ): Promise<T | null> {
    if (!this.db) return null
    const db = await this.db
    const result = await db.get(store, id)
    return (result ?? null) as T | null
  }

  async getAll<T extends StoreTypes>(
    store: StoreNames
  ): Promise<T[]> {
    if (!this.db) return []
    const db = await this.db
    return db.getAll(store) as Promise<T[]>
  }

  async upsert<T extends StoreTypes>(
    store: StoreNames,
    value: T
  ): Promise<string | undefined> {
    if (!this.db) return
    const db = await this.db
    await db.put(store, value)
    return value.id
  }

  async delete(store: StoreNames, id: string): Promise<void> {
    if (!this.db) return
    const db = await this.db
    await db.delete(store, id)
  }
}

// Export a singleton instance
export const db = new IndexedDB() 