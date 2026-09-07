import { createError } from 'h3'
import type { H3Event } from 'h3'
import { beforeEach, describe, expect, it, vi } from 'vitest'

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

  it('runs the blocking hook with the complete body and normalized subscriber', async () => {
    const body = {
      email: ' person@example.com ',
      name: ' Person ',
      recaptchaToken: 'captcha-token',
    }
    mocks.readBody.mockResolvedValue(body)

    await expect(subscribeHandler(event)).resolves.toEqual({
      message: 'E-mail \'person@example.com\' subscribed to the list.',
    })

    expect(mocks.callHook).toHaveBeenCalledWith('listmonk:subscribe:before', {
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
    expect(mocks.callHook.mock.invocationCallOrder[0])
      .toBeLessThan(mocks.subscribeWithListmonk.mock.invocationCallOrder[0]!)
  })

  it('preserves hook errors and prevents the Listmonk request', async () => {
    const error = createError({
      statusCode: 429,
      statusMessage: 'Too many subscription attempts.',
    })
    mocks.readBody.mockResolvedValue({ email: 'person@example.com' })
    mocks.callHook.mockRejectedValue(error)

    await expect(subscribeHandler(event)).rejects.toBe(error)
    expect(mocks.subscribeWithListmonk).not.toHaveBeenCalled()
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
