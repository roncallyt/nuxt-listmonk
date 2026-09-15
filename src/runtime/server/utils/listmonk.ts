import { Buffer } from 'node:buffer'
import type {
  ListmonkAttributes,
  ListmonkExistingSubscriberMode,
} from '../../../module'

export interface ListmonkRuntimeConfig {
  host: string
  listId: number
  apiUsername: string
  apiToken: string
  existingSubscriberMode: ListmonkExistingSubscriberMode
}

interface RawListmonkConfig {
  host?: unknown
  listId?: unknown
  apiUsername?: unknown
  apiToken?: unknown
  existingSubscriberMode?: unknown
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
  const existingSubscriberMode = config.existingSubscriberMode ?? 'preserve'

  if (
    !host
    || !apiUsername
    || !apiToken
    || !Number.isInteger(listId)
    || listId < 1
    || (existingSubscriberMode !== 'preserve' && existingSubscriberMode !== 'merge')
  ) {
    throw new Error(
      'Listmonk host, API credentials, a positive numeric list ID, and a valid existing subscriber mode are required.',
    )
  }

  return {
    host,
    listId,
    apiUsername,
    apiToken,
    existingSubscriberMode,
  }
}

export async function subscribeWithListmonk(
  subscriber: { email: string, name?: string, attribs?: ListmonkAttributes },
  config: ListmonkRuntimeConfig,
  fetchImplementation: typeof fetch = fetch,
): Promise<void> {
  const headers = {
    'Accept': 'application/json',
    'Authorization': `Basic ${Buffer.from(`${config.apiUsername}:${config.apiToken}`).toString('base64')}`,
    'Content-Type': 'application/json',
  }

  const createBody = {
    name: subscriber.name ?? '',
    email: subscriber.email,
    status: 'enabled',
    lists: [config.listId],
    preconfirm_subscriptions: true,
    ...(subscriber.attribs !== undefined ? { attribs: subscriber.attribs } : {}),
  }
  const createResponse = await fetchImplementation(`${config.host}/api/subscribers`, {
    method: 'POST',
    headers,
    body: JSON.stringify(createBody),
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

  if (config.existingSubscriberMode !== 'merge') {
    return
  }

  const patchBody = {
    ...(subscriber.name !== undefined ? { name: subscriber.name } : {}),
    ...(subscriber.attribs !== undefined ? { attribs: subscriber.attribs } : {}),
  }

  if (Object.keys(patchBody).length === 0) {
    return
  }

  const patchResponse = await fetchImplementation(
    `${config.host}/api/subscribers/${subscriberId}`,
    {
      method: 'PATCH',
      headers,
      body: JSON.stringify(patchBody),
    },
  )

  if (!patchResponse.ok) {
    throw new ListmonkRequestError(patchResponse.status)
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
