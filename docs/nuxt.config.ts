export default defineNuxtConfig({
  extends: ['docus'],
  site: {
    name: 'Nuxt Listmonk',
    url: 'https://nuxt-listmonk.t7n.dev',
  },
  workspaceDir: import.meta.dirname,
  compatibilityDate: '2026-08-28',
  nitro: {
    output: {
      publicDir: 'dist',
    },
    prerender: {
      routes: [
        '/introduction/getting-started',
        '/components/listmonkform',
        '/components/listmonkinputgroup',
        '/components/listmonkinput',
        '/components/listmonkbutton',
        '/api/composables',
      ],
    },
  },
  llms: {
    domain: 'https://nuxt-listmonk.t7n.dev',
    title: 'Nuxt Listmonk',
    description: 'Listmonk integration for Nuxt applications.',
  },
})
