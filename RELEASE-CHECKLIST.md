# Snake project release review

## Version
- Commit: c98d1d6
- Date: 2026-11-23
- Reviewer: Student & Antigravity Copilot

## Automated checks
- [x] Existing project tests pass (`npm test`: 4/4 fixtures PASS)
- [x] Local coach fixtures pass (`check-coach.js`: 3/3 PASS)
- [x] Provider output fixtures pass (`check-provider-output.js`: 6/6 fixtures PASS)
- [x] Invalid score input returns a clear 4xx response (`400 Bad Request`)
- [x] Restart test confirms saved scores persist (`backend/data/scores.db` SQLite)

## Core player path
- [x] Game opens with visible controls
- [x] Keyboard controls work and focus remains visible (`:focus-visible` with high-contrast ring)
- [x] Touch controls are large enough to use on a phone (D-pad touch buttons >= 48px target)
- [x] Round result is understandable without color alone (explicit text reason: wall, self, win)
- [x] Coach source is labelled provider or local rule (`Coach (provider)` vs `Coach (local rule)`)
- [x] Empty leaderboard explains how to add the first score
- [x] Failed save keeps the entered name and score for quick retry

## Responsive and reading checks
- [x] 390 px phone width has no horizontal page scroll (max-width flex/grid layout)
- [x] 768 px tablet width has no clipped controls
- [x] Desktop layout has one clear focal action (canvas center with controls stacked)
- [x] Browser text at 200% does not hide content or actions
- [x] Light and dark themes keep text and focus visible (Garden pastel & Cyber neon variables)

## Failure checks
- [x] Provider failure uses the local rule
- [x] API failure shows a useful message (`role="alert"`)
- [x] Repeated submit cannot create accidental duplicate actions (submit button disabled during in-flight request)
- [x] Slow request shows progress without moving the layout

## Known limits
- Local SQLite belongs to one server; not a distributed multi-region database
- No login, password, or player authentication system
- Quick Tunnel is temporary for inspection only
- Generated suggestions require human review (`needsReview: true`)

## Repairs
- Before: save failure cleared the player's name.
  After: the name remains and the error explains how to retry.
  Evidence: phone-failed-save.png and score form check.
- Before: Coach advice did not label whether the tip came from a model provider or the local rule fallback.
  After: Overlay explicitly labels `💡 Coach (provider): ...` or `💡 Coach (local rule): ...`.
  Evidence: `game.js` lines 1580-1583.
- Before: Empty leaderboard displayed "No scores recorded yet. Be the first!" without explaining how.
  After: Clarified to "No scores recorded yet. Play a round and save your score to set the first record!".
  Evidence: `game.js` line 1778.
