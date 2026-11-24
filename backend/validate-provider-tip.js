export function parseProviderTip(raw) {
  if (typeof raw !== 'string') {
    throw new TypeError('Provider response must be text')
  }

  let value
  try {
    value = JSON.parse(raw)
  } catch {
    throw new Error('Provider response is not valid JSON')
  }

  const tip = typeof value.tip === 'string' ? value.tip.trim() : ''

  if (!tip || tip.length > 180) {
    throw new Error('Provider tip is missing or too long')
  }

  return { tip }
}
