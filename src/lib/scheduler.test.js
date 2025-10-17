import { describe, it, expect } from 'vitest'
import { normalizeFuture, getDelays, advanceRecurrence, getIntervalMillis } from './scheduler.js'

describe('scheduler helpers', () => {
  it('getIntervalMillis returns correct ms', () => {
    expect(getIntervalMillis('none')).toBe(0)
    expect(getIntervalMillis('daily')).toBe(24*60*60*1000)
    expect(getIntervalMillis('weekly')).toBe(7*24*60*60*1000)
  })

  it('normalizeFuture advances daily recurrences into the future', () => {
    const past = new Date(Date.now() - 2*24*60*60*1000).toISOString() // 2 days ago
    const item = { id: 'x', msg: 'hey', when: past, recurrence: 'daily' }
    const out = normalizeFuture(item)
    expect(new Date(out.when).getTime()).toBeGreaterThan(Date.now())
  })

  it('getDelays returns non-negative delays', () => {
    const now = new Date()
    const soon = new Date(now.getTime() + 5*60*1000).toISOString()
    const past = new Date(now.getTime() - 60*1000).toISOString()
    const list = [{ when: soon, recurrence: 'none' }, { when: past, recurrence: 'daily' }]
    const delays = getDelays(list)
    expect(delays.length).toBe(2)
    expect(delays[0]).toBeGreaterThan(0)
    expect(delays[1]).toBeGreaterThanOrEqual(0)
  })

  it('advanceRecurrence returns next ISO timestamp for daily/weekly', () => {
    const now = new Date().toISOString()
    const nextDaily = advanceRecurrence({ when: now, recurrence: 'daily' })
    expect(new Date(nextDaily).getTime()).toBeGreaterThan(new Date(now).getTime())
    const nextWeekly = advanceRecurrence({ when: now, recurrence: 'weekly' })
    expect(new Date(nextWeekly).getTime()).toBeGreaterThan(new Date(now).getTime())
  })
})
