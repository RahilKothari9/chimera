/**
 * Data Backup & Restore UI
 * User interface for managing backups and data
 */

import {
  exportBackup,
  importBackup,
  generateBackupCode,
  restoreFromCode,
  getStorageUsage,
  getBackupHistory,
  clearAllData,
  createAutoBackup,
  getAutoBackup,
  formatBytes,
  formatTimestamp,
  type BackupMetadata,
} from './dataBackup'

export interface DataBackupUIOptions {
  container: HTMLElement
  onBackupCreated?: () => void
  onDataRestored?: () => void
  onDataCleared?: () => void
}

/**
 * Create the data backup UI
 */
export function createDataBackupUI(options: DataBackupUIOptions): void {
  const { container } = options

  // Create section
  const section = document.createElement('section')
  section.className = 'backup-section'
  section.innerHTML = `
    <h2 class="section-title">💾 Data Backup & Restore</h2>
    <p class="section-description">
      Export, import, and manage your Chimera data. Keep your votes, feedback, and activity safe!
    </p>
  `

  // Create storage usage card
  const storageCard = createStorageUsageCard()
  section.appendChild(storageCard)

  // Create action buttons
  const actionsCard = createActionsCard(options)
  section.appendChild(actionsCard)

  // Create backup history
  const historyCard = createHistoryCard()
  section.appendChild(historyCard)

  container.appendChild(section)

  // Create auto-backup on load
  setTimeout(() => {
    createAutoBackup()
  }, 1000)
}

/**
 * Create storage usage card
 */
function createStorageUsageCard(): HTMLElement {
  const card = document.createElement('div')
  card.className = 'stat-card backup-usage-card'

  const usage = getStorageUsage()

  card.innerHTML = `
    <h3>📊 Storage Usage</h3>
    <div class="storage-bar-container">
      <div class="storage-bar">
        <div class="storage-bar-fill" style="width: ${usage.percentage}%"></div>
      </div>
      <div class="storage-info">
        <span>${formatBytes(usage.used)} / ${formatBytes(usage.total)}</span>
        <span>${usage.percentage.toFixed(1)}% used</span>
      </div>
    </div>
  `

  return card
}

/**
 * Create actions card
 */
function createActionsCard(options: DataBackupUIOptions): HTMLElement {
  const card = document.createElement('div')
  card.className = 'backup-actions-card'

  card.innerHTML = `
    <div class="backup-actions-grid">
      <div class="backup-action-group">
        <h3>💾 Export Data</h3>
        <button class="backup-btn backup-btn-primary" data-action="export-json">
          📄 Download JSON
        </button>
        <button class="backup-btn backup-btn-primary" data-action="export-code">
          🔐 Generate Backup Code
        </button>
      </div>
      
      <div class="backup-action-group">
        <h3>📥 Import Data</h3>
        <input type="file" id="backup-file-input" accept=".json" style="display: none;">
        <button class="backup-btn backup-btn-secondary" data-action="import-json">
          📄 Upload JSON
        </button>
        <button class="backup-btn backup-btn-secondary" data-action="import-code">
          🔐 Use Backup Code
        </button>
      </div>
      
      <div class="backup-action-group">
        <h3>🔄 Quick Actions</h3>
        <button class="backup-btn backup-btn-secondary" data-action="restore-auto">
          ⏮️ Restore Auto-Backup
        </button>
        <button class="backup-btn backup-btn-danger" data-action="clear-all">
          🗑️ Clear All Data
        </button>
      </div>
    </div>
  `

  // Add event listeners
  const exportJsonBtn = card.querySelector('[data-action="export-json"]') as HTMLButtonElement
  const exportCodeBtn = card.querySelector('[data-action="export-code"]') as HTMLButtonElement
  const importJsonBtn = card.querySelector('[data-action="import-json"]') as HTMLButtonElement
  const importCodeBtn = card.querySelector('[data-action="import-code"]') as HTMLButtonElement
  const restoreAutoBtn = card.querySelector('[data-action="restore-auto"]') as HTMLButtonElement
  const clearAllBtn = card.querySelector('[data-action="clear-all"]') as HTMLButtonElement
  const fileInput = card.querySelector('#backup-file-input') as HTMLInputElement

  exportJsonBtn.addEventListener('click', () => handleExportJSON())
  exportCodeBtn.addEventListener('click', () => handleExportCode())
  importJsonBtn.addEventListener('click', () => fileInput.click())
  importCodeBtn.addEventListener('click', () => handleImportCode(options))
  restoreAutoBtn.addEventListener('click', () => handleRestoreAuto(options))
  clearAllBtn.addEventListener('click', () => handleClearAll(options))
  
  fileInput.addEventListener('change', (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      handleImportJSON(file, options)
    }
  })

  return card
}

/**
 * Create backup history card
 */
function createHistoryCard(): HTMLElement {
  const card = document.createElement('div')
  card.className = 'backup-history-card'

  const history = getBackupHistory()

  card.innerHTML = `
    <h3>📜 Backup History</h3>
    ${history.length === 0 ? '<p class="backup-empty">No backups yet</p>' : ''}
    <div class="backup-history-list">
      ${history.map(item => createHistoryItem(item)).join('')}
    </div>
  `

  return card
}

/**
 * Create history item HTML
 */
function createHistoryItem(item: BackupMetadata): string {
  return `
    <div class="backup-history-item">
      <div class="backup-history-info">
        <div class="backup-history-time">${formatTimestamp(item.timestamp)}</div>
        <div class="backup-history-meta">
          ${item.itemCount} items • ${formatBytes(item.size)}
        </div>
      </div>
    </div>
  `
}

