import { describe, it, expect } from 'vitest'
import sitemap from './sitemap'

describe('sitemap', () => {
  it('includes the toGather product page', () => {
    const urls = sitemap().map((entry) => entry.url)
    expect(urls).toContain('https://www.simplyinsilico.com/products/togather')
  })

  it('includes the Cerebrum product page', () => {
    const urls = sitemap().map((entry) => entry.url)
    expect(urls).toContain('https://www.simplyinsilico.com/products/cerebrum')
  })
})
