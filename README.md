# Snake learning project

A small browser game with a same-origin Express API, a SQLite score table,
and an optional AI round coach with a deterministic local fallback.

## Run locally

1. Install dependencies: `npm install`
2. Start the application: `npm start`
3. Open the local URL printed by the server.

Expected result: the game loads, scores can be saved and listed, and the
round coach returns either a provider draft or a labelled local suggestion.

## Check the project

```bash
npm test
node backend/check-coach.js
node backend/check-provider-coach.js
node backend/check-provider-output.js
```

## Optional model provider

The game works without a provider. To connect one, implement the server-only
adapter from Lesson 16 using the provider's current official documentation.
Keep credentials in environment variables and never commit `.env`.

## Project map

- `index.html`, `game.js`, `styles.css` - browser game
- `backend/server.js` - static files and same-origin API
- `backend/coach-service.js` - provider-or-fallback decision
- `backend/prompts/` - versioned model instructions
- `backend/db.js` - SQLite schema and prepared statements

## Known limits

- One-machine learning project, not a production service
- SQLite is local to the running server
- Quick Tunnel URLs are temporary test URLs
- Generated tips require human review
