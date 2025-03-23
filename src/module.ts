import { fileURLToPath } from 'node:url'
import { defineNuxtModule, createResolver, addComponent, addServerHandler, addImportsDir } from '@nuxt/kit'
import { defu } from 'defu'
import type { NuxtModule } from 'nuxt/schema'

export interface ModuleOptions {
  host: string
  listId: string
}

const module: NuxtModule<ModuleOptions> = defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-listmonk',
    configKey: 'listmonk',
    compatibility: {
      nuxt: '>=3.0.0',
    },
  },

  defaults: {
    host: '',
    listId: '',
  },

  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))

    nuxt.options.build.transpile.push(runtimeDir)

    nuxt.options.runtimeConfig.listmonk = defu<ModuleOptions, ModuleOptions[]>(
      nuxt.options.runtimeConfig.listmonk,
      {
        host: options.host,
        listId: options.listId,
      },
    )

    if (nuxt.options.runtimeConfig.listmonk.host === '') {
      console.warn('`[nuxt-listmonk]` Missing `host` value in module configuration')
    }

    addImportsDir(resolve(runtimeDir, 'composables'))

    addComponent({
      filePath: resolve(runtimeDir, 'components/ListmonkForm.vue'),
      name: 'ListmonkForm',
      global: true,
    })

    addServerHandler({
      route: '/api/subscribe',
      handler: resolve(runtimeDir, 'server/api/subscribe'),
    })
  },
})

export default module
