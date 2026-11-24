import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DatabaseSync } from 'node:sqlite'

const backendDir = dirname(fileURLToPath(import.meta.url))
const dataDir = join(backendDir, 'data')
mkdirSync(dataDir, { recursive: true })

const db = new DatabaseSync(join(dataDir, 'scores.db'))

db.exec(`
  CREATE TABLE IF NOT EXISTS scores (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL CHECK(length(name) BETWEEN 1 AND 24),
    score INTEGER NOT NULL CHECK(score BETWEEN 0 AND 100000),
    created_at TEXT NOT NULL
  ) STRICT
`)

const insertScore = db.prepare(`
  INSERT INTO scores (id, name, score, created_at)
  VALUES (?, ?, ?, ?)
`)

const selectScores = db.prepare(`
  SELECT id, name, score, created_at AS createdAt
  FROM scores
  ORDER BY score DESC, created_at ASC
  LIMIT ?
`)

export function saveScore(record) {
  insertScore.run(record.id, record.name, record.score, record.createdAt)
  return record
}

export function listScores(limit = 10) {
  return selectScores.all(limit)
}
