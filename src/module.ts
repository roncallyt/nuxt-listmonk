import { fileURLToPath } from 'node:url'
import { defineNuxtModule, createResolver, addServerHandler, addImportsDir, addComponentsDir, addTypeTemplate } from '@nuxt/kit'
import { defu } from 'defu'
import type { H3Event } from 'h3'
import type { NuxtModule } from 'nuxt/schema'

export type ListmonkJsonPrimitive = string | number | boolean | null

export type ListmonkJsonValue
  = ListmonkJsonPrimitive
    | ListmonkJsonValue[]
    | ListmonkAttributes

export interface ListmonkAttributes {
  [key: string]: ListmonkJsonValue
}

export type ListmonkExistingSubscriberMode = 'preserve' | 'merge'

export interface ListmonkSubscriber {
  email: string
  name?: string
  attribs?: ListmonkAttributes
}

export interface ListmonkSubscribeContext {
  event: H3Event
  body: Readonly<Record<string, unknown>>
  subscriber: Readonly<{
    email: string
    name: string
    attribs: Readonly<ListmonkAttributes>
  }>
}

export interface ListmonkSubscribeAfterContext extends ListmonkSubscribeContext {
  response: Readonly<{
    message: string
  }>
}

export type ListmonkSubscribeErrorStage = 'before' | 'configuration' | 'listmonk'

export interface ListmonkSubscribeErrorContext {
  event: H3Event
  subscriber: Readonly<{
    email: string
    name: string
    attribs: Readonly<ListmonkAttributes>
  }>
  stage: ListmonkSubscribeErrorStage
  error: Readonly<{
    statusCode: number
    statusMessage: string
  }>
}

declare module 'nitropack' {
  interface NitroRuntimeHooks {
    'listmonk:subscribe:before': (
      context: ListmonkSubscribeContext,
    ) => void | Promise<void>
    'listmonk:subscribe:after': (
      context: ListmonkSubscribeAfterContext,
    ) => void | Promise<void>
    'listmonk:subscribe:error': (
      context: ListmonkSubscribeErrorContext,
    ) => void | Promise<void>
  }
}

export interface ModuleOptions {
  host: string
  listId: string | number
  apiUsername: string
  apiToken: string
  existingSubscriberMode?: ListmonkExistingSubscriberMode
}

const module: NuxtModule<ModuleOptions> = defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-listmonk',
    configKey: 'listmonk',
    compatibility: {
      nuxt: '^3.21.0 || ^4.0.0',
    },
  },

  defaults: {
    host: '',
    listId: '',
    apiUsername: '',
    apiToken: '',
    existingSubscriberMode: 'preserve',
  },

  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))

    nuxt.options.build.transpile.push(runtimeDir)

    nuxt.options.runtimeConfig.listmonk = defu(
      nuxt.options.runtimeConfig.listmonk,
      {
        host: options.host,
        listId: String(options.listId),
        apiUsername: options.apiUsername,
        apiToken: options.apiToken,
        existingSubscriberMode: options.existingSubscriberMode ?? 'preserve',
      },
    )

    if (nuxt.options.runtimeConfig.listmonk.host === '') {
      console.warn('`[nuxt-listmonk]` Missing `host` value in module configuration')
    }

    addImportsDir(resolve(runtimeDir, 'composables'))

    addComponentsDir({
      global: true,
      path: resolve(runtimeDir, 'components'),
    })

    addTypeTemplate({
      filename: 'types/nuxt-listmonk.d.ts',
      getContents: () => `import 'nuxt-listmonk'\n\nexport {}`,
    }, {
      nitro: true,
      nuxt: true,
    })

    addServerHandler({
      route: '/api/subscribe',
      handler: resolve(runtimeDir, 'server/api/subscribe'),
    })
  },
})

export default module
