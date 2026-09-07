import { createError, defineEventHandler, isError, readBody } from 'h3'
import { useRuntimeConfig } from '#imports'
import { useNitroApp } from 'nitropack/runtime'
import type { NitroApp } from 'nitropack/types'
import type {
  ListmonkSubscribeAfterContext,
  ListmonkSubscribeErrorContext,
} from '../../../module'
import {
  ListmonkRequestError,
  normalizeListmonkConfig,
  subscribeWithListmonk,
} from '../utils/listmonk'
import type { ListmonkRuntimeConfig } from '../utils/listmonk'

async function callAfterHook(
  nitroApp: NitroApp,
  context: ListmonkSubscribeAfterContext,
) {
  try {
    await nitroApp.hooks.callHook('listmonk:subscribe:after', context)
  } catch {
    console.error('`[nuxt-listmonk]` The listmonk:subscribe:after hook failed.')
  }
}

async function callErrorHook(
  nitroApp: NitroApp,
  context: ListmonkSubscribeErrorContext,
) {
  try {
    await nitroApp.hooks.callHook('listmonk:subscribe:error', context)
  } catch {
    console.error('`[nuxt-listmonk]` The listmonk:subscribe:error hook failed.')
  }
}

function sanitizeError(error: unknown) {
  if (isError(error)) {
    return {
      statusCode: error.statusCode,
      statusMessage: error.statusMessage || 'Internal Server Error',
    }
  }

  return {
    statusCode: 500,
    statusMessage: 'Internal Server Error',
  }
}

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
  const nitroApp = useNitroApp()

  try {
    listmonkConfig = normalizeListmonkConfig(useRuntimeConfig().listmonk)
  } catch (error) {
    console.error('`[nuxt-listmonk]` Invalid server configuration.', error)

    const responseError = createError({
      statusCode: 500,
      statusMessage: 'Listmonk is not configured correctly.',
    })

    await callErrorHook(nitroApp, {
      event,
      subscriber,
      stage: 'configuration',
      error: sanitizeError(responseError),
    })

    throw responseError
  }

  try {
    await nitroApp.hooks.callHook('listmonk:subscribe:before', {
      event,
      body,
      subscriber,
    })
  } catch (error) {
    await callErrorHook(nitroApp, {
      event,
      subscriber,
      stage: 'before',
      error: sanitizeError(error),
    })

    throw error
  }

  try {
    await subscribeWithListmonk(subscriber, listmonkConfig)
  } catch (error) {
    const status = error instanceof ListmonkRequestError
      ? ` (upstream status: ${error.status})`
      : ''

    console.error(`\`[nuxt-listmonk]\` Subscription request failed${status}.`)

    const responseError = createError({
      statusCode: 502,
      statusMessage: 'Listmonk could not process the subscription.',
    })

    await callErrorHook(nitroApp, {
      event,
      subscriber,
      stage: 'listmonk',
      error: sanitizeError(responseError),
    })

    throw responseError
  }

  const response = {
    message: `E-mail '${normalizedEmail}' subscribed to the list.`,
  }

  await callAfterHook(nitroApp, {
    event,
    body,
    subscriber,
    response,
  })

  return response
})
