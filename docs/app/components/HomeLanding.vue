<template>
  <div class="landing">
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">
          Listmonk integration for Nuxt
        </p>
        <h1>Newsletter subscriptions without a UI lock-in.</h1>
        <p class="description">
          Connect Nuxt to Listmonk with a server endpoint, a composable, and unstyled components that fit your design system.
        </p>

        <ul class="features">
          <li>
            <UIcon name="i-lucide-check" />
            Nuxt 3.21 and Nuxt 4 support
          </li>
          <li>
            <UIcon name="i-lucide-check" />
            TypeScript-ready module API
          </li>
          <li>
            <UIcon name="i-lucide-check" />
            Unstyled, configurable components
          </li>
          <li>
            <UIcon name="i-lucide-check" />
            Direct composable access
          </li>
        </ul>

        <div class="actions">
          <UButton
            to="/introduction/getting-started"
            size="xl"
            trailing-icon="i-lucide-arrow-right"
            label="Get started"
          />
          <UButton
            to="https://github.com/roncallyt/nuxt-listmonk"
            target="_blank"
            size="xl"
            color="neutral"
            variant="ghost"
            trailing-icon="i-lucide-external-link"
            label="View on GitHub"
          />
        </div>
      </div>

      <div
        class="terminal"
        aria-label="Installation command"
      >
        <div class="terminal-header">
          <span />
          <span />
          <span />
        </div>
        <div class="terminal-body">
          <span class="prompt">$</span>
          <code>npx nuxi module add nuxt-listmonk</code>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.landing {
  overflow: hidden;
  border-bottom: 1px solid var(--ui-border);
  background:
    radial-gradient(circle at 80% 10%, color-mix(in srgb, var(--ui-primary) 16%, transparent), transparent 32rem),
    linear-gradient(to bottom, color-mix(in srgb, var(--ui-bg-elevated) 35%, transparent), transparent);
}

.hero {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(22rem, 0.9fr);
  gap: clamp(3rem, 8vw, 7rem);
  align-items: center;
  width: min(100% - 3rem, 78rem);
  min-height: 42rem;
  margin-inline: auto;
  padding-block: clamp(5rem, 10vw, 8rem);
}

.eyebrow {
  margin: 0 0 1.25rem;
  color: var(--ui-primary);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

h1 {
  max-width: 12ch;
  margin: 0;
  color: var(--ui-text-highlighted);
  font-size: clamp(3rem, 6vw, 5.5rem);
  font-weight: 750;
  letter-spacing: -0.06em;
  line-height: 0.98;
}

.description {
  max-width: 42rem;
  margin: 1.75rem 0 0;
  color: var(--ui-text-muted);
  font-size: clamp(1.05rem, 1.5vw, 1.2rem);
  line-height: 1.7;
}

.features {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.8rem 1.25rem;
  margin: 2rem 0 0;
  padding: 0;
  list-style: none;
}

.features li {
  display: flex;
  gap: 0.6rem;
  align-items: center;
  color: var(--ui-text);
  font-size: 0.925rem;
}

.features .iconify {
  flex: 0 0 auto;
  color: var(--ui-primary);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 2.4rem;
}

.terminal {
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--ui-border) 82%, var(--ui-primary) 18%);
  border-radius: 1rem;
  background: color-mix(in srgb, var(--ui-bg-elevated) 94%, transparent);
  box-shadow: 0 2rem 6rem rgb(0 0 0 / 0.18);
}

.terminal-header {
  display: flex;
  gap: 0.45rem;
  padding: 1rem;
  border-bottom: 1px solid var(--ui-border);
}

.terminal-header span {
  width: 0.7rem;
  height: 0.7rem;
  border-radius: 9999px;
  background: var(--ui-border-accented);
}

.terminal-body {
  display: flex;
  gap: 0.75rem;
  padding: 2rem;
  color: var(--ui-text-highlighted);
  font-family: var(--font-mono);
  font-size: clamp(0.85rem, 1.4vw, 1rem);
}

.prompt {
  color: var(--ui-primary);
}

@media (max-width: 900px) {
  .hero {
    grid-template-columns: 1fr;
    min-height: auto;
  }
}

@media (max-width: 560px) {
  .features {
    grid-template-columns: 1fr;
  }

  .terminal-body {
    overflow-x: auto;
  }
}
</style>
