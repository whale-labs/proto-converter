import { createTypingSource } from 'src/typings'
import { testerFactory } from 'src/testUtils/compareContent'

const schemaConverterTester = testerFactory({
  path: __dirname,
  createSourceFunc: createTypingSource,
  outputFileName: 'output.d.ts',
  parser: 'typescript',
})

describe('build service typing', () => {
  it(`without params and response`, async () =>
    schemaConverterTester('without_params_response'))
  it(`multiple services`, async () =>
    schemaConverterTester('multiple_services'))
})
