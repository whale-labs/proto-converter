import createGraphqlRequest from '../../buildRequest'
import { testerFactory } from '../../../testUtils/compareContent'

const schemaConverterTester = testerFactory({
  path: __dirname,
  createSourceFunc: createGraphqlRequest,
})

describe('build graphql request', () => {
  it(`single service`, async () => schemaConverterTester('single_service'))
  it(`multiple services`, async () => schemaConverterTester('multiple_services'))
})
