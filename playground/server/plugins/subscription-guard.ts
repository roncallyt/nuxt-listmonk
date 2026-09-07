export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('listmonk:subscribe:before', ({ body }) => {
    if (body.website) {
      throw createError({ statusCode: 400 })
    }
  })
})
