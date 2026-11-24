# Round coach

## User goal
Receive one short practice suggestion after a Snake round.

## Input
- score: whole number from 0 to 100000
- endedBy: wall, self, paused, or unknown

## Output
- tip: one short sentence
- source: local-rule or provider
- needsReview: always true for a generated provider answer
- score: validated whole number from 0 to 100000

## Limits
- Does not judge the player
- Does not claim an improvement outcome
- Does not block the game when unavailable
- Never exposes a provider key in the browser
