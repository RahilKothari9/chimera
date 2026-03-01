/**
 * Pomodoro Timer Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  PomodoroTimer,
  DEFAULT_SETTINGS,
  formatTime,
  getProgress,
  getModeDuration,
  getModeLabel,
  getModeEmoji,
  getNextMode,
  type PomodoroSettings,
} from './pomodoroTimer'

// ── Utility functions ────────────────────────────────────────────────────────

describe('formatTime', () => {
  it('formats zero as 00:00', () => {
    expect(formatTime(0)).toBe('00:00')
  })

  it('formats 90 seconds as 01:30', () => {
    expect(formatTime(90)).toBe('01:30')
  })

  it('formats 25 minutes as 25:00', () => {
    expect(formatTime(1500)).toBe('25:00')
  })

  it('pads minutes and seconds to 2 digits', () => {
    expect(formatTime(65)).toBe('01:05')
  })

  it('handles large values', () => {
    expect(formatTime(3600)).toBe('60:00')
  })
})

describe('getModeDuration', () => {
  it('returns work duration for work mode', () => {
    expect(getModeDuration('work', DEFAULT_SETTINGS)).toBe(DEFAULT_SETTINGS.workDuration)
  })

  it('returns short break duration', () => {
    expect(getModeDuration('shortBreak', DEFAULT_SETTINGS)).toBe(DEFAULT_SETTINGS.shortBreakDuration)
  })

  it('returns long break duration', () => {
    expect(getModeDuration('longBreak', DEFAULT_SETTINGS)).toBe(DEFAULT_SETTINGS.longBreakDuration)
  })
})

describe('getModeLabel', () => {
  it('returns Focus for work', () => {
    expect(getModeLabel('work')).toBe('Focus')
  })

  it('returns Short Break for shortBreak', () => {
    expect(getModeLabel('shortBreak')).toBe('Short Break')
  })

  it('returns Long Break for longBreak', () => {
    expect(getModeLabel('longBreak')).toBe('Long Break')
  })
})

describe('getModeEmoji', () => {
  it('returns tomato for work', () => {
    expect(getModeEmoji('work')).toBe('🍅')
  })

  it('returns coffee for shortBreak', () => {
    expect(getModeEmoji('shortBreak')).toBe('☕')
  })

  it('returns palm tree for longBreak', () => {
    expect(getModeEmoji('longBreak')).toBe('🌴')
  })
})

describe('getProgress', () => {
  it('returns 0 when no time has elapsed', () => {
    const state = {
      mode: 'work' as const,
      status: 'idle' as const,
      timeRemaining: 1500,
      totalTime: 1500,
      sessionsCompleted: 0,
      totalFocusTime: 0,
    }
    expect(getProgress(state)).toBe(0)
  })

  it('returns 0.5 when half the time has elapsed', () => {
    const state = {
      mode: 'work' as const,
      status: 'running' as const,
      timeRemaining: 750,
      totalTime: 1500,
      sessionsCompleted: 0,
      totalFocusTime: 0,
    }
    expect(getProgress(state)).toBeCloseTo(0.5)
  })

  it('returns 1 when all time has elapsed', () => {
    const state = {
      mode: 'work' as const,
      status: 'finished' as const,
      timeRemaining: 0,
      totalTime: 1500,
      sessionsCompleted: 0,
      totalFocusTime: 0,
    }
    expect(getProgress(state)).toBe(1)
  })

  it('returns 0 when totalTime is 0', () => {
    const state = {
      mode: 'work' as const,
      status: 'idle' as const,
      timeRemaining: 0,
      totalTime: 0,
      sessionsCompleted: 0,
      totalFocusTime: 0,
    }
    expect(getProgress(state)).toBe(0)
  })
})

describe('getNextMode', () => {
  const settings: PomodoroSettings = {
    ...DEFAULT_SETTINGS,
    sessionsUntilLongBreak: 4,
  }

  it('returns shortBreak after first work session', () => {
    expect(getNextMode('work', 0, settings)).toBe('shortBreak')
  })

  it('returns shortBreak after second and third work sessions', () => {
    expect(getNextMode('work', 1, settings)).toBe('shortBreak')
    expect(getNextMode('work', 2, settings)).toBe('shortBreak')
  })

  it('returns longBreak after fourth work session', () => {
    expect(getNextMode('work', 3, settings)).toBe('longBreak')
  })

  it('returns longBreak every 4 sessions', () => {
    expect(getNextMode('work', 7, settings)).toBe('longBreak')
  })

  it('returns work after any break', () => {
    expect(getNextMode('shortBreak', 2, settings)).toBe('work')
    expect(getNextMode('longBreak', 4, settings)).toBe('work')
  })
})

// ── PomodoroTimer class ──────────────────────────────────────────────────────

describe('PomodoroTimer', () => {
  let timer: PomodoroTimer
  const fastSettings: PomodoroSettings = {
    workDuration: 3,
    shortBreakDuration: 2,
    longBreakDuration: 4,
    sessionsUntilLongBreak: 2,
  }

  beforeEach(() => {
    vi.useFakeTimers()
    timer = new PomodoroTimer(fastSettings)
  })

  afterEach(() => {
    timer.destroy()
    vi.useRealTimers()
  })

  describe('initial state', () => {
    it('starts in work mode', () => {
      expect(timer.getState().mode).toBe('work')
    })

    it('starts with idle status', () => {
      expect(timer.getState().status).toBe('idle')
    })

    it('starts with full work duration', () => {
      expect(timer.getState().timeRemaining).toBe(fastSettings.workDuration)
    })

    it('starts with zero sessions completed', () => {
      expect(timer.getState().sessionsCompleted).toBe(0)
    })

    it('starts with zero total focus time', () => {
      expect(timer.getState().totalFocusTime).toBe(0)
    })
  })

  describe('start', () => {
    it('transitions to running state', () => {
      timer.start()
      expect(timer.getState().status).toBe('running')
    })

    it('emits start event', () => {
      const events: string[] = []
      timer.on((e) => events.push(e.type))
      timer.start()
      expect(events).toContain('start')
    })

    it('decrements timeRemaining each second', () => {
      timer.start()
      vi.advanceTimersByTime(1000)
      expect(timer.getState().timeRemaining).toBe(fastSettings.workDuration - 1)
    })

    it('does nothing if already running', () => {
      timer.start()
      const events: string[] = []
      timer.on((e) => events.push(e.type))
      timer.start()
      expect(events).not.toContain('start')
    })
  })

  describe('pause', () => {
    it('transitions to paused state', () => {
      timer.start()
      timer.pause()
      expect(timer.getState().status).toBe('paused')
    })

    it('stops decrementing time', () => {
      timer.start()
      vi.advanceTimersByTime(1000)
      timer.pause()
      const timeAfterPause = timer.getState().timeRemaining
      vi.advanceTimersByTime(2000)
      expect(timer.getState().timeRemaining).toBe(timeAfterPause)
    })

    it('emits pause event', () => {
      timer.start()
      const events: string[] = []
      timer.on((e) => events.push(e.type))
      timer.pause()
      expect(events).toContain('pause')
    })

    it('does nothing when idle', () => {
      const events: string[] = []
      timer.on((e) => events.push(e.type))
      timer.pause()
      expect(events).not.toContain('pause')
    })
  })

  describe('reset', () => {
    it('returns to idle state', () => {
      timer.start()
      vi.advanceTimersByTime(1000)
      timer.reset()
      expect(timer.getState().status).toBe('idle')
    })

    it('restores full time remaining', () => {
      timer.start()
      vi.advanceTimersByTime(1000)
      timer.reset()
      expect(timer.getState().timeRemaining).toBe(fastSettings.workDuration)
    })

    it('preserves session count', () => {
      timer.start()
      vi.advanceTimersByTime(fastSettings.workDuration * 1000)
      // Let finish + modeChange fire
      const sessions = timer.getState().sessionsCompleted
      timer.reset()
      expect(timer.getState().sessionsCompleted).toBe(sessions)
    })

    it('emits reset event', () => {
      const events: string[] = []
      timer.on((e) => events.push(e.type))
      timer.reset()
      expect(events).toContain('reset')
    })
  })

  describe('session completion', () => {
    it('transitions to short break after first work session', () => {
      timer.start()
      vi.advanceTimersByTime(fastSettings.workDuration * 1000)
      expect(timer.getState().mode).toBe('shortBreak')
    })

    it('increments sessionsCompleted after work session', () => {
      timer.start()
      vi.advanceTimersByTime(fastSettings.workDuration * 1000)
      expect(timer.getState().sessionsCompleted).toBe(1)
    })

    it('adds to totalFocusTime after work session', () => {
      timer.start()
      vi.advanceTimersByTime(fastSettings.workDuration * 1000)
      expect(timer.getState().totalFocusTime).toBe(fastSettings.workDuration)
    })

    it('transitions to long break after sessionsUntilLongBreak sessions', () => {
      // Session 1
      timer.start()
      vi.advanceTimersByTime(fastSettings.workDuration * 1000)
      // Short break
      timer.start()
      vi.advanceTimersByTime(fastSettings.shortBreakDuration * 1000)
      // Session 2 - should trigger long break
      timer.start()
      vi.advanceTimersByTime(fastSettings.workDuration * 1000)
      expect(timer.getState().mode).toBe('longBreak')
    })

    it('transitions back to work after break', () => {
      timer.start()
      vi.advanceTimersByTime(fastSettings.workDuration * 1000)
      // short break
      timer.start()
      vi.advanceTimersByTime(fastSettings.shortBreakDuration * 1000)
      expect(timer.getState().mode).toBe('work')
    })

    it('emits finish then modeChange events', () => {
      const events: string[] = []
      timer.on((e) => events.push(e.type))
      timer.start()
      vi.advanceTimersByTime(fastSettings.workDuration * 1000)
      expect(events).toContain('finish')
      expect(events).toContain('modeChange')
    })
  })

  describe('skip', () => {
    it('transitions to next mode without incrementing sessions', () => {
      timer.skip()
      expect(timer.getState().mode).toBe('shortBreak')
      expect(timer.getState().sessionsCompleted).toBe(0)
    })

    it('does not add to totalFocusTime on skip', () => {
      timer.skip()
      expect(timer.getState().totalFocusTime).toBe(0)
    })
  })

  describe('updateSettings', () => {
    it('updates settings', () => {
      timer.updateSettings({ workDuration: 10 })
      expect(timer.getSettings().workDuration).toBe(10)
    })

    it('updates timeRemaining when idle', () => {
      timer.updateSettings({ workDuration: 10 })
      expect(timer.getState().timeRemaining).toBe(10)
    })

    it('does not update timeRemaining when running', () => {
      timer.start()
      vi.advanceTimersByTime(1000)
      const timeBefore = timer.getState().timeRemaining
      timer.updateSettings({ workDuration: 999 })
      expect(timer.getState().timeRemaining).toBe(timeBefore)
    })
  })

  describe('event listener removal', () => {
    it('removes listener when unsubscribe is called', () => {
      const events: string[] = []
      const off = timer.on((e) => events.push(e.type))
      off()
      timer.start()
      expect(events).toHaveLength(0)
    })
  })

  describe('DEFAULT_SETTINGS', () => {
    it('has 25 minute work duration', () => {
      expect(DEFAULT_SETTINGS.workDuration).toBe(25 * 60)
    })

    it('has 5 minute short break', () => {
      expect(DEFAULT_SETTINGS.shortBreakDuration).toBe(5 * 60)
    })

    it('has 15 minute long break', () => {
      expect(DEFAULT_SETTINGS.longBreakDuration).toBe(15 * 60)
    })

    it('has 4 sessions until long break', () => {
      expect(DEFAULT_SETTINGS.sessionsUntilLongBreak).toBe(4)
    })
  })
})
