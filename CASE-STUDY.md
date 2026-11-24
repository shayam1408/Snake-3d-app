# Snake learning project

## Problem
Build a small browser game and use it to understand one complete path from
interface to server, persistence, optional AI, documentation, and review.

## What I built
- Browser Snake game with keyboard and touch controls
- Same-origin Express server and validated score API
- Local SQLite leaderboard with prepared statements
- Round-coach contract with local fallback and optional provider adapter
- Versioned prompt, output validator, and fixed failure cases

## Decisions
1. One origin before cross-origin complexity
2. Deterministic fallback before provider dependency
3. Local SQLite before hosted database operations
4. Human review for every generated suggestion

## How to inspect it
- Repository: local workspace (`first agentic app`)
- Commit: c98d1d605a0883d54676d97fea550fd1e8b1be28
- Run: `npm install && npm start`
- Checks: follow `RELEASE-CHECKLIST.md`

## Evidence
- Score API rejects invalid input and accepts a valid score
- Saved scores survive the documented restart test
- Provider failure returns a labelled local suggestion
- Phone, tablet, desktop, keyboard, themes, and 200% text were checked on the
  paths recorded in the release checklist

## Limits
- Learning project on one server, not a high-availability service
- No user accounts or identity verification
- Temporary tunnel used only for outside-device review
- Model output remains a draft for human review

## What I would improve next
- Observed gap: Client-reported scores trust browser input without server-side game tick verification or user session identity.
- Focused next project: Implement user authentication and server-authoritative move validation with automated Playwright end-to-end browser test suites.
