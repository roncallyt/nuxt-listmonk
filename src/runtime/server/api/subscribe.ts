import { createError, defineEventHandler, isError, readBody } from 'h3'
import { useRuntimeConfig } from '#imports'
import { useNitroApp } from 'nitropack/runtime'
import type { NitroApp } from 'nitropack/types'
import type {
  ListmonkAttributes,
  ListmonkJsonValue,
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

function normalizeJsonValue(value: unknown, ancestors: Set<object>): ListmonkJsonValue {
  if (
    value === null
    || typeof value === 'string'
    || typeof value === 'boolean'
  ) {
    return value
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value !== 'object') {
    throw new TypeError('Value is not JSON-safe.')
  }

  if (ancestors.has(value)) {
    throw new TypeError('Cyclic values are not JSON-safe.')
  }

  ancestors.add(value)

  try {
    if (Array.isArray(value)) {
      return value.map(item => normalizeJsonValue(item, ancestors))
    }

    const prototype = Object.getPrototypeOf(value)

    if (prototype !== Object.prototype && prototype !== null) {
      throw new TypeError('Value is not a plain JSON object.')
    }

    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        normalizeJsonValue(item, ancestors),
      ]),
    )
  } finally {
    ancestors.delete(value)
  }
}

function normalizeAttributes(value: unknown): ListmonkAttributes {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError('Attributes must be a plain JSON object.')
  }

  return normalizeJsonValue(value, new Set()) as ListmonkAttributes
}

export default defineEventHandler(async (event) => {
  const requestBody: unknown = await readBody(event)
  const body = requestBody && typeof requestBody === 'object' && !Array.isArray(requestBody)
    ? requestBody as Record<string, unknown>
    : { name: undefined, email: undefined }
  const { attribs, name, email } = body
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

  let normalizedAttribs: ListmonkAttributes | undefined

  if (attribs !== undefined) {
    try {
      normalizedAttribs = normalizeAttributes(attribs)
    } catch {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid attribs in the subscribe body.',
      })
    }
  }

  let listmonkConfig: ListmonkRuntimeConfig
  const subscriber = {
    email: normalizedEmail,
    name: name?.trim() ?? '',
    attribs: normalizedAttribs ?? {},
  }
  const submittedSubscriber = {
    email: subscriber.email,
    ...(name !== undefined ? { name: subscriber.name } : {}),
    ...(normalizedAttribs !== undefined ? { attribs: normalizedAttribs } : {}),
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
    await subscribeWithListmonk(submittedSubscriber, listmonkConfig)
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
