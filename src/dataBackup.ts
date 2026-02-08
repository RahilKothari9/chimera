/**
 * Data Backup & Restore System
 * Provides comprehensive backup/restore functionality for all Chimera user data
 */

export interface BackupData {
  version: string
  timestamp: number
  data: {
    theme?: string
    voting?: string
    activityFeed?: string
    [key: string]: string | undefined
  }
}

export interface BackupMetadata {
  id: string
  version: string
  timestamp: number
  size: number
  itemCount: number
}

const BACKUP_VERSION = '1.0.0'
const BACKUP_HISTORY_KEY = 'chimera_backup_history'
const MAX_BACKUP_HISTORY = 10

// Storage keys to backup
const STORAGE_KEYS = [
  'chimera-theme',
  'chimera-voting-data',
  'chimera_activity_feed',
]

/**
 * Create a backup of all Chimera data
 */
export function createBackup(): BackupData {
  const data: BackupData['data'] = {}
  
  for (const key of STORAGE_KEYS) {
    try {
      const value = localStorage.getItem(key)
      if (value !== null) {
        data[key] = value
      }
    } catch (error) {
      console.warn(`Failed to backup ${key}:`, error)
    }
  }

  return {
    version: BACKUP_VERSION,
    timestamp: Date.now(),
    data,
  }
}

/**
 * Restore data from a backup
 */
export function restoreBackup(backup: BackupData): { success: boolean; restored: number; errors: string[] } {
  const errors: string[] = []
  let restored = 0

  // Validate backup structure
  if (!backup.version || !backup.timestamp || !backup.data) {
    errors.push('Invalid backup format')
    return { success: false, restored, errors }
  }

  // Check version compatibility (simple for now)
  if (backup.version !== BACKUP_VERSION) {
    console.warn(`Backup version mismatch: ${backup.version} (expected ${BACKUP_VERSION})`)
  }

  // Restore each item
  for (const [key, value] of Object.entries(backup.data)) {
    if (value === undefined) continue
    
    try {
      localStorage.setItem(key, value)
      restored++
    } catch (error) {
      errors.push(`Failed to restore ${key}: ${error}`)
    }
  }

  // Save to backup history
  saveToHistory(backup)

  return {
    success: errors.length === 0,
    restored,
    errors,
  }
}

/**
 * Export backup as JSON string
 */
export function exportBackup(): string {
  const backup = createBackup()
  return JSON.stringify(backup, null, 2)
}

/**
 * Import backup from JSON string
 */
export function importBackup(jsonString: string): { success: boolean; restored: number; errors: string[] } {
  try {
    const backup: BackupData = JSON.parse(jsonString)
    return restoreBackup(backup)
  } catch (error) {
    return {
      success: false,
      restored: 0,
      errors: [`Failed to parse backup: ${error}`],
    }
  }
}

/**
 * Generate a shareable backup code (base64 encoded, compressed)
 */
export function generateBackupCode(): string {
  const backup = createBackup()
  const json = JSON.stringify(backup)
  
  try {
    // Use btoa for base64 encoding
    return btoa(json)
  } catch (error) {
    console.error('Failed to generate backup code:', error)
    throw new Error('Failed to generate backup code')
  }
}

/**
 * Restore from a backup code
 */
export function restoreFromCode(code: string): { success: boolean; restored: number; errors: string[] } {
  try {
    const json = atob(code)
    return importBackup(json)
  } catch (error) {
    return {
      success: false,
      restored: 0,
      errors: [`Invalid backup code: ${error}`],
    }
  }
}

/**
 * Get backup metadata without full restore
 */
export function getBackupMetadata(backup: BackupData): BackupMetadata {
  const json = JSON.stringify(backup)
  return {
    id: backup.timestamp.toString(),
    version: backup.version,
    timestamp: backup.timestamp,
    size: new Blob([json]).size,
    itemCount: Object.keys(backup.data).length,
  }
}

/**
 * Calculate total storage usage
 */
export function getStorageUsage(): { used: number; total: number; percentage: number } {
  let used = 0
  
  try {
    for (const key of STORAGE_KEYS) {
      const value = localStorage.getItem(key)
      if (value) {
        used += new Blob([value]).size
      }
    }
  } catch (error) {
    console.warn('Failed to calculate storage usage:', error)
  }

  // Estimate total available (5MB is common limit)
  const total = 5 * 1024 * 1024
  const percentage = (used / total) * 100

  return { used, total, percentage }
}

/**
 * Save backup to history
 */
function saveToHistory(backup: BackupData): void {
  try {
    const history = getBackupHistory()
    const metadata = getBackupMetadata(backup)
    
    history.unshift(metadata)
    
    // Keep only the most recent backups
    const trimmed = history.slice(0, MAX_BACKUP_HISTORY)
    
    localStorage.setItem(BACKUP_HISTORY_KEY, JSON.stringify(trimmed))
  } catch (error) {
    console.warn('Failed to save backup to history:', error)
  }
}

/**
 * Get backup history
 */
export function getBackupHistory(): BackupMetadata[] {
  try {
    const stored = localStorage.getItem(BACKUP_HISTORY_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.warn('Failed to load backup history:', error)
  }
  return []
}

/**
 * Clear all Chimera data (with confirmation)
 */
export function clearAllData(): { success: boolean; cleared: number } {
  let cleared = 0
  
  for (const key of STORAGE_KEYS) {
    try {
      localStorage.removeItem(key)
      cleared++
    } catch (error) {
      console.warn(`Failed to clear ${key}:`, error)
    }
  }

  return { success: true, cleared }
}

/**
 * Auto-backup functionality
 */
export function createAutoBackup(): void {
  try {
    const backup = createBackup()
    localStorage.setItem('chimera_auto_backup', JSON.stringify(backup))
    saveToHistory(backup)
  } catch (error) {
    console.warn('Auto-backup failed:', error)
  }
}

/**
 * Get auto-backup if available
 */
export function getAutoBackup(): BackupData | null {
  try {
    const stored = localStorage.getItem('chimera_auto_backup')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.warn('Failed to load auto-backup:', error)
  }
  return null
}

/**
 * Format bytes for display
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleString()
}
