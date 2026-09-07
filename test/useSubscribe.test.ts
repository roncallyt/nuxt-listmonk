import { afterEach, describe, expect, it, vi } from 'vitest'
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
})
