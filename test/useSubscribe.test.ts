import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ListmonkSubscriber } from '../src/module'
import { useSubscribe } from '../src/runtime/composables/useSubscribe'

describe('useSubscribe', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns the server response', async () => {
    const response = { message: 'Subscribed.' }
    const fetchMock = vi.fn().mockResolvedValue(response)
    vi.stubGlobal('$fetch', fetchMock)

    await expect(useSubscribe({
      email: 'person@example.com',
      recaptchaToken: 'test-token',
    })).resolves.toBe(response)
    expect(fetchMock).toHaveBeenCalledWith('/api/subscribe', {
      method: 'POST',
      body: {
        email: 'person@example.com',
        recaptchaToken: 'test-token',
      },
    })
  })

  it('propagates server failures', async () => {
    const error = new Error('Listmonk unavailable')
    vi.stubGlobal('$fetch', vi.fn().mockRejectedValue(error))

    await expect(useSubscribe({ email: 'person@example.com' })).rejects.toBe(error)
  })

  it('exposes recursively typed subscriber attributes', () => {
    const subscriber: ListmonkSubscriber = {
      email: 'person@example.com',
      attribs: {
        locale: 'pt-BR',
        preferences: {
          topics: ['security', 'payments'],
          frequency: 2,
          enabled: true,
          fallback: null,
        },
      },
    }

    expect(subscriber.attribs?.locale).toBe('pt-BR')

    const arrayAttributes: ListmonkSubscriber = {
      email: 'person@example.com',
      // @ts-expect-error Attribute roots must be JSON objects.
      attribs: ['security'],
    }
    const nonJsonAttributes: ListmonkSubscriber = {
      email: 'person@example.com',
      // @ts-expect-error Dates are not JSON values.
      attribs: { createdAt: new Date() },
    }

    expect(arrayAttributes).toBeDefined()
    expect(nonJsonAttributes).toBeDefined()
  })
})
