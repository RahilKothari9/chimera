/**
 * Pomodoro Timer UI Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createPomodoroTimerUI } from './pomodoroTimerUI'

// Stub activity tracker and notification manager
vi.mock('./activityFeed', () => ({
  trackActivity: vi.fn(),
}))

vi.mock('./notificationSystem', () => ({
  notificationManager: {
    show: vi.fn(),
  },
}))

describe('createPomodoroTimerUI', () => {
  let container: HTMLElement

  beforeEach(() => {
    vi.useFakeTimers()
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('returns an HTMLElement', () => {
    const ui = createPomodoroTimerUI()
    expect(ui).toBeInstanceOf(HTMLElement)
  })

  it('renders a section title', () => {
    const ui = createPomodoroTimerUI()
    const title = ui.querySelector('.section-title')
    expect(title).not.toBeNull()
    expect(title!.textContent).toContain('Pomodoro Timer')
  })

  it('renders a subtitle', () => {
    const ui = createPomodoroTimerUI()
    const subtitle = ui.querySelector('.pomodoro-subtitle')
    expect(subtitle).not.toBeNull()
  })

  it('renders three mode tabs', () => {
    const ui = createPomodoroTimerUI()
    const tabs = ui.querySelectorAll('.pomodoro-mode-tab')
    expect(tabs).toHaveLength(3)
  })

  it('starts with Focus tab active', () => {
    const ui = createPomodoroTimerUI()
    const activeTab = ui.querySelector('.pomodoro-mode-tab.active')
    expect(activeTab).not.toBeNull()
    expect(activeTab!.textContent).toContain('Focus')
  })

  it('renders the SVG progress ring', () => {
    const ui = createPomodoroTimerUI()
    const svg = ui.querySelector('svg')
    expect(svg).not.toBeNull()
  })

  it('renders the time display with initial 25:00', () => {
    const ui = createPomodoroTimerUI()
    const timeText = ui.querySelector('.pomodoro-time-text')
    expect(timeText).not.toBeNull()
    expect(timeText!.textContent).toBe('25:00')
  })

  it('renders the mode text as Focus initially', () => {
    const ui = createPomodoroTimerUI()
    const modeText = ui.querySelector('.pomodoro-mode-text')
    expect(modeText).not.toBeNull()
    expect(modeText!.textContent).toBe('Focus')
  })

  it('renders Start button initially', () => {
    const ui = createPomodoroTimerUI()
    const startBtn = ui.querySelector('.pomodoro-btn-primary')
    expect(startBtn).not.toBeNull()
    expect(startBtn!.textContent).toContain('Start')
  })

  it('renders Reset and Skip buttons', () => {
    const ui = createPomodoroTimerUI()
    const secondaryBtns = ui.querySelectorAll('.pomodoro-btn-secondary')
    expect(secondaryBtns.length).toBeGreaterThanOrEqual(2)
  })

  it('renders session info area', () => {
    const ui = createPomodoroTimerUI()
    const sessionInfo = ui.querySelector('.pomodoro-session-info')
    expect(sessionInfo).not.toBeNull()
  })

  it('renders 0 sessions completed text initially', () => {
    const ui = createPomodoroTimerUI()
    const count = ui.querySelector('.pomodoro-session-count')
    expect(count).not.toBeNull()
    expect(count!.textContent).toContain('0')
  })

  it('renders settings toggle button', () => {
    const ui = createPomodoroTimerUI()
    const toggle = ui.querySelector('.pomodoro-settings-toggle')
    expect(toggle).not.toBeNull()
  })

  it('hides settings panel initially', () => {
    const ui = createPomodoroTimerUI()
    const panel = ui.querySelector('#pomodoro-settings-panel') as HTMLElement
    expect(panel).not.toBeNull()
    expect(panel.hidden).toBe(true)
  })

  it('shows settings panel on toggle click', () => {
    const ui = createPomodoroTimerUI()
    const toggle = ui.querySelector('.pomodoro-settings-toggle') as HTMLButtonElement
    const panel = ui.querySelector('#pomodoro-settings-panel') as HTMLElement
    toggle.click()
    expect(panel.hidden).toBe(false)
  })

  it('hides settings panel on second toggle click', () => {
    const ui = createPomodoroTimerUI()
    const toggle = ui.querySelector('.pomodoro-settings-toggle') as HTMLButtonElement
    const panel = ui.querySelector('#pomodoro-settings-panel') as HTMLElement
    toggle.click()
    toggle.click()
    expect(panel.hidden).toBe(true)
  })

  it('renders four settings fields', () => {
    const ui = createPomodoroTimerUI()
    const panel = ui.querySelector('#pomodoro-settings-panel')!
    const inputs = panel.querySelectorAll('.pomodoro-setting-input')
    expect(inputs.length).toBe(4)
  })

  it('renders stats section', () => {
    const ui = createPomodoroTimerUI()
    const stats = ui.querySelector('.pomodoro-stats')
    expect(stats).not.toBeNull()
  })

  it('shows Pause button after Start is clicked', () => {
    const ui = createPomodoroTimerUI()
    container.appendChild(ui)
    const startBtn = ui.querySelector('.pomodoro-btn-primary') as HTMLButtonElement
    startBtn.click()
    expect(startBtn.textContent).toContain('Pause')
  })

  it('shows Resume button after Pause', () => {
    const ui = createPomodoroTimerUI()
    container.appendChild(ui)
    const startBtn = ui.querySelector('.pomodoro-btn-primary') as HTMLButtonElement
    startBtn.click()
    startBtn.click() // pause
    expect(startBtn.textContent).toContain('Resume')
  })

  it('updates time display as timer ticks', () => {
    const ui = createPomodoroTimerUI()
    container.appendChild(ui)
    const startBtn = ui.querySelector('.pomodoro-btn-primary') as HTMLButtonElement
    startBtn.click()
    vi.advanceTimersByTime(60000) // 1 minute
    const timeText = ui.querySelector('.pomodoro-time-text')
    expect(timeText!.textContent).toBe('24:00')
  })

  it('resets to 25:00 after reset button click', () => {
    const ui = createPomodoroTimerUI()
    container.appendChild(ui)
    const startBtn = ui.querySelector('.pomodoro-btn-primary') as HTMLButtonElement
    const resetBtn = ui.querySelector('.pomodoro-btn-secondary') as HTMLButtonElement
    startBtn.click()
    vi.advanceTimersByTime(30000)
    resetBtn.click()
    const timeText = ui.querySelector('.pomodoro-time-text')
    expect(timeText!.textContent).toBe('25:00')
  })

  it('skips to next mode on skip button click', () => {
    const ui = createPomodoroTimerUI()
    container.appendChild(ui)
    const skipBtn = ui.querySelectorAll('.pomodoro-btn-secondary')[1] as HTMLButtonElement
    skipBtn.click()
    const modeText = ui.querySelector('.pomodoro-mode-text')
    expect(modeText!.textContent).not.toBe('Focus')
  })

  it('has aria-live region on time display', () => {
    const ui = createPomodoroTimerUI()
    const liveEl = ui.querySelector('[aria-live]')
    expect(liveEl).not.toBeNull()
  })

  it('switching mode tab changes mode text', () => {
    const ui = createPomodoroTimerUI()
    container.appendChild(ui)
    const tabs = ui.querySelectorAll('.pomodoro-mode-tab') as NodeListOf<HTMLButtonElement>
    // Click short break tab
    tabs[1].click()
    const modeText = ui.querySelector('.pomodoro-mode-text')
    expect(modeText!.textContent).toBe('Short Break')
  })
})
