/**
 * Pomodoro Timer
 * Core logic for a Pomodoro productivity timer with configurable work/break cycles
 */

export type TimerMode = 'work' | 'shortBreak' | 'longBreak'
export type TimerStatus = 'idle' | 'running' | 'paused' | 'finished'

export interface PomodoroSettings {
  workDuration: number       // seconds
  shortBreakDuration: number // seconds
  longBreakDuration: number  // seconds
  sessionsUntilLongBreak: number
}

export interface PomodoroState {
  mode: TimerMode
  status: TimerStatus
  timeRemaining: number // seconds
  totalTime: number     // seconds for current mode
  sessionsCompleted: number
  totalFocusTime: number // seconds of completed work sessions
}

export const DEFAULT_SETTINGS: PomodoroSettings = {
  workDuration: 25 * 60,
  shortBreakDuration: 5 * 60,
  longBreakDuration: 15 * 60,
  sessionsUntilLongBreak: 4,
}

/**
 * Returns the duration in seconds for a given mode and settings
 */
export function getModeDuration(mode: TimerMode, settings: PomodoroSettings): number {
  switch (mode) {
    case 'work':
      return settings.workDuration
    case 'shortBreak':
      return settings.shortBreakDuration
    case 'longBreak':
      return settings.longBreakDuration
  }
}

/**
 * Returns the mode label for display
 */
export function getModeLabel(mode: TimerMode): string {
  switch (mode) {
    case 'work':
      return 'Focus'
    case 'shortBreak':
      return 'Short Break'
    case 'longBreak':
      return 'Long Break'
  }
}

/**
 * Returns the mode emoji for display
 */
export function getModeEmoji(mode: TimerMode): string {
  switch (mode) {
    case 'work':
      return '🍅'
    case 'shortBreak':
      return '☕'
    case 'longBreak':
      return '🌴'
  }
}

/**
 * Formats seconds into MM:SS string
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(Math.abs(seconds) / 60)
  const secs = Math.abs(seconds) % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

/**
 * Calculates the progress fraction (0–1) for the current session
 */
export function getProgress(state: PomodoroState): number {
  if (state.totalTime === 0) return 0
  return 1 - state.timeRemaining / state.totalTime
}

/**
 * Determines the next mode after a session finishes
 */
export function getNextMode(
  currentMode: TimerMode,
  sessionsCompleted: number,
  settings: PomodoroSettings,
): TimerMode {
  if (currentMode !== 'work') {
    return 'work'
  }
  const newCount = sessionsCompleted + 1
  if (newCount % settings.sessionsUntilLongBreak === 0) {
    return 'longBreak'
  }
  return 'shortBreak'
}

export type PomodoroEventType = 'tick' | 'start' | 'pause' | 'reset' | 'finish' | 'modeChange'

export interface PomodoroEvent {
  type: PomodoroEventType
  state: PomodoroState
}

export type PomodoroListener = (event: PomodoroEvent) => void

/**
 * Pomodoro Timer controller
 */
export class PomodoroTimer {
  private settings: PomodoroSettings
  private state: PomodoroState
  private listeners: PomodoroListener[] = []
  private intervalId: ReturnType<typeof setInterval> | null = null

  constructor(settings: Partial<PomodoroSettings> = {}) {
    this.settings = { ...DEFAULT_SETTINGS, ...settings }
    this.state = this.createInitialState('work')
  }

  private createInitialState(mode: TimerMode): PomodoroState {
    const duration = getModeDuration(mode, this.settings)
    return {
      mode,
      status: 'idle',
      timeRemaining: duration,
      totalTime: duration,
      sessionsCompleted: this.state?.sessionsCompleted ?? 0,
      totalFocusTime: this.state?.totalFocusTime ?? 0,
    }
  }

  getState(): Readonly<PomodoroState> {
    return { ...this.state }
  }

  getSettings(): Readonly<PomodoroSettings> {
    return { ...this.settings }
  }

  on(listener: PomodoroListener): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  private emit(type: PomodoroEventType): void {
    const event: PomodoroEvent = { type, state: { ...this.state } }
    this.listeners.forEach((l) => l(event))
  }

  start(): void {
    if (this.state.status === 'running') return
    this.state.status = 'running'
    this.emit('start')

    this.intervalId = setInterval(() => {
      this.state.timeRemaining -= 1
      this.emit('tick')

      if (this.state.timeRemaining <= 0) {
        this.finish()
      }
    }, 1000)
  }

  pause(): void {
    if (this.state.status !== 'running') return
    this.clearInterval()
    this.state.status = 'paused'
    this.emit('pause')
  }

  reset(): void {
    this.clearInterval()
    const mode = this.state.mode
    const sessionsCompleted = this.state.sessionsCompleted
    const totalFocusTime = this.state.totalFocusTime
    const duration = getModeDuration(mode, this.settings)
    this.state = {
      mode,
      status: 'idle',
      timeRemaining: duration,
      totalTime: duration,
      sessionsCompleted,
      totalFocusTime,
    }
    this.emit('reset')
  }

  skip(): void {
    this.clearInterval()
    this.finishSession(false)
  }

  private finish(): void {
    this.clearInterval()
    this.state.timeRemaining = 0
    this.state.status = 'finished'
    this.emit('finish')
    this.finishSession(true)
  }

  private finishSession(completed: boolean): void {
    if (completed && this.state.mode === 'work') {
      this.state.totalFocusTime += this.state.totalTime
    }
    const prevSessions = this.state.sessionsCompleted
    const newSessions = this.state.mode === 'work' && completed
      ? prevSessions + 1
      : prevSessions

    const nextMode = getNextMode(this.state.mode, prevSessions, this.settings)
    const duration = getModeDuration(nextMode, this.settings)

    this.state = {
      mode: nextMode,
      status: 'idle',
      timeRemaining: duration,
      totalTime: duration,
      sessionsCompleted: newSessions,
      totalFocusTime: this.state.totalFocusTime,
    }
    this.emit('modeChange')
  }

  updateSettings(newSettings: Partial<PomodoroSettings>): void {
    this.settings = { ...this.settings, ...newSettings }
    if (this.state.status === 'idle') {
      const duration = getModeDuration(this.state.mode, this.settings)
      this.state.timeRemaining = duration
      this.state.totalTime = duration
    }
  }

  destroy(): void {
    this.clearInterval()
    this.listeners = []
  }

  private clearInterval(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }
}
