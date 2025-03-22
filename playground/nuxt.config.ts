export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },
  compatibilityDate: '2025-03-19',
  listmonk: {
    host: process.env.NUXT_LISTMONK_HOST,
    listId: process.env.NUXT_LISTMONK_LIST_ID,
  },
})
