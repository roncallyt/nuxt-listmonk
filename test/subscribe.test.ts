import { createError } from 'h3'
import type { H3Event } from 'h3'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  callHook: vi.fn(),
  normalizeListmonkConfig: vi.fn(),
  readBody: vi.fn(),
  subscribeWithListmonk: vi.fn(),
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

vi.mock('../src/runtime/server/utils/listmonk', async (importOriginal) => {
  const original = await importOriginal<typeof import('../src/runtime/server/utils/listmonk')>()

  return {
    ...original,
    normalizeListmonkConfig: mocks.normalizeListmonkConfig,
    subscribeWithListmonk: mocks.subscribeWithListmonk,
  }
})

const { default: subscribeHandler } = await import('../src/runtime/server/api/subscribe')
const { ListmonkRequestError } = await import('../src/runtime/server/utils/listmonk')

const event = {} as H3Event
const listmonkConfig = {
  host: 'https://listmonk.example.com',
  listId: 7,
  apiUsername: 'newsletter-api',
  apiToken: 'test-token',
}

describe('subscribe route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.callHook.mockResolvedValue(undefined)
    mocks.normalizeListmonkConfig.mockReturnValue(listmonkConfig)
    mocks.subscribeWithListmonk.mockResolvedValue(undefined)
    mocks.useRuntimeConfig.mockReturnValue({ listmonk: listmonkConfig })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('runs lifecycle hooks with the complete body and normalized subscriber', async () => {
    const body = {
      email: ' person@example.com ',
      name: ' Person ',
      recaptchaToken: 'captcha-token',
    }
    const response = {
      message: 'E-mail \'person@example.com\' subscribed to the list.',
    }
    mocks.readBody.mockResolvedValue(body)

    await expect(subscribeHandler(event)).resolves.toEqual(response)

    expect(mocks.callHook).toHaveBeenNthCalledWith(1, 'listmonk:subscribe:before', {
      event,
      body,
      subscriber: {
        email: 'person@example.com',
        name: 'Person',
      },
    })
    expect(mocks.subscribeWithListmonk).toHaveBeenCalledWith({
      email: 'person@example.com',
      name: 'Person',
    }, listmonkConfig)
    expect(mocks.callHook).toHaveBeenNthCalledWith(2, 'listmonk:subscribe:after', {
      event,
      body,
      subscriber: {
        email: 'person@example.com',
        name: 'Person',
      },
      response,
    })
    expect(mocks.callHook.mock.invocationCallOrder[0]!)
      .toBeLessThan(mocks.subscribeWithListmonk.mock.invocationCallOrder[0]!)
    expect(mocks.subscribeWithListmonk.mock.invocationCallOrder[0]!)
      .toBeLessThan(mocks.callHook.mock.invocationCallOrder[1]!)
  })

  it('reports and preserves blocking hook errors without contacting Listmonk', async () => {
    const error = createError({
      statusCode: 429,
      statusMessage: 'Too many subscription attempts.',
    })
    mocks.readBody.mockResolvedValue({ email: 'person@example.com' })
    mocks.callHook.mockImplementation(async (name) => {
      if (name === 'listmonk:subscribe:before') {
        throw error
      }
    })

    await expect(subscribeHandler(event)).rejects.toBe(error)
    expect(mocks.subscribeWithListmonk).not.toHaveBeenCalled()
    expect(mocks.callHook).toHaveBeenNthCalledWith(2, 'listmonk:subscribe:error', {
      event,
      subscriber: {
        email: 'person@example.com',
        name: '',
      },
      stage: 'before',
      error: {
        statusCode: 429,
        statusMessage: 'Too many subscription attempts.',
      },
    })
  })

  it('sanitizes generic guard errors and preserves them when the error observer fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const error = new Error('Verifier leaked captcha-token')
    mocks.readBody.mockResolvedValue({
      email: 'person@example.com',
      recaptchaToken: 'captcha-token',
    })
    mocks.callHook.mockImplementation(async (name) => {
      if (name === 'listmonk:subscribe:before') {
        throw error
      }

      throw new Error('Monitoring failed')
    })

    await expect(subscribeHandler(event)).rejects.toBe(error)
    expect(mocks.callHook).toHaveBeenNthCalledWith(2, 'listmonk:subscribe:error', {
      event,
      subscriber: {
        email: 'person@example.com',
        name: '',
      },
      stage: 'before',
      error: {
        statusCode: 500,
        statusMessage: 'Internal Server Error',
      },
    })
    expect(mocks.callHook.mock.calls[1]?.[1]).not.toHaveProperty('body')
    expect(consoleError).toHaveBeenCalledWith(
      '`[nuxt-listmonk]` The listmonk:subscribe:error hook failed.',
    )
  })

  it('reports sanitized configuration failures after validation', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    mocks.readBody.mockResolvedValue({
      email: 'person@example.com',
      recaptchaToken: 'captcha-token',
    })
    mocks.normalizeListmonkConfig.mockImplementation(() => {
      throw new Error('Invalid configuration')
    })

    await expect(subscribeHandler(event)).rejects.toMatchObject({
      statusCode: 500,
      statusMessage: 'Listmonk is not configured correctly.',
    })
    expect(mocks.callHook).toHaveBeenCalledOnce()
    expect(mocks.callHook).toHaveBeenCalledWith('listmonk:subscribe:error', {
      event,
      subscriber: {
        email: 'person@example.com',
        name: '',
      },
      stage: 'configuration',
      error: {
        statusCode: 500,
        statusMessage: 'Listmonk is not configured correctly.',
      },
    })
    expect(mocks.subscribeWithListmonk).not.toHaveBeenCalled()
  })

  it('reports sanitized Listmonk failures', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    mocks.readBody.mockResolvedValue({ email: 'person@example.com' })
    mocks.subscribeWithListmonk.mockRejectedValue(new ListmonkRequestError(503))

    await expect(subscribeHandler(event)).rejects.toMatchObject({
      statusCode: 502,
      statusMessage: 'Listmonk could not process the subscription.',
    })
    expect(mocks.callHook).toHaveBeenNthCalledWith(2, 'listmonk:subscribe:error', {
      event,
      subscriber: {
        email: 'person@example.com',
        name: '',
      },
      stage: 'listmonk',
      error: {
        statusCode: 502,
        statusMessage: 'Listmonk could not process the subscription.',
      },
    })
  })

  it('awaits after hooks and suppresses their failures', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    let rejectAfter!: (error: Error) => void
    const afterHook = new Promise<void>((_resolve, reject) => {
      rejectAfter = reject
    })
    mocks.readBody.mockResolvedValue({ email: 'person@example.com' })
    mocks.callHook.mockImplementation((name) => {
      return name === 'listmonk:subscribe:after'
        ? afterHook
        : Promise.resolve()
    })

    let settled = false
    const subscription = subscribeHandler(event).finally(() => {
      settled = true
    })

    await vi.waitFor(() => {
      expect(mocks.callHook).toHaveBeenCalledTimes(2)
    })
    expect(settled).toBe(false)

    rejectAfter(new Error('Analytics failed'))

    await expect(subscription).resolves.toEqual({
      message: 'E-mail \'person@example.com\' subscribed to the list.',
    })
    expect(mocks.callHook.mock.calls.map(([name]) => name)).toEqual([
      'listmonk:subscribe:before',
      'listmonk:subscribe:after',
    ])
    expect(consoleError).toHaveBeenCalledWith(
      '`[nuxt-listmonk]` The listmonk:subscribe:after hook failed.',
    )
  })

  it('does not run hooks for an invalid subscriber', async () => {
    mocks.readBody.mockResolvedValue({
      email: 'invalid-email',
      recaptchaToken: 'captcha-token',
    })

    await expect(subscribeHandler(event)).rejects.toMatchObject({
      statusCode: 400,
    })
    expect(mocks.callHook).not.toHaveBeenCalled()
    expect(mocks.subscribeWithListmonk).not.toHaveBeenCalled()
  })
})
