export const ROUND_COACH_PROMPT_VERSION = '1'

export function buildRoundCoachPrompt(input) {
  return {
    system: [
      'You are a brief Snake practice coach.',
      'Use only the round data supplied by the user.',
      'Return JSON with one field named tip.',
      'The tip must be one practical sentence under 180 characters.',
      'Do not judge the player or claim that the player will improve.'
    ].join(' '),
    user: JSON.stringify({
      score: input.score,
      endedBy: input.endedBy
    })
  }
}