/**
 * Handle export JSON
 */
function handleExportJSON(): void {
  try {
    const json = exportBackup()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chimera-backup-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    showNotification('✅ Backup downloaded successfully', 'success')
  } catch (error) {
    showNotification('❌ Failed to export backup', 'error')
    console.error('Export failed:', error)
  }
}

/**
 * Handle export code
 */
function handleExportCode(): void {
  try {
    const code = generateBackupCode()
    showCodeModal(code)
    showNotification('✅ Backup code generated', 'success')
  } catch (error) {
    showNotification('❌ Failed to generate backup code', 'error')
    console.error('Code generation failed:', error)
  }
}

/**
 * Handle import JSON
 */
function handleImportJSON(file: File, options: DataBackupUIOptions): void {
  const reader = new FileReader()
  
  reader.onload = (e) => {
    try {
      const json = e.target?.result as string
      const result = importBackup(json)
      
      if (result.success) {
        showNotification(`✅ Restored ${result.restored} items`, 'success')
        options.onDataRestored?.()
        refreshUI()
      } else {
        showNotification(`❌ Import failed: ${result.errors.join(', ')}`, 'error')
      }
    } catch (error) {
      showNotification('❌ Invalid backup file', 'error')
      console.error('Import failed:', error)
    }
  }
  
  reader.readAsText(file)
}

/**
 * Handle import code
 */
function handleImportCode(options: DataBackupUIOptions): void {
  const code = prompt('Enter your backup code:')
  
  if (!code) return
  
  try {
    const result = restoreFromCode(code)
    
    if (result.success) {
      showNotification(`✅ Restored ${result.restored} items`, 'success')
      options.onDataRestored?.()
      refreshUI()
    } else {
      showNotification(`❌ Restore failed: ${result.errors.join(', ')}`, 'error')
    }
  } catch (error) {
    showNotification('❌ Invalid backup code', 'error')
    console.error('Restore failed:', error)
  }
}

/**
 * Handle restore auto-backup
 */
function handleRestoreAuto(options: DataBackupUIOptions): void {
  const autoBackup = getAutoBackup()
  
  if (!autoBackup) {
    showNotification('⚠️ No auto-backup available', 'warning')
    return
  }
  
  const confirmed = confirm('Restore from auto-backup? This will overwrite your current data.')
  
  if (confirmed) {
    try {
      const result = importBackup(JSON.stringify(autoBackup))
      
      if (result.success) {
        showNotification(`✅ Restored ${result.restored} items from auto-backup`, 'success')
        options.onDataRestored?.()
        refreshUI()
      } else {
        showNotification('❌ Auto-backup restore failed', 'error')
      }
    } catch (error) {
      showNotification('❌ Failed to restore auto-backup', 'error')
      console.error('Auto-restore failed:', error)
    }
  }
}

/**
 * Handle clear all data
 */
function handleClearAll(options: DataBackupUIOptions): void {
  const confirmed = confirm(
    '⚠️ WARNING: This will permanently delete all your Chimera data (votes, feedback, activity, etc.). This cannot be undone!\n\nAre you sure?'
  )
  
  if (confirmed) {
    const doubleConfirm = confirm('This is your last chance. Really delete everything?')
    
    if (doubleConfirm) {
      try {
        const result = clearAllData()
        showNotification(`✅ Cleared ${result.cleared} items`, 'success')
        options.onDataCleared?.()
        refreshUI()
      } catch (error) {
        showNotification('❌ Failed to clear data', 'error')
        console.error('Clear failed:', error)
      }
    }
  }
}

/**
 * Show backup code modal
 */
function showCodeModal(code: string): void {
  const modal = document.createElement('div')
  modal.className = 'modal-overlay'
  
  modal.innerHTML = `
    <div class="modal-content backup-code-modal">
      <h3>🔐 Your Backup Code</h3>
      <p>Save this code to restore your data later:</p>
      <div class="backup-code-display">
        <code>${code}</code>
      </div>
      <div class="backup-code-actions">
        <button class="backup-btn backup-btn-primary" id="copy-code-btn">
          📋 Copy Code
        </button>
        <button class="backup-btn backup-btn-secondary" id="close-code-modal">
          ✕ Close
        </button>
      </div>
      <p class="backup-code-warning">⚠️ Keep this code safe! Anyone with this code can restore your data.</p>
    </div>
  `
  
  document.body.appendChild(modal)
  
  const copyBtn = modal.querySelector('#copy-code-btn') as HTMLButtonElement
  const closeBtn = modal.querySelector('#close-code-modal') as HTMLButtonElement
  
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(code).then(() => {
      showNotification('✅ Code copied to clipboard', 'success')
    }).catch(() => {
      showNotification('❌ Failed to copy code', 'error')
    })
  })
  
  closeBtn.addEventListener('click', () => {
    document.body.removeChild(modal)
  })
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal)
    }
  })
}

/**
 * Show notification (using existing notification system if available)
 */
function showNotification(message: string, type: 'success' | 'error' | 'warning'): void {
  // Try to use existing notification system
  const event = new CustomEvent('chimera-notification', {
    detail: { message, type },
  })
  window.dispatchEvent(event)
}

/**
 * Refresh UI after data changes
 */
function refreshUI(): void {
  // Reload the page to reflect changes
  setTimeout(() => {
    window.location.reload()
  }, 1500)
}
