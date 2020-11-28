import { createSchemaSource } from 'src/graphql/buildSchema'
import { testerFactory } from 'src/testUtils/compareContent'

const schemaConverterTester = testerFactory({
  path: __dirname,
  createSourceFunc: createSchemaSource,
})

describe('build schema', () => {
  it(`enum`, async () => schemaConverterTester('enum_types'))
  it(`imported files`, async () => schemaConverterTester('imported_files'))
  it(`input types`, async () => schemaConverterTester('input_types'))
  it(`map fields`, async () => schemaConverterTester('map_fields'))
  it(`nested messages`, async () => schemaConverterTester('nested_messages'))
  it(`reference types`, async () => schemaConverterTester('reference_types'))
  it(`repeated fields`, async () => schemaConverterTester('repeated_fields'))
  it(`scalar types`, async () => schemaConverterTester('scalar_types'))
  it(`circular reference`, async () => schemaConverterTester('circular_reference'))
  it(`empty types`, async () => schemaConverterTester('empty_types'))
})


const nsTester = testerFactory({
  path: __dirname,
  createSourceFunc: createSchemaSource,
  serviceName: 'test',
  outputFileName: 'output_namespace.graphql'
})

describe('build schema with namespace', () => {
  it(`circular reference`, async () => nsTester('circular_reference'))
  it(`nested messages`, async () => nsTester('nested_messages'))
  it(`map fields`, async () => nsTester('map_fields'))
})
