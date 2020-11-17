import SchemaConverter from './schemaConverter'
import {
  createFileWithSource,
  createFileName,
  ProtoInfo,
  LINE_FEED,
} from '../utils'

export const createSchemaSource = (protoInfo: ProtoInfo) => {
  const types = new SchemaConverter(protoInfo).getSchemas()
  return types.join(`${LINE_FEED}${LINE_FEED}`)
}

const buildSchema = (protoInfo: ProtoInfo) =>
  createFileWithSource({
    source: createSchemaSource(protoInfo),
    dir: protoInfo.config.outputPath,
    fileName: createFileName(protoInfo.config.serviceName, 'graphql'),
    options: {
      parser: 'graphql',
    },
  })

export default buildSchema
