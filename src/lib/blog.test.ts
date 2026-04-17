import { describe, it, expect } from 'vitest'
import { computeReadingTime, getAllTags } from './blog'

describe('computeReadingTime', () => {
  it('returns "1 min read" for very short text', () => {
    expect(computeReadingTime('Hello world')).toBe('1 min read')
  })

  it('returns correct estimate for a known word count', () => {
    // 400 words at 200 wpm = 2 minutes
    const text = Array(400).fill('word').join(' ')
    expect(computeReadingTime(text)).toBe('2 min read')
  })

  it('rounds up fractional minutes', () => {
    // 201 words at 200 wpm = 1.005 minutes → rounds up to 2
    const text = Array(201).fill('word').join(' ')
    expect(computeReadingTime(text)).toBe('2 min read')
  })

  it('handles leading and trailing whitespace', () => {
    const text = '  ' + Array(200).fill('word').join(' ') + '  '
    expect(computeReadingTime(text)).toBe('1 min read')
  })
})

describe('getAllTags', () => {
  it('returns a sorted, deduplicated array of tags', () => {
    const tags = getAllTags()
    const sorted = [...tags].sort()
    expect(tags).toEqual(sorted)
    expect(new Set(tags).size).toBe(tags.length)
  })

  it('returns an array (empty or populated)', () => {
    const tags = getAllTags()
    expect(Array.isArray(tags)).toBe(true)
  })
})
