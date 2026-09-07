import { createError, defineEventHandler, readBody } from 'h3'
import { useRuntimeConfig } from '#imports'
import { useNitroApp } from 'nitropack/runtime'
import {
  ListmonkRequestError,
  normalizeListmonkConfig,
  subscribeWithListmonk,
} from '../utils/listmonk'
import type { ListmonkRuntimeConfig } from '../utils/listmonk'

export default defineEventHandler(async (event) => {
  const requestBody: unknown = await readBody(event)
  const body = requestBody && typeof requestBody === 'object' && !Array.isArray(requestBody)
    ? requestBody as Record<string, unknown>
    : { name: undefined, email: undefined }
  const { name, email } = body
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
  const subscriber = {
    email: normalizedEmail,
    name: name?.trim() ?? '',
  }

  try {
    listmonkConfig = normalizeListmonkConfig(useRuntimeConfig().listmonk)
  } catch (error) {
    console.error('`[nuxt-listmonk]` Invalid server configuration.', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Listmonk is not configured correctly.',
    })
  }

  await useNitroApp().hooks.callHook('listmonk:subscribe:before', {
    event,
    body,
    subscriber,
  })

  try {
    await subscribeWithListmonk(subscriber, listmonkConfig)
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
