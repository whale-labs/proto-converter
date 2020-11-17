import { createSource } from '../index'
import { testerFactory } from 'src/testUtils/compareContent'

const schemaConverterTester = testerFactory({
  path: __dirname,
  createSourceFunc: ({ services }) => createSource(services!),
  outputFileName: 'output.js',
  parser: 'typescript',
  serviceName: 'nestjs',
})

describe('create nestjs module', () => {
  it(`nestjs module`, async () => schemaConverterTester('nestjs_module'))
})
