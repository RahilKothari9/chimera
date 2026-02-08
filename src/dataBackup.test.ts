import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  createBackup,
  restoreBackup,
  exportBackup,
  importBackup,
  generateBackupCode,
  restoreFromCode,
  getBackupMetadata,
  getStorageUsage,
  getBackupHistory,
  clearAllData,
  createAutoBackup,
  getAutoBackup,
  formatBytes,
  formatTimestamp,
  type BackupData,
} from './dataBackup'

describe('Data Backup System', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('createBackup', () => {
    it('should create a backup with version and timestamp', () => {
      const backup = createBackup()
      
      expect(backup.version).toBe('1.0.0')
      expect(backup.timestamp).toBeGreaterThan(0)
      expect(backup.data).toBeDefined()
    })

    it('should backup existing data', () => {
      localStorage.setItem('chimera-theme', 'dark')
      localStorage.setItem('chimera-voting-data', '{"votes":1}')
      
      const backup = createBackup()
      
      expect(backup.data['chimera-theme']).toBe('dark')
      expect(backup.data['chimera-voting-data']).toBe('{"votes":1}')
    })

    it('should not include keys that are not set', () => {
      const backup = createBackup()
      
      expect(backup.data['chimera-theme']).toBeUndefined()
    })

    it('should handle localStorage errors gracefully', () => {
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem')
      getItemSpy.mockImplementationOnce(() => {
        throw new Error('Storage error')
      })
      
      const backup = createBackup()
      
      expect(backup).toBeDefined()
      expect(backup.data).toBeDefined()
      
      getItemSpy.mockRestore()
    })
  })

  describe('restoreBackup', () => {
    it('should restore data from backup', () => {
      const backup: BackupData = {
        version: '1.0.0',
        timestamp: Date.now(),
        data: {
          'chimera-theme': 'dark',
          'chimera-voting-data': '{"votes":1}',
        },
      }
      
      const result = restoreBackup(backup)
      
      expect(result.success).toBe(true)
      expect(result.restored).toBe(2)
      expect(result.errors).toHaveLength(0)
      expect(localStorage.getItem('chimera-theme')).toBe('dark')
      expect(localStorage.getItem('chimera-voting-data')).toBe('{"votes":1}')
    })

    it('should handle invalid backup format', () => {
      const backup = {} as BackupData
      
      const result = restoreBackup(backup)
      
      expect(result.success).toBe(false)
      expect(result.errors).toContain('Invalid backup format')
    })

    it('should skip undefined values', () => {
      const backup: BackupData = {
        version: '1.0.0',
        timestamp: Date.now(),
        data: {
          'chimera-theme': undefined,
        },
      }
      
      const result = restoreBackup(backup)
      
      expect(result.restored).toBe(0)
    })
  })

  describe('exportBackup and importBackup', () => {
    it('should export backup as JSON string', () => {
      localStorage.setItem('chimera-theme', 'dark')
      
      const exported = exportBackup()
      
      expect(typeof exported).toBe('string')
      const parsed = JSON.parse(exported)
      expect(parsed.version).toBe('1.0.0')
      expect(parsed.data['chimera-theme']).toBe('dark')
    })

    it('should import backup from JSON string', () => {
      const json = JSON.stringify({
        version: '1.0.0',
        timestamp: Date.now(),
        data: {
          'chimera-theme': 'light',
        },
      })
      
      const result = importBackup(json)
      
      expect(result.success).toBe(true)
      expect(result.restored).toBe(1)
      expect(localStorage.getItem('chimera-theme')).toBe('light')
    })

    it('should handle invalid JSON', () => {
      const result = importBackup('invalid json')
      
      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })

  describe('generateBackupCode and restoreFromCode', () => {
    it('should generate a backup code', () => {
      localStorage.setItem('chimera-theme', 'dark')
      
      const code = generateBackupCode()
      
      expect(typeof code).toBe('string')
      expect(code.length).toBeGreaterThan(0)
    })

    it('should restore from backup code', () => {
      localStorage.setItem('chimera-theme', 'dark')
      const code = generateBackupCode()
      
      localStorage.clear()
      
      const result = restoreFromCode(code)
      
      expect(result.success).toBe(true)
      expect(localStorage.getItem('chimera-theme')).toBe('dark')
    })

    it('should handle invalid backup code', () => {
      const result = restoreFromCode('invalid!!!code')
      
      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should roundtrip data correctly', () => {
      localStorage.setItem('chimera-theme', 'dark')
      localStorage.setItem('chimera-voting-data', '{"votes":5}')
      
      const code = generateBackupCode()
      localStorage.clear()
      
      const result = restoreFromCode(code)
      
      expect(result.success).toBe(true)
      expect(result.restored).toBe(2)
      expect(localStorage.getItem('chimera-theme')).toBe('dark')
      expect(localStorage.getItem('chimera-voting-data')).toBe('{"votes":5}')
    })
  })

  describe('getBackupMetadata', () => {
    it('should return metadata for a backup', () => {
      const backup: BackupData = {
        version: '1.0.0',
        timestamp: 1234567890,
        data: {
          'chimera-theme': 'dark',
          'chimera-voting-data': '{"votes":1}',
        },
      }
      
      const metadata = getBackupMetadata(backup)
      
      expect(metadata.id).toBe('1234567890')
      expect(metadata.version).toBe('1.0.0')
      expect(metadata.timestamp).toBe(1234567890)
      expect(metadata.size).toBeGreaterThan(0)
      expect(metadata.itemCount).toBe(2)
    })
  })

  describe('getStorageUsage', () => {
    it('should calculate storage usage', () => {
      localStorage.setItem('chimera-theme', 'dark')
      
      const usage = getStorageUsage()
      
      expect(usage.used).toBeGreaterThan(0)
      expect(usage.total).toBeGreaterThan(0)
      expect(usage.percentage).toBeGreaterThanOrEqual(0)
      expect(usage.percentage).toBeLessThanOrEqual(100)
    })

    it('should return zero for empty storage', () => {
      const usage = getStorageUsage()
      
      expect(usage.used).toBe(0)
      expect(usage.percentage).toBe(0)
    })
  })

  describe('getBackupHistory', () => {
    it('should return empty array initially', () => {
      const history = getBackupHistory()
      
      expect(history).toEqual([])
    })

    it('should return history after backup', () => {
      localStorage.setItem('chimera-theme', 'dark')
      
      const backup = createBackup()
      restoreBackup(backup)
      
      const history = getBackupHistory()
      
      expect(history.length).toBe(1)
      expect(history[0].version).toBe('1.0.0')
    })

    it('should limit history to max items', () => {
      localStorage.setItem('chimera-theme', 'dark')
      
      // Create 12 backups
      for (let i = 0; i < 12; i++) {
        const backup = createBackup()
        restoreBackup(backup)
      }
      
      const history = getBackupHistory()
      
      expect(history.length).toBeLessThanOrEqual(10)
    })
  })

  describe('clearAllData', () => {
    it('should clear all Chimera data', () => {
      localStorage.setItem('chimera-theme', 'dark')
      localStorage.setItem('chimera-voting-data', '{"votes":1}')
      
      const result = clearAllData()
      
      expect(result.success).toBe(true)
      expect(result.cleared).toBe(3) // theme, voting, activity feed
      expect(localStorage.getItem('chimera-theme')).toBeNull()
      expect(localStorage.getItem('chimera-voting-data')).toBeNull()
    })
  })

  describe('auto-backup', () => {
    it('should create auto-backup', () => {
      localStorage.setItem('chimera-theme', 'dark')
      
      createAutoBackup()
      
      const autoBackup = getAutoBackup()
      
      expect(autoBackup).not.toBeNull()
      expect(autoBackup?.data['chimera-theme']).toBe('dark')
    })

    it('should return null if no auto-backup exists', () => {
      const autoBackup = getAutoBackup()
      
      expect(autoBackup).toBeNull()
    })

    it('should update backup history', () => {
      localStorage.setItem('chimera-theme', 'dark')
      
      createAutoBackup()
      
      const history = getBackupHistory()
      
      expect(history.length).toBe(1)
    })
  })

  describe('formatBytes', () => {
    it('should format 0 bytes', () => {
      expect(formatBytes(0)).toBe('0 B')
    })

    it('should format bytes', () => {
      expect(formatBytes(100)).toBe('100.00 B')
    })

    it('should format kilobytes', () => {
      expect(formatBytes(1024)).toBe('1.00 KB')
    })

    it('should format megabytes', () => {
      expect(formatBytes(1024 * 1024)).toBe('1.00 MB')
    })

    it('should format larger values', () => {
      expect(formatBytes(1536)).toBe('1.50 KB')
    })
  })

  describe('formatTimestamp', () => {
    it('should format timestamp as locale string', () => {
      const timestamp = 1234567890000
      const formatted = formatTimestamp(timestamp)
      
      expect(typeof formatted).toBe('string')
      expect(formatted.length).toBeGreaterThan(0)
    })

    it('should handle current timestamp', () => {
      const formatted = formatTimestamp(Date.now())
      
      expect(typeof formatted).toBe('string')
    })
  })
})
