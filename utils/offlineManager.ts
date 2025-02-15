import { db } from './indexedDB'
import { supabase } from './supabase'
import { toast } from 'sonner'

type SyncStatus = 'idle' | 'syncing' | 'error'

class OfflineManager {
  private isClient: boolean
  private _isOnline: boolean
  private _syncStatus: SyncStatus
  private syncSubscribers: Set<() => void> = new Set()
  private _lastSyncTime: Date | null = null

  constructor() {
    this.isClient = typeof window !== 'undefined'
    this._isOnline = this.isClient ? navigator.onLine : true
    this._syncStatus = 'idle'

    if (this.isClient) {
      window.addEventListener('online', this.handleOnline.bind(this))
      window.addEventListener('offline', this.handleOffline.bind(this))
    }
  }

  get isOnline() {
    return this._isOnline
  }

  get syncStatus() {
    return this._syncStatus
  }

  get lastSync() {
    return this._lastSyncTime
  }

  private handleOnline = () => {
    this._isOnline = true
    toast.success("You're back online!")
    void this.syncAll()
  }

  private handleOffline = () => {
    this._isOnline = false
    toast.warning("You're offline. Changes will sync when connection is restored.")
  }

  private notifySubscribers() {
    this.syncSubscribers.forEach(callback => callback())
  }

  subscribe(callback: () => void) {
    this.syncSubscribers.add(callback)
    return () => {
      this.syncSubscribers.delete(callback)
    }
  }

  async syncAll() {
    if (this._syncStatus === 'syncing') return
    this._syncStatus = 'syncing'

    try {
      // 1. Sync Authentication
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        // Clear local data if not authenticated
        await this.clearLocalData()
        return
      }

      // 2. Sync Queued Actions
      const queue = await db.getAll('syncQueue')
      for (const item of queue) {
        try {
          await this.processSyncItem(item)
          await db.delete('syncQueue', item.id)
        } catch (error) {
          console.error('Failed to sync item:', error)
        }
      }

      // 3. Sync Latest Data
      await this.syncTables()
      await this.syncMatches()
      await this.syncExpenses()

      this._lastSyncTime = new Date()
      this._syncStatus = 'idle'
      this.notifySubscribers()
      
      // Show success toast only if previously offline
      if (!this.isOnline) {
        toast.success('All changes synced successfully')
      }
    } catch (error) {
      console.error('Sync failed:', error)
      this._syncStatus = 'error'
      toast.error('Failed to sync changes')
    }
  }

  private async processSyncItem(item: any) {
    switch (item.type) {
      case 'CREATE_MATCH':
        await supabase.from('matches').insert(item.payload)
        break
      case 'UPDATE_MATCH':
        await supabase
          .from('matches')
          .update(item.payload)
          .eq('id', item.payload.id)
        break
      case 'CREATE_EXPENSE':
        await supabase.from('expenses').insert(item.payload)
        break
      // Add other cases as needed
    }
  }

  private async syncTables() {
    const { data: tables } = await supabase
      .from('tables')
      .select('*')
      .order('tableNumber', { ascending: true })

    if (tables) {
      await db.clear('tables')
      await Promise.all(tables.map(table => db.add('tables', table)))
    }
  }

  private async syncMatches() {
    // Get last sync time for incremental sync
    const lastSync = this.lastSync?.toISOString()
    const query = supabase.from('matches').select('*')
    
    if (lastSync) {
      query.gt('updatedAt', lastSync)
    }

    const { data: matches } = await query.order('createdAt', { ascending: false })

    if (matches) {
      // Update only changed records
      for (const match of matches) {
        await db.add('matches', match)
      }
    }
  }

  private async syncExpenses() {
    const lastSync = this.lastSync?.toISOString()
    const query = supabase.from('expenses').select('*')
    
    if (lastSync) {
      query.gt('updatedAt', lastSync)
    }

    const { data: expenses } = await query.order('date', { ascending: false })

    if (expenses) {
      for (const expense of expenses) {
        await db.add('expenses', expense)
      }
    }
  }

  private async clearLocalData() {
    await db.clear('matches')
    await db.clear('expenses')
    await db.clear('syncQueue')
  }

  async queueAction(action: {
    type: string
    payload: any
    endpoint: string
    method: string
  }) {
    if (!this.isClient) return null

    if (this.isOnline) {
      return this.executeAction(action)
    } else {
      await db.upsert('syncQueue', {
        ...action,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString()
      })
    }
  }

  private async executeAction(action: {
    type: string
    payload: any
    endpoint: string
    method: string
  }) {
    try {
      this._syncStatus = 'syncing'
      this.notifySubscribers()

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

      this._lastSyncTime = new Date()
      this._syncStatus = 'idle'
      this.notifySubscribers()

      return await response.json()
    } catch (error) {
      this._syncStatus = 'error'
      this.notifySubscribers()
      throw error
    }
  }
}

export const offlineManager = new OfflineManager() 