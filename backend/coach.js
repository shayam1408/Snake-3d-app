const tips = {
  wall: 'Slow down near the edge and plan the turn one step earlier.',
  self: 'Leave more space between the head and the rest of the snake.',
  paused: 'Resume when you can give the next few moves your attention.',
  unknown: 'Play one more round and note the moment that felt hardest.'
}

export function buildLocalCoachTip(input = {}) {
  const score = Number.isInteger(input.score) && input.score >= 0
    ? Math.min(input.score, 100000)
    : 0
  const endedBy = Object.hasOwn(tips, input.endedBy) ? input.endedBy : 'unknown'

  return {
    tip: tips[endedBy],
    source: 'local-rule',
    needsReview: false,
    score
  }
}
