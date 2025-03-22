import { createError, defineEventHandler, readBody } from 'h3'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const { name, email } = await readBody(event)

  if (!email) {
    console.error('`[nuxt-listmonk]` Missing `e-mail` in the subscribe body.')

    return
  }

  const listmonkConfig = useRuntimeConfig().listmonk

  const form = new FormData()

  form.append('name', name)
  form.append('email', email)
  form.append('l', listmonkConfig.listId)

  const result = await fetch(
    `${listmonkConfig.host}/subscription/form`,
    {
      body: form,
      method: 'POST',
    },
  )

  if (result.status !== 200) {
    throw createError({
      statusCode: result.status,
      statusMessage: result.statusText,
    })
  }

  return {
    message: `E-mail '${email}' subscribed to the list.`,
  }
})
