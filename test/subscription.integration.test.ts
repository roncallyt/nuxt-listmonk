import type { H3Event } from 'h3'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  callHook: vi.fn(),
  readBody: vi.fn(),
  useRuntimeConfig: vi.fn(),
}))

vi.mock('#imports', () => ({
  useRuntimeConfig: mocks.useRuntimeConfig,
}))

vi.mock('nitropack/runtime', () => ({
  useNitroApp: () => ({
    hooks: {
      callHook: mocks.callHook,
    },
  }),
}))

vi.mock('h3', async (importOriginal) => {
  const original = await importOriginal<typeof import('h3')>()

  return {
    ...original,
    readBody: mocks.readBody,
  }
})

const { default: subscribeHandler } = await import('../src/runtime/server/api/subscribe')

const event = {} as H3Event
const baseConfig = {
  host: 'https://listmonk.example.com',
  listId: 7,
  apiUsername: 'newsletter-api',
  apiToken: 'test-token',
}

describe('subscription integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.callHook.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('normalizes a request and creates a subscriber with attributes', async () => {
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response('{}', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    mocks.useRuntimeConfig.mockReturnValue({ listmonk: baseConfig })
    mocks.readBody.mockResolvedValue({
      email: ' person@example.com ',
      name: ' Person ',
      attribs: { locale: 'pt-BR', interests: ['security'] },
    })

    await expect(subscribeHandler(event)).resolves.toEqual({
      message: 'E-mail \'person@example.com\' subscribed to the list.',
    })

    expect(fetchMock).toHaveBeenCalledOnce()
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toEqual({
      name: 'Person',
      email: 'person@example.com',
      status: 'enabled',
      lists: [7],
      preconfirm_subscriptions: true,
      attribs: { locale: 'pt-BR', interests: ['security'] },
    })
  })

  it('adds the list and patches submitted attributes for a conflict in merge mode', async () => {
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response('{}', { status: 409 }))
      .mockResolvedValueOnce(Response.json({
        data: { results: [{ id: 42, email: 'person@example.com' }] },
      }))
      .mockResolvedValueOnce(new Response('{}', { status: 200 }))
      .mockResolvedValueOnce(new Response('{}', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    mocks.useRuntimeConfig.mockReturnValue({
      listmonk: {
        ...baseConfig,
        existingSubscriberMode: 'merge',
      },
    })
    mocks.readBody.mockResolvedValue({
      email: 'person@example.com',
      attribs: { locale: 'pt-BR' },
    })

    await expect(subscribeHandler(event)).resolves.toEqual({
      message: 'E-mail \'person@example.com\' subscribed to the list.',
    })

    expect(fetchMock.mock.calls.map(call => call[1]?.method)).toEqual([
      'POST',
      'GET',
      'PUT',
      'PATCH',
    ])
    expect(fetchMock.mock.calls[3]?.[0]).toBe(
      'https://listmonk.example.com/api/subscribers/42',
    )
    expect(JSON.parse(String(fetchMock.mock.calls[3]?.[1]?.body))).toEqual({
      attribs: { locale: 'pt-BR' },
    })
  })
})
