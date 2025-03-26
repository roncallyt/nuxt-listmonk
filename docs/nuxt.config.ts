export default defineNuxtConfig({
  // https://github.com/nuxt-themes/docus
  extends: ['@nuxt-themes/docus'],
  devtools: { enabled: true },

  modules: [// Remove it if you don't use Plausible analytics
  // https://github.com/nuxt-modules/plausible
  '@nuxtjs/plausible', '@nuxtjs/color-mode', '@vueuse/nuxt', '@nuxtjs/tailwindcss'],
  compatibilityDate: '2024-10-24',
  typescript: {
    tsConfig: {
      compilerOptions: {
        verbatimModuleSyntax: false,
      },
    },
  },
})