import { Buffer } from 'node:buffer'
import { describe, expect, it, vi } from 'vitest'
import {
  ListmonkRequestError,
  normalizeListmonkConfig,
  subscribeWithListmonk,
} from '../src/runtime/server/utils/listmonk'

const config = {
  host: 'https://listmonk.example.com',
  listId: 7,
  apiUsername: 'newsletter-api',
  apiToken: 'test-token',
}

describe('Listmonk API subscription', () => {
  it('creates and immediately confirms a new subscriber', async () => {
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response('{}', { status: 200 }))

    await subscribeWithListmonk({
      email: 'person@example.com',
      name: 'Person',
    }, config, fetchMock)

    expect(fetchMock).toHaveBeenCalledOnce()
    expect(fetchMock).toHaveBeenCalledWith(
      'https://listmonk.example.com/api/subscribers',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Basic ${Buffer.from('newsletter-api:test-token').toString('base64')}`,
          'Content-Type': 'application/json',
        },
      }),
    )

    const request = fetchMock.mock.calls[0]?.[1]

    expect(JSON.parse(String(request?.body))).toEqual({
      name: 'Person',
      email: 'person@example.com',
      status: 'enabled',
      lists: [7],
      preconfirm_subscriptions: true,
    })
  })

  it('adds the configured list without replacing an existing subscriber profile or lists', async () => {
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response('{}', { status: 409 }))
      .mockResolvedValueOnce(Response.json({
        data: {
          results: [{
            id: 42,
            email: 'o\'connor@example.com',
            name: 'Existing name',
            status: 'blocklisted',
            lists: [{ id: 3 }],
          }],
        },
      }))
      .mockResolvedValueOnce(new Response('{}', { status: 200 }))

    await subscribeWithListmonk({
      email: 'o\'connor@example.com',
      name: 'Replacement name',
    }, config, fetchMock)

    expect(fetchMock).toHaveBeenCalledTimes(3)

    const lookupUrl = new URL(String(fetchMock.mock.calls[1]?.[0]))
    expect(lookupUrl.pathname).toBe('/api/subscribers')
    expect(lookupUrl.searchParams.get('query'))
      .toBe('subscribers.email = \'o\'\'connor@example.com\'')

    const membershipRequest = fetchMock.mock.calls[2]
    expect(membershipRequest?.[0]).toBe('https://listmonk.example.com/api/subscribers/lists')
    expect(membershipRequest?.[1]?.method).toBe('PUT')
    expect(JSON.parse(String(membershipRequest?.[1]?.body))).toEqual({
      ids: [42],
      action: 'add',
      target_list_ids: [7],
      status: 'confirmed',
    })
  })

  it('surfaces non-conflict create failures without attempting a lookup', async () => {
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response('{}', { status: 401 }))

    await expect(subscribeWithListmonk({
      email: 'person@example.com',
      name: '',
    }, config, fetchMock)).rejects.toMatchObject({
      status: 401,
    })
    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it('fails when a conflicting subscriber cannot be found', async () => {
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response('{}', { status: 409 }))
      .mockResolvedValueOnce(Response.json({ data: { results: [] } }))

    await expect(subscribeWithListmonk({
      email: 'person@example.com',
      name: '',
    }, config, fetchMock)).rejects.toBeInstanceOf(ListmonkRequestError)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('surfaces membership update failures', async () => {
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response('{}', { status: 409 }))
      .mockResolvedValueOnce(Response.json({
        data: { results: [{ id: 42, email: 'person@example.com' }] },
      }))
      .mockResolvedValueOnce(new Response('{}', { status: 503 }))

    await expect(subscribeWithListmonk({
      email: 'person@example.com',
      name: '',
    }, config, fetchMock)).rejects.toMatchObject({
      status: 503,
    })
  })

  it('validates and normalizes server configuration', () => {
    expect(normalizeListmonkConfig({
      host: 'https://listmonk.example.com///',
      listId: '7',
      apiUsername: ' newsletter-api ',
      apiToken: ' test-token ',
    })).toEqual(config)

    expect(() => normalizeListmonkConfig({
      host: 'https://listmonk.example.com',
      listId: 'public-list-uuid',
      apiUsername: 'newsletter-api',
      apiToken: 'test-token',
    })).toThrow(/positive numeric list ID/)
  })
})
