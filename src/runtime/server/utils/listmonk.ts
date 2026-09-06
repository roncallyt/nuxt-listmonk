import { Buffer } from 'node:buffer'

export interface ListmonkRuntimeConfig {
  host: string
  listId: number
  apiUsername: string
  apiToken: string
}

interface RawListmonkConfig {
  host?: unknown
  listId?: unknown
  apiUsername?: unknown
  apiToken?: unknown
}

interface Subscriber {
  id: number
  email: string
}

interface SubscribersResponse {
  data?: {
    results?: Subscriber[]
  }
}

export class ListmonkRequestError extends Error {
  status: number

  constructor(status: number) {
    super(`Listmonk request failed with status ${status}.`)
    this.name = 'ListmonkRequestError'
    this.status = status
  }
}

export function normalizeListmonkConfig(config: RawListmonkConfig): ListmonkRuntimeConfig {
  const host = typeof config.host === 'string' ? config.host.trim().replace(/\/+$/, '') : ''
  const apiUsername = typeof config.apiUsername === 'string' ? config.apiUsername.trim() : ''
  const apiToken = typeof config.apiToken === 'string' ? config.apiToken.trim() : ''
  const listId = typeof config.listId === 'number' || typeof config.listId === 'string'
    ? Number(config.listId)
    : Number.NaN

  if (!host || !apiUsername || !apiToken || !Number.isInteger(listId) || listId < 1) {
    throw new Error('Listmonk host, API credentials, and a positive numeric list ID are required.')
  }

  return {
    host,
    listId,
    apiUsername,
    apiToken,
  }
}

export async function subscribeWithListmonk(
  subscriber: { email: string, name: string },
  config: ListmonkRuntimeConfig,
  fetchImplementation: typeof fetch = fetch,
): Promise<void> {
  const headers = {
    'Accept': 'application/json',
    'Authorization': `Basic ${Buffer.from(`${config.apiUsername}:${config.apiToken}`).toString('base64')}`,
    'Content-Type': 'application/json',
  }

  const createResponse = await fetchImplementation(`${config.host}/api/subscribers`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: subscriber.name,
      email: subscriber.email,
      status: 'enabled',
      lists: [config.listId],
      preconfirm_subscriptions: true,
    }),
  })

  if (createResponse.ok) {
    return
  }

  if (createResponse.status !== 409) {
    throw new ListmonkRequestError(createResponse.status)
  }

  const subscriberId = await findSubscriberIdByEmail(
    subscriber.email,
    config,
    headers,
    fetchImplementation,
  )

  const addToListResponse = await fetchImplementation(`${config.host}/api/subscribers/lists`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      ids: [subscriberId],
      action: 'add',
      target_list_ids: [config.listId],
      status: 'confirmed',
    }),
  })

  if (!addToListResponse.ok) {
    throw new ListmonkRequestError(addToListResponse.status)
  }
}

async function findSubscriberIdByEmail(
  email: string,
  config: ListmonkRuntimeConfig,
  headers: Record<string, string>,
  fetchImplementation: typeof fetch,
): Promise<number> {
  const singleQuote = '\''
  const escapedEmail = email.replaceAll(singleQuote, singleQuote.repeat(2))
  const params = new URLSearchParams({
    query: `subscribers.email = '${escapedEmail}'`,
    page: '1',
    per_page: '1',
  })
  const response = await fetchImplementation(`${config.host}/api/subscribers?${params}`, {
    method: 'GET',
    headers,
  })

  if (!response.ok) {
    throw new ListmonkRequestError(response.status)
  }

  const body = await response.json() as SubscribersResponse
  const subscriber = body.data?.results?.[0]

  if (!subscriber || !Number.isInteger(subscriber.id)) {
    throw new ListmonkRequestError(502)
  }

  return subscriber.id
}
