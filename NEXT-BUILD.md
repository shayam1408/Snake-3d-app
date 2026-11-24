# Next build

## Gap I observed
I cannot yet build or explain secure multi-user authentication (password hashing, session tokens, and authorized data isolation) or automated end-to-end browser testing against a live server.

## Next project
A single-origin Habit Tracker with user sign-up, session-based authentication, user-scoped habit persistence, and automated Playwright browser tests.

## Four-week boundary
- Week 1: contract and smallest working path
  - Define auth and habit API contracts; build in-memory session sign-up/login and a single habit list.
- Week 2: failure states and persistence
  - Connect SQLite with user foreign keys, password hashing, session expiration, and 401/403/400 validation error handling.
- Week 3: interface, documentation, and tests
  - Build responsive mobile/desktop UI with loading, empty, and error states; add automated Playwright tests for auth and habit flows.
- Week 4: release review and case study
  - Conduct full release checklist (keyboard navigation, mobile width, slow networks), write architecture decision records, and publish the case study.

## Evidence I will produce
- Public repository: Git repository with atomic commits and clean git status
- Runnable path: `npm install && npm start` serving on a single local origin
- Checks: `npm test` running unit fixtures and Playwright headless browser checks
- Known-limit note: Plainly documented limits regarding single-server SQLite scope and absence of email recovery
