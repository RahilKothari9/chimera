/**
 * Pomodoro Timer UI
 * Interactive circular-progress Pomodoro timer with controls and settings
 */

import {
  PomodoroTimer,
  DEFAULT_SETTINGS,
  formatTime,
  getProgress,
  getModeLabel,
  getModeEmoji,
  type PomodoroSettings,
  type PomodoroState,
} from './pomodoroTimer'
import { trackActivity } from './activityFeed'
import { notificationManager } from './notificationSystem'

// SVG circle constants
const RADIUS = 80
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/**
 * Creates and mounts the Pomodoro Timer UI into the given container element
 */
export function createPomodoroTimerUI(): HTMLElement {
  const timer = new PomodoroTimer()

  // ── Root container ──────────────────────────────────────────────────────
  const root = document.createElement('div')
  root.className = 'pomodoro-section'
  root.setAttribute('aria-label', 'Pomodoro Timer')

  // ── Header ───────────────────────────────────────────────────────────────
  const header = document.createElement('div')
  header.className = 'pomodoro-header'

  const title = document.createElement('h2')
  title.className = 'section-title'
  title.textContent = '🍅 Pomodoro Timer'
  header.appendChild(title)

  const subtitle = document.createElement('p')
  subtitle.className = 'pomodoro-subtitle'
  subtitle.textContent = 'Stay productive with timed focus sessions and scheduled breaks'
  header.appendChild(subtitle)

  root.appendChild(header)

  // ── Mode tabs ────────────────────────────────────────────────────────────
  const modeTabs = document.createElement('div')
  modeTabs.className = 'pomodoro-mode-tabs'
  modeTabs.setAttribute('role', 'tablist')
  modeTabs.setAttribute('aria-label', 'Timer mode')

  const modes: Array<{ mode: 'work' | 'shortBreak' | 'longBreak'; label: string }> = [
    { mode: 'work', label: '🍅 Focus' },
    { mode: 'shortBreak', label: '☕ Short Break' },
    { mode: 'longBreak', label: '🌴 Long Break' },
  ]

  modes.forEach(({ mode, label }) => {
    const tab = document.createElement('button')
    tab.className = `pomodoro-mode-tab${mode === 'work' ? ' active' : ''}`
    tab.setAttribute('role', 'tab')
    tab.setAttribute('aria-selected', mode === 'work' ? 'true' : 'false')
    tab.dataset['mode'] = mode
    tab.textContent = label
    tab.addEventListener('click', () => {
      if (timer.getState().status === 'running') {
        timer.pause()
      }
      timer.reset()
      // Update the internal mode by calling skip until we reach the desired mode
      // Instead, rebuild via updateSettings by manipulating state via public API
      // We'll use the skip approach: reset then manually set mode via a helper
      switchMode(mode)
    })
    modeTabs.appendChild(tab)
  })

  root.appendChild(modeTabs)

  // ── Timer display ────────────────────────────────────────────────────────
  const timerDisplay = document.createElement('div')
  timerDisplay.className = 'pomodoro-timer-display'

  // SVG circular progress
  const svgNS = 'http://www.w3.org/2000/svg'
  const svg = document.createElementNS(svgNS, 'svg')
  svg.setAttribute('viewBox', '0 0 200 200')
  svg.setAttribute('width', '220')
  svg.setAttribute('height', '220')
  svg.setAttribute('aria-hidden', 'true')
  svg.setAttribute('class', 'pomodoro-ring')

  const trackCircle = document.createElementNS(svgNS, 'circle')
  trackCircle.setAttribute('cx', '100')
  trackCircle.setAttribute('cy', '100')
  trackCircle.setAttribute('r', String(RADIUS))
  trackCircle.setAttribute('fill', 'none')
  trackCircle.setAttribute('stroke-width', '10')
  trackCircle.setAttribute('class', 'pomodoro-ring-track')
  svg.appendChild(trackCircle)

  const progressCircle = document.createElementNS(svgNS, 'circle')
  progressCircle.setAttribute('cx', '100')
  progressCircle.setAttribute('cy', '100')
  progressCircle.setAttribute('r', String(RADIUS))
  progressCircle.setAttribute('fill', 'none')
  progressCircle.setAttribute('stroke-width', '10')
  progressCircle.setAttribute('stroke-linecap', 'round')
  progressCircle.setAttribute('transform', 'rotate(-90 100 100)')
  progressCircle.style.strokeDasharray = String(CIRCUMFERENCE)
  progressCircle.style.strokeDashoffset = String(CIRCUMFERENCE)
  progressCircle.setAttribute('class', 'pomodoro-ring-progress')
  svg.appendChild(progressCircle)

  timerDisplay.appendChild(svg)

  // Time label (overlaid on SVG via CSS absolute positioning)
  const timeLabel = document.createElement('div')
  timeLabel.className = 'pomodoro-time-label'
  timeLabel.setAttribute('aria-live', 'polite')
  timeLabel.setAttribute('aria-atomic', 'true')

  const timeText = document.createElement('span')
  timeText.className = 'pomodoro-time-text'
  timeText.textContent = formatTime(DEFAULT_SETTINGS.workDuration)
  timeLabel.appendChild(timeText)

  const modeText = document.createElement('span')
  modeText.className = 'pomodoro-mode-text'
  modeText.textContent = 'Focus'
  timeLabel.appendChild(modeText)

  timerDisplay.appendChild(timeLabel)
  root.appendChild(timerDisplay)

  // ── Session dots ─────────────────────────────────────────────────────────
  const sessionInfo = document.createElement('div')
  sessionInfo.className = 'pomodoro-session-info'

  const sessionDots = document.createElement('div')
  sessionDots.className = 'pomodoro-session-dots'
  sessionDots.setAttribute('aria-label', 'Completed sessions')

  const sessionCount = document.createElement('span')
  sessionCount.className = 'pomodoro-session-count'
  sessionCount.textContent = '0 sessions completed'

  sessionInfo.appendChild(sessionDots)
  sessionInfo.appendChild(sessionCount)
  root.appendChild(sessionInfo)

  // ── Controls ─────────────────────────────────────────────────────────────
  const controls = document.createElement('div')
  controls.className = 'pomodoro-controls'

  const resetBtn = document.createElement('button')
  resetBtn.className = 'pomodoro-btn pomodoro-btn-secondary'
  resetBtn.setAttribute('aria-label', 'Reset timer')
  resetBtn.title = 'Reset'
  resetBtn.textContent = '↺'
  resetBtn.addEventListener('click', () => {
    timer.reset()
    trackActivity('pomodoro', 'Reset timer', `Reset ${getModeLabel(timer.getState().mode)} session`)
  })

  const startPauseBtn = document.createElement('button')
  startPauseBtn.className = 'pomodoro-btn pomodoro-btn-primary'
  startPauseBtn.setAttribute('aria-label', 'Start timer')
  startPauseBtn.textContent = '▶ Start'
  startPauseBtn.addEventListener('click', () => {
    const state = timer.getState()
    if (state.status === 'running') {
      timer.pause()
      trackActivity('pomodoro', 'Paused timer', `Paused at ${formatTime(state.timeRemaining)}`)
    } else {
      timer.start()
      trackActivity('pomodoro', 'Started timer', `Started ${getModeLabel(state.mode)} session`)
    }
  })

  const skipBtn = document.createElement('button')
  skipBtn.className = 'pomodoro-btn pomodoro-btn-secondary'
  skipBtn.setAttribute('aria-label', 'Skip to next session')
  skipBtn.title = 'Skip'
  skipBtn.textContent = '⏭'
  skipBtn.addEventListener('click', () => {
    timer.skip()
    trackActivity('pomodoro', 'Skipped session', `Skipped to ${getModeLabel(timer.getState().mode)}`)
  })

  controls.appendChild(resetBtn)
  controls.appendChild(startPauseBtn)
  controls.appendChild(skipBtn)
  root.appendChild(controls)

  // ── Settings panel ───────────────────────────────────────────────────────
  const settingsToggle = document.createElement('button')
  settingsToggle.className = 'pomodoro-settings-toggle'
  settingsToggle.textContent = '⚙ Settings'
  settingsToggle.setAttribute('aria-expanded', 'false')
  settingsToggle.setAttribute('aria-controls', 'pomodoro-settings-panel')

  const settingsPanel = document.createElement('div')
  settingsPanel.className = 'pomodoro-settings-panel'
  settingsPanel.id = 'pomodoro-settings-panel'
  settingsPanel.hidden = true

  settingsToggle.addEventListener('click', () => {
    const isHidden = settingsPanel.hidden
    settingsPanel.hidden = !isHidden
    settingsToggle.setAttribute('aria-expanded', String(isHidden))
    settingsToggle.textContent = isHidden ? '⚙ Settings ▲' : '⚙ Settings'
  })

  const settingFields: Array<{
    id: string
    label: string
    key: keyof PomodoroSettings
    min: number
    max: number
    step: number
    toDisplay: (v: number) => number
    fromDisplay: (v: number) => number
  }> = [
    {
      id: 'pomodoro-work-duration',
      label: 'Focus duration (min)',
      key: 'workDuration',
      min: 1,
      max: 60,
      step: 1,
      toDisplay: (v) => Math.round(v / 60),
      fromDisplay: (v) => v * 60,
    },
    {
      id: 'pomodoro-short-break',
      label: 'Short break (min)',
      key: 'shortBreakDuration',
      min: 1,
      max: 30,
      step: 1,
      toDisplay: (v) => Math.round(v / 60),
      fromDisplay: (v) => v * 60,
    },
    {
      id: 'pomodoro-long-break',
      label: 'Long break (min)',
      key: 'longBreakDuration',
      min: 5,
      max: 60,
      step: 5,
      toDisplay: (v) => Math.round(v / 60),
      fromDisplay: (v) => v * 60,
    },
    {
      id: 'pomodoro-sessions-until-long',
      label: 'Sessions until long break',
      key: 'sessionsUntilLongBreak',
      min: 2,
      max: 8,
      step: 1,
      toDisplay: (v) => v,
      fromDisplay: (v) => v,
    },
  ]

  settingFields.forEach(({ id, label, key, min, max, step, toDisplay, fromDisplay }) => {
    const fieldWrap = document.createElement('div')
    fieldWrap.className = 'pomodoro-setting-row'

    const lbl = document.createElement('label')
    lbl.htmlFor = id
    lbl.textContent = label

    const input = document.createElement('input')
    input.type = 'number'
    input.id = id
    input.min = String(min)
    input.max = String(max)
    input.step = String(step)
    input.value = String(toDisplay((DEFAULT_SETTINGS as unknown as Record<string, number>)[key]))
    input.className = 'pomodoro-setting-input'

    input.addEventListener('change', () => {
      const raw = Number(input.value)
      if (isNaN(raw)) return
      const clamped = Math.min(max, Math.max(min, raw))
      input.value = String(clamped)
      timer.updateSettings({ [key]: fromDisplay(clamped) })
      // Refresh time display if idle
      if (timer.getState().status === 'idle') {
        updateDisplay(timer.getState())
      }
      trackActivity('pomodoro', 'Updated settings', `${label} set to ${clamped}`)
    })

    fieldWrap.appendChild(lbl)
    fieldWrap.appendChild(input)
    settingsPanel.appendChild(fieldWrap)
  })

  root.appendChild(settingsToggle)
  root.appendChild(settingsPanel)

  // ── Stats row ────────────────────────────────────────────────────────────
  const statsRow = document.createElement('div')
  statsRow.className = 'pomodoro-stats'

  const focusStatEl = document.createElement('div')
  focusStatEl.className = 'pomodoro-stat'
  focusStatEl.innerHTML = '<span class="pomodoro-stat-value" id="pomodoro-stat-focus">0 min</span><span class="pomodoro-stat-label">Total focus time</span>'

  const streakStatEl = document.createElement('div')
  streakStatEl.className = 'pomodoro-stat'
  streakStatEl.innerHTML = '<span class="pomodoro-stat-value" id="pomodoro-stat-sessions">0</span><span class="pomodoro-stat-label">Sessions today</span>'

  statsRow.appendChild(focusStatEl)
  statsRow.appendChild(streakStatEl)
  root.appendChild(statsRow)

  // ── Helper: switch mode (tab click) ─────────────────────────────────────
  function switchMode(targetMode: 'work' | 'shortBreak' | 'longBreak'): void {
    if (timer.getState().status === 'running') timer.pause()
    // Skip through modes until we land on the target
    let iterations = 0
    while (timer.getState().mode !== targetMode && iterations < 10) {
      timer.skip()
      iterations++
    }
    // Update tab active states
    modeTabs.querySelectorAll('.pomodoro-mode-tab').forEach((tab) => {
      const t = tab as HTMLButtonElement
      const isActive = t.dataset['mode'] === targetMode
      t.classList.toggle('active', isActive)
      t.setAttribute('aria-selected', String(isActive))
    })
  }

  // ── Helper: update DOM from state ────────────────────────────────────────
  function updateDisplay(state: PomodoroState): void {
    // Time text
    timeText.textContent = formatTime(state.timeRemaining)

    // Mode text
    modeText.textContent = getModeLabel(state.mode)

    // Progress ring
    const progress = getProgress(state)
    const dashoffset = CIRCUMFERENCE * (1 - progress)
    progressCircle.style.strokeDashoffset = String(dashoffset)

    // Mode colour class on ring
    progressCircle.setAttribute('class', `pomodoro-ring-progress pomodoro-ring-${state.mode}`)

    // Start/Pause button
    if (state.status === 'running') {
      startPauseBtn.textContent = '⏸ Pause'
      startPauseBtn.setAttribute('aria-label', 'Pause timer')
    } else {
      startPauseBtn.textContent = state.status === 'idle' ? '▶ Start' : '▶ Resume'
      startPauseBtn.setAttribute('aria-label', state.status === 'idle' ? 'Start timer' : 'Resume timer')
    }

    // Active tab
    modeTabs.querySelectorAll('.pomodoro-mode-tab').forEach((tab) => {
      const t = tab as HTMLButtonElement
      const isActive = t.dataset['mode'] === state.mode
      t.classList.toggle('active', isActive)
      t.setAttribute('aria-selected', String(isActive))
    })

    // Session dots (up to sessionsUntilLongBreak shown)
    sessionDots.innerHTML = ''
    const currentCycleProgress = state.sessionsCompleted % DEFAULT_SETTINGS.sessionsUntilLongBreak
    for (let i = 0; i < DEFAULT_SETTINGS.sessionsUntilLongBreak; i++) {
      const dot = document.createElement('span')
      dot.className = `pomodoro-dot${i < currentCycleProgress ? ' filled' : ''}`
      dot.setAttribute('aria-hidden', 'true')
      sessionDots.appendChild(dot)
    }

    sessionCount.textContent = `${state.sessionsCompleted} session${state.sessionsCompleted !== 1 ? 's' : ''} completed`

    // Stats
    const focusStatValue = document.getElementById('pomodoro-stat-focus')
    if (focusStatValue) {
      const mins = Math.floor(state.totalFocusTime / 60)
      focusStatValue.textContent = `${mins} min`
    }
    const sessionsStatValue = document.getElementById('pomodoro-stat-sessions')
    if (sessionsStatValue) {
      sessionsStatValue.textContent = String(state.sessionsCompleted)
    }
  }

  // ── Subscribe to timer events ────────────────────────────────────────────
  timer.on((event) => {
    updateDisplay(event.state)

    if (event.type === 'finish') {
      const mode = event.state.mode
      const label = getModeLabel(mode)
      const emoji = getModeEmoji(mode)
      notificationManager.show(
        `${emoji} ${label} session complete! Time for ${getModeLabel(
          mode === 'work' ? 'shortBreak' : 'work',
        )}.`,
        { type: 'success', duration: 5000 },
      )
      trackActivity('pomodoro', `${label} session complete`, `${emoji} ${label} finished`)
    }
  })

  // Initial render
  updateDisplay(timer.getState())

  return root
}
