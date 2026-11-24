import { getCoachTip } from './coach-service.js'

const input = { score: 12, endedBy: 'wall' }

const fakeGenerator = async ({ system, user }) => {
  console.log('Prompt sent to model:', { system, user })
  return JSON.stringify({ tip: 'Turn a little earlier when the snake approaches an edge.' })
}

console.log('--- 1. Provider Path ---')
console.log(await getCoachTip(input, { generateText: fakeGenerator }))

console.log('\n--- 2. Fallback Path (Simulated Outage) ---')
console.log(await getCoachTip(input, {
  generateText: async () => { throw new Error('simulated outage') }
}))

console.log('\n--- 3. Fallback Path (Unparseable Non-JSON from Model) ---')
console.log(await getCoachTip(input, {
  generateText: async () => 'Not valid JSON output'
}))

console.log('\n--- 4. Fallback Path (Empty Tip from Model) ---')
console.log(await getCoachTip(input, {
  generateText: async () => JSON.stringify({ tip: '   ' })
}))

console.log('\n--- 5. Fallback Path (Overly Long Output > 180 chars) ---')
console.log(await getCoachTip(input, {
  generateText: async () => JSON.stringify({ tip: 'A'.repeat(250) })
}))
