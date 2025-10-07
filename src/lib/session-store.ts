import { randomUUID } from 'crypto'
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

export interface StoredSession {
  sub: string
  access_token: string
  id_token: string
  expires_at: number // epoch seconds
  created_at: number
  claims?: Record<string, any>
  refresh_token?: string
  refresh_expires_at?: number
  rotations?: number
  absolute_expires_at?: number
}

interface InternalEntry { data: StoredSession; exp: number }

interface PersistedData {
  sessions: Record<string, InternalEntry>
  timestamp: number
}

class PersistentSessionStore {
  private map = new Map<string, InternalEntry>()
  private refreshLocks = new Map<string, Promise<any>>()
  private sweepInterval: NodeJS.Timeout
  private persistPath: string
  private persistInterval: NodeJS.Timeout

  constructor(
    private sweepMs: number = 5 * 60 * 1000,
    private persistMs: number = 60 * 1000 // Persist every minute
  ) {
    // Ensure data directory exists
    const dataDir = join(process.cwd(), 'data')
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true })
    }
    
    this.persistPath = join(dataDir, 'sessions.json')
    
    // Load existing sessions
    this.loadFromDisk()
    
    // Setup cleanup interval
    this.sweepInterval = setInterval(() => this.sweep(), sweepMs).unref()
    
    // Setup persistence interval
    this.persistInterval = setInterval(() => this.persistToDisk(), persistMs).unref()
    
    // Persist on process exit
    process.on('SIGINT', () => this.shutdown())
    process.on('SIGTERM', () => this.shutdown())
  }

  private loadFromDisk() {
    try {
      if (existsSync(this.persistPath)) {
        const data = readFileSync(this.persistPath, 'utf8')
        const persisted: PersistedData = JSON.parse(data)
        
        // Validate timestamp (don't load if too old)
        const maxAge = 24 * 60 * 60 * 1000 // 24 hours
        if (Date.now() - persisted.timestamp < maxAge) {
          Object.entries(persisted.sessions).forEach(([id, entry]) => {
            // Only load non-expired sessions
            if (entry.exp * 1000 > Date.now()) {
              this.map.set(id, entry)
            }
          })
          console.log(`Loaded ${Object.keys(persisted.sessions).length} sessions from disk`)
        }
      }
    } catch (error) {
      console.warn('Failed to load sessions from disk:', error)
    }
  }

  private persistToDisk() {
    try {
      const sessions: Record<string, InternalEntry> = {}
      this.map.forEach((entry, id) => {
        sessions[id] = entry
      })
      
      const data: PersistedData = {
        sessions,
        timestamp: Date.now()
      }
      
      writeFileSync(this.persistPath, JSON.stringify(data, null, 2))
    } catch (error) {
      console.warn('Failed to persist sessions to disk:', error)
    }
  }

  private shutdown() {
    this.persistToDisk()
    process.exit(0)
  }

  create(data: Omit<StoredSession, 'created_at'>): { id: string; session: StoredSession } {
    const id = randomUUID()
    const session: StoredSession = { ...data, created_at: Date.now() }
    this.set(id, session)
    return { id, session }
  }

  set(id: string, data: StoredSession) {
    this.map.set(id, { data, exp: data.expires_at })
    // Immediate persist for critical operations
    this.persistToDisk()
  }

  get(id: string): StoredSession | undefined {
    const entry = this.map.get(id)
    if (!entry) return undefined
    if (entry.exp * 1000 < Date.now()) {
      this.map.delete(id)
      return undefined
    }
    return entry.data
  }

  delete(id: string) {
    this.map.delete(id)
    this.refreshLocks.delete(id)
    // Immediate persist for critical operations
    this.persistToDisk()
  }

  sweep() {
    const now = Date.now()
    let deleted = 0
    for (const [k, v] of this.map.entries()) {
      if (v.exp * 1000 < now) {
        this.map.delete(k)
        deleted++
      }
    }
    if (deleted > 0) {
      console.log(`Swept ${deleted} expired sessions`)
    }
  }

  setRefreshLock(id: string, p: Promise<any>) {
    this.refreshLocks.set(id, p)
  }
  getRefreshLock(id: string) {
    return this.refreshLocks.get(id)
  }
  clearRefreshLock(id: string) {
    this.refreshLocks.delete(id)
  }

  // Utility methods for monitoring
  getSessionCount(): number {
    return this.map.size
  }

  getActiveSessionIds(): string[] {
    return Array.from(this.map.keys())
  }

  clearAll() {
    this.map.clear()
    this.refreshLocks.clear()
    this.persistToDisk()
  }
}

export const sessionStore = new PersistentSessionStore()
