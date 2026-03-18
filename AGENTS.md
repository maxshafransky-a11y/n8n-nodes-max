# Working Rules for n8n MAX Node

## Goals
- Build a verified-ready n8n community node package for the MAX Bot API.
- Keep the repository structured for incremental, test-first delivery.

## Non-negotiable Constraints
- Use TypeScript only.
- Keep runtime dependencies at zero.
- Use n8n built-in HTTP helpers only.
- Never send MAX tokens in query parameters.
- Never mutate incoming n8n items.
- Use NodeApiError and NodeOperationError for user-facing failures.
- Keep transport logic centralized.
- Add tests for every new helper or operation family.
- Run lint, typecheck, and tests after meaningful changes.

## Product Scope
- Max action node
- Max Trigger node
- Raw API support
- Upload and attachment flow
- Verified-ready documentation and release pipeline

## Security Rules
- Do not log tokens, webhook secrets, or raw binary payloads.
- Treat webhook secret as a node parameter, not a shared credential field.
- Prefer the official MAX API domain by default.
- Keep any custom base URL behind an advanced path in the UX.

## Delivery Rules
- Work in phases and keep each phase shippable.
- Preserve clean separation between credentials, transport, node descriptions, and execution logic.
- Update README if a public behavior changes.
