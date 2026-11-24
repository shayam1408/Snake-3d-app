import express from 'express'
import { randomUUID } from 'node:crypto'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildLocalCoachTip } from './coach.js'
import { listScores, saveScore } from './db.js'

const app = express()
const port = Number(process.env.PORT) || 3000
const host = '127.0.0.1'
const backendDir = dirname(fileURLToPath(import.meta.url))
const appDir = resolve(backendDir, '..')

function parseScore(body = {}) {
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const score = body.score

  if (name.length < 1 || name.length > 24) {
    return { error: 'name must contain 1 to 24 characters' }
  }

  if (!Number.isInteger(score) || score < 0 || score > 100000) {
    return { error: 'score must be a whole number from 0 to 100000' }
  }

  return { value: { name, score } }
}

app.use(express.json({ limit: '8kb' }))

app.get('/api/health', (_request, response) => {
  response.json({ ok: true, service: 'snake-server' })
})

app.post('/api/coach', (request, response) => {
  response.json(buildLocalCoachTip(request.body))
})

app.get('/api/scores', (_request, response) => {
  response.json({ scores: listScores(10) })
})

app.post('/api/scores', (request, response) => {
  const parsed = parseScore(request.body)
  if (parsed.error) return response.status(400).json({ error: parsed.error })

  const record = saveScore({
    id: randomUUID(),
    ...parsed.value,
    createdAt: new Date().toISOString()
  })

  return response.status(201).json({ score: record })
})

app.use(express.static(appDir))

app.listen(port, host, () => {
  console.log(`Snake server: http://${host}:${port}`)
})
