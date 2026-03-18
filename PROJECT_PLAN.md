# Plan

Build a verified-ready `n8n-nodes-max` package in small, testable phases. The repository is currently greenfield, so the first phase establishes a stable foundation before MAX-specific behavior is added.

## Scope

- In:
  - Package foundation
  - Credentials, transport, upload, errors
  - Max action node
  - Max Trigger node
  - Tests, docs, CI, release workflow
- Out:
  - Full MAX API UI coverage in the first phase
  - Runtime dependencies
  - Production release before verification checks pass

## Action Items

- [x] Validate the local toolchain and repository starting state.
- [x] Freeze the phased execution plan for a greenfield repository.
- [x] Scaffold the package foundation and package metadata.
- [x] Add Max API credentials and shared transport helpers.
- [x] Implement Message and Upload resources in the Max node.
- [x] Implement the Max Trigger webhook lifecycle and payload normalization.
- [x] Implement Raw API support for uncovered MAX endpoints.
- [x] Add unit and integration coverage for transport, message helpers, upload payloads, and trigger logic.
- [x] Complete README, examples, changelog, and verification checklist.
- [x] Wire CI, release automation, and local package scanning.
- [x] Replace placeholder package metadata with the real public repository and maintainer values.
- [x] Run smoke tests against a live MAX bot token and webhook endpoint.
- [ ] Run the published `@n8n/scan-community-package` check after the first npm release.

## Notes

- The official `npm create @n8n/node@latest` bootstrap failed in this environment, so the current foundation is being assembled manually to match n8n starter conventions.
- `git` is not available in the current shell, so release and git-tag steps can only be validated later.
- The project now has working credentials, transport, upload, error, action, and trigger layers with local lint/build/test coverage.
- `npm run scan` performs local package verification in this repository because the official published-package scanner only works after the package exists on npm.
- The current local Node.js version is `22.17.1`, which is below the latest n8n development-environment minimum published in the docs (`22.22.0`), but the local build and test commands still complete successfully in this workspace.

