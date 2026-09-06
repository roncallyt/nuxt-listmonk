import { createError, defineEventHandler, readBody } from 'h3'
import { useRuntimeConfig } from '#imports'
import {
  ListmonkRequestError,
  normalizeListmonkConfig,
  subscribeWithListmonk,
} from '../utils/listmonk'
import type { ListmonkRuntimeConfig } from '../utils/listmonk'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, email } = body && typeof body === 'object'
    ? body
    : { name: undefined, email: undefined }
  const normalizedEmail = typeof email === 'string' ? email.trim() : ''

  if (
    !normalizedEmail
    || normalizedEmail.length > 255
    || !/^[^\s@]+@[^\s@]+$/.test(normalizedEmail)
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing or invalid e-mail in the subscribe body.',
    })
  }

  if (name !== undefined && (typeof name !== 'string' || name.length > 255)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid name in the subscribe body.',
    })
  }

  let listmonkConfig: ListmonkRuntimeConfig

  try {
    listmonkConfig = normalizeListmonkConfig(useRuntimeConfig().listmonk)
  } catch (error) {
    console.error('`[nuxt-listmonk]` Invalid server configuration.', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Listmonk is not configured correctly.',
    })
  }

  try {
    await subscribeWithListmonk({
      email: normalizedEmail,
      name: name?.trim() ?? '',
    }, listmonkConfig)
  } catch (error) {
    const status = error instanceof ListmonkRequestError
      ? ` (upstream status: ${error.status})`
      : ''

    console.error(`\`[nuxt-listmonk]\` Subscription request failed${status}.`)

    throw createError({
      statusCode: 502,
      statusMessage: 'Listmonk could not process the subscription.',
    })
  }

  return {
    message: `E-mail '${normalizedEmail}' subscribed to the list.`,
  }
})
