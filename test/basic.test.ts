import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('ssr', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
  })

  it('renders the index page', async () => {
    // Get response to a server-rendered page with `$fetch`.
    const html = await $fetch('/')
    expect(html).toContain('<div>basic</div>')
  })

  it('rejects an invalid subscriber e-mail before contacting Listmonk', async () => {
    await expect($fetch('/api/subscribe', {
      method: 'POST',
      body: { email: 'invalid-email' },
    })).rejects.toMatchObject({
      statusCode: 400,
    })
  })
})
