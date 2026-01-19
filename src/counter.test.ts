import { describe, it, expect } from 'vitest'
import { setupCounter } from './counter'

describe('setupCounter', () => {
  it('should initialize counter to 0', () => {
    const button = document.createElement('button')
    setupCounter(button)
    expect(button.innerHTML).toBe('count is 0')
  })

  it('should increment counter on click', () => {
    const button = document.createElement('button')
    setupCounter(button)

    button.click()
    expect(button.innerHTML).toBe('count is 1')

    button.click()
    expect(button.innerHTML).toBe('count is 2')
  })
})
