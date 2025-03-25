# Nuxt Listmonk

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

> Listmonk module for [Nuxt.js](https://nuxt.com/)

- [Release Notes](https://github.com/roncallyt/nuxt-listmonk/releases)
- [Documentation](https://nuxt-listmonk.t7n.dev)
<!-- - [🏀 Online playground](https://stackblitz.com/github/your-org/nuxt-listmonk?file=playground%2Fapp.vue) -->

## Features

<!-- Highlight some of the features your module provide here -->
- Nuxt 3 ready
- Typescript support

## Quick Setup

1. Add `nuxt-listmonk` dependency to your project:

```bash
npx nuxi module add nuxt-listmonk
```

2. Add `nuxt-listmonk` to the `modules` section of `nuxt.config.ts`:

```js
export default defineNuxtConfig({
  modules: ['nuxt-listmonk'],
});
```
That's it! You can now use Listmonk in your Nuxt app ✨

## Contribution

<details>
  <summary>Local development</summary>
  
  ```bash
  # Install dependencies
  npm install
  
  # Generate type stubs
  npm run dev:prepare
  
  # Develop with the playground
  npm run dev
  
  # Build the playground
  npm run dev:build
  
  # Run ESLint
  npm run lint
  
  # Run Vitest
  npm run test
  npm run test:watch
  
  # Release new version
  npm run release
  ```

</details>

## Support

Hi, I am Thomerson Roncally, a Fullstack Developer that love to build things to help other developers. If you like my work and want to support me, you can donate here:

[![ko-fi](https://www.ko-fi.com/img/donate_sm.png)](https://ko-fi.com/roncallyt)

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/nuxt-listmonk/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/nuxt-listmonk

[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-listmonk.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/nuxt-listmonk

[license-src]: https://img.shields.io/npm/l/nuxt-listmonk.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/nuxt-listmonk

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com
