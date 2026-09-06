# Future abuse-protection extension

The authenticated Listmonk integration keeps credentials on the Nuxt server, but
the module's `/api/subscribe` route remains publicly callable. Applications are
responsible for abuse protection until a generic verification extension is added.

## Proposed direction

Add a server-side verification hook that runs after the request body is validated
and before any request is sent to Listmonk. The hook should receive the H3 event
and normalized subscriber body, and it should be able to reject the request by
throwing an H3 error.

The hook should enable consuming applications to integrate provider-specific
controls such as reCAPTCHA, Cloudflare Turnstile, rate limiting, honeypots, or
custom allow/deny rules. The core module should not bundle a captcha provider or
place provider secrets in client runtime configuration.

## Decisions needed before implementation

- Choose a Nuxt/Nitro registration mechanism that supports server-only functions
  without serializing them into runtime configuration.
- Decide whether verification-specific client fields are passed in the subscriber
  body, request headers, or an explicitly namespaced metadata object.
- Define whether multiple registered hooks run in order or stop after the first
  successful verifier.
- Define safe error normalization so verifier details and secrets never reach the
  browser.

## Acceptance goals

- Verification runs before Listmonk and can prevent every upstream request.
- Existing consumers require no changes when no hook is registered.
- The hook supports both captcha verification and non-captcha rate limiting.
- Tests prove rejection behavior, hook ordering, and server-only secret handling.
