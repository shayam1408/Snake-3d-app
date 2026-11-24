import { buildLocalCoachTip } from './coach.js'

const examples = [
  { score: 8, endedBy: 'wall' },
  { score: 14, endedBy: 'self' },
  { score: -4, endedBy: 'other' }
]

for (const example of examples) {
  console.log(buildLocalCoachTip(example))
}
