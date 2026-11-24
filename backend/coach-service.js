import { buildLocalCoachTip } from './coach.js'
import { buildProviderCoachTip } from './provider-coach.js'

export async function getCoachTip(input, options = {}) {
  const { generateText } = options

  if (typeof generateText !== 'function') {
    return buildLocalCoachTip(input)
  }

  try {
    return await buildProviderCoachTip(input, generateText)
  } catch {
    return buildLocalCoachTip(input)
  }
}
