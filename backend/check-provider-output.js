import { parseProviderTip } from './validate-provider-tip.js'

const cases = [
  {
    name: 'valid tip',
    raw: JSON.stringify({ tip: 'Turn before the head reaches the final open cell.' }),
    shouldPass: true
  },
  {
    name: 'plain paragraph',
    raw: 'Try turning earlier next time.',
    shouldPass: false
  },
  {
    name: 'missing tip',
    raw: JSON.stringify({ advice: 'Turn earlier.' }),
    shouldPass: false
  },
  {
    name: 'empty tip',
    raw: JSON.stringify({ tip: '   ' }),
    shouldPass: false
  }
]

for (const testCase of cases) {
  try {
    parseProviderTip(testCase.raw)
    console.log(testCase.name, testCase.shouldPass ? 'PASS' : 'UNEXPECTED PASS')
  } catch {
    console.log(testCase.name, testCase.shouldPass ? 'UNEXPECTED FAIL' : 'PASS')
  }
}
