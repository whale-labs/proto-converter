import {
  createFileWithSource,
  createFileName,
  ProtoInfo,
  LINE_FEED,
} from '../utils'
import { createSchemaSource } from './buildSchema'
import createGraphqlRequest from './buildRequest'

export const createSource = (protoInfo: ProtoInfo) => {
  const graphqlSource = createGraphqlRequest(protoInfo)
  const schemaSource = createSchemaSource(protoInfo)
  return [graphqlSource, schemaSource].join(`${LINE_FEED}${LINE_FEED}`)
}

export const buildGraphql = (protoInfo: ProtoInfo) => {
  const { config } = protoInfo
  createFileWithSource({
    source: createSource(protoInfo),
    dir: config.outputPath,
    fileName: createFileName(config.serviceName || 'index', 'graphql'),
    options: {
      parser: 'graphql',
    },
  })
}

export default buildGraphql
