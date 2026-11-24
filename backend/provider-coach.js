import { buildRoundCoachPrompt } from './prompts/round-coach.js'
import { parseProviderTip } from './validate-provider-tip.js'

export async function buildProviderCoachTip(input, generateText) {
  if (typeof generateText !== 'function') {
    throw new TypeError('generateText must be a function')
  }

  const raw = await generateText(buildRoundCoachPrompt(input))
  const { tip } = parseProviderTip(raw)

  return {
    tip,
    source: 'provider',
    needsReview: true,
    score: input.score
  }
}
