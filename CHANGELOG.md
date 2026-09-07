# Changelog

## v3.1.0

[compare changes](https://github.com/roncallyt/nuxt-listmonk/compare/v3.0.1...v3.1.0)

### 🚀 Enhancements

- Allow custom subscribe payload fields ([9b8f647](https://github.com/roncallyt/nuxt-listmonk/commit/9b8f647))
- Add blocking subscription guard hook ([56b3b5a](https://github.com/roncallyt/nuxt-listmonk/commit/56b3b5a))
- Add subscription observer hooks ([ed0d6b0](https://github.com/roncallyt/nuxt-listmonk/commit/ed0d6b0))

### 📖 Documentation

- Document subscription lifecycle hooks ([a798308](https://github.com/roncallyt/nuxt-listmonk/commit/a798308))

### ❤️ Contributors

- Thomerson Roncally Araújo Teixeira ([@roncallyt](https://github.com/roncallyt))

## v3.0.1

[compare changes](https://github.com/roncallyt/nuxt-listmonk/compare/v3.0.0...v3.0.1)

### 📖 Documentation

- Remove unnecessary documentation ([ffd3ddf](https://github.com/roncallyt/nuxt-listmonk/commit/ffd3ddf))

### ❤️ Contributors

- Thomerson Roncally Araújo Teixeira ([@roncallyt](https://github.com/roncallyt))

## v3.0.0

[compare changes](https://github.com/roncallyt/nuxt-listmonk/compare/v2.0.0...v3.0.0)

### 🚀 Enhancements

- ⚠️ Replace public form subscriptions with the authenticated Listmonk subscriber API ([#5](https://github.com/roncallyt/nuxt-listmonk/pull/5))
- Preserve existing subscriber list memberships when adding the configured list ([#5](https://github.com/roncallyt/nuxt-listmonk/pull/5))

#### ⚠️ Breaking Changes

- `listId` must now contain the numeric Listmonk API list ID instead of a public list UUID.
- `apiUsername` and `apiToken` are now required.
- `useSubscribe()` now rejects on failures, and `ListmonkForm` emits `error` without clearing its values.

### ❤️ Contributors

- Thomerson Roncally Araújo Teixeira ([@roncallyt](https://github.com/roncallyt))

## v2.0.0

[compare changes](https://github.com/roncallyt/nuxt-listmonk/compare/v1.2.3...v2.0.0)

### 🚀 Enhancements

- ⚠️ Modernize Nuxt support and deployment ([7335480](https://github.com/roncallyt/nuxt-listmonk/commit/7335480))

#### ⚠️ Breaking Changes

- ⚠️ Modernize Nuxt support and deployment ([7335480](https://github.com/roncallyt/nuxt-listmonk/commit/7335480))

### ❤️ Contributors

- Thomerson Roncally Araújo Teixeira ([@roncallyt](https://github.com/roncallyt))

## v1.2.3

[compare changes](https://github.com/roncallyt/nuxt-listmonk/compare/v1.2.2...v1.2.3)

### 🏡 Chore

- Update docs npm packages ([b26b6c4](https://github.com/roncallyt/nuxt-listmonk/commit/b26b6c4))

### ❤️ Contributors

- Thomerson Roncally Araújo Teixeira ([@roncallyt](https://github.com/roncallyt))

## v1.2.2

[compare changes](https://github.com/roncallyt/nuxt-listmonk/compare/v1.2.1...v1.2.2)

### 🏡 Chore

- Update npm packages ([ae0747c](https://github.com/roncallyt/nuxt-listmonk/commit/ae0747c))

### ❤️ Contributors

- Thomerson Roncally Araújo Teixeira ([@roncallyt](https://github.com/roncallyt))

## v1.2.1

[compare changes](https://github.com/roncallyt/nuxt-listmonk/compare/v1.2.0...v1.2.1)

### 📖 Documentation

- Add documentation about new event on form component ([022593e](https://github.com/roncallyt/nuxt-listmonk/commit/022593e))

### ❤️ Contributors

- Thomerson Roncally Araújo Teixeira ([@roncallyt](https://github.com/roncallyt))

## v1.2.0

[compare changes](https://github.com/roncallyt/nuxt-listmonk/compare/v1.1.4...v1.2.0)

### 🚀 Enhancements

- Add clear method to form component ([06f8a8b](https://github.com/roncallyt/nuxt-listmonk/commit/06f8a8b))

### ❤️ Contributors

- Thomerson Roncally Araújo Teixeira ([@roncallyt](https://github.com/roncallyt))

## v1.1.4

[compare changes](https://github.com/roncallyt/nuxt-listmonk/compare/v1.1.3...v1.1.4)

### 🩹 Fixes

- Fix imports on form component ([2b346d1](https://github.com/roncallyt/nuxt-listmonk/commit/2b346d1))

### ❤️ Contributors

- Thomerson Roncally Araújo Teixeira ([@roncallyt](https://github.com/roncallyt))

## v1.1.3

[compare changes](https://github.com/roncallyt/nuxt-listmonk/compare/v1.1.2...v1.1.3)

### 🩹 Fixes

- Fix imports on button component ([51c56f1](https://github.com/roncallyt/nuxt-listmonk/commit/51c56f1))

### ❤️ Contributors

- Thomerson Roncally Araújo Teixeira ([@roncallyt](https://github.com/roncallyt))

## v1.1.2

[compare changes](https://github.com/roncallyt/nuxt-listmonk/compare/v1.1.1...v1.1.2)

### 🩹 Fixes

- Fix imports on input component ([972c7bf](https://github.com/roncallyt/nuxt-listmonk/commit/972c7bf))

### ❤️ Contributors

- Thomerson Roncally Araújo Teixeira ([@roncallyt](https://github.com/roncallyt))

## v1.1.1

[compare changes](https://github.com/roncallyt/nuxt-listmonk/compare/v1.1.0...v1.1.1)

### 🩹 Fixes

- Fix imports in form component and a SSR problem in button component ([8524682](https://github.com/roncallyt/nuxt-listmonk/commit/8524682))

### ❤️ Contributors

- Thomerson Roncally Araújo Teixeira ([@roncallyt](https://github.com/roncallyt))

## v1.1.0

[compare changes](https://github.com/roncallyt/nuxt-listmonk/compare/v1.0.5...v1.1.0)

### 🚀 Enhancements

- Add possibility to use Slot in ListmonkButton component ([4970577](https://github.com/roncallyt/nuxt-listmonk/commit/4970577))

### 📖 Documentation

- Add documentation about ListmonkButton slot ([5c9a8f6](https://github.com/roncallyt/nuxt-listmonk/commit/5c9a8f6))

### ❤️ Contributors

- Thomerson Roncally Araújo Teixeira ([@roncallyt](https://github.com/roncallyt))

## v1.0.5

[compare changes](https://github.com/roncallyt/nuxt-listmonk/compare/v1.0.4...v1.0.5)

### 📖 Documentation

- Add component documentation ([505c5c6](https://github.com/roncallyt/nuxt-listmonk/commit/505c5c6))

### ❤️ Contributors

- Thomerson Roncally Araújo Teixeira ([@roncallyt](https://github.com/roncallyt))

## v1.0.4

[compare changes](https://github.com/roncallyt/nuxt-listmonk/compare/v1.0.3...v1.0.4)

### 📖 Documentation

- Add License ([a3ac8e5](https://github.com/roncallyt/nuxt-listmonk/commit/a3ac8e5))

### ❤️ Contributors

- Thomerson Roncally Araújo Teixeira ([@roncallyt](https://github.com/roncallyt))

## v1.0.3

[compare changes](https://github.com/roncallyt/nuxt-listmonk/compare/v1.0.1...v1.0.3)

### 🩹 Fixes

- Fix not found server route error on install module ([a8f75f9](https://github.com/roncallyt/nuxt-listmonk/commit/a8f75f9))

### 📖 Documentation

- Update README ([094a089](https://github.com/roncallyt/nuxt-listmonk/commit/094a089))
- Add documentation ([d664c42](https://github.com/roncallyt/nuxt-listmonk/commit/d664c42))

### 🏡 Chore

- **release:** V1.0.2 ([7bae6cb](https://github.com/roncallyt/nuxt-listmonk/commit/7bae6cb))

### 🎨 Styles

- Fix lint problems ([5aabbc2](https://github.com/roncallyt/nuxt-listmonk/commit/5aabbc2))

### ❤️ Contributors

- Thomerson Roncally Araújo Teixeira ([@roncallyt](https://github.com/roncallyt))

## v1.0.2

[compare changes](https://github.com/roncallyt/nuxt-listmonk/compare/v1.0.1...v1.0.2)

### 🩹 Fixes

- Fix not found server route error on install module ([13250a0](https://github.com/roncallyt/nuxt-listmonk/commit/13250a0))

### ❤️ Contributors

- Thomerson Roncally Araújo Teixeira ([@roncallyt](https://github.com/roncallyt))

## v1.0.1

### 📖 Documentation

- Update README ([6d91fb7](https://github.com/roncallyt/nuxt-listmonk/commit/6d91fb7))

### ❤️ Contributors

- Thomerson Roncally Araújo Teixeira ([@roncallyt](https://github.com/roncallyt))
