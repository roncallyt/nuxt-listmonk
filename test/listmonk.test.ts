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
  existingSubscriberMode: 'preserve' as const,
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

  it('includes submitted attributes when creating a subscriber', async () => {
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response('{}', { status: 200 }))

    await subscribeWithListmonk({
      email: 'person@example.com',
      name: 'Person',
      attribs: {
        locale: 'pt-BR',
        preferences: { topics: ['security', 'payments'] },
      },
    }, config, fetchMock)

    const request = fetchMock.mock.calls[0]?.[1]

    expect(JSON.parse(String(request?.body))).toEqual({
      name: 'Person',
      email: 'person@example.com',
      status: 'enabled',
      lists: [7],
      preconfirm_subscriptions: true,
      attribs: {
        locale: 'pt-BR',
        preferences: { topics: ['security', 'payments'] },
      },
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

  it('patches only submitted profile fields in merge mode after adding the list', async () => {
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response('{}', { status: 409 }))
      .mockResolvedValueOnce(Response.json({
        data: { results: [{ id: 42, email: 'person@example.com' }] },
      }))
      .mockResolvedValueOnce(new Response('{}', { status: 200 }))
      .mockResolvedValueOnce(new Response('{}', { status: 200 }))

    await subscribeWithListmonk({
      email: 'person@example.com',
      name: 'Updated person',
      attribs: { locale: 'pt-BR' },
    }, {
      ...config,
      existingSubscriberMode: 'merge',
    }, fetchMock)

    expect(fetchMock).toHaveBeenCalledTimes(4)
    expect(fetchMock.mock.calls.map(call => call[1]?.method)).toEqual([
      'POST',
      'GET',
      'PUT',
      'PATCH',
    ])

    const patchRequest = fetchMock.mock.calls[3]
    expect(patchRequest?.[0]).toBe('https://listmonk.example.com/api/subscribers/42')
    expect(JSON.parse(String(patchRequest?.[1]?.body))).toEqual({
      name: 'Updated person',
      attribs: { locale: 'pt-BR' },
    })
  })

  it.each([
    {
      label: 'name',
      subscriber: { email: 'person@example.com', name: 'Updated person' },
      patch: { name: 'Updated person' },
    },
    {
      label: 'attributes',
      subscriber: { email: 'person@example.com', attribs: { locale: 'pt-BR' } },
      patch: { attribs: { locale: 'pt-BR' } },
    },
  ])('patches submitted $label without adding other profile fields', async ({ subscriber, patch }) => {
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response('{}', { status: 409 }))
      .mockResolvedValueOnce(Response.json({
        data: { results: [{ id: 42, email: 'person@example.com' }] },
      }))
      .mockResolvedValueOnce(new Response('{}', { status: 200 }))
      .mockResolvedValueOnce(new Response('{}', { status: 200 }))

    await subscribeWithListmonk(subscriber, {
      ...config,
      existingSubscriberMode: 'merge',
    }, fetchMock)

    expect(JSON.parse(String(fetchMock.mock.calls[3]?.[1]?.body))).toEqual(patch)
  })

  it('skips an empty profile patch in merge mode', async () => {
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response('{}', { status: 409 }))
      .mockResolvedValueOnce(Response.json({
        data: { results: [{ id: 42, email: 'person@example.com' }] },
      }))
      .mockResolvedValueOnce(new Response('{}', { status: 200 }))

    await subscribeWithListmonk({ email: 'person@example.com' }, {
      ...config,
      existingSubscriberMode: 'merge',
    }, fetchMock)

    expect(fetchMock).toHaveBeenCalledTimes(3)
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

  it('surfaces profile patch failures after adding the list', async () => {
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response('{}', { status: 409 }))
      .mockResolvedValueOnce(Response.json({
        data: { results: [{ id: 42, email: 'person@example.com' }] },
      }))
      .mockResolvedValueOnce(new Response('{}', { status: 200 }))
      .mockResolvedValueOnce(new Response('{}', { status: 503 }))

    await expect(subscribeWithListmonk({
      email: 'person@example.com',
      attribs: { locale: 'pt-BR' },
    }, {
      ...config,
      existingSubscriberMode: 'merge',
    }, fetchMock)).rejects.toMatchObject({
      status: 503,
    })
    expect(fetchMock).toHaveBeenCalledTimes(4)
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

    expect(() => normalizeListmonkConfig({
      ...config,
      existingSubscriberMode: 'replace',
    })).toThrow(/valid existing subscriber mode/)

    expect(normalizeListmonkConfig({
      host: config.host,
      listId: config.listId,
      apiUsername: config.apiUsername,
      apiToken: config.apiToken,
    })).toEqual(config)
  })
})
