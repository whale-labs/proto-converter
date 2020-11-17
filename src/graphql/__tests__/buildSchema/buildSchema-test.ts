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
})
