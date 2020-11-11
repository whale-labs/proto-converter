import { createSchemaTypingSource } from '../../schema'
import { testerFactory } from '../../../testUtils/compareContent'

const schemaConverterTester = testerFactory({
  path: __dirname,
  createSourceFunc: createSchemaTypingSource,
  outputFileName: 'output.d.ts',
  parser: 'typescript',
})

describe('build schema typing', () => {
  it(`enum`, async () => schemaConverterTester('enum_types'))
  it(`imported files`, async () => schemaConverterTester('imported_files'))
  it(`map fields`, async () => schemaConverterTester('map_fields'))
  it(`nested messages`, async () => schemaConverterTester('nested_messages'))
  it(`reference types`, async () => schemaConverterTester('reference_types'))
  it(`repeated fields`, async () => schemaConverterTester('repeated_fields'))
  it(`required types`, async () => schemaConverterTester('required_types'))
  it(`scalar types`, async () => schemaConverterTester('scalar_types'))
})
