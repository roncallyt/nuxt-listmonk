// https://github.com/nuxt-themes/docus/blob/main/nuxt.schema.ts
export default defineAppConfig({
  docus: {
    title: 'Nuxt Listmonk',
    description: 'Listmonk module for Nuxt.js',
    image: 'https://user-images.githubusercontent.com/904724/185365452-87b7ca7b-6030-4813-a2db-5e65c785bf88.png',
    socials: {
      twitter: 't7ndotdev',
      github: 'roncallyt/nuxt-listmonk',
      nuxt: {
        label: 'Nuxt',
        icon: 'simple-icons:nuxtdotjs',
        href: 'https://nuxt.com',
      },
    },
    github: {
      branch: 'main',
      repo: 'nuxt-listmonk',
      owner: 'roncallyt',
      edit: true,
    },
    aside: {
      level: 0,
      collapsed: false,
      exclude: [],
    },
    main: {
      padded: true,
      fluid: true,
    },
    header: {
      logo: true,
      showLinkIcon: true,
      exclude: ['search'],
      fluid: true,
    },
  },
})
